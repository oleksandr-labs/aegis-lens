/**
 * Retention event logging and expansion modal logic.
 *
 * Логування подій утримання та логіка модального вікна розширення.
 */

import { EXPANSION_TRIGGERS, type ExpansionTrigger } from "./churn";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RetentionEvent =
  | "copilot-quota-hit"
  | "aoi-limit-hit"
  | "lookback-attempt"
  | "api-page-view"
  | "seat-invite"
  | "sso-request"
  | "downgrade-started"
  | "downgrade-confirmed"
  | "reactivated"
  | "win-back-clicked";

export interface RetentionEventLog {
  userId: string;
  event: RetentionEvent;
  /** Arbitrary event-specific context (tier, feature name, etc.) */
  metadata: Record<string, unknown>;
  /** ISO timestamp */
  ts: string;
}

// ── Ring Buffer Store ─────────────────────────────────────────────────────────

const RING_BUFFER_SIZE = 10_000;

/**
 * In-memory ring buffer store for retention events.
 * Wraps at RING_BUFFER_SIZE. Not persistent — intended for in-process
 * rule evaluation. Production systems should persist to a time-series DB.
 *
 * Кільцевий буфер для подій утримання.
 * Виробничі системи мають зберігати дані в часових рядах.
 */
export class RetentionEventStore {
  private readonly buffer: (RetentionEventLog | undefined)[] =
    new Array(RING_BUFFER_SIZE).fill(undefined);
  private head = 0;
  private count = 0;

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Log a retention event.
   *
   * Записати подію утримання.
   */
  log(entry: RetentionEventLog): void {
    this.buffer[this.head] = entry;
    this.head = (this.head + 1) % RING_BUFFER_SIZE;
    if (this.count < RING_BUFFER_SIZE) this.count++;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get all events for a specific user, most recent first.
   *
   * Отримати всі події для конкретного користувача, починаючи з останніх.
   */
  getByUser(userId: string): RetentionEventLog[] {
    const results: RetentionEventLog[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx =
        (this.head - 1 - i + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
      const entry = this.buffer[idx];
      if (entry && entry.userId === userId) {
        results.push(entry);
      }
    }
    return results;
  }

  /**
   * Get the most recent logged trigger event for a given user.
   * Useful for deciding whether to show an expansion modal.
   *
   * Отримати останню зареєстровану подію тригера для користувача.
   */
  getMostRecentTrigger(userId: string): RetentionEventLog | null {
    for (let i = 0; i < this.count; i++) {
      const idx =
        (this.head - 1 - i + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
      const entry = this.buffer[idx];
      if (entry && entry.userId === userId) {
        return entry;
      }
    }
    return null;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory retention event store. */
export const retentionEventStore = new RetentionEventStore();

// ── Expansion Modal Resolver ──────────────────────────────────────────────────

/**
 * Determine whether a given retention event for a user should trigger an
 * expansion modal. Returns the matching ExpansionTrigger or null.
 *
 * Визначити, чи повинна подія утримання показати модальне вікно розширення.
 * Повертає відповідний ExpansionTrigger або null.
 */
export function shouldShowExpansionModal(
  userId: string,
  event: RetentionEvent,
  currentTier?: string,
): ExpansionTrigger | null {
  // Log the event
  retentionEventStore.log({
    userId,
    event,
    metadata: { currentTier: currentTier ?? "unknown" },
    ts: new Date().toISOString(),
  });

  // Find a matching trigger
  const match = EXPANSION_TRIGGERS.find(
    (trigger) =>
      trigger.triggerEvent === event &&
      (trigger.fromTier === currentTier || trigger.fromTier === "any"),
  );

  return match ?? null;
}
