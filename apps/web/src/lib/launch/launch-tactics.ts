/**
 * Launch tactics — LTD tiers, founder pricing, and guardrails.
 *
 * Тактики запуску — рівні LTD, ціни для засновників та обмеження.
 *
 * Source: TODO/monetization/TODO_launch_tactics.md
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LtdTier {
  id: string;
  name_en: string;
  name_uk: string;
  /** One-time purchase price in USD */
  priceUsd: number;
  /** The subscription tier this LTD grants access to */
  grantedTierId: string;
  /** Maximum number of lifetime-deal codes available */
  maxSeats: number;
  /** Codes sold so far */
  seatsSold: number;
  /**
   * ISO date after which no new LTD codes of this tier are issued.
   * LTD = lifetime of product or 7 years, whichever shorter.
   */
  sunsetDate: string;
  /** Derived: seatsSold < maxSeats && today < sunsetDate */
  isAvailable: boolean;
}

// ── LTD Tiers ─────────────────────────────────────────────────────────────────

/**
 * Three lifetime-deal tiers for the Phase 1–2 launch window.
 *
 * LTDs are strictly time-bounded and seat-capped.
 * They do NOT include add-ons, API beyond fair-use, or future Pro+ features
 * introduced after the LTD purchase date.
 *
 * Три рівні пожиттєвих угод для вікна запуску Фаз 1–2.
 */
export const LTD_TIERS: LtdTier[] = [
  {
    id: "ltd-founder-pro",
    name_en: "Founder LTD — Pro Lifetime",
    name_uk: "Засновницький LTD — Pro пожиттєво",
    priceUsd: 299,
    grantedTierId: "pro",
    maxSeats: 100,
    seatsSold: 0,
    sunsetDate: "2026-12-31",
    isAvailable: true,
  },
  {
    id: "ltd-founder-pro-plus",
    name_en: "Founder LTD — Pro+ Lifetime",
    name_uk: "Засновницький LTD — Pro+ пожиттєво",
    priceUsd: 499,
    grantedTierId: "pro-plus",
    maxSeats: 50,
    seatsSold: 0,
    sunsetDate: "2026-12-31",
    isAvailable: true,
  },
  {
    id: "ltd-founder-team",
    name_en: "Founder LTD — Team Lifetime",
    name_uk: "Засновницький LTD — Team пожиттєво",
    priceUsd: 999,
    grantedTierId: "team",
    maxSeats: 25,
    seatsSold: 0,
    sunsetDate: "2026-12-31",
    isAvailable: true,
  },
];

// ── Guardrails ────────────────────────────────────────────────────────────────

/**
 * Non-negotiable constraints for launch pricing tactics.
 *
 * Незмінні обмеження для тактик ціноутворення при запуску.
 */
export const LAUNCH_TACTICS_CONSTRAINTS: string[] = [
  "LTD codes are time-bounded only: sunset date enforced in billing system. " +
    "All LTD codes must be deactivated for new sales by end of Phase 2.",

  "LTD does not include add-ons, API usage beyond fair-use limits, or Pro+ " +
    "features introduced more than 6 months after the customer's LTD purchase date.",

  "Founder-pricing locked SKU must be a separate Stripe Product ID. " +
    "Do not mix with the main subscription catalogue.",

  "No new LTD codes after GA + 6 months. 'GA' = first public Product Hunt launch date.",

  "Track LTD cohort cost-to-serve quarterly via the billing dashboard. " +
    "If LTD cohort cost-to-serve exceeds LTD revenue within 18 months, " +
    "initiate fair-use policy review or structured restructuring offer.",

  "AppSumo / LTD-style lifetime deals are capped at 500 total codes across " +
    "all tiers. This cap is hard — do not override without board approval.",

  "Founder pricing (first 100 paying customers, 50% off forever) must use " +
    "a separate Stripe Product / price object, not a coupon on the main price.",
];

// ── Sunset Policy ─────────────────────────────────────────────────────────────

/**
 * LTD sunset policy string (English).
 *
 * Рядок політики завершення LTD (англійська).
 */
export const LTD_SUNSET_POLICY_EN =
  "Aegis Lens Lifetime Deal — Fair Use & Sunset Policy\n\n" +
  "1. LIFETIME DEFINITION. 'Lifetime' means the lifetime of the Aegis Lens " +
  "product or seven (7) years from your purchase date, whichever is shorter. " +
  "If the product is discontinued, LTD holders will receive 90 days' notice " +
  "and a pro-rated refund for the remaining portion of the 7-year term.\n\n" +
  "2. FAIR-USE CAP. LTD access is subject to the fair-use resource caps " +
  "published at aegislens.uk/ltd-policy. Usage exceeding the cap (e.g., " +
  "API calls >10× the standard plan daily limit) may result in throttling " +
  "or a restructuring offer.\n\n" +
  "3. FEATURE SCOPE. Your LTD grants access to features available in your " +
  "granted tier on your purchase date. Features added to higher tiers after " +
  "your purchase date are not included unless explicitly announced as LTD inclusions.\n\n" +
  "4. ADD-ONS EXCLUDED. Add-on products (AI Copilot booster, vector export, " +
  "enterprise compliance pack) are not included in any LTD tier and must be " +
  "purchased separately at the standard rate.\n\n" +
  "5. TRANSFERABILITY. LTD codes are non-transferable and tied to the " +
  "purchasing account. Resale of LTD codes is prohibited.";

/**
 * LTD sunset policy string (Ukrainian).
 *
 * Рядок політики завершення LTD (українська).
 */
export const LTD_SUNSET_POLICY_UK =
  "Aegis Lens — Пожиттєва угода: політика справедливого використання та завершення\n\n" +
  "1. ВИЗНАЧЕННЯ «ПОЖИТТЄВО». «Пожиттєво» означає термін існування продукту " +
  "Aegis Lens або сім (7) років з дати покупки — залежно від того, що коротше. " +
  "У разі припинення роботи продукту власники LTD отримають 90-денне повідомлення " +
  "та пропорційне відшкодування за решту 7-річного терміну.\n\n" +
  "2. ОБМЕЖЕННЯ СПРАВЕДЛИВОГО ВИКОРИСТАННЯ. Доступ за LTD підпадає під " +
  "обмеження ресурсів справедливого використання, опубліковані на " +
  "aegislens.uk/ltd-policy. Перевищення ліміту може призвести до " +
  "обмеження або пропозиції перегляду умов.\n\n" +
  "3. ОБСЯГ ФУНКЦІЙ. Ваш LTD надає доступ до функцій, доступних у вашому " +
  "рівні на дату покупки. Функції, додані до вищих рівнів після вашої " +
  "дати покупки, не включені.\n\n" +
  "4. НАДБУДОВИ ВИКЛЮЧЕНІ. Додаткові продукти (AI Copilot booster, vector " +
  "export, пакет відповідності для enterprise) не включені в жоден рівень LTD " +
  "і купуються окремо за стандартною ціною.\n\n" +
  "5. НЕПЕРЕДАВАНІСТЬ. Коди LTD є непередаваними та прив'язані до акаунту " +
  "покупця. Перепродаж кодів LTD заборонено.";
