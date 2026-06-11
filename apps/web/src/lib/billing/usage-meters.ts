/**
 * Usage Metering — per-user, per-period consumption tracking.
 *
 * Tracks billable axes: API calls, AI tokens, AOI area, export rows,
 * alert deliveries, satellite scenes. Integrates with the credits wallet
 * for overage billing and the tier enforcement layer for hard limits.
 *
 * Відстежує споживання ресурсів по осях. Інтегрується з wallet та tier enforcement.
 */

import { walletStore, CREDIT_UNIT_COSTS, assertSufficientCredits } from "./credits-wallet";
import { getTierForUser } from "./tier-enforcement";

// ── Axis types ────────────────────────────────────────────────────────────────

export type MeterAxis =
  | "api-calls"
  | "ai-tokens"
  | "aoi-area-km2"
  | "export-rows"
  | "alert-deliveries"
  | "satellite-scenes";

// ── Per-tier meter limits ─────────────────────────────────────────────────────

/**
 * Monthly meter limits per tier. null = unlimited (subject to credits wallet).
 *
 * Місячні ліміти по осях для кожного tier.
 */
const METER_LIMITS: Record<string, Record<MeterAxis, number | null>> = {
  anonymous: {
    "api-calls": 0,
    "ai-tokens": 0,
    "aoi-area-km2": 0,
    "export-rows": 0,
    "alert-deliveries": 0,
    "satellite-scenes": 0,
  },
  free: {
    "api-calls": 100,
    "ai-tokens": 10_000,
    "aoi-area-km2": 10_000,
    "export-rows": 0,
    "alert-deliveries": 30,
    "satellite-scenes": 0,
  },
  observer: {
    "api-calls": 1_000,
    "ai-tokens": 100_000,
    "aoi-area-km2": 100_000,
    "export-rows": 1_000,
    "alert-deliveries": 300,
    "satellite-scenes": 0,
  },
  pro: {
    "api-calls": 10_000,
    "ai-tokens": 1_000_000,
    "aoi-area-km2": null,
    "export-rows": 50_000,
    "alert-deliveries": 3_000,
    "satellite-scenes": 5,
  },
  pro_plus: {
    "api-calls": 50_000,
    "ai-tokens": 5_000_000,
    "aoi-area-km2": null,
    "export-rows": 250_000,
    "alert-deliveries": null,
    "satellite-scenes": 20,
  },
  team: {
    "api-calls": 100_000,
    "ai-tokens": null,
    "aoi-area-km2": null,
    "export-rows": 1_000_000,
    "alert-deliveries": null,
    "satellite-scenes": 50,
  },
  business: {
    "api-calls": 500_000,
    "ai-tokens": null,
    "aoi-area-km2": null,
    "export-rows": null,
    "alert-deliveries": null,
    "satellite-scenes": null,
  },
  enterprise: {
    "api-calls": null,
    "ai-tokens": null,
    "aoi-area-km2": null,
    "export-rows": null,
    "alert-deliveries": null,
    "satellite-scenes": null,
  },
};

// ── Map axis → credit cost key ────────────────────────────────────────────────

const AXIS_TO_CREDIT_KEY: Partial<Record<MeterAxis, string>> = {
  "api-calls": "api-call",
  "ai-tokens": "ai-token-1k",      // billed per 1k tokens
  "export-rows": "export-1k-rows", // billed per 1k rows
  "satellite-scenes": "satellite-scene",
};

// ── UsagePeriod ───────────────────────────────────────────────────────────────

export interface UsagePeriod {
  userId: string;
  /** YYYY-MM billing period key */
  period: string;
  meters: Record<MeterAxis, number>;
  limits: Record<MeterAxis, number | null>;
  overage: Record<MeterAxis, number>;
}

// ── UsageMeterStore ───────────────────────────────────────────────────────────

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function zeroed(): Record<MeterAxis, number> {
  return {
    "api-calls": 0,
    "ai-tokens": 0,
    "aoi-area-km2": 0,
    "export-rows": 0,
    "alert-deliveries": 0,
    "satellite-scenes": 0,
  };
}

export class UsageMeterStore {
  /** Keyed by `${userId}:${period}` */
  private readonly data = new Map<string, Record<MeterAxis, number>>();

  private key(userId: string, period: string): string {
    return `${userId}:${period}`;
  }

  private get(userId: string): Record<MeterAxis, number> {
    const k = this.key(userId, currentPeriod());
    if (!this.data.has(k)) {
      this.data.set(k, zeroed());
    }
    return this.data.get(k)!;
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Increment a usage meter for a user in the current period.
   *
   * Збільшує лічильник споживання.
   */
  increment(userId: string, axis: MeterAxis, amount: number): void {
    if (amount <= 0) return;
    const meters = this.get(userId);
    meters[axis] = (meters[axis] ?? 0) + amount;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get the full usage picture for the current period (synchronous snapshot).
   * Limits are fetched from the static METER_LIMITS table using the tier
   * last resolved by getTierForUser (cached in process memory — not real-time).
   *
   * For real-time limits, call checkAndBillOverage instead.
   *
   * Повертає поточне споживання та ліміти для користувача.
   */
  getUsage(userId: string, tierId = "free"): UsagePeriod {
    const meters = { ...this.get(userId) };
    const rawLimits = METER_LIMITS[tierId] ?? METER_LIMITS["free"];
    const limits: Record<MeterAxis, number | null> = { ...rawLimits };

    const overage: Record<MeterAxis, number> = zeroed();
    for (const axis of Object.keys(meters) as MeterAxis[]) {
      const limit = limits[axis];
      if (limit !== null && limit !== undefined) {
        overage[axis] = Math.max(0, meters[axis] - limit);
      }
    }

    return {
      userId,
      period: currentPeriod(),
      meters,
      limits,
      overage,
    };
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  /**
   * Reset all meters for the current period (call at period rollover).
   * In production, run this as a scheduled job at the start of each billing period.
   *
   * Скидає лічильники поточного periodу.
   */
  resetPeriod(userId: string): void {
    const k = this.key(userId, currentPeriod());
    this.data.set(k, zeroed());
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory usage meter store. */
export const usageMeterStore = new UsageMeterStore();

// ── checkAndBillOverage ───────────────────────────────────────────────────────

/**
 * Check whether `requested` units on `axis` are within the user's tier limit.
 * If within limit: increment the meter.
 * If over limit: attempt to debit credits from the wallet.
 * If no credits: throw InsufficientCreditsError (caller should return 402).
 * If tier has null limit (unlimited): increment without billing.
 *
 * Перевіряє ліміт. Якщо перевищено — списує кредити або кидає помилку.
 */
export async function checkAndBillOverage(
  userId: string,
  axis: MeterAxis,
  requested: number,
): Promise<void> {
  const tierId = await getTierForUser(userId);
  const limits = METER_LIMITS[tierId] ?? METER_LIMITS["free"];
  const limit = limits[axis];

  const currentUsage = usageMeterStore.getUsage(userId, tierId);
  const current = currentUsage.meters[axis] ?? 0;

  if (limit === null || limit === undefined) {
    // Unlimited on this tier — just meter it
    usageMeterStore.increment(userId, axis, requested);
    return;
  }

  const remaining = Math.max(0, limit - current);
  const overageAmount = Math.max(0, requested - remaining);

  if (overageAmount > 0) {
    // Compute credit cost for the overage
    const creditKey = AXIS_TO_CREDIT_KEY[axis];
    if (!creditKey) {
      // No overage billing defined for this axis → hard block
      throw new Error(
        `[usage-meters] Axis "${axis}" is at limit (${limit}) for tier "${tierId}" ` +
          `and has no overage billing. Request blocked.`,
      );
    }

    const unitCost = CREDIT_UNIT_COSTS[creditKey] ?? 1;
    // Normalise: ai-tokens billed per 1k, export-rows per 1k
    const billableUnits =
      creditKey === "ai-token-1k" || creditKey === "export-1k-rows"
        ? Math.ceil(overageAmount / 1000)
        : overageAmount;

    const totalCredits = billableUnits * unitCost;

    // Will throw InsufficientCreditsError if balance is too low
    assertSufficientCredits(userId, totalCredits);

    walletStore.debit(
      userId,
      totalCredits,
      `Overage: ${overageAmount} ${axis} (${totalCredits} credits)`,
    );
  }

  usageMeterStore.increment(userId, axis, requested);
}
