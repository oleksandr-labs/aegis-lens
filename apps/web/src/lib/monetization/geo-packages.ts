/**
 * Geographic Packages — region-restricted Pro subscriptions.
 *
 * Each geo pack = Pro-level features restricted to AOIs within the defined region.
 * Priced at ~60% of global Pro (40% discount).
 * Upgrade-to-global is one-click pro-rated.
 *
 * Гео-пакети: Pro-функції, обмежені конкретним регіоном.
 * Ціна ~60% від глобального Pro (40% знижка).
 */

import type { GeoPackage, GeoPackageId } from "./types";

// ── Canonical geo package registry ───────────────────────────────────────────

export const GEO_PACKAGES: GeoPackage[] = [
  {
    id: "ukraine",
    name_en: "Ukraine Pack",
    name_uk: "Україна-пакет",
    description_en:
      "Full Pro-level OSINT coverage for Ukraine with a 200 km border buffer. Default starter pack — price-anchored entry point for analysts focused on the Ukrainian conflict and reconstruction.",
    description_uk:
      "Повне Pro-покриття OSINT для України з буфером 200 км вздовж кордону. Базовий стартовий пакет — цінова точка входу для аналітиків, орієнтованих на конфлікт і відновлення України.",
    countries: ["UA"],
    radiusBuffer: "200km",
    globalProDiscountPct: 0.4,
    baseTierId: "pro",
    pricingNote_en:
      "Starting at $29/mo. Covers UA territory + 200 km cross-border buffer. Upgrade to EU-East or Global at any time, pro-rated.",
    autoIncludesVerticals: undefined,
  },

  {
    id: "eu-east",
    name_en: "EU-East Pack",
    name_uk: "ЦСЄ-пакет",
    description_en:
      "Pro coverage across Central and Eastern Europe: Poland, Romania, Moldova, Slovakia, Hungary, Belarus, and Ukraine. Designed for regional analysts, cross-border researchers, and EU policy desks.",
    description_uk:
      "Pro-покриття Центральної та Східної Європи: Польща, Румунія, Молдова, Словаччина, Угорщина, Білорусь і Україна. Для регіональних аналітиків, транскордонних досліджень і відділів ЄС.",
    countries: ["PL", "RO", "MD", "SK", "HU", "BY", "UA"],
    globalProDiscountPct: 0.4,
    baseTierId: "pro",
    pricingNote_en:
      "Starting at $29/mo. Covers 7 countries. Upgrade to Global Pro at any time, pro-rated.",
    autoIncludesVerticals: undefined,
  },

  {
    id: "black-sea",
    name_en: "Black Sea Pack",
    name_uk: "Чорноморський пакет",
    description_en:
      "Pro coverage of the Black Sea region: Ukraine, Turkey, Romania, Bulgaria, Georgia, and Russian coastal areas. Includes maritime-focused defaults and auto-discounts the Maritime vertical add-on stack.",
    description_uk:
      "Pro-покриття Чорноморського регіону: Україна, Туреччина, Румунія, Болгарія, Грузія та прибережні райони Росії. Морські налаштування за замовчуванням + автоматична знижка на Maritime-пакет.",
    countries: ["UA", "TR", "RO", "BG", "GE", "RU"],
    globalProDiscountPct: 0.4,
    baseTierId: "pro",
    pricingNote_en:
      "Starting at $29/mo. Black Sea basin coverage. Maritime vertical add-on included at 20% discount.",
    autoIncludesVerticals: ["maritime"],
  },

  {
    id: "mena",
    name_en: "MENA Pack",
    name_uk: "БСПА-пакет (Близький Схід і Північна Африка)",
    description_en:
      "Pro coverage of the Middle East and North Africa: Levant, Gulf states, Red Sea corridor, and North Africa. Covers conflict monitoring, sanctions tracking, and energy infrastructure.",
    description_uk:
      "Pro-покриття Близького Сходу та Північної Африки: Левант, країни Затоки, коридор Червоного моря та Північ Африки. Моніторинг конфліктів, відстеження санкцій та енергетична інфраструктура.",
    countries: [
      "IL", "PS", "LB", "SY", "JO", "IQ", "IR", "SA", "AE", "KW",
      "QA", "BH", "OM", "YE", "EG", "LY", "TN", "DZ", "MA", "SD",
    ],
    globalProDiscountPct: 0.4,
    baseTierId: "pro",
    pricingNote_en:
      "Starting at $29/mo. Full Levant + Gulf + North Africa + Red Sea corridor coverage.",
    autoIncludesVerticals: undefined,
  },

  {
    id: "indo-pacific",
    name_en: "Indo-Pacific / South China Sea Pack",
    name_uk: "Індо-Тихоокеанський пакет / Південно-Китайське море",
    description_en:
      "Pro coverage of the Indo-Pacific region with a focus on the South China Sea: China, Taiwan, Philippines, Vietnam, Indonesia, Malaysia, Japan, South Korea, India, and Australia.",
    description_uk:
      "Pro-покриття Індо-Тихоокеанського регіону з акцентом на Південно-Китайське море: Китай, Тайвань, Філіппіни, Вʼєтнам, Індонезія, Малайзія, Японія, Корея, Індія, Австралія.",
    countries: [
      "CN", "TW", "PH", "VN", "ID", "MY", "SG", "BN",
      "JP", "KR", "IN", "AU", "NZ", "TH", "MM",
    ],
    globalProDiscountPct: 0.4,
    baseTierId: "pro",
    pricingNote_en:
      "Starting at $29/mo. South China Sea and broader Indo-Pacific coverage.",
    autoIncludesVerticals: ["maritime"],
  },

  {
    id: "sahel",
    name_en: "Sahel Pack",
    name_uk: "Сахель-пакет",
    description_en:
      "Pro coverage of the Sahel region with a humanitarian focus: Mali, Niger, Burkina Faso, Chad, Sudan, South Sudan, CAR, Senegal, Mauritania, and Nigeria. Includes NGO/humanitarian use-case defaults.",
    description_uk:
      "Pro-покриття регіону Сахелю з гуманітарним акцентом: Малі, Нігер, Буркіна-Фасо, Чад, Судан, Південний Судан, ЦАР, Сенегал, Мавританія та Нігерія. Налаштування для НГО/гуманітарних організацій.",
    countries: [
      "ML", "NE", "BF", "TD", "SD", "SS", "CF", "SN", "MR", "NG",
    ],
    globalProDiscountPct: 0.4,
    baseTierId: "pro",
    pricingNote_en:
      "Starting at $29/mo. Humanitarian-focused presets included. Grant pricing available for eligible NGOs.",
    autoIncludesVerticals: ["ngo-humanitarian"],
  },

  {
    id: "global",
    name_en: "Global Pack",
    name_uk: "Глобальний пакет",
    description_en:
      "Unrestricted global coverage — all countries, all regions. Default for Business and Enterprise tiers. Upgrade target for regional pack holders.",
    description_uk:
      "Необмежене глобальне покриття — всі країни, всі регіони. За замовчуванням для рівнів Business і Enterprise. Ціль апгрейду для власників регіональних пакетів.",
    countries: [],
    globalProDiscountPct: 0,
    baseTierId: "pro",
    pricingNote_en:
      "Full global Pro at standard price. Included by default in Business and Enterprise tiers.",
    autoIncludesVerticals: undefined,
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Look up a geo package by its ID.
 *
 * Пошук гео-пакету за ідентифікатором.
 */
export function getGeoPackageById(id: GeoPackageId): GeoPackage | undefined {
  return GEO_PACKAGES.find((g) => g.id === id);
}

/**
 * Check whether a given ISO 3166-1 alpha-2 country code falls inside a geo package.
 * The 'global' package covers all countries.
 *
 * Перевіряє, чи входить країна до гео-пакету.
 */
export function isRegionIncluded(
  geoPackageId: GeoPackageId,
  countryCode: string
): boolean {
  const pkg = getGeoPackageById(geoPackageId);
  if (!pkg) return false;
  // 'global' has empty countries array — covers everything
  if (pkg.id === "global") return true;
  return pkg.countries.includes(countryCode.toUpperCase());
}

/**
 * Returns a localised CTA string prompting the user to upgrade from their
 * current regional package to the global plan.
 *
 * Повертає локалізований CTA-текст для апгрейду до глобального плану.
 */
export function getUpgradeToGlobalPrompt(
  pkg: GeoPackage,
  locale: "en" | "uk"
): string {
  if (pkg.id === "global") {
    return locale === "uk"
      ? "Ви вже на глобальному плані."
      : "You are already on the Global plan.";
  }

  const discountPct = Math.round(pkg.globalProDiscountPct * 100);

  if (locale === "uk") {
    return (
      `Ваш поточний план охоплює лише ${pkg.name_uk}. ` +
      `Перейдіть на Global Pro, щоб відстежувати події будь-де у світі. ` +
      `Апгрейд перераховується пропорційно з урахуванням вашої знижки ${discountPct}%.`
    );
  }

  return (
    `Your current plan covers ${pkg.name_en} only. ` +
    `Upgrade to Global Pro to monitor events anywhere in the world. ` +
    `Upgrade is pro-rated, accounting for your ${discountPct}% regional discount.`
  );
}
