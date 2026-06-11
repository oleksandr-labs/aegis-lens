# Sprint 2.12 — Progress

**Theme:** Closing the master prompt's exact `/companies/<industry>/<city>` target. HQ-city data + by-city + industry×city pages.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Seed
- [x] `DirectoryEntry` gains an optional `city?: string` field (HQ city).
- [x] 20 well-known companies populated with HQ city: Anduril (Costa Mesa), Palantir (Denver), Helsing (Munich), Rheinmetall (Düsseldorf), Saab (Stockholm), Lockheed (Bethesda), Northrop (Falls Church), Raytheon (Arlington), Bellingcat (Amsterdam), Janes (London), Recorded Future (Boston), Sayari (Washington), Maxar (Westminster), Planet (San Francisco), BlackSky (Herndon), Ukroboronprom (Kyiv), Antonov (Kyiv), Motor Sich (Zaporizhzhia), Kvertus (Kyiv), Tytan Defense UA (Kyiv), Mandiant (Reston), CrowdStrike (Austin), Microsoft Threat Intel (Redmond).

### Helpers
- [x] `lib/company-city.ts` — `cityToSlug()` (NFD-stripped diacritics, kebab-case), `listCompanyCitySlugs()`, `companiesInCity()`, `cityDisplay()`, `listIndustryCityPairs()` (only emits pairs where ≥1 company qualifies), `companiesInIndustryAndCity()`.

### Routes
- [x] `/companies/city/[slug]` — by-HQ-city page. Groups by industry, per-group "Industry in City →" link to the intersect page, "Other cities" footer with counts. CollectionPage + ItemList + BreadcrumbList.
- [x] `/industries/[slug]/[city]` — full industry × city intersect. Master-prompt target met (`/industries/cybersecurity/austin`, `/industries/satellite-imagery/san-francisco`, `/industries/defense-tech/kyiv`, etc.). Sibling cross-links: "Other industries in <city>" + "<industry> in other cities". CollectionPage + ItemList + BreadcrumbList.
- [x] Both routes pre-render statically — only emit pages that actually contain qualifying companies (avoids thin-content thresholds).

### Plumbing
- [x] `urls.companiesByCity`, `urls.industryCity` added to `@aegis/url-builder`.
- [x] Sitemap: +N company-city URLs + +M industry × city intersect URLs (derived from current seed).
- [x] Cross-references: `/companies/city/<slug>` per-category row links to `/industries/<industry>/<city>`; intersect page links back to industry hub and to "all companies in <city>".

---

## Files touched

New:
- `apps/web/src/lib/company-city.ts`
- `apps/web/src/app/[locale]/companies/city/[slug]/page.tsx`
- `apps/web/src/app/[locale]/industries/[slug]/[city]/page.tsx`

Edited:
- `apps/web/src/lib/directory-seed.ts` (+ `city?` field on `DirectoryEntry`; 20 entries populated)
- `packages/url-builder/src/index.ts` (+2 helpers)
- `apps/web/src/app/sitemap.ts` (+1 import, +2 loops)
- `TODO/programmatic/TODO_template_companies_city.md` (now **7 / 9 done**)
- `TODO/SPRINT_2_11_PROGRESS.md` (city-field follow-up ticked)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_companies_city.md` — **7 / 9 done** ✓ Sprint 2.12
- `TODO/SPRINT_2_11_PROGRESS.md` — "Add city to COMPANIES" follow-up ticked ✓ Sprint 2.12

## Open follow-ups
- [ ] HQ mini-map on by-city + intersect pages (needs per-company coordinates — currently we only have city names)
- [ ] FAQ block per industry × city ("Best cybersecurity firms in Washington" etc.)
- [ ] LocalBusiness JSON-LD per company entry (needs address fields beyond city)
- [ ] City field on TOOLS — currently only COMPANIES carries it
- [ ] Quality gate: enforce ≥10 listings for indexability on thin intersect pages
- [ ] Localize city labels (Düsseldorf vs Duesseldorf; UK Cyrillic equivalents)
