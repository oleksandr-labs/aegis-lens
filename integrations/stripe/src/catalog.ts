/**
 * Product + price catalog — tier → Stripe product/price model.
 *
 * Task: "Products + prices for each tier" (public/registered/pro/enterprise).
 *
 * This is a typed, declarative catalog. Stripe product/price IDs are environment
 * specific and are read from process.env at runtime (see COMPLIANCE.md); the
 * `priceId(...)` resolver fills them in so no live IDs are hardcoded.
 *
 * Each paid tier has a recurring base price per currency PLUS metered add-on
 * prices (see metered-billing.ts) attached to the same subscription.
 */

import type { BillingTier, Currency, I18nString } from "./types";
import { PRIMARY_CURRENCY } from "./types";

export type BillingInterval = "month" | "year";

/** A recurring base price for one (tier, currency, interval) combination. */
export interface PriceDef {
  currency: Currency;
  interval: BillingInterval;
  /** Amount in minor units (cents/kopiyky). */
  unitAmount: number;
  /**
   * Env var holding the live Stripe price ID for this combination, e.g.
   * STRIPE_PRICE_PRO_USD_MONTH. Resolved at runtime, never hardcoded.
   */
  priceIdEnv: string;
}

export interface ProductDef {
  tier: BillingTier;
  /** Stable lookup key + env var stem, e.g. STRIPE_PRODUCT_PRO. */
  productIdEnv: string;
  name: I18nString;
  description: I18nString;
  /** Whether this tier is purchasable via self-service checkout. */
  selfServe: boolean;
  /** Trial length in days for new subscriptions (0 = no trial). */
  trialDays: number;
  /** Recurring base prices. Empty for free/public tiers. */
  prices: PriceDef[];
  /** Feature highlights for pricing UI (bilingual). */
  features: I18nString[];
}

const priceEnv = (tier: string, cur: Currency, interval: BillingInterval): string =>
  `STRIPE_PRICE_${tier.toUpperCase()}_${cur.toUpperCase()}_${interval.toUpperCase()}`;

/** Build a per-currency price set for a tier from a USD-anchored amount map. */
function pricesFor(
  tier: BillingTier,
  monthly: Record<Currency, number>,
  yearly: Record<Currency, number>,
): PriceDef[] {
  const out: PriceDef[] = [];
  (Object.keys(monthly) as Currency[]).forEach((cur) => {
    out.push({ currency: cur, interval: "month", unitAmount: monthly[cur], priceIdEnv: priceEnv(tier, cur, "month") });
    out.push({ currency: cur, interval: "year", unitAmount: yearly[cur], priceIdEnv: priceEnv(tier, cur, "year") });
  });
  return out;
}

export const CATALOG: Record<BillingTier, ProductDef> = {
  public: {
    tier: "public",
    productIdEnv: "STRIPE_PRODUCT_PUBLIC",
    name: { en: "Public", uk: "Публічний" },
    description: {
      en: "Anonymous, read-only access to public OSINT layers. No account required.",
      uk: "Анонімний доступ лише для читання до публічних OSINT-шарів. Обліковий запис не потрібен.",
    },
    selfServe: false,
    trialDays: 0,
    prices: [],
    features: [
      { en: "Public event layers", uk: "Публічні шари подій" },
      { en: "Rate-limited API", uk: "API з обмеженням швидкості" },
    ],
  },
  registered: {
    tier: "registered",
    productIdEnv: "STRIPE_PRODUCT_REGISTERED",
    name: { en: "Registered (Free)", uk: "Зареєстрований (безкоштовно)" },
    description: {
      en: "Free authenticated tier: saved AOIs, basic alerts, modest included usage.",
      uk: "Безкоштовний авторизований рівень: збережені AOI, базові сповіщення, помірний включений обсяг.",
    },
    selfServe: false,
    trialDays: 0,
    prices: [],
    features: [
      { en: "Saved AOIs & basic alerts", uk: "Збережені AOI та базові сповіщення" },
      { en: "Included monthly API/AI quota", uk: "Включена місячна квота API/AI" },
    ],
  },
  pro: {
    tier: "pro",
    productIdEnv: "STRIPE_PRODUCT_PRO",
    name: { en: "Pro", uk: "Pro" },
    description: {
      en: "For analysts and small teams: bulk export, classified layers, metered overage.",
      uk: "Для аналітиків і малих команд: масовий експорт, закриті шари, оплата понад ліміт.",
    },
    selfServe: true,
    trialDays: 14,
    // Amounts in minor units. USD primary; EUR/UAH/GBP localized (not FX-derived).
    prices: pricesFor(
      "pro",
      { usd: 4900, eur: 4900, uah: 199000, gbp: 3900 },
      { usd: 49000, eur: 49000, uah: 1990000, gbp: 39000 },
    ),
    features: [
      { en: "Bulk export (>1000 rows)", uk: "Масовий експорт (>1000 рядків)" },
      { en: "Classified/tactical layers", uk: "Закриті/тактичні шари" },
      { en: "Pay-as-you-go overage", uk: "Оплата за фактом понад ліміт" },
    ],
  },
  enterprise: {
    tier: "enterprise",
    productIdEnv: "STRIPE_PRODUCT_ENTERPRISE",
    name: { en: "Enterprise", uk: "Enterprise" },
    description: {
      en: "Negotiated contracts, SSO, dedicated quotas, custom SLAs and invoicing.",
      uk: "Договірні умови, SSO, виділені квоти, індивідуальні SLA та інвойсинг.",
    },
    selfServe: false,
    trialDays: 0,
    // Enterprise is sales-led; price IDs are created per-contract in Stripe.
    prices: pricesFor(
      "enterprise",
      { usd: 99900, eur: 99900, uah: 3990000, gbp: 79900 },
      { usd: 999000, eur: 999000, uah: 39900000, gbp: 799000 },
    ),
    features: [
      { en: "SSO & dedicated quotas", uk: "SSO та виділені квоти" },
      { en: "Custom SLA & invoicing", uk: "Індивідуальні SLA та інвойсинг" },
      { en: "Negotiated overage terms", uk: "Договірні умови понад ліміт" },
    ],
  },
};

/** Resolve a live Stripe price ID for a (tier, currency, interval) from env. */
export function priceId(
  tier: BillingTier,
  interval: BillingInterval,
  currency: Currency = PRIMARY_CURRENCY,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const def = CATALOG[tier].prices.find(
    (p) => p.currency === currency && p.interval === interval,
  );
  if (!def) return undefined;
  return env[def.priceIdEnv];
}

/** Resolve a live Stripe product ID for a tier from env. */
export function productId(
  tier: BillingTier,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env[CATALOG[tier].productIdEnv];
}

/** Reverse mapping: price ID → tier. Used by webhook tier reconciliation. */
export function tierFromPriceId(
  priceIdValue: string,
  env: NodeJS.ProcessEnv = process.env,
): BillingTier | undefined {
  for (const def of Object.values(CATALOG)) {
    for (const p of def.prices) {
      if (env[p.priceIdEnv] && env[p.priceIdEnv] === priceIdValue) return def.tier;
    }
  }
  // Heuristic fallback (mirrors the webhook route's string match).
  if (priceIdValue.includes("enterprise")) return "enterprise";
  if (priceIdValue.includes("pro")) return "pro";
  return undefined;
}

/** Tiers that can be purchased via self-service checkout/portal. */
export function selfServeTiers(): BillingTier[] {
  return (Object.keys(CATALOG) as BillingTier[]).filter((t) => CATALOG[t].selfServe);
}
