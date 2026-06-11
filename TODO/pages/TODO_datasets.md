# TODO — Public Datasets Index

## Goal
Discoverable index of public datasets we release. Pairs with [../seo/TODO_open_data_seo.md](../seo/TODO_open_data_seo.md).

## Progress
- 7 / 8 done

## Tasks
- [x] `/datasets` listing page ✓ Sprint 1.9
- [x] Filter by region, conflict, time range, license ✓ Sprint 2.42 — format + license filter chips (URL-driven searchParams)
- [x] Featured datasets ✓ Sprint 2.50 — `featured?: boolean` field on `Dataset` type; events, sources, geography marked featured; accent-bordered 3-col card strip above filter chips with link to per-dataset detail page
- [x] Per-dataset page (description, schema, sample, download formats, DOI, license, version history) ✓ Sprint 2.51 — `/datasets/[slug]/page.tsx` with meta strip (format/size/updated/license), download button, long-description paragraphs, field reference table, example record `<pre>`, citation block (APA/BibTeX/RIS as collapsible `<details>`), related datasets grid, `@graph` Dataset + BreadcrumbList JSON-LD
- [x] Citation snippet per dataset ✓ Sprint 2.40 — collapsible `<details>` with APA-style citation per card
- [x] Submit-to-registry helper ✓ Sprint 2.58 — "Request a dataset" CTA
- [x] Notify-on-update RSS / email ✓ Sprint 2.52 — `/datasets/feed.xml` route (force-static); RSS 2.0 with all datasets sorted by `updated` date; `Cache-Control: public, max-age=86400`; `atom:link` self-ref; RSS badge on datasets index page; `feeds` link in `generateMetadata`; sitemap entry at 0.4
- [ ] Programmatic dataset API (for academic clients)

## i18n
- Metadata + docs in EN + UK.

### Примітки
Dataset releases are press-worthy. Time them with quarterly press cycle.
