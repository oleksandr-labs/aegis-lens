/**
 * Payments — tax operations & multi-currency settlement.
 *
 * Defines tax handling strategies, settlement consolidation notes,
 * and per-region payment-method conversion-rate tracking placeholders.
 *
 * Операції з податками та мультивалютним розрахунком:
 * стратегії обробки податків, консолідація розрахунків,
 * відстеження конверсійних ставок платіжних методів за регіонами.
 */

// ── Tax handler registry ──────────────────────────────────────────────────────

/**
 * Tax handling strategies used across different market segments.
 * Стратегії обробки податків для різних ринкових сегментів.
 */
export const TAX_HANDLERS = {
  /**
   * Stripe Tax — primary tax handler for standard subscriptions.
   * Covers VAT (EU/UK), GST (AU/CA/NZ), and US Sales Tax automatically.
   *
   * Stripe Tax — основний обробник податків для стандартних підписок.
   */
  stripeTax: {
    id: "stripe-tax",
    name_en: "Stripe Tax (Automatic)",
    name_uk: "Stripe Tax (Автоматично)",
    description_en: "Automatic tax calculation and collection via Stripe Tax. Handles VAT (EU/UK), GST (AU/CA/NZ), and US Sales Tax. Enabled by default for all Stripe-processed transactions.",
    description_uk: "Автоматичний розрахунок і збір податків через Stripe Tax. Охоплює ПДВ (ЄС/UK), GST (AU/CA/NZ) і торговий податок США. Увімкнено за замовчуванням для всіх транзакцій через Stripe.",
    applies_to: ["stripe-direct"] as const,
    tax_types: ["VAT", "GST", "Sales Tax"] as const,
    automatic: true,
  },

  /**
   * Manual tax layer — for niche overrides, custom B2B agreements,
   * or jurisdictions not fully covered by Stripe Tax.
   *
   * Ручний шар обробки податків — для нішевих випадків і кастомних угод.
   */
  manualLayer: {
    id: "manual-layer",
    name_en: "Manual Tax Layer (Niche Overrides)",
    name_uk: "Ручний шар обробки податків (нішеві випадки)",
    description_en: "Manual tax handling for edge cases: custom B2B agreements, tax-exempt certificates, jurisdictions with unusual rules, or override of automatic calculations.",
    description_uk: "Ручна обробка податків для граничних випадків: кастомні B2B угоди, довідки про звільнення від податків, юрисдикції з нестандартними правилами або перевизначення автоматичних розрахунків.",
    applies_to: ["stripe-direct", "invoice-wire"] as const,
    tax_types: ["custom", "tax-exempt", "override"] as const,
    automatic: false,
  },

  /**
   * EU B2B Reverse Charge — for cross-border B2B transactions within the EU.
   * Buyer accounts for VAT in their jurisdiction under Article 196 of EU VAT Directive.
   *
   * Механізм зворотного стягування ПДВ для B2B транзакцій в ЄС.
   */
  reverseChargeEuB2b: {
    id: "reverse-charge-eu-b2b",
    name_en: "EU B2B Reverse Charge (Art. 196 VAT Directive)",
    name_uk: "Зворотне стягування ПДВ для B2B в ЄС (Ст. 196 Директиви ПДВ)",
    description_en: "For cross-border B2B sales within the EU: VAT is reverse-charged to the buyer (they account for it in their own jurisdiction). Requires valid VAT ID verification of the buyer.",
    description_uk: "Для транскордонних B2B продажів в ЄС: ПДВ зворотно стягується з покупця (він обліковує його у своїй юрисдикції). Потребує перевірки дійсного ПДВ-номера покупця.",
    applies_to: ["stripe-direct", "paddle", "invoice-wire"] as const,
    tax_types: ["VAT-reverse-charge"] as const,
    automatic: false,
  },
} as const;

// ── Multi-currency operations ─────────────────────────────────────────────────

/**
 * Multi-currency operational notes and placeholder structures.
 * Операційні нотатки та структури для мультивалютної роботи.
 */
export const MULTI_CURRENCY_OPERATIONS = {
  /**
   * Settlement consolidation.
   * All regional revenues are settled in USD as the primary currency.
   * Regional currencies are converted at prevailing rates at time of settlement.
   *
   * Консолідація розрахунків у USD.
   */
  settlementConsolidation: {
    settlement_currency: "USD" as const,
    note_en: "All regional revenues (UAH, PLN, EUR, GBP) are converted and settled in USD. FX conversion occurs at the prevailing mid-market rate at time of settlement. Quarterly FX locks protect forward pricing from volatility.",
    note_uk: "Усі регіональні доходи (UAH, PLN, EUR, GBP) конвертуються та розраховуються в USD. Конверсія валюти відбувається за поточним середньоринковим курсом на момент розрахунку. Щоквартальна фіксація курсу захищає перспективне ціноутворення від волатильності.",
  },

  /**
   * Per-region payment-method conversion-rate tracking placeholder.
   * In production, populate with real data from analytics / payment provider dashboards.
   *
   * Заглушка для відстеження конверсійних ставок методів оплати за регіонами.
   * У продакшені — заповнити реальними даними з аналітики / дашбордів провайдерів.
   */
  conversionRateTracking: {
    enabled: false, // Toggle to true when analytics pipeline is connected
    note_en: "Track checkout conversion rate per payment method per region to identify gaps. E.g. Poland without BLIK loses ~50% conversion. Wire to payment provider analytics dashboards.",
    note_uk: "Відстежувати конверсію оформлення замовлення за методом оплати і регіоном для виявлення пробілів. Напр., Польща без BLIK втрачає ~50% конверсії. Підключити до аналітичних дашбордів провайдерів.",
    // TODO: Add per-region, per-method conversion metrics when analytics is live.
    metrics_placeholder: {} as Record<string, Record<string, number>>,
  },
};

// ── Tax notes ─────────────────────────────────────────────────────────────────

/**
 * General tax handling note — English.
 */
export const TAX_NOTE_EN =
  "Tax is calculated and collected automatically via Stripe Tax for all " +
  "standard subscription and one-time payments. EU B2B customers with a " +
  "valid VAT ID are subject to reverse charge. Enterprise/Gov invoices " +
  "include a manual tax layer for custom agreements, tax-exempt certificates, " +
  "and jurisdictions requiring bespoke handling. Merchant of Record vendors " +
  "(Paddle, Lemon Squeezy, FastSpring) handle all tax obligations in their " +
  "respective markets independently.";

/**
 * General tax handling note — Ukrainian.
 * Загальна нотатка щодо обробки податків — українською.
 */
export const TAX_NOTE_UK =
  "Податки розраховуються та збираються автоматично через Stripe Tax для всіх " +
  "стандартних підписок і одноразових платежів. B2B клієнти з ЄС із дійсним " +
  "ПДВ-номером підпадають під механізм зворотного стягування. Рахунки-фактури " +
  "для підприємств та уряду включають ручний шар для кастомних угод, довідок " +
  "про звільнення від податків та юрисдикцій з нестандартними вимогами. " +
  "Постачальники Merchant of Record (Paddle, Lemon Squeezy, FastSpring) " +
  "самостійно обробляють усі податкові зобов'язання на своїх ринках.";
