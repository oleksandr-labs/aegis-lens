/**
 * Bundle Discount Calculator — live discount computation for add-on bundles.
 *
 * Rules (canonical, from pricing page):
 *   3+ add-ons selected → 15% off combined add-on price
 *   5+ add-ons selected → 25% off combined add-on price
 *
 * Only the highest applicable bracket applies (non-stackable).
 *
 * Калькулятор бандл-знижок для надбудов. Знижки не підсумовуються —
 * застосовується тільки найвища дійсна планка.
 */

// ── Add-on catalog types ───────────────────────────────────────────────────────

export type AddonGroup = "data" | "capability";

export interface Addon {
  /** Machine-readable identifier (kebab-case) */
  id: string;
  /** Display name — English */
  name_en: string;
  /** Display name — Ukrainian */
  name_uk: string;
  /** Group: data add-on or capability add-on */
  group: AddonGroup;
  /** Monthly price in USD */
  pricePerMonth: number;
  /** Minimum tier required to activate this add-on */
  minTier: string;
  /** Short description — English */
  description_en: string;
  /** Short description — Ukrainian */
  description_uk: string;
}

// ── Discount rule types ────────────────────────────────────────────────────────

/**
 * A single bundle discount bracket.
 * Only one bracket applies per calculation — the highest that the selection qualifies for.
 *
 * Одна планка бандл-знижки.
 */
export interface BundleDiscountRule {
  /** Minimum number of add-ons required to trigger this bracket */
  minAddons: 3 | 5;
  /** Fractional discount (0 < discount < 1) */
  discount: 0.15 | 0.25;
  /** Human-readable label — English */
  label_en: string;
  /** Human-readable label — Ukrainian */
  label_uk: string;
}

/**
 * Ordered list of bundle discount rules (highest threshold first for easy lookup).
 * Only the first (highest) qualifying rule is applied.
 *
 * Впорядкований список правил бандл-знижок (від найвищої порогу до найнижчої).
 */
export const BUNDLE_DISCOUNT_RULES: readonly BundleDiscountRule[] = [
  {
    minAddons: 5,
    discount: 0.25,
    label_en: "Bundle deal: 5+ add-ons → 25% off",
    label_uk: "Бандл-знижка: 5+ надбудов → 25% знижки",
  },
  {
    minAddons: 3,
    discount: 0.15,
    label_en: "Bundle deal: 3+ add-ons → 15% off",
    label_uk: "Бандл-знижка: 3+ надбудови → 15% знижки",
  },
] as const;

// ── Result type ───────────────────────────────────────────────────────────────

export interface DiscountResult {
  /** Total monthly price of selected add-ons before discount */
  subtotalUsd: number;
  /** Applied discount fraction (0 if no discount qualifies) */
  discountFraction: number;
  /** Discount amount in USD */
  discountAmountUsd: number;
  /** Final monthly price after discount */
  totalUsd: number;
  /** The rule that was applied; null if no discount triggered */
  appliedRule: BundleDiscountRule | null;
  /** Number of add-ons selected */
  addonCount: number;
  /** Next discount bracket (if not at maximum yet) */
  nextRule: BundleDiscountRule | null;
  /** Number of add-ons needed to reach the next bracket (0 if already at max) */
  addonsUntilNextBracket: number;
  /** Potential savings (in USD) if the user adds enough to reach the next bracket */
  potentialNextSavingsUsd: number;
}

// ── Core calculation ──────────────────────────────────────────────────────────

/**
 * Calculate the bundle discount for a set of selected add-ons.
 *
 * Rules:
 *  - Only the highest qualifying bracket applies.
 *  - Returns full details for UI rendering (savings, next-bracket nudge, etc.).
 *
 * @param selectedAddons  Array of add-on objects the user has selected
 *
 * Розраховує бандл-знижку для набору вибраних надбудов.
 */
export function calculateBundleDiscount(selectedAddons: Addon[]): DiscountResult {
  const addonCount = selectedAddons.length;
  const subtotalUsd = selectedAddons.reduce(
    (sum, addon) => sum + addon.pricePerMonth,
    0,
  );

  // Find the highest qualifying rule
  const appliedRule =
    BUNDLE_DISCOUNT_RULES.find((rule) => addonCount >= rule.minAddons) ?? null;

  const discountFraction = appliedRule?.discount ?? 0;
  const discountAmountUsd =
    Math.round(subtotalUsd * discountFraction * 100) / 100;
  const totalUsd = Math.round((subtotalUsd - discountAmountUsd) * 100) / 100;

  // Find the next bracket the user hasn't reached yet
  const nextRule =
    BUNDLE_DISCOUNT_RULES.find((rule) => addonCount < rule.minAddons) ?? null;
  const addonsUntilNextBracket = nextRule
    ? nextRule.minAddons - addonCount
    : 0;

  // Potential savings if they add enough to hit the next bracket
  // Assumes average add-on price for the additional slots
  let potentialNextSavingsUsd = 0;
  if (nextRule && addonCount > 0) {
    const avgPrice = subtotalUsd / addonCount;
    const projectedSubtotal = subtotalUsd + addonsUntilNextBracket * avgPrice;
    const projectedSavings = Math.round(
      projectedSubtotal * nextRule.discount * 100,
    ) / 100;
    potentialNextSavingsUsd = Math.round(
      (projectedSavings - discountAmountUsd) * 100,
    ) / 100;
  }

  return {
    subtotalUsd,
    discountFraction,
    discountAmountUsd,
    totalUsd,
    appliedRule,
    addonCount,
    nextRule,
    addonsUntilNextBracket,
    potentialNextSavingsUsd,
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Format currency amount as a USD string.
 *
 * Форматує суму у рядок USD.
 */
function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a DiscountResult into human-readable savings copy.
 *
 * Examples:
 *   "Save $45/mo with 3+ add-on bundle (15% off)"
 *   "No bundle discount yet — add 2 more for 15% off"
 *   "Maximum bundle discount applied: 25% off, saving $74.75/mo"
 *
 * @param result   Output from calculateBundleDiscount
 * @param locale   "en" | "uk"
 *
 * Форматує DiscountResult у читабельний текст економії.
 */
export function formatBundleSavings(
  result: DiscountResult,
  locale: "en" | "uk" = "en",
): string {
  const { discountAmountUsd, discountFraction, appliedRule, nextRule, addonsUntilNextBracket } =
    result;

  if (locale === "uk") {
    if (!appliedRule) {
      if (!nextRule) return "Немає доступних бандл-знижок.";
      return (
        `Ще немає бандл-знижки — додайте ще ${addonsUntilNextBracket} ` +
        `${addonsUntilNextBracket === 1 ? "надбудову" : "надбудови"} для знижки ` +
        `${Math.round(nextRule.discount * 100)}%.`
      );
    }
    if (!nextRule) {
      return (
        `Максимальна бандл-знижка: ${Math.round(discountFraction * 100)}% знижки, ` +
        `економія ${formatUsd(discountAmountUsd)}/місяць.`
      );
    }
    return (
      `Економія ${formatUsd(discountAmountUsd)}/місяць із бандлом з ${appliedRule.minAddons}+ надбудов ` +
      `(${Math.round(discountFraction * 100)}% знижки). ` +
      `Додайте ще ${addonsUntilNextBracket} для ${Math.round(nextRule.discount * 100)}% знижки.`
    );
  }

  // EN
  if (!appliedRule) {
    if (!nextRule) return "No bundle discounts available.";
    return (
      `No bundle discount yet — add ${addonsUntilNextBracket} more ` +
      `${addonsUntilNextBracket === 1 ? "add-on" : "add-ons"} for ` +
      `${Math.round(nextRule.discount * 100)}% off.`
    );
  }
  if (!nextRule) {
    return (
      `Maximum bundle discount applied: ${Math.round(discountFraction * 100)}% off, ` +
      `saving ${formatUsd(discountAmountUsd)}/mo.`
    );
  }
  return (
    `Save ${formatUsd(discountAmountUsd)}/mo with ${appliedRule.minAddons}+ add-on bundle ` +
    `(${Math.round(discountFraction * 100)}% off). ` +
    `Add ${addonsUntilNextBracket} more for ${Math.round(nextRule.discount * 100)}% off.`
  );
}

// ── Addon catalog ─────────────────────────────────────────────────────────────

/**
 * Canonical add-on catalog — matches the pricing page add-ons section.
 * Prices are monthly in USD.
 *
 * Канонічний каталог надбудов — відповідає секції надбудов сторінки цін.
 */
export const ADDON_CATALOG: Addon[] = [
  // ── Data add-ons ───────────────────────────────────────────────────────────
  {
    id: "satellite-imagery",
    name_en: "Satellite Imagery",
    name_uk: "Супутникові знімки",
    group: "data",
    pricePerMonth: 99,
    minTier: "pro",
    description_en: "Daily optical + SAR imagery overlays for the map workspace.",
    description_uk: "Щоденні оптичні + SAR-знімки у вигляді оверлеїв у робочому просторі карти.",
  },
  {
    id: "adsb-pro",
    name_en: "ADS-B Pro",
    name_uk: "ADS-B Pro",
    group: "data",
    pricePerMonth: 79,
    minTier: "pro",
    description_en: "Real-time & historical ADS-B flight tracking for conflict zones.",
    description_uk: "ADS-B відстеження польотів у реальному часі та архів для зон конфліктів.",
  },
  {
    id: "ais-pro",
    name_en: "AIS Pro",
    name_uk: "AIS Pro",
    group: "data",
    pricePerMonth: 79,
    minTier: "pro",
    description_en: "High-density AIS maritime vessel tracking with historical playback.",
    description_uk: "Висока щільність відстеження морських суден AIS з архівним відтворенням.",
  },
  {
    id: "thermal",
    name_en: "Thermal Layer",
    name_uk: "Тепловий шар",
    group: "data",
    pricePerMonth: 59,
    minTier: "pro",
    description_en: "FIRMS thermal anomaly overlays — fire, heat signature mapping.",
    description_uk: "Теплові аномалії FIRMS — пожежі, картографування теплових підписів.",
  },
  {
    id: "social-firehose",
    name_en: "Social Firehose",
    name_uk: "Соціальний Firehose",
    group: "data",
    pricePerMonth: 149,
    minTier: "team",
    description_en: "Filtered Telegram + X (Twitter) firehose, conflict-keyword indexed.",
    description_uk: "Фільтрований Telegram + X (Twitter) firehose, індексований за ключовими словами конфлікту.",
  },
  {
    id: "historical-bulk",
    name_en: "Historical Bulk Export",
    name_uk: "Масовий архівний експорт",
    group: "data",
    pricePerMonth: 199,
    minTier: "team",
    description_en: "Full-archive bulk export (Parquet / S3 push) for data science workflows.",
    description_uk: "Масовий архівний експорт (Parquet / S3 push) для задач науки про дані.",
  },
  // ── Capability add-ons ──────────────────────────────────────────────────────
  {
    id: "aoi-monitoring",
    name_en: "AOI Monitoring+",
    name_uk: "Моніторинг AOI+",
    group: "capability",
    pricePerMonth: 49,
    minTier: "pro",
    description_en: "Unlimited AOI alerts, sub-minute polling, dedicated lane.",
    description_uk: "Необмежені сповіщення AOI, опитування менше хвилини, виділений канал.",
  },
  {
    id: "travel-risk",
    name_en: "Travel Risk Intelligence",
    name_uk: "Розвідка ризиків подорожей",
    group: "capability",
    pricePerMonth: 89,
    minTier: "pro",
    description_en: "Route-level risk assessment and real-time travel advisories.",
    description_uk: "Оцінка ризиків на рівні маршруту та поради щодо подорожей у реальному часі.",
  },
  {
    id: "ai-copilot-pro",
    name_en: "AI Copilot Pro",
    name_uk: "AI Copilot Pro",
    group: "capability",
    pricePerMonth: 129,
    minTier: "pro",
    description_en: "Unlimited Copilot queries, custom fine-tuning, priority inference queue.",
    description_uk: "Необмежені запити Copilot, кастомне дообучання, пріоритетна черга інференсу.",
  },
  {
    id: "embeds-pro",
    name_en: "Embeds Pro",
    name_uk: "Embeds Pro",
    group: "capability",
    pricePerMonth: 69,
    minTier: "pro",
    description_en: "White-label embeds, custom branding, unlimited embed domains.",
    description_uk: "White-label вбудовки, кастомний брендинг, необмежена кількість доменів.",
  },
  {
    id: "bots-pro",
    name_en: "Bots Pro",
    name_uk: "Bots Pro",
    group: "capability",
    pricePerMonth: 69,
    minTier: "team",
    description_en: "Unlimited bot instances with custom workflows and alert routing.",
    description_uk: "Необмежена кількість ботів з кастомними воркфлоу та маршрутизацією сповіщень.",
  },
  {
    id: "notebooks-pro",
    name_en: "Notebooks Pro",
    name_uk: "Notebooks Pro",
    group: "capability",
    pricePerMonth: 49,
    minTier: "pro",
    description_en: "Collaborative notebooks, scheduled runs, public sharing, versioning.",
    description_uk: "Спільні ноутбуки, заплановані запуски, публічне поширення, версіонування.",
  },
];

/**
 * Look up a single add-on from the catalog by ID.
 *
 * Повертає надбудову з каталогу за ідентифікатором.
 */
export function getAddonById(id: string): Addon | undefined {
  return ADDON_CATALOG.find((a) => a.id === id);
}

/**
 * Filter add-ons by group.
 *
 * Фільтрує надбудови за групою.
 */
export function getAddonsByGroup(group: AddonGroup): Addon[] {
  return ADDON_CATALOG.filter((a) => a.group === group);
}
