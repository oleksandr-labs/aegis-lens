/**
 * Stripe Metered Subscription Items — maps each MeterAxis to a Stripe
 * SubscriptionItem usage-record name and provides a stub reporter.
 *
 * In production, replace the stub body of `reportUsageToStripe` with a real
 * Stripe SDK call (`stripe.subscriptionItems.createUsageRecord`).
 *
 * Stripe metered items: маппінг осей → SubscriptionItem + заглушка репортингу.
 */

import type { MeterAxis } from "./usage-meters";

// ── Stripe meter map ──────────────────────────────────────────────────────────

/**
 * Maps each billable MeterAxis to the Stripe SubscriptionItem name used
 * when creating usage records.
 *
 * Назви SubscriptionItem у Stripe для кожної осі.
 */
export const STRIPE_METER_MAP: Record<MeterAxis, string> = {
  "api-calls": "aegis_api_requests",
  "ai-tokens": "aegis_ai_tokens",
  "aoi-area-km2": "aegis_aoi_km2_day",
  "export-rows": "aegis_export_rows",
  "alert-deliveries": "aegis_alert_deliveries",
  "satellite-scenes": "aegis_satellite_scenes",
};

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Payload sent to Stripe for a single metered usage record. */
export interface StripeUsageRecord {
  subscriptionItemId: string;
  quantity: number;
  /** Unix timestamp (seconds) — Stripe rejects future timestamps */
  timestamp: number;
  /** Stripe idempotency key to prevent double-billing */
  idempotencyKey: string;
}

/** Result returned by the stub reporter. */
export interface StripeUsageReportResult {
  ok: boolean;
  subscriptionItemId: string;
  quantity: number;
  /** Stripe usage record ID (stub: always "urecord_stub") */
  stripeRecordId: string;
}

// ── Stripe subscription item registry ─────────────────────────────────────────

/**
 * In production, this map is populated from Stripe's API at startup.
 * userId → axis → Stripe SubscriptionItem ID.
 *
 * У продакшні завантажується зі Stripe. Тут — заглушка.
 */
const USER_SUBSCRIPTION_ITEMS = new Map<string, Partial<Record<MeterAxis, string>>>();

/** Register a Stripe SubscriptionItem ID for a user+axis (called from webhook). */
export function registerSubscriptionItem(
  userId: string,
  axis: MeterAxis,
  subscriptionItemId: string,
): void {
  const existing = USER_SUBSCRIPTION_ITEMS.get(userId) ?? {};
  existing[axis] = subscriptionItemId;
  USER_SUBSCRIPTION_ITEMS.set(userId, existing);
}

/** Retrieve the Stripe SubscriptionItem ID for a user+axis or return a stub ID. */
export function getSubscriptionItemId(userId: string, axis: MeterAxis): string {
  return (
    USER_SUBSCRIPTION_ITEMS.get(userId)?.[axis] ??
    `si_stub_${userId}_${axis.replace(/-/g, "_")}`
  );
}

// ── reportUsageToStripe ───────────────────────────────────────────────────────

/**
 * Report consumed units for a given axis to Stripe.
 *
 * STUB: logs to console and returns a synthetic result.
 * In production: call `stripe.subscriptionItems.createUsageRecord(...)`.
 *
 * Репортує витрату осі в Stripe (заглушка — реалізувати через SDK).
 */
export async function reportUsageToStripe(
  userId: string,
  axis: MeterAxis,
  qty: number,
): Promise<StripeUsageReportResult> {
  const subscriptionItemId = getSubscriptionItemId(userId, axis);
  const meterName = STRIPE_METER_MAP[axis];
  const timestamp = Math.floor(Date.now() / 1000);
  const idempotencyKey = `${userId}:${axis}:${timestamp}:${qty}`;

  // ── STUB — replace with real Stripe SDK call in production ────────────────
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
  //   quantity: qty,
  //   timestamp,
  //   action: "increment",
  // }, { idempotencyKey });
  // ─────────────────────────────────────────────────────────────────────────

  console.log(
    `[stripe-metering] STUB reportUsage userId=${userId} axis=${axis} ` +
      `meter=${meterName} qty=${qty} siId=${subscriptionItemId} ikey=${idempotencyKey}`,
  );
  // Заглушка: у продакшні замінити на виклик Stripe SDK.

  return {
    ok: true,
    subscriptionItemId,
    quantity: qty,
    stripeRecordId: "urecord_stub",
  };
}
