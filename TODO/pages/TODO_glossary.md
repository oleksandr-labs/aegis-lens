# TODO — Glossary (OSINT / Intel / Mil-tech)

## Goal
Definitive multilingual glossary. UX value (in-app term tooltips) AND SEO surface (each term = a page).

## Progress
- 6 / 10 done

## Tasks
- [x] `/glossary` index ✓ Sprint 0
- [x] `/glossary/<term>` per-term pages ✓ Sprint 0
- [x] Each term: definition, examples, related terms, see-also, sources cited ✓ Sprint 2.44 — `examples[]`, `relatedSlugs[]`, `sources[]` fields added to `GlossarySeed` type; 9 terms enriched; per-term page displays all three sections
- [ ] In-app term highlighting (hover → tooltip → link to glossary)
- [x] Schema.org `DefinedTerm` + `DefinedTermSet` ✓ Sprint 0; enhanced Sprint 2.44 — `@graph` with `BreadcrumbList` + `citation` array from `sources[]`
- [x] Bilingual term entries (EN ↔ UK first) ✓ Sprint 0
- [x] Transliteration field per term ✓ Sprint 2.49 — `transliteration?: string` added to `GlossarySeed` type; 30 terms enriched with Latin-script transliterations of Ukrainian terms; index shows transliteration inline for non-EN locales; detail page shows transliteration above definition
- [ ] AI-assisted seeding from authoritative sources (with citations)
- [ ] Public contribution + editorial moderation
- [ ] Citation rules per term (no Wikipedia copy-paste)

## i18n
- This is one of the most important localized surfaces — accurate terminology is the analyst's vocabulary.

### Примітки
Glossary feeds back into NER and translation pipelines — keep machine-readable.
