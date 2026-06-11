import type { SourceAdapter, NormaliseResult } from "./adapter";
import type { DedupStore } from "./dedup";
import type { RawArchive } from "./archive";

export interface EventEmitter {
  emit(topic: string, event: NormaliseResult["event"]): Promise<void>;
}

export interface IngestMetrics {
  increment(metric: string, tags?: Record<string, string>): void;
  timing(metric: string, ms: number, tags?: Record<string, string>): void;
}

export interface IngestPipelineOptions {
  adapter: SourceAdapter;
  dedup: DedupStore;
  archive: RawArchive;
  emitter: EventEmitter;
  metrics: IngestMetrics;
  /** Kafka / NATS topic to publish normalised events */
  outputTopic?: string;
}

/**
 * One pipeline per source adapter.
 * Pull loop: fetch → dedup → archive → normalise → emit.
 */
export class IngestPipeline {
  private cursor: string | undefined;
  private running = false;

  constructor(private readonly opts: IngestPipelineOptions) {}

  async run(): Promise<void> {
    this.running = true;
    const { adapter, dedup, archive, emitter, metrics } = this.opts;
    const topic = this.opts.outputTopic ?? "events.normalized";

    try {
      for await (const raw of adapter.fetchSince(this.cursor)) {
        if (!this.running) break;

        const start = Date.now();
        try {
          // 1. Dedup
          const isNew = await dedup.isNew(raw);
          if (!isNew) {
            metrics.increment("ingest.dedup.duplicate", { source: adapter.source_id });
            continue;
          }

          // 2. Archive (must happen before any processing)
          await archive.put(raw);
          metrics.increment("ingest.archive.stored", { source: adapter.source_id });

          // 3. Normalise
          const result = adapter.normalise(raw);

          // 4. Emit
          await emitter.emit(topic, result.event);
          metrics.increment("ingest.emit.ok", { source: adapter.source_id });

          // Update cursor
          this.cursor = raw.external_id;
        } catch (err) {
          metrics.increment("ingest.error", { source: adapter.source_id });
          // Continue processing remaining items; failed item stays un-deduped
          // so it will be retried on next run (DLQ pattern handled upstream).
          console.error(`[ingest][${adapter.source_id}] item failed`, err);
        } finally {
          metrics.timing("ingest.item_ms", Date.now() - start, { source: adapter.source_id });
        }
      }
    } catch (err) {
      metrics.increment("ingest.fetch_error", { source: adapter.source_id });
      throw err;
    } finally {
      this.running = false;
    }
  }

  stop(): void {
    this.running = false;
  }
}
