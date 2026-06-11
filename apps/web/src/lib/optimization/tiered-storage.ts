/**
 * Tiered storage policy — hot → warm → cold → archive lifecycle management.
 *
 * Tier definitions:
 *   hot     — Live Postgres (NVMe SSD, sub-ms read latency)
 *   warm    — Parquet files on S3 / Hetzner Object Storage (seconds latency)
 *   cold    — Glacier / S3 Intelligent-Tiering (minutes retrieval)
 *   archive — Immutable cold storage, rarely accessed (hours retrieval)
 *
 * Retention values are in days. undefined/null means "keep forever".
 */

export type StorageTier = "hot" | "warm" | "cold" | "archive";

export interface StoragePolicy {
  /** Data category identifier matching the ingest pipeline. */
  dataType: string;
  /** Days to keep in hot (Postgres) storage. */
  hotRetentionDays: number;
  /** Days to keep in warm (S3 Parquet) storage after moving from hot. */
  warmRetentionDays: number;
  /** Days to keep in cold (Glacier) storage after moving from warm. */
  coldRetentionDays: number;
  /** Days after ingestion before moving to archive tier. */
  archiveAfterDays: number;
  /** Days after ingestion before permanent deletion (undefined = keep forever). */
  deleteAfterDays?: number;
}

export const STORAGE_POLICIES: StoragePolicy[] = [
  {
    dataType: "raw_events",
    hotRetentionDays: 7,
    warmRetentionDays: 30,
    coldRetentionDays: 365,
    archiveAfterDays: 365 + 30 + 7, // ~14 months
    deleteAfterDays: undefined, // keep forever in archive
  },
  {
    dataType: "verified_events",
    hotRetentionDays: 30,
    warmRetentionDays: 180,
    coldRetentionDays: 5 * 365, // 5 years
    archiveAfterDays: 30 + 180 + 5 * 365,
    deleteAfterDays: undefined,
  },
  {
    dataType: "ai_outputs",
    hotRetentionDays: 7,
    warmRetentionDays: 90,
    coldRetentionDays: 365,
    archiveAfterDays: 7 + 90 + 365,
    deleteAfterDays: 3 * 365, // delete after 3 years (AI outputs are reproducible)
  },
  {
    dataType: "satellite_imagery",
    hotRetentionDays: 3,
    warmRetentionDays: 30,
    coldRetentionDays: 365,
    archiveAfterDays: 3 + 30 + 365,
    deleteAfterDays: undefined,
  },
  {
    dataType: "reports",
    hotRetentionDays: 90,
    warmRetentionDays: 2 * 365, // 2 years
    coldRetentionDays: 5 * 365,
    archiveAfterDays: 90 + 2 * 365 + 5 * 365,
    deleteAfterDays: undefined,
  },
  {
    dataType: "tiles_cache",
    hotRetentionDays: 1,
    warmRetentionDays: 7,
    coldRetentionDays: 30,
    archiveAfterDays: 38,
    deleteAfterDays: 38, // tile cache is disposable
  },
  {
    dataType: "audit_logs",
    hotRetentionDays: 90,
    warmRetentionDays: 2 * 365,
    coldRetentionDays: 5 * 365,
    archiveAfterDays: 90 + 2 * 365 + 5 * 365,
    deleteAfterDays: undefined, // legal hold
  },
];

/** Index for fast policy lookup. */
const POLICY_MAP = new Map<string, StoragePolicy>(
  STORAGE_POLICIES.map((p) => [p.dataType, p])
);

/**
 * Recommend a storage tier for a data item based on its age.
 *
 * @param dataType - Category of data (matches StoragePolicy.dataType)
 * @param ageDays  - Age of the data item in days
 */
export function getStorageRecommendation(
  dataType: string,
  ageDays: number
): StorageTier {
  const policy = POLICY_MAP.get(dataType);
  if (!policy) return "warm"; // unknown type — default to warm

  if (ageDays <= policy.hotRetentionDays) return "hot";
  if (ageDays <= policy.hotRetentionDays + policy.warmRetentionDays) return "warm";
  if (ageDays <= policy.archiveAfterDays) return "cold";
  return "archive";
}

/**
 * Estimate monthly storage cost in USD per GB for a data type across all tiers.
 *
 * Pricing assumptions (adjust via environment overrides):
 *   hot     — $0.23/GB/month (NVMe Postgres on Hetzner AX102)
 *   warm    — $0.023/GB/month (S3-compatible object storage)
 *   cold    — $0.004/GB/month (Glacier Flexible Retrieval)
 *   archive — $0.00099/GB/month (Glacier Deep Archive)
 *
 * Returns an object with the cost at each tier for the given data size.
 */
export function estimateStorageCostUsd(
  dataType: string,
  sizeGb: number
): Record<StorageTier, number> {
  const COST_PER_GB: Record<StorageTier, number> = {
    hot: parseFloat(process.env.STORAGE_COST_HOT_USD ?? "0.23"),
    warm: parseFloat(process.env.STORAGE_COST_WARM_USD ?? "0.023"),
    cold: parseFloat(process.env.STORAGE_COST_COLD_USD ?? "0.004"),
    archive: parseFloat(process.env.STORAGE_COST_ARCHIVE_USD ?? "0.00099"),
  };

  return {
    hot: sizeGb * COST_PER_GB.hot,
    warm: sizeGb * COST_PER_GB.warm,
    cold: sizeGb * COST_PER_GB.cold,
    archive: sizeGb * COST_PER_GB.archive,
  };
}
