/**
 * Annual & biennial discount computation.
 *
 * Policy: lock in the price paid at signup — we never raise it on existing
 * subscribers. If we lower prices or run experiments, the lower price applies.
 *
 * Правило: ціна фіксується при підписці. Ніколи не підвищується для наявних.
 */

import type { BillingPeriod } from "./types";

// ── Discount rates ────────────────────────────────────────────────────────────

/** Annual subscription discount relative to equivalent 12 × monthly. */
export const ANNUAL_DISCOUNT_PCT = 0.2; // 20%

/** Biennial subscription discount relative to equivalent 24 × monthly. */
export const BIENNIAL_DISCOUNT_PCT = 0.3; // 30%

// ── Price computation ─────────────────────────────────────────────────────────

/**
 * Compute the total price for a billing period given a base monthly price.
 *
 * Returns the full amount charged upfront for the period (not per-month).
 *
 * @param monthlyPriceUsd  List monthly price in USD
 * @param period           Target billing period
 * @returns                Total upfront charge in USD (2 decimal places)
 *
 * Обчислює загальну вартість для обраного periodу.
 */
export function computePeriodPrice(
  monthlyPriceUsd: number,
  period: BillingPeriod,
): number {
  switch (period) {
    case "monthly":
      return parseFloat(monthlyPriceUsd.toFixed(2));
    case "annual": {
      const gross = monthlyPriceUsd * 12;
      const discounted = gross * (1 - ANNUAL_DISCOUNT_PCT);
      return parseFloat(discounted.toFixed(2));
    }
    case "biennial": {
      const gross = monthlyPriceUsd * 24;
      const discounted = gross * (1 - BIENNIAL_DISCOUNT_PCT);
      return parseFloat(discounted.toFixed(2));
    }
  }
}

/**
 * Effective monthly rate when paying for a given period.
 * Useful for "billed annually at $X/mo" UI copy.
 *
 * Місячна ставка при обраному periodі (для UI).
 */
export function effectiveMonthlyRate(
  monthlyPriceUsd: number,
  period: BillingPeriod,
): number {
  switch (period) {
    case "monthly":
      return parseFloat(monthlyPriceUsd.toFixed(2));
    case "annual":
      return parseFloat((computePeriodPrice(monthlyPriceUsd, "annual") / 12).toFixed(2));
    case "biennial":
      return parseFloat((computePeriodPrice(monthlyPriceUsd, "biennial") / 24).toFixed(2));
  }
}

// ── Badge copy ────────────────────────────────────────────────────────────────

/**
 * Return a short discount badge string for the pricing UI.
 *
 * @example
 *   formatDiscountBadge("annual", "en")   // "Save 20%"
 *   formatDiscountBadge("annual", "uk")   // "Знижка 20%"
 *   formatDiscountBadge("monthly", "en")  // ""
 *
 * Рядок для значка знижки на сторінці цін.
 */
export function formatDiscountBadge(
  period: BillingPeriod,
  locale: "en" | "uk",
): string {
  if (period === "monthly") return "";

  const pct =
    period === "annual"
      ? Math.round(ANNUAL_DISCOUNT_PCT * 100)
      : Math.round(BIENNIAL_DISCOUNT_PCT * 100);

  return locale === "uk" ? `Знижка ${pct}%` : `Save ${pct}%`;
}

// ── Price-lock / grandfathering policy ────────────────────────────────────────

/**
 * Public-facing grandfathering promise shown on the pricing page and in
 * upgrade confirmation emails.
 *
 * Публічна обіцянка фіксації ціни — на сторінці цін та в email підтвердження.
 */
export const PRICE_LOCK_POLICY_EN =
  "Your price is locked in for as long as you keep your subscription active. " +
  "If we ever lower the price for your plan, you'll automatically get the lower rate. " +
  "We will never raise the price on your existing subscription without giving you " +
  "at least 90 days' notice and the option to cancel penalty-free.";

export const PRICE_LOCK_POLICY_UK =
  "Ваша ціна фіксується на весь термін активної підписки. " +
  "Якщо ми знизимо ціну вашого плану, ви автоматично отримаєте нижчу ставку. " +
  "Ми ніколи не підвищимо ціну наявної підписки без повідомлення щонайменше за 90 днів " +
  "та можливості скасувати без штрафних санкцій.";
