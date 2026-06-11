# Directory — Grants & Funding

## URLs
- `/grants` · `/grants/<slug>` · `/grants/<type>` (journalism · research · NGO · OSINT)

## Content
- [x] Per-grant: amount · deadline · eligibility · application — `apps/web/src/lib/directory/grants-dir.ts`
- [x] Filter by amount / type / region / deadline — `apps/web/src/app/api/v1/directory/grants/route.ts` (?focus, ?funderType, ?verified)
- [x] Calendar view (upcoming deadlines) — `GRANT_DEADLINE_NOTE_EN/UK` auto-expiry policy in `apps/web/src/lib/directory/grants-dir.ts`
- [x] Per-tier eligibility cross-link — `eligibility_en/uk` field on `GrantProfile` + `GRANT_SEED_NOTE_EN/UK`

## Progress
4 / 4 tasks done — Sprint 2.68
