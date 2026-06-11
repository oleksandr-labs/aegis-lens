export type ExperimentStatus =
  | "draft"    // not yet running
  | "running"  // active, assigning users
  | "paused"   // temporarily stopped
  | "shipped"  // winning variant shipped to 100%
  | "killed";  // rolled back, no winner

export type ExperimentType =
  | "ab"           // simple A/B
  | "multivariate" // multiple factors
  | "holdout";     // measure cumulative impact

/** Which personas / tiers / cohorts are eligible for this experiment. */
export interface Eligibility {
  /** Allow all if not specified. */
  personas?: string[];
  tiers?: string[];
  locales?: string[];
  /** Explicit user IDs to force into a variant (QA). */
  forceUserIds?: Record<string, string>; // userId → variantKey
}

export interface ExperimentVariant {
  key: string;
  name: string;
  /** Percentage allocation 0–100, all variants must sum to ≤100 (remainder = control). */
  weight: number;
  /** Arbitrary payload surfaced to the client. */
  payload?: Record<string, unknown>;
  isControl?: boolean;
}

/** Pre-registered hypothesis — recorded before launch, immutable after. */
export interface Hypothesis {
  metric: string;        // e.g. "activation_rate"
  direction: "increase" | "decrease";
  minimumDetectableEffect: number; // relative, e.g. 0.05 = 5%
  /** guardrail metrics that must not regress */
  guardrails?: string[];
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  type: ExperimentType;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  eligibility: Eligibility;
  hypothesis: Hypothesis;
  /** ISO 8601 */
  startedAt?: string;
  endedAt?: string;
  winnerVariantKey?: string;
  /** Lesson learned — filled when experiment is killed. */
  lessonLearned?: string;
  createdAt: string;
  updatedAt: string;
  /** Safety: never test critical-alert UX, misinformation thresholds */
  safetyExcluded: boolean;
}

export interface AssignmentContext {
  userId: string;
  persona?: string;
  tier?: string;
  locale?: string;
}

export interface AssignmentResult {
  experimentId: string;
  variantKey: string;
  payload?: Record<string, unknown>;
  /** How the assignment was determined */
  reason: "forced" | "eligible_bucket" | "not_eligible" | "experiment_off";
}
