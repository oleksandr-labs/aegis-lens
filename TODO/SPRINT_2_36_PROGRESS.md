# Sprint 2.36 — Progress

**Theme:** Full feed surface in OpenAPI, region detail-page autodiscovery, investigation `_aegis` schema, HQ-city coords expansion.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Feed autodiscovery on `/regions/<country>/<oblast>`
- [x] Oblast detail-page metadata now registers `<link rel="alternate">` entries for RSS + Atom + JSON Feed via `buildMetadata({ feeds: [...] })`.
- [x] Per-locale feed URLs used so UK visitors land on the UK feed.

### Full feed surface in OpenAPI
- [x] 11 new path entries under the new `feeds` tag:
  - `/news/feed.xml`, `/news/atom.xml`, `/news/feed.json`
  - `/topics/{slug}/feed.xml`, `/topics/{slug}/atom.xml`, `/topics/{slug}/feed.json`
  - `/entities/{slug}/feed.xml`, `/entities/{slug}/atom.xml`, `/entities/{slug}/feed.json`
  - `/regions/{country}/{oblast}/feed.xml`, `/regions/{country}/{oblast}/atom.xml`, `/regions/{country}/{oblast}/feed.json`
- [x] XML formats described with `application/rss+xml` / `application/atom+xml` content types and `type: string, format: xml` body schemas — keeps codegen happy without forcing us to schema-graph the XML.
- [x] JSON Feed paths reference the shared `JsonFeed` envelope schema.

### `JsonFeedAegisInvestigation` schema
- [x] New schema captures `analyst` + `investigationSlug` for items where investigations are interleaved (per-entity feeds).
- [x] `JsonFeedItem._aegis` switched from a single schema reference to `oneOf: [JsonFeedAegisEvent, JsonFeedAegisInvestigation]`. Generated clients now produce a discriminated type, and prose docs on `/docs/api` (Sprint 2.34) already describe both shapes.

### HQ-city coordinates expansion
- [x] `CITY_COORDS` extended from 20 cities to ~65 — adds anticipated defense / OSINT / cyber hubs (Berlin, Paris, Tallinn, Tel Aviv, Tokyo, Singapore, Seoul, Sydney, Canberra, Ottawa, Toronto, Cambridge MA, Tysons Corner, McLean, Palo Alto, Mountain View, etc.) plus more Ukrainian cities (Lviv, Kharkiv, Odesa, Dnipro).
- [x] Future directory additions in any of these cities pick up `/companies-near` distance UX for free.

---

## Files touched

New:
- `TODO/SPRINT_2_36_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/page.tsx` — feed alternates
- `apps/web/src/app/api/openapi.json/route.ts` — 11 feed path entries + `JsonFeedAegisInvestigation` + `oneOf` on `_aegis`
- `apps/web/src/lib/company-city.ts` — `CITY_COORDS` expansion
- `TODO/SPRINT_2_35_PROGRESS.md` — closed 4 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_35_PROGRESS.md` — all four open follow-ups closed (region autodiscovery, OpenAPI feed paths, investigation `_aegis`, city coords)

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [x] Atom + JSON feed alternates on `/topics/<slug>` and `/entities/<slug>` topic + entity detail pages — ✓ Sprint 2.37 (topic page wired; entity detail page was already done in 2.30–2.32)
- [x] OpenAPI: per-locale feed variants are not enumerated explicitly — add an `x-locale-prefixed: true` extension flag on the feed paths so codegen knows to expect `/{locale}/...` variants — ✓ Sprint 2.37 (also documented in `info.description`)
- [x] `/companies-near/<city>` map preview using a static MiniMap of nearby cities — ✓ Sprint 2.37 (home city blue, nearby cities yellow, zoom adapts to radius)
