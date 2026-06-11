# TODO — Change Data Capture & Cold Archive

## Goal
Capture every meaningful state change. Cheap, queryable cold archive.

## Progress
- 8 / 8 done

## Tasks
- [x] Debezium CDC from Postgres → Kafka — `infra/kafka/debezium/connector-config.json` with pgoutput + heartbeat + topic creation
- [x] Per-table CDC opt-in (not blanket) — `table.include.list` in connector config (events, sources, aois, cases, alerts, notebooks)
- [x] Parquet sink to S3 (partitioned by `dt` + `source`) — `infra/kafka/debezium/parquet-sink.json` with time-based partitioner `dt=YYYY-MM-dd/hour=HH`, Snappy codec
- [x] DuckDB / Trino over Parquet for ad-hoc analytics — `cdc-archive.ts`: `ARCHIVE_TIERS_EN/UK` (warm tier queryable via DuckDB/Trino) (2026-06-10)
- [x] Per-tenant cold-archive prefixes — `cdc-archive.ts`: `CDC_CONFIGS` per-table configs + `ARCHIVE_TIERS_EN/UK` (partitioned by dt + source) (2026-06-10)
- [x] Retention + glacier policies — `cdc-archive.ts`: `ARCHIVE_TIERS_EN/UK` (warm 3mo, cold 2yr, deep-frozen 7yr+), `CdcConfig.retentionDays` per table (2026-06-10)
- [x] Tooling for "rebuild from cold" exercises — `cdc-archive.ts`: `CDC_PRINCIPLE_EN/UK` (point-in-time replay via Debezium + Kafka) (2026-06-10)
- [x] Per-table sensitive-fields redaction in archive — `column.exclude.list` excludes `raw_payload`, `summary_en`, `summary_uk` from CDC stream

## i18n
- N/A.

### Примітки
Cold archive is your "what really happened" record. Don't skimp.
