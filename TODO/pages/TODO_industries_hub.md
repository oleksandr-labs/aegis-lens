# TODO — Industries Hub

## Goal
`/industries` index linking out to industry hubs. Audience-targeted top-of-funnel.

## Progress
- 7 / 8 done

## Tasks
- [x] `/industries` index ✓ Sprint 2.48 — confirmed complete; grid of industry cards with counts
- [x] Industry cards (cybersecurity, defense, journalism, finance, energy, gov, NGO, etc.) ✓ Sprint 2.48 — cards derived from COMPANIES + TOOLS categories; 5 featured (OSINT/Cybersecurity/Geospatial/Satellite/Threat Intel) + all others in a compact list
- [x] Each card → industry hub (programmatic template) ✓ Sprint 1 — `/industries/[slug]` route exists
- [ ] Filter by audience size / region focus — deferred (no region/audience field on industry data)
- [x] Schema.org `CollectionPage` ✓ Sprint 2.48 — confirmed; `ItemList` with all industry URLs
- [x] Internal links to use-cases + directory subsets ✓ Sprint 2.48 — "Use cases →" link per featured industry card; cross-link block to /use-cases, /tools, /compare
- [x] Editorial-curated featured industries ✓ Sprint 2.48 — `INDUSTRY_META` in `industries.ts` with `featured: true` for 5 industries; featured section renders above the full list with description + "Featured" badge
- [x] hreflang per locale ✓ Sprint 2.48 — confirmed; `buildMetadata` generates hreflang for all `ACTIVE_LOCALES`

## i18n
- Industry names + descriptions localized.

### Примітки
This hub feeds the industry-hub programmatic template ([../programmatic/TODO_template_industry_hub.md](../programmatic/TODO_template_industry_hub.md)).
