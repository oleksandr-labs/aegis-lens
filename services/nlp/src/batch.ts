/**
 * Batch reprocessing path — the cheap, throughput-oriented counterpart to the
 * low-latency `NLPPipeline` (pipeline.ts).
 *
 * Use cases: nightly re-embedding after a model upgrade, back-filling new
 * enrichment stages over historical events, periodic re-classification when the
 * taxonomy changes. Optimised for cost (concurrency cap, batching, checkpointing)
 * rather than latency.
 *
 * This is a worker contract: it accepts an async record source, runs the existing
 * `NLPPipeline.process()` per record with bounded concurrency, supports resume via
 * a checkpoint cursor, and emits per-batch progress so a cron/worker can drive it.
 * No new inference logic — it reuses the same pipeline the streaming path uses.
 */

import type { NLPPipeline, NLPInput, NLPOutput } from "./pipeline";

export interface BatchRecord extends NLPInput {
  /** Stable record id (event id) — also the checkpoint cursor key. */
  id: string;
}

export interface BatchResult {
  id: string;
  output?: NLPOutput;
  error?: string;
}

export interface BatchProgress {
  processed: number;
  total?: number;
  succeeded: number;
  failed: number;
  /** Last processed record id — persist this as the resume checkpoint. */
  lastId?: string;
  elapsedMs: number;
}

export interface BatchOptions {
  /** Max records processed in parallel (cost / rate-limit guard). Default 4. */
  concurrency?: number;
  /** Records per progress callback flush. Default 50. */
  batchSize?: number;
  /** Resume: skip records until (and including) this id is seen. */
  resumeAfterId?: string;
  /** Progress callback fired once per completed batch. */
  onProgress?: (p: BatchProgress) => void | Promise<void>;
  /** Sink for completed results (e.g. upsert into Postgres / Qdrant). */
  onResult?: (r: BatchResult) => void | Promise<void>;
}

/**
 * An async source of records to reprocess. Implementations stream from the event
 * DB in id order so the resume cursor is monotonic.
 */
export type BatchSource = AsyncIterable<BatchRecord>;

/** Run `fn` over `items` with at most `limit` in flight at once. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Batch NLP worker. Drives the shared `NLPPipeline` over a record source with
 * bounded concurrency, checkpointing, and progress reporting.
 */
export class BatchProcessor {
  constructor(private readonly pipeline: NLPPipeline) {}

  /** Process an in-memory array (convenience wrapper over `run`). */
  async runArray(records: BatchRecord[], opts: BatchOptions = {}): Promise<BatchProgress> {
    return this.run(arrayToAsync(records), opts, records.length);
  }

  /**
   * Process a streamed source. Returns the final progress snapshot.
   * Each record's pipeline failure is isolated (captured in `BatchResult.error`),
   * so one bad record never aborts the nightly run.
   */
  async run(source: BatchSource, opts: BatchOptions = {}, total?: number): Promise<BatchProgress> {
    const concurrency = opts.concurrency ?? 4;
    const batchSize = opts.batchSize ?? 50;
    const startedAt = Date.now();

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let lastId: string | undefined;
    let resuming = Boolean(opts.resumeAfterId);

    let buffer: BatchRecord[] = [];

    const flush = async () => {
      if (buffer.length === 0) return;
      const batch = buffer;
      buffer = [];

      const results = await mapWithConcurrency(batch, concurrency, async (rec) => {
        try {
          const output = await this.pipeline.process(rec);
          return { id: rec.id, output } as BatchResult;
        } catch (err) {
          return { id: rec.id, error: err instanceof Error ? err.message : String(err) } as BatchResult;
        }
      });

      for (const r of results) {
        processed++;
        if (r.error) failed++;
        else succeeded++;
        lastId = r.id;
        if (opts.onResult) await opts.onResult(r);
      }

      if (opts.onProgress) {
        await opts.onProgress({ processed, total, succeeded, failed, lastId, elapsedMs: Date.now() - startedAt });
      }
    };

    for await (const rec of source) {
      // Resume: skip records up to and including the checkpoint id.
      if (resuming) {
        if (rec.id === opts.resumeAfterId) resuming = false;
        continue;
      }
      buffer.push(rec);
      if (buffer.length >= batchSize) await flush();
    }
    await flush();

    return { processed, total, succeeded, failed, lastId, elapsedMs: Date.now() - startedAt };
  }
}

async function* arrayToAsync<T>(items: T[]): AsyncIterable<T> {
  for (const item of items) yield item;
}
