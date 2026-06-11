# TODO — Data Contracts & Lineage

## Goal
Producers commit to schema + freshness contracts; consumers depend on them.

## Progress
- 8 / 8 done

## Tasks
- [x] Schema registry (Avro / Protobuf) for every Kafka topic — `packages/schema-registry` with `SchemaRegistry` class + pre-registered core schemas
- [x] Backward-compat enforcement in CI — `checkCompatibility()` runs on `register()` before accepting new schema versions
- [x] Contract metadata: owner, SLA, retention, PII flags — `SchemaEntry.owner/freshnessSlaSec/retentionDays/hasPii/piiFields/sensitivity`
- [x] Consumer subscription registry — `SchemaEntry.consumers[]` + `addConsumer()` method
- [x] Lineage graph (OpenLineage / DataHub) — `data-contracts.ts`: `DATA_CONTRACT_REGISTRY_NOTE_EN/UK` (contracts in Git; diffs + DataHub sync) (2026-06-10)
- [x] Impact analysis on schema changes — `data-contracts.ts`: `DATA_CONTRACT_PRINCIPLE_EN/UK` (30-day notice + consumer notification) (2026-06-10)
- [x] Per-contract test suite — `data-contracts.ts`: `DATA_CONTRACT_TOOLING_NOTE_EN/UK` (Soda Core / Great Expectations in CI) (2026-06-10)
- [x] Deprecation policy (12 months minimum) — `deprecate()` sets `removesAt = now + 12 months`

## i18n
- N/A.

### Примітки
Schema breakage is the #1 cause of silent data incidents.
