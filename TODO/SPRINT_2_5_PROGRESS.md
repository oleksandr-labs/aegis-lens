# Sprint 2.5 — Progress

**Theme:** Investigation detail pages — programmatic per-investigation surface with full body, sources, breadcrumbs, and related cross-links.

**Date:** 2026-05-24

**Method:** Solo (no parallel agents — user request).

---

## Delivered

### Data
- [x] `lib/investigations-seed.ts` — extracted 6 investigations from inline page constant into a shared seed module. Each entry now carries:
  - `findings: string[]` (numbered key findings)
  - `sources: { label, url }[]` (cited reading)
  - `sections: { heading, body }[]` (long-form body)
  - `citedEventIds?` and `citedOblastSlugs?` for cross-linking into events/regions
- [x] `listInvestigations()` (sorted desc by date) and `getInvestigation(slug)` helpers exported.

### Routes
- [x] `/investigations/[slug]` — full detail page. Breadcrumb nav, hero, key-findings numbered list, body sections, sources list (rel="nofollow noopener"), related-regions chips linking into `/regions/ua/<oblast>`, related-investigations footer (tag overlap, max 3). schema.org `Article` + `BreadcrumbList`, `citation[]` derived from sources.
- [x] `/investigations` index refactored to consume the shared seed; cards now wrap in `<Link href={urls.investigation(...)}>` and surface "read full investigation →".

### Plumbing
- [x] `urls.investigation(locale, slug)` added to `@aegis/url-builder`.
- [x] `sitemap.ts` imports `INVESTIGATIONS` statically and emits 6 hreflang sets at priority 0.6.

### Files touched
- `apps/web/src/lib/investigations-seed.ts` (new)
- `apps/web/src/app/[locale]/investigations/[slug]/page.tsx` (new)
- `apps/web/src/app/[locale]/investigations/page.tsx` (refactored to consume seed)
- `packages/url-builder/src/index.ts` (+1 helper)
- `apps/web/src/app/sitemap.ts` (+import +loop)

---

## TODO bookkeeping
- `TODO/SPRINT_2_4_PROGRESS.md` — "`/investigations/<slug>` detail pages" follow-up checked off `✓ Sprint 2.5`.

## Open follow-ups
- [ ] Localize investigation bodies (currently EN content rendered for all locales)
- [x] Wire `citedEventIds` into the detail page once concrete event IDs are chosen per investigation ✓ Sprint 2.7 (citedEvents block + `citation[]` enrichment; demo IDs wired for Iran-Russia and Mariupol investigations)
- [x] Add an analyst avatar / `Person` JSON-LD with `sameAs` ✓ Sprint 2.7 (Person node with `@id`, `worksFor`, referenced by Article `author`)
- [x] OG image route at `/investigations/<slug>/opengraph-image` ✓ Sprint 2.6
