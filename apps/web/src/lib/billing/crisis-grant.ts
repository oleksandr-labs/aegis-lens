/**
 * Crisis Response Grant — automatic free-tier promotion during declared
 * humanitarian emergencies.
 *
 * When a crisis event is activated by an admin, eligible users in the affected
 * region receive an auto-grant that upgrades their effective tier for the
 * duration of the crisis. Complements the Crisis Pass (day-event access).
 *
 * Автоматичний грант під час гуманітарних криз. Доповнює Crisis Pass (passes.ts).
 */

// ── CrisisEvent ────────────────────────────────────────────────────────────────

export interface CrisisEvent {
  /** Unique identifier for this crisis event, e.g. "ua-conflict-2024" */
  id: string;
  /** Human-readable name, e.g. "Ukraine Armed Conflict (2022-)" */
  name: string;
  /** ISO 3166-1 alpha-2 country codes of affected regions */
  affectedCountryCodes: string[];
  /** ISO timestamp when the crisis was declared (for grant start date) */
  declaredAt: string;
  /** ISO timestamp when the crisis ends / grant expires; null = ongoing */
  endsAt: string | null;
  /** Whether the crisis is currently active */
  active: boolean;
}

// ── Crisis grant tiers ─────────────────────────────────────────────────────────

/**
 * Grant tier awarded per crisis type.
 * "humanitarian" → Pro equivalent.
 * "major" → Observer equivalent.
 * "alert" → extended free limits only.
 *
 * Рівні гранту за категорією кризи.
 */
export const CRISIS_GRANT_TIERS: Record<"humanitarian" | "major" | "alert", string> = {
  humanitarian: "pro",
  major: "observer",
  alert: "free",
};

// ── CrisisUserGrant ────────────────────────────────────────────────────────────

interface CrisisUserGrant {
  userId: string;
  crisisId: string;
  /** Effective tier granted for this crisis */
  grantedTier: string;
  activatedAt: string;
  /** Expiry follows the crisis endsAt, or null if ongoing */
  expiresAt: string | null;
}

// ── CrisisGrantStore ───────────────────────────────────────────────────────────

export class CrisisGrantStore {
  private readonly events = new Map<string, CrisisEvent>();
  /** Map<`${userId}:${crisisId}`, CrisisUserGrant> */
  private readonly grants = new Map<string, CrisisUserGrant>();

  // ── Crisis event management ────────────────────────────────────────────────

  /**
   * Register or update a crisis event.
   * Реєструє або оновлює кризову подію.
   */
  registerEvent(event: CrisisEvent): void {
    this.events.set(event.id, event);
  }

  /** Deactivate a crisis event (sets active=false and endsAt=now if not already set). */
  deactivateEvent(crisisId: string): void {
    const event = this.events.get(crisisId);
    if (event) {
      this.events.set(crisisId, {
        ...event,
        active: false,
        endsAt: event.endsAt ?? new Date().toISOString(),
      });
    }
  }

  /** Get all currently active crisis events. Повертає активні кризові події. */
  getActiveEvents(): CrisisEvent[] {
    return Array.from(this.events.values()).filter((e) => e.active);
  }

  // ── activateCrisisGrant ────────────────────────────────────────────────────

  /**
   * Activate a crisis grant for a user.
   * Idempotent: re-calling with the same userId+crisisId updates the record.
   * Does not verify geo-IP here — caller must check before invoking.
   *
   * Активує грант для користувача. Ідемпотентно. Верифікація геолокації — на боці калера.
   */
  activateCrisisGrant(userId: string, crisisId: string): void {
    const event = this.events.get(crisisId);
    if (!event) {
      throw new Error(
        `[crisis-grant] Unknown crisis event: "${crisisId}". Register it first.`,
      );
    }
    if (!event.active) {
      throw new Error(
        `[crisis-grant] Crisis "${crisisId}" is no longer active.`,
      );
    }

    // Determine tier: default to "humanitarian" (Pro) for all active crises
    // In production, pass a category to the event and look up CRISIS_GRANT_TIERS
    const grantedTier = CRISIS_GRANT_TIERS["humanitarian"];

    const key = `${userId}:${crisisId}`;
    this.grants.set(key, {
      userId,
      crisisId,
      grantedTier,
      activatedAt: new Date().toISOString(),
      expiresAt: event.endsAt,
    });
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get the active crisis grant for a user, or null.
   * Returns the grant with the highest tier if multiple crises overlap.
   *
   * Повертає активний кризовий грант або null (якщо кілька — найвищий tier).
   */
  getActiveGrantForUser(userId: string): CrisisUserGrant | null {
    const now = new Date().toISOString();
    const userGrants = Array.from(this.grants.values()).filter(
      (g) =>
        g.userId === userId &&
        (g.expiresAt === null || g.expiresAt > now),
    );

    if (userGrants.length === 0) return null;

    // Return grant with the highest tier (simple: prefer "pro" > "observer" > "free")
    const tierRank: Record<string, number> = { pro: 3, observer: 2, free: 1 };
    return userGrants.sort(
      (a, b) => (tierRank[b.grantedTier] ?? 0) - (tierRank[a.grantedTier] ?? 0),
    )[0];
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory crisis grant store. */
export const crisisGrantStore = new CrisisGrantStore();

// ── Pre-seed the ongoing Ukraine conflict event ────────────────────────────────

crisisGrantStore.registerEvent({
  id: "ua-conflict-2022",
  name: "Ukraine Armed Conflict (2022–)",
  affectedCountryCodes: ["UA"],
  declaredAt: "2022-02-24T00:00:00.000Z",
  endsAt: null,
  active: true,
});
