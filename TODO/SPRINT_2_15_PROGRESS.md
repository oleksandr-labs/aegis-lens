# Sprint 2.15 — Progress

**Theme:** News archives (year + month), year-in-review rollups, methodology subpages.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### News archive (year + month)
- [x] `lib/news-archive.ts` — `eventYears()`, `eventYearMonths()`, `eventsInYear()`, `eventsInMonth()`, `monthName()`, parse/slug helpers.
- [x] `/news/archive` — years index with per-year event count + "year in review →" cross-link.
- [x] `/news/archive/[year]` — per-year hub. Top classes summary, events grouped by month (6 surfaced per month with a "month archive →" deep-link), siblings to other years + best-of-year. CollectionPage + ItemList JSON-LD.
- [x] `/news/archive/[year]/[month]` — per-month listing with class breakdown (colored dots), full event list, sibling months.

### Year-in-review (`/best-of/<year>`)
- [x] `/best-of/[year]` — year-in-review rollup driven by `listEvents()` and the dated investigations/reports/trends seeds. Surfaces:
  - KPI strip (events / avg danger / avg confidence / class count)
  - Class-mix bars (proportional per total)
  - Top 5 incidents by danger
  - Investigations published in that year
  - Reports published in that year
  - Trends with publish/update date in that year
  - "Other years" pivot footer
- [x] Article + BreadcrumbList JSON-LD; deep-link to per-year news archive.

### Methodology subpages (`/methodology/<topic>`)
- [x] `lib/methodology-topics.ts` — 5 topics: source-tiering, verification (the seven checks), geolocation (precision classes), scoring (the four numbers), ethics (editorial discipline). Each: title, eyebrow, one-liner, multi-section body, "See also" cross-links, tags.
- [x] `/methodology/[topic]` — full detail with TechArticle + BreadcrumbList JSON-LD, tag pills → `/tags`, "See also" links into `/scoring/<metric>`, `/guides/<slug>`, `/sources`, `/trust/*`. "Other topics" footer.

### Plumbing
- [x] `urls.newsArchive`, `urls.newsArchiveYear`, `urls.newsArchiveMonth`, `urls.bestOfYear`, `urls.methodologyTopic` added to `@aegis/url-builder`.
- [x] Sitemap: +1 news-archive index, +N year pages, +N year/month pages, +N best-of pages, +5 methodology topics. Each × every active locale.
- [x] Footer Resources column: `News archive`.

---

## Files touched

New:
- `apps/web/src/lib/news-archive.ts`
- `apps/web/src/lib/methodology-topics.ts`
- `apps/web/src/app/[locale]/news/archive/page.tsx`
- `apps/web/src/app/[locale]/news/archive/[year]/page.tsx`
- `apps/web/src/app/[locale]/news/archive/[year]/[month]/page.tsx`
- `apps/web/src/app/[locale]/best-of/[year]/page.tsx`
- `apps/web/src/app/[locale]/methodology/[topic]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+5 helpers)
- `apps/web/src/app/sitemap.ts` (+2 imports, +4 loops, +1 archive index)
- `apps/web/src/components/Footer.tsx` (+1 link)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_news_archive.md` — closed substantial work ✓ Sprint 2.15 (per-year + per-year/month + per-class summary)
- `TODO/programmatic/TODO_template_best_of_year.md` — **4 / 5 done** ✓ Sprint 2.15
- `TODO/programmatic/TODO_template_methodology.md` — **4 / 6 done** ✓ Sprint 2.15 (deferred: limitations block, eval results, version history)

## Open follow-ups
- [x] Per-day rollups ✓ Sprint 2.22 (`/news/archive/<year>/<month>/<day>` — emitted only for days that actually have events; class breakdown + sibling-days footer + CollectionPage JSON-LD)
- [x] Canonical-to-current strategy on year-roll ✓ Sprint 2.25 (archived-year banner on /best-of/<y> and /news/archive/<y> when y < latest; canonical kept self-referential since each year is genuinely per-year content)
- [x] Limitations / version-history blocks on methodology subpages ✓ Sprint 2.22 (yellow-bordered limitations card + dated version-history list on every topic; eval-results still deferred)
- [ ] Localize archive / best-of / methodology bodies to UK
- [ ] Add `/scoring` index (still open from Sprint 2.13)
- [ ] OG images for `/best-of/<year>` and `/news/archive/<year>`
