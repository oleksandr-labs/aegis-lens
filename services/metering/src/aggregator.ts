/**
 * Metering aggregator.
 *
 * Pipeline: gateway emits MeterEvent → Kafka `usage.events` → this aggregator
 * → per-tenant Redis counters → periodic reconcile to DB → Stripe meters.
 *
 * Idempotency is enforced via the idempotencyKey: a key seen before is a no-op.
 * "A double-counted metric is a refund letter."
 */

import {
  MeterEvent, MeteredProduct, UsageCounter, PlanLimit,
  ThresholdAlert, METER_SKUS,
} from "./types";

function periodOf(timestamp: string): string {
  // Billing period = calendar month start
  return timestamp.slice(0, 7) + "-01";
}

function counterKey(orgId: string, product: MeteredProduct, period: string): string {
  return `${orgId}|${product}|${period}`;
}

export class MeteringAggregator {
  private counters = new Map<string, UsageCounter>();
  private seenKeys = new Set<string>();
  private firedThresholds = new Set<string>();

  /**
   * Ingest a meter event. Returns false if it was a duplicate (idempotent no-op).
   */
  ingest(event: MeterEvent): boolean {
    if (this.seenKeys.has(event.idempotencyKey)) return false;
    this.seenKeys.add(event.idempotencyKey);

    const period = periodOf(event.timestamp);
    const key = counterKey(event.orgId, event.product, period);
    const existing = this.counters.get(key);
    if (existing) {
      existing.total += event.quantity;
    } else {
      this.counters.set(key, {
        orgId: event.orgId,
        product: event.product,
        periodStart: period,
        total: event.quantity,
      });
    }
    return true;
  }

  /** Batch ingest; returns count of newly-counted (non-duplicate) events. */
  ingestBatch(events: MeterEvent[]): number {
    let counted = 0;
    for (const e of events) if (this.ingest(e)) counted++;
    return counted;
  }

  getCounter(orgId: string, product: MeteredProduct, period?: string): UsageCounter | undefined {
    const p = period ?? periodOf(new Date().toISOString());
    return this.counters.get(counterKey(orgId, product, p));
  }

  getOrgUsage(orgId: string, period?: string): UsageCounter[] {
    const p = period ?? periodOf(new Date().toISOString());
    return [...this.counters.values()].filter((c) => c.orgId === orgId && c.periodStart === p);
  }

  /**
   * Check plan limits and produce threshold alerts (80%, 100%) once each.
   */
  checkThresholds(orgId: string, limits: PlanLimit[], period?: string): ThresholdAlert[] {
    const p = period ?? periodOf(new Date().toISOString());
    const alerts: ThresholdAlert[] = [];

    for (const limit of limits) {
      if (limit.included <= 0) continue;
      const counter = this.getCounter(orgId, limit.product, p);
      const used = counter?.total ?? 0;
      const pct = (used / limit.included) * 100;

      for (const threshold of [80, 100]) {
        if (pct >= threshold) {
          const fireKey = `${orgId}|${limit.product}|${p}|${threshold}`;
          if (!this.firedThresholds.has(fireKey)) {
            this.firedThresholds.add(fireKey);
            alerts.push({
              orgId,
              product: limit.product,
              thresholdPct: threshold,
              triggeredAt: new Date().toISOString(),
              currentPct: Math.round(pct),
            });
          }
        }
      }
    }
    return alerts;
  }

  /**
   * Compute overage charges for an org against plan limits.
   */
  computeOverage(orgId: string, limits: PlanLimit[], period?: string): Array<{
    product: MeteredProduct;
    overUnits: number;
    mode: PlanLimit["overageMode"];
    chargeCents: number;
    blocked: boolean;
  }> {
    const p = period ?? periodOf(new Date().toISOString());
    return limits.map((limit) => {
      const used = this.getCounter(orgId, limit.product, p)?.total ?? 0;
      const over = Math.max(0, used - limit.included);
      const sku = METER_SKUS[limit.product];
      const billableUnits = Math.ceil(over / sku.billingDivisor);
      const chargeCents =
        limit.overageMode === "pay_as_you_go"
          ? billableUnits * (limit.overageUnitPriceCents ?? 0)
          : 0;
      return {
        product: limit.product,
        overUnits: over,
        mode: limit.overageMode,
        chargeCents,
        blocked: limit.overageMode === "block" && over > 0,
      };
    });
  }

  /**
   * Build Stripe meter payloads for reconciliation.
   */
  buildStripeMeterEvents(orgId: string, stripeCustomerId: string, period?: string): Array<{
    event_name: string;
    payload: { stripe_customer_id: string; value: string };
  }> {
    const usage = this.getOrgUsage(orgId, period);
    return usage.map((counter) => {
      const sku = METER_SKUS[counter.product];
      const billableUnits = Math.ceil(counter.total / sku.billingDivisor);
      return {
        event_name: sku.stripeMeterName,
        payload: { stripe_customer_id: stripeCustomerId, value: String(billableUnits) },
      };
    });
  }

  /** Mark counters reconciled (after pushing to Stripe). */
  markReconciled(orgId: string, period?: string): void {
    const now = new Date().toISOString();
    for (const counter of this.getOrgUsage(orgId, period)) {
      counter.lastReconciledAt = now;
    }
  }
}

export const meteringAggregator = new MeteringAggregator();
