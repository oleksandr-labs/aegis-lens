/**
 * Soft Cap — warns the user when they reach 100% of their quota.
 *
 * Fires a warning email + in-app banner. Does NOT block requests.
 * This runs after each metered action and is idempotent within a period.
 *
 * М'який ліміт: попереджає (email + банер) при досягненні 100% квоти, не блокує.
 */

import type { MeterAxis } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Ratio of quota at which the soft cap warning triggers. */
export const SOFT_CAP_THRESHOLD = 1.0;
// Поріг, при якому спрацьовує м'яке попередження.

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A soft-cap warning record returned when usage reaches the threshold. */
export interface SoftCapWarning {
  userId: string;
  axis: MeterAxis;
  /** YYYY-MM billing period */
  period: string;
  /** Current usage at the moment the warning was generated */
  usedUnits: number;
  /** Tier quota for this axis (null = unlimited, no warning generated) */
  quotaUnits: number;
  /** Ratio used / quota — will be >= SOFT_CAP_THRESHOLD */
  ratio: number;
  /** ISO 8601 timestamp when the warning was created */
  warnedAt: string;
  /** Whether a warning email has already been dispatched this period */
  emailSent: boolean;
  /** Whether the in-app banner is currently active */
  bannerActive: boolean;
}

// ── SoftCapStore ──────────────────────────────────────────────────────────────

/**
 * Stores soft-cap warning state per user+period+axis.
 * In production, persist to DB. Here: in-memory singleton.
 *
 * Зберігає стан попереджень по користувачу, periodу та осі.
 */
export class SoftCapStore {
  /** Key: `${userId}:${period}:${axis}` */
  private readonly warnings = new Map<string, SoftCapWarning>();

  private key(userId: string, period: string, axis: MeterAxis): string {
    return `${userId}:${period}:${axis}`;
  }

  // ── Core check ────────────────────────────────────────────────────────────

  /**
   * Evaluate whether the user has crossed the soft-cap threshold for `axis`.
   * Returns a `SoftCapWarning` if the threshold is met, otherwise `null`.
   *
   * If the warning was already recorded this period the existing record is
   * returned unchanged (idempotent).
   *
   * Перевіряє, чи перевищено поріг. Повертає попередження або null.
   */
  checkSoftCap(
    userId: string,
    axis: MeterAxis,
    usedUnits: number,
    quotaUnits: number | null,
    period: string,
  ): SoftCapWarning | null {
    // No limit on this axis — nothing to warn about.
    // Необмежена вісь — попередження не потрібне.
    if (quotaUnits === null || quotaUnits === 0) return null;

    const ratio = usedUnits / quotaUnits;
    if (ratio < SOFT_CAP_THRESHOLD) return null;

    const k = this.key(userId, period, axis);
    const existing = this.warnings.get(k);
    if (existing) return existing;

    const warning: SoftCapWarning = {
      userId,
      axis,
      period,
      usedUnits,
      quotaUnits,
      ratio,
      warnedAt: new Date().toISOString(),
      emailSent: false,
      bannerActive: true,
    };
    this.warnings.set(k, warning);
    return warning;
  }

  // ── Mark email sent ───────────────────────────────────────────────────────

  /**
   * Mark that the warning email has been dispatched so it is not re-sent.
   *
   * Позначає, що email вже відправлено.
   */
  markEmailSent(userId: string, axis: MeterAxis, period: string): void {
    const k = this.key(userId, period, axis);
    const w = this.warnings.get(k);
    if (w) w.emailSent = true;
  }

  // ── Dismiss banner ────────────────────────────────────────────────────────

  /**
   * Dismiss the in-app banner for this warning (user action).
   *
   * Приховує банер після дії користувача.
   */
  dismissBanner(userId: string, axis: MeterAxis, period: string): void {
    const k = this.key(userId, period, axis);
    const w = this.warnings.get(k);
    if (w) w.bannerActive = false;
  }

  // ── List active banners ───────────────────────────────────────────────────

  /**
   * Return all active banners for a given user.
   *
   * Повертає всі активні банери для користувача.
   */
  getActiveBanners(userId: string): SoftCapWarning[] {
    const result: SoftCapWarning[] = [];
    for (const w of this.warnings.values()) {
      if (w.userId === userId && w.bannerActive) result.push(w);
    }
    return result;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global soft-cap warning store. */
export const softCapStore = new SoftCapStore();

// ── Helper ─────────────────────────────────────────────────────────────────────

/**
 * Convenience wrapper: check soft cap and return a warning or null.
 *
 * Зручна обгортка: перевіряє ліміт і повертає попередження або null.
 */
export function checkSoftCap(
  userId: string,
  axis: MeterAxis,
  usedUnits: number,
  quotaUnits: number | null,
): SoftCapWarning | null {
  const d = new Date();
  const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return softCapStore.checkSoftCap(userId, axis, usedUnits, quotaUnits, period);
}
