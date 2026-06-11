/**
 * Metered billing for API usage + AI tokens.
 *
 * Task: "Metered billing for API usage + AI tokens" — integrate services/metering.
 *
 * services/metering already aggregates per-tenant usage and can produce Stripe
 * meter-event payloads (`MeteringAggregator.buildStripeMeterEvents`). This module
 * is the PUSH side: it takes those payloads (or raw counters) and emits the
 * idempotent calls to Stripe's Billing Meter Events API, plus maps our metered
 * products to subscription metered prices.
 *
 * Pull side (counting) lives in services/metering; this is intentionally the
 * thin Stripe-facing adapter so the two layers stay decoupled.
 */

import { idempotencyKey } from "./idempotency";
import type { StripeRequest, Currency } from "./types";

/** Mirrors services/metering MeteredProduct so we don't create a hard dep cycle. */
export type MeteredProduct =
  | "api_calls"
  | "events_ingested"
  | "ai_tokens"
  | "copilot_queries"
  | "exports"
  | "alert_deliveries"
  | "webhook_deliveries"
  | "tile_requests"
  | "aoi_active";

/**
 * Metered price wiring: each product maps to a Stripe meter event_name and a
 * usage-based price ID (resolved from env, never hardcoded). Mirrors
 * services/metering METER_SKUS.stripeMeterName.
 */
export interface MeteredPriceWiring {
  product: MeteredProduct;
  /** Stripe meter event_name (e.g. "aegis_ai_tokens"). */
  meterEventName: string;
  /** Env var holding the usage price ID, e.g. STRIPE_METERED_PRICE_AI_TOKENS. */
  priceIdEnv: string;
  unitLabel: string;
}

export const METERED_WIRING: Record<MeteredProduct, MeteredPriceWiring> = {
  api_calls:          { product: "api_calls",          meterEventName: "aegis_api_calls",        priceIdEnv: "STRIPE_METERED_PRICE_API_CALLS",        unitLabel: "API calls" },
  events_ingested:    { product: "events_ingested",    meterEventName: "aegis_events_ingested",  priceIdEnv: "STRIPE_METERED_PRICE_EVENTS",           unitLabel: "events" },
  ai_tokens:          { product: "ai_tokens",          meterEventName: "aegis_ai_tokens",        priceIdEnv: "STRIPE_METERED_PRICE_AI_TOKENS",        unitLabel: "1K tokens" },
  copilot_queries:    { product: "copilot_queries",    meterEventName: "aegis_copilot_queries",  priceIdEnv: "STRIPE_METERED_PRICE_COPILOT",          unitLabel: "queries" },
  exports:            { product: "exports",            meterEventName: "aegis_exports",          priceIdEnv: "STRIPE_METERED_PRICE_EXPORTS",          unitLabel: "exports" },
  alert_deliveries:   { product: "alert_deliveries",   meterEventName: "aegis_alert_deliveries", priceIdEnv: "STRIPE_METERED_PRICE_ALERTS",           unitLabel: "deliveries" },
  webhook_deliveries: { product: "webhook_deliveries", meterEventName: "aegis_webhook_delivery", priceIdEnv: "STRIPE_METERED_PRICE_WEBHOOKS",         unitLabel: "deliveries" },
  tile_requests:      { product: "tile_requests",      meterEventName: "aegis_tile_requests",    priceIdEnv: "STRIPE_METERED_PRICE_TILES",            unitLabel: "1K tiles" },
  aoi_active:         { product: "aoi_active",         meterEventName: "aegis_aoi_active",       priceIdEnv: "STRIPE_METERED_PRICE_AOI",              unitLabel: "active AOIs" },
};

/** Payload shape produced by services/metering MeteringAggregator.buildStripeMeterEvents(). */
export interface StripeMeterPayload {
  event_name: string;
  payload: { stripe_customer_id: string; value: string };
}

/**
 * Convert a meter payload into an idempotent Stripe Billing Meter Event request.
 * The idempotency key is derived from (customer, meter, period) so a redelivered
 * reconciliation batch cannot double-bill.
 *
 * https://stripe.com/docs/api/billing/meter-event/create
 */
export function meterEventRequest(
  p: StripeMeterPayload,
  period: string,
): StripeRequest<{ event_name: string; payload: Record<string, string>; timestamp?: number }> {
  return {
    method: "POST",
    path: "/v1/billing/meter_events",
    params: {
      event_name: p.event_name,
      payload: { ...p.payload },
    },
    idempotencyKey: idempotencyKey(
      "meter_event",
      `${p.payload.stripe_customer_id}:${p.event_name}`,
      period,
    ),
  };
}

/** Map a whole reconciliation batch → idempotent meter-event requests. */
export function meterBatchRequests(
  payloads: StripeMeterPayload[],
  period: string,
): StripeRequest[] {
  return payloads.map((p) => meterEventRequest(p, period));
}

/**
 * Build subscription items for the metered add-on prices that apply to a tier.
 * Returned shape feeds `subscriptions.create({ items: [...] })`.
 */
export function meteredSubscriptionItems(
  products: MeteredProduct[],
  env: NodeJS.ProcessEnv = process.env,
): Array<{ price: string; product: MeteredProduct }> {
  const items: Array<{ price: string; product: MeteredProduct }> = [];
  for (const product of products) {
    const wiring = METERED_WIRING[product];
    const price = env[wiring.priceIdEnv];
    if (price) items.push({ price, product });
  }
  return items;
}

/**
 * A pusher that emits meter events through an injected transport (the Stripe
 * SDK call). Keeps this package SDK-version-agnostic and testable.
 */
export type StripeTransport = (req: StripeRequest) => Promise<{ id: string }>;

export async function pushMeterEvents(
  payloads: StripeMeterPayload[],
  period: string,
  transport: StripeTransport,
): Promise<{ pushed: number; ids: string[] }> {
  const reqs = meterBatchRequests(payloads, period);
  const ids: string[] = [];
  for (const req of reqs) {
    const res = await transport(req);
    ids.push(res.id);
  }
  return { pushed: ids.length, ids };
}

/** Currencies the metered prices are published in (for pricing display). */
export const METERED_CURRENCIES: readonly Currency[] = ["usd", "eur", "uah", "gbp"];
