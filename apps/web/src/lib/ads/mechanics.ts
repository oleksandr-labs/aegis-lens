/**
 * Ads & Sponsored Revenue — operational mechanics.
 *
 * Defines slot types, checkout flow stubs, and transparency reporting.
 * Механіка спонсорської програми: типи слотів, оформлення замовлень,
 * квартальний звіт прозорості.
 */

import type { AdMechanics, AdSurface, SponsoredSlot } from "./types";

// ── Core mechanics config ─────────────────────────────────────────────────────

/**
 * Operational flags for the ads / sponsored-revenue programme.
 * Операційні параметри програми.
 */
export const AD_MECHANICS: AdMechanics = {
  selfServeSponsoredListingCheckout: true,
  salesLedForNewsletter: true,
  cpmAndFlatRateOptions: true,
  quarterlyTransparencyReport: true,
};

// ── Sponsored slot types ──────────────────────────────────────────────────────

/**
 * Available sponsored slot product types with display metadata.
 * Доступні типи спонсорських слотів.
 */
export const SPONSORED_SLOT_TYPES = {
  featured_directory_listing: {
    id: "featured_directory_listing",
    name_en: "Featured Directory Listing",
    name_uk: "Виділений лістинг у каталозі",
    description_en: "Highlighted entry at the top of the companies or experts directory.",
    description_uk: "Виділений запис у верхній частині каталогу компаній або експертів.",
    format: "featured-listing" as const,
    surfaces: ["companies-directory", "experts-directory"] as AdSurface[],
    pricing_model: "flat-rate" as const,
  },
  tools_directory_spotlight: {
    id: "tools_directory_spotlight",
    name_en: "Tools Directory Spotlight",
    name_uk: "Спотлайт у каталозі інструментів",
    description_en: "Sponsored entry in the tools & services directory.",
    description_uk: "Спонсорський запис у каталозі інструментів та послуг.",
    format: "featured-listing" as const,
    surfaces: ["tools-directory"] as AdSurface[],
    pricing_model: "flat-rate" as const,
  },
  newsletter_sponsor: {
    id: "newsletter_sponsor",
    name_en: "Newsletter Sponsor",
    name_uk: "Спонсор розсилки",
    description_en: "Single exclusive sponsor per newsletter issue.",
    description_uk: "Єдиний ексклюзивний спонсор одного випуску розсилки.",
    format: "newsletter-sponsor" as const,
    surfaces: ["newsletter"] as AdSurface[],
    pricing_model: "flat-rate" as const,
  },
  programmatic_page_banner: {
    id: "programmatic_page_banner",
    name_en: "Programmatic SEO Page Banner",
    name_uk: "Банер на програмній SEO-сторінці",
    description_en: "Relevant B2B sponsorship slot on programmatic SEO pages.",
    description_uk: "Релевантний B2B-слот на програмних SEO-сторінках.",
    format: "cpm" as const,
    surfaces: ["programmatic-seo-pages"] as AdSurface[],
    pricing_model: "cpm" as const,
  },
  academy_partner: {
    id: "academy_partner",
    name_en: "Academy Partner Sponsorship",
    name_uk: "Партнерство в академії",
    description_en: "Partner education sponsorship in academy guides and courses.",
    description_uk: "Спонсорство освітнього контенту в академії та навчальних матеріалах.",
    format: "academy-partner" as const,
    surfaces: ["academy-guides"] as AdSurface[],
    pricing_model: "flat-rate" as const,
  },
  job_board_posting: {
    id: "job_board_posting",
    name_en: "Job Board Posting",
    name_uk: "Публікація вакансії",
    description_en: "Paid job posting on the Aegis Lens job board (when launched).",
    description_uk: "Платна публікація вакансії на job board Aegis Lens (після запуску).",
    format: "flat-rate" as const,
    surfaces: ["job-board"] as AdSurface[],
    pricing_model: "flat-rate" as const,
  },
} as const;

// ── Checkout stub ─────────────────────────────────────────────────────────────

/**
 * Build a sponsored listing checkout payload.
 * In production, wire this to the Stripe checkout session or self-serve portal.
 *
 * Формує payload для оформлення спонсорського лістингу.
 * У продакшені — підключити до Stripe або власного порталу.
 */
export function buildSponsoredListingCheckout(
  surface: AdSurface,
  priceUsd: number,
): {
  surface: AdSurface;
  price_usd: number;
  checkout_url: string;
  note_en: string;
  note_uk: string;
} {
  return {
    surface,
    price_usd: priceUsd,
    // Replace with actual Stripe Payment Link or self-serve portal URL in production.
    checkout_url: `/api/v1/ads/sponsored-slots/checkout?surface=${encodeURIComponent(surface)}&price_usd=${priceUsd}`,
    note_en: "Self-serve checkout — complete payment to activate your sponsored slot.",
    note_uk: "Самостійне оформлення — завершіть оплату для активації спонсорського слота.",
  };
}

// ── Transparency report ───────────────────────────────────────────────────────

/** Quarterly transparency report shape. Структура квартального звіту прозорості. */
export interface QuarterlyTransparencyReport {
  /** Report period label, e.g. "Q2 2026". */
  period: string;

  /** Total ad / sponsored revenue in USD for the period. */
  total_revenue_usd: number;

  /** All active sponsored slots during the period. */
  slots: SponsoredSlot[];

  /** Revenue as fraction of total platform revenue. */
  revenue_share_pct: number;

  /** Whether revenue share is within the 10% policy cap. */
  within_policy_cap: boolean;

  /** EN statement for publication. */
  statement_en: string;

  /** UK statement for publication. Заява для публікації — українською. */
  statement_uk: string;
}

/**
 * Build a quarterly transparency report.
 * Stub — wire to real revenue data in production.
 *
 * Формує квартальний звіт прозорості. Stub для dev.
 */
export function buildQuarterlyTransparencyReport(): QuarterlyTransparencyReport {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  const period = `Q${quarter} ${now.getFullYear()}`;

  return {
    period,
    total_revenue_usd: 0,
    slots: [],
    revenue_share_pct: 0,
    within_policy_cap: true,
    statement_en: `Aegis Lens ${period} Advertising Transparency Report. All sponsors are publicly listed below. Advertising revenue represented 0% of total revenue this quarter, well within our 10% policy cap.`,
    statement_uk: `Звіт про прозорість реклами Aegis Lens за ${period}. Усі спонсори публічно перераховані нижче. Рекламний дохід становив 0% від загального доходу за квартал — значно нижче порогу 10%.`,
  };
}
