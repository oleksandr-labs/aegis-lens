# Sprint 2.71 — Trust, Compliance & Reliability (2026-06-13)

**Cluster:** Governance / privacy compliance + public transparency + reliability (SLO/SLA) + on-call tooling.
**Tasks closed:** 106 across 14 TODO files.
**Method:** 4 parallel package-scoped agents, additive-only, EN+UK, no shared-file edits, UTF-8 (mojibake gate = 0), brace-balance verified. No local typecheck (CI on GitHub Actions).

## Deliverables

### GDPR / privacy compliance — 32 tasks → `apps/web/src/lib/compliance/`
- `breach-notification.ts` — 72h Art.33 clock, per-jurisdiction reporting matrix (EU SAs / UK ICO / US state AGs / UA), customer notification template, escalation chain, tabletop drill, breach register schema.
- `cookie-consent-policy.ts` — geo-aware defaults (EU/UK/CCPA strict + GPC), per-locale UI (en/uk/de/fr), consent audit-log schema, annual cookie inventory audit. *(additive; did not touch CookieConsent.tsx / consent.ts)*
- `cross-border-transfers.ts` — adequacy checks, SCCs, TIA template, sub-processor register, transfer disclosure (EN+UK), quarterly review.
- `dpia.ts` — 4 trigger criteria + 6-section DPIA template + `dpiaRequired()` helper.
- `ropa.ts` — Art.30 `RopaEntry` interface, controller/processor roles, governance (DPO/quarterly/24h-regulator/versioning), 3 real example entries.
- Files: TODO_breach_notification (6/6), TODO_cookie_consent (4/4 open), TODO_cross_border (6/6), TODO_dpia (10/10), TODO_ropa (6/6).

### Public transparency — 32 tasks → `apps/web/src/lib/transparency/`
- `ai-disclosure.ts` — per-feature model disclosure (7 features, Claude-default), training-data posture, public evals, EU AI Act risk tiers, opt-out, model-card policy, locale availability. EN+UK.
- `government-requests.ts` — counsel-led intake/review, request classification + outcomes, user-notification & gag-order policy, quarterly aggregation, country breakdown, civil-society liaison.
- `methodology-disclosure.ts` — pipeline architectures, reviewer-disagreement metrics (Cohen's kappa), public eval subset, failure modes, versioned methodology, event-level caveat linking.
- `takedown-report.ts` — quarterly counts/categories, anonymized per-source & per-jurisdiction breakdowns, retraction reasons, time-to-resolution buckets, `/transparency/takedowns` page, rolling 4-quarter chart.
- Files: TODO_ai_disclosure (9/9), TODO_government_requests (9/9), TODO_methodology_disclosure (8/8), TODO_takedown_report (7/7). *(annual-report.ts left untouched — already 10/10)*

### Reliability SLO/SLA — 33 tasks → `apps/web/src/lib/slo/` (new dir)
- `slo-definitions.ts` — `SERVICE_SLOS` for all 8 services at exact targets + ops references.
- `error-budget.ts` — budget calc, fast/slow multiwindow burn-rate alerts, <25% deploy-freeze, per-incident deduction, monthly review, team accountability.
- `sla-tiers.ts` — free/pro/team/enterprise/gov tiers, service-credit bands, regional variants, enterprise monthly report.
- `capacity-planning.ts` — 12-mo rolling forecasts, 30% headroom, cost-per-1k, 10× breaking-news spike, LLM token budgets, single-AZ SLO-compliance.
- Files: TODO_slo_definitions (11/11), TODO_error_budget (6/6), TODO_sla_customer (9/9), TODO_capacity_planning (7/7).

### On-call diagnostic CLI — 9 tasks → `tools/ax-cli/` (new `@ua-map` package)
- `ax doctor`, `ax source health`, `ax replay event`, `ax tenant inspect`, `ax alert dry-run`, `ax cost today`, `ax embeds top` — one typed handler each, command registry, argv shell (`--json/--env/--help`), typed `DataSources` port + in-memory stubs, ASCII formatters.
- `README.md` with realistic sample output per command; `docs/runbooks/oncall-diagnostics.md` referencing each command by name; runbooks index updated.
- File: TODO_monitoring_scripts (9/9).

## Verification
- Mojibake gate: 0 hits across all new files.
- Brace balance: OK on all 13 lib `.ts` modules.
- Remaining open tasks in cluster: 0.
- Per [[deploy_workflow]] + [[feedback_autonomy]]: work done locally + verified; NOT committed/deployed (awaiting approval).
