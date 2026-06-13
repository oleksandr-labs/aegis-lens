# TODO — Capacity Planning

## Tasks
- [x] Per-service traffic forecast (12 months rolling) — apps/web/src/lib/slo/capacity-planning.ts (SERVICE_CAPACITY_PLANS)
- [x] Per-service headroom (target 30%) — apps/web/src/lib/slo/capacity-planning.ts (SERVICE_CAPACITY_PLANS)
- [x] Per-service cost-per-1k-requests — apps/web/src/lib/slo/capacity-planning.ts (SERVICE_CAPACITY_PLANS)
- [x] Breaking-news spike scenario (10× baseline) — apps/web/src/lib/slo/capacity-planning.ts (BREAKING_NEWS_SPIKE_SCENARIO)
- [x] LLM token budget per service — apps/web/src/lib/slo/capacity-planning.ts (LLM_TOKEN_BUDGETS)
- [x] Per-AZ failure capacity (single-AZ down = still SLO-compliant) — apps/web/src/lib/slo/capacity-planning.ts (SERVICE_CAPACITY_PLANS)
- [x] Quarterly capacity review — apps/web/src/lib/slo/capacity-planning.ts (QUARTERLY_CAPACITY_REVIEW)
