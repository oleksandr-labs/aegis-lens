# TODO — Programmatic: Region Pages

## Goal
A high-quality hub page for every country and admin-1 region we cover. Aggregates events, sources, briefs, charts, related regions.

## Progress
- 14 / 22 done (Sprint 2.52 — top sources added)

## Tasks

### Template content
- [x] Hero: region name + description (localized) ✓ Sprint 0
- [x] Live event feed (last 10 in region) ✓ Sprint 1
- [x] KPI strip: event count, severity index, top class, country ✓ Sprint 1
- [ ] Mini-map embed of region (Sprint 1.1 — extract from AegisMap)
- [ ] Time-series chart (events/day past 90d)
- [x] Event-class breakdown ✓ Sprint 1
- [x] Top sources in this region (with reputation scores) ✓ Sprint 2.52 — `PUBLIC_SOURCES` filtered by `region.iso2`; top 6 by reliability score; rendered as 2-col list with kind badge, reliability %, link to /sources index
- [ ] Recent verified briefs / reports about region
- [x] Related regions cross-links ✓ Sprint 0
- [ ] Civilian safety summary (if applicable)
- [x] FAQ block (schema.org `FAQPage`) ✓ Sprint 2.48 — 4 dynamic FAQs per region (security situation, verification methodology, alert subscription, data licensing); rendered as `<details>` accordion; `FAQPage` JSON-LD added to `@graph`

### Schema
- [x] `Place` schema ✓ Sprint 0
- [x] `BreadcrumbList` schema ✓ Sprint 0
- [ ] `Dataset` schema on the events JSON endpoint
- [ ] `containedInPlace` hierarchy (needs admin-1 data)

### Quality bars
- [ ] Minimum 50 events in last 90d → indexable; else `noindex` — Sprint 1
- [ ] Auto-summarize via AI with strict citation

### URL design
- [x] `/regions/<country>` ✓ Sprint 0
- [x] `/regions/<country>/<region>` admin-1 (26 UA + 16 PL + 16 DE = 58) ✓ Sprint 1.5 / 1.6
- [x] `/regions/<country>/<region>/<city>` admin-2 (20 cities) ✓ Sprint 1.7
- [x] Locale-prefixed variants ✓ Sprint 0
- [x] `containedInPlace` hierarchy in schema.org `City` JSON-LD ✓ Sprint 1.7

## i18n
- Title, descriptions, summaries localized; region names use `name:<lc>`.

### Примітки
Region pages are the SEO foundation. Optimize ruthlessly.
