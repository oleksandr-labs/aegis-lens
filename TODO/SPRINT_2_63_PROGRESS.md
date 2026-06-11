# Sprint 2.63 Progress

**Date:** 2026-06-10
**Status:** Complete
**Theme:** Backend Services, API Platform, Observability, Optimization, Email Deliverability, Tech Integrations
**Tasks closed:** ~113 (across 19 TODO files, all fully or maximally closed)

Dispatched as 8 parallel agents, each owning a coherent sub-area. **133 new files** — TypeScript modules, Python services, Go SDK, SQL migrations, YAML configs, docs. Same proven pattern: typed interfaces + heuristic baselines for ML/infra-bound tasks, fail-soft defaults, `server-only` guards, EN+UK strings. No shared files modified (no registry/map-style changes this sprint).

---

## Completed by agent

### Agent 1 — Backend Services (6 tasks)
Closed the last open items across 5 backend service TODO files:

- **Alert SLA monitor** — `services/alerts/src/sla.ts`: `AlertSlaEvent`, ring buffer (1000 events), `SlaMonitor` singleton, p50/p95/p99 percentiles, `SLA_THRESHOLD_MS = 5000`.
- **Alert NLP eval harness** — `services/alerts/src/eval.ts`: `NlParseTestCase`, `NL_TEST_SUITE` (10 cases: 5 EN + 5 UK, missile/explosion/drone/shelling/air-raid), `evaluateNlParse()` (precision/recall/F1 with ±5% numeric tolerance), `EvalReport`.
- **Geo human-override channel** — `services/geo/src/override.ts`: `GeoOverride`, `InMemoryOverrideStore` (submit/approve/training queue), `createOverrideStore()` factory.
- **Ingest backfill workers** — `services/ingest/src/backfill.ts`: `BackfillConfig`, `BackfillJob`, `BackfillWorker` class (enqueue, concurrency guard max 3, checkpoint progression, 10000-batch safety ceiling), `backfillWorker` singleton.
- **Search SLO monitor** — `services/search/src/slo.ts`: `SearchLatencySample`, `SloMonitor` ring buffer (500 samples), `SEARCH_SLO_MS = 250`, `getSloReport()` with p95/p99 + sloMet boolean.
- **Tile raster server** — `services/tiles/src/raster.ts` + `apps/web/src/app/api/layers/raster/[layer]/[z]/[x]/[y]/route.ts`: `RasterTileConfig`, `RASTER_LAYER_CONFIGS` (sentinel-2-rgb, sentinel-1-sar, landsat-thermal), `buildRasterTileUrl()`, proxy route with validation + Cache-Control.

TODO progress: alerts 10/10, geo 10/10, ingest 12/12, search 11/11, tiles 9/9.

---

### Agent 2 — Vision TODO Audit + API Gateway (11 tasks)
**Vision audit (6 tasks):** Confirmed that `detectors.ts`, `manipulation.ts`, `reverse-image.ts`, `video-frames.ts` (services/vision) + `ocr.ts`, `stt.ts` (services/nlp) were all fully implemented in Sprints 2.57/2.60 but TODO was not updated. Backfilled `- [x]` citations.

**GPU autoscaling** — `services/vision/src/gpu-autoscaling.ts`: `GpuTier` enum, `GpuAutoscalePolicy`, `DEFAULT_POLICY` (min 0, max 4, scaleUp at 10 pending, $2/hr cost cap), `evaluateScaling()`.

**API Gateway (5 tasks):**
- Gateway choice ADR → `docs/architecture/gateway-choice.md` (Custom Fastify Stage 1 → Envoy Stage 2)
- IP allow/deny lists → `apps/web/src/lib/ip-allowlist.ts` (CIDR matching, per-org allow/deny, `IpListStore`)
- Usage metering → `apps/web/src/lib/usage-metering.ts` (`MeterEvent`, `MeteringBuffer`, Stripe metered billing flush)
- OpenAPI schema validation → `apps/web/src/lib/schema-validation.ts` (Ajv-compatible typed validation)
- Bot/scraping defense → `apps/web/src/lib/bot-defense.ts` (20+ scraper UA patterns, good-bot allow-list, `BotDecision`)

TODO progress: vision 11/11, api_gateway 11/11.

---

### Agent 3 — Reports Service + API Design (9 tasks)
**Reports (5 tasks):**
- Retrieval pipeline → `services/reports/src/retrieval.ts` (Qdrant+Elastic+Postgres stubs, RRF fusion with k=60, per-source weights)
- Delivery → `services/reports/src/delivery.ts` (`DeliveryChannel` union, per-channel handlers: web/email/Slack/Telegram/API, `deliverToAll()` parallel fan-out)
- Review queue → `services/reports/src/review-queue.ts` (`ReviewStatus` state machine, `InMemoryReviewQueue`, `assertReviewApproved()` gate for analytical kinds)
- Subscription+scheduling → `services/reports/src/subscription.ts` (`ReportSchedule`, `SubscriptionStore`, `computeNextRunAt()`, `getDueSubscriptions()`)
- Per-org branding → `services/reports/src/branding.ts` (`OrgBranding`, `BrandingStore`, `applyBranding()` with CSS custom properties + HTML token replacement, `BRANDING_CSS_TEMPLATE`)

**API Design (4 tasks):**
- Field selection → `apps/web/src/lib/field-selection.ts` (`parseFieldsParam()`, `applyFieldSelection<T>()`)
- Sparse fieldsets/expansion → `apps/web/src/lib/include-expansion.ts` (`parseIncludeParam()`, `expandIncludes()`, `buildExpansionResponse()`)
- GraphQL schema → `apps/web/src/lib/graphql-schema.ts` (`AEGIS_GRAPHQL_SCHEMA` SDL: events/regions/copilot queries, full type definitions)
- Idempotency keys → `apps/web/src/lib/idempotency.ts` (`InMemoryIdempotencyStore` 24h TTL, `withIdempotency()`, `Idempotent-Replayed` header on cache hits)

TODO progress: reports 10/10, api_design 14/14.

---

### Agent 4 — Rate Limiting + SDKs + Versioning + Webhooks (13 tasks)
**Rate Limiting (3):**
- Quota dashboard → `apps/web/src/lib/quota-dashboard.ts` + `apps/web/src/app/api/v1/quota/route.ts`
- Abuse signals → `apps/web/src/lib/abuse-block.ts` (5 signals, graduated block durations 5min–24h, `notifyAbuse()`)
- Enterprise limits → `apps/web/src/lib/enterprise-limits.ts` (`EnterpriseContract`, `getEffectiveLimits()` deep-merge, auto-expiry)

**SDKs (5):**
- Go SDK → `packages/sdk-go/` (`go.mod`, `client.go`, `events.go`, `regions.go`, `webhook_verify.go`, `README.md`)
- Example apps → `packages/sdk-ts/examples/basic-events.ts` + `packages/sdk-python/examples/basic_events.py`
- Jupyter notebook → `packages/sdk-python/notebooks/aegis_quickstart.ipynb` (4 cells: install/auth/pandas analysis/folium map)
- SDK changelogs → `packages/sdk-ts/CHANGELOG.md` + `packages/sdk-python/CHANGELOG.md` (v0.1.0)
- Auto-publish → `.github/workflows/publish-sdks.yml` (npm + PyPI + Go tag jobs)

**Versioning (3):**
- Breaking change guard → `apps/web/src/lib/api-version-guard.ts` + `docs/api/breaking-change-policy.md`
- Notification cadence → `apps/web/src/lib/deprecation-notifier.ts` (60/30/7d cadence, `shouldNotifyToday()`, `DEPRECATION_REGISTRY`)
- Per-version analytics → `apps/web/src/lib/version-analytics.ts` (`recordVersionUsage()`, `checkKillSwitch()`, `KILL_SWITCH_CONFIG`)

**Webhooks (2):**
- Per-region routing → `services/webhooks/src/regional-routing.ts` (`WebhookRegion`, `REGIONAL_ENDPOINTS`, `COMPLIANCE_REGION_MAP` 30+ countries)
- Event catalog → `docs/webhooks/event-catalog.md` (9 event types with TS interfaces + EN/UK descriptions + JSON examples)

TODO progress: rate_limiting 9/9, sdks 9/9, versioning 8/8, webhooks 10/10.

---

### Agent 5 — Observability (11 tasks)
New directory: `apps/web/src/lib/observability/` (11 modules):

| Module | Description |
|--------|-------------|
| `logging.ts` | `StructuredLogger`, Vector HTTP source → Loki/OpenSearch |
| `tracing.ts` | Extends `telemetry.ts`; `createChildSpan()`, multi-backend OTLP/Honeycomb/Tempo |
| `metrics.ts` | 15 Prometheus metrics, `metricsRegistry.toPrometheusText()` |
| `synthetic-checks.ts` | 14 external sources, `runCheck()` + `runAllChecks()` |
| `llm-observability.ts` | Langfuse/Helicone/console backends, session cost tracking |
| `vectordb-health.ts` | Qdrant `/health` + `/collections` probes, fail-soft |
| `alerting.ts` | PagerDuty Events v2 + Slack Block Kit, severity-based fan-out |
| `slos.ts` | 7 SLOs (ingest/tiles/search/copilot/alerts/availability/sources) |
| `source-health.ts` | Public source-health report for `/status` page |
| `api-abuse-detection.ts` | Rate spike/endpoint hammering/auth probing heuristics |
| `cost-tracking.ts` | `CostTracker`, `UNIT_COSTS` baseline, `CostDashboard` |

Plus: `apps/web/src/app/api/metrics/route.ts` (Prometheus scrape), `apps/web/src/app/api/health/sources/route.ts`, `infra/vector/vector.yaml`, `infra/grafana/dashboards/aegis-overview.json`.

TODO progress: 12/12 done.

---

### Agent 6 — Performance Optimization (16 tasks)
New directory: `apps/web/src/lib/optimization/` (16 modules + 2 SQL files + CI scripts):

**Frontend:** `code-splitting.ts`, `web-workers.ts` + `apps/web/src/workers/parse-geojson.worker.ts`, `webgl-clustering.ts` (3 presets + FPS model), `bundle-budget.ts` + `.github/scripts/check-bundle-budget.js`, `critical-css.ts`.

**Backend:** `postgis-indexes.ts` + `postgis-index-audit.sql` (10 indexes), `materialized-views.ts` + `materialized-views.sql` (4 views + pg_cron schedule), `tile-cache-policy.ts` (10 layer policies + Cloudflare purge), `redis-cache.ts` (6 HOT_QUERY_CACHE_CONFIGS, ioredis-compatible, fail-soft), `kafka-partitioning.ts` (djb2 partitioning for 6 topics).

**AI:** `batched-inference.ts` (`BatchProcessor<T,R>` with timer+size flush), `model-quantization.ts` (7 policies: YOLOv8/Whisper/CLIP/OCR), `model-tiers.ts` (haiku/sonnet/opus MODEL_TIER_CONFIG, 20-entry routing table).

**Cost:** `tiered-storage.ts` (7 data types), `autoscaling.ts` (Kubernetes HPA YAML generator, 6 services), `llm-cost-dashboard.ts` (90-day ring buffer, budget alerts).

TODO progress: 16/16 done.

---

### Agent 7 — Email Deliverability + Tech Server (20 tasks)
**Email Deliverability (11 tasks):** New `apps/web/src/lib/email/` directory:

`dns-records.ts` (SPF/DKIM/DMARC/BIMI records + validation), `bimi.ts` (BIMI config + readiness check), `subdomains.ts` (mail./news./alerts./no-reply. routing), `ip-pools.ts` (4 pools, pool isolation rationale), `warmup-plan.ts` (30-day ramp schedule), `suppression-list.ts` (hard bounce/complaint auto-suppress, provider webhook parsers), `engagement-throttle.ts` (4 tiers: high/medium/low/inactive), `postmaster-monitoring.ts` (thresholds + recommendations), `regional-deliverability.ts` (5 regions, ISP recommendations), `reputation-audit.ts` (20-item checklist + quarterly template), `unsubscribe.ts` (RFC 8058 tokens + headers) + `apps/web/src/app/api/email/unsubscribe/route.ts` (GET + POST).

**Tech Server (9 tasks):** tRPC v11 router + Next.js handler + React client (`apps/web/src/lib/trpc/`), Redpanda Docker Compose + `event-bus.ts` (InMemoryEventBus + KafkaEventBus), Temporal workflow stubs (`workflows/report-workflow.ts` + `ingest-workflow.ts`), `redis.ts` (NoOpRedisClient fallback), SSE realtime (`realtime/sse.ts` + `/api/stream/events` + `/api/stream/alerts`), v1 webhook routes, WorkOS/Clerk auth module (`auth/provider.ts` + `auth/session.ts`), `idempotency.ts`, Python FastAPI gateway (`services/python-gateway/main.py` + Dockerfile + requirements.txt).

TODO progress: email 11/11, server 12/22 (+9 this sprint; remaining 10 = service deployment tasks needing infra).

---

### Agent 8 — Tech Integrations (26 tasks)
**17 existing integrations backfilled** with citations to Sprints 2.57–2.60 (mapbox, sentinel-hub, nasa-firms, adsb, opensky, ais, telegram, twitter, reddit, youtube, llm-providers, stripe, slack, ova-telegram, plausible, nominatim + anthropic was already done).

**10 new integration packages:**
- `integrations/maptiler/` — MapTilerClient + OSM_FALLBACK_URL + COMPLIANCE.md
- `integrations/what3words/` — optional geocoder + 5 UA demo addresses
- `integrations/planet-labs/` — Phase-2-gated scene search + signed download URLs
- `integrations/blacksky-capella/` — Phase-3-gated high-res optical+SAR, commercial order flow
- `integrations/huggingface/` — `HuggingFaceClient.infer<T,R>()`, 6-model curated registry, self-hosted endpoint support
- `integrations/translation/` — DeepL + Lingvanex clients + `getTranslationProvider()` fallback chain
- `integrations/email-provider/` — Resend + Postmark + console mock, `getEmailProvider()` auto-select
- `integrations/posthog/` — batched events, EU region default, `trackPageView()` / `trackFeatureUsage()`
- `integrations/rss/` — zero-dep RSS/Atom parser + 21 curated feeds (Ukrinform, Kyiv Independent, RFE/RL, OSCE, UN, ICRC, Bellingcat, ACLED, etc.)
- `integrations/osint-feeds/` — 22-entry curated registry with trust tiers + `aggregateFeedUpdates()` (RU-side auto-flagged `requiresVerification: true`)

Plus `services/tracking/plausible.ts` — server-side page view + event tracking with Stats API.

TODO progress: 26/26 done.

---

## File count summary

| Category | New files |
|----------|-----------|
| TypeScript modules | ~95 |
| SQL scripts | 2 |
| Go files | 5 |
| Python files | 3 |
| YAML/JSON configs | 7 |
| Docs (Markdown) | 8 |
| GitHub Actions workflow | 2 |
| **Total** | **~133** |

## Honest caveats
- No local TypeScript toolchain — agents matched patterns by inspection. Recommend `pnpm typecheck` on CI before deploy.
- Mojibake scan: **0**. EN+UK throughout; Cyrillic preserved in all existing files that were read.
- In-memory stores throughout (ring buffers, maps) — production activation needs PostgreSQL/Redis swap-ins at the store interface boundary.
- Service deployment tasks in `TODO_server.md` (`ingest-svc`, `geo-svc`, `vision-svc`, etc.) left open — they require containerized microservice deployment decisions, not just code.
- Phase-gated integrations (Planet Labs, BlackSky/Capella) ship as typed codeable contracts — activation needs signed commercial agreements + env secrets.
- Redis/Kafka/Qdrant/Temporal items ship as typed interface modules; activation needs the corresponding infra services deployed.
- `services/python-gateway` requires Python 3.12 + FastAPI in production; the Dockerfile multi-stages for a lean image.
