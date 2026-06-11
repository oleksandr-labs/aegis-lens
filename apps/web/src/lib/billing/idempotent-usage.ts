/**
 * Idempotent Usage Events — every metered action records a unique event_id
 * to prevent double-billing on retries or at-least-once delivery.
 *
 * Ідемпотентні події використання: унікальний event_id запобігає подвійному білінгу.
 */

import type { MeterAxis } from "./usage-meters";

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single billable usage event. */
export interface UsageEvent {
  /** Globally unique event identifier (UUID or hash). */
  event_id: string;
  userId: string;
  axis: MeterAxis;
  /** Number of units consumed by this event. */
  quantity: number;
  /** ISO 8601 timestamp when the event occurred. */
  occurredAt: string;
  /** Optional: source action that triggered this event (for audit trail). */
  source?: string;
  /** Optional: Stripe idempotency key to propagate to usage reports. */
  stripeIdempotencyKey?: string;
}

/** Metadata stored alongside the event after first receipt. */
export interface UsageEventRecord {
  event: UsageEvent;
  /** ISO 8601 — when this store first received the event */
  receivedAt: string;
  /** Whether the event has been forwarded to Stripe */
  reportedToStripe: boolean;
}

// ── IdempotentUsageStore ──────────────────────────────────────────────────────

/**
 * Deduplicates metered usage events by event_id.
 *
 * In production, use a persistent store (e.g. PostgreSQL UNIQUE constraint
 * on event_id) and expire old records after the billing reconciliation window.
 *
 * У продакшні зберігати в БД з UNIQUE-обмеженням на event_id.
 */
export class IdempotentUsageStore {
  /** event_id → record */
  private readonly seen = new Map<string, UsageEventRecord>();

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Record a usage event.
   *
   * Returns `true` if the event is new and was accepted.
   * Returns `false` if the `event_id` was already recorded (duplicate — ignore).
   *
   * Повертає true якщо подія нова; false якщо дублікат.
   */
  recordUsageEvent(event: UsageEvent): boolean {
    if (this.seen.has(event.event_id)) {
      return false; // Duplicate — skip.
      // Дублікат — ігнорувати.
    }

    const record: UsageEventRecord = {
      event,
      receivedAt: new Date().toISOString(),
      reportedToStripe: false,
    };
    this.seen.set(event.event_id, record);
    return true;
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  /** Check if an event_id has already been recorded. */
  isDuplicate(eventId: string): boolean {
    return this.seen.has(eventId);
  }

  /** Retrieve the stored record for a given event_id, or null. */
  getRecord(eventId: string): UsageEventRecord | null {
    return this.seen.get(eventId) ?? null;
  }

  // ── Mark reported ─────────────────────────────────────────────────────────

  /**
   * Mark an event as having been forwarded to Stripe successfully.
   *
   * Позначає подію як відправлену в Stripe.
   */
  markReportedToStripe(eventId: string): void {
    const record = this.seen.get(eventId);
    if (record) record.reportedToStripe = true;
  }

  // ── Pending report list ───────────────────────────────────────────────────

  /**
   * Return all events not yet forwarded to Stripe
   * (used by reconciliation / background worker).
   *
   * Повертає всі події, що ще не відправлені в Stripe.
   */
  pendingStripeReport(): UsageEventRecord[] {
    const result: UsageEventRecord[] = [];
    for (const record of this.seen.values()) {
      if (!record.reportedToStripe) result.push(record);
    }
    return result;
  }

  // ── Size / stats ──────────────────────────────────────────────────────────

  /** Total number of unique events stored. */
  size(): number {
    return this.seen.size;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global idempotent usage event store. */
export const idempotentUsageStore = new IdempotentUsageStore();
