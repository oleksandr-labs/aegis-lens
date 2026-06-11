# TODO — Storage

## Goal
Right tool per data shape: relational + geo + search + vector + blob + cold archive.

## Progress
- 12 / 12 done

## Tasks

### Primary
- [x] PostgreSQL 16 + PostGIS for events, regions, users — apps/web/src/lib/data/storage-config.ts
- [x] TimescaleDB extension for time-series aggregates — apps/web/src/lib/data/storage-config.ts
- [x] Elasticsearch / OpenSearch for full-text search — apps/web/src/lib/data/storage-config.ts
- [x] Qdrant for embeddings (multilingual + multimodal) — apps/web/src/lib/data/storage-config.ts
- [x] Redis for cache + ephemeral state — apps/web/src/lib/data/storage-config.ts

### Object storage
- [x] S3 (MinIO in dev) for images, video, satellite scenes, exports — apps/web/src/lib/data/storage-config.ts
- [x] CloudFront / Bunny CDN in front — apps/web/src/lib/data/storage-config.ts

### Archive
- [x] Parquet on S3 partitioned by `dt=YYYY-MM-DD/source=...` for cheap historical queries — apps/web/src/lib/data/storage-config.ts
- [x] Glacier / Deep Archive for >2y data — apps/web/src/lib/data/storage-config.ts
- [x] DuckDB / Trino for ad-hoc analytics over Parquet — apps/web/src/lib/data/storage-config.ts

### Catalog
- [x] Schema registry (events, layers, sources) — apps/web/src/lib/data/storage-config.ts
- [x] Data catalog (DataHub / OpenMetadata) for enterprise customers — apps/web/src/lib/data/storage-config.ts

## i18n
- Multilingual text columns + per-locale full-text indexes in Elastic.

### Примітки
Single-source-of-truth: Postgres. Everything else is a derived index.
