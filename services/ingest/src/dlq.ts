/**
 * Dead Letter Queue + Replay tooling for the Ingest service.
 *
 * Failed events land in the DLQ with full context.
 * Operators can inspect, discard, or replay them.
 *
 * Production: back by Kafka dead-letter topic + pg table for UI.
 */

export type DLQReason =
  | "adapter_error"
  | "dedup_collision"
  | "schema_validation"
  | "media_download_failed"
  | "archive_failed"
  | "pii_redaction_failed"
  | "downstream_error"
  | "rate_limited"
  | "timeout";

export interface DLQEntry {
  dlqId: string;
  reason: DLQReason;
  /** Original source ID */
  sourceId: string;
  /** Source-side external ID */
  externalId?: string;
  /** ISO-8601 */
  failedAt: string;
  /** Number of previous delivery attempts */
  attempts: number;
  /** Raw payload that failed */
  payload: unknown;
  /** Error message */
  error: string;
  /** Stack trace if available */
  stack?: string;
  /** ISO-8601 — set when replayed successfully */
  replayedAt?: string;
  /** ISO-8601 — set when operator discards */
  discardedAt?: string;
  discardReason?: string;
}

export type DLQStatus = "pending" | "replaying" | "replayed" | "discarded";

const _dlq = new Map<string, DLQEntry & { status: DLQStatus }>();
let _seq = 0;

export function enqueueDLQ(params: Omit<DLQEntry, "dlqId" | "failedAt" | "attempts"> & { attempts?: number }): DLQEntry {
  const dlqId = `dlq-${++_seq}-${Date.now()}`;
  const entry: DLQEntry & { status: DLQStatus } = {
    dlqId,
    reason: params.reason,
    sourceId: params.sourceId,
    externalId: params.externalId,
    failedAt: new Date().toISOString(),
    attempts: params.attempts ?? 1,
    payload: params.payload,
    error: params.error,
    stack: params.stack,
    status: "pending",
  };
  _dlq.set(dlqId, entry);
  return entry;
}

export function getDLQEntry(dlqId: string): (DLQEntry & { status: DLQStatus }) | undefined {
  return _dlq.get(dlqId);
}

export function listDLQ(opts: {
  sourceId?: string;
  reason?: DLQReason;
  status?: DLQStatus;
  limit?: number;
  offset?: number;
} = {}): Array<DLQEntry & { status: DLQStatus }> {
  let entries = [..._dlq.values()];
  if (opts.sourceId) entries = entries.filter((e) => e.sourceId === opts.sourceId);
  if (opts.reason) entries = entries.filter((e) => e.reason === opts.reason);
  if (opts.status) entries = entries.filter((e) => e.status === opts.status);
  entries.sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime());
  const offset = opts.offset ?? 0;
  return entries.slice(offset, offset + (opts.limit ?? 50));
}

export function dlqStats(): Record<DLQStatus, number> & { total: number; byReason: Record<string, number> } {
  const stats = { pending: 0, replaying: 0, replayed: 0, discarded: 0, total: 0, byReason: {} as Record<string, number> };
  for (const e of _dlq.values()) {
    stats.total++;
    stats[e.status]++;
    stats.byReason[e.reason] = (stats.byReason[e.reason] ?? 0) + 1;
  }
  return stats;
}

export type ReplayFn = (entry: DLQEntry) => Promise<void>;

export async function replayDLQEntry(dlqId: string, replayFn: ReplayFn): Promise<{ ok: boolean; error?: string }> {
  const entry = _dlq.get(dlqId);
  if (!entry) return { ok: false, error: `DLQ entry ${dlqId} not found` };
  if (entry.status === "replayed") return { ok: false, error: "Already replayed" };
  if (entry.status === "discarded") return { ok: false, error: "Entry has been discarded" };

  entry.status = "replaying";
  try {
    await replayFn(entry);
    entry.status = "replayed";
    entry.replayedAt = new Date().toISOString();
    return { ok: true };
  } catch (err: unknown) {
    entry.status = "pending";
    entry.attempts++;
    entry.error = err instanceof Error ? err.message : String(err);
    return { ok: false, error: entry.error };
  }
}

export async function replayAll(
  replayFn: ReplayFn,
  opts: { reason?: DLQReason; sourceId?: string; maxItems?: number } = {},
): Promise<{ attempted: number; succeeded: number; failed: number }> {
  const pending = listDLQ({ ...opts, status: "pending", limit: opts.maxItems ?? 100 });
  let succeeded = 0, failed = 0;
  for (const entry of pending) {
    const result = await replayDLQEntry(entry.dlqId, replayFn);
    if (result.ok) succeeded++; else failed++;
  }
  return { attempted: pending.length, succeeded, failed };
}

export function discardDLQEntry(dlqId: string, reason: string): boolean {
  const entry = _dlq.get(dlqId);
  if (!entry || entry.status === "replayed") return false;
  entry.status = "discarded";
  entry.discardedAt = new Date().toISOString();
  entry.discardReason = reason;
  return true;
}
