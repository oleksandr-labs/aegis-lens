# Sprint 2.6 — Progress

**Theme:** Polish & pay down open follow-ups from Sprints 1.8 / 1.9 / 2.4 / 2.5.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents (user request).

---

## Delivered

### OG image
- [x] `/investigations/[slug]/opengraph-image.tsx` — Satori-rendered card with title, date, lead analyst, finding count, source count, tag chips. Same dark tactical palette and accent rail as the existing sources / reports / city OG routes. Satori-safe: `display: flex` on every multi-child div, `backgroundColor` + `backgroundImage` split (no `background:` shorthand).

### Downloadable dataset routes (`/data/*`, CC-BY-4.0, CORS-open)
- [x] `/data/events.json` — wraps `listEvents()`, served live with content-disposition.
- [x] `/data/sources.csv` — wraps `PUBLIC_SOURCES` with proper CSV escaping (`"` doubling, quoting on commas/newlines).
- [x] `/data/glossary.json` — wraps `GLOSSARY` (38 terms).
- [x] `/data/equipment.json` — wraps `EQUIPMENT` (39 systems).
- [x] `/data/geography.geojson` — FeatureCollection of admin-1 (58 oblast points with bbox in properties) + admin-2 (35 city points with population). `application/geo+json` mime.
- Middleware already skips dot-suffix paths, so no middleware change needed.
- `/datasets` page geography "size" updated to `live`.

### Region badges & cross-links (bbox reverse-lookup, no geocoder)
- [x] `lib/region-lookup.ts` — `findOblast(lon, lat)` picks the smallest-area enclosing oblast; `findCountryIso2(lon, lat)` for fallback. Pure functions, zero deps.
- [x] `/incidents` — every incident row now carries a 📍 region badge (oblast name when found, country ISO-2 otherwise). Badge is part of the existing card link to the event detail.
- [x] `/reports/[slug]` — new "Related regions" section. Counts cited events per oblast, sorts by frequency, links each pill to `/regions/<iso2>/<oblast-slug>` with a citation count. Falls back to country pills if no oblast match.

### `/api/events` cursor pagination
- [x] Stable order: `occurredAt` desc with `eventId` desc tiebreaker.
- [x] `cursor` query param (base64url of `${occurredAt}|${eventId}` of the last returned item) advances to the next page.
- [x] Response `meta` now includes `count`, `total`, `hasMore`, and `nextCursor` (null when exhausted).
- [x] Invalid cursors are silently treated as first-page (forgiving for client mistakes).
- [x] OpenAPI 3.1 spec (`/api/openapi.json`) — added `cursor` param + extended `meta` schema with `hasMore` + `nextCursor`.
- [x] `/docs/api` — example response updated to real field names (`eventId`, `occurredAt`, `dangerScore`, `meta.nextCursor`); cursor row points to `meta.nextCursor`.

---

## Files touched

- `apps/web/src/app/[locale]/investigations/[slug]/opengraph-image.tsx` (new)
- `apps/web/src/app/data/events.json/route.ts` (new)
- `apps/web/src/app/data/sources.csv/route.ts` (new)
- `apps/web/src/app/data/glossary.json/route.ts` (new)
- `apps/web/src/app/data/equipment.json/route.ts` (new)
- `apps/web/src/app/data/geography.geojson/route.ts` (new)
- `apps/web/src/lib/region-lookup.ts` (new)
- `apps/web/src/app/[locale]/incidents/page.tsx` (region badge wired in)
- `apps/web/src/app/[locale]/reports/[slug]/page.tsx` (related regions section)
- `apps/web/src/app/api/events/route.ts` (cursor pagination)
- `apps/web/src/app/api/openapi.json/route.ts` (cursor + meta schema)
- `apps/web/src/app/[locale]/docs/api/page.tsx` (example response updated)
- `apps/web/src/app/[locale]/datasets/page.tsx` (geography size → live)

---

## TODO bookkeeping
- `SPRINT_2_5_PROGRESS.md` — OG image follow-up ticked `✓ Sprint 2.6`.
- `SPRINT_2_4_PROGRESS.md` — downloadable datasets ticked `✓ Sprint 2.6`.
- `SPRINT_1_9_PROGRESS.md` — `/incidents` region badge + `/api/events` cursor both ticked `✓ Sprint 2.6`.
- `SPRINT_1_8_PROGRESS.md` — Reports per-region cross-link block ticked `✓ Sprint 2.6`.

## Open follow-ups
- [x] Region pages: "Top sources" + "Recent verified briefs/reports" sections ✓ Sprint 2.7 (added "Top sources", "Recent reports", "Related investigations" sections; sources ranked by reliability per country, reports derived from cited-event oblast lookup)
- [x] Region pages: civilian safety summary ✓ Sprint 2.7 (event-mix narrative with red/yellow/neutral border tone keyed off high-danger count)
- [ ] OG image for `/investigations/<slug>` could include a small map sparkline of cited regions
- [x] Cursor pagination: surface `Link: <next>` header alongside `meta.nextCursor` for HATEOAS-style clients ✓ Sprint 2.7 (RFC 5988 `Link` rel="next", echoes filters, `Access-Control-Expose-Headers` added so browsers can read it)
