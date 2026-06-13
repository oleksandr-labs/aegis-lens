# TODO — SLO Definitions

## Per-service targets
- [x] API gateway: 99.95% availability, p95 < 200ms — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS["api-gateway"])
- [x] Map workspace: 99.9% availability, p95 < 1s for typical — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS["map-workspace"])
- [x] Ingest: < 60s lag from source to `events.normalized` — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS.ingest)
- [x] Verify: < 5min P95 from normalized → verified — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS.verify)
- [x] Alert: < 5s P95 from match → in-app notification — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS.alert)
- [x] AI copilot: TTFT < 1s, full response < 8s — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS["ai-copilot"])
- [x] Tile serving: 99.95% availability, p95 < 100ms — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS["tile-serving"])
- [x] Search: p95 < 250ms — apps/web/src/lib/slo/slo-definitions.ts (SERVICE_SLOS.search)

## Ops
- [x] Error budgets per service — apps/web/src/lib/slo/slo-definitions.ts (SLO_OPS_REFERENCES) + apps/web/src/lib/slo/error-budget.ts (SERVICE_ERROR_BUDGETS)
- [x] Burn-rate alerts — apps/web/src/lib/slo/slo-definitions.ts (SLO_OPS_REFERENCES) + apps/web/src/lib/slo/error-budget.ts (BURN_RATE_ALERTS)
- [x] Quarterly SLO review — apps/web/src/lib/slo/slo-definitions.ts (SLO_OPS_REFERENCES)
