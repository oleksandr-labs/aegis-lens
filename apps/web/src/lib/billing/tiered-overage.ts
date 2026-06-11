/**
 * Tiered Overage Pricing — applies volume discounts as overage grows.
 *
 * Tier structure:
 *   - First 1× quota overage: list price (0% discount)
 *   - Next 2× quota overage: 25% discount
 *   - Beyond 3× quota overage: 50% discount
 *
 * Рівнева ціна overage: знижки збільшуються зі зростанням перевищення квоти.
 */

import type { MeterAxis } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Overage discount tiers.
 * `threshold` is the fraction of the base quota at which the tier starts
 * (e.g. 1.0 = from 100% overage, 2.0 = from 200% overage).
 * `discount` is the proportional reduction applied to basePrice (0 = full price).
 *
 * Тири знижок: threshold — кратність квоти, discount — знижка.
 */
export const OVERAGE_TIERS: ReadonlyArray<{ threshold: number; discount: number }> = [
  { threshold: 1.0, discount: 0 },       // list price up to 1× quota over
  { threshold: 2.0, discount: 0.25 },    // 25% off from 1×–2× quota over
  { threshold: Infinity, discount: 0.5 }, // 50% off beyond 2× quota over
] as const;

// ── Base prices per axis (USD per unit) ───────────────────────────────────────

/**
 * Default per-unit overage prices in USD.
 * Callers may pass their own basePrice instead.
 *
 * Базові ціни overage по осях.
 */
export const BASE_OVERAGE_PRICES: Partial<Record<MeterAxis, number>> = {
  "api-calls": 0.001,          // $1 / 1k
  "ai-tokens": 0.0005,         // $0.50 / 1k tokens
  "aoi-area-km2": 0.005,       // $0.005 / km²
  "export-rows": 0.00001,      // $1 / 100k rows
  "alert-deliveries": 0.0002,  // metered
  "satellite-scenes": 2.0,     // vendor passthrough stub
};

// ── computeOveragePrice ───────────────────────────────────────────────────────

/**
 * Compute the total USD cost for `unitsOver` overage units on a given axis,
 * applying the tiered discount schedule.
 *
 * @param axis        - The meter axis (used to look up default basePrice if omitted).
 * @param unitsOver   - Total overage units to price (must be >= 0).
 * @param basePrice   - USD cost per unit at list price. Defaults to BASE_OVERAGE_PRICES[axis].
 * @param quota       - The base quota (in units). Used to compute tier thresholds.
 *                      If 0 or omitted, each tier threshold is treated as an absolute
 *                      unit count equal to unitsOver × threshold.
 *
 * Returns the total overage cost in USD, rounded to 6 decimal places.
 *
 * Обчислює вартість overage з урахуванням рівневих знижок.
 */
export function computeOveragePrice(
  axis: MeterAxis,
  unitsOver: number,
  basePrice?: number,
  quota = 0,
): number {
  if (unitsOver <= 0) return 0;

  const unitPrice = basePrice ?? BASE_OVERAGE_PRICES[axis] ?? 0;
  if (unitPrice === 0) return 0;

  let totalCost = 0;
  let remaining = unitsOver;

  for (let i = 0; i < OVERAGE_TIERS.length; i++) {
    const tier = OVERAGE_TIERS[i];
    const nextTier = OVERAGE_TIERS[i + 1];

    // How many units fit in this tier band?
    // Band size = (nextThreshold - currentThreshold) × quota.
    // If quota = 0 we treat the whole overage in the first tier.
    let bandSize: number;
    if (quota <= 0) {
      bandSize = i === 0 ? Infinity : 0;
    } else {
      const nextThreshold = nextTier?.threshold ?? Infinity;
      bandSize =
        nextThreshold === Infinity
          ? Infinity
          : (nextThreshold - tier.threshold) * quota;
    }

    const unitsInBand = bandSize === Infinity ? remaining : Math.min(remaining, bandSize);
    const discountedPrice = unitPrice * (1 - tier.discount);
    totalCost += unitsInBand * discountedPrice;
    remaining -= unitsInBand;
    if (remaining <= 0) break;
  }

  return Math.round(totalCost * 1_000_000) / 1_000_000;
}
