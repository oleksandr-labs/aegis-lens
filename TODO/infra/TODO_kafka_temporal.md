# TODO — Event Streaming & Workflows

## Goal
Reliable streaming (Kafka) + reliable long-running workflows (Temporal).

## Progress
- 5 / 10 done

## Tasks

### Kafka
- [ ] Redpanda for dev simplicity; Confluent / MSK for prod
- [ ] Schema registry (Avro / Protobuf)
- [x] Topic naming convention + ownership — `infra/kafka/src/topics.ts` (`<domain>.<entity>.<verb>` convention, owner field per topic)
- [x] Partitioning strategy (by region for events; by source for ingest) — documented in KAFKA_TOPICS config
- [x] Retention + compaction per topic — per-topic `retentionMs` + `cleanupPolicy` (delete/compact) in topics.ts
- [ ] Tiered storage for cheap long retention
- [x] Consumer group + DLQ patterns — `CONSUMER_GROUPS` constants + `ingest.dlq` topic in catalog

### Temporal
- [ ] Temporal Cloud or self-hosted
- [x] Workflows: ingest backfill, satellite acquisition, AOI scheduling, report generation — `infra/temporal/src/workflows.ts` (5 workflow I/O types + task queues)
- [x] Activity timeouts + retries per workflow — `TIMEOUTS.fast/medium/long` with retry policies in workflows.ts
- [ ] Versioning policy

## i18n
- N/A.

### Примітки
Kafka for streaming, Temporal for orchestration. Don't mix.
