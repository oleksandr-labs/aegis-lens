# TODO — Abuse, Moderation, Misuse Prevention

## Goal
Prevent the platform from becoming a weapon: against private individuals, vulnerable populations, or for coordinated information operations.

## Progress
- 3 / 10 done

## Tasks
- [ ] Acceptable use policy (public)
- [ ] Use-case gating: tactical layers require enterprise contract + KYC
- [x] AI copilot guardrails (refuse: doxxing, targeting, PII enrichment, weapons construction) — `services/safety/src/guardrails.ts` evaluateGuardrails(); 7 categories with regex patterns; integrated into `POST /api/copilot` before LLM call
- [ ] User reporting tool (per event, per source, per AI output)
- [ ] Moderation queue for community / UGC features
- [x] Account abuse heuristics (scraping, rate-limit evasion, alt-account farms) — `services/safety/src/abuse-heuristics.ts` evaluateAbuse(); 7 AbuseSignal types; tier-based rate limits; block/throttle/warn/allow actions
- [x] Per-tenant audit logs (who viewed what) — `apps/web/src/lib/audit-log-store.ts`; 20 action types; `GET /api/settings/audit-log`; per-org filtering
- [ ] Watermark / fingerprint on exported reports (deter leaks)
- [ ] Killswitch on individual layers (disable site-wide in incidents)
- [ ] Quarterly misuse review

## i18n
- AUP + reporting tool fully localized.

### Примітки
"Public data" is not a free pass — aggregation can create new harm.
