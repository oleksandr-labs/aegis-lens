# TODO — Performance Optimization

## Goal
Sub-second perceived latency for map and dashboard; cost-efficient at 100k+ events/day.

## Progress
- 16 / 16 done

## Tasks

### Frontend
- [x] Route-level code splitting + RSC — `apps/web/src/lib/optimization/code-splitting.ts` (HEAVY_ROUTE_PATTERNS, CODE_SPLIT_BUDGET_KB=250, DYNAMIC_IMPORT_CONFIGS, assessCodeSplitting())
- [x] Web workers for heavy parsing — `apps/web/src/lib/optimization/web-workers.ts` + `apps/web/src/workers/parse-geojson.worker.ts` (WorkerTask union, WORKER_CONFIGS, createWorkerPool())
- [x] WebGL clustering tuning — `apps/web/src/lib/optimization/webgl-clustering.ts` (CLUSTERING_PRESETS, selectClusteringPreset(), CLUSTER_PAINT_OVERRIDES, estimateClusterFPS())
- [x] Bundle budget enforced in CI — `apps/web/src/lib/optimization/bundle-budget.ts` + `.github/scripts/check-bundle-budget.js` + `docs/optimization/bundle-budget-ci.md` (BUNDLE_BUDGETS, checkBundleBudget(), CI post-build runner)
- [x] Critical CSS / font subsetting — `apps/web/src/lib/optimization/critical-css.ts` (CRITICAL_CSS_SELECTORS, FONT_SUBSET_CHARS, FONT_PRELOAD_CONFIG, buildCriticalCssPolicy())

### Backend
- [x] PostGIS spatial index audit (GIST / BRIN where appropriate) — `apps/web/src/lib/optimization/postgis-indexes.ts` + `apps/web/src/lib/optimization/postgis-index-audit.sql` (10 indexes: GIST on geometry, BRIN on time columns, GIN on JSONB)
- [x] Materialized views for hot aggregates — `apps/web/src/lib/optimization/materialized-views.ts` + `apps/web/src/lib/optimization/materialized-views.sql` (mv_events_by_region_day, mv_source_health_summary, mv_active_alerts_count, mv_equipment_losses_daily)
- [x] Vector tile caching (CDN edge) — `apps/web/src/lib/optimization/tile-cache-policy.ts` (TILE_CACHE_POLICIES per-layer, buildTileCacheHeaders(), purgeTileCache() with Cloudflare API)
- [x] Redis caching for hot queries with TTL + tag invalidation — `apps/web/src/lib/optimization/redis-cache.ts` (HOT_QUERY_CACHE_CONFIGS, withCache<T>(), invalidateByTag(), ioredis-compatible, server-only)
- [x] Kafka partitioning by region — `apps/web/src/lib/optimization/kafka-partitioning.ts` (KAFKA_TOPIC_CONFIGS: 24/8/4/12 partitions, getPartitionKey(), estimatePartitionLoad() with djb2 hash)

### AI
- [x] Batched inference for OCR / CV — `apps/web/src/lib/optimization/batched-inference.ts` (BatchProcessor<T,R> class, createOcrBatcher() batch=8 timeout=100ms, createCvBatcher() batch=4 timeout=50ms)
- [x] Model quantization where viable — `apps/web/src/lib/optimization/model-quantization.ts` (QuantizationLevel, MODEL_QUANTIZATION_POLICIES for YOLOv8/Whisper/OCR/CLIP, selectQuantizationLevel(), estimateInferenceMs())
- [x] Tiered models: fast/cheap default, premium on-demand — `apps/web/src/lib/optimization/model-tiers.ts` (MODEL_TIER_CONFIG: haiku/sonnet/opus, selectModelTier() feature×userTier routing, estimateCost())

### Cost
- [x] Tiered storage (hot Postgres → warm Parquet on S3 → cold Glacier) — `apps/web/src/lib/optimization/tiered-storage.ts` (STORAGE_POLICIES for 7 data types, getStorageRecommendation(), estimateStorageCostUsd())
- [x] Compute autoscaling per service — `apps/web/src/lib/optimization/autoscaling.ts` (SERVICE_SCALING_CONFIGS for 6 services, computeScalingDecision(), generateHpaManifest() Kubernetes HPA YAML)
- [x] LLM cost dashboard — `apps/web/src/lib/optimization/llm-cost-dashboard.ts` (LlmCostEntry/Report types, LlmCostStore with record()/getReport()/getBudgetAlert(), llmCostStore singleton, MONTHLY_LLM_BUDGET_USD)

## i18n
- N/A.

### Примітки
Measure first. No optimization without a profile.
