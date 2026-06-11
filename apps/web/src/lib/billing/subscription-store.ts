/**
 * In-memory Subscription Store.
 *
 * Stores active subscriptions keyed by subscription ID and indexed by userId.
 * Replace with a database-backed implementation (Prisma / Drizzle) before
 * going to production — this store does NOT survive server restarts.
 *
 * Замінити на БД перед запуском у продакшені. Не зберігається між рестартами.
 */

import type { Subscription } from "./types";

// ── Store class ───────────────────────────────────────────────────────────────

export class InMemorySubscriptionStore {
  private readonly byId = new Map<string, Subscription>();
  private readonly byUser = new Map<string, string>(); // userId → subscriptionId

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Persist a new subscription. Overwrites any existing subscription for the
   * same subscription ID.
   */
  create(sub: Subscription): void {
    this.byId.set(sub.id, { ...sub });
    this.byUser.set(sub.userId, sub.id);
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /** Returns the subscription for the given user, or null if none exists. */
  getByUserId(userId: string): Subscription | null {
    const id = this.byUser.get(userId);
    if (!id) return null;
    return this.byId.get(id) ?? null;
  }

  /** Returns the subscription by its ID, or null. */
  getById(id: string): Subscription | null {
    return this.byId.get(id) ?? null;
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  /**
   * Apply a partial patch to an existing subscription.
   * Throws if the subscription does not exist.
   */
  update(id: string, patch: Partial<Subscription>): Subscription {
    const existing = this.byId.get(id);
    if (!existing) {
      throw new Error(`[subscription-store] Subscription "${id}" not found.`);
    }
    const updated: Subscription = { ...existing, ...patch, id };
    this.byId.set(id, updated);
    // Re-index userId if it changed (unusual but safe)
    this.byUser.set(updated.userId, id);
    return updated;
  }

  // ── Cancel ─────────────────────────────────────────────────────────────────

  /**
   * Mark a subscription as canceled.
   *
   * @param id            Subscription ID
   * @param atPeriodEnd   If true → set cancelAtPeriodEnd=true (grace period).
   *                      If false → set status=canceled immediately.
   */
  cancel(id: string, atPeriodEnd: boolean): Subscription {
    if (atPeriodEnd) {
      return this.update(id, { cancelAtPeriodEnd: true });
    }
    return this.update(id, {
      status: "canceled",
      cancelAtPeriodEnd: false,
    });
  }

  // ── Query ──────────────────────────────────────────────────────────────────

  /**
   * Returns subscriptions whose `currentPeriodEnd` is within `withinDays` days
   * from now. Useful for sending renewal-reminder emails.
   *
   * Повертає підписки, що закінчуються протягом `withinDays` днів.
   */
  listExpiring(withinDays: number): Subscription[] {
    const now = Date.now();
    const cutoff = now + withinDays * 24 * 60 * 60 * 1000;
    const results: Subscription[] = [];

    for (const sub of this.byId.values()) {
      if (sub.status === "canceled") continue;
      const end = new Date(sub.currentPeriodEnd).getTime();
      if (end > now && end <= cutoff) {
        results.push({ ...sub });
      }
    }

    return results;
  }

  /** Total number of stored subscriptions (useful for health/debug). */
  get size(): number {
    return this.byId.size;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory subscription store. One instance per Node.js process. */
export const subscriptionStore = new InMemorySubscriptionStore();
