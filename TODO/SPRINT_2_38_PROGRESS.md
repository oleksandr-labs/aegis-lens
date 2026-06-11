# Sprint 2.38 — Progress

**Theme:** MiniMap pin tooltips, per-investigation feed surface, `/companies-near` index, OpenAPI feed-tag description.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### MiniMap pin tooltips
- [x] `MiniMap` marker elements now expose `el.title = ev.summary.en` when present — pure native browser tooltip, no popup layer, accessible by default.
- [x] `/companies-near/<city>` enriches synthesized pin summaries: home city reads `"<City> · here · N companies"`, nearby cities read `"<City> · X km · N companies"`. Nearby-city aggregation merges multiple companies in one city so the tooltip stays meaningful.
- [x] Cursor changes to `pointer` on hover so the affordance is obvious.

### Per-investigation feeds (RSS + Atom + JSON)
- [x] `lib/investigation-feed.ts` builds all three formats from `INVESTIGATIONS[].citedEventIds[]`.
- [x] Routes at `/investigations/<slug>/feed.xml`, `/atom.xml`, `/feed.json` — EN canonical, 404 when the investigation slug is unknown or has zero cited events.
- [x] URL helpers `urls.investigationFeed/Atom/Json` added; sitemap surfaces all three for every investigation that has cited events.
- [x] Investigation detail page metadata now registers RSS + Atom + JSON Feed alternates (only when the investigation has cited events).
- [x] JSON Feed items include the `_aegis` event extension shape so consumers can pivot on danger / confidence / location.

### `/companies-near` index page
- [x] New page at `/[locale]/companies-near` (and EN canonical `/companies-near`) listing every covered HQ city sorted by company count.
- [x] Each card shows the company count plus a `geo-enabled` / `no coords` badge so users can see at a glance which cities support distance-aware lookups.
- [x] `CollectionPage` + `ItemList` + `BreadcrumbList` JSON-LD; canonical + hreflang via `buildMetadata`.
- [x] `urls.companiesNearIndex(locale)` helper added; sitemap entry added.

### OpenAPI: inline description on `feeds` tag
- [x] The `feeds` tag description now explains the `x-locale-prefixed` convention inline so spec readers don't have to scroll back to `info.description`.

---

## Files touched

New:
- `apps/web/src/lib/investigation-feed.ts`
- `apps/web/src/app/investigations/[slug]/feed.xml/route.ts`
- `apps/web/src/app/investigations/[slug]/atom.xml/route.ts`
- `apps/web/src/app/investigations/[slug]/feed.json/route.ts`
- `apps/web/src/app/[locale]/companies-near/page.tsx`
- `TODO/SPRINT_2_38_PROGRESS.md`

Edited:
- `apps/web/src/components/Map/MiniMap.tsx` — title tooltips on markers
- `apps/web/src/app/[locale]/companies-near/[city]/page.tsx` — richer tooltip summaries, aggregated nearby-city pins
- `apps/web/src/app/[locale]/investigations/[slug]/page.tsx` — feed alternates
- `apps/web/src/app/sitemap.ts` — per-investigation feed URLs + `/companies-near` index
- `apps/web/src/app/api/openapi.json/route.ts` — `feeds` tag description
- `packages/url-builder/src/index.ts` — `investigationFeed/Atom/Json`, `companiesNearIndex`
- `TODO/SPRINT_2_37_PROGRESS.md` — closed 4 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_37_PROGRESS.md` — tooltips, per-investigation feeds, companies-near index, OpenAPI tag description all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [x] OpenAPI: document `/investigations/{slug}/feed.{xml,atom,json}` under the `feeds` tag — ✓ Sprint 2.39
- [x] Per-locale per-investigation feed at `/[locale]/investigations/<slug>/feed.*` — ✓ Sprint 2.39
- [x] Map preview on `/companies-near` index — ✓ Sprint 2.39 (MiniMap centered on Europe, pin per geo-enabled HQ city, native title tooltips)
- [x] OG image for `/companies-near` index page — ✓ Sprint 2.39
