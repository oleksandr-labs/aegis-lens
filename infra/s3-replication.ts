/**
 * S3 Cross-Region Replication — media, tiles, and export bucket replication rules.
 *
 * Primary region: eu-central-1. Replicated to: us-east-1 for DR.
 * All objects are replicated within 15 minutes via S3 Replication Time Control.
 *
 * Міжрегіональна реплікація S3: media/tiles/exports → us-east-1 для DR.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Buckets that have cross-region replication enabled.
 *
 * Бакети із увімкненою крос-регіональною реплікацією.
 */
export const S3_REPLICATION_BUCKETS = [
  "media",
  "tiles",
  "exports",
] as const;
export type S3ReplicationBucket = (typeof S3_REPLICATION_BUCKETS)[number];

/**
 * Destination regions for S3 replication.
 *
 * Регіони призначення для реплікації S3.
 */
export const S3_REPLICA_REGIONS = ["us-east-1"] as const;
export type S3ReplicaRegion = (typeof S3_REPLICA_REGIONS)[number];

// ── S3ReplicationRule ─────────────────────────────────────────────────────────

export interface S3ReplicationRule {
  id: string;
  sourceBucket: string;
  /** Full bucket name in the source region */
  sourceBucketName: string;
  destinationRegion: S3ReplicaRegion;
  /** Full bucket name in the destination region */
  destinationBucketName: string;
  /** Object prefix filter (empty = replicate all) */
  prefixFilter: string;
  /** Whether S3 Replication Time Control (15-min SLA) is enabled */
  replicationTimeControlEnabled: boolean;
  /** Whether delete markers are replicated */
  deleteMarkerReplication: boolean;
  /** Whether destination objects are encrypted */
  destinationEncrypted: boolean;
  /** KMS key alias for destination encryption */
  destinationKmsKeyAlias: string | null;
  /** Storage class for replicated objects */
  destinationStorageClass: "STANDARD" | "STANDARD_IA" | "GLACIER";
}

// ── S3_REPLICATION_RULES ──────────────────────────────────────────────────────

/**
 * All active cross-region replication rules.
 *
 * Всі активні правила крос-регіональної реплікації.
 */
export const S3_REPLICATION_RULES: S3ReplicationRule[] = [
  {
    id: "replicate-media-to-us-east-1",
    sourceBucket: "media",
    sourceBucketName: "aegis-lens-media-eu-central-1",
    destinationRegion: "us-east-1",
    destinationBucketName: "aegis-lens-media-us-east-1",
    prefixFilter: "",
    replicationTimeControlEnabled: true, // 15-min SLA
    deleteMarkerReplication: true,
    destinationEncrypted: true,
    destinationKmsKeyAlias: "alias/aegis-lens-s3-us-east-1",
    destinationStorageClass: "STANDARD",
  },
  {
    id: "replicate-tiles-to-us-east-1",
    sourceBucket: "tiles",
    sourceBucketName: "aegis-lens-tiles-eu-central-1",
    destinationRegion: "us-east-1",
    destinationBucketName: "aegis-lens-tiles-us-east-1",
    prefixFilter: "",
    replicationTimeControlEnabled: false, // tiles are static — RTC not required
    deleteMarkerReplication: false,
    destinationEncrypted: true,
    destinationKmsKeyAlias: "alias/aegis-lens-s3-us-east-1",
    destinationStorageClass: "STANDARD_IA", // infrequent access for DR copy
  },
  {
    id: "replicate-exports-to-us-east-1",
    sourceBucket: "exports",
    sourceBucketName: "aegis-lens-exports-eu-central-1",
    destinationRegion: "us-east-1",
    destinationBucketName: "aegis-lens-exports-us-east-1",
    prefixFilter: "completed/",
    replicationTimeControlEnabled: true,
    deleteMarkerReplication: true,
    destinationEncrypted: true,
    destinationKmsKeyAlias: "alias/aegis-lens-s3-us-east-1",
    destinationStorageClass: "STANDARD",
  },
];
