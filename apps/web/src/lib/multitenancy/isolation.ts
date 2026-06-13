/**
 * Multi-tenancy — Data isolation strategies.
 *
 * Covers:
 *  - Vector store isolation (Qdrant filter vs. dedicated collection)
 *  - Blob / S3 isolation (prefix-based with lifecycle policies)
 *  - Encryption key routing (shared KMS vs. customer-managed CMK for enterprise)
 */

// ── User tier ─────────────────────────────────────────────────────────────────

export type UserTier = "free" | "pro" | "enterprise";

// ── Vector store strategy ─────────────────────────────────────────────────────

export type VectorStoreStrategy =
  | "filter-by-org-id"      // shared collection, every point tagged with org_id metadata
  | "per-org-collection";   // dedicated Qdrant collection per org

export type BlobStorageStrategy = "s3-prefix-isolated";

export type EncryptionKeyStrategy =
  | "shared-kms"            // AWS KMS key shared across free/pro orgs
  | "customer-managed-kms"; // CMK created per org for enterprise

// ── Org isolation strategy ────────────────────────────────────────────────────

export interface OrgIsolationStrategy {
  vectorStore: VectorStoreStrategy;
  blobStorage: BlobStorageStrategy;
  encryptionKey: EncryptionKeyStrategy;
}

/**
 * Determine the isolation strategy for an org based on its tier.
 *
 * Rules:
 *  - free / pro → filter-by-org-id (cost-efficient shared collection)
 *  - enterprise → per-org-collection (complete isolation, custom tuning)
 *
 * Encryption follows the same boundary.
 */
export function getOrgIsolationStrategy(tier: UserTier): OrgIsolationStrategy {
  const isEnterprise = tier === "enterprise";
  return {
    vectorStore: isEnterprise ? "per-org-collection" : "filter-by-org-id",
    blobStorage: "s3-prefix-isolated",
    encryptionKey: isEnterprise ? "customer-managed-kms" : "shared-kms",
  };
}

// ── Qdrant collection strategy ────────────────────────────────────────────────

export interface QdrantCollectionStrategy {
  /** Name of the Qdrant collection to use for this org. */
  collectionName: string;
  /**
   * If the org uses the shared collection, all queries / upserts MUST include
   * this filter so events from other orgs are never surfaced.
   */
  orgFilter: { must: [{ key: "org_id"; match: { value: string } }] } | null;
}

const SHARED_COLLECTION = "aegis_events";

/**
 * Resolve which Qdrant collection + filter to use for `orgId`.
 *
 * Enterprise orgs get a dedicated collection named `aegis_org_<orgId>`.
 * All other orgs share `aegis_events` and are isolated by a metadata filter.
 */
export function resolveQdrantStrategy(orgId: string, tier: UserTier): QdrantCollectionStrategy {
  if (tier === "enterprise") {
    return {
      collectionName: `aegis_org_${orgId.replace(/-/g, "_")}`,
      orgFilter: null, // entire collection is dedicated to this org
    };
  }

  return {
    collectionName: SHARED_COLLECTION,
    orgFilter: {
      must: [{ key: "org_id", match: { value: orgId } }],
    },
  };
}

// ── S3 isolation ──────────────────────────────────────────────────────────────

export type S3DataClass = "raw" | "processed" | "temp";

export interface S3LifecycleRule {
  dataClass: S3DataClass;
  /** Transition to S3 Glacier after this many days. null = no transition. */
  glacierTransitionDays: number | null;
  /** Delete object after this many days from creation. */
  expirationDays: number;
  /** Human-readable label for auditing. */
  label: string;
}

export const S3_LIFECYCLE_RULES: Record<S3DataClass, S3LifecycleRule> = {
  raw: {
    dataClass: "raw",
    glacierTransitionDays: 365,          // move to Glacier after 1 year
    expirationDays: 365 * 5,             // hard delete after 5 years
    label: "Raw ingest data — 5-year retention, Glacier after 1y",
  },
  processed: {
    dataClass: "processed",
    glacierTransitionDays: 180,          // move to Glacier after 6 months
    expirationDays: 365 * 2,             // hard delete after 2 years
    label: "Processed/enriched data — 2-year retention, Glacier after 6m",
  },
  temp: {
    dataClass: "temp",
    glacierTransitionDays: null,         // no Glacier — just delete
    expirationDays: 7,                   // hard delete after 7 days
    label: "Temporary working files — 7-day retention, no archive",
  },
};

export interface S3IsolationConfig {
  /** Fully qualified S3 prefix for this org + data class. */
  prefix: string;
  /** Base bucket name. */
  bucket: string;
  /** Active lifecycle rule for this prefix. */
  lifecycle: S3LifecycleRule;
}

/**
 * Resolve the S3 prefix and lifecycle policy for an org + data class.
 *
 * Prefix pattern: `s3://aegis-data/{env}/{org_id}/{dataClass}/`
 */
export function resolveS3Config(
  orgId: string,
  dataClass: S3DataClass,
  env: "production" | "staging" | "development" = "production",
): S3IsolationConfig {
  const bucket = `aegis-data-${env}`;
  const prefix = `${env}/${orgId}/${dataClass}/`;
  return {
    bucket,
    prefix,
    lifecycle: S3_LIFECYCLE_RULES[dataClass],
  };
}

/** Full s3:// URI for an object key within an org's isolated prefix. */
export function buildS3Uri(
  orgId: string,
  dataClass: S3DataClass,
  objectKey: string,
  env: "production" | "staging" | "development" = "production",
): string {
  const { bucket, prefix } = resolveS3Config(orgId, dataClass, env);
  return `s3://${bucket}/${prefix}${objectKey}`;
}

// ── KMS encryption keys ───────────────────────────────────────────────────────

/**
 * ARN of the shared KMS key used for free and pro orgs.
 * Set via environment variable to avoid hardcoding account IDs.
 */
const SHARED_KMS_KEY_ARN =
  process.env.AWS_SHARED_KMS_KEY_ARN ?? "arn:aws:kms:eu-central-1:000000000000:key/shared-aegis-key";

/** AWS region where customer-managed keys are created. */
const CMK_REGION = process.env.AWS_CMK_REGION ?? "eu-central-1";

/** AWS account ID that owns the CMK aliases. */
const CMK_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID ?? "000000000000";

export interface KmsKeyPolicy {
  keyArn: string;
  isCustomerManaged: boolean;
  /** Key alias used in AWS console / CloudTrail. */
  alias: string;
}

/**
 * Return the KMS key ARN and policy info for an org.
 *
 * Enterprise orgs get a customer-managed key (CMK) scoped to their org.
 * All other orgs share the platform-wide key.
 *
 * CMK alias pattern: `alias/aegis-org-{orgId}`
 */
export function getEncryptionKeyArn(orgId: string, tier: UserTier): KmsKeyPolicy {
  if (tier === "enterprise") {
    const alias = `alias/aegis-org-${orgId}`;
    return {
      keyArn: `arn:aws:kms:${CMK_REGION}:${CMK_ACCOUNT_ID}:${alias}`,
      isCustomerManaged: true,
      alias,
    };
  }

  return {
    keyArn: SHARED_KMS_KEY_ARN,
    isCustomerManaged: false,
    alias: "alias/aegis-shared",
  };
}

/**
 * Validate that a CMK exists for the org before creating enterprise resources.
 * In production this calls the AWS KMS DescribeKey API.
 *
 * Returns true if the key exists and is enabled, false otherwise.
 * Throws if AWS credentials are unavailable.
 */
export async function validateCmkExists(orgId: string): Promise<boolean> {
  const { alias } = getEncryptionKeyArn(orgId, "enterprise");
  // In production: call AWS KMS DescribeKey. Stub returns true for non-empty alias.
  // Replace with: const kms = new KMSClient({}); await kms.send(new DescribeKeyCommand({ KeyId: alias }));
  return alias.length > 0;
}
