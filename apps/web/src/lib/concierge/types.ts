/**
 * Managed AOI Concierge Service — shared type definitions.
 *
 * Covers service tiers, SLA contracts, pricing, and crisis surge pricing.
 * All monetary values in USD. Timestamps in ISO 8601.
 *
 * Типи для сервісу керованого AOI: тарифи, SLA, ціноутворення, кризовий режим.
 */

// ── Service tier ──────────────────────────────────────────────────────────────

/**
 * Concierge service tier identifier.
 * - light: weekly brief, analyst-curated.
 * - standard: daily brief + real-time critical alerts.
 * - 247: round-the-clock human coverage with immediate escalation.
 *
 * Тариф сервісу: легкий, стандартний або цілодобовий.
 */
export type ConciergeServiceTier = "light" | "standard" | "247";

// ── SLA ───────────────────────────────────────────────────────────────────────

/**
 * Service Level Agreement (SLA) for a given concierge tier.
 *
 * SLA угода для кожного тарифу сервісу.
 */
export interface ConciergeSla {
  /** Tier this SLA applies to */
  tier: ConciergeServiceTier;

  /**
   * Maximum time (in hours) from a triggered alert to analyst response.
   * Максимальний час відповіді аналітика в годинах.
   */
  responseSla_hours: number;

  /**
   * Number of designated escalation contacts the customer may define.
   * Кількість контактів для ескалації, які може визначити клієнт.
   */
  escalationContacts: number;

  /**
   * Human analyst coverage window.
   * - weekly: analyst reviews and publishes once per week.
   * - daily:  analyst reviews every day; critical alerts in real-time.
   * - 24-7:   continuous human coverage around the clock.
   *
   * Графік роботи аналітика.
   */
  humanCoverage: "weekly" | "daily" | "24-7";
}

// ── Concierge contract ────────────────────────────────────────────────────────

/**
 * Full contract definition for a concierge service tier.
 * Describes pricing, inclusions, SLA, and the minimum base subscription.
 *
 * Повний опис контракту для тарифу сервісу.
 */
export interface ConciergeContract {
  /** Tier identifier */
  tier: ConciergeServiceTier;

  /**
   * Monthly price per AOI in USD.
   * Additional AOIs billed at the same per-AOI rate (bundle discount applies
   * for ≥3 AOIs — see MULTI_AOI_BUNDLE_DISCOUNT_PCT).
   *
   * Щомісячна ціна за одну зону інтересу (AOI) в USD.
   */
  priceUsd_per_aoi_per_month: number;

  /**
   * What is included in this tier — English bullet list.
   * Що входить до тарифу — англійська версія.
   */
  inclusions_en: string[];

  /**
   * What is included in this tier — Ukrainian bullet list.
   * Що входить до тарифу — українська версія.
   */
  inclusions_uk: string[];

  /** SLA parameters for this tier */
  sla: ConciergeSla;

  /**
   * The minimum base subscription tier required to purchase concierge.
   * Concierge is an add-on to existing subscriptions; "team" is the minimum.
   *
   * Мінімальний базовий тариф підписки для покупки сервісу.
   */
  minBaseTier: "team";
}

// ── Crisis surge pricing ──────────────────────────────────────────────────────

/**
 * Temporary pricing uplift applied during a declared crisis or conflict event.
 * The surge reflects increased analyst hours and data costs.
 *
 * Тимчасове підвищення ціни під час оголошеної кризи або конфліктної події.
 */
export interface CrisisSurgePricing {
  /** Human-readable description of the surge policy — English */
  description_en: string;

  /** Human-readable description of the surge policy — Ukrainian */
  description_uk: string;

  /**
   * Price multiplier applied to the base tier price during a declared event.
   * E.g. 1.5 means the customer is charged 150 % of the normal rate.
   *
   * Множник ціни під час кризи. Наприклад, 1.5 = 150 % від базової ціни.
   */
  surgeMultiplier: number;
}
