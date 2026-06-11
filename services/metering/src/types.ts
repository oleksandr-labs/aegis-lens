/** Usage metering types. */

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

/** A single raw metering event from the gateway / services. */
export interface MeterEvent {
  /** Idempotency key — same event reported twice is counted once */
  idempotencyKey: string;
  orgId: string;
  product: MeteredProduct;
  /** Units consumed (e.g. 1 API call, 1500 AI tokens) */
  quantity: number;
  /** ISO-8601 */
  timestamp: string;
  /** Optional dimensions for breakdown (endpoint, model, region) */
  dimensions?: Record<string, string>;
}

/** Stripe meter SKU mapping per product. */
export interface MeterSKU {
  product: MeteredProduct;
  /** Stripe meter event_name */
  stripeMeterName: string;
  /** Stripe price ID for usage-based billing */
  stripePriceId?: string;
  /** Unit label for display */
  unitLabel: string;
  /** How quantity maps to billable units (e.g. AI tokens billed per 1000) */
  billingDivisor: number;
}

export const METER_SKUS: Record<MeteredProduct, MeterSKU> = {
  api_calls:         { product: "api_calls",         stripeMeterName: "aegis_api_calls",        unitLabel: "API calls",          billingDivisor: 1 },
  events_ingested:   { product: "events_ingested",   stripeMeterName: "aegis_events_ingested",  unitLabel: "events",             billingDivisor: 1 },
  ai_tokens:         { product: "ai_tokens",         stripeMeterName: "aegis_ai_tokens",        unitLabel: "1K tokens",          billingDivisor: 1000 },
  copilot_queries:   { product: "copilot_queries",   stripeMeterName: "aegis_copilot_queries",  unitLabel: "queries",            billingDivisor: 1 },
  exports:           { product: "exports",           stripeMeterName: "aegis_exports",          unitLabel: "exports",            billingDivisor: 1 },
  alert_deliveries:  { product: "alert_deliveries",  stripeMeterName: "aegis_alert_deliveries", unitLabel: "deliveries",         billingDivisor: 1 },
  webhook_deliveries:{ product: "webhook_deliveries",stripeMeterName: "aegis_webhook_delivery", unitLabel: "deliveries",         billingDivisor: 1 },
  tile_requests:     { product: "tile_requests",     stripeMeterName: "aegis_tile_requests",    unitLabel: "1K tiles",           billingDivisor: 1000 },
  aoi_active:        { product: "aoi_active",        stripeMeterName: "aegis_aoi_active",       unitLabel: "active AOIs",        billingDivisor: 1 },
};

export interface UsageCounter {
  orgId: string;
  product: MeteredProduct;
  /** Billing period start (YYYY-MM-DD) */
  periodStart: string;
  total: number;
  /** Last reconciliation timestamp */
  lastReconciledAt?: string;
}

export type OverageMode = "block" | "pay_as_you_go" | "negotiated";

export interface PlanLimit {
  product: MeteredProduct;
  included: number;
  overageMode: OverageMode;
  /** For pay_as_you_go: price per billable unit over the included amount */
  overageUnitPriceCents?: number;
}

export interface ThresholdAlert {
  orgId: string;
  product: MeteredProduct;
  thresholdPct: number; // 80, 100, etc.
  triggeredAt: string;
  currentPct: number;
}
