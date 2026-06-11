# TODO — Service: Search

## Goal
Unified search facade: lexical (Elastic) + semantic (Qdrant) + geo (PostGIS), with locale-aware analyzers.

## Progress
- 11 / 11 done

## Tasks
- [x] Hybrid retrieval (BM25 + dense + geo) reranked — `services/search/src/hybrid.ts` (RRF + geo boost)
- [x] Per-locale analyzers (UK, RU, EN, more) — `services/search/src/analyzers.ts`
- [x] Synonym + transliteration dictionaries — `TRANSLITERATION_SYNONYMS` + `transliterate()` in analyzers.ts
- [x] Spelling correction — `services/search/src/spell-correction.ts`: domain dictionary (50+ entries), word-level fuzzy (Levenshtein), `correctQuery()` pipeline returning `CorrectionResult` with `suggestionShown`
- [x] Faceted aggregations for filter sidebar — `buildAggregations()` in elastic-client.ts
- [x] Saved-search persistence + execution — `services/search/src/saved-searches.ts`
- [x] Search analytics (zero-result, popular) — `services/search/src/analytics.ts`
- [x] Search SLO: p95 < 250ms for typical queries — `services/search/src/slo.ts` (SearchLatencySample type, ring buffer 500 samples, SloMonitor class, SEARCH_SLO_MS=250, getSloReport() with sloMet flag, searchSloMonitor singleton)
- [x] Per-tenant access control on all queries — orgId filter in `buildQuery()` (ES) and `buildFilter()` (Qdrant)
- [x] Pagination (cursor-based) — `nextCursor` in SearchResult, `search_after` in ES client
- [x] Highlighting + snippet generation — `buildHighlight()` in elastic-client.ts, `highlights` on SearchHit

## i18n
- Query in any supported language; transliteration tolerated.

### Примітки
Search quality compounds. Track relevance manually for top 100 queries weekly.
