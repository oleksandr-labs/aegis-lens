/**
 * Pricing system — core TypeScript types
 *
 * All 10 tiers: Free, Observer, Pro, Pro+, Team, Business, Enterprise,
 * Government/Defense, NGO/Journalist, Academic.
 *
 * Source of truth: /data/pricing/tiers.csv
 * Система ціноутворення — базові типи TypeScript.
 */

// ── Tier IDs ──────────────────────────────────────────────────────────────────

export type TierId =
  | "free"
  | "observer"
  | "pro"
  | "pro-plus"
  | "team"
  | "business"
  | "enterprise"
  | "gov-defense"
  | "ngo-journalist"
  | "academic";

// ── Billing model ─────────────────────────────────────────────────────────────

/**
 * How a tier is acquired:
 * - free:        no payment, always available
 * - self-serve:  card-based checkout on pricing page
 * - sales-led:   initiated via contact form / Calendly
 * - application: gated by manual review (NGO/journalist/academic)
 */
export type BillingModel = "free" | "self-serve" | "sales-led" | "application";

// ── Pricing axes ─────────────────────────────────────────────────────────────

/**
 * The seven dimensions along which tiers are differentiated.
 * Used for upgrade prompt copy and paywall messaging.
 *
 * Сім осей диференціації між рівнями.
 */
export type PricingAxis =
  | "freshness"      // data lag / real-time vs delayed
  | "history"        // how far back historical data goes
  | "scope"          // AOI / watchlist count + size
  | "redistribution" // API access + export rights
  | "collaboration"  // multi-user case files, RBAC
  | "analytics"      // depth of analytical features
  | "support";       // SLA tier + dedicated CSM

// ── Alert channels ────────────────────────────────────────────────────────────

export type AlertChannel =
  | "email"
  | "telegram"
  | "slack"
  | "discord"
  | "webhooks"
  | "dedicated-lane";

// ── Export formats ────────────────────────────────────────────────────────────

export type ExportFormat =
  | "png"
  | "csv"
  | "json"
  | "geojson"
  | "pdf"
  | "custom-branding"
  | "scheduled"
  | "s3-push"
  | "raw-archive";

// ── Collaboration model ───────────────────────────────────────────────────────

export type CollaborationModel =
  | "none"
  | "solo-case-files"
  | "share-view-only"
  | "full-collab-comments-mentions"
  | "case-approvals-rbac-audit-log"
  | "full-enterprise-plus-onprem";

// ── Support SLA ───────────────────────────────────────────────────────────────

export type SupportSla =
  | "community"
  | "email-best-effort"
  | "chat-1-business-day"
  | "priority-4h-business-hours"
  | "dedicated-csm-24x7";

// ── Compliance / security features ───────────────────────────────────────────

export type ComplianceFeature =
  | "standard"
  | "standard-soc2"
  | "sso-saml-scim"
  | "sso-saml-scim-audit-export-dpa-baa-regional"
  | "sso-saml-scim-audit-export-dpa-baa-itar-ear-airgap";

// ── Copilot access model ──────────────────────────────────────────────────────

export type CopilotModel =
  | number           // hard daily cap (Free/Observer/Pro)
  | "shared"         // shared pool (Team)
  | "priority-queue" // Business
  | "priority-fine-tuned"; // Enterprise / Gov

// ── Main TierConfig interface ─────────────────────────────────────────────────

/**
 * Full configuration for a single tier.
 * Matches columns in /data/pricing/tiers.csv plus i18n display names.
 *
 * Повна конфігурація одного рівня — відповідає колонкам у tiers.csv.
 */
export interface TierConfig {
  /** Machine-readable identifier */
  tier_id: TierId;

  /** Display name — English */
  name_en: string;

  /** Display name — Ukrainian */
  name_uk: string;

  /** Short description of the target audience — English */
  audience_en: string;

  /** Short description of the target audience — Ukrainian */
  audience_uk: string;

  /**
   * Monthly price in USD.
   * null = custom / bespoke pricing (sales-led / application)
   */
  price_usd_mo: number | null;

  /** How this tier is acquired */
  billing_model: BillingModel;

  /**
   * Data freshness delay in seconds.
   * 0 = true real-time / no delay.
   */
  freshness_delay_s: number;

  /**
   * How many days of historical data are accessible.
   * -1 = unlimited / full history.
   */
  history_days: number;

  /**
   * Maximum number of watchlists.
   * -1 = unlimited.
   */
  max_watchlists: number;

  /**
   * Maximum number of Areas of Interest (AOIs).
   * -1 = unlimited.
   */
  max_aois: number;

  /**
   * Maximum area per single AOI in km².
   * -1 = unlimited.
   */
  max_aoi_km2: number;

  /**
   * Maximum alerts per day.
   * -1 = unlimited.
   */
  alerts_per_day: number;

  /** Supported notification channels */
  alert_channels: AlertChannel[];

  /**
   * AI Copilot messages per day.
   * Number for capped tiers; string model for higher tiers.
   */
  copilot_msgs_per_day: CopilotModel;

  /** Supported export formats */
  export_formats: ExportFormat[];

  /**
   * Maximum rows per export.
   * -1 = unlimited.
   */
  export_max_rows: number;

  /**
   * API requests per day.
   * 0 = no API access; -1 = custom / contract capacity.
   */
  api_req_per_day: number;

  /** Collaboration model */
  collaboration: CollaborationModel;

  /** Support SLA level */
  support_sla: SupportSla;

  /** Compliance / security feature set */
  compliance_features: ComplianceFeature;

  /**
   * Whether this tier is publicly visible on the pricing page.
   * gov-defense is hidden from public endpoints.
   */
  public: boolean;
}
