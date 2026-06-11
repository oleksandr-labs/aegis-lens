export type FlagKind = "release" | "experiment" | "ops" | "permission" | "kill_switch";

export interface FlagTarget {
  /** Specific org IDs that get this flag */
  orgIds?: string[];
  /** Specific user IDs */
  userIds?: string[];
  /** Cohort tags (e.g. "beta", "power_user") */
  cohorts?: string[];
  /** 0–100 percentage rollout */
  percentage?: number;
  /** Flag enabled only in these tiers */
  tiers?: string[];
}

export interface FlagVariant {
  key: string;
  /** Relative weight for multi-variant experiments (must sum to 100) */
  weight: number;
  /** Arbitrary JSON payload (e.g. config values for this variant) */
  payload?: Record<string, unknown>;
}

export interface FeatureFlag {
  key: string;
  kind: FlagKind;
  description: string;
  enabled: boolean;
  targets?: FlagTarget;
  variants?: FlagVariant[];
  defaultVariant?: string;
  /** ISO date — flags without a sunset are flagged as tech debt after 90 days */
  sunsetAt?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationContext {
  userId?: string;
  orgId?: string;
  tier?: string;
  cohorts?: string[];
}

export interface EvaluationResult {
  enabled: boolean;
  variant?: string;
  payload?: Record<string, unknown>;
  reason: "explicit_target" | "cohort" | "percentage" | "default" | "disabled";
}

export interface FlagChangeEvent {
  flagKey: string;
  changedBy: string;
  before: Partial<FeatureFlag>;
  after: Partial<FeatureFlag>;
  timestamp: string;
}
