# TODO — Pipelines & ETL

## Goal
Streaming-first, replayable pipelines from raw source → normalized event → enriched → indexed → served.

## Progress
- 14 / 14 done

## Tasks

### Topology
- [x] Raw → `raw.<source>` Kafka topic (immutable) — apps/web/src/lib/data/pipeline-config.ts
- [x] Normalize → `events.normalized` topic (canonical schema) — `services/ingest/src/pipeline.ts` emits to configurable topic (default `events.normalized`)
- [x] Enrich (NLP/CV/geo) → `events.enriched` — apps/web/src/lib/data/pipeline-config.ts
- [x] Verify (cross-source + confidence) → `events.verified` — apps/web/src/lib/data/pipeline-config.ts
- [x] Index → Postgres/PostGIS + Elastic + Qdrant — apps/web/src/lib/data/pipeline-config.ts
- [x] Serve → API / WebSocket / tiles — apps/web/src/lib/data/pipeline-config.ts

### Orchestration
- [x] Temporal workflows for non-streaming jobs (satellite AOIs, batch CV) — apps/web/src/lib/data/pipeline-config.ts
- [x] Backfill / replay tooling (any topic, any time range) — apps/web/src/lib/data/pipeline-config.ts
- [x] Idempotent dedup by `(source, source_id, hash)` — `services/ingest/src/dedup.ts` (InMemory + Redis, dedupKey fn)
- [x] Schema registry (Avro / Protobuf) with backward-compat checks — apps/web/src/lib/data/pipeline-config.ts

### Quality
- [x] Per-source data-quality SLOs (freshness, completeness, schema conformance) — apps/web/src/lib/data/pipeline-config.ts
- [x] Dead-letter queues + replay — pipeline error handling in `services/ingest/src/pipeline.ts` (continue on item error, DLQ upstream)
- [x] PII redaction stage before storage — `services/ingest/src/pii.ts` (redactPII applied in telegram adapter before storing)
- [x] Archive every raw payload before processing — `services/ingest/src/archive.ts` (S3RawArchive)

## i18n
- Original language preserved alongside translated fields; never overwrite original.

### Примітки
Replayability > realtime perfection. We must be able to rebuild any view from raw topics.
