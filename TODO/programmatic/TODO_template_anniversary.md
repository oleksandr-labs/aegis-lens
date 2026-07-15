# Programmatic Template — Conflict Anniversary / Retrospective

## Goal
Recurring editorial content type for key historical dates ("3 years since the full-scale invasion", "10 years since Crimea annexation") — distinct from `content/TODO_year_in_review.md` (annual flagship, calendar-year-end) and the auto-generated `seo/TODO_archive_pages.md` (pure date-index pages, no narrative). Predictable seasonal traffic spikes and strong backlink/press pickup on anniversary dates.

## Progress
- 0 / 4 done

## URLs
- `/retrospectives` (index) · `/retrospectives/<anniversary-slug>` (e.g. `/retrospectives/3-years-full-scale-invasion`, `/retrospectives/10-years-crimea`)

## Tasks
- [ ] Data model: `AnniversarySeed` (conflictSlug, anniversaryDate, milestoneLabel, recurrence: annual/decade, narrativeEN/UK, keyStatsSincEvent[]) in `apps/web/src/lib/programmatic/anniversaries.ts`
- [ ] Per-anniversary page: "what's changed since X", key stats delta (casualties/territory/aid since the milestone), embedded timeline, notable events that year
- [ ] Editorial calendar entry: pre-schedule known upcoming anniversaries across all 8 conflicts (cross-link `product/TODO_content_calendar.md`)
- [ ] FAQPage JSON-LD (10 Q&A) + `Article`/`Event` schema.org; social preview image template per anniversary

## Notes
- Reuses the year-in-review production pattern and existing per-conflict data (`pages/TODO_conflicts.md` `keyStats[]`) — low spec effort, mostly an editorial-calendar + template exercise, not new data plumbing.

## i18n
- EN + UK simultaneous — anniversary dates (esp. full-scale invasion, Feb 24) carry the platform's highest single-day traffic potential for the Ukrainian audience specifically.
