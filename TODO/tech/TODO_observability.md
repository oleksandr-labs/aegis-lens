# TODO — Observability & Monitoring

## Goal
Know what's happening across ingest → AI → serve, in real time. Catch source breakage, model regressions, and abuse instantly.

## Progress
- 12 / 12 done

## Tasks
- [x] Centralized logging (Vector → Loki / OpenSearch) — `apps/web/src/lib/observability/logging.ts` + `infra/vector/vector.yaml` (StructuredLogger singleton, Vector HTTP source → Loki/OpenSearch sinks)
- [x] Tracing (OpenTelemetry → Tempo / Honeycomb) — `apps/web/src/lib/observability/tracing.ts` (re-exports telemetry.ts, TracingConfig, initTracing, createChildSpan, multi-backend exporter)
- [x] Metrics (Prometheus + Grafana) — `apps/web/src/lib/observability/metrics.ts` + `apps/web/src/app/api/metrics/route.ts` + `infra/grafana/dashboards/aegis-overview.json` (15 metrics, Prometheus text format, Bearer-protected scrape endpoint, 4-panel Grafana dashboard)
- [x] Synthetic checks for each external source — `apps/web/src/lib/observability/synthetic-checks.ts` (14 sources: isw/oryx/deepstatemap/alerts-in-ua/ukrenergo/acled/cert-ua/dsns/un-ocha + 5 more, runCheck/runAllChecks)
- [x] LLM call observability (Langfuse / Helicone) — `apps/web/src/lib/observability/llm-observability.ts` (LlmCallRecord, LlmObservability class, Langfuse + Helicone + console backends, session cost tracking)
- [x] Vector DB health metrics — `apps/web/src/lib/observability/vectordb-health.ts` (QdrantHealthStatus, checkQdrantHealth — probes /health + /collections, fail-soft error result)
- [x] Alerting: PagerDuty + Slack — `apps/web/src/lib/observability/alerting.ts` (OpsAlert, sendPagerDutyAlert/sendSlackOpsAlert, triggerAlert fan-out: critical → PD+Slack, others → Slack only)
- [x] SLOs per service (ingest freshness, map p95, AI latency) — `apps/web/src/lib/observability/slos.ts` (7 SLOs: ingest/tiles/search/ai-copilot/alerts/API availability/source health, computeSloStatus with burn rate)
- [x] Source-health dashboard (public-facing for trust) — `apps/web/src/lib/observability/source-health.ts` + `apps/web/src/app/api/health/sources/route.ts` (SourceHealthEntry, buildSourceHealthReport, getPublicSourceHealth, GET /api/health/sources)
- [x] Abuse / anomaly detection on API usage — `apps/web/src/lib/observability/api-abuse-detection.ts` (AbuseDetector singleton, rate_spike/endpoint_hammering/auth_probing heuristics, 1-min sliding window, dedup)
- [x] Cost-per-event dashboard — `apps/web/src/lib/observability/cost-tracking.ts` (CostTracker singleton, CostDashboard, UNIT_COSTS baseline table for Claude/GPT/Sentinel/Planet/Mapbox/storage/CDN)
- [x] Status page (statuspage.io / Instatus) ✓ Sprint 2.0 (/status — custom, 6 components, 99.94% uptime stub)

## i18n
- N/A.

### Примітки
Source-health dashboard is also a marketing asset — show what's monitored.
