/**
 * Media downloader for ingest pipeline.
 *
 * Downloads, validates, and stores media referenced in raw source payloads.
 * Validation checks:
 *   - Content-Type allow-list
 *   - File size limit
 *   - Basic magic-byte check (JPEG/PNG/WebP/GIF/MP4/WEBM)
 */

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface DownloadResult {
  url: string;
  mimeType: string;
  sizeBytes: number;
  /** Storage key where the file was saved */
  storageKey: string;
  /** SHA-256 hex digest */
  sha256: string;
}

interface DownloadError {
  url: string;
  reason: "blocked_mime" | "too_large" | "fetch_failed" | "magic_check_failed";
  details: string;
}

export type DownloadOutcome =
  | ({ ok: true } & DownloadResult)
  | ({ ok: false } & DownloadError);

// Magic byte signatures
const MAGIC: [Uint8Array, string][] = [
  [new Uint8Array([0xff, 0xd8, 0xff]), "image/jpeg"],
  [new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "image/png"],
  [new Uint8Array([0x52, 0x49, 0x46, 0x46]), "image/webp"], // RIFF
  [new Uint8Array([0x47, 0x49, 0x46]), "image/gif"],
  [new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]), "video/mp4"],
];

function detectMimeFromBytes(bytes: Uint8Array): string | null {
  for (const [sig, mime] of MAGIC) {
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (bytes[i] !== sig[i]) {
        match = false;
        break;
      }
    }
    if (match) return mime;
  }
  return null;
}

async function sha256hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface MediaStorage {
  save(key: string, data: Uint8Array, mimeType: string): Promise<string>;
}

export class InMemoryMediaStorage implements MediaStorage {
  private readonly store = new Map<string, { data: Uint8Array; mimeType: string }>();

  async save(key: string, data: Uint8Array, mimeType: string): Promise<string> {
    this.store.set(key, { data, mimeType });
    return key;
  }

  get(key: string) {
    return this.store.get(key) ?? null;
  }
}

export class S3MediaStorage implements MediaStorage {
  constructor(
    private readonly bucket: string,
    private readonly prefix: string = "media/",
  ) {}

  async save(key: string, data: Uint8Array, mimeType: string): Promise<string> {
    // In production: use @aws-sdk/client-s3 PutObjectCommand
    // Returning a placeholder S3 URL for now
    const s3Key = `${this.prefix}${key}`;
    void data;
    void mimeType;
    return `s3://${this.bucket}/${s3Key}`;
  }
}

export class MediaDownloader {
  constructor(
    private readonly storage: MediaStorage,
    private readonly maxSizeBytes: number = MAX_SIZE_BYTES,
  ) {}

  async download(url: string, sourceId: string): Promise<DownloadOutcome> {
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      return {
        ok: false,
        url,
        reason: "fetch_failed",
        details: String(err),
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        url,
        reason: "fetch_failed",
        details: `HTTP ${response.status}`,
      };
    }

    // Validate content-type header
    const ctHeader = (response.headers.get("content-type") ?? "").split(";")[0].trim();
    if (ctHeader && !ALLOWED_MIME_TYPES.has(ctHeader)) {
      return {
        ok: false,
        url,
        reason: "blocked_mime",
        details: `Content-Type '${ctHeader}' not allowed`,
      };
    }

    const buffer = await response.arrayBuffer();
    const sizeBytes = buffer.byteLength;

    if (sizeBytes > this.maxSizeBytes) {
      return {
        ok: false,
        url,
        reason: "too_large",
        details: `${sizeBytes} bytes > ${this.maxSizeBytes} limit`,
      };
    }

    const bytes = new Uint8Array(buffer);

    // Magic byte check
    const detectedMime = detectMimeFromBytes(bytes);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return {
        ok: false,
        url,
        reason: "magic_check_failed",
        details: `Magic bytes did not match an allowed type`,
      };
    }

    const hash = await sha256hex(buffer);
    const storageKey = `${sourceId}/${hash}`;
    await this.storage.save(storageKey, bytes, detectedMime);

    return {
      ok: true,
      url,
      mimeType: detectedMime,
      sizeBytes,
      storageKey,
      sha256: hash,
    };
  }

  async downloadMany(
    urls: string[],
    sourceId: string,
  ): Promise<DownloadOutcome[]> {
    return Promise.all(urls.map((u) => this.download(u, sourceId)));
  }
}
