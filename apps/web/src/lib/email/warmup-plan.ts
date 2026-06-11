/**
 * IP warm-up plan for email sending pools.
 *
 * New IPs must be warmed gradually to build a positive sending reputation.
 * ISPs (Gmail, Outlook, Yahoo) monitor patterns on new IPs:
 *   - Sudden high volume = spam flag.
 *   - Gradual increase with high engagement = trusted sender.
 *
 * Schedule overview:
 *   Day 1–3:   50 emails / day   (manual / hand-picked engaged recipients)
 *   Day 4–7:   200 emails / day  (confirmed opted-in list)
 *   Day 8–14:  1 000 emails / day
 *   Day 15–21: 5 000 emails / day
 *   Day 22–30: 20 000 emails / day
 *   Day 30+:   Full volume (monitor Postmaster Tools daily)
 *
 * Крок розгону нових IP-адрес: поступове збільшення обсягу розсилки
 * протягом 30 днів для побудови репутації відправника.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WarmupDay {
  /** Day number in the warm-up schedule (1-indexed). */
  day: number;
  /** Maximum emails that may be sent on this day across all listed pools. */
  maxVolume: number;
  /** Pool IDs covered by this day's limits. */
  pools: string[];
}

export interface WarmupStatus {
  /** The pool being tracked. */
  poolId: string;
  /** ISO date string when warm-up started (day 1). */
  startDate: string;
  /** How many days have elapsed since startDate (1-indexed). */
  currentDay: number;
  /** Volume cap for today. */
  todayLimit: number;
  /** True when the pool has completed the 30-day schedule. */
  isWarmedUp: boolean;
}

// ── 30-day schedule ───────────────────────────────────────────────────────────

/**
 * Full 30-day warm-up schedule.
 *
 * The schedule covers all four pools in parallel because they are independent
 * IP addresses. Each pool starts on its own startDate (see WarmupStatus).
 *
 * pools: ['*'] means the limit applies to any pool at that stage.
 */
export const WARMUP_SCHEDULE: WarmupDay[] = [
  // Phase 1: gentle start (days 1–3)
  { day: 1, maxVolume: 50, pools: ["*"] },
  { day: 2, maxVolume: 50, pools: ["*"] },
  { day: 3, maxVolume: 50, pools: ["*"] },

  // Phase 2: early ramp (days 4–7)
  { day: 4, maxVolume: 200, pools: ["*"] },
  { day: 5, maxVolume: 200, pools: ["*"] },
  { day: 6, maxVolume: 200, pools: ["*"] },
  { day: 7, maxVolume: 200, pools: ["*"] },

  // Phase 3: mid ramp (days 8–14)
  { day: 8, maxVolume: 1_000, pools: ["*"] },
  { day: 9, maxVolume: 1_000, pools: ["*"] },
  { day: 10, maxVolume: 1_000, pools: ["*"] },
  { day: 11, maxVolume: 1_000, pools: ["*"] },
  { day: 12, maxVolume: 1_000, pools: ["*"] },
  { day: 13, maxVolume: 1_000, pools: ["*"] },
  { day: 14, maxVolume: 1_000, pools: ["*"] },

  // Phase 4: high ramp (days 15–21)
  { day: 15, maxVolume: 5_000, pools: ["*"] },
  { day: 16, maxVolume: 5_000, pools: ["*"] },
  { day: 17, maxVolume: 5_000, pools: ["*"] },
  { day: 18, maxVolume: 5_000, pools: ["*"] },
  { day: 19, maxVolume: 5_000, pools: ["*"] },
  { day: 20, maxVolume: 5_000, pools: ["*"] },
  { day: 21, maxVolume: 5_000, pools: ["*"] },

  // Phase 5: full ramp (days 22–30)
  { day: 22, maxVolume: 20_000, pools: ["*"] },
  { day: 23, maxVolume: 20_000, pools: ["*"] },
  { day: 24, maxVolume: 20_000, pools: ["*"] },
  { day: 25, maxVolume: 20_000, pools: ["*"] },
  { day: 26, maxVolume: 20_000, pools: ["*"] },
  { day: 27, maxVolume: 20_000, pools: ["*"] },
  { day: 28, maxVolume: 20_000, pools: ["*"] },
  { day: 29, maxVolume: 20_000, pools: ["*"] },
  { day: 30, maxVolume: 20_000, pools: ["*"] },
];

/** Total number of warm-up days. */
export const WARMUP_DURATION_DAYS = 30;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the number of calendar days elapsed between two ISO date strings.
 * @param from - ISO date (YYYY-MM-DD or full ISO).
 * @param to   - ISO date (YYYY-MM-DD or full ISO).
 * @returns Days elapsed (minimum 1, never negative).
 */
function daysBetween(from: string, to: string): number {
  const msPerDay = 86_400_000;
  const start = new Date(from).setHours(0, 0, 0, 0);
  const end = new Date(to).setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((end - start) / msPerDay) + 1);
}

/**
 * Computes the current warm-up status for a pool.
 *
 * @param poolId    - The pool identifier (e.g. "transactional").
 * @param startDate - ISO date when warm-up began for this pool.
 * @param today     - ISO date to evaluate against (defaults to now).
 * @returns WarmupStatus including today's volume limit.
 *
 * Обчислює поточний статус розгону для пулу.
 */
export function computeWarmupStatus(
  poolId: string,
  startDate: string,
  today: string,
): WarmupStatus {
  const currentDay = daysBetween(startDate, today);
  const isWarmedUp = currentDay > WARMUP_DURATION_DAYS;

  const schedule = WARMUP_SCHEDULE.find((s) => s.day === Math.min(currentDay, WARMUP_DURATION_DAYS));
  const todayLimit = isWarmedUp ? Infinity : (schedule?.maxVolume ?? 50);

  return {
    poolId,
    startDate,
    currentDay,
    todayLimit,
    isWarmedUp,
  };
}

/**
 * Convenience predicate: returns true if the warm-up schedule is complete.
 *
 * Повертає true, якщо 30-денний розгон завершено.
 */
export function isWarmupComplete(
  poolId: string,
  startDate: string,
  today: string,
): boolean {
  return computeWarmupStatus(poolId, startDate, today).isWarmedUp;
}

/**
 * Returns the volume limit for a given calendar day number (1–30).
 * Returns Infinity for day > 30 (warmed up).
 */
export function getLimitForDay(day: number): number {
  if (day > WARMUP_DURATION_DAYS) return Infinity;
  return WARMUP_SCHEDULE.find((s) => s.day === day)?.maxVolume ?? 50;
}
