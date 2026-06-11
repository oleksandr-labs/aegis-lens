/**
 * Competitive pricing matrix — positioning vs key competitors.
 *
 * Used for:
 * - Sales counter-narratives and objection handling
 * - Pricing page "compare vs" sections
 * - Quarterly competitive-pricing refresh tracking
 *
 * Source of truth: TODO/monetization/TODO_competitive_pricing.md
 * Конкурентна матриця ціноутворення та позиціювання.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Which market segment the competitor primarily serves */
export type CompetitorTier =
  | "free-open"    // Free / open-source / donation-based
  | "mid"          // Mid-market self-serve ($10–$500/mo)
  | "enterprise"   // Enterprise / sales-led ($1k+/mo or contract)
  | "data-only";   // Data licensing without SaaS UI

/** Pricing anchoring strategy relative to the competitor */
export type AnchorStrategy =
  | "head-on"        // Compete directly at same price point
  | "undercut"       // Price meaningfully below competitor
  | "honor-mission"  // Don't compete; differentiate on value/mission
  | "saas-speed"     // SaaS agility vs heavy procurement
  | "self-serve-match"; // Match on self-serve; win on AI features

export interface Competitor {
  /** Unique slug */
  id: string;
  /** Display name */
  name: string;
  /** Their primary market segment */
  tier: CompetitorTier;
  /**
   * Estimated monthly price in USD.
   * null = opaque / custom / enterprise-only.
   */
  est_price_usd_mo: number | null;
  /** Published pricing URL (if available) */
  pricing_url?: string;
  /** Key strengths (buyer perspective) */
  strengths: string[];
  /** Key weaknesses vs Aegis Lens */
  weaknesses: string[];
  /** Our anchor strategy against them */
  anchor_strategy: AnchorStrategy;
  /**
   * Our positioning narrative vs this competitor — English.
   * One sentence, suitable for sales deck.
   */
  our_positioning_en: string;
  /**
   * Our positioning narrative vs this competitor — Ukrainian.
   */
  our_positioning_uk: string;
  /**
   * The price anchor phrase used in sales conversations — English.
   * e.g. "less than 1 hour of analyst time per month"
   */
  our_price_anchor_en: string;
  /**
   * The price anchor phrase used in sales conversations — Ukrainian.
   */
  our_price_anchor_uk: string;
}

// ── Canonical competitor matrix ───────────────────────────────────────────────

export const COMPETITOR_MATRIX: Competitor[] = [
  {
    id: "liveuamap",
    name: "LiveUAmap Pro",
    tier: "mid",
    est_price_usd_mo: 25,
    pricing_url: "https://liveuamap.com",
    strengths: [
      "Well-known brand in Ukraine conflict coverage",
      "Simple UX familiar to journalists",
      "Low price point lowers buyer resistance",
    ],
    weaknesses: [
      "No source verification or confidence scoring",
      "No AI analysis layer",
      "Limited history and no API",
      "No collaboration or case files",
    ],
    anchor_strategy: "head-on",
    our_positioning_en:
      "We match LiveUAmap's price at Observer/Pro but add AI-powered verification and structured event data that journalists can cite and investigate.",
    our_positioning_uk:
      "Ми конкуруємо з LiveUAmap за ціною на рівні Observer/Pro, але додаємо ШІ-верифікацію та структуровані дані подій, на які журналісти можуть посилатися.",
    our_price_anchor_en: "Same price as LiveUAmap Pro, with AI and verification built in.",
    our_price_anchor_uk: "Та сама ціна, що і LiveUAmap Pro, але з вбудованим ШІ та верифікацією.",
  },
  {
    id: "janes",
    name: "Janes",
    tier: "enterprise",
    est_price_usd_mo: null, // enterprise contract, $50k+ / yr
    strengths: [
      "Deep military OOB and equipment databases",
      "Decades of institutional credibility",
      "Trusted by NATO/MoD procurement",
    ],
    weaknesses: [
      "Extremely slow data refresh (days/weeks)",
      "No real-time event stream",
      "Legacy UI; steep learning curve",
      "Long procurement cycles (6–12 months)",
      "Price 2–5x higher for similar coverage",
    ],
    anchor_strategy: "undercut",
    our_positioning_en:
      "We deliver comparable coverage with real-time freshness and a modern SaaS UI at 40–60% lower total cost, without a 12-month procurement cycle.",
    our_positioning_uk:
      "Ми забезпечуємо порівнянне покриття з оновленням у реальному часі та сучасним SaaS-інтерфейсом на 40–60% дешевше без 12-місячного тендеру.",
    our_price_anchor_en: "Enterprise coverage at 40% of Janes contract cost, with real-time data.",
    our_price_anchor_uk: "Корпоративне покриття за 40% від вартості контракту Janes — у режимі реального часу.",
  },
  {
    id: "recorded-future",
    name: "Recorded Future",
    tier: "enterprise",
    est_price_usd_mo: null, // typically $100k+ / yr
    strengths: [
      "Broad threat intelligence across cyber + physical",
      "Strong brand in corporate security",
      "Rich integrations (SIEM, SOAR)",
    ],
    weaknesses: [
      "Black-box risk scores with no explainability",
      "No Ukraine-specific operational intelligence depth",
      "Extremely high price; complex licensing",
      "Overkill for OSINT-focused analysts",
    ],
    anchor_strategy: "undercut",
    our_positioning_en:
      "We undercut Recorded Future at Business tier with transparent, explainable confidence scoring and Ukraine-first operational depth.",
    our_positioning_uk:
      "Ми конкуруємо з Recorded Future на рівні Business із прозорим скорингом впевненості та операційною глибиною, орієнтованою на Україну.",
    our_price_anchor_en: "Business plan at under 2% of a typical Recorded Future contract — with transparent confidence scoring.",
    our_price_anchor_uk: "Тариф Business менш як за 2% від типового контракту Recorded Future — з прозорим скорингом.",
  },
  {
    id: "palantir",
    name: "Palantir Foundry",
    tier: "enterprise",
    est_price_usd_mo: null, // large gov/enterprise contracts
    strengths: [
      "Powerful data fusion and workflow automation",
      "Deep US DoD / government relationships",
      "Handles classified data environments",
    ],
    weaknesses: [
      "Extremely high implementation cost (months+)",
      "Requires dedicated Palantir engineers",
      "Not self-serve; heavy RFP/procurement process",
      "Not designed for open-source intelligence workflows",
    ],
    anchor_strategy: "saas-speed",
    our_positioning_en:
      "We deliver SaaS speed and self-serve onboarding where Palantir requires a 6-month implementation and dedicated engineers.",
    our_positioning_uk:
      "Ми забезпечуємо SaaS-швидкість та самостійне підключення там, де Palantir вимагає 6-місячного впровадження та виділених інженерів.",
    our_price_anchor_en: "Full deployment in hours, not months — at a fraction of Palantir's implementation cost.",
    our_price_anchor_uk: "Повне розгортання за години, а не місяці — за частку вартості впровадження Palantir.",
  },
  {
    id: "bellingcat",
    name: "Bellingcat (open)",
    tier: "free-open",
    est_price_usd_mo: 0, // free / donation
    strengths: [
      "Unmatched credibility in OSINT community",
      "Pioneered open-source investigation methodology",
      "Strong civil society trust",
    ],
    weaknesses: [
      "No real-time operational map",
      "No structured data / API",
      "Publication-focused, not analyst tooling",
    ],
    anchor_strategy: "honor-mission",
    our_positioning_en:
      "We honor Bellingcat's mission and serve the same community — Aegis Lens is the real-time tooling layer that complements their investigative methodology.",
    our_positioning_uk:
      "Ми поважаємо місію Bellingcat та служимо тій самій спільноті — Aegis Lens є шаром інструментів реального часу, що доповнює їх методологію.",
    our_price_anchor_en: "Not a competitor — a real-time layer for the same mission.",
    our_price_anchor_uk: "Не конкурент — шар реального часу для тієї самої місії.",
  },
  {
    id: "acled",
    name: "ACLED",
    tier: "data-only",
    est_price_usd_mo: null, // data license, varies
    strengths: [
      "Authoritative conflict event dataset",
      "Widely cited in academic / policy",
      "Global coverage",
    ],
    weaknesses: [
      "Days-to-weeks data latency",
      "No real-time stream or interactive map product",
      "Data license model, not SaaS",
      "No AI analysis layer",
    ],
    anchor_strategy: "head-on",
    our_positioning_en:
      "We offer richer real-time event data with an integrated UI and AI analysis layer at competitive data-license pricing.",
    our_positioning_uk:
      "Ми пропонуємо більш насичені дані у реальному часі з інтегрованим UI та шаром ШІ-аналізу за конкурентними цінами на ліцензування даних.",
    our_price_anchor_en: "Real-time ACLED-style data plus AI analysis — at SaaS pricing, not data-license pricing.",
    our_price_anchor_uk: "Дані типу ACLED у реальному часі плюс ШІ-аналіз — за SaaS-ціноутворенням, а не ліцензуванням.",
  },
  {
    id: "maxar-planet",
    name: "Maxar / Planet",
    tier: "data-only",
    est_price_usd_mo: null, // per-scene pricing, expensive
    strengths: [
      "Best-in-class satellite imagery",
      "High revisit rates (Planet)",
      "Trusted source for ground truth",
    ],
    weaknesses: [
      "Per-scene cost model, unpredictable spend",
      "No event intelligence or analysis layer",
      "No geopolitical / OSINT context",
      "Not OSINT-analyst UX",
    ],
    anchor_strategy: "head-on",
    our_positioning_en:
      "We resell Maxar/Planet imagery as an add-on and layer structured event intelligence on top — one subscription replaces a complex vendor relationship.",
    our_positioning_uk:
      "Ми перепродаємо знімки Maxar/Planet як доповнення та накладаємо структуровану розвідку подій — одна підписка замінює складні відносини з постачальником.",
    our_price_anchor_en: "Satellite imagery plus intelligence in one subscription — no per-scene billing.",
    our_price_anchor_uk: "Супутникові знімки плюс розвідка в одній підписці — без поснімкового виставлення рахунків.",
  },
  {
    id: "flashpoint",
    name: "Flashpoint / SocialNet",
    tier: "enterprise",
    est_price_usd_mo: null, // enterprise, $50k+ / yr
    strengths: [
      "Deep dark web and social media monitoring",
      "Strong brand in threat intelligence",
      "Broad indicator feeds",
    ],
    weaknesses: [
      "Not focused on kinetic / conflict OSINT",
      "No Ukraine operational depth",
      "Complex and expensive",
      "No self-serve onboarding",
    ],
    anchor_strategy: "self-serve-match",
    our_positioning_en:
      "We match Flashpoint's self-serve pricing at Pro/Team and win on AI-native UX and Ukraine operational intelligence depth.",
    our_positioning_uk:
      "Ми конкуруємо з Flashpoint на рівнях Pro/Team за ціною самообслуговування і перемагаємо завдяки ШІ-нативному UX і операційній глибині по Україні.",
    our_price_anchor_en: "Pro/Team access to Ukraine OSINT at under 5% of a Flashpoint enterprise contract.",
    our_price_anchor_uk: "Доступ Pro/Team до OSINT по Україні за менш ніж 5% від корпоративного контракту Flashpoint.",
  },
  {
    id: "osint-combine",
    name: "OSINT Combine / Echosec",
    tier: "mid",
    est_price_usd_mo: 300, // rough estimate, varies by product
    strengths: [
      "Strong OSINT practitioner brand",
      "Social media and geolocation tooling",
      "Self-serve friendly",
    ],
    weaknesses: [
      "Limited conflict-specific data",
      "No structured conflict event database",
      "No AI analysis layer",
      "Weaker on Ukraine/Eastern Europe depth",
    ],
    anchor_strategy: "self-serve-match",
    our_positioning_en:
      "We match OSINT Combine on self-serve price and beat them on AI differentiation and conflict-specific structured data.",
    our_positioning_uk:
      "Ми конкуруємо з OSINT Combine за ціною самообслуговування та перемагаємо завдяки диференціації ШІ та структурованим даним конфліктів.",
    our_price_anchor_en: "Same self-serve price range — with AI analysis and conflict-specific intelligence built in.",
    our_price_anchor_uk: "Та сама цінова категорія самообслуговування — із вбудованим ШІ та спеціалізованою розвідкою конфліктів.",
  },
];

// ── Anchoring tactics ─────────────────────────────────────────────────────────

/**
 * Standardized price anchoring narratives for each tier.
 * Used on pricing page and in sales collateral.
 *
 * Стандартизовані наративи цінового орієнтира для кожного рівня.
 */
export const TIER_PRICE_ANCHORS: Record<
  string,
  { en: string; uk: string }
> = {
  pro: {
    en: "Less than 1 hour of analyst time per month ($49/mo ≈ $50/h)",
    uk: "Менше 1 години роботи аналітика на місяць ($49/міс ≈ $50/год)",
  },
  team: {
    en: "Less than 1 day of analyst time per month (~$400/mo)",
    uk: "Менше 1 дня роботи аналітика на місяць (~$400/міс)",
  },
  business: {
    en: "Less than 1 week of senior analyst time per month (~$2k/mo)",
    uk: "Менше 1 тижня роботи старшого аналітика на місяць (~$2тис/міс)",
  },
  enterprise: {
    en: "10% of a comparable RFP contract from an incumbent vendor",
    uk: "10% від порівнянного контракту RFP від постачальника-конкурента",
  },
};

/**
 * Counter-narratives for common sales objections.
 * Keys are competitor IDs; values are the counter-story.
 */
export const COUNTER_NARRATIVES: Record<string, { en: string; uk: string }> = {
  liveuamap: {
    en: '"Real-time + verification" vs "speed without verification"',
    uk: '"Реальний час + верифікація" на противагу "швидкості без верифікації"',
  },
  "recorded-future": {
    en: '"Transparent confidence scoring" vs "black-box risk score"',
    uk: '"Прозорий скоринг впевненості" на противагу "непрозорій оцінці ризику"',
  },
  palantir: {
    en: '"Self-serve start in hours" vs "12-month procurement cycle"',
    uk: '"Самостійне підключення за години" на противагу "12-місячному тендеру"',
  },
  janes: {
    en: '"AI-native UX" vs "legacy console with stale data"',
    uk: '"ШІ-нативний UX" на противагу "застарілому консольному інтерфейсу з протухлими даними"',
  },
  default: {
    en: '"Civic-mission backbone" vs "purely commercial intel" — credibility moat',
    uk: '"Громадянська місія" на противагу "суто комерційній розвідці" — перевага довіри',
  },
};

// ── Helper ────────────────────────────────────────────────────────────────────

export function getCompetitorById(id: string): Competitor | undefined {
  return COMPETITOR_MATRIX.find((c) => c.id === id);
}

export function getCompetitorsByTier(tier: CompetitorTier): Competitor[] {
  return COMPETITOR_MATRIX.filter((c) => c.tier === tier);
}
