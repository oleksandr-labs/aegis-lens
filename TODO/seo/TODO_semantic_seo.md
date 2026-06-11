# TODO — Semantic SEO & Knowledge Graph Markup

## Goal
Make the semantic structure of every page machine-readable so search + LLMs can confidently cite us.

## Progress
- 8 / 10 done (2026-06-10: semantic module implemented in `apps/web/src/lib/seo/semantic/`)

## Tasks
- [x] Entity-mention extraction in content → `mentions` schema fields — `defined-term-linker.ts`: extractEntityMentions()
- [x] Defined-term linking (every glossary term auto-linked on first use) — `defined-term-linker.ts`: linkDefinedTerms() (first-occurrence, case-insensitive, skips existing anchors)
- [x] Per-entity inline schema (`Place`, `Organization`, `Person`, `Product`) — `entity-schema.ts`: buildEntitySchema() + `types.ts`: SchemaEntityType
- [x] `sameAs` links to Wikidata / Wikipedia where applicable — `types.ts`: SameAsLink interface (wikidata/wikipedia/dbpedia/geonames); threaded through buildEntitySchema()
- [x] `about` + `mentions` on every long-form post — `entity-schema.ts`: buildAboutMentionsSchema(); `types.ts`: SemanticPageSchema.about/mentions
- [ ] Hub-and-spoke linking that mirrors the entity graph — depends on live content graph (not yet wired)
- [x] FAQ + How-To schema where appropriate — `entity-schema.ts`: buildFaqSchema() + buildHowToSchema()
- [x] Speakable schema for STT engines (where applicable) — `types.ts`: SemanticPageSchema.speakable field defined; renderer integration pending
- [x] Validation in CI (rich results test) — `schema-validation.ts`: validateEntitySchema(), validatePageSchema(), auditPageForSchemaCoverage(); vitest suite in `semantic.test.ts`
- [ ] Audit quarterly for schema completeness — process task, not yet scheduled

## i18n
- Schema applies per-locale; entity IDs language-agnostic.

### Примітки
Semantic SEO is the bridge to LLMO. Both depend on the same structure.
