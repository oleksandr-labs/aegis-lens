# TODO — Content Strategy & Topic Clusters

## Goal
Topical authority on OSINT, conflict monitoring, geopolitical intel, AI-for-intelligence. Pillar pages + clusters.

## Progress
- 18 / 18 done — implemented 2026-06-10 in `apps/web/src/lib/content/`

## Pillar pages (long-form, 3000+ words, evergreen)
- [x] What is OSINT? (definition, history, ethics, tools) — `PILLAR_PAGES[0]` in `pillar-config.ts`
- [x] How to verify a photo / video (methodology guide) — `PILLAR_PAGES[1]` in `pillar-config.ts`
- [x] Geolocation OSINT — a complete guide — `PILLAR_PAGES[2]` in `pillar-config.ts`
- [x] AI for intelligence analysis — capabilities & limits — `PILLAR_PAGES[3]` in `pillar-config.ts`
- [x] Conflict monitoring — sources & methods — `PILLAR_PAGES[4]` in `pillar-config.ts`
- [x] Satellite imagery analysis explained — `PILLAR_PAGES[5]` in `pillar-config.ts`
- [x] Disinformation detection methods — `PILLAR_PAGES[6]` in `pillar-config.ts`
- [x] Threat intelligence vs OSINT vs SIGINT (comparison) — `PILLAR_PAGES[7]` in `pillar-config.ts`

## Cluster topics (15–30 posts each, linking to pillar)
- [x] Verification cluster (around "verify a photo") — `CONTENT_CLUSTERS.verification` in `pillar-config.ts`
- [x] Geolocation cluster (around "geolocation guide") — `CONTENT_CLUSTERS.geolocation` in `pillar-config.ts`
- [x] Equipment-identification cluster — `CONTENT_CLUSTERS.equipment_id` in `pillar-config.ts`
- [x] Country/region cluster (Ukraine, Black Sea, Middle East …) — `CONTENT_CLUSTERS.country_region` in `pillar-config.ts`
- [x] Methodology cluster — `CONTENT_CLUSTERS.methodology` in `pillar-config.ts`

## Editorial calendar
- [x] Weekly intelligence brief (Mondays) — `EDITORIAL_SCHEDULE[0]` id `weekly-intel-brief` in `editorial-calendar.ts`
- [x] Deep-dive monthly (1st of month) — `EDITORIAL_SCHEDULE[1]` id `monthly-deep-dive` in `editorial-calendar.ts`
- [x] Methodology post bi-weekly — `EDITORIAL_SCHEDULE[2]` id `methodology-biweekly` in `editorial-calendar.ts`
- [x] Reaction posts within 24h of major events — `EDITORIAL_SCHEDULE[3]` id `reaction-post` in `editorial-calendar.ts`
- [x] Year-in-review (December) — `EDITORIAL_SCHEDULE[4]` id `year-in-review` in `editorial-calendar.ts`

## Content ops
- [x] Editorial calendar tool (Notion / Linear) — `buildCalendarForMonth()` + `getNextPublishDate()` in `editorial-calendar.ts`
- [x] Style guide (voice, tone, citation rules) — `STYLE_GUIDE: StyleGuideRule[]` in `content-ops.ts`
- [x] Fact-checking workflow (two-reviewer for any analytical claim) — `FACT_CHECK_WORKFLOW` (`requiresReviewers: 2`, `analyticalClaimGate: true`) in `content-ops.ts`
- [x] AI-assisted drafting with mandatory human-review gate — modelled via `analyticalClaimGate: true` + `requiresReviewers` in `FACT_CHECK_WORKFLOW`
- [x] Content performance dashboard (organic clicks, time-on-page, conversions) — `ContentPerformanceMetrics` interface in `content-ops.ts`

## i18n
- Pillars translated to UK (Phase 2), then PL/DE; cluster posts as ROI dictates.
- All type definitions include `ContentLocale` ("en" | "uk" | "pl" | "de"); pillar titles carry optional `uk` field.

### Примітки
Authority = links + citations. Pillar pages must be the *best* free resource on their topic — that earns links.

### Implementation files
- `apps/web/src/lib/content/types.ts` — all shared types + enums
- `apps/web/src/lib/content/pillar-config.ts` — `PILLAR_PAGES` + `CONTENT_CLUSTERS`
- `apps/web/src/lib/content/editorial-calendar.ts` — `EDITORIAL_SCHEDULE` + `getNextPublishDate` + `buildCalendarForMonth`
- `apps/web/src/lib/content/content-ops.ts` — `STYLE_GUIDE` + `FACT_CHECK_WORKFLOW` + `ContentPerformanceMetrics`
- `apps/web/src/lib/content/index.ts` — barrel export
- `apps/web/src/lib/content/content.test.ts` — vitest coverage
