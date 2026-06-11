# TODO — Managed AOI / Concierge Service

## Goal
Productized "we run the AOI monitoring + deliver the brief" service. Customer doesn't have to build dashboards / write rules / triage alerts. High-margin recurring, especially for execs / NGOs / corporate security who lack OSINT capacity.

## Progress
- 9 / 9 done

## Service tiers
- [x] **Managed AOI Light** ($499 / AOI / mo) — analyst-curated weekly brief — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_TIERS['light'])
- [x] **Managed AOI Standard** ($1.5k / AOI / mo) — analyst-curated daily brief, real-time critical-only alerts — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_TIERS['standard'])
- [x] **Managed AOI 24/7** ($5k / AOI / mo) — round-the-clock human coverage, immediate escalation — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_TIERS['247'])
- [x] **Multi-AOI portfolio** — bundle discount for ≥3 AOIs — apps/web/src/lib/concierge/service-tiers.ts (MULTI_AOI_BUNDLE_DISCOUNT_PCT)
- [x] **Crisis surge** — temporary upgrade during declared events — apps/web/src/lib/concierge/service-tiers.ts (CRISIS_SURGE)

## Inclusions
- [x] Customer onboarding workshop (define triggers, escalation contacts, brand-of-brief) — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_INCLUSIONS_STANDARD.onboardingWorkshop)
- [x] Custom dashboard built and maintained — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_INCLUSIONS_STANDARD.customDashboard)
- [x] Custom alert rules in [../features/TODO_ai_rule_builder.md](../features/TODO_ai_rule_builder.md) — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_INCLUSIONS_STANDARD.customAlertRules)
- [x] Verification queue priority for AOI events — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_INCLUSIONS_STANDARD.verificationQueuePriority)
- [x] Monthly executive summary — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_INCLUSIONS_STANDARD.monthlyExecutiveSummary)
- [x] Quarterly review call — apps/web/src/lib/concierge/service-tiers.ts (CONCIERGE_INCLUSIONS_STANDARD.quarterlyReviewCall)

## Mechanics
- [x] Analyst hours tracked (cost ceiling) — apps/web/src/lib/concierge/sla.ts (ANALYST_HOUR_TRACKING)
- [x] SLA: response time per tier — apps/web/src/lib/concierge/sla.ts (CONCIERGE_SLA_CONFIGS)
- [x] Escalation matrix per customer — apps/web/src/lib/concierge/sla.ts (ESCALATION_MATRIX_FIELDS)
- [x] Pause / resume without losing config — apps/web/src/lib/concierge/sla.ts (PAUSE_RESUME_POLICY_EN/UK)
- [x] Add-on to any base subscription (Team+ minimum) — apps/web/src/lib/concierge/types.ts (ConciergeContract.minBaseTier)

## Linked files
- [../features/TODO_aoi_monitoring.md](../features/TODO_aoi_monitoring.md)
- [TODO_professional_services.md](TODO_professional_services.md)
- [TODO_vertical_packages.md](TODO_vertical_packages.md)

### Примітки
Concierge — найкращий міст з SaaS-у в Enterprise. Високі ACV, велика залежність від analyst-pool capacity.
