/**
 * Reports Marketplace — product catalogue and pipeline config
 *
 * Defines all purchasable intelligence report products, their pricing,
 * delivery methods, and the AI + analyst creation pipeline.
 *
 * NOTE: apps/web/src/lib/reports-data.ts contains seed/draft report instances.
 * This file is the marketplace/product config layer — separate concern.
 *
 * Каталог звітів і конфігурація пайплайну створення.
 * reports-data.ts — це зразки/чернетки, цей файл — продуктовий конфіг.
 */

// ── Report product types ───────────────────────────────────────────────────────

/**
 * All purchasable report format identifiers.
 * Ідентифікатори всіх типів звітів для купівлі.
 */
export type ReportType =
  | "daily-brief"
  | "weekly-deep-dive"
  | "monthly-intel"
  | "monthly-intel-sub"
  | "quarterly-outlook"
  | "annual-year-review"
  | "on-demand-bespoke"
  | "event-triggered-flash"
  | "aoi-report-bundle";

// ── Delivery method ────────────────────────────────────────────────────────────

/**
 * Supported delivery mechanisms — no app account required for any of them.
 * Підтримувані способи доставки — акаунт не потрібен.
 */
export type ReportDelivery = "pdf" | "web-reader" | "email";

// ── Product interface ──────────────────────────────────────────────────────────

/**
 * A single report product configuration.
 * Конфігурація одного продукту-звіту.
 */
export interface ReportProduct {
  /** Unique product identifier */
  id: ReportType;
  /** Product name — English */
  name_en: string;
  /** Product name — Ukrainian */
  name_uk: string;
  /** Price in USD (one-off purchase or monthly subscription amount) */
  priceUsd: number;
  /** True for recurring subscriptions, false for one-off purchases */
  isSubscription: boolean;
  /** Human-readable billing period label — English */
  periodLabel_en: string;
  /** Human-readable billing period label — Ukrainian */
  periodLabel_uk: string;
  /** Approximate page count, if applicable */
  pageCount?: number;
  /** Available delivery methods */
  deliveryMethods: ReportDelivery[];
  /** Whether a public preview (TL;DR + first chart) is available for SEO */
  hasPublicPreview: boolean;
  /**
   * How long (in days) subscribers/buyers can access the archive.
   * -1 = lifetime / unlimited access.
   */
  archiveAccessDuration_days: number;
  /**
   * Co-branding price markup as a percentage (e.g. 0.50 = +50%).
   * Applied on top of base priceUsd for reseller / newsroom white-label orders.
   */
  coBrandingMarkup_pct: number;
}

// ── Report product catalogue ───────────────────────────────────────────────────

/**
 * Canonical list of all report products available in the marketplace.
 * Канонічний список усіх продуктів-звітів у маркетплейсі.
 */
export const REPORT_PRODUCTS: ReportProduct[] = [
  {
    id: "daily-brief",
    name_en: "Daily Intelligence Brief",
    name_uk: "Щоденний розвідувальний брифінг",
    priceUsd: 14,
    isSubscription: true,
    periodLabel_en: "per month",
    periodLabel_uk: "на місяць",
    pageCount: 2,
    deliveryMethods: ["pdf", "email"],
    hasPublicPreview: true,
    archiveAccessDuration_days: 30,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "weekly-deep-dive",
    name_en: "Weekly Deep-Dive",
    name_uk: "Щотижневий поглиблений аналіз",
    priceUsd: 49,
    isSubscription: true,
    periodLabel_en: "per month",
    periodLabel_uk: "на місяць",
    pageCount: 10,
    deliveryMethods: ["pdf", "web-reader", "email"],
    hasPublicPreview: true,
    archiveAccessDuration_days: 90,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "monthly-intel",
    name_en: "Monthly Intelligence Report (one-off)",
    name_uk: "Щомісячний звіт (разова купівля)",
    priceUsd: 199,
    isSubscription: false,
    periodLabel_en: "one-off",
    periodLabel_uk: "разова купівля",
    pageCount: 30,
    deliveryMethods: ["pdf", "web-reader"],
    hasPublicPreview: true,
    archiveAccessDuration_days: -1,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "monthly-intel-sub",
    name_en: "Monthly Intelligence Report (subscription)",
    name_uk: "Щомісячний звіт (підписка)",
    priceUsd: 99,
    isSubscription: true,
    periodLabel_en: "per month",
    periodLabel_uk: "на місяць",
    pageCount: 30,
    deliveryMethods: ["pdf", "web-reader", "email"],
    hasPublicPreview: true,
    archiveAccessDuration_days: 365,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "quarterly-outlook",
    name_en: "Quarterly Strategic Outlook",
    name_uk: "Квартальний стратегічний прогноз",
    priceUsd: 499,
    isSubscription: false,
    periodLabel_en: "one-off",
    periodLabel_uk: "разова купівля",
    pageCount: 50,
    deliveryMethods: ["pdf", "web-reader"],
    hasPublicPreview: true,
    archiveAccessDuration_days: -1,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "annual-year-review",
    name_en: "Annual Year-in-Review",
    name_uk: "Річний огляд",
    priceUsd: 299,
    isSubscription: false,
    periodLabel_en: "one-off (flagship)",
    periodLabel_uk: "разова купівля (флагман)",
    pageCount: 80,
    deliveryMethods: ["pdf", "web-reader"],
    hasPublicPreview: true,
    archiveAccessDuration_days: -1,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "on-demand-bespoke",
    name_en: "On-Demand Bespoke Report",
    name_uk: "Звіт на замовлення",
    priceUsd: 5_000,
    isSubscription: false,
    periodLabel_en: "one-off (sales-led)",
    periodLabel_uk: "разова купівля (через продажі)",
    deliveryMethods: ["pdf", "web-reader", "email"],
    hasPublicPreview: false,
    archiveAccessDuration_days: -1,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "event-triggered-flash",
    name_en: "Event-Triggered Flash Report",
    name_uk: "Терміновий звіт за подією",
    priceUsd: 99,
    isSubscription: false,
    periodLabel_en: "one-off",
    periodLabel_uk: "разова купівля",
    pageCount: 5,
    deliveryMethods: ["pdf", "email"],
    hasPublicPreview: true,
    archiveAccessDuration_days: -1,
    coBrandingMarkup_pct: 0.5,
  },
  {
    id: "aoi-report-bundle",
    name_en: "AOI Report Bundle (12 × Monthly)",
    name_uk: "Пакет звітів по AOI (12 × щомісячний)",
    priceUsd: 999,
    isSubscription: true,
    periodLabel_en: "per year",
    periodLabel_uk: "на рік",
    pageCount: 30,
    deliveryMethods: ["pdf", "web-reader", "email"],
    hasPublicPreview: false,
    archiveAccessDuration_days: 365,
    coBrandingMarkup_pct: 0.5,
  },
];

// ── Creation pipeline config ───────────────────────────────────────────────────

/**
 * Describes how each report is created and quality-assured.
 * Описує процес створення та контролю якості кожного звіту.
 */
export const REPORT_CREATION_PIPELINE = {
  /** Reports are AI-drafted using internal Aegis data + Copilot (Anthropic-backed) */
  aiDrafted_anthropicBacked: true,
  /** Every report is reviewed by a human analyst before publication */
  analystReviewed: true,
  /** Final editorial pass and publication by an editor */
  editorPublished: true,
  /** Confidence score + source list footer is automatically appended */
  confidenceFooterAutoAttached: true,
  /** Reports are versioned (v1, v2, …) and support retraction notices */
  versionedWithRetraction: true,
} as const;

// ── Distribution config ────────────────────────────────────────────────────────

/**
 * Marketplace distribution and monetisation settings.
 * Налаштування дистрибуції та монетизації маркетплейсу.
 */
export const REPORT_DISTRIBUTION = {
  /** All report products are Stripe Products with one-off and/or recurring Prices */
  stripeProductsWithRecurringPrices: true,
  /** Public preview available on every report for SEO and shareability */
  publicPreviewForSeoAndShareability: true,
  /** All three delivery channels supported across the catalogue */
  pdfPlusWebPlusEmail: true,
  cobranding: {
    /** Resellers pay base price + this markup (0.50 = 50% premium) */
    markupPct: 0.5,
    /** Who is eligible for co-branded / white-label report orders */
    allowedFor: "newsrooms-consultancies" as const,
  },
} as const;

// ── Helper functions ───────────────────────────────────────────────────────────

/**
 * Look up a report product by its ID.
 * Returns undefined if the ID is not found.
 *
 * Пошук продукту-звіту за ID. Повертає undefined, якщо не знайдено.
 */
export function getReportProduct(id: ReportType): ReportProduct | undefined {
  return REPORT_PRODUCTS.find((p) => p.id === id);
}

/**
 * Returns all subscription-based report products.
 * Повертає всі продукти-звіти з підпискою.
 */
export function getSubscriptionReports(): ReportProduct[] {
  return REPORT_PRODUCTS.filter((p) => p.isSubscription);
}

/**
 * Returns all one-off (non-subscription) report products.
 * Повертає всі разові продукти-звіти.
 */
export function getOneOffReports(): ReportProduct[] {
  return REPORT_PRODUCTS.filter((p) => !p.isSubscription);
}
