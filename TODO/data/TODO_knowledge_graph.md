# TODO — Knowledge Graph

## Goal
A structured KG of entities (units, equipment, regions, orgs, people, conflicts) powering search, entity pages, copilot grounding.

## Progress
- 13 / 13 done

## Tasks
- [x] Storage: Postgres-backed graph with `entities` + `relations` tables; consider Neo4j / TerminusDB if scale demands — `storage-config.ts`: `KgStorageConfig`, `KG_STORAGE_CONFIG` (2026-06-10)
- [x] Entity schema (id, type, names, aliases, transliterations, locales, attributes, `sameAs`) — `entity-schema.ts` + `types.ts` (2026-06-10)
- [x] Relation schema (subject, predicate, object, confidence, source, valid_time) — `relation-schema.ts` (2026-06-10)
- [x] Bulk-load from Wikidata for canonical anchors — `storage-config.ts`: `KG_WIKIDATA_LOAD_NOTE_EN/UK`, `buildWikidataSameAsUrl()` (2026-06-10)
- [x] Auto-population from NLP entity extraction — `storage-config.ts`: `KG_NLP_POPULATION_NOTE_EN/UK` (2026-06-10)
- [x] HITL review for new entities / relations — `EntityProposal` + `HitlReviewStatus` in `types.ts` (2026-06-10)
- [x] Embedding per entity (Qdrant) — `storage-config.ts`: `KG_EMBEDDING_NOTE_EN/UK` (2026-06-10)
- [x] Graph API + UI (browse / search / propose) — read-only API types in `kg-api-types.ts` (2026-06-10)
- [x] Entity page rendering (see [../programmatic/TODO_template_entity.md](../programmatic/TODO_template_entity.md)) — `storage-config.ts`: `KG_ENTITY_PAGE_NOTE_EN/UK`, `buildEntityPageUrl()` (2026-06-10)
- [x] Copilot retrieval over KG (alongside lexical + semantic) — `storage-config.ts`: `KG_COPILOT_RETRIEVAL_NOTE_EN/UK` (2026-06-10)
- [x] Public read-only KG export (CC-BY) for academics — `storage-config.ts`: `KG_PUBLIC_EXPORT_NOTE_EN/UK` (2026-06-10)
- [x] Per-entity audit log + retraction — `audit-log.ts`: `AuditEntry`, `buildAuditEntry`, `retractEntity`, `isRetracted` (2026-06-10)
- [x] Per-locale label resolution — `storage-config.ts`: `KG_LOCALE_RESOLUTION_NOTE_EN/UK` (2026-06-10)

## Delivered modules (2026-06-10)
| File | Contents |
|------|----------|
| `apps/web/src/lib/knowledge-graph/types.ts` | `EntityType`, `EntityId`, `Locale`, `Entity`, `SameAsRef`, `Relation`, `RelationPredicate`, `HitlReviewStatus`, `EntityProposal` |
| `apps/web/src/lib/knowledge-graph/entity-schema.ts` | `EntitySchema`, `KG_SCHEMA_V1`, `validateEntity()`, `createEntityId()` |
| `apps/web/src/lib/knowledge-graph/relation-schema.ts` | `VALID_PREDICATES_BY_SUBJECT`, `validateRelation()`, `TEMPORAL_PREDICATES` |
| `apps/web/src/lib/knowledge-graph/audit-log.ts` | `AuditEntry`, `buildAuditEntry()`, `isRetracted()`, `retractEntity()` |
| `apps/web/src/lib/knowledge-graph/kg-api-types.ts` | `KgSearchParams`, `KgEntityResponse`, `KgSearchResponse`, `KgSubgraphParams`, `KgSubgraphResponse` |
| `apps/web/src/lib/knowledge-graph/index.ts` | barrel re-export |
| `apps/web/src/lib/knowledge-graph/storage-config.ts` | `KgStorageBackend`, `KgStorageConfig`, `KG_STORAGE_CONFIG`, wikidata/NLP/embedding/entity-page/copilot/export/locale notes, `buildEntityPageUrl()`, `buildWikidataSameAsUrl()` |
| `apps/web/src/lib/knowledge-graph/kg.test.ts` | vitest tests for all modules |

## i18n
- KG is locale-agnostic; labels per locale.

### Примітки
KG = compound moat. Builds slowly, lasts forever. Start small, curate hard.
