/**
 * API Pricing Widget — tier definitions, cost calculation, and React component prop types.
 *
 * Three tiers:
 *   - Starter:    10 k calls/mo @ $49/mo, overages $0.005/call
 *   - Growth:    100 k calls/mo @ $299/mo, overages $0.003/call
 *   - Enterprise: unlimited,    custom pricing
 *
 * Віджет ціноутворення API: визначення рівнів, розрахунок вартості та типи для React.
 */

// ── Tier name union ────────────────────────────────────────────────────────────

export type ApiPricingTier = "starter" | "growth" | "enterprise";

// ── Tier definition ────────────────────────────────────────────────────────────

export interface ApiTierBase {
  /** Machine-readable identifier */
  tier: ApiPricingTier;
  /** Display name */
  name_en: string;
  name_uk: string;
  /** Monthly base price in USD; null = custom enterprise */
  pricePerMonth: number | null;
  /** Whether this tier requires a sales conversation */
  custom: boolean;
  /** Overage rate in USD per additional call; null = not applicable */
  overagePerCall: number | null;
  /** Short description */
  description_en: string;
  description_uk: string;
  /** Highlighted features for the pricing card */
  features_en: string[];
  features_uk: string[];
}

export interface ApiTierFixed extends ApiTierBase {
  callsPerMonth: number;
  unlimited: false;
  custom: false;
  pricePerMonth: number;
  overagePerCall: number;
}

export interface ApiTierEnterprise extends ApiTierBase {
  callsPerMonth: null;
  unlimited: true;
  custom: true;
  pricePerMonth: null;
  overagePerCall: null;
}

export type ApiTierConfig = ApiTierFixed | ApiTierEnterprise;

// ── Tier catalog ──────────────────────────────────────────────────────────────

/**
 * Canonical API pricing tier definitions.
 * Source of truth for the pricing page widget and the API dashboard.
 *
 * Канонічні визначення рівнів API-ціноутворення.
 */
export const API_PRICING_TIERS: Record<ApiPricingTier, ApiTierConfig> = {
  starter: {
    tier: "starter",
    name_en: "Starter",
    name_uk: "Стартер",
    callsPerMonth: 10_000,
    unlimited: false,
    custom: false,
    pricePerMonth: 49,
    overagePerCall: 0.005,
    description_en:
      "Ideal for individual developers and small projects exploring the Aegis Lens API.",
    description_uk:
      "Ідеально для індивідуальних розробників та невеликих проєктів, що досліджують API Aegis Lens.",
    features_en: [
      "10,000 API calls/month",
      "$0.005 per extra call",
      "REST + streaming endpoints",
      "JSON & GeoJSON output",
      "Standard rate limit (60 req/min)",
      "Community support",
    ],
    features_uk: [
      "10 000 API-викликів/місяць",
      "$0.005 за додатковий виклик",
      "REST + стрімінгові ендпоінти",
      "Вивід JSON та GeoJSON",
      "Стандартний rate limit (60 зап/хв)",
      "Підтримка спільноти",
    ],
  },

  growth: {
    tier: "growth",
    name_en: "Growth",
    name_uk: "Зростання",
    callsPerMonth: 100_000,
    unlimited: false,
    custom: false,
    pricePerMonth: 299,
    overagePerCall: 0.003,
    description_en:
      "For teams and products that need higher throughput and priority access.",
    description_uk:
      "Для команд та продуктів, яким потрібна вища пропускна здатність та пріоритетний доступ.",
    features_en: [
      "100,000 API calls/month",
      "$0.003 per extra call",
      "REST, streaming, and WebSocket endpoints",
      "JSON, GeoJSON, CSV & Parquet output",
      "Higher rate limit (300 req/min)",
      "Webhook delivery",
      "Priority email support",
      "Usage dashboard",
    ],
    features_uk: [
      "100 000 API-викликів/місяць",
      "$0.003 за додатковий виклик",
      "REST, стрімінг та WebSocket ендпоінти",
      "Вивід JSON, GeoJSON, CSV та Parquet",
      "Вищий rate limit (300 зап/хв)",
      "Доставка через вебхук",
      "Пріоритетна підтримка по email",
      "Панель використання",
    ],
  },

  enterprise: {
    tier: "enterprise",
    name_en: "Enterprise",
    name_uk: "Корпоративний",
    callsPerMonth: null,
    unlimited: true,
    custom: true,
    pricePerMonth: null,
    overagePerCall: null,
    description_en:
      "Unlimited volume, dedicated infrastructure, SLA-backed, and custom contract pricing.",
    description_uk:
      "Необмежений обсяг, виділена інфраструктура, SLA-гарантії та кастомне контрактне ціноутворення.",
    features_en: [
      "Unlimited API calls",
      "Dedicated rate-limit lane",
      "All output formats + raw archive",
      "Custom SLA (99.9% uptime guaranteed)",
      "Dedicated CSM + 24×7 support",
      "On-premise / private-cloud option",
      "Custom data retention",
      "SSO + SCIM provisioning",
    ],
    features_uk: [
      "Необмежена кількість API-викликів",
      "Виділений rate-limit канал",
      "Всі формати виводу + сировинний архів",
      "Кастомний SLA (гарантований uptime 99.9%)",
      "Виділений CSM + підтримка 24×7",
      "Варіант on-premise / приватного хмари",
      "Кастомне зберігання даних",
      "SSO + SCIM-provisioning",
    ],
  },
};

// ── Cost calculation ───────────────────────────────────────────────────────────

export interface ApiCostResult {
  /** Selected tier */
  tier: ApiPricingTier;
  /** Calls requested per month */
  callsPerMonth: number;
  /** Monthly base price in USD (0 for enterprise before negotiation) */
  baseCostUsd: number;
  /** Overage calls beyond the included quota */
  overageCalls: number;
  /** Cost of overage calls in USD */
  overageCostUsd: number;
  /** Total estimated monthly cost in USD */
  totalCostUsd: number;
  /** Effective cost per call (total ÷ calls) */
  effectiveCostPerCall: number;
  /** Whether the enterprise tier was selected (custom pricing applies) */
  isCustomPricing: boolean;
}

/**
 * Calculate the monthly API cost for a given call volume and tier.
 *
 * For the enterprise tier this returns indicative numbers only —
 * actual pricing is negotiated. `isCustomPricing` will be `true`.
 *
 * @param callsPerMonth  Expected API calls per month (must be ≥ 0)
 * @param tier           Target API pricing tier
 *
 * Розраховує місячну вартість API для заданого обсягу викликів та рівня.
 */
export function calculateApiCost(
  callsPerMonth: number,
  tier: ApiPricingTier,
): ApiCostResult {
  if (callsPerMonth < 0) {
    throw new RangeError(
      `[api-pricing-widget] callsPerMonth must be ≥ 0, got ${callsPerMonth}`,
    );
  }

  const config = API_PRICING_TIERS[tier];

  // ── Enterprise: custom pricing, return indicative zero ────────────────────
  if (config.custom) {
    return {
      tier,
      callsPerMonth,
      baseCostUsd: 0,
      overageCalls: 0,
      overageCostUsd: 0,
      totalCostUsd: 0,
      effectiveCostPerCall: 0,
      isCustomPricing: true,
    };
  }

  const fixedConfig = config as ApiTierFixed;
  const baseCostUsd = fixedConfig.pricePerMonth;
  const included = fixedConfig.callsPerMonth;
  const overageCalls = Math.max(0, callsPerMonth - included);
  const overageCostUsd =
    Math.round(overageCalls * fixedConfig.overagePerCall * 100) / 100;
  const totalCostUsd =
    Math.round((baseCostUsd + overageCostUsd) * 100) / 100;
  const effectiveCostPerCall =
    callsPerMonth > 0
      ? Math.round((totalCostUsd / callsPerMonth) * 1_000_000) / 1_000_000
      : 0;

  return {
    tier,
    callsPerMonth,
    baseCostUsd,
    overageCalls,
    overageCostUsd,
    totalCostUsd,
    effectiveCostPerCall,
    isCustomPricing: false,
  };
}

/**
 * Given a call volume, return the most cost-effective tier recommendation.
 *
 * Повертає рекомендований рівень для заданого обсягу викликів.
 */
export function recommendApiTier(callsPerMonth: number): ApiPricingTier {
  if (callsPerMonth <= 10_000) return "starter";
  if (callsPerMonth <= 100_000) return "growth";
  return "enterprise";
}

// ── React component prop types ────────────────────────────────────────────────

export interface ApiPricingWidgetProps {
  /** Pre-selected tier (defaults to "starter") */
  defaultTier?: ApiPricingTier;
  /** Pre-filled call volume estimate */
  defaultCallsPerMonth?: number;
  /** Locale for display strings ("en" | "uk") */
  locale?: "en" | "uk";
  /** Callback when the user clicks "Get started" or "Contact sales" */
  onSelectTier?: (tier: ApiPricingTier, result: ApiCostResult) => void;
  /** Override the CTA URL for each tier (falls back to /pricing#api) */
  ctaUrls?: Partial<Record<ApiPricingTier, string>>;
  /** Highlight a specific tier (e.g. based on current usage) */
  highlightTier?: ApiPricingTier;
  /** Show the interactive cost calculator slider */
  showCalculator?: boolean;
  /** Annual billing toggle — if true, apply 20% discount on fixed tiers */
  annualBilling?: boolean;
}
