/**
 * Pricing Experiments — shared type definitions.
 *
 * Типи для системи цінових A/B-експериментів.
 * Кожен експеримент тестує рівно одну вісь — ніколи декілька одночасно.
 */

// ── Experiment axis ────────────────────────────────────────────────────────────

/**
 * The pricing dimension being tested.
 * Вісь цінового тесту.
 */
export type ExperimentAxis =
  | "tier-shape"        // number / names of tiers
  | "tier-price"        // dollar price of a specific tier
  | "annual-discount"   // annual / multi-year discount %
  | "trial-design"      // trial duration, card requirement, auto-convert
  | "gate-freemium"     // free-tier gate depth / quota / delay
  | "add-on-packaging"  // bundle discounts, geo packs, vertical packs
  | "pay-shape"         // day pass / event pass / PPP
  | "usage-based";      // flat vs metered, credits vs overage

// ── Experiment arm ─────────────────────────────────────────────────────────────

/**
 * A single variant within an experiment.
 * Один варіант у межах експерименту.
 */
export interface ExperimentArm {
  /** Stable machine-readable id, e.g. "pro-29" */
  id: string;
  /** Human label in English */
  label_en: string;
  /** Human label in Ukrainian */
  label_uk: string;
  /** The concrete value being tested (price number, string key, object, etc.) */
  value: unknown;
  /** True for the existing / baseline behaviour */
  isControl: boolean;
}

// ── Pricing experiment ─────────────────────────────────────────────────────────

export type ExperimentStatus = "planned" | "running" | "concluded" | "abandoned";

/**
 * Full definition of a pricing experiment.
 * Повний опис цінового експерименту.
 */
export interface PricingExperiment {
  /** Stable slug, e.g. "tier-shape-3v4v6" */
  id: string;
  /** Which pricing dimension this experiment touches */
  axis: ExperimentAxis;
  /** Short description in English */
  description_en: string;
  /** Short description in Ukrainian */
  description_uk: string;
  /** All arms, including control */
  arms: ExperimentArm[];
  status: ExperimentStatus;
  /** Set when status === 'concluded' */
  winnerArmId?: string;
  /** Why this experiment was designed / what we learned */
  rationale?: string;
  /**
   * MUST always be `true`.
   * Existing paying customers are NEVER exposed to price tests —
   * their locked-in price is honored unconditionally.
   *
   * Завжди `true`. Клієнти, що вже платять, не беруть участь
   * у тестах цін — їхня ціна залишається незмінною.
   */
  grandfatherExistingCustomers: true;
}

// ── Experiment result ──────────────────────────────────────────────────────────

/**
 * Aggregated metrics for one arm of a concluded / running experiment.
 * Агреговані метрики для одного варіанту.
 */
export interface ExperimentResult {
  experimentId: string;
  armId: string;
  /** Free-to-paid conversion rate (0–1) */
  conversionRate: number;
  /** Average revenue per user (USD / month) */
  arpu: number;
  /** 30-day churn rate (0–1) */
  churnRate30d: number;
  /** Number of unique users in this arm */
  sampleSize: number;
  /** Two-tailed p-value vs control, if computed */
  pValue?: number;
  /** True if pValue < 0.05 */
  significantAt95: boolean;
}

// ── Cohort retention ───────────────────────────────────────────────────────────

/**
 * Retention snapshot for one cohort × arm combination.
 * Знімок утримання для однієї когорти та варіанту.
 */
export interface CohortRetentionRecord {
  experimentId: string;
  armId: string;
  /** ISO month string, e.g. "2024-11" */
  cohortMonth: string;
  /** Fraction retained at day 7 (0–1) */
  retainedDay7: number;
  /** Fraction retained at day 30 (0–1) */
  retainedDay30: number;
  /** Fraction retained at day 90 (0–1) */
  retainedDay90: number;
}
