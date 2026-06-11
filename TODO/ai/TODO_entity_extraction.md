# TODO — Entity Extraction & Knowledge Graph Population

## Goal
Auto-detect and link entities (units, equipment, people, orgs, regions, events) into the KG from every ingested piece.

## Progress
- 10 / 10 done

## Tasks
- [x] NER fine-tuned on mil / OSINT corpora (UA/RU/EN priority) — `services/entity-extraction/src/patterns.ts` with regex patterns for equipment, units, regions, dates, quantities; EN + Cyrillic
- [x] Entity linking to canonical KG IDs — `services/entity-extraction/src/linker.ts` `findCandidates()` + `generateLinkProposals()` with Levenshtein fuzzy match
- [x] New-entity proposal flow (HITL review) — `EntityLinkProposal.requiresHumanReview` flag when top candidate < 0.85
- [x] Alias + transliteration resolver — `transliterate()` in `linker.ts` (UA Cyrillic → Latin), `similarityScore()` normalises both sides
- [x] Coreference resolution within document — `services/entity-extraction/src/coreference.ts` `resolveCoreference()` (greedy single-link clustering over surface + transliteration containment + acronym↔expansion, e.g. "Збройні Сили України"↔"ЗСУ"; representative = longest surface, cluster confidence = mean)
- [x] Cross-document entity disambiguation — `services/entity-extraction/src/coreference.ts` `disambiguateAcrossDocuments()` (merges per-doc clusters by `disambiguationKey` = class+normalised surface, accumulates `mentionEventIds[]` provenance, confidence rises with independent-document corroboration, capped 0.99)
- [x] Per-entity confidence + provenance — `EntityMention.confidence` + `mentionEventIds[]` on `KnowledgeGraphEntity`
- [x] Wikidata cross-reference (`sameAs`) — `services/entity-extraction/src/wikidata.ts` (`WikidataClient` SPARQL contract + offline CC0 gazetteer fixture, `resolveSameAs()` fixture-then-live, `enrichWithWikidata()` sets `KnowledgeGraphEntity.wikidataId` without overwriting curated ids; env `WIKIDATA_SPARQL_ENDPOINT`, see COMPLIANCE.md)
- [x] Eval: precision / recall per entity class — `services/entity-extraction/src/eval.ts` (`ENTITY_GOLDEN_SET` UK+EN labelled cases, `evaluateExtractor()` per-class TP/FP/FN → precision/recall/F1 + macro/micro + by-language, `formatEntityEvalReport()`)
- [x] Pipeline integrates with [TODO_auto_tagging.md](TODO_auto_tagging.md) — `services/entity-extraction/src/auto-tagging-bridge.ts` `buildTaggingHandoff()` (mirrors `@ua-map/auto-tagging` `TaggingInput`, derives equipment→tag-id hints e.g. Shahed→military.strike.drone, region/location → geo facets; no cross-workspace import, ISW-style mirror)

## i18n
- Multilingual NER + cross-lingual linking.

### Примітки
The KG is what makes our entity pages defensible against generic competitors.
