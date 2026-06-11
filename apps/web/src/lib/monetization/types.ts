/**
 * Monetization Packages — shared type definitions.
 *
 * Covers add-ons, vertical packages, and geographic packages.
 * All monetary values in USD. Timestamps in ISO 8601.
 *
 * Типи для пакетів монетизації: надбудови, вертикальні та гео-пакети.
 */

// ── Add-on IDs ────────────────────────────────────────────────────────────────

/**
 * Union of all add-on slug identifiers.
 * Data add-ons, capability add-ons, and premium feature unlocks.
 */
export type AddOnId =
  // Data add-ons
  | "commercial-satellite"
  | "sentinel-hub-paid"
  | "adsb-pro"
  | "ais-pro"
  | "thermal-hi-res"
  | "social-firehose"
  | "dark-channels"
  | "telegram-osint-bots"
  | "maritime-cargo"
  | "power-grid-telemetry"
  | "weather-pro"
  | "historical-archive"
  // Capability add-ons
  | "custom-aoi-tasking"
  | "kg-graph-pro"
  | "ai-copilot-pro"
  | "ai-rule-builder-pro"
  | "verification-queue-priority"
  | "travel-risk-module"
  | "embeds-pro"
  | "bots-pro"
  | "notebooks-pro"
  | "browser-extension-pro"
  | "workspace-presets-marketplace";

// ── Add-on interface ──────────────────────────────────────────────────────────

/**
 * A single purchasable add-on / data module.
 * Add-ons attach to an existing paid subscription independently of tier upgrades.
 *
 * Окрема надбудова, яка прикріплюється до підписки незалежно від тарифу.
 */
export interface AddOn {
  /** Unique machine-readable slug */
  id: AddOnId;

  /** Display name — English */
  name_en: string;

  /** Display name — Ukrainian */
  name_uk: string;

  /** Short description — English */
  description_en: string;

  /** Short description — Ukrainian */
  description_uk: string;

  /**
   * What drives the cost of this add-on.
   * Used for transparency copy in pricing UI.
   * Що визначає вартість надбудови.
   */
  costDriver: string;

  /**
   * How the add-on is priced:
   * - flat-monthly: fixed monthly charge
   * - per-usage: billed per event / scene / GB
   * - credits: prepaid credits consumed on use
   * - subscription: tiered / volume subscription
   */
  pricingModel: "flat-monthly" | "per-usage" | "credits" | "subscription";

  /**
   * Monthly price in USD (flat-monthly add-ons).
   * Undefined for per-usage / credits / custom.
   */
  priceUsd?: number;

  /**
   * Credits consumed per unit of usage.
   * Only set when pricingModel is 'credits'.
   */
  creditsPerUnit?: number;

  /**
   * Minimum tier ID required to attach this add-on.
   * Matches TierId values from pricing/types.ts.
   */
  minTierId: string;

  /**
   * Stripe Product ID — undefined until provisioned in Stripe.
   * Stripe Product ID — undefined до створення в Stripe.
   */
  stripeProductId?: string;

  /**
   * Feature category for grouping in UI and API filtering.
   * - data:       external data source feeds
   * - capability: analytical / workflow capabilities
   * - social:     social / communications monitoring
   * - ai:         AI / ML premium features
   * - embed:      white-label / integration features
   */
  category: "data" | "capability" | "social" | "ai" | "embed";
}

// ── Vertical package IDs ──────────────────────────────────────────────────────

/**
 * Union of all industry vertical slugs.
 * Each vertical corresponds to a pre-bundled add-on stack + landing page.
 */
export type VerticalId =
  | "insurance"
  | "maritime"
  | "aviation"
  | "finance"
  | "energy"
  | "agriculture"
  | "ngo-humanitarian"
  | "newsroom"
  | "defense"
  | "travel-security";

// ── Vertical package interface ────────────────────────────────────────────────

/**
 * A pre-bundled vertical package: base tier + add-on stack + presets.
 * Priced at a discount vs buying add-ons à la carte.
 *
 * Вертикальний пакет: базовий тариф + стек надбудов + пресети.
 */
export interface VerticalPackage {
  /** Unique machine-readable slug */
  id: VerticalId;

  /** Display name — English */
  name_en: string;

  /** Display name — Ukrainian */
  name_uk: string;

  /** Short description — English */
  description_en: string;

  /** Short description — Ukrainian */
  description_uk: string;

  /** Add-ons included in this vertical bundle */
  includedAddOnIds: AddOnId[];

  /**
   * Base tier this package is built on.
   * Matches TierId from pricing/types.ts.
   */
  baseTierId: string;

  /** Minimum monthly price in USD (range lower bound) */
  priceMoUsdMin: number;

  /** Maximum monthly price in USD (range upper bound) */
  priceMoUsdMax: number;

  /**
   * Human-readable pricing note — English.
   * E.g. "Billed annually; custom pricing for large teams."
   */
  pricingNote_en: string;

  /** Key use cases / buyer personas — English */
  useCases_en: string[];

  /**
   * If true, this package requires a sales conversation; not self-serve.
   * Якщо true — пакет продається через сейлз, не самостійно.
   */
  isSalesLed: boolean;

  /**
   * URL slug for the industry landing page.
   * E.g. '/industries/insurance'
   */
  landingSlug: string;
}

// ── Geo package IDs ───────────────────────────────────────────────────────────

/**
 * Union of all geographic package slugs.
 * Each geo package restricts access to a defined region at a lower price.
 */
export type GeoPackageId =
  | "ukraine"
  | "eu-east"
  | "black-sea"
  | "mena"
  | "indo-pacific"
  | "sahel"
  | "global";

// ── Geo package interface ─────────────────────────────────────────────────────

/**
 * A region-restricted subscription package.
 * Offers Pro-level features limited to AOIs within a defined geographic region.
 *
 * Регіональний пакет підписки: Pro-функції, обмежені певним регіоном.
 */
export interface GeoPackage {
  /** Unique machine-readable slug */
  id: GeoPackageId;

  /** Display name — English */
  name_en: string;

  /** Display name — Ukrainian */
  name_uk: string;

  /** Short description — English */
  description_en: string;

  /** Short description — Ukrainian */
  description_uk: string;

  /**
   * List of ISO 3166-1 alpha-2 country codes covered by this package.
   * Empty array for 'global' (all countries).
   */
  countries: string[];

  /**
   * Optional buffer radius around the named countries.
   * E.g. "200km" for the Ukraine pack border buffer.
   */
  radiusBuffer?: string;

  /**
   * Discount percentage off the global Pro price (0–1 fraction).
   * E.g. 0.40 means 40% cheaper than global Pro.
   * Знижка відносно глобального Pro (0–1).
   */
  globalProDiscountPct: number;

  /**
   * Base tier this package is built on.
   * Matches TierId from pricing/types.ts.
   */
  baseTierId: string;

  /**
   * Human-readable pricing note — English.
   */
  pricingNote_en: string;

  /**
   * Vertical packages automatically included / discounted with this geo pack.
   * E.g. Black Sea auto-includes maritime discount.
   */
  autoIncludesVerticals?: VerticalId[];
}
