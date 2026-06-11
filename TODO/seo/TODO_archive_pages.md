# TODO — Date Archives & Retrospectives

## Goal
Date-based archive pages: "March 2024 in Donetsk", "Week of 2025-03-10" — long-tail historical SEO.

## Progress
- 8 / 8 done

## Tasks
- [x] `/archive/<year>/<month>` global archive ✓ Sprint 2.46 — `/archive`, `/archive/[year]`, `/archive/[year]/[month]` pages with event list + class breakdown
- [x] `/archive/<year>/<month>/<region>` regional monthly archive ✓ Sprint 2.46 — `/archive/[year]/[month]/[region]` page: events sorted by danger desc, stats (events/share of total), sibling region links, region detail link
- [x] `/archive/<year>/week/<NN>` weekly recap ✓ Sprint 2.61 — `apps/web/src/app/[locale]/archive/[year]/week/[week]/page.tsx` (ISO-8601 weeks via `apps/web/src/lib/news-archive-week.ts`; mirrors month page: by-class breakdown, event list, prev/next week with year rollover, Article+BreadcrumbList JSON-LD, MIN_EVENTS_TO_INDEX=3 guard, en+uk); sitemap coverage proposed in `c:\tmp\sprint261_shared_SITEMAP.txt`
- [x] Auto-generated AI summary per archive page (with citations + caveats) ✓ Sprint 2.61 — `apps/web/src/lib/seo/archive-summary.ts` (buildArchiveSummary: injectable Summarizer, fail-soft to deterministic grounded extractiveSummary; always attaches event-permalink citations + provenance caveat; en+uk); rendered on the weekly recap page
- [x] Top events of the period (selected by danger × verification × interest) ✓ Sprint 2.46 — regional page sorts by danger score descending; global month page lists all events
- [x] Schema.org `Article` + `dateCreated` + `temporalCoverage` ✓ Sprint 2.46 — regional page uses `Article` with `temporalCoverage`; month page uses `CollectionPage` + `BreadcrumbList` with `dateCreated`
- [x] Internal links: prev/next period + same-period sibling regions ✓ Sprint 2.46 — prev/next month nav on month page; sibling region chips on both month and regional pages
- [x] Thin-page guard: hide archives below event-count threshold ✓ Sprint 2.46 — `MIN_EVENTS_TO_INDEX = 3`; pages with < 3 events return `notFound()` and are not added to sitemap

## i18n
- Date formats localized; month names in user locale; URL slugs ISO.

### Примітки
These pages compound over years. Cheap to generate, rank well long-term.
