/**
 * Report subscription + scheduling.
 *
 * Subscriptions tie an org, a template, a schedule, and delivery targets
 * together. A scheduler (cron/queue worker) calls getDueSubscriptions()
 * each tick and triggers report generation + delivery for due entries.
 */

import type { DeliveryTarget } from "./delivery";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReportSchedule = "daily" | "weekly" | "monthly" | "on_event";

export interface ReportSubscription {
  id: string;
  orgId: string;
  templateId: string;
  schedule: ReportSchedule;
  regions: string[];
  targets: DeliveryTarget[];
  lastRunAt?: string;
  nextRunAt: string;
  enabled: boolean;
}

// ── Next-run computation ──────────────────────────────────────────────────────

/**
 * Compute the next ISO datetime string based on a schedule and last-run time.
 *
 * For "on_event" schedules the concept of a fixed next-run does not apply —
 * returns a far-future sentinel so the subscription never fires on a tick.
 */
export function computeNextRunAt(
  schedule: ReportSchedule,
  lastRunAt: string,
): string {
  const base = new Date(lastRunAt);

  switch (schedule) {
    case "daily": {
      base.setUTCDate(base.getUTCDate() + 1);
      return base.toISOString();
    }
    case "weekly": {
      base.setUTCDate(base.getUTCDate() + 7);
      return base.toISOString();
    }
    case "monthly": {
      base.setUTCMonth(base.getUTCMonth() + 1);
      return base.toISOString();
    }
    case "on_event": {
      // Event-triggered: set nextRunAt far in the future — real triggers
      // come from the event pipeline, not a scheduler tick.
      const farFuture = new Date(base);
      farFuture.setUTCFullYear(farFuture.getUTCFullYear() + 10);
      return farFuture.toISOString();
    }
    default: {
      const exhaustive: never = schedule;
      throw new Error(`Unknown schedule: ${String(exhaustive)}`);
    }
  }
}

/**
 * Compute initial nextRunAt for a new subscription.
 * Defaults to "now + one period" so the first run is not immediate.
 */
function initialNextRunAt(schedule: ReportSchedule): string {
  return computeNextRunAt(schedule, new Date().toISOString());
}

// ── SubscriptionStore ─────────────────────────────────────────────────────────

export class SubscriptionStore {
  private readonly subs = new Map<string, ReportSubscription>();

  /**
   * Create a new subscription. Generates a UUID id and computes nextRunAt.
   */
  create(
    sub: Omit<ReportSubscription, "id" | "lastRunAt" | "nextRunAt">,
  ): ReportSubscription {
    const id = crypto.randomUUID();
    const nextRunAt = initialNextRunAt(sub.schedule);
    const entry: ReportSubscription = { ...sub, id, nextRunAt };
    this.subs.set(id, entry);
    return { ...entry, targets: [...entry.targets] };
  }

  /**
   * Return all subscriptions for an org, enabled or not.
   */
  list(orgId: string): ReportSubscription[] {
    return Array.from(this.subs.values())
      .filter((s) => s.orgId === orgId)
      .map(this.clone);
  }

  /**
   * Fetch a single subscription by ID.
   */
  get(id: string): ReportSubscription | undefined {
    const s = this.subs.get(id);
    return s ? this.clone(s) : undefined;
  }

  /**
   * Update arbitrary fields on a subscription.
   */
  update(
    id: string,
    patch: Partial<Omit<ReportSubscription, "id" | "orgId">>,
  ): ReportSubscription {
    const sub = this.requireSub(id);
    Object.assign(sub, patch);
    return this.clone(sub);
  }

  /**
   * Enable a subscription so it fires on schedule.
   */
  enable(id: string): ReportSubscription {
    return this.update(id, { enabled: true });
  }

  /**
   * Disable a subscription — getDueSubscriptions() will skip it.
   */
  disable(id: string): ReportSubscription {
    return this.update(id, { enabled: false });
  }

  /**
   * Delete a subscription permanently.
   */
  delete(id: string): void {
    if (!this.subs.has(id)) {
      throw new Error(`Subscription "${id}" not found.`);
    }
    this.subs.delete(id);
  }

  /**
   * Record that a subscription has run and advance nextRunAt.
   */
  markRun(id: string, ranAt: string): void {
    const sub = this.requireSub(id);
    sub.lastRunAt = ranAt;
    sub.nextRunAt = computeNextRunAt(sub.schedule, ranAt);
  }

  /**
   * Return all enabled subscriptions whose nextRunAt is at or before `now`.
   *
   * @param now - ISO datetime string representing the current tick time
   */
  getDueSubscriptions(now: string): ReportSubscription[] {
    const nowMs = new Date(now).getTime();
    return Array.from(this.subs.values())
      .filter((s) => s.enabled && new Date(s.nextRunAt).getTime() <= nowMs)
      .map(this.clone);
  }

  /** Total number of stored subscriptions. */
  count(): number {
    return this.subs.size;
  }

  private requireSub(id: string): ReportSubscription {
    const sub = this.subs.get(id);
    if (!sub) throw new Error(`Subscription "${id}" not found.`);
    return sub;
  }

  private clone(s: ReportSubscription): ReportSubscription {
    return { ...s, targets: [...s.targets] };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const subscriptionStore = new SubscriptionStore();
