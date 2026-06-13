/**
 * Tiered Storage configuration for Kafka / Redpanda — Aegis Lens
 *
 * Tiered storage moves cold log segments to object storage (S3) while keeping
 * hot segments on local NVMe. This enables:
 *   - 90-day retention on ingest topics without proportional disk cost
 *   - Unlimited replay for historical analysis workflows
 *   - Decoupled broker scaling from retention scaling
 *
 * Implementation:
 *   - Dev:  Redpanda built-in tiered storage → MinIO (docker-compose)
 *   - Prod: MSK with S3 tiered storage (AWS) OR Confluent Cloud with
 *           infinite retention add-on
 *
 * Per-topic tiered storage configuration is appended to the topic configs
 * in `infra/kafka/src/topics.ts` at bootstrap time.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TieredStorageConfig {
  /** Whether tiered storage is enabled globally on the cluster. */
  enabled: boolean;
  /** S3 (or MinIO) bucket for cold segments. */
  s3Bucket: string;
  /** S3 key prefix. Segments are stored under prefix/<topic>/<partition>/. */
  s3Prefix: string;
  /** AWS region of the bucket. */
  s3Region: string;
  /** Endpoint URL override — for MinIO in dev. */
  s3EndpointUrl?: string;
  /** IAM role ARN for MSK to assume when writing to S3 (prod only). */
  iamRoleArn?: string;
}

/** Per-topic tiered storage overrides. */
export interface TopicTieredStorageConfig {
  topicName: string;
  /**
   * After how many bytes a segment is eligible to be uploaded to S3.
   * Default: 128 MB. Larger = fewer S3 API calls; smaller = faster tiering.
   */
  segmentBytes: number;
  /**
   * Local retention: how long to keep segments on broker NVMe *before*
   * they are moved to S3. Separate from the total retention window.
   * -1 = keep locally only as long as total retention allows.
   */
  localRetentionMs: number;
  /** Total retention after tiering (ms). -1 = infinite. */
  remoteRetentionMs: number;
}

// ── Cluster-level config ──────────────────────────────────────────────────────

export function getTieredStorageConfig(): TieredStorageConfig {
  const isProd = process.env.NODE_ENV === "production";
  return {
    enabled: true,
    s3Bucket: isProd
      ? (process.env.KAFKA_TIERED_STORAGE_BUCKET ?? "aegis-kafka-tiered-prod")
      : (process.env.KAFKA_TIERED_STORAGE_BUCKET ?? "aegis-kafka-tiered-dev"),
    s3Prefix: "kafka-segments",
    s3Region: process.env.AWS_REGION ?? "eu-central-1",
    s3EndpointUrl: isProd ? undefined : (process.env.MINIO_ENDPOINT ?? "http://minio:9000"),
    iamRoleArn: isProd ? process.env.KAFKA_TIERED_STORAGE_ROLE_ARN : undefined,
  };
}

// ── Per-topic tiered storage overrides ────────────────────────────────────────

const DAY_MS = 86_400_000;

/**
 * Tiered storage configuration per topic.
 *
 * Design rationale:
 *   - ingest.raw.*:         90 days remote — cheap historical replay
 *   - events.*:             365 days remote — longitudinal analysis
 *   - alerts.*:             30 days remote — operational only
 *   - analytics.*:          90 days remote — trend analysis
 *   - search.*:             7 days remote  — short-lived index commands
 *   - webhooks.*:           14 days remote — redelivery window
 *   - ingest.dlq:           90 days remote — forensic review
 */
export const TOPIC_TIERED_CONFIGS: TopicTieredStorageConfig[] = [
  // ── Ingest ──────────────────────────────────────────────────────────────
  {
    topicName: "ingest.raw.created",
    segmentBytes: 256 * 1024 * 1024,   // 256 MB (high volume, large payloads)
    localRetentionMs: 2 * DAY_MS,      // keep 2 days locally, then move to S3
    remoteRetentionMs: 90 * DAY_MS,
  },
  {
    topicName: "ingest.normalized.created",
    segmentBytes: 128 * 1024 * 1024,
    localRetentionMs: 3 * DAY_MS,
    remoteRetentionMs: 90 * DAY_MS,
  },
  {
    topicName: "ingest.dlq",
    segmentBytes: 32 * 1024 * 1024,
    localRetentionMs: 7 * DAY_MS,
    remoteRetentionMs: 90 * DAY_MS,
  },
  // ── Events ──────────────────────────────────────────────────────────────
  {
    topicName: "events.enriched",
    segmentBytes: 256 * 1024 * 1024,
    localRetentionMs: 7 * DAY_MS,
    remoteRetentionMs: 365 * DAY_MS,
  },
  {
    topicName: "events.verified",
    segmentBytes: 128 * 1024 * 1024,
    localRetentionMs: 7 * DAY_MS,
    remoteRetentionMs: 365 * DAY_MS,
  },
  {
    topicName: "events.retracted",
    segmentBytes: 32 * 1024 * 1024,
    localRetentionMs: 30 * DAY_MS,
    remoteRetentionMs: -1,             // infinite: retractions are permanent record
  },
  // ── Alerts ──────────────────────────────────────────────────────────────
  {
    topicName: "alerts.triggered",
    segmentBytes: 64 * 1024 * 1024,
    localRetentionMs: 3 * DAY_MS,
    remoteRetentionMs: 30 * DAY_MS,
  },
  // ── Analytics ───────────────────────────────────────────────────────────
  {
    topicName: "analytics.search.events",
    segmentBytes: 128 * 1024 * 1024,
    localRetentionMs: 7 * DAY_MS,
    remoteRetentionMs: 90 * DAY_MS,
  },
  {
    topicName: "analytics.user.events",
    segmentBytes: 128 * 1024 * 1024,
    localRetentionMs: 7 * DAY_MS,
    remoteRetentionMs: 90 * DAY_MS,
  },
  // ── Search ──────────────────────────────────────────────────────────────
  {
    topicName: "search.index.commands",
    segmentBytes: 64 * 1024 * 1024,
    localRetentionMs: 1 * DAY_MS,
    remoteRetentionMs: 7 * DAY_MS,
  },
  // ── Webhooks ─────────────────────────────────────────────────────────────
  {
    topicName: "webhooks.dispatch",
    segmentBytes: 64 * 1024 * 1024,
    localRetentionMs: 3 * DAY_MS,
    remoteRetentionMs: 14 * DAY_MS,
  },
];

// ── Redpanda tiered storage topic config map ──────────────────────────────────

/**
 * Returns the Redpanda / Kafka topic config properties that enable tiered
 * storage for a given topic. Pass these to the admin client's `createTopics`
 * or `alterConfigs` call.
 *
 * Redpanda properties:
 *   redpanda.remote.write = true
 *   redpanda.remote.read  = true
 *   retention.local.target.bytes = -1 (use ms instead)
 *   retention.local.target.ms = <localRetentionMs>
 *   retention.bytes  = -1
 *   retention.ms     = <remoteRetentionMs>
 *
 * MSK / Confluent use different property names — see inline comments.
 */
export function buildTopicTieredConfig(
  cfg: TopicTieredStorageConfig,
): Record<string, string> {
  return {
    // ── Redpanda ──────────────────────────────────────────────────────────
    "redpanda.remote.write":            "true",
    "redpanda.remote.read":             "true",
    "retention.local.target.ms":        String(cfg.localRetentionMs),
    "retention.local.target.bytes":     "-1",

    // ── Confluent / MSK (same property names but different prefix) ────────
    // "confluent.tier.enable": "true",
    // "confluent.tier.local.hotset.ms": String(cfg.localRetentionMs),

    // ── Standard Kafka retention (remote window) ──────────────────────────
    "retention.ms":                     String(cfg.remoteRetentionMs),
    "retention.bytes":                  "-1",
    "segment.bytes":                    String(cfg.segmentBytes),
  };
}

// ── Redpanda cluster-level broker config (applied via rpk) ────────────────────

/**
 * Outputs the `rpk cluster config set` commands needed to enable tiered
 * storage at the cluster level.
 *
 * Usage: pipe the output of this function to `bash` during cluster bootstrap.
 */
export function buildClusterTieredStorageCommands(cfg: TieredStorageConfig): string[] {
  const cmds: string[] = [
    "rpk cluster config set cloud_storage_enabled true",
    `rpk cluster config set cloud_storage_bucket ${cfg.s3Bucket}`,
    `rpk cluster config set cloud_storage_region ${cfg.s3Region}`,
  ];

  if (cfg.s3EndpointUrl) {
    cmds.push(`rpk cluster config set cloud_storage_api_endpoint ${cfg.s3EndpointUrl}`);
    cmds.push("rpk cluster config set cloud_storage_disable_tls true");
  }

  if (cfg.iamRoleArn) {
    cmds.push(`rpk cluster config set cloud_storage_credentials_source aws_instance_metadata`);
  } else {
    // Dev: use access key / secret from environment
    cmds.push("rpk cluster config set cloud_storage_credentials_source config_file");
    cmds.push(`rpk cluster config set cloud_storage_access_key $CLOUD_STORAGE_ACCESS_KEY`);
    cmds.push(`rpk cluster config set cloud_storage_secret_key $CLOUD_STORAGE_SECRET_KEY`);
  }

  return cmds;
}
