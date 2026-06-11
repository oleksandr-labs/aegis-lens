/**
 * Burst Allowance — allows Pro+ users to exceed their rate limit
 * for short windows (up to 1 hour) at up to 3× their normal rate,
 * with no extra fee.
 *
 * Burst-дозвіл: Pro+ можуть перевищити ліміт у 3× на 1 годину без доплати.
 */

import type { MeterAxis } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Tiers eligible for burst allowance. */
export const BURST_ELIGIBLE_TIERS: readonly string[] = [
  "pro_plus",
  "team",
  "business",
  "enterprise",
] as const;
// Тарифи, яким дозволено burst.

/** Maximum burst multiplier (3× the base rate). */
export const BURST_MULTIPLIER = 3;
// Максимальний множник burst.

/** Duration of a burst window in milliseconds (1 hour). */
export const BURST_WINDOW_MS = 3_600_000;
// Тривалість burst-вікна в мілісекундах (1 година).

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Tracks an active burst window for a user+axis. */
export interface BurstWindow {
  userId: string;
  axis: MeterAxis;
  /** ISO 8601 — when the burst window started */
  startedAt: string;
  /** Epoch ms — window expires at startedAt + BURST_WINDOW_MS */
  expiresAtMs: number;
  /** Units consumed during this burst window */
  burstUnitsUsed: number;
  /** Maximum units allowed in this window (base rate × BURST_MULTIPLIER) */
  burstUnitsCap: number;
}

// ── BurstStore ────────────────────────────────────────────────────────────────

/**
 * Manages burst windows per user and meter axis.
 *
 * Управляє burst-вікнами по користувачу та осі.
 */
export class BurstStore {
  /** Key: `${userId}:${axis}` */
  private readonly windows = new Map<string, BurstWindow>();

  private key(userId: string, axis: MeterAxis): string {
    return `${userId}:${axis}`;
  }

  // ── Eligibility ───────────────────────────────────────────────────────────

  /**
   * Check whether a tier is eligible for burst allowance.
   *
   * Перевіряє, чи tier має право на burst.
   */
  isBurstEligible(tierId: string): boolean {
    return BURST_ELIGIBLE_TIERS.includes(tierId);
  }

  // ── Window management ─────────────────────────────────────────────────────

  /**
   * Retrieve the active burst window for a user+axis, or null if expired/absent.
   *
   * Повертає активне burst-вікно або null, якщо воно відсутнє чи закінчилося.
   */
  getWindow(userId: string, axis: MeterAxis): BurstWindow | null {
    const k = this.key(userId, axis);
    const w = this.windows.get(k);
    if (!w) return null;
    if (Date.now() > w.expiresAtMs) {
      this.windows.delete(k);
      return null;
    }
    return w;
  }

  /**
   * Open a new burst window for a user+axis with the given base-rate cap.
   *
   * Відкриває нове burst-вікно для користувача та осі.
   */
  openWindow(userId: string, axis: MeterAxis, baseRateCap: number): BurstWindow {
    const now = Date.now();
    const window: BurstWindow = {
      userId,
      axis,
      startedAt: new Date(now).toISOString(),
      expiresAtMs: now + BURST_WINDOW_MS,
      burstUnitsUsed: 0,
      burstUnitsCap: baseRateCap * BURST_MULTIPLIER,
    };
    this.windows.set(this.key(userId, axis), window);
    return window;
  }

  // ── canBurst ──────────────────────────────────────────────────────────────

  /**
   * Returns true if the user can burst (eligible tier AND within window cap).
   *
   * Повертає true, якщо burst можливий (tier підходить і не вичерпано вікно).
   */
  canBurst(
    userId: string,
    axis: MeterAxis,
    tierId: string,
    baseRateCap: number,
    requestedUnits: number,
  ): boolean {
    if (!this.isBurstEligible(tierId)) return false;

    let w = this.getWindow(userId, axis);
    if (!w) {
      w = this.openWindow(userId, axis, baseRateCap);
    }

    return w.burstUnitsUsed + requestedUnits <= w.burstUnitsCap;
  }

  // ── Record burst usage ────────────────────────────────────────────────────

  /**
   * Record that `units` were consumed during the current burst window.
   * Call this after confirming canBurst returns true.
   *
   * Фіксує витрати в поточному burst-вікні.
   */
  recordBurstUsage(userId: string, axis: MeterAxis, units: number): void {
    const w = this.getWindow(userId, axis);
    if (w) w.burstUnitsUsed += units;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global burst allowance store. */
export const burstStore = new BurstStore();
