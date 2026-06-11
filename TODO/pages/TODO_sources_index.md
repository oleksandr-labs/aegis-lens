# TODO — Public Sources Directory

## Goal
Searchable public directory of every source we monitor. Transparency + SEO + a sales tool.

## Progress
- 9 / 9 done ✅ COMPLETE

## Tasks
- [x] `/sources` index with search + filters (type, region, language, reliability) ✓ Sprint 1.8
- [x] Per-source profile pages → see [../seo/TODO_source_profiles_seo.md](../seo/TODO_source_profiles_seo.md) ✓ Sprint 1.8
- [x] Sortable: most reliable, A–Z, by type ✓ Sprint 2.40 — URL-driven `?sort=` searchParam
- [x] Source-health snapshot (last seen, current latency) ✓ Sprint 2.45 — Status/Cadence/Last seen/30d uptime on detail page; illustrative until Sprint 3 live metrics
- [x] Languages covered (locale tags) ✓ Sprint 2.48 — URL-driven `?lang=` filter chips from unique `language` values in `PUBLIC_SOURCES`; shows count active/total; "All" chip resets filter
- [x] Regions covered (links to region pages) ✓ Sprint 2.48 — URL-driven `?country=` filter chips with flag emoji + ISO2 from unique `country` values; clears to All
- [x] "Suggest a source" submission form ✓ Sprint 2.45 — `#suggest` section on index: name, URL, type select, country ISO2, reason textarea, optional email; posts to `/api/sources/suggest`
- [x] CSV export of full directory ✓ Sprint 2.50 — `/api/sources/export` route handler (force-static) generating CSV from PUBLIC_SOURCES with 7 columns (slug, name, kind, country, language, reliability, homepage_url, description); proper quoting/escaping; "Export CSV ↓" button added to sources index page alongside count display
- [x] Pagination + good crawlable structure ✓ Sprint 2.51 — `?page=N` URL-driven pagination (page size 30); `pageHref()` helper preserves sort/lang/country filters; prev/next links with `rel="prev/next"`; numbered page links with `aria-current="page"`; page number clamped to totalPages; `buildHref` updated to carry page state

## i18n
- Source descriptions in EN + UK at minimum.

### Примітки
Competitors keep their sources secret. We publish (excluding sensitive contributor identities) — that *is* the trust strategy.
