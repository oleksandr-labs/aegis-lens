/**
 * Alert delivery retry + DLQ per channel.
 *
 * Retry schedule: exponential backoff with jitter.
 * After maxAttempts failures: entry moves to DLQ.
 * DLQ entries can be replayed manually via admin API.
 */

export type AlertChannelType = "email" | "telegram" | "slack" | "webhook" | "in_app" | "web_push" | "sms";

export type AlertDeliveryStatus =
  | "pending"
  | "delivering"
  | "delivered"
  | "failed"
  | "retrying"
  | "dead";

export interface AlertDeliveryAttempt {
  attemptNumber: number;
  startedAt: string;
  finishedAt?: string;
  status: "success" | "failure";
  error?: string;
  httpStatus?: number;
  latencyMs?: number;
}

export interface AlertDeliveryRecord {
  deliveryId: string;
  alertId: string;
  notificationId: string;
  channel: AlertChannelType;
  recipient: string; // email, chat_id, webhook URL, etc.
  status: AlertDeliveryStatus;
  attempts: AlertDeliveryAttempt[];
  maxAttempts: number;
  /** ISO-8601 — earliest next retry */
  nextRetryAt?: string;
  /** ISO-8601 — when delivered successfully */
  deliveredAt?: string;
  /** ISO-8601 — when moved to DLQ */
  deadAt?: string;
  deadReason?: string;
}

// ── Exponential backoff config ─────────────────────────────────────────────

/**
 * Exponential backoff configuration for alert delivery retries.
 * Used by computeBackoffDelay() below.
 *
 * Конфігурація експоненціального відкату для повторних спроб доставки сповіщень.
 */
export const BACKOFF_CONFIG = {
  /** Initial delay on first retry (ms) */
  initialDelayMs: 1_000,
  /** Maximum delay cap (ms) — ~32 seconds */
  maxDelayMs: 32_000,
  /** Exponential multiplier per attempt */
  multiplier: 2,
  /** Jitter factor 0–1: adds ±(delay × factor) random noise to avoid thundering herd */
  jitterFactor: 0.25,
  /** Maximum number of retry attempts before moving to DLQ */
  maxRetries: 5,
} as const;

/**
 * Compute the next retry delay using exponential backoff with jitter.
 * attempt=1 → initialDelayMs; capped at maxDelayMs.
 *
 * Обчислює затримку перед наступною спробою (експоненціальний відкат з шумом).
 */
export function computeBackoffDelay(
  attempt: number,
  config: typeof BACKOFF_CONFIG = BACKOFF_CONFIG,
): number {
  const base = Math.min(
    config.initialDelayMs * Math.pow(config.multiplier, attempt - 1),
    config.maxDelayMs,
  );
  // Jitter: base ± (base × jitterFactor × random)
  const jitter = base * config.jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(base + jitter));
}

// ── Retry schedule ─────────────────────────────────────────────────────────

const RETRY_DELAYS_MS = [
  30_000,     // 30s
  120_000,    // 2 min
  300_000,    // 5 min
  900_000,    // 15 min
  1_800_000,  // 30 min
  3_600_000,  // 1 hour
  7_200_000,  // 2 hours
  14_400_000, // 4 hours
];

export function nextRetryDelay(attempt: number): number {
  const base = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
  // Add jitter: ±20%
  const jitter = base * 0.2 * (Math.random() * 2 - 1);
  return Math.round(base + jitter);
}

export const DEFAULT_MAX_ATTEMPTS: Record<AlertChannelType, number> = {
  email:    8,
  telegram: 5,
  slack:    5,
  webhook:  8,
  in_app:   3,
  web_push: 3,
  sms:      3,
};

// ── In-memory delivery tracker ─────────────────────────────────────────────

const _deliveries = new Map<string, AlertDeliveryRecord>();
let _seq = 0;

export function createDeliveryRecord(params: {
  alertId: string;
  notificationId: string;
  channel: AlertChannelType;
  recipient: string;
}): AlertDeliveryRecord {
  const deliveryId = `delivery-${++_seq}-${Date.now()}`;
  const record: AlertDeliveryRecord = {
    deliveryId,
    alertId: params.alertId,
    notificationId: params.notificationId,
    channel: params.channel,
    recipient: params.recipient,
    status: "pending",
    attempts: [],
    maxAttempts: DEFAULT_MAX_ATTEMPTS[params.channel],
  };
  _deliveries.set(deliveryId, record);
  return record;
}

export function recordAttempt(
  deliveryId: string,
  result: { success: boolean; error?: string; httpStatus?: number; latencyMs?: number },
): AlertDeliveryRecord | undefined {
  const record = _deliveries.get(deliveryId);
  if (!record) return undefined;

  const attempt: AlertDeliveryAttempt = {
    attemptNumber: record.attempts.length + 1,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    status: result.success ? "success" : "failure",
    error: result.error,
    httpStatus: result.httpStatus,
    latencyMs: result.latencyMs,
  };
  record.attempts.push(attempt);

  if (result.success) {
    record.status = "delivered";
    record.deliveredAt = new Date().toISOString();
  } else if (record.attempts.length >= record.maxAttempts) {
    record.status = "dead";
    record.deadAt = new Date().toISOString();
    record.deadReason = `Exceeded ${record.maxAttempts} attempts. Last error: ${result.error}`;
  } else {
    record.status = "retrying";
    const delay = nextRetryDelay(record.attempts.length);
    record.nextRetryAt = new Date(Date.now() + delay).toISOString();
  }

  _deliveries.set(deliveryId, record);
  return record;
}

export function getDeliveriesForAlert(alertId: string): AlertDeliveryRecord[] {
  return [..._deliveries.values()].filter((d) => d.alertId === alertId);
}

export function getDLQDeliveries(limit = 50): AlertDeliveryRecord[] {
  return [..._deliveries.values()]
    .filter((d) => d.status === "dead")
    .sort((a, b) => new Date(b.deadAt!).getTime() - new Date(a.deadAt!).getTime())
    .slice(0, limit);
}

export function getPendingRetries(): AlertDeliveryRecord[] {
  const now = new Date();
  return [..._deliveries.values()].filter(
    (d) => d.status === "retrying" && d.nextRetryAt && new Date(d.nextRetryAt) <= now,
  );
}

export function deliveryStats(): {
  total: number;
  delivered: number;
  retrying: number;
  dead: number;
  byChannel: Record<AlertChannelType, { total: number; delivered: number; dead: number }>;
} {
  const stats = {
    total: 0, delivered: 0, retrying: 0, dead: 0,
    byChannel: {} as Record<AlertChannelType, { total: number; delivered: number; dead: number }>,
  };
  for (const d of _deliveries.values()) {
    stats.total++;
    if (d.status === "delivered") stats.delivered++;
    if (d.status === "retrying") stats.retrying++;
    if (d.status === "dead") stats.dead++;
    if (!stats.byChannel[d.channel]) stats.byChannel[d.channel] = { total: 0, delivered: 0, dead: 0 };
    stats.byChannel[d.channel].total++;
    if (d.status === "delivered") stats.byChannel[d.channel].delivered++;
    if (d.status === "dead") stats.byChannel[d.channel].dead++;
  }
  return stats;
}
