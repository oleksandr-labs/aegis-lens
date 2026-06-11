# TODO — Usage Metering

## Goal
Accurate, real-time metering of API calls, AI tokens, AOI usage, exports.

## Progress
- 8 / 8 done

## Tasks
- [x] Per-event metering pipeline (gateway → Kafka → aggregator → billing) — `services/metering/src/aggregator.ts` (`MeteringAggregator.ingest()`/`ingestBatch()`, `buildStripeMeterEvents()`)
- [x] Per-tenant counters in Redis + reconcile to DB — per-`(org, product, period)` `UsageCounter` map (Redis in prod) + `reconcile()` in `reconciliation.ts`
- [x] Idempotent counting — `idempotencyKey` dedup via `seenKeys`; duplicate `ingest()` returns false (no-op)
- [x] Per-product SKU mapping (Stripe meters) — `METER_SKUS` in `types.ts` (9 products → Stripe meter names + billing divisors)
- [x] Customer usage dashboard ✓ Sprint 2.2
- [x] Threshold alerts ("80% of plan used") — `checkThresholds()` fires 80%/100% alerts once each per period
- [x] Overage handling (block / pay-as-you-go / negotiated) — `computeOverage()` with `OverageMode` + per-unit overage pricing
- [x] Monthly reconciliation report — `reconcile()` (metered vs authoritative, 1% drift tolerance, `safeToInvoice` gate) + `formatReconciliation()` in `reconciliation.ts`

## i18n
- N/A directly.

### Примітки
A double-counted metric is a refund letter. Idempotency from day one.
