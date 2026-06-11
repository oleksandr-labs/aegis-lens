/**
 * Payments — Merchant of Record (MoR) configuration.
 *
 * Defines which MoR vendor handles tax, compliance, and payment collection
 * per region / deal size. Also covers local UA payment providers and
 * enterprise/gov procurement workflows.
 *
 * Конфігурація Merchant of Record: який постачальник обробляє податки,
 * відповідність вимогам і збір платежів за регіоном / розміром угоди.
 */

// ── MoR vendor type ───────────────────────────────────────────────────────────

/**
 * Supported Merchant of Record vendors.
 * Підтримувані постачальники Merchant of Record.
 */
export type MoRVendor =
  | "stripe-direct"   // Stripe direct — full control, manual tax handling
  | "paddle"          // Paddle — global MoR, handles VAT/GST/sales-tax
  | "lemon-squeezy"   // Lemon Squeezy — alternative MoR for indie/SaaS
  | "fastspring";     // FastSpring — B2B software, procurement-friendly

// ── MoR config interface ──────────────────────────────────────────────────────

/**
 * Configuration for a single Merchant of Record vendor.
 * Конфігурація одного постачальника Merchant of Record.
 */
export interface MoRConfig {
  /** Vendor identifier. */
  vendor: MoRVendor;

  /** Display name — English. */
  name_en: string;

  /** Display name — Ukrainian. */
  name_uk: string;

  /** Primary markets / regions this vendor is recommended for. */
  primary_markets: string[];

  /** Whether this vendor acts as the legal Merchant of Record (handles tax filing). */
  is_mor: boolean;

  /** Tax obligations handled by this vendor. */
  tax_handling: string[];

  /** Short description — English. */
  description_en: string;

  /** Short description — Ukrainian. */
  description_uk: string;

  /** Recommended deal size range in USD. null = no limit. */
  recommended_deal_usd_min: number | null;
  recommended_deal_usd_max: number | null;
}

// ── MoR configurations ────────────────────────────────────────────────────────

/**
 * Full MoR vendor configuration map.
 * Повна карта конфігурацій постачальників MoR.
 */
export const MOR_CONFIGS: Record<MoRVendor, MoRConfig> = {
  "stripe-direct": {
    vendor: "stripe-direct",
    name_en: "Stripe Direct",
    name_uk: "Stripe Direct",
    primary_markets: ["US", "EU", "UK", "AU"],
    is_mor: false,
    tax_handling: ["VAT via Stripe Tax", "GST via Stripe Tax", "Sales Tax via Stripe Tax"],
    description_en: "Stripe direct integration as primary processor for US, EU, UK, and Australia. Stripe Tax handles VAT and GST automatically. Aegis Lens remains the legal merchant.",
    description_uk: "Пряма інтеграція зі Stripe як основним процесором для США, ЄС, Великої Британії та Австралії. Stripe Tax автоматично обробляє ПДВ і GST. Aegis Lens залишається юридичним мерчантом.",
    recommended_deal_usd_min: 0,
    recommended_deal_usd_max: null,
  },
  "paddle": {
    vendor: "paddle",
    name_en: "Paddle",
    name_uk: "Paddle",
    primary_markets: ["Global", "EU", "UK", "Asia-Pacific", "Latin America"],
    is_mor: true,
    tax_handling: ["VAT", "GST", "Sales Tax", "Digital Services Tax"],
    description_en: "Paddle acts as Merchant of Record globally, handling all VAT/GST/sales-tax registration, filing, and remittance. Ideal for indie/consumer products in tax-heavy global markets.",
    description_uk: "Paddle виступає Merchant of Record глобально, обробляючи реєстрацію, подання та сплату ПДВ/GST/торгового податку. Ідеально для indie/споживчих продуктів на глобальних ринках з високим оподаткуванням.",
    recommended_deal_usd_min: 0,
    recommended_deal_usd_max: 10000,
  },
  "lemon-squeezy": {
    vendor: "lemon-squeezy",
    name_en: "Lemon Squeezy",
    name_uk: "Lemon Squeezy",
    primary_markets: ["Global", "US", "EU"],
    is_mor: true,
    tax_handling: ["VAT", "Sales Tax", "Digital Services Tax"],
    description_en: "Lemon Squeezy as alternative MoR — simpler setup, strong developer experience. Good fallback when Paddle is unavailable or for lower-volume products.",
    description_uk: "Lemon Squeezy як альтернативний MoR — простіше налаштування, зручний для розробників. Хороший запасний варіант при недоступності Paddle або для продуктів з нижчим обсягом.",
    recommended_deal_usd_min: 0,
    recommended_deal_usd_max: 5000,
  },
  "fastspring": {
    vendor: "fastspring",
    name_en: "FastSpring",
    name_uk: "FastSpring",
    primary_markets: ["Global", "B2B", "Enterprise"],
    is_mor: true,
    tax_handling: ["VAT", "GST", "Sales Tax", "B2B Tax Exempt Certificates"],
    description_en: "FastSpring as MoR for B2B software sales — supports procurement workflows, purchase orders, and tax-exempt certificates for enterprise buyers.",
    description_uk: "FastSpring як MoR для B2B продажу програмного забезпечення — підтримує процеси закупівель, замовлення-наряди та довідки про звільнення від податків для корпоративних покупців.",
    recommended_deal_usd_min: 1000,
    recommended_deal_usd_max: null,
  },
};

// ── Local UA payment providers ────────────────────────────────────────────────

/**
 * Ukrainian local payment providers for hryvnia-priced customers.
 * Місцеві українські платіжні провайдери для клієнтів у гривнях.
 */
export const LOCAL_UA_PAYMENT_PROVIDERS = [
  {
    id: "liqpay",
    displayName_en: "LiqPay",
    displayName_uk: "LiqPay",
    currency: "UAH" as const,
    description_en: "PrivatBank's payment platform — most widely used in Ukraine for card payments.",
    description_uk: "Платіжна платформа ПриватБанку — найпоширеніша в Україні для карткових платежів.",
  },
  {
    id: "fondy",
    displayName_en: "Fondy",
    displayName_uk: "Fondy",
    currency: "UAH" as const,
    description_en: "Fondy payment gateway — supports UAH and EUR, wide Ukrainian merchant coverage.",
    description_uk: "Платіжний шлюз Fondy — підтримує гривню та євро, широке охоплення українських мерчантів.",
  },
  {
    id: "monobank",
    displayName_en: "Monobank",
    displayName_uk: "Монобанк",
    currency: "UAH" as const,
    description_en: "Monobank — popular Ukrainian neobank with integrated payment capabilities.",
    description_uk: "Монобанк — популярний український необанк з вбудованими платіжними можливостями.",
  },
];

// ── Enterprise / Gov payment config ──────────────────────────────────────────

/**
 * Enterprise and Government payment workflow configuration.
 * Конфігурація платіжного workflow для підприємств та уряду.
 */
export const ENTERPRISE_GOV_PAYMENT = {
  methods: ["invoice-wire", "purchase-order"] as const,
  payment_terms: ["NET30", "NET60"] as const,
  min_deal_usd: 5000,
  procurement_integrations: ["PunchOut", "Coupa"] as const,
  description_en: "Enterprise and Government deals ≥ $5k are handled via invoice and bank wire (NET30/60 payment terms). Purchase Order workflow supported with PunchOut and Coupa procurement system integration.",
  description_uk: "Угоди для підприємств та уряду від $5k обробляються через рахунок-фактуру та банківський переказ (умови оплати NET30/60). Підтримується workflow замовлень-нарядів з інтеграцією систем закупівель PunchOut і Coupa.",
};

// ── Recommendation logic ──────────────────────────────────────────────────────

/**
 * Recommend the best MoR vendor for a given region and deal size.
 * Simple heuristic — extend with more rules as needed.
 *
 * Рекомендує найкращого MoR постачальника за регіоном і розміром угоди.
 * Проста евристика — розширити за потреби.
 *
 * @param region       Region code or name (e.g. "US", "EU", "UA", "Global")
 * @param dealSizeUsd  Deal size in USD
 * @returns Recommended MoR vendor
 */
export function getRecommendedMoR(region: string, dealSizeUsd: number): MoRVendor {
  const regionUpper = region.toUpperCase();

  // Enterprise / B2B deals → FastSpring
  if (dealSizeUsd >= 5000 && (regionUpper.includes("ENTERPRISE") || regionUpper.includes("GOV"))) {
    return "fastspring";
  }

  // Direct Stripe markets (US, EU, UK, AU, Canada)
  if (
    regionUpper === "US" ||
    regionUpper === "EU" ||
    regionUpper === "UK" ||
    regionUpper === "AU" ||
    regionUpper === "CA"
  ) {
    return "stripe-direct";
  }

  // Ukraine — not a primary Paddle/LS market; use Stripe direct + local providers
  if (regionUpper === "UA" || regionUpper === "UKRAINE") {
    return "stripe-direct";
  }

  // Smaller deals in global / tax-heavy markets → Lemon Squeezy
  if (dealSizeUsd < 1000) {
    return "lemon-squeezy";
  }

  // Default: Paddle for global consumer / mid-market
  return "paddle";
}
