/**
 * Ads & Sponsored Revenue — core TypeScript types.
 *
 * Defines surfaces, formats, policies, and slot structures for
 * ethically-bounded ad / sponsored revenue. Never on map, events,
 * alerts, reports — to protect user trust.
 *
 * Рекламний модуль — базові типи TypeScript.
 * Дозволені поверхні: директорії, розсилка, академія, job board.
 * Заборонено: карта, деталі подій, сповіщення, AI-відповіді, звіти.
 */

// ── Allowed ad surfaces ───────────────────────────────────────────────────────

/**
 * Surfaces where sponsored / ad placements are permitted.
 * Поверхні, де дозволені спонсорські розміщення.
 */
export type AdSurface =
  | "companies-directory"
  | "tools-directory"
  | "experts-directory"
  | "programmatic-seo-pages"
  | "newsletter"
  | "academy-guides"
  | "job-board";

// ── Forbidden ad surfaces ─────────────────────────────────────────────────────

/**
 * Surfaces where any advertising is strictly forbidden to protect trust.
 * Поверхні, де реклама суворо заборонена для захисту довіри.
 */
export type ForbiddenAdSurface =
  | "map-workspace"
  | "event-detail-pages"
  | "alerts-notifications"
  | "ai-copilot-output"
  | "reports"
  | "third-party-embeds";

// ── Ad format ─────────────────────────────────────────────────────────────────

/**
 * Pricing / delivery model for a sponsored placement.
 * Модель ціноутворення / доставки спонсорського розміщення.
 */
export type AdFormat =
  | "flat-rate"   // fixed price per period regardless of impressions
  | "cpm"         // cost-per-mille impressions
  | "featured-listing" // highlighted entry in directory
  | "newsletter-sponsor" // exclusive issue sponsor
  | "academy-partner";  // educational content sponsorship

// ── Ad policy ─────────────────────────────────────────────────────────────────

/**
 * Structured representation of the platform's advertising policy.
 * Структурований опис рекламної політики платформи.
 */
export interface AdPolicy {
  /** No ads from entities on international sanctions lists. Жодної реклами від санкційних суб'єктів. */
  no_sanctioned_entities: boolean;

  /** No ads from weapons-broker or arms-dealer categories. Жодної реклами торговців зброєю. */
  no_weapons_broker_categories: boolean;

  /** No ads adjacent to safety-critical content (sirens, evacuation, casualties). Жодної реклами поруч із контентом безпеки. */
  no_ads_on_safety_critical_content: boolean;

  /** All sponsored content must be visually distinct and labelled. Весь спонсорський контент чітко позначається. */
  sponsored_label_required: boolean;

  /** Label text — English. */
  sponsored_label_en: string;

  /** Label text — Ukrainian. */
  sponsored_label_uk: string;

  /** No retargeting of users based on PII or intelligence behavior. Заборонено ретаргетинг на основі персональних даних. */
  no_pii_retargeting: boolean;

  /** No third-party ad networks (Google AdSense etc.) — direct sales only. Жодних сторонніх рекламних мереж. */
  no_third_party_ad_networks: boolean;

  /**
   * Editorial firewall: ads team cannot influence analyst / intel team.
   * Редакційний фаєрвол: рекламна команда не впливає на аналітиків.
   */
  editorial_firewall: boolean;

  /** Ad revenue cap as fraction of sustainable revenue mix. Обмеження частки рекламного доходу. */
  revenue_cap_pct: number;
}

// ── Ad mechanics ──────────────────────────────────────────────────────────────

/**
 * Operational mechanics for the ads / sponsored-revenue programme.
 * Операційна механіка рекламно-спонсорської програми.
 */
export interface AdMechanics {
  /** Self-serve sponsored-listing checkout available. Самостійна оплата спонсорського лістингу. */
  selfServeSponsoredListingCheckout: boolean;

  /** Newsletter / hub sponsorships sold via sales team. Розсилки та хаби продаються через sales-команду. */
  salesLedForNewsletter: boolean;

  /** CPM and flat-rate pricing options available. Доступні CPM і фіксована ціна. */
  cpmAndFlatRateOptions: boolean;

  /** Quarterly transparency report listing all sponsors. Щоквартальний звіт про всіх спонсорів. */
  quarterlyTransparencyReport: boolean;
}

// ── Sponsored slot ────────────────────────────────────────────────────────────

/**
 * A single purchased / booked sponsored slot.
 * Окреме куплене / заброньоване спонсорське місце.
 */
export interface SponsoredSlot {
  /** Unique slot identifier. */
  id: string;

  /** Surface where this slot is placed. */
  surface: AdSurface;

  /** Pricing / delivery format. */
  format: AdFormat;

  /** Sponsor / advertiser name — English. */
  sponsor_name_en: string;

  /** Sponsor / advertiser name — Ukrainian. */
  sponsor_name_uk: string;

  /** Price paid in USD. */
  price_usd: number;

  /** ISO-8601 start date of the placement. */
  starts_at: string;

  /** ISO-8601 end date of the placement. */
  ends_at: string;

  /** Whether this slot is currently active. */
  active: boolean;
}
