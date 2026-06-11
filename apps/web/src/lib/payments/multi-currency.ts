/**
 * Payments — multi-currency & regional payment method configuration.
 *
 * Defines supported currencies, payment methods, and per-region configs
 * to maximise collectable revenue across all target markets.
 *
 * Мультивалютна конфігурація: підтримувані валюти, методи оплати,
 * регіональні налаштування для максимального охоплення ринків.
 */

// ── Supported currencies ──────────────────────────────────────────────────────

/**
 * Currencies supported for display and pricing on the platform.
 * Валюти, підтримувані для відображення та ціноутворення.
 */
export type SupportedCurrency = "USD" | "EUR" | "UAH" | "PLN" | "GBP";

// ── Payment methods ───────────────────────────────────────────────────────────

/**
 * All payment methods supported across all regions.
 * Усі методи оплати, підтримувані на всіх ринках.
 */
export type PaymentMethod =
  | "stripe-card"      // Standard card payments via Stripe
  | "paddle"           // Paddle as Merchant of Record
  | "lemon-squeezy"    // Lemon Squeezy as Merchant of Record
  | "liqpay"           // Ukrainian payment provider (UA market)
  | "fondy"            // Ukrainian/EU payment provider
  | "monobank"         // Monobank (UA)
  | "blik"             // BLIK — Poland instant payments
  | "crypto-btc"       // Bitcoin — restricted-region + privacy-conscious
  | "crypto-usdt"      // USDT stablecoin
  | "crypto-eth"       // Ethereum
  | "crypto-sol"       // Solana
  | "invoice-wire"     // Invoice + bank wire (Enterprise/Gov)
  | "ach-sepa"         // ACH (US) / SEPA Direct Debit (EU) — low-fee recurring
  | "apple-pay"        // Apple Pay (mobile web + native)
  | "google-pay"       // Google Pay (mobile web + native)
  | "purchase-order";  // PO workflow (Gov/Enterprise procurement)

// ── Regional payment config ───────────────────────────────────────────────────

/**
 * Payment configuration for a single region or market segment.
 * Конфігурація оплати для конкретного регіону або ринкового сегменту.
 */
export interface RegionalPaymentConfig {
  /** Region identifier. */
  region: string;

  /** Display name — English. */
  name_en: string;

  /** Display name — Ukrainian. */
  name_uk: string;

  /** Primary display and settlement currency for this region. */
  primaryCurrency: SupportedCurrency;

  /** Payment methods available in this region, in priority order. */
  methods: PaymentMethod[];

  /** Additional notes — English. */
  notes_en: string;

  /** Additional notes — Ukrainian. */
  notes_uk: string;
}

// ── Regional configurations ───────────────────────────────────────────────────

/**
 * Per-region payment configurations.
 * Регіональні конфігурації оплати.
 */
export const REGIONAL_PAYMENT_CONFIGS: RegionalPaymentConfig[] = [
  {
    region: "us-eu-uk-au",
    name_en: "US / EU / UK / Australia",
    name_uk: "США / ЄС / Велика Британія / Австралія",
    primaryCurrency: "USD",
    methods: [
      "stripe-card",
      "apple-pay",
      "google-pay",
      "ach-sepa",
    ],
    notes_en: "Stripe direct as primary processor. VAT/GST handled via Stripe Tax. ACH (US) and SEPA (EU/UK) for low-fee recurring subscriptions.",
    notes_uk: "Stripe як основний процесор. ПДВ/GST через Stripe Tax. ACH (США) і SEPA (ЄС/UK) для регулярних платежів з низькою комісією.",
  },
  {
    region: "ukraine",
    name_en: "Ukraine",
    name_uk: "Україна",
    primaryCurrency: "UAH",
    methods: [
      "liqpay",
      "fondy",
      "monobank",
      "stripe-card",
      "crypto-btc",
      "crypto-usdt",
    ],
    notes_en: "LiqPay, Fondy, and Monobank as primary UA providers for hryvnia-priced customers. Without LiqPay, local B2C conversion is near zero.",
    notes_uk: "LiqPay, Fondy та Monobank як основні провайдери для клієнтів з оплатою в гривнях. Без LiqPay локальна B2C конверсія — фактично нуль.",
  },
  {
    region: "poland",
    name_en: "Poland",
    name_uk: "Польща",
    primaryCurrency: "PLN",
    methods: [
      "blik",
      "stripe-card",
      "apple-pay",
      "google-pay",
    ],
    notes_en: "BLIK via Stripe Local Methods is critical for Poland — without it conversion drops by half.",
    notes_uk: "BLIK через Stripe Local Methods критично важливий для Польщі — без нього конверсія падає вдвічі.",
  },
  {
    region: "romania-turkey",
    name_en: "Romania / Turkey",
    name_uk: "Румунія / Туреччина",
    primaryCurrency: "EUR",
    methods: [
      "stripe-card",
      "apple-pay",
      "google-pay",
    ],
    notes_en: "Local card methods via Stripe Local Payment Methods. Pricing in EUR to minimise FX friction.",
    notes_uk: "Локальні карткові методи через Stripe Local Payment Methods. Ціноутворення в EUR для мінімізації валютних втрат.",
  },
  {
    region: "global-consumer",
    name_en: "Global Consumer (Indie / SaaS)",
    name_uk: "Глобальний споживач (Indie / SaaS)",
    primaryCurrency: "USD",
    methods: [
      "paddle",
      "lemon-squeezy",
      "stripe-card",
      "apple-pay",
      "google-pay",
    ],
    notes_en: "Paddle and Lemon Squeezy act as Merchant of Record for tax-heavy global markets, handling VAT/sales-tax compliance automatically.",
    notes_uk: "Paddle і Lemon Squeezy виступають Merchant of Record на глобальних ринках з високим податковим навантаженням, автоматично обробляючи ПДВ.",
  },
  {
    region: "enterprise-gov",
    name_en: "Enterprise / Government",
    name_uk: "Підприємства / Уряд",
    primaryCurrency: "USD",
    methods: [
      "invoice-wire",
      "purchase-order",
      "ach-sepa",
      "stripe-card",
    ],
    notes_en: "Invoice + bank wire (NET30/60) for deals ≥ $5k. PO + procurement workflow (PunchOut/Coupa) for government and enterprise purchasing.",
    notes_uk: "Рахунок-фактура + банківський переказ (NET30/60) для угод від $5k. PO та workflow закупівель (PunchOut/Coupa) для урядових і корпоративних замовників.",
  },
];

// ── Settlement currency ───────────────────────────────────────────────────────

/**
 * Primary settlement currency — all regional revenues consolidated in USD.
 * Основна розрахункова валюта — усі регіональні доходи зведено в USD.
 */
export const SETTLEMENT_CURRENCY: SupportedCurrency = "USD";

// ── FX policy ─────────────────────────────────────────────────────────────────

/**
 * FX lock policy — English.
 */
export const FX_LOCK_POLICY_EN =
  "Prices are locked quarterly per currency to protect customers from FX volatility.";

/**
 * FX lock policy — Ukrainian.
 * Політика фіксації курсу — українською.
 */
export const FX_LOCK_POLICY_UK =
  "Ціни фіксуються щоквартально в кожній валюті для захисту клієнтів від коливань курсу.";

// ── Crypto payment note ───────────────────────────────────────────────────────

/**
 * Crypto payment note — English.
 */
export const CRYPTO_PAYMENT_NOTE_EN =
  "Cryptocurrency payments (BTC, USDT, ETH, SOL) are available for donors " +
  "and customers in restricted regions where conventional payment rails are " +
  "unavailable, and for privacy-conscious customers who prefer not to share " +
  "card or banking details. Crypto payments are not the recommended default " +
  "for standard subscriptions.";

/**
 * Crypto payment note — Ukrainian.
 * Примітка щодо криптовалютних платежів — українською.
 */
export const CRYPTO_PAYMENT_NOTE_UK =
  "Криптовалютні платежі (BTC, USDT, ETH, SOL) доступні для донорів і клієнтів " +
  "у регіонах з обмеженим доступом до звичайних платіжних систем, а також для " +
  "клієнтів, які з міркувань конфіденційності не бажають ділитися даними картки " +
  "або банківського рахунку. Крипто не є рекомендованим за замовчуванням " +
  "способом оплати для стандартних підписок.";
