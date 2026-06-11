/**
 * Kafka topic partitioning configuration — region-based partitioning for
 * the Aegis Lens event pipeline.
 *
 * Partition count aligns with Ukraine's 24 oblasts plus Kyiv city + Crimea
 * for the main events topic. Other topics use smaller partition counts
 * based on expected throughput and parallelism requirements.
 *
 * Consumers should use a StaticMembershipId equal to their replica index
 * so partition assignments are stable across rolling deployments.
 */

export interface KafkaTopicConfig {
  /** Kafka topic name. */
  topic: string;
  /** Number of partitions. */
  partitions: number;
  /** Replication factor (minimum 3 for production). */
  replicationFactor: number;
  /**
   * Description of the partition key extraction function.
   * Actual implementation is in getPartitionKey().
   */
  partitionKeyFn: string;
}

export const KAFKA_TOPIC_CONFIGS: KafkaTopicConfig[] = [
  {
    topic: "events.normalized",
    partitions: 24,
    replicationFactor: 3,
    partitionKeyFn:
      "record.region_code — partitions by oblast so per-region consumers see ordered events",
  },
  {
    topic: "alerts.triggered",
    partitions: 8,
    replicationFactor: 3,
    partitionKeyFn:
      "record.oblast_code — 8 partitions balances alert volume with consumer parallelism",
  },
  {
    topic: "tiles.invalidation",
    partitions: 4,
    replicationFactor: 3,
    partitionKeyFn:
      "record.layer_id — 4 partitions matches the number of tile-service replicas",
  },
  {
    topic: "ingest.raw",
    partitions: 12,
    replicationFactor: 3,
    partitionKeyFn:
      "record.source_id — distributes ingest load evenly across source integrations",
  },
  {
    topic: "events.verified",
    partitions: 24,
    replicationFactor: 3,
    partitionKeyFn:
      "record.region_code — mirrors events.normalized partitioning for join compatibility",
  },
  {
    topic: "ai.inference_requests",
    partitions: 8,
    replicationFactor: 3,
    partitionKeyFn:
      "record.model_id — routes inference requests to model-specific consumer groups",
  },
];

/** Partition key field names by topic. */
const TOPIC_KEY_FIELDS: Record<string, string> = {
  "events.normalized": "region_code",
  "alerts.triggered": "oblast_code",
  "tiles.invalidation": "layer_id",
  "ingest.raw": "source_id",
  "events.verified": "region_code",
  "ai.inference_requests": "model_id",
};

/**
 * Extract the partition key from a Kafka record for a given topic.
 *
 * Returns the string value of the configured key field, or falls back
 * to the string representation of the entire record if the field is absent.
 *
 * @param topic  - Kafka topic name
 * @param record - The message payload as a plain object
 */
export function getPartitionKey(
  topic: string,
  record: Record<string, unknown>
): string {
  const field = TOPIC_KEY_FIELDS[topic];
  if (!field) {
    // Unknown topic — use a stable hash of the whole record
    return JSON.stringify(record);
  }
  const value = record[field];
  if (value === undefined || value === null) {
    // Missing key field — fall back to empty string (partition 0)
    return "";
  }
  return String(value);
}

/**
 * Estimate how many events each partition will receive given a distribution
 * of events by region/source.
 *
 * Uses a simple modular hash (djb2) to map keys to partition indices,
 * mirroring the default Kafka partitioner behaviour.
 *
 * @param topic              - Kafka topic name
 * @param regionDistribution - Map of key → event count
 * @returns Map of partition index → estimated event count
 */
export function estimatePartitionLoad(
  topic: string,
  regionDistribution: Record<string, number>
): Record<number, number> {
  const config = KAFKA_TOPIC_CONFIGS.find((c) => c.topic === topic);
  if (!config) return {};

  const load: Record<number, number> = {};
  for (let i = 0; i < config.partitions; i++) {
    load[i] = 0;
  }

  for (const [key, count] of Object.entries(regionDistribution)) {
    const partition = djb2Hash(key) % config.partitions;
    load[partition] = (load[partition] ?? 0) + count;
  }

  return load;
}

/** djb2 hash — same algorithm used by librdkafka's default partitioner. */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}
