# TODO — Entities (Knowledge Graph) Index

## Goal
`/entities` browseable KG index. The "directory of *everything we know*".

## Progress
- 9 / 10 done

## Tasks
- [x] `/entities` index live (equipment + conflicts + glossary grouped) ✓ Sprint 1.3
- [x] Search within entities index ✓ Sprint 2.58 — EntityRegistryClient (live search + type filter)
- [x] Filter by type, region, era ✓ Sprint 2.52 — `?type=` and `?region=` URL-driven filters; uniqueKinds and uniqueRegions extracted from seed; `buildHref()` preserves both filter states; empty-state paragraph when no matches
- [x] Featured / trending entities ✓ Sprint 2.52 — `featured?: boolean` field added to `EntitySeed`; `listFeaturedEntities()` helper; 4 entities marked featured (general-staff-ukraine, wagner-group, shahed-136, zaporizhzhia-npp); 4-col accent accent strip shown when no filters active
- [x] Per-entity links to detail pages ✓ Sprint 1.3
- [ ] Cross-links from events to entity pages (Sprint 2)
- [x] hreflang per locale ✓ Sprint 1.3
- [x] Indexed in sitemap ✓ Sprint 1.3
- [x] Schema.org `CollectionPage` explicit JSON-LD ✓ Sprint 2.51 — already present in entities page: `CollectionPage` + `ItemList` with `numberOfItems` and item entries for entities, equipment, conflicts, glossary terms
- [x] Public KG export (CC-BY) — see [../data/TODO_knowledge_graph.md](../data/TODO_knowledge_graph.md) ✓ Sprint 2.58 — entity-knowledge-graph dataset (CC-BY-NC) in /datasets

## i18n
- Entity labels per locale; canonical IDs language-agnostic.

### Примітки
Entity pages are LLMO gold. They get cited because they're factual + structured.
