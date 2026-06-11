/**
 * Cloud Spec — primary and secondary cloud provider configuration.
 *
 * Primary: AWS (eu-central-1 + us-east-1).
 * Hedge: Hetzner for batch processing and cold storage (cost efficiency).
 *
 * Специфікація хмарної інфраструктури: AWS (основний) + Hetzner (batch/cold).
 */

// ── Provider constants ────────────────────────────────────────────────────────

export const CLOUD_PRIMARY = "aws" as const;

/**
 * Active AWS regions. eu-central-1 (Frankfurt) is primary; us-east-1 is DR.
 *
 * Активні AWS-регіони: Frankfurt — основний, us-east-1 — аварійне відновлення.
 */
export const AWS_REGIONS = ["eu-central-1", "us-east-1"] as const;
export type AwsRegion = (typeof AWS_REGIONS)[number];

// ── Hetzner hedge note ────────────────────────────────────────────────────────

export const HETZNER_USAGE_NOTE_EN =
  "Hetzner is used for batch/ETL workloads and cold-storage archiving only. " +
  "No hot-path services run on Hetzner. Migration path: lift-and-shift to AWS if Hetzner capacity is insufficient.";

export const HETZNER_USAGE_NOTE_UK =
  "Hetzner використовується лише для batch/ETL-навантажень і холодного архівування. " +
  "Гарячий шлях — тільки AWS. Шлях міграції: lift-and-shift на AWS при нестачі ємності.";

// ── CloudSpec interface ───────────────────────────────────────────────────────

export interface CloudSpec {
  primary: "aws" | "gcp" | "azure" | "hetzner";
  primaryRegions: readonly string[];
  hedgeProvider: "hetzner" | "aws" | null;
  hedgeUseCases: string[];
  /** Whether cross-region active-active is configured */
  multiRegionActive: boolean;
  /** Estimated monthly baseline cost in USD */
  estimatedBaselineCostUsd: number | null;
  notes: {
    en: string;
    uk: string;
  };
}

// ── CLOUD_SPEC ────────────────────────────────────────────────────────────────

export const CLOUD_SPEC: CloudSpec = {
  primary: CLOUD_PRIMARY,
  primaryRegions: AWS_REGIONS,
  hedgeProvider: "hetzner",
  hedgeUseCases: [
    "batch-etl",
    "cold-storage-archive",
    "dev-sandbox",
    "cost-optimised-crawlers",
  ],
  multiRegionActive: false, // single active region + DR standby for MVP
  estimatedBaselineCostUsd: null, // TBD post-MVP traction
  notes: {
    en: HETZNER_USAGE_NOTE_EN,
    uk: HETZNER_USAGE_NOTE_UK,
  },
};
