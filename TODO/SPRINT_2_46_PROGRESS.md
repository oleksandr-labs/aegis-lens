# Sprint 2.46 Progress

**Date:** 2026-05-24
**Status:** Complete

---

## Tasks completed

### 1. `llms.txt` — AI search optimization

**Files changed:**
- `apps/web/src/app/llms.txt/route.ts` (NEW)
  - Next.js route handler following the llmstxt.org convention
  - Content: org tagline, capabilities summary, coverage, data quality, license, key page URLs, contact emails, AI crawler policy
  - Sets `text/plain; charset=utf-8` with 24h cache and 7d stale-while-revalidate
  - Available at `GET /llms.txt`

---

### 2. `/vs/[slug]` competitor comparison pages

**Files changed:**
- `apps/web/src/lib/competitors-seed.ts` (NEW)
  - `Competitor` type: slug, name, tagline, description, homepageUrl, category, whenToChooseThem, whenToChooseUs, comparisonTable[], faq[]
  - 5 competitors: **LiveUAMap**, **Palantir**, **Dataminr**, **Bellingcat**, **Maxar Intelligence**
  - Each with 10-row comparison table (✓/—/partial values) + 2 FAQ items
  - `getCompetitor(slug)` helper
- `apps/web/src/app/[locale]/vs/page.tsx` (NEW)
  - Index page listing all comparisons + comparison policy note
- `apps/web/src/app/[locale]/vs/[slug]/page.tsx` (NEW)
  - Per-competitor page: what they are, feature table with `Cell` helper (✓/—/partial), "When to choose" two-col block, FAQ `<details>`, "Try free" CTA, other comparisons list
  - JSON-LD: `@graph` with `Article` + `BreadcrumbList` + optional `FAQPage`
  - `rel="noopener noreferrer nofollow"` on competitor links
  - `generateStaticParams()` covers all 5 competitors × all active locales
- `apps/web/src/app/sitemap.ts` — added `/vs` and `/vs/[slug]` for all competitors

---

### 3. `/datasets/[slug]` per-dataset detail pages

**Files changed:**
- `apps/web/src/lib/datasets-seed.ts` (NEW)
  - `Dataset` type extended with: `longDescription`, `fields[]` (name/type/description), `example?`, `relatedSlugs?`
  - 7 datasets: events, sources, glossary, equipment, geography, openapi, postman
  - `citationApa()`, `citationBibtex()`, `citationRis()` citation helpers
  - `LICENSE_URL` record (CC-BY-4.0 → creativecommons URL)
  - `getDataset(slug)` helper
- `apps/web/src/app/[locale]/datasets/[slug]/page.tsx` (NEW)
  - Sections: meta strip (format/size/updated/license) + download button, long description paragraphs, field reference table, example record (`<pre>`), APA/BibTeX/RIS citation blocks (`<details>`), related datasets grid, ← back link
  - JSON-LD: `@graph` with `Dataset` + `BreadcrumbList`
- `apps/web/src/app/[locale]/datasets/page.tsx` (EDITED)
  - Replaced inline `DATASETS` + `LICENSE_URL` + `citationSnippet` with imports from `datasets-seed.ts`
  - Added `Link` import and "details →" link per dataset card
  - `citationSnippet` → `citationApa`
- `apps/web/src/app/sitemap.ts` — added `/datasets` (0.6) and `/datasets/[slug]` (0.5) for all 7 datasets

---

### 4. `/archive/[year]/[month]/[region]` date archive pages

**Files changed:**
- `apps/web/src/app/[locale]/archive/page.tsx` (NEW) — archive index: all year/month links grouped by year
- `apps/web/src/app/[locale]/archive/[year]/page.tsx` (NEW) — year page: months within year, total count
- `apps/web/src/app/[locale]/archive/[year]/[month]/page.tsx` (NEW)
  - Global monthly archive: by-class breakdown, regional breakdown chips (oblasts with ≥ 3 events), all-events list, prev/next month nav
  - JSON-LD: `@graph` with `CollectionPage` (`dateCreated`, `temporalCoverage`) + `BreadcrumbList`
  - Thin-page guard: `notFound()` if < 3 events
- `apps/web/src/app/[locale]/archive/[year]/[month]/[region]/page.tsx` (NEW)
  - Regional monthly archive: events sorted by danger desc, Stat cards (count/global/share), by-class breakdown, sibling region chips, region detail link
  - JSON-LD: `@graph` with `Article` (`temporalCoverage`, `about: Place`) + `BreadcrumbList`
  - Thin-page guard: < 3 events → 404; excluded from sitemap
- `apps/web/src/app/sitemap.ts`
  - Added `/archive` (0.5), `/archive/[year]` per year (0.5), `/archive/[year]/[month]` (0.5), `/archive/[year]/[month]/[region]` (0.45) with thin-page guard
  - Fixed duplicate imports: merged `eventsInBbox` into existing `events-seed` import, removed duplicate `listOblasts` import

---

## TODO files updated

| File | Before | After |
|------|--------|-------|
| `TODO/seo/TODO_ai_search.md` | 0/14 | 2/14 |
| `TODO/seo/TODO_open_data_seo.md` | 0/11 | 6/11 |
| `TODO/seo/TODO_archive_pages.md` | 0/8 | 5/8 |
| `TODO/pages/TODO_comparisons.md` | 0/10 | 7/10 |

---

## Open follow-ups

- `/vs/blacksky` and `/vs/planet` — add to `competitors-seed.ts`
- `/alternatives/[slug]` pages (existing route) — add competitor entries to its data source
- Archive: weekly recap (`/archive/[year]/week/[NN]`) not yet implemented
- Archive: AI-generated summary block per page (pending AI pipeline)
- Datasets: DataCite DOIs, versioning/changelog, submission to re3data/OpenAIRE
- AI search: block AI training on gated content, original-data posts with quotable stats, Wikipedia entity
