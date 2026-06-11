import type { RawPayload } from "./adapter";

/**
 * Immutable raw-payload archive.
 * Every raw payload must be archived BEFORE processing.
 * The archive is write-once; existing keys are never overwritten.
 */
export interface RawArchive {
  /**
   * Persist a raw payload. Returns the storage path / object key.
   * Idempotent: writing the same key twice is safe (no-op or overwrite is fine
   * since payload is keyed by content hash).
   */
  put(payload: RawPayload): Promise<string>;

  /**
   * Retrieve a raw payload by its dedup key string.
   * Returns undefined if not found.
   */
  get(key: string): Promise<RawPayload | undefined>;
}

/**
 * S3-compatible archive (AWS S3, Cloudflare R2, MinIO).
 * Object key: `raw/{source_id}/{YYYY}/{MM}/{DD}/{content_hash}.json`
 */
export class S3RawArchive implements RawArchive {
  constructor(
    private readonly s3: {
      putObject(params: { Bucket: string; Key: string; Body: string; ContentType: string }): Promise<void>;
      getObject(params: { Bucket: string; Key: string }): Promise<{ Body: string } | undefined>;
    },
    private readonly bucket: string,
  ) {}

  private objectKey(payload: RawPayload): string {
    const d = new Date(payload.fetched_at);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `raw/${payload.source_id}/${yyyy}/${mm}/${dd}/${payload.content_hash}.json`;
  }

  async put(payload: RawPayload): Promise<string> {
    const key = this.objectKey(payload);
    await this.s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(payload),
      ContentType: "application/json",
    });
    return key;
  }

  async get(key: string): Promise<RawPayload | undefined> {
    const result = await this.s3.getObject({ Bucket: this.bucket, Key: key });
    if (!result) return undefined;
    return JSON.parse(result.Body) as RawPayload;
  }
}

/**
 * In-memory archive for tests.
 */
export class InMemoryRawArchive implements RawArchive {
  private readonly store = new Map<string, RawPayload>();

  async put(payload: RawPayload): Promise<string> {
    const key = `${payload.source_id}/${payload.content_hash}`;
    this.store.set(key, payload);
    return key;
  }

  async get(key: string): Promise<RawPayload | undefined> {
    return this.store.get(key);
  }
}
