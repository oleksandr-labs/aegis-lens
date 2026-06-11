/**
 * Day Pass / Event Pass / Crisis Pass system.
 *
 * Passes grant temporary elevated tier access for a fixed window.
 * They are one-off purchases (no recurring billing) and do not auto-renew.
 *
 * Pass — тимчасовий доступ вищого рівня. Одноразова покупка, без авто-поновлення.
 */

// ── Pass types ────────────────────────────────────────────────────────────────

export type PassType = "day-pass" | "event-pass" | "crisis-pass";

export interface Pass {
  id: string;
  userId: string;
  type: PassType;
  /** Tier granted for the duration of the pass */
  grantedTierId: string;
  /** ISO 8601 */
  validFrom: string;
  /** ISO 8601 */
  validUntil: string;
  /** Charged price in USD (0 for crisis-pass) */
  priceUsd: number;
  /** For event-pass: the named event or AOI identifier */
  eventId?: string;
  /** True once the pass has been used at least once */
  activated: boolean;
}

// ── Pass configuration ────────────────────────────────────────────────────────

export interface PassTypeConfig {
  /** Tier granted while the pass is active */
  grantedTierId: string;
  /** Pass window in hours */
  durationHours: number;
  /**
   * Allowed purchase price points in USD.
   * Checkout UI shows these as options; lowest = default for impulse buys.
   */
  priceUsdOptions: number[];
  /** Default / suggested price shown in checkout */
  defaultPriceUsd: number;
}

/**
 * Static config for each pass type.
 *
 * day-pass  : 24h full Pro access, $5–$14 range (default $9)
 * event-pass: 72h full Pro access, $19–$59 range (default $39)
 * crisis-pass: 48h, free for verified affected-region users
 *
 * Статична конфігурація кожного типу пасу.
 */
export const PassConfig: Record<PassType, PassTypeConfig> = {
  "day-pass": {
    grantedTierId: "pro",
    durationHours: 24,
    priceUsdOptions: [5, 7, 9, 12, 14],
    defaultPriceUsd: 9,
  },
  "event-pass": {
    grantedTierId: "pro",
    durationHours: 72,
    priceUsdOptions: [19, 29, 39, 49, 59],
    defaultPriceUsd: 39,
  },
  "crisis-pass": {
    grantedTierId: "pro",
    durationHours: 48,
    priceUsdOptions: [0],
    defaultPriceUsd: 0,
  },
};

// ── Pass Store ────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class PassStore {
  private readonly passes = new Map<string, Pass>(); // passId → Pass
  private readonly userIndex = new Map<string, string[]>(); // userId → passId[]

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Issue a new pass to a user.
   * The pass is immediately valid (validFrom = now).
   * Validates priceUsd against the allowed options for the pass type.
   *
   * Видає новий пас користувачу.
   */
  issue(
    userId: string,
    type: PassType,
    priceUsd: number,
    eventId?: string,
  ): Pass {
    const config = PassConfig[type];
    if (!config.priceUsdOptions.includes(priceUsd)) {
      throw new Error(
        `[passes] Invalid priceUsd ${priceUsd} for pass type "${type}". ` +
          `Allowed: ${config.priceUsdOptions.join(", ")}`,
      );
    }

    const now = new Date();
    const validUntil = new Date(
      now.getTime() + config.durationHours * 60 * 60 * 1000,
    );

    const pass: Pass = {
      id: generateId("pass"),
      userId,
      type,
      grantedTierId: config.grantedTierId,
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
      priceUsd,
      eventId,
      activated: false,
    };

    this.passes.set(pass.id, pass);

    const existing = this.userIndex.get(userId) ?? [];
    existing.push(pass.id);
    this.userIndex.set(userId, existing);

    return { ...pass };
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Returns the most recently issued pass that is currently valid for a user,
   * or null if no active pass exists.
   *
   * Повертає активний пас або null.
   */
  getActivePass(userId: string): Pass | null {
    const ids = this.userIndex.get(userId);
    if (!ids || ids.length === 0) return null;

    const now = new Date();

    // Iterate in reverse so we get the most recently issued pass first
    for (let i = ids.length - 1; i >= 0; i--) {
      const pass = this.passes.get(ids[i]);
      if (!pass) continue;
      const until = new Date(pass.validUntil);
      if (until > now) return { ...pass };
    }

    return null;
  }

  /** True if the user has any currently valid pass. */
  hasActivePass(userId: string): boolean {
    return this.getActivePass(userId) !== null;
  }

  /**
   * Mark a pass as activated (first use).
   * Idempotent — safe to call on an already-activated pass.
   */
  activate(passId: string): void {
    const pass = this.passes.get(passId);
    if (pass) {
      this.passes.set(passId, { ...pass, activated: true });
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory pass store. */
export const passStore = new PassStore();
