# Template — Trend Pages

## URLs
- `/trends` index ✓ Sprint 2.0 (cards) — index cards now link to detail ✓ Sprint 2.14
- `/trends/<slug>` ✓ Sprint 2.14 (5 seed trends)

## Progress
- 8 / 8 done

## Content
- [x] Trend overview + time horizon ✓ Sprint 2.14 (`horizon` eyebrow + description hero)
- [x] Time-series chart of events ✓ Sprint 2.14 (full-width SVG sparkline with min/max annotation)
- [x] Regions most affected ✓ Sprint 2.14 (`affectedCountries` ISO-2 list)
- [x] Key incidents (linked) ✓ Sprint 2.14 (`citedEventIds` resolved to event detail links)
- [x] Analyst commentary (with citations) ✓ Sprint 2.24 (per-trend `analystCommentary` — author + writtenAt + paragraphs; bracketed event-ID and investigation-slug citations; left-accent quote block + methodology pointer)
- [x] FAQ ✓ Sprint 2.14 (parametric FAQ + FAQPage JSON-LD)
- [x] Schema.org `Article` + `Dataset` for underlying data ✓ Sprint 2.14 (+ FAQPage + BreadcrumbList; Dataset points at /data/events.json)
- [x] Quality gate: data depth + cited methodology ✓ Sprint 2.14 (footer pointer to /methodology + /data/events.json)

## i18n
- Per-locale where audience demand exists.

### Примітки
Trends are evergreen + auto-refreshing. Cron a daily/weekly recompute.
