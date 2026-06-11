# Directory — Think Tanks & Research Centers

## Progress
4/4 done — Sprint 2.68 (2026-06-10)

## URLs
- `/think-tanks` · `/think-tanks/<slug>` · `/think-tanks/<region>`

## Content
- [x] Per-org: focus areas · funding transparency · publications · key analysts — `apps/web/src/lib/directory/think-tanks.ts` (ThinkTankProfile with focus[], geography[], publicationsUrl, founded)
- [x] Schema.org `Organization` — THINK_TANK_SCHEMA_NOTE_EN/UK (Organization + ResearchOrganization) + `apps/web/src/app/api/v1/directory/think-tanks/route.ts`
- [x] Per-region filters — ThinkTankGeography type, geography field, THINK_TANK_FOCUS_CONFIG
- [x] Cross-link to published reports — publicationsUrl_en/uk fields + THINK_TANK_PROGRAMMATIC_NOTE_EN/UK (cross-links to Aegis Lens research database)
