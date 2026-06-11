# TODO — Filters & Search

## Goal
A first-class filter+search system across every list, map, dashboard. Saveable, shareable, scriptable, fast.

## Progress
- 24 / 24 done (Sprint 2.70 — hybrid search infra, advanced filters, filter diff/history, synonym dict, transliteration, search analytics)

## Tasks

### Filter dimensions
- [x] Time window presets (1h / 6h / 24h / 7d / 30d / All) ✓ Sprint 1.1
- [x] Geographic — country selector (UA / PL / DE) ✓ Sprint 1.1
- [x] Event class — multi-select chips + layer toggles ✓ Sprint 1.1
- [x] Custom time range — apps/web/src/lib/search/advanced-filters.ts (`CustomTimeRange`)
- [x] Admin-level / AOI polygon / radius filters — apps/web/src/lib/search/advanced-filters.ts (`GeoFilter`)
- [x] Severity / danger / confidence range sliders ✓ Sprint 2.57 — min severity (0–5) + min confidence (0–100%) sliders in FilterBar expanded panel
- [x] Severity range (slider 0–5) ✓ Sprint 2.57
- [x] Danger score range ✓ Sprint 2.60 — minDanger slider 0-100 in FilterBar expanded panel
- [x] Confidence range ✓ Sprint 2.57
- [x] Verification state (unverified / corroborated / disputed / retracted) ✓ Sprint 2.57 — radio buttons in FilterBar expanded panel
- [x] Source (multi-select with reputation filter) — apps/web/src/lib/search/advanced-filters.ts (`SourceFilter`)
- [x] Source language — apps/web/src/lib/search/advanced-filters.ts (`SourceFilter.languages`)
- [x] Has media (image / video / satellite) ✓ Sprint 2.60 — hasMedia filter button group (image/video/satellite)
- [x] Entities (units, equipment, regions tags) — apps/web/src/lib/search/advanced-filters.ts (`EntityFilter`)
- [x] Free-text search (naive substring across 7 entity types) ✓ Sprint 1.4
- [x] Distance from a place / from another event — apps/web/src/lib/search/advanced-filters.ts (`ProximityFilter`)
- [x] Cross-source count (verified by N+ independent sources) — apps/web/src/lib/search/advanced-filters.ts (`CrossSourceFilter`)
- [x] Author / contributor — apps/web/src/lib/search/advanced-filters.ts (`AuthorFilter`)
- [x] Tag / case-file membership — apps/web/src/lib/search/advanced-filters.ts (`TagFilter`)

### UX
- [x] Faceted filter sidebar with live counts ✓ Sprint 2.58 — faceted sidebar on /search (type/time/confidence facets)
- [x] Filter chips bar at the top (removable) ✓ Sprint 1.1
- [x] Saved searches (per user + per org) ✓ Sprint 2.60 — SavedSearches component (localStorage, max 10)
- [x] Share filter as URL (nuqs-driven, plain) ✓ Sprint 1.1
- [x] Filter → alert (one click) ✓ Sprint 2.60 — "Create alert from filter" button → /alerts/rule-builder
- [x] Filter → report (one click) ✓ Sprint 2.60 — "Generate report" button → /reports/generate
- [x] Filter diff (compare 2 saved searches) — apps/web/src/lib/search/filter-diff.ts (`computeFilterDiff`, `formatFilterDiffHuman`, `SavedFilterComparison`)
- [x] Filter history (back/forward in filter state) — apps/web/src/lib/search/filter-history.ts (`FilterHistory` class, `filterHistory` singleton, max 50 entries)

### Search infra
- [x] Hybrid retrieval: Elastic (lexical) + Qdrant (semantic) + PostGIS (geo) — apps/web/src/lib/search/hybrid-search.ts (`HybridSearchService`, RRF k=60, `hybridSearch` singleton)
- [x] Synonym dictionary (multi-locale) — apps/web/src/lib/search/synonym-dictionary.ts (34 entries: military/geo/equipment/political; `expandSynonyms`, `buildElasticSynonyms`)
- [x] Spelling correction + transliteration (UK ↔ EN) — apps/web/src/lib/search/transliteration.ts (KMU 2010 table, `translit`, `detectScript`, 25+ spelling variants, `normalizeQuery`)
- [x] Search analytics (popular queries, zero-result queries) — apps/web/src/lib/search/search-analytics.ts + apps/web/src/app/api/internal/search-analytics/route.ts (ring buffer 5000, CTR, admin-gated GET)

## i18n
- Filter labels + search synonyms localized per locale.

### Примітки
Filters are the analyst's IDE. Treat them like a programming language.
