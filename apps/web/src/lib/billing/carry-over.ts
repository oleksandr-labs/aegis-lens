/**
 * Carry-over — allows unused AI tokens to roll over to the next billing period.
 *
 * Only applies to the `ai-tokens` axis.
 * Maximum carry-over is 100% of the monthly quota (no stacking beyond that).
 * Carry-over from a previous period expires after 1 month if unused.
 *
 * Перенос невикористаних AI-токенів на наступний місяць (max 100% квоти, 1 місяць).
 */

import type { MeterAxis } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Meter axes for which carry-over is supported.
 *
 * Осі, для яких дозволено carry-over.
 */
export const CARRY_OVER_AXES: readonly MeterAxis[] = ["ai-tokens"] as const;

/**
 * Maximum carry-over as a fraction of the monthly quota.
 * 1.0 = 100% of the monthly quota may be carried forward.
 *
 * Максимальний відсоток квоти, що переноситься.
 */
export const CARRY_OVER_MAX_PCT = 1.0;

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single carry-over record stored per user+axis+target period. */
export interface CarryOverRecord {
  userId: string;
  axis: MeterAxis;
  /** YYYY-MM — the source period in which the surplus was generated */
  sourcePeriod: string;
  /** YYYY-MM — the period to which the surplus is carried */
  targetPeriod: string;
  /** Units carried over (already capped at CARRY_OVER_MAX_PCT × quota) */
  carriedUnits: number;
  /** Units from this carry-over that have already been consumed */
  consumedUnits: number;
  /** Whether this carry-over has been fully consumed or expired */
  exhausted: boolean;
}

// ── Period helpers ────────────────────────────────────────────────────────────

/** Returns `YYYY-MM` for the current UTC month. */
function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Returns the next `YYYY-MM` period after `period`. */
export function nextPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const next = new Date(Date.UTC(y, m, 1)); // m is already 0-indexed relative to split
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ── CarryOverStore ────────────────────────────────────────────────────────────

/**
 * Manages carry-over records per user and axis.
 * In production, persist to database. Here: in-memory singleton.
 *
 * Управляє записами carry-over. У продакшні зберігати в БД.
 */
export class CarryOverStore {
  /** All carry-over records, keyed by `${userId}:${axis}:${targetPeriod}` */
  private readonly records = new Map<string, CarryOverRecord>();

  private key(userId: string, axis: MeterAxis, targetPeriod: string): string {
    return `${userId}:${axis}:${targetPeriod}`;
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Create a carry-over record at period rollover.
   *
   * Call this when a billing period closes.  `unusedUnits` is the quota minus
   * the units consumed during `sourcePeriod`. The stored amount is capped at
   * `CARRY_OVER_MAX_PCT × monthlyQuota`.
   *
   * Створює запис carry-over при закритті periodу.
   */
  createCarryOver(
    userId: string,
    axis: MeterAxis,
    sourcePeriod: string,
    unusedUnits: number,
    monthlyQuota: number,
  ): CarryOverRecord | null {
    // Only supported axes.
    if (!(CARRY_OVER_AXES as readonly string[]).includes(axis)) return null;

    const capped = Math.min(unusedUnits, Math.floor(monthlyQuota * CARRY_OVER_MAX_PCT));
    if (capped <= 0) return null;

    const target = nextPeriod(sourcePeriod);
    const k = this.key(userId, axis, target);

    // If a record already exists (e.g. re-run), merge.
    const existing = this.records.get(k);
    if (existing && !existing.exhausted) {
      existing.carriedUnits = Math.min(
        existing.carriedUnits + capped,
        Math.floor(monthlyQuota * CARRY_OVER_MAX_PCT),
      );
      return existing;
    }

    const record: CarryOverRecord = {
      userId,
      axis,
      sourcePeriod,
      targetPeriod: target,
      carriedUnits: capped,
      consumedUnits: 0,
      exhausted: false,
    };
    this.records.set(k, record);
    return record;
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Get the active carry-over record for a user+axis in the current period.
   * Returns null if no carry-over exists or it is fully consumed.
   *
   * Повертає активний запис carry-over для поточного periodу.
   */
  getCarryOver(userId: string, axis: MeterAxis, period?: string): CarryOverRecord | null {
    const p = period ?? currentPeriod();
    const k = this.key(userId, axis, p);
    const r = this.records.get(k);
    if (!r || r.exhausted) return null;
    return r;
  }

  /**
   * Return remaining (unconsumed) carry-over units for the current period.
   *
   * Повертає залишок carry-over токенів у поточному periodі.
   */
  remaining(userId: string, axis: MeterAxis, period?: string): number {
    const r = this.getCarryOver(userId, axis, period);
    if (!r) return 0;
    return Math.max(0, r.carriedUnits - r.consumedUnits);
  }

  // ── Consume ───────────────────────────────────────────────────────────────

  /**
   * Consume `units` from the carry-over balance for the given period.
   * Returns the number of units actually consumed from carry-over
   * (may be less than `units` if carry-over is nearly exhausted).
   *
   * Витрачає одиниці з carry-over балансу.
   */
  consume(userId: string, axis: MeterAxis, units: number, period?: string): number {
    const r = this.getCarryOver(userId, axis, period);
    if (!r) return 0;
    const available = r.carriedUnits - r.consumedUnits;
    const toConsume = Math.min(units, available);
    r.consumedUnits += toConsume;
    if (r.consumedUnits >= r.carriedUnits) r.exhausted = true;
    return toConsume;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global carry-over store. */
export const carryOverStore = new CarryOverStore();
