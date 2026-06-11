import type { CanonicalEvent } from "@ua-map/schema";

/**
 * Raw payload exactly as received from the source, before any normalisation.
 */
export interface RawPayload {
  source_id: string;
  /** Opaque ID assigned by the source system */
  external_id: string;
  fetched_at: string; // ISO-8601
  payload: unknown;
  /** SHA-256 of JSON.stringify(payload) */
  content_hash: string;
}

/**
 * Normalisation result from an adapter.
 */
export interface NormaliseResult {
  raw: RawPayload;
  /**
   * Partially-filled canonical event ready for enrichment.
   * At minimum: event_id, ingested_at, sources, verification_state, schema_version.
   */
  event: Partial<CanonicalEvent> & Pick<CanonicalEvent, "event_id" | "ingested_at" | "sources" | "verification_state" | "schema_version">;
}

/**
 * All source adapters implement this interface.
 */
export interface SourceAdapter {
  readonly source_id: string;
  readonly display_name: string;

  /**
   * Fetch new items since the last cursor.
   * Returns items newest-first. Pass `cursor = undefined` to start from now.
   */
  fetchSince(cursor: string | undefined): AsyncGenerator<RawPayload>;

  /**
   * Normalise a raw payload into a partial canonical event.
   * Must be pure / synchronous where possible.
   */
  normalise(raw: RawPayload): NormaliseResult;

  /**
   * Return the current health status of the source.
   */
  healthCheck(): Promise<SourceHealth>;
}

export interface SourceHealth {
  source_id: string;
  healthy: boolean;
  latency_ms?: number;
  last_item_at?: string;
  error?: string;
}

/**
 * Registry that maps source_id → adapter instance.
 */
export class AdapterRegistry {
  private readonly adapters = new Map<string, SourceAdapter>();

  register(adapter: SourceAdapter): void {
    if (this.adapters.has(adapter.source_id)) {
      throw new Error(`Adapter already registered: ${adapter.source_id}`);
    }
    this.adapters.set(adapter.source_id, adapter);
  }

  get(sourceId: string): SourceAdapter {
    const a = this.adapters.get(sourceId);
    if (!a) throw new Error(`Unknown adapter: ${sourceId}`);
    return a;
  }

  all(): SourceAdapter[] {
    return [...this.adapters.values()];
  }
}
