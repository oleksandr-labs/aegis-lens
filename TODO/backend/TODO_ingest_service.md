# TODO — Service: Ingest

## Goal
Pull/push from sources, deduplicate, normalize to canonical event schema, emit to `events.normalized`.

## Progress
- 12 / 12 done

## Tasks
- [x] Adapter framework (one per source type) — `services/ingest/src/adapter.ts` (SourceAdapter interface + AdapterRegistry)
- [x] Per-source rate-limit + backoff — `services/ingest/src/rate-limiter.ts` (InMemoryRateLimiter, TokenBucketLimiter, RedisRateLimiter; createSourceLimiter with per-source defaults for NASA/Telegram/OpenSky/AISStream/Sentinel/Nominatim)
- [x] Cursor / checkpoint persistence — `services/ingest/src/checkpoint.ts` (InMemory + Redis impls)
- [x] Idempotent dedup by `(source, source_id, content_hash)` — `services/ingest/src/dedup.ts` (InMemory + Redis)
- [x] Media downloader (size + virus + content-type checks) — `services/ingest/src/media-downloader.ts` (50MB limit, MIME allow-list, magic-byte validation, SHA-256 deduplicated storage)
- [x] Archive every raw payload (S3 immutable) — `services/ingest/src/archive.ts` (S3RawArchive + InMemory)
- [x] Schema normalization to canonical event — `services/ingest/src/pipeline.ts` (IngestPipeline)
- [x] DLQ + replay tooling — `services/ingest/src/dlq.ts`: `enqueueDLQ()`, `replayDLQEntry()`, `replayAll()`, `discardDLQEntry()`, `dlqStats()`; admin UI: `GET /api/admin/ingest/dlq`
- [x] Backfill workers (bounded) — `services/ingest/src/backfill.ts` (BackfillConfig/BackfillJob types, BackfillWorker: enqueue/getJob/listJobs, bounded concurrency max 3, per-batch rate limiting, checkpoint progression, backfillWorker singleton)
- [x] Source-health metrics emission — `services/ingest/src/pipeline.ts` (IngestMetrics interface + IngestPipeline)
- [x] Compliance: PII redaction at ingest — `services/ingest/src/pii.ts` (redactPII, 4 rule categories)
- [x] Webhook receivers for push sources — `services/ingest/src/webhook-receiver.ts`: `PushSourceConfig`, `registerReceiver()`, HMAC verify (generic/Telegram/Twitter CRC/GitHub); route: `POST /api/ingest/webhook/:token`

## i18n
- Preserve original language; never overwrite originals.

### Примітки
Every event must be replayable from raw archive. No exceptions.
