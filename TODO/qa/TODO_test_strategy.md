# TODO — Test Strategy

## Goal
Confidence to ship daily. Tests at the right levels, fast feedback, low flake rate.

## Progress
- 16 / 16 done (Sprint 1 — Vitest scaffold + first 14 tests; Sprint 2 — test strategy config files)

## Tasks

### Levels
- [x] Unit (Vitest) — `@aegis/url-builder` 14 tests passing ✓ Sprint 1
- [x] Component (Vitest + Testing Library) — UI in isolation — `apps/web/src/lib/testing/test-strategy.ts`
- [x] Contract (Pact / OpenAPI schema diff) — API ↔ client — `apps/web/src/lib/testing/contract-testing.ts`
- [x] Integration (real DB + Kafka in compose) — services together — `apps/web/src/lib/testing/test-strategy.ts`
- [x] End-to-end (Playwright) — golden user journeys per persona — `apps/web/src/lib/testing/playwright-config.ts`
- [x] Visual regression (Chromatic / Playwright snapshots) — `apps/web/src/lib/testing/test-strategy.ts`
- [x] A11y (axe-core in unit + e2e) — `apps/web/src/lib/testing/test-strategy.ts`
- [x] Mutation (Stryker) on critical modules — `apps/web/src/lib/testing/test-strategy.ts`

### Coverage policy
- [x] No coverage % gate — focus on critical path coverage — `apps/web/src/lib/testing/test-strategy.ts`
- [x] Per-module owners with required tests — `apps/web/src/lib/testing/module-owners.ts`
- [x] Flake budget per suite (auto-quarantine over 2%) — `apps/web/src/lib/testing/test-strategy.ts`

### CI
- [x] Per-PR: lint + type + unit + component + minimal e2e (≤ 5 min) — `apps/web/src/lib/testing/test-strategy.ts`
- [x] Pre-merge: full e2e + visual regression — `apps/web/src/lib/testing/test-strategy.ts`
- [x] Nightly: integration + mutation + perf — `apps/web/src/lib/testing/test-strategy.ts`

### Data quality
- [x] Schema contract tests on every source — `apps/web/src/lib/testing/contract-testing.ts`
- [x] Golden-file tests for AI outputs (with allowed drift) — `apps/web/src/lib/testing/test-strategy.ts`

## i18n
- E2E run against each supported locale on a nightly cadence.

### Примітки
Flakes are technical debt. Quarantine fast, fix or delete within a week.
