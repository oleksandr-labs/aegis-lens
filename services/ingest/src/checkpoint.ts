/**
 * Persists per-source ingest cursors so the service can resume after restart.
 */
export interface CheckpointStore {
  get(sourceId: string): Promise<string | undefined>;
  set(sourceId: string, cursor: string): Promise<void>;
}

/**
 * In-memory implementation for tests.
 */
export class InMemoryCheckpointStore implements CheckpointStore {
  private readonly data = new Map<string, string>();

  async get(sourceId: string): Promise<string | undefined> {
    return this.data.get(sourceId);
  }

  async set(sourceId: string, cursor: string): Promise<void> {
    this.data.set(sourceId, cursor);
  }
}

/**
 * Redis-backed checkpoint store.
 * Key: `checkpoint:{sourceId}` → cursor string.
 */
export class RedisCheckpointStore implements CheckpointStore {
  constructor(
    private readonly redis: {
      get(key: string): Promise<string | null>;
      set(key: string, value: string): Promise<void>;
    },
    private readonly prefix = "checkpoint:",
  ) {}

  async get(sourceId: string): Promise<string | undefined> {
    const val = await this.redis.get(this.prefix + sourceId);
    return val ?? undefined;
  }

  async set(sourceId: string, cursor: string): Promise<void> {
    await this.redis.set(this.prefix + sourceId, cursor);
  }
}
