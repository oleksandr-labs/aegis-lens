/**
 * Hard Cap — blocks requests for self-serve tiers when quota is exhausted
 * and the user has not opted into overage billing.
 *
 * Pro+ tiers that opt into overage are exempt.
 *
 * Жорсткий ліміт: блокує запити для self-serve тарифів без підключеного overage.
 */

import type { MeterAxis } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Tiers that are subject to hard-cap enforcement.
 * Pro+ and above are allowed to opt into overage billing.
 *
 * Тарифи, для яких діє жорсткий ліміт без явної згоди на overage.
 */
export const HARD_CAP_TIERS: readonly string[] = ["free", "observer", "pro"] as const;

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Per-tier hard-cap configuration. */
export interface HardCapConfig {
  tierId: string;
  /** Whether overage is allowed for this tier (requires opt-in flag on user). */
  overageAllowed: boolean;
  /** Hard-cap multiplier relative to the base quota (1.0 = exactly at quota). */
  capMultiplier: number;
}

/** Runtime hard-cap decision result. */
export interface HardCapDecision {
  blocked: boolean;
  tierId: string;
  axis: MeterAxis;
  requested: number;
  remaining: number;
  reason_en: string;
  reason_uk: string;
}

// ── HardCapExceededError ──────────────────────────────────────────────────────

/**
 * Thrown when a hard cap is exceeded and overage opt-in is absent.
 *
 * Кидається, коли жорсткий ліміт перевищено без згоди на overage.
 */
export class HardCapExceededError extends Error {
  public readonly tierId: string;
  public readonly axis: MeterAxis;
  public readonly requested: number;
  public readonly remaining: number;

  constructor(tierId: string, axis: MeterAxis, requested: number, remaining: number) {
    super(
      `[hard-cap] Tier "${tierId}" has exhausted axis "${axis}". ` +
        `Requested: ${requested}, remaining: ${remaining}. Enable overage opt-in to continue.`,
    );
    this.name = "HardCapExceededError";
    this.tierId = tierId;
    this.axis = axis;
    this.requested = requested;
    this.remaining = remaining;
  }
}

// ── Static config table ───────────────────────────────────────────────────────

const HARD_CAP_CONFIG: Record<string, HardCapConfig> = {
  free: { tierId: "free", overageAllowed: false, capMultiplier: 1.0 },
  observer: { tierId: "observer", overageAllowed: false, capMultiplier: 1.0 },
  pro: { tierId: "pro", overageAllowed: true, capMultiplier: 1.0 },
  pro_plus: { tierId: "pro_plus", overageAllowed: true, capMultiplier: 1.0 },
  team: { tierId: "team", overageAllowed: true, capMultiplier: 1.0 },
  business: { tierId: "business", overageAllowed: true, capMultiplier: 1.0 },
  enterprise: { tierId: "enterprise", overageAllowed: true, capMultiplier: 1.0 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true if the given tier is subject to hard-cap enforcement.
 *
 * Повертає true, якщо tier підпадає під жорстке обмеження.
 */
export function isHardCapped(tierId: string): boolean {
  return HARD_CAP_TIERS.includes(tierId);
}

// ── HardCapStore ──────────────────────────────────────────────────────────────

/**
 * Tracks per-user overage opt-in state and enforces hard caps.
 *
 * Відстежує стан підключення overage та застосовує жорсткі ліміти.
 */
export class HardCapStore {
  /** userId → has overage opt-in */
  private readonly overageOptIn = new Map<string, boolean>();

  // ── Opt-in management ─────────────────────────────────────────────────────

  /** Record that a user has opted into overage billing. */
  setOverageOptIn(userId: string, enabled: boolean): void {
    this.overageOptIn.set(userId, enabled);
  }

  /** Check whether a user has an active overage opt-in. */
  hasOverageOptIn(userId: string): boolean {
    return this.overageOptIn.get(userId) ?? false;
  }

  // ── Enforcement ───────────────────────────────────────────────────────────

  /**
   * Enforce the hard cap for a user.
   *
   * Logic:
   * - If tier is not hard-capped → allow.
   * - If tier is hard-capped and user opted into overage → allow.
   * - If tier is hard-capped and quota remaining >= requested → allow.
   * - Otherwise → throw HardCapExceededError.
   *
   * Застосовує жорсткий ліміт; кидає HardCapExceededError при порушенні.
   */
  enforceHardCap(
    userId: string,
    axis: MeterAxis,
    tierId: string,
    usedUnits: number,
    quotaUnits: number | null,
    requested: number,
  ): void {
    // Unlimited axis — always allow.
    if (quotaUnits === null) return;

    const config = HARD_CAP_CONFIG[tierId] ?? HARD_CAP_CONFIG["free"];
    const effectiveCap = quotaUnits * config.capMultiplier;
    const remaining = Math.max(0, effectiveCap - usedUnits);

    // Not hard-capped tier → pass through.
    if (!isHardCapped(tierId)) return;

    // User has opted into overage → allow (billing layer handles cost).
    if (this.hasOverageOptIn(userId) && config.overageAllowed) return;

    if (requested > remaining) {
      throw new HardCapExceededError(tierId, axis, requested, remaining);
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global hard-cap enforcement store. */
export const hardCapStore = new HardCapStore();
