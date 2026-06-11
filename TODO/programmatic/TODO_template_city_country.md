# Template — City / Country Hub

## URLs
- `/countries` index ✓ Sprint 2.14 (content-layer companion to operational `/regions/<country>`)
- `/country/<iso2>` ✓ Sprint 2.14 (UA / PL / DE)
- `/companies/city/<slug>` ✓ Sprint 2.12 (HQ-keyed); operational city pages already at `/regions/<country>/<oblast>/<city>` ✓ Sprint 1.7

## Progress
- 6 / 9 done

## Content
- [x] Country / city overview + relevant context ✓ Sprint 2.14 (description + capital + ISO-2 + operational-map link)
- [ ] Companies directory subset (link) — deferred (companies aren't yet country-keyed beyond region buckets)
- [ ] Tools directory subset (link) — deferred (tools have no country field)
- [x] Intel data subset (events count, last 90d chart) ✓ Sprint 2.14 (KPI strip: events / avg danger / oblasts / cities + by-class breakdown)
- [x] Local news / press subset ✓ Sprint 2.14 (Top public sources filtered by ISO-2)
- [ ] FAQ block — deferred
- [x] Schema.org `Place` + `containedInPlace` ✓ Sprint 2.14 (Place + Article `about` linkback + BreadcrumbList)
- [x] hreflang per locale ✓ Sprint 2.14 (buildMetadata pathFor on /country/<slug> and /countries)
- [x] Quality gate: ≥ minimum content + relevant data ✓ Sprint 2.14 (only emits for the 3 covered ISO-2s; each has substantial linked content)

## i18n
- Place names localized (`name:<lc>`).

### Примітки
Country hubs handle international intent; city hubs handle local intent. Different content.
