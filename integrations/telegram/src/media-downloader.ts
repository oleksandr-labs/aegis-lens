/**
 * Media downloader for Telegram attachments, with size + MIME + AV discipline.
 *
 * Telegram channels carry images/video/documents that feed CV (`@ua-map/vision`)
 * and archival. Untrusted OSINT media is a real attack surface, so every
 * download passes a gate:
 *   1. declared `file_size` vs `maxBytes` (pre-flight, before any fetch),
 *   2. actual byte count vs `maxBytes` (streaming guard — declared size lies),
 *   3. MIME allow-list (sniffed magic bytes, not just the declared mime),
 *   4. AV scan via an injected `AvScanner` hook (ClamAV/VirusTotal seam),
 * and anything that fails is QUARANTINED (never handed downstream).
 *
 * This module performs NO re-hosting decisions — it produces a vetted local
 * artifact reference; republication is gated elsewhere per `COMPLIANCE.md`.
 */

import type { TelegramBotApiClient } from "./bot-api-client";

export type MediaKind = "photo" | "video" | "document" | "audio";

export interface MediaRef {
  /** Telegram file_id (Bot API) or message-relative id (MTProto). */
  fileId: string;
  kind: MediaKind;
  /** MIME the source declared (untrusted). */
  declaredMime?: string;
  /** Size the source declared (untrusted — verified against actual bytes). */
  declaredSize?: number;
  fileName?: string;
}

export interface MediaPolicy {
  /** Hard byte ceiling. Default 20 MiB (Bot API getFile ceiling anyway). */
  maxBytes: number;
  /** Allowed sniffed MIME types. Anything else is quarantined. */
  allowMime: string[];
  /** If false, AV failures quarantine; if true (default) they hard-fail loud. */
  failClosed?: boolean;
}

export const DEFAULT_MEDIA_POLICY: MediaPolicy = {
  maxBytes: 20 * 1024 * 1024,
  allowMime: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "application/pdf",
  ],
  failClosed: true,
};

export type AvVerdict = "clean" | "infected" | "error";

export interface AvScanResult {
  verdict: AvVerdict;
  /** Signature/engine detail when infected or errored. */
  detail?: string;
  engine: string;
}

/** AV-scan seam. Inject ClamAV (clamd), a VirusTotal client, or a sandbox. */
export interface AvScanner {
  scan(bytes: Uint8Array, ctx: { fileName?: string; mime: string }): Promise<AvScanResult>;
}

/** Default scanner: no engine wired → returns "error" so failClosed quarantines. */
export class NoopAvScanner implements AvScanner {
  async scan(): Promise<AvScanResult> {
    return { verdict: "error", engine: "noop", detail: "no AV engine configured" };
  }
}

export type RejectReason =
  | "declared_too_large"
  | "actual_too_large"
  | "mime_not_allowed"
  | "download_failed"
  | "av_infected"
  | "av_error";

export interface DownloadOk {
  ok: true;
  fileId: string;
  bytes: Uint8Array;
  sniffedMime: string;
  size: number;
  sourceUrl: string;
  av: AvScanResult;
}

export interface DownloadQuarantined {
  ok: false;
  fileId: string;
  reason: RejectReason;
  detail?: string;
  /** Bytes withheld; only metadata is forwarded for the quarantine record. */
  size?: number;
  av?: AvScanResult;
}

export type DownloadResult = DownloadOk | DownloadQuarantined;

/** Sniff MIME from leading magic bytes. Conservative; unknown → "". */
export function sniffMime(bytes: Uint8Array): string {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (b.length >= 12 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return "video/mp4";
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video/webm";
  if (b.length >= 5 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  return "";
}

export class MediaDownloader {
  private readonly policy: MediaPolicy;
  private readonly scanner: AvScanner;

  constructor(
    private readonly api: Pick<TelegramBotApiClient, "getFileUrl">,
    opts: { policy?: Partial<MediaPolicy>; scanner?: AvScanner } = {},
  ) {
    this.policy = { ...DEFAULT_MEDIA_POLICY, ...opts.policy };
    this.scanner = opts.scanner ?? new NoopAvScanner();
  }

  async download(ref: MediaRef): Promise<DownloadResult> {
    // 1. Pre-flight on declared size — reject before spending bandwidth.
    if (ref.declaredSize !== undefined && ref.declaredSize > this.policy.maxBytes) {
      return { ok: false, fileId: ref.fileId, reason: "declared_too_large", size: ref.declaredSize };
    }

    const url = await this.api.getFileUrl(ref.fileId).catch(() => null);
    if (!url) return { ok: false, fileId: ref.fileId, reason: "download_failed" };

    const res = await fetch(url).catch(() => null);
    if (!res || !res.ok || !res.body) {
      return { ok: false, fileId: ref.fileId, reason: "download_failed", detail: res ? `http_${res.status}` : "no_response" };
    }

    // 2. Stream with a hard byte ceiling — declared size cannot be trusted.
    const bytes = await this.readCapped(res.body, this.policy.maxBytes);
    if (bytes === null) {
      return { ok: false, fileId: ref.fileId, reason: "actual_too_large", size: this.policy.maxBytes };
    }

    // 3. Sniffed MIME allow-list (ignore the declared mime).
    const sniffed = sniffMime(bytes);
    if (!sniffed || !this.policy.allowMime.includes(sniffed)) {
      return { ok: false, fileId: ref.fileId, reason: "mime_not_allowed", size: bytes.length, detail: sniffed || "unknown" };
    }

    // 4. AV scan — quarantine on infection; honour failClosed for engine errors.
    const av = await this.scanner.scan(bytes, { fileName: ref.fileName, mime: sniffed }).catch(
      (): AvScanResult => ({ verdict: "error", engine: "unknown", detail: "scanner threw" }),
    );
    if (av.verdict === "infected") {
      return { ok: false, fileId: ref.fileId, reason: "av_infected", size: bytes.length, av, detail: av.detail };
    }
    if (av.verdict === "error" && (this.policy.failClosed ?? true)) {
      return { ok: false, fileId: ref.fileId, reason: "av_error", size: bytes.length, av, detail: av.detail };
    }

    return { ok: true, fileId: ref.fileId, bytes, sniffedMime: sniffed, size: bytes.length, sourceUrl: url, av };
  }

  /** Read a stream, returning null the moment it exceeds `cap` bytes. */
  private async readCapped(
    body: ReadableStream<Uint8Array>,
    cap: number,
  ): Promise<Uint8Array | null> {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        total += value.length;
        if (total > cap) {
          await reader.cancel().catch(() => {});
          return null;
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }
}
