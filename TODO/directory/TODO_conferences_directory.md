# Directory — Conferences (OSINT / Intel / Security)

## Progress
4/4 done — Sprint 2.68 (2026-06-10)

## URLs
- `/conferences` · `/conferences/<slug>` · `/conferences/<region>` · `/conferences/<topic>`

## Content
- [x] Per-event: dates · location · CFP · topics · price · CTA — `apps/web/src/lib/directory/conferences.ts` (ConferenceProfile interface)
- [x] Calendar view (upcoming) — annualMonth field + CONFERENCE_PROGRAMMATIC_NOTE_EN/UK (/conferences/<year> route)
- [x] Schema.org `Event` — CONFERENCE_SCHEMA_NOTE_EN/UK + `apps/web/src/app/api/v1/directory/conferences/route.ts`
- [x] Filter by region / topic / format (online / hybrid / in-person) — ConferenceFormat type, ConferenceFocus type, CONFERENCE_FOCUS_CONFIG
