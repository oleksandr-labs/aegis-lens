# Scalability Plan — Aegis Lens

"Don't pre-scale. Plan, but build the next tier *just* before you need it."

## Growth Tiers

### 1k DAU (current / MVP)
**Infrastructure:** Single-region AWS eu-central-1, single-AZ RDS PostgreSQL, Vercel edge for web.

**Bottlenecks:** None — vertical scaling headroom available.

**Actions:**
- Monitor: Postgres CPU, p99 query latency, Kafka consumer lag
- Alert thresholds: CPU > 70%, query p99 > 100ms, free storage < 20%
- No horizontal scaling needed yet

### 10k DAU
**New bottleneck:** Postgres read contention; LLM latency spikes.

**Actions:**
- Add 1 Postgres read replica (route analytic + search queries there)
- Add Redis/Upstash for hot key caching (event feeds, layer tile responses)
- Add Cloudflare CDN caching for public API responses (events layer, regions)
- Enable `EXPLAIN ANALYZE` logging on queries > 200ms
- Materialized view: `mv_events_daily_region` for dashboard aggregates

### 100k DAU
**New bottleneck:** Postgres write throughput; search latency; tile generation cost.

**Actions:**
- Migrate events table to TimescaleDB hypertable with continuous aggregates (already designed)
- Add Elasticsearch cluster for FTS (offload from Postgres GIN indexes)
- Implement Qdrant cluster for semantic search (vector queries at scale)
- Add vector tile CDN pre-generation for high-traffic layers (drones, missiles)
- Implement async heavy queries: reports, exports → background jobs + webhook notify
- Add read-dedicated replicas per service (anomaly, tile, search each get their own)

### 1M DAU
**New bottleneck:** Write path latency; tile generation; LLM spend.

**Actions:**
- Multi-region: add us-east-1 read cluster with 15-minute eventual consistency for analytics
- Edge tile serving: CloudFront Lambda@Edge or Cloudflare Workers for MVT
- TimescaleDB continuous aggregates replace real-time aggregation queries
- Tiered LLM: default to haiku for short queries; sonnet for complex; cache top-5 prompts
- Parquet cold archive: move events > 6 months to S3 Parquet for PITR only

### 10M DAU
**New bottleneck:** Write path (single Postgres primary).

**Options to evaluate:**
- Citus distributed Postgres (events table distributed by org_id)
- CRDT counters for hot aggregates (view counts, danger index) in Redis
- Multi-primary with CockroachDB or Spanner (trade: complexity + latency)
- Recommendation: Citus + targeted Redis counters first; global DB only if truly needed

## Per-Bottleneck Runbook

| Bottleneck | Indicator | Mitigation | Cost impact |
|---|---|---|---|
| Postgres writes | p99 INSERT > 50ms | Partition by occurred_at (done); add more hot partitions | Low |
| Postgres reads | Read replica CPU > 60% | Add replica; route heavier queries to dedicated replica | Medium |
| Event search | Elasticsearch CPU > 70% | Add data nodes (horizontal); optimize mappings | Medium |
| Vector search | Qdrant OOM | Add segment; switch to HNSW with ef_construction tuning | Low |
| LLM inference | Cost > $X/month | Enable prompt caching; add summarization cache; tier models | High |
| Map tiles | CDN miss rate > 20% | Pre-generate hot layers at peak zoom levels | Medium |
| Kafka lag | Consumer lag > 10k | Scale consumer replicas; add partitions; tune batch size | Low |

## Architectural Principles for Scale

1. **Postgres first, CQRS later.** Don't introduce Kafka for the sake of it. Add downstream stores only when Postgres is the measured bottleneck.
2. **Read replicas before sharding.** Read replicas solve 80% of scale problems at 5% the complexity.
3. **Cache at the right layer.** Cache aggregated responses at CDN; cache hot DB rows in Redis; don't cache everything.
4. **Async trumps sync for non-critical paths.** Reports, exports, bulk operations: push to background workers.
5. **Measure before optimizing.** Every optimization must have a baseline measurement and a success metric.
