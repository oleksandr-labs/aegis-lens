import "server-only";

/**
 * Usage Metering → Billing Pipeline.
 *
 * Records API usage events (per org, per endpoint, per tier) and batches them
 * for flush to the Stripe metered billing API. The buffer is an in-process
 * singleton; in production, back it with a durable queue (Redis / SQS) so
 * events survive server restarts.
 *
 * Stripe integration is a no-op when `STRIPE_SECRET_KEY` is absent — the events
 * are accumulated locally and logged, which is safe for dev/test environments.
 *
 * Stripe meter API used: `POST /v1/billing/meter_events` (Stripe Billing Meters,
 * metered usage). The `stripeMeterId` for each event type must be pre-created in
 * the Stripe dashboard and stored in env vars (see below).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ApiTier = "free" | "pro" | "enterprise" | "internal";

export interface MeterEvent {
  /** Organisation that made the API call. */
  orgId: string;
  /** Hashed API key or JWT sub — never store raw secrets. */
  apiKeyHash: string;
  /** Canonical endpoint path, e.g. "/api/v1/events". */
  endpoint: string;
  /** HTTP method. */
  method: string;
  /** Billing tier of the org. */
  tier: ApiTier;
  /**
   * Billable units consumed. Semantics depend on endpoint:
   *   - For most API calls: 1 unit = 1 request.
   *   - For AI inference: 1 unit = number of tokens / 1000.
   *   - For vision: 1 unit = number of images processed.
   */
  units: number;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** Optional metadata passed through to Stripe event payload. */
  metadata?: Record<string, string>;
}

export interface FlushResult {
  flushed: number;
  failed: number;
  skippedNoKey: boolean;
  errors: string[];
}

// ── Buffer ────────────────────────────────────────────────────────────────────

const DEFAULT_FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const DEFAULT_MAX_BUFFER_SIZE = 500; // flush early if buffer grows large

export class MeteringBuffer {
  private buffer: MeterEvent[] = [];
  private flushIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly flushIntervalMs = DEFAULT_FLUSH_INTERVAL_MS,
    private readonly maxBufferSize = DEFAULT_MAX_BUFFER_SIZE,
  ) {}

  /** Record a single usage event. Triggers an early flush if the buffer is full. */
  recordUsage(event: MeterEvent): void {
    this.buffer.push(event);
    if (this.buffer.length >= this.maxBufferSize) {
      // Fire-and-forget early flush; errors are logged internally.
      void this.flushToStripe();
    }
  }

  /** Start the background flush interval. Call once at server startup. */
  startAutoFlush(): void {
    if (this.flushIntervalId !== null) return;
    this.flushIntervalId = setInterval(() => {
      void this.flushToStripe();
    }, this.flushIntervalMs);
    // Allow Node.js to exit even if the interval is still running.
    if (this.flushIntervalId.unref) this.flushIntervalId.unref();
  }

  /** Stop the background flush interval. */
  stopAutoFlush(): void {
    if (this.flushIntervalId !== null) {
      clearInterval(this.flushIntervalId);
      this.flushIntervalId = null;
    }
  }

  /**
   * Flush buffered events to Stripe metered billing.
   * No-op (returns `skippedNoKey: true`) when `STRIPE_SECRET_KEY` is absent.
   */
  async flushToStripe(): Promise<FlushResult> {
    if (this.buffer.length === 0) {
      return { flushed: 0, failed: 0, skippedNoKey: false, errors: [] };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      const count = this.buffer.length;
      console.warn(
        `[usage-metering] STRIPE_SECRET_KEY not set; ${count} event(s) dropped.`,
      );
      this.buffer = [];
      return { flushed: 0, failed: 0, skippedNoKey: true, errors: [] };
    }

    // Drain the buffer atomically before async work to avoid double-sends.
    const batch = this.buffer.splice(0, this.buffer.length);
    let flushed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const event of batch) {
      try {
        await sendStripeEvent(event, stripeKey);
        flushed++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${event.orgId}/${event.endpoint}: ${msg}`);
        // Re-queue failed events so they are retried on the next flush.
        this.buffer.push(event);
      }
    }

    if (failed > 0) {
      console.error(
        `[usage-metering] ${failed} event(s) failed to flush to Stripe.`,
        errors,
      );
    }

    return { flushed, failed, skippedNoKey: false, errors };
  }

  /** Current number of buffered events (useful for health checks). */
  get size(): number {
    return this.buffer.length;
  }
}

// ── Stripe event sender ───────────────────────────────────────────────────────

/**
 * POST a single meter event to Stripe Billing Meters API.
 * Uses native `fetch` (available in Node.js 18+).
 *
 * Stripe meter event docs:
 * https://stripe.com/docs/api/billing/meter-event/create
 */
async function sendStripeEvent(
  event: MeterEvent,
  stripeKey: string,
): Promise<void> {
  const meterId =
    process.env[`STRIPE_METER_ID_${event.tier.toUpperCase()}`] ??
    process.env.STRIPE_METER_ID_DEFAULT;

  if (!meterId) {
    // No meter configured for this tier — log and skip (don't fail the batch).
    console.warn(
      `[usage-metering] No Stripe meter ID for tier "${event.tier}"; event skipped.`,
    );
    return;
  }

  const body = new URLSearchParams({
    event_name: meterId,
    "payload[stripe_customer_id]": event.orgId,
    "payload[value]": String(event.units),
    timestamp: String(Math.floor(new Date(event.timestamp).getTime() / 1000)),
    identifier: `${event.orgId}:${event.endpoint}:${event.timestamp}`,
  });

  if (event.metadata) {
    for (const [k, v] of Object.entries(event.metadata)) {
      body.set(`payload[${k}]`, v);
    }
  }

  const res = await fetch("https://api.stripe.com/v1/billing/meter_events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`Stripe ${res.status}: ${text}`);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Singleton metering buffer. Import and call `recordUsage` from API middleware. */
export const usageBuffer = new MeteringBuffer();

// Module-level convenience wrappers for the singleton.

/** Record a single API usage event to the global metering buffer. */
export function recordUsage(event: MeterEvent): void {
  usageBuffer.recordUsage(event);
}

/** Flush all buffered events to Stripe. Awaitable — useful in tests and shutdown hooks. */
export function flushToStripe(): Promise<FlushResult> {
  return usageBuffer.flushToStripe();
}
