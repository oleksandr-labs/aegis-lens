import type { RawPayload } from "./adapter";

/**
 * Deduplication key: (source_id, external_id, content_hash).
 * A payload is a duplicate if we've already processed the exact same key.
 * content_hash catches edits to the same external_id.
 */
export interface DedupStore {
  /**
   * Returns true if this payload is new (not seen before).
   * Marks it as seen atomically.
   */
  isNew(payload: RawPayload): Promise<boolean>;

  /**
   * Explicit mark without the newness check (e.g. during backfill replay).
   */
  markSeen(payload: RawPayload): Promise<void>;
}

/**
 * Dedup key as a stable string for storage.
 */
export function dedupKey(p: RawPayload): string {
  return `${p.source_id}:${p.external_id}:${p.content_hash}`;
}

/**
 * In-memory dedup store — suitable for tests and single-process deployments.
 * For production, replace with a Redis SET or DynamoDB item check.
 */
export class InMemoryDedupStore implements DedupStore {
  private readonly seen = new Set<string>();

  async isNew(payload: RawPayload): Promise<boolean> {
    const key = dedupKey(payload);
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    return true;
  }

  async markSeen(payload: RawPayload): Promise<void> {
    this.seen.add(dedupKey(payload));
  }

  get size(): number {
    return this.seen.size;
  }
}

/**
 * Redis-backed dedup store.
 * Requires an ioredis-compatible client.
 * SET NX with a long TTL; TTL should be at least 30 days.
 */
export class RedisDedupStore implements DedupStore {
  private static readonly TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

  constructor(
    private readonly redis: {
      set(key: string, value: string, exMode: "EX", ttl: number, mode: "NX"): Promise<"OK" | null>;
    },
    private readonly keyPrefix = "dedup:",
  ) {}

  async isNew(payload: RawPayload): Promise<boolean> {
    const key = this.keyPrefix + dedupKey(payload);
    const result = await this.redis.set(key, "1", "EX", RedisDedupStore.TTL_SECONDS, "NX");
    return result === "OK";
  }

  async markSeen(payload: RawPayload): Promise<void> {
    await this.isNew(payload);
  }
}
