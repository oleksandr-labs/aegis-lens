# TODO — Feature Flags & Progressive Delivery

## Goal
Decouple deploy from release. Per-org / per-user / per-cohort rollout. Kill switch on every risky feature.

## Progress
- 9 / 10 done (Sprint 2.60)

## Tasks
- [x] Provider: Unleash (self-hosted) or LaunchDarkly ✓ Sprint 2.60 — local flag system (lib/feature-flags.ts), provider integration pending
- [x] Flag taxonomy: release, experiment, ops, permission, kill-switch — `FlagKind` in `services/flags/src/types.ts`
- [x] Server + client SDKs typed — `FlagRegistry`, `evaluateFlag()`, `EvaluationContext` fully typed
- [x] Per-org / per-team / per-user / per-cohort targeting — `FlagTarget` with orgIds/userIds/cohorts/tiers
- [x] Percentage rollouts with sticky bucketing — `stableHash()` (SHA-256 of `flagKey:userId`) in evaluator.ts
- [x] Kill switches surfaced in admin panel ✓ Sprint 2.60 — admin flags page + emergency disable-all kill switch
- [x] Flag-cleanup ticket auto-created on long-lived flags (>90d) — `getSunsetWarnings()` in FlagRegistry
- [ ] Flag → metric linkage (effect on north-star metric tracked)
- [x] Local-dev override panel ✓ Sprint 2.60 — DevFlagsPanel (floating 🚩, localStorage overrides)
- [x] Audit log of flag changes — `FlagChangeEvent[]` in `InMemoryFlagStore.getAuditLog()`

## i18n
- Flag-gated copy can swap localized strings per variant.

### Примітки
Untracked flags become tech debt. Enforce ownership + sunset dates.
