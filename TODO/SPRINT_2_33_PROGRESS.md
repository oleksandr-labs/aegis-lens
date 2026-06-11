# Sprint 2.33 — Progress

**Theme:** JSON Feed extension namespace, per-topic JSON Feed, home-page feed autodiscovery, HQ-city coordinates + radius search on `/companies-near/<city>`.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### `_aegis` extension namespace in JSON Feed items
- [x] News, topic, and per-entity JSON Feed items now carry an `_aegis` object alongside the standard JSON Feed 1.1 fields.
- [x] Event items expose `eventId`, `eventClass`, `subclass`, `dangerScore`, `confidence`, `verificationState`, and `location` so power consumers don't have to parse `content_text`.
- [x] Investigation items expose `analyst` and `investigationSlug`.
- [x] Implemented via an optional `ext` field on the shared `FeedEntry` type in `lib/entity-feed.ts` — the RSS + Atom builders ignore it, the JSON builder spreads it as `_aegis`.

### `/topics/<slug>/feed.json`
- [x] New JSON Feed 1.1 endpoint mirrors the existing per-topic RSS.
- [x] Includes the `_aegis` extension block per item.
- [x] `urls.topicJson(slug)` helper added; sitemap surfaces it alongside the RSS topic feed.

### Home-page feed autodiscovery
- [x] `/` (and per-locale equivalents) now register `<link rel="alternate">` entries for RSS + Atom + JSON Feed via `buildMetadata({ feeds: [...] })`.
- [x] First-visit feed-reader users get one-click subscription without having to navigate to `/news` first.

### HQ-city coordinates + radius search on `/companies-near/<city>`
- [x] `CITY_COORDS` lookup added in `lib/company-city.ts` covering all 20 HQ cities currently in the directory (great-circle precision is fine — this is browsing, not routing).
- [x] `citiesWithinKm(centerSlug, radiusKm)` and `companiesWithinKm(centerSlug, radiusKm)` helpers — Haversine over WGS-84.
- [x] `/companies-near/<city>` now renders a "Within 500 km" section showing the closest companies in nearby cities, distance-sorted, with km labels. Falls back gracefully when the center city isn't in `CITY_COORDS`.

---

## Files touched

New:
- `apps/web/src/app/topics/[slug]/feed.json/route.ts`
- `TODO/SPRINT_2_33_PROGRESS.md`

Edited:
- `apps/web/src/lib/entity-feed.ts` — `FeedEntry.ext` + `_aegis` spread
- `apps/web/src/app/news/feed.json/route.ts` — `_aegis` per item
- `apps/web/src/app/[locale]/news/feed.json/route.ts` — `_aegis` per item
- `apps/web/src/app/[locale]/page.tsx` — feed alternates in home metadata
- `apps/web/src/app/sitemap.ts` — topic JSON Feed URLs
- `apps/web/src/lib/company-city.ts` — `CITY_COORDS`, `companiesWithinKm`, `citiesWithinKm`
- `apps/web/src/app/[locale]/companies-near/[city]/page.tsx` — "Within 500 km" section
- `packages/url-builder/src/index.ts` — `urls.topicJson`
- `TODO/SPRINT_2_32_PROGRESS.md` — closed 3 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_32_PROGRESS.md` — home autodiscovery, topic JSON Feed, `_aegis` extension all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [x] Atom variant of `/topics/<slug>/feed.xml` to match the news + entity surface — ✓ Sprint 2.34
- [x] Document `_aegis` extension shape on `/docs/api` so consumers know what to expect — ✓ Sprint 2.34
- [x] Per-locale topic JSON Feed (`/[locale]/topics/<slug>/feed.json`) — currently EN canonical only — ✓ Sprint 2.34
- [x] Configurable radius on `/companies-near/<city>` via `?r=250|500|1000` query param — ✓ Sprint 2.34 (radii 100/250/500/1000/2500; non-default noindexed)
