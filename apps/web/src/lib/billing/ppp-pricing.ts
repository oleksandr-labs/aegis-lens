/**
 * Purchasing Power Parity (PPP) Pricing
 *
 * Adjusts subscription and pass prices for users in lower-income countries to
 * improve conversion and access equity. Discounts are applied at Checkout time.
 *
 * Корекція цін за паритетом купівельної спроможності (PPP) для покращення доступу.
 */

// ── PPP_COUNTRY_ADJUSTMENTS ────────────────────────────────────────────────────

/**
 * PPP adjustment factors per ISO 3166-1 alpha-2 country code.
 * A factor of 0.3 means the user pays 30% of the base USD price.
 *
 * Source: World Bank ICP data (2023 round), rounded to 2 decimal places.
 * Review and update annually against https://data.worldbank.org/indicator/PA.NUS.PPP
 *
 * Коефіцієнти знижки за країною. 0.3 = користувач платить 30% від базової ціни.
 * Джерело: Світовий банк, ICP 2023.
 */
export const PPP_COUNTRY_ADJUSTMENTS: Record<string, number> = {
  UA: 0.30, // Ukraine / Україна
  MD: 0.35, // Moldova / Молдова
  GE: 0.40, // Georgia / Грузія
  RO: 0.50, // Romania / Румунія
  PL: 0.60, // Poland / Польща
  BY: 0.30, // Belarus / Білорусь (same band as UA)
  AM: 0.40, // Armenia / Вірменія
  AZ: 0.45, // Azerbaijan / Азербайджан
  RS: 0.55, // Serbia / Сербія
  BA: 0.50, // Bosnia and Herzegovina / Боснія і Герцеговина
};

/**
 * Default factor for countries not listed (no PPP discount applied).
 * Країни поза списком не отримують знижки.
 */
export const PPP_DEFAULT_FACTOR = 1.0;

/**
 * Minimum factor floor: we never apply a discount deeper than 70% off.
 * Мінімальний коефіцієнт: знижка не перевищує 70%.
 */
export const PPP_FLOOR_FACTOR = 0.30;

// ── computePppPrice ────────────────────────────────────────────────────────────

/**
 * Compute the PPP-adjusted price for a given base price and country code.
 *
 * The returned price is rounded to the nearest cent.
 * If the country code is not found in PPP_COUNTRY_ADJUSTMENTS, the base price
 * is returned unchanged.
 *
 * Повертає скориговану ціну (у тих самих одиницях, що й basePrice), заокруглену до 0.01.
 * Якщо країна не у списку — повертає базову ціну без змін.
 */
export function computePppPrice(basePrice: number, countryCode: string): number {
  if (basePrice <= 0) return 0;

  const factor = PPP_COUNTRY_ADJUSTMENTS[countryCode.toUpperCase()] ?? PPP_DEFAULT_FACTOR;
  // Clamp to floor just in case the table contains erroneous low values
  const clampedFactor = Math.max(PPP_FLOOR_FACTOR, Math.min(1.0, factor));

  return Math.round(basePrice * clampedFactor * 100) / 100;
}

// ── getPppDiscountPercent ──────────────────────────────────────────────────────

/**
 * Return the discount percentage (0–70) for a country code.
 * 0 = no discount, 70 = maximum discount.
 *
 * Повертає відсоток знижки (0–70) для країни.
 */
export function getPppDiscountPercent(countryCode: string): number {
  const factor = PPP_COUNTRY_ADJUSTMENTS[countryCode.toUpperCase()] ?? PPP_DEFAULT_FACTOR;
  const clampedFactor = Math.max(PPP_FLOOR_FACTOR, Math.min(1.0, factor));
  return Math.round((1 - clampedFactor) * 100);
}
