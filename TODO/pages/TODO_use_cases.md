# TODO — Programmatic: Use-Case Pages

## Goal
Persona × task landing pages. Each is a conversion surface (with feature highlights + CTA) AND an SEO surface (long-tail keyword target).

## Progress
- 10 / 12 done

## Tasks

### Per-persona use-case sets
- [x] `/use-cases` index with 7 vertical cards ✓ Sprint 2.49 — `CollectionPage` JSON-LD + 7 vertical links; `VERTICAL_LABEL` + `VERTICAL_BLURB` from seed
- [x] Per-vertical index pages (journalists, analysts, humanitarian, etc.) ✓ Sprint 2.49 — 7 static vertical pages with task cards and Academy cross-links
- [x] `[vertical]/[task]` task detail pages ✓ Sprint 2.49 — `use-case-tasks.ts` seed with 21 tasks across 7 verticals; `generateStaticParams` covers all tasks × locales; problem framing, workflow steps, recommended tools, related threats, related guides
- [x] Academy cross-links on task detail pages ✓ Sprint 2.52 — `academyPathSlugs?: string[]` field on `UseCaseTask`; 4 tasks seeded with paths; "Academy learning paths" section rendered below guides on task page
- [ ] Screenshot / demo video per use case
- [ ] Persona testimonial (when available)
- [ ] `/use-cases/[vertical]/[task]/in/[country]` geo variant pages (route exists, seed not fully populated)

### Template
- [x] Headline targeting the task verbatim ✓ Sprint 2.49
- [x] Problem → solution → feature mapping ✓ Sprint 2.49 (problem + workflow steps)
- [ ] Screenshot / demo video
- [ ] Persona testimonial (when available)
- [x] Pricing recommendation block ✓ Sprint 2.49 (links to /pricing from vertical pages)
- [x] Related use cases (internal links) ✓ Sprint 2.49 ("Other {vertical} tasks" sibling list)

### Quality
- [x] No thin pages — each adds unique value ✓ Sprint 2.49 (workflow + tools + threats + guides per task)
- [x] Schema.org `Article` + `BreadcrumbList` ✓ Sprint 2.49
- [ ] Conversion event tracked per page

## i18n
- Persona-relevant locales per page (e.g. NGO use-cases require UK/PL/RO).

### Примітки
This is where audience-targeting and SEO meet. Build them with a content matrix, ship in batches.
