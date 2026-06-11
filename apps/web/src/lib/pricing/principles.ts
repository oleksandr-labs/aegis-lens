/**
 * Pricing Principles — the "constitution" of Aegis Lens pricing decisions.
 *
 * All 14 principles from TODO/monetization/TODO_pricing_principles.md.
 * Used to settle disputes, brief new hires, train Sales, and audit experiments.
 *
 * Changes to this file require an ADR (Architecture Decision Record).
 * Зміни цього файлу — лише з ADR-обґрунтуванням.
 */

// ── Principle type ────────────────────────────────────────────────────────────

export type PrincipleCategory =
  | "value"          // Price reflects value, not cost
  | "honest"         // Transparency and fairness
  | "locked"         // Protecting existing customers
  | "predictable"    // No surprise costs
  | "mission"        // Civic and access commitments
  | "sustainable"    // Long-term business health
  | "experimentation"; // How to run pricing experiments safely

export interface PricingPrinciple {
  /** URL-safe slug identifier */
  id: string;
  /** Thematic category */
  category: PrincipleCategory;
  /** Principle statement — English */
  en: string;
  /** Principle statement — Ukrainian */
  uk: string;
  /**
   * Non-negotiable principles cannot be overridden by experiment,
   * discount, sales judgment, or product decision without board-level approval.
   *
   * Принципи, які не можна скасувати ніяким експериментом чи рішенням команди.
   */
  isNonNegotiable: boolean;
}

// ── Canonical principles list ─────────────────────────────────────────────────

export const PRICING_PRINCIPLES: PricingPrinciple[] = [
  // ── Value, not cost ────────────────────────────────────────────────────────
  {
    id: "value-not-cost",
    category: "value",
    en: "Price reflects value delivered to the buyer, not our cost of delivery. AOI monitoring saves an underwriter $1 M; charging $5 k is a giveaway.",
    uk: "Ціна відображає цінність для покупця, а не наші витрати. Моніторинг AOI економить андерайтеру $1 млн; брати $5 тис — це подарунок.",
    isNonNegotiable: true,
  },
  {
    id: "cost-based-passthroughs-only",
    category: "value",
    en: "Cost-based pricing only on passthroughs (vendor satellite scenes, SMS, voice).",
    uk: "Ціноутворення на основі витрат — лише для прямих перепродажів (супутникові знімки, SMS, голос).",
    isNonNegotiable: false,
  },

  // ── Anchored to outcomes ───────────────────────────────────────────────────
  {
    id: "gradient-aligns-outcomes",
    category: "value",
    en: "Price gradients align with outcomes: speed, scope, depth, redistribution.",
    uk: "Цінові градієнти відповідають результатам: швидкість, масштаб, глибина, перерозподіл.",
    isNonNegotiable: true,
  },
  {
    id: "no-per-feature-pricing",
    category: "value",
    en: "Avoid per-feature pricing; bundle by buyer-job.",
    uk: "Уникати поофіційного ціноутворення; пакетувати за задачею покупця.",
    isNonNegotiable: false,
  },

  // ── Honest by default ─────────────────────────────────────────────────────
  {
    id: "self-serve-prices-public",
    category: "honest",
    en: "Self-serve prices are public. Sales-led prices may be private but never higher than published comparable-tier.",
    uk: "Ціни самообслуговування — публічні. Ціни через продажі можуть бути закриті, але не вищі за опублікований аналогічний рівень.",
    isNonNegotiable: true,
  },
  {
    id: "no-device-discrimination",
    category: "honest",
    en: "No price-discrimination on detected device / OS without disclosure.",
    uk: "Жодної цінової дискримінації за пристроєм / ОС без розкриття інформації.",
    isNonNegotiable: true,
  },
  {
    id: "no-surprise-fees",
    category: "honest",
    en: "No surprise fees. Total at checkout = total invoiced.",
    uk: "Жодних прихованих платежів. Сума на касі = сума в рахунку.",
    isNonNegotiable: true,
  },

  // ── Locked for existing ───────────────────────────────────────────────────
  {
    id: "grandfathering-for-existing",
    category: "locked",
    en: "Existing paying customers get grandfathering when a new test changes prices.",
    uk: "Наявні платники зберігають попередні умови при зміні цін у нових експериментах.",
    isNonNegotiable: true,
  },
  {
    id: "multi-year-price-lock",
    category: "locked",
    en: "Multi-year commits get a hard price-lock.",
    uk: "Багаторічні угоди отримують жорстке фіксування ціни.",
    isNonNegotiable: false,
  },

  // ── Predictable ───────────────────────────────────────────────────────────
  {
    id: "hard-caps-self-serve",
    category: "predictable",
    en: "Hard caps on self-serve overage unless customer opts in.",
    uk: "Жорсткі обмеження на перевищення у самообслуговуванні, якщо клієнт не погодився на інше.",
    isNonNegotiable: false,
  },
  {
    id: "budget-alerts-mandatory",
    category: "predictable",
    en: "Budget alerts mandatory for metered SKUs.",
    uk: "Сповіщення про бюджет — обов'язкові для SKU з лічильником.",
    isNonNegotiable: false,
  },

  // ── Mission-aligned ───────────────────────────────────────────────────────
  {
    id: "free-is-mission",
    category: "mission",
    en: "Free is mission, not loss-leader. Civic-safety data is never paywalled.",
    uk: "Безкоштовний рівень — це місія, а не інструмент залучення. Дані громадянської безпеки ніколи не закриваються пейволом.",
    isNonNegotiable: true,
  },
  {
    id: "discount-programs-non-negotiable",
    category: "mission",
    en: "Discount programs for journalist, NGO, Ukrainian, and academic users are non-negotiable.",
    uk: "Програми знижок для журналістів, НГО, українських та академічних користувачів є обов'язковими.",
    isNonNegotiable: true,
  },
  {
    id: "no-dark-patterns",
    category: "mission",
    en: "No dark patterns. No trial auto-charge without warning, no data hostage, no fake urgency.",
    uk: "Жодних темних паттернів. Жодного автосписання після пробного без попередження, жодного утримання даних, жодного штучного терміну.",
    isNonNegotiable: true,
  },
  {
    id: "ltd-time-bounded",
    category: "sustainable",
    en: "LTD and aggressive launch tactics are time-bounded. Sunset before Phase 3.",
    uk: "Довічні ліцензії та агресивні тактики запуску мають обмежений термін. Вивести з обігу до Фази 3.",
    isNonNegotiable: false,
  },
  {
    id: "ads-revenue-cap",
    category: "sustainable",
    en: "Ads should not exceed 10% of revenue mix — protect trust.",
    uk: "Реклама не повинна перевищувати 10% дохідного міксу — захист довіри.",
    isNonNegotiable: false,
  },
  {
    id: "services-revenue-cap",
    category: "sustainable",
    en: "Services should not exceed 25% of revenue mix — protect product focus.",
    uk: "Сервіси не повинні перевищувати 25% дохідного міксу — захист фокусу на продукті.",
    isNonNegotiable: false,
  },

  // ── Experimentation ───────────────────────────────────────────────────────
  {
    id: "test-one-axis",
    category: "experimentation",
    en: "Test one pricing axis at a time.",
    uk: "Тестувати одну цінову вісь одночасно.",
    isNonNegotiable: false,
  },
  {
    id: "never-test-existing-paying",
    category: "experimentation",
    en: "Never test price on existing paying customers.",
    uk: "Ніколи не тестувати ціну на наявних платниках.",
    isNonNegotiable: true,
  },
  {
    id: "log-winning-experiments",
    category: "experimentation",
    en: "Log every winning experiment in the decision records.",
    uk: "Фіксувати кожен успішний експеримент у журналі рішень.",
    isNonNegotiable: false,
  },
];

// ── Helper: filter by category ────────────────────────────────────────────────

export function getPrinciplesByCategory(
  category: PrincipleCategory,
): PricingPrinciple[] {
  return PRICING_PRINCIPLES.filter((p) => p.category === category);
}

export function getNonNegotiablePrinciples(): PricingPrinciple[] {
  return PRICING_PRINCIPLES.filter((p) => p.isNonNegotiable);
}
