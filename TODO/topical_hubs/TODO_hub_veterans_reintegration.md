# Hub — Veterans' Post-Conflict Reintegration

## Goal
Content on returning soldiers' reintegration into civilian life (employment, mental health, benefits/pensions, prosthetics/rehabilitation) — distinct from `topical_hubs/TODO_hub_pow_exchange.md` (POW exchange logistics), `topical_hubs/TODO_hub_detention_conditions.md` (ongoing detention monitoring), and `topical_hubs/TODO_hub_transitional_justice.md` (reparations mechanisms) — none of which cover the veteran-reintegration angle. Zero content found anywhere in the repo (only unrelated hits: a "veteran-analyst" pricing discount and a bio-text mention of "conflict-journalism veterans").

## Progress
- 0 / 4 done

## URLs
- `/veterans` (pillar) · `/veterans/<topic-slug>` (e.g. `/veterans/employment-reintegration`, `/veterans/mental-health-support`, `/veterans/prosthetics-rehabilitation`)

## Tasks
- [ ] Pillar page: scope (employment, mental health/PTSD support, pensions/benefits, physical rehabilitation), sourced from government veteran-affairs programs and NGO reintegration initiatives (e.g. Ukraine's Ministry of Veterans Affairs, allied veteran-support orgs)
- [ ] Per-topic page: program directory (cross-link `directory/TODO_ngos_directory.md` where a reintegration NGO is already listed), documented program scale/funding where publicly reported
- [ ] Data model: `VeteranProgramSeed` (programName, country, category: employment/mental-health/pension/rehab, sourceUrls[]) in `apps/web/src/lib/hubs/veterans.ts`
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- No data-pipeline dependency (unlike arms-trade or cultural-heritage) — needs a sourcing plan (government/NGO program directories) but not a new integration.

## i18n
- EN + UK; high relevance for Ukrainian audience given veteran population scale.
