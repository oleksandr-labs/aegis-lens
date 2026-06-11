# Template — Event Detail (Sub-pages)

## URLs
- `/events/<id>` · `/events/<id>/timeline` · `/events/<id>/media` · `/events/<id>/sources` · `/events/<id>/related`

## Content
- [x] Main page: title, badges, MiniMap, sources, metadata ✓ Sprint 1.2
- [x] Schema.org `Event` + `BreadcrumbList` ✓ Sprint 1.2
- [x] `noindex` if retracted ✓ Sprint 1.2
- [x] hreflang across active locales ✓ Sprint 1.2
- [x] Sub-pages: timeline, media gallery, source provenance, related events ✓ Sprint 2.19 (`/events/<id>/timeline` · `/media` · `/sources` · `/related`; each emits per event × locale, Article + BreadcrumbList JSON-LD)
- [ ] Quality gate: verified status filtering for indexing — sub-pages currently inherit the parent's noindex policy on retraction; finer rules deferred

### Примітки
Sub-pages multiply SEO surface per major event.
