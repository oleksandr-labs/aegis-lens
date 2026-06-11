# Sprint 2.39 — Progress

**Theme:** Per-locale per-investigation feeds, OpenAPI investigation feed paths, world map on `/companies-near` index, index OG image.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Per-locale per-investigation feeds
- [x] `/[locale]/investigations/<slug>/feed.{xml,atom,json}` routes added — all three share the existing `lib/investigation-feed.ts` builders by passing the locale through.
- [x] URL helpers `urls.investigationFeedLocale/AtomLocale/JsonLocale` added; investigation detail-page metadata switched to the locale-aware helpers so UK visitors get UK feeds.
- [x] Sitemap emits per-locale variants for every investigation with cited events (in addition to the EN canonical entries).

### OpenAPI: investigation feed paths
- [x] `/investigations/{slug}/feed.xml`, `/atom.xml`, `/feed.json` documented under the `feeds` tag with `x-locale-prefixed: true` — matches the convention shipped in 2.37 for news / topic / entity / region feeds.

### World map on `/companies-near` index
- [x] Index page now renders a 300px MiniMap centered on Europe (`[10, 40]` lon/lat, zoom 1.4) with one pin per geo-enabled HQ city.
- [x] Native `title` tooltips on each pin show `"<City> · N companies"` — reuses the tooltip support shipped in 2.38.
- [x] Caption underneath the map reports the total geo-enabled city count and prompts hover interaction.

### OG image for `/companies-near` index
- [x] `/[locale]/companies-near/opengraph-image.tsx` via the shared `renderContentOG` factory.

---

## Files touched

New:
- `apps/web/src/app/[locale]/investigations/[slug]/feed.xml/route.ts`
- `apps/web/src/app/[locale]/investigations/[slug]/atom.xml/route.ts`
- `apps/web/src/app/[locale]/investigations/[slug]/feed.json/route.ts`
- `apps/web/src/app/[locale]/companies-near/opengraph-image.tsx`
- `TODO/SPRINT_2_39_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/investigations/[slug]/page.tsx` — locale-aware feed alternates
- `apps/web/src/app/[locale]/companies-near/page.tsx` — world MiniMap + caption
- `apps/web/src/app/sitemap.ts` — per-locale investigation feed URLs
- `apps/web/src/app/api/openapi.json/route.ts` — investigation feed paths under `feeds` tag
- `packages/url-builder/src/index.ts` — `investigationFeedLocale/AtomLocale/JsonLocale`
- `TODO/SPRINT_2_38_PROGRESS.md` — closed 4 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_38_PROGRESS.md` — investigation feeds OpenAPI, per-locale investigation feeds, world map, OG image all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [ ] Surface inbound RSS/Atom/JSON links on `/investigations` index page (each row gets a small RSS badge)
- [ ] `/companies-near` world map: cluster overlapping pins (e.g. DC-area cluster collapses to one)
- [ ] Filter chips on `/companies-near` index by geo-enabled vs all (currently shows everything mixed)
- [ ] Brand book follow-up: `TODO/brand/TODO_brand_book.md` (open in IDE — review existing spec and align Tailwind tokens)
