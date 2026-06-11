# TODO — Integration: ISW (Institute for the Study of War)

## Goal
Daily situation assessments + control-of-terrain maps. The most-cited Western analytical source.

## Progress
- 10 / 10 done

## Tasks

### Source
- [x] ISW daily Russian Offensive Campaign Assessment (RSS / blog) — integrations/isw/src/client.ts (RSS parser + polite-cadence fetch + DEMO_ASSESSMENT fixture, fail-soft)
- [x] ISW interactive map (control-of-terrain layers) — integrations/isw/src/map-ingest.ts (typed ControlPolygon model, GeoJSON ingest, demoControlSnapshot)
- [x] License check — confirm fair-use boundaries for republication — integrations/isw/COMPLIANCE.md (© ISW; cite+snippet allowed, bulk republication gated; crawler discipline; i18n native-review debt)

### Pipeline
- [x] Daily ingest of assessment text — integrations/isw/src/daily-ingest.ts (IswDailyIngest: fetch → adapter → entity extraction, idempotent on assessmentId) + adapter.ts (→ canonical AegisEventV1 v1)
- [x] NLP entity-extraction → KG enrichment — integrations/isw/src/entity-extraction.ts (heuristic regex mirroring services/entity-extraction patterns → KgEntityRef; 7 entities extracted in smoke test)
- [x] Map updates ingested as differential polygons — integrations/isw/src/map-diff.ts (diffControlMaps: today vs yesterday → added/removed/state_changed + netRussianGainKm2)
- [x] Cross-reference with DeepStateMAP for divergence detection — integrations/isw/src/divergence.ts (compareControl: ISW vs DSM claims → DivergenceReport + agreementRatio)

### Use in product
- [x] "ISW today" widget per region — integrations/isw/src/widget.ts (buildRegionSummary → IswRegionSummary) + API route apps/web/src/app/api/integrations/isw/route.ts
- [x] Citation chain on related events — integrations/isw/src/citations.ts (buildCitationChain → SourceCitation + EventLink + EN/UK attribution + primary-source provenance)
- [x] Per-region recent ISW mentions — integrations/isw/src/mentions.ts (regionMentions: newest attributed snippets per oblast, fair-use length cap)

## i18n
- EN canonical; AI-translation to UK with native review for republished snippets.
- NATIVE-REVIEW DEBT: UK snippets are AI-translated (src/i18n.ts) and carry translationReview=true until reviewed by a native speaker (see COMPLIANCE.md §5).

### Примітки
ISW = credibility anchor for Western audience. Their methodology + ours = double trust signal.
