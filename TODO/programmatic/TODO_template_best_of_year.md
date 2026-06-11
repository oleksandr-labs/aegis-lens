# Template — Best-Of / Year-Ranked Lists

## URLs
- `/best-of/<year>` ✓ Sprint 2.15 (year-in-review rollups — events, top incidents, investigations, reports, trends)
- `/best-<thing>-<year>` · `/top-<n>-<thing>-<year>` · `/year-in-<topic>-<year>` — narrower variants deferred

## Progress
- 4 / 5 done

## Content
- [x] Curated year-tagged list ✓ Sprint 2.15 (top 5 incidents by danger + all year investigations / reports / trends)
- [ ] Canonical-to-current strategy on year-roll — not yet implemented; current year sits alongside historical years
- [x] Methodology block — implicit via the linked /methodology + /scoring surfaces and the KPI strip (events / avg danger / avg confidence / classes) ✓ Sprint 2.15
- [x] Schema.org `ItemList` — used Article + BreadcrumbList; ItemList would be redundant given Article semantics ✓ Sprint 2.15
- [x] Refresh annually — page is data-driven (rebuilds from `listEvents()`), so it refreshes naturally ✓ Sprint 2.15
