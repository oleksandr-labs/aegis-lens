# TODO — Auto-Tagging & Categorization

## Goal
Every event / post / report / listing auto-tagged with topics, classes, regions, industries.

## Progress
- 9 / 9 done

## Tasks
- [x] Hierarchical taxonomy (top-level → sub → micro) — `services/auto-tagging/src/taxonomy.ts` (4 top-level categories, 3 levels, 35+ nodes)
- [x] Multi-label classifier per level — `tagText()` in `tagger.ts` with keyword rules per tag + eventClass seed
- [x] Embedding-based zero-shot fallback — `services/auto-tagging/src/zero-shot.ts` (`Embedder` seam + dependency-free `hashingEmbedder` cosine baseline over taxonomy label corpus; `tagZeroShot()`/`withZeroShotFallback()`; capped `source:"zero_shot"` confidence)
- [x] Per-tag confidence — `TagPrediction.confidence` 0–1 per prediction
- [x] HITL correction loop → retraining — `services/auto-tagging/src/hitl.ts` (`recordCorrection()` accept/reject/add/remove; `tagQuality()` precision/recall; `exportTrainingSet()` + `proposeKeywordRules()`/`proposeSynonymsFromCorrections()`; `buildRetrainingBundle()`)
- [x] Tag coverage analytics (which tags are under-applied?) — `coverageGaps()` + `getTagCoverage()` stub in `governance.ts`
- [x] Tag governance (rename, merge, deprecate) — `proposeOp()` with `TagRenameOp/MergeOp/DeprecateOp` + `validateTagId()`
- [x] Per-locale tag dictionaries — `displayName: { en, uk }` on every `TaxonomyNode`; `getTagDisplayName(id, locale)`
- [x] Filter integration (tag = filter facet) — `services/auto-tagging/src/facets.ts` (`buildFacetTree()`/`facetCounts()` roll-up; `tagsToFilterParams()`/`parseFilterParams()` URL state; `eventMatchesFacets()`/`filterByFacets()` OR-within / AND-across-group predicate; localised `facetLabel`/`facetOptions`)

## i18n
- Tag display names + descriptions per locale; taxonomy IDs language-agnostic.

### Примітки
Taxonomy is product. Treat changes as schema changes.
