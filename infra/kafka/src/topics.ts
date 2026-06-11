/**
 * Kafka topic catalog for Aegis Lens.
 *
 * Topic naming convention: <domain>.<entity>.<verb>
 * Partitioning: events by region (for locality), ingest by source (for ordering).
 *
 * Retention: hot topics 7 days, archive topics 90 days + tiered storage.
 */

export interface TopicConfig {
  name: string;
  partitions: number;
  replicationFactor: number;
  retentionMs: number;
  cleanupPolicy: "delete" | "compact" | "compact,delete";
  compressionType?: "gzip" | "snappy" | "lz4" | "zstd";
  /** Schema registry subject (Avro/Protobuf) */
  schemaSubject?: string;
  owner: string;
  description: string;
}

const DAY_MS = 86_400_000;

export const KAFKA_TOPICS: TopicConfig[] = [
  // ── Ingest pipeline ───────────────────────────────────────────────────────
  {
    name: "ingest.raw.created",
    partitions: 12,
    replicationFactor: 3,
    retentionMs: 7 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "zstd",
    owner: "ingest-team",
    description: "Raw payloads from all ingest adapters. Partitioned by source_id.",
  },
  {
    name: "ingest.normalized.created",
    partitions: 12,
    replicationFactor: 3,
    retentionMs: 7 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "zstd",
    owner: "ingest-team",
    description: "Normalized CanonicalEvent after adapter.normalise(). Before enrichment.",
  },
  {
    name: "ingest.dlq",
    partitions: 3,
    replicationFactor: 3,
    retentionMs: 30 * DAY_MS,
    cleanupPolicy: "delete",
    owner: "ingest-team",
    description: "Dead-letter queue for failed ingest messages.",
  },
  // ── Events ────────────────────────────────────────────────────────────────
  {
    name: "events.enriched",
    partitions: 24,
    replicationFactor: 3,
    retentionMs: 7 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "zstd",
    schemaSubject: "events.enriched-value",
    owner: "events-team",
    description: "Events after NLP enrichment. Partitioned by region hash.",
  },
  {
    name: "events.verified",
    partitions: 12,
    replicationFactor: 3,
    retentionMs: 90 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "zstd",
    schemaSubject: "events.verified-value",
    owner: "events-team",
    description: "Events after verification state transitions.",
  },
  {
    name: "events.retracted",
    partitions: 3,
    replicationFactor: 3,
    retentionMs: 365 * DAY_MS,
    cleanupPolicy: "compact",
    owner: "events-team",
    description: "Retraction records. Compacted by event_id key.",
  },
  // ── Alerts ────────────────────────────────────────────────────────────────
  {
    name: "alerts.triggered",
    partitions: 6,
    replicationFactor: 3,
    retentionMs: 7 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "snappy",
    owner: "alerts-team",
    description: "Triggered alert notifications for delivery fan-out.",
  },
  // ── Search indexing ───────────────────────────────────────────────────────
  {
    name: "search.index.commands",
    partitions: 6,
    replicationFactor: 3,
    retentionMs: 1 * DAY_MS,
    cleanupPolicy: "delete",
    owner: "search-team",
    description: "Index/update/delete commands for Elasticsearch and Qdrant.",
  },
  // ── Webhooks ──────────────────────────────────────────────────────────────
  {
    name: "webhooks.dispatch",
    partitions: 6,
    replicationFactor: 3,
    retentionMs: 7 * DAY_MS,
    cleanupPolicy: "delete",
    owner: "platform-team",
    description: "Webhook delivery tasks for the dispatcher workers.",
  },
  // ── Analytics ─────────────────────────────────────────────────────────────
  {
    name: "analytics.search.events",
    partitions: 12,
    replicationFactor: 3,
    retentionMs: 90 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "gzip",
    owner: "analytics-team",
    description: "Search query events for analytics and zero-result tracking.",
  },
  {
    name: "analytics.user.events",
    partitions: 12,
    replicationFactor: 3,
    retentionMs: 90 * DAY_MS,
    cleanupPolicy: "delete",
    compressionType: "gzip",
    owner: "analytics-team",
    description: "User interaction events for product analytics.",
  },
];

export const CONSUMER_GROUPS = {
  NLP_ENRICHER: "nlp.enricher.v1",
  VERIFICATION: "verify.pipeline.v1",
  ALERT_ROUTER: "alerts.router.v1",
  SEARCH_INDEXER: "search.indexer.v1",
  WEBHOOK_DISPATCHER: "webhooks.dispatcher.v1",
  ANALYTICS_SINK: "analytics.sink.v1",
  ANOMALY_DETECTOR: "anomaly.detector.v1",
} as const;
