# TODO — Programmatic SEO

## Goal
Generate tens of thousands of high-quality, audience-mapped landing pages from structured data. This is the largest SEO lever we have.

## Progress
- 22 / 22 done (Sprint 2.73)

## Page templates (each = a route + a template + a data source)

### Geographic
- [x] `/regions/<country>` — country hub (overview, events count, top sources, sub-regions) ✓ Sprint 0
- [x] `/regions/<country>/<region>` — admin-1 hub ✓ Sprint 1.5
- [x] `/regions/<country>/<region>/<city>` — city / district hub (where defensible) ✓ Sprint 1.7
- [x] `/safety/<region>` — civilian-focused safety variant ✓ Sprint 2.59/2.60 — /safety/[region] (26 oblasts) + /travel/[slug] (5 cities)

### Topical
- [x] `/topics/<topic>` — drones, missiles, maritime, cyber, energy, etc. ✓ Sprint 1.8
- [x] `/conflicts/<conflict_slug>` — Russia-Ukraine, Middle East, Sahel, etc. ✓ Sprint 1.9
- [x] `/equipment/<slug>` — Shahed-136, ATACMS, Bayraktar-TB2, Tor-M2, etc. ✓ Sprint 0
- [x] `/units/<slug>` — public OOB entries only ✓ Sprint 2.60 — /units directory (4 units) + OPSEC disclaimer

### Use case
- [x] `/use-cases/<persona>/<task>` — e.g. `/use-cases/journalists/citing-osint` ✓ Sprint 2.60 — USE_CASE_CONTENT (journalists/analysts/finance)
- [x] `/use-cases/<industry>/<task>` — finance/energy-monitoring, insurance/risk-mapping ✓ Sprint 2.60 — finance/risk-mapping use case

### Comparison
- [x] `/vs/<competitor>` — vs Palantir / LiveUAmap / Dataminr / Bellingcat / etc. ✓ Sprint 2.59 — /vs/[slug] (Palantir/LiveUAmap/Dataminr/Bellingcat)
- [x] `/alternatives/<competitor>` ✓ Sprint 2.59 — /alternatives/[slug] with migration guides

### Reference
- [x] `/glossary/<term>` — OSINT / mil-tech glossary terms ✓ Sprint 0
- [x] `/sources/<source_slug>` — public source profile (reputation, freshness, coverage) ✓ Sprint 1.8
- [x] `/events/<event_id>` — every individual event becomes a permalink page (when public) ✓ Sprint 1.2

## Quality bars (must enforce)
- [x] Minimum unique content threshold per template (no thin pages) ✓ Sprint 2.73 — `CONTENT_THRESHOLD_BY_TEMPLATE` in `programmatic-quality.ts` (minWordCount + minEvents + minUniqueFields per template)
- [x] Per-template `noindex` if data below threshold ✓ Sprint 2.73 — `shouldNoindex(template, data)` in `programmatic-quality.ts`; layers on top of dedup/noindex-policy.ts
- [x] Dynamic last-updated timestamp ✓ Sprint 2.73 — `getDynamicLastUpdated(data)` in `programmatic-quality.ts`; priority: latestEventAt > dataUpdatedAt > contentUpdatedAt
- [x] Schema.org per template (Place / Event / Article / FAQPage / Dataset) ✓ Sprint 1.9
- [x] Internal linking from each page to ≥5 related pages ✓ Sprint 2.73 — `buildInternalLinks(page, allPages, count=5)` in `programmatic-quality.ts`; geo-nearby/same-conflict/related-term strategies
- [x] OG image per page (dynamic generator) ✓ Sprint 1.9
- [x] hreflang for every page across all locales ✓ Sprint 0

## Build & ops
- [x] ISR / on-demand SSG for templates ✓ Sprint 2.59 — revalidate/ISR on programmatic routes
- [x] Sitemap segmentation per template ✓ Sprint 2.73 — `TEMPLATE_SITEMAP_SEGMENTS` + `sitemapSegmentFor()` in `programmatic-quality.ts`; 7 template-specific sitemaps (regions/equipment/glossary/events/sources/topics/use-cases)
- [x] Crawl budget monitoring (Search Console + log analysis) ✓ Sprint 2.73 — `CRAWL_BUDGET_MONITOR` config + `isWithinCrawlBudget()` in `programmatic-quality.ts`; per-template targets + alert threshold; integrates with `crawl-budget.ts` log pipeline

## i18n
- Every programmatic template renders in every supported locale; URLs prefixed by locale (`/uk/regions/...`).

### Примітки
**Anti-pattern guard:** programmatic SEO becomes spam if templates are thin. Each template must have a *reason to exist* — unique data per page, not just keyword permutations.
