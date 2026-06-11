# Template — Entity (Knowledge Graph)

## URLs
- `/entities` index ✓ Sprint 2.11 (KG section + existing equipment/conflicts/glossary groups)
- `/entities/<slug>` ✓ Sprint 2.11 (10 seed entities across organization / military_unit / platform / place kinds)

## Progress
- 7 / 9 done

## Content
- [x] Entity name + type + aliases (with transliteration) ✓ Sprint 2.11 (`aliases[]` exposed in UI + `alternateName` in JSON-LD)
- [x] Description (sourced, fact-checked) ✓ Sprint 2.11 (factual paragraphs, neutrality-policy pointer in footer)
- [x] Related entities (graph traversal — links to neighbors) ✓ Sprint 2.11 (`relatedSlugs` → Related entities block)
- [x] Recent mentions (events / posts / reports linked) ✓ Sprint 2.11 (`relatedEventIds` resolved + investigations cross-link)
- [ ] Timeline of significant mentions — deferred until events surface a real timeline
- [x] Schema.org appropriate (`Organization` / `Person` / `Product` / `Place`) ✓ Sprint 2.11 (`entitySchemaType(kind)` maps kind → schema type; military_unit → Organization, platform → Product)
- [x] Wikidata cross-reference (`sameAs`) ✓ Sprint 2.11 (`wikidata` field → JSON-LD `sameAs` + visible link)
- [x] Privacy + neutrality policy ✓ Sprint 2.11 (footer pointer to /methodology + /trust/data-policy)
- [ ] Quality gate: minimum verified data + neutrality review — informal; no automated gate yet

## i18n
- Localized labels per language.

### Примітки
Entity pages are LLMO gold (citation-dense + factual). Build the KG seriously.
