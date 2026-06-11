# Directory — NGOs / Humanitarian Orgs

## URLs
- `/ngos` · `/ngos/<slug>` · `/ngos/<region>` · `/ngos/<sector>`

## Content
- [x] Per-NGO: mission · regions · sectors · funding · CTA (donate / partner) — `apps/web/src/lib/directory/ngos.ts`
- [x] Schema.org `Organization` — `NGO_SCHEMA_NOTE_EN/UK` in `apps/web/src/lib/directory/ngos.ts`
- [x] Filter by region / sector — `apps/web/src/app/api/v1/directory/ngos/route.ts` (?focus, ?region, ?verified)
- [x] Discounted-tier eligibility flag — `NGO_VETTING_NOTE_EN/UK` + `verified` field on `NgoProfile`

## Progress
4 / 4 tasks done — Sprint 2.68
