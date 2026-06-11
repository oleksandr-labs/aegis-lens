# TODO — Release Process

## Goal
Predictable, low-drama releases. Multiple per day on FE; weekly on data; gated on safety areas.

## Progress
- 11 / 11 done ✅ COMPLETE (Sprint 2.56)

## Tasks
- [x] Release cadence per service area → [docs/release/release-management.md §1.1](../../docs/release/release-management.md)
- [x] Per-PR release notes (automated draft from PR description) → [docs/release/release-management.md §1.2](../../docs/release/release-management.md)
- [x] Weekly aggregate changelog publish → [docs/release/release-management.md §1.3](../../docs/release/release-management.md)
- [x] Per-release pre-flight (lint, test, security, schema-compat) → [docs/release/release-management.md §1.4](../../docs/release/release-management.md)
- [x] Per-release post-flight (smoke tests + on-call ack) → [docs/release/release-management.md §1.5](../../docs/release/release-management.md)
- [x] Canary deploy default for risk areas → [docs/release/release-management.md §1.6](../../docs/release/release-management.md)
- [x] Blue-green for risky migrations → [docs/release/release-management.md §1.7](../../docs/release/release-management.md)
- [x] Roll-forward preferred over roll-back (where safe) → [docs/release/release-management.md §1.8](../../docs/release/release-management.md)
- [x] Per-release feature-flag governance → [docs/release/release-management.md §1.9](../../docs/release/release-management.md)
- [x] Per-release internal comms (Slack #releases) → [docs/release/release-management.md §1.10](../../docs/release/release-management.md)
- [x] Per-release customer comms (where applicable) → [docs/release/release-management.md §1.11](../../docs/release/release-management.md)

### Done notes (2026-05-30)
Full release process in `docs/release/release-management.md §Part 1`. Service cadence table: frontend continuous / API gateway daily / NLP weekly / ingest daily / schema migrations gated / no deploys after 16:00 UTC Fridays or during major conflict events. Per-PR release notes: `## Release note` mandatory section in PR description; GitHub Actions automation; draft to Notion. Weekly Monday 09:00 UTC changelog publish (Added/Changed/Fixed/Security format). Pre-flight checklist: 10 items (automated: CI, TypeScript, ESLint, axe, Snyk; manual: schema DBA review, load test, feature flag, on-call ack). Post-flight: automated smoke tests < 2 min + 15-min on-call monitoring + 10× error-rate rollback trigger. Canary: 5% for 30 min → 50% → 100% for risk areas (auth, billing, pipeline, schema, > 500 LOC). Blue-green + dual-write for schema migrations (24h overlap before old schema dropped). Roll-forward policy: exceptions for data corruption + security + complete outage. Feature flag governance: LaunchDarkly, 10%→50%→100% rollout, flag retirement after 30 days at 100%, flag registry, 90-day auto-review. `#releases` Slack template. 4-tier customer comms threshold (Low: changelog / Medium: in-app + newsletter / High: 30–60d notice email / Critical: immediate).

## i18n
- Customer-facing notes localized for major releases.

### Примітки
Boring deploys = scaled team. Engineer toward boring.
