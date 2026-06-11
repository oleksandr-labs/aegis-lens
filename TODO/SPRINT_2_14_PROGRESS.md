# Sprint 2.14 — Progress

**Theme:** Trend detail pages, Sanctions reference hub, Country content hubs.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Trend detail pages (`/trends/<slug>`)
- [x] `lib/trends-seed.ts` — 5 trends extracted from the existing inline /trends index into a shared seed: `drone-swarm-activity-q2-2026`, `substation-targeting-frequency`, `maritime-ais-spoofing-incidents`, `cyber-tempo-around-elections`, `ew-countermeasure-proliferation`. Each carries: horizon, tags, full series, publishedAt/updatedAt, topic class, related threats + investigations + cited events, affected countries, body sections, FAQs.
- [x] `/trends/[slug]` — full-width SVG sparkline, body sections, key incidents (resolved from `citedEventIds`), related threats, related investigations, FAQ as `<details>`, "Other trends" footer. Article + Dataset (pointing at `/data/events.json`) + FAQPage + BreadcrumbList JSON-LD.
- [x] `/trends` index cards now link to detail via `urls.trend(locale, slug)` (was previously linking to `/topics/<class>`).

### Sanctions hub (`/sanctions`, `/sanctions/<list>`)
- [x] `lib/sanctions-seed.ts` — 8 reference lists across US (OFAC SDN, BIS Entity List), EU (consolidated financial), UK (OFSI consolidated), CA (SEMA), AU (DFAT consolidated), UA (NSDC), International (UN 1267). Each: jurisdiction, authoritative URL, description, update cadence, use-cases, related KG entities, tags.
- [x] `/sanctions` — index grouped by jurisdiction with a clear no-redistribution policy.
- [x] `/sanctions/[slug]` — per-list detail. Authoritative-source card (rel="nofollow noopener"), use-cases, related KG entities (Wagner Group, Rosenergoatom on the relevant lists), "Other {jurisdiction} lists" footer. Article + BreadcrumbList JSON-LD with `citation[]` derived from the authority URL.

### Country content hubs (`/country/<iso2>`, `/countries`)
- [x] `/countries` — index across UA / PL / DE with per-country event-count chip. Distinct from the operational `/regions/<iso2>` (which is the live map dashboard).
- [x] `/country/[iso2]` — content-layer hub. KPI strip (events / avg danger / oblasts / cities), by-class breakdown linking to topic feeds, oblast grid linking to operational region pages, threat-library subset filtered by ISO-2, top public sources filtered by country (ranked by reliability), investigations referencing this country (matched via cited oblast slugs), guides, "Other countries" footer. Place + Article (with `about`) + BreadcrumbList JSON-LD.

### Plumbing
- [x] `urls.trend`, `urls.sanctions`, `urls.sanctionsList`, `urls.countries`, `urls.country` added to `@aegis/url-builder`.
- [x] Sitemap: +5 trend URLs, +1 sanctions index + 8 list URLs, +1 countries index + 3 country URLs. Each × every active locale.
- [x] Footer Resources column: `Countries`, `Sanctions`.

---

## Files touched

New:
- `apps/web/src/lib/trends-seed.ts`
- `apps/web/src/lib/sanctions-seed.ts`
- `apps/web/src/app/[locale]/trends/[slug]/page.tsx`
- `apps/web/src/app/[locale]/sanctions/page.tsx`
- `apps/web/src/app/[locale]/sanctions/[slug]/page.tsx`
- `apps/web/src/app/[locale]/country/[slug]/page.tsx`
- `apps/web/src/app/[locale]/countries/page.tsx`

Edited:
- `apps/web/src/app/[locale]/trends/page.tsx` (cards now link to `/trends/<slug>`)
- `packages/url-builder/src/index.ts` (+5 helpers)
- `apps/web/src/app/sitemap.ts` (+2 imports, +3 loops + sanctions index + countries index)
- `apps/web/src/components/Footer.tsx` (+2 links)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_trend.md` — **7 / 8 done** ✓ Sprint 2.14 (AI commentary deferred)
- `TODO/programmatic/TODO_template_sanctions.md` — **4 / 5 done** ✓ Sprint 2.14 (`/sanctions/entity/<slug>` deferred)
- `TODO/programmatic/TODO_template_city_country.md` — **6 / 9 done** ✓ Sprint 2.14 (FAQ + tool/company country-subsets deferred)

## Open follow-ups
- [x] Per-entity sanctions history route (`/sanctions/entity/<slug>`) ✓ Sprint 2.21 (jurisdiction-grouped list of all sanctions citing the entity + authority-of-record disclaimer; Article + BreadcrumbList JSON-LD with `citation[]` pointing at authority URLs)
- [x] Analyst commentary block per trend with strict citation grounding ✓ Sprint 2.24 (each trend now carries an `analystCommentary` field with author + writtenAt + paragraphs; brackets reference event IDs and investigation slugs; rendered as a left-accent quote block under "Key incidents")
- [ ] Tool and company directory subsets on country hubs (requires country field on TOOLS + finer country resolution on COMPANIES)
- [ ] FAQ block per country
- [ ] Localize trend / sanctions / country body content to UK
- [ ] `/sanctions` machine-readable list manifest at `/data/sanctions.json`
