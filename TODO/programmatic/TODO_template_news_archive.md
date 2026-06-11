# Template — News Archive

## URLs
- `/news` (live, paginated `?page=N`) ✓ Sprint 1.3
- `/news/archive` ✓ Sprint 2.15 (years index)
- `/news/archive/<year>` ✓ Sprint 2.15 (per-year, grouped by month, top-classes summary)
- `/news/archive/<year>/<month>` ✓ Sprint 2.15 (per-month, all events, class breakdown, sibling months)
- `/news/archive/<year>/<month>/<day>` ✓ Sprint 2.22 (per-day rollup — only emits for days with ≥1 event)

## Content
- [x] Paginated archive (12 per page) ✓ Sprint 1.3
- [x] Schema.org `CollectionPage` + `NewsArticle` parts ✓ Sprint 1.3
- [x] rel=prev/next pagination ✓ Sprint 1.3
- [x] Per-category sub-archive — covered by `/topics/<class>` ✓ Sprint 1 + per-month-class breakdown rendered on year/month pages ✓ Sprint 2.15
- [x] Per-day rollups ✓ Sprint 2.22 (full per-(year, month, day) rollup pages)
- [ ] Quality gate: ≥ 20 articles — not enforced; pages emit only when ≥1 event qualifies
