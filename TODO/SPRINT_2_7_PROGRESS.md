# Sprint 2.7 — Progress

**Theme:** Region-page depth, no-JS compare picker, Redoc API explorer, investigation detail polish, HATEOAS Link header.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Region (admin-1) page enhancements
Four new sections added to `/regions/<country>/<oblast>`:
- [x] **Civilian safety** — derived narrative paragraph counting civilian alerts, humanitarian, infrastructure, and kinetic events. Tone-coloured (red ≥3 high-danger, yellow ≥1, neutral otherwise). Methodology link in the foot.
- [x] **Top sources** — `PUBLIC_SOURCES` filtered by country, sorted by reliability desc, links to `/sources/<slug>` with reliability badge.
- [x] **Recent reports** — derived from cited-event oblast lookup (using `findOblast` introduced in 2.6). Up to 5, with kind + date + localized title.
- [x] **Related investigations** — investigations whose `citedOblastSlugs` includes this oblast slug. Up to 4.

### /compare — no-JS server-rendered form
- [x] `parseOblasts(sp)` now accepts BOTH `?oblasts=ua:donetsk-oblast,pl:mazowieckie` (canonical, comma-joined — still works for canonical URLs from `urls.compare`) AND repeated `?o=ua:donetsk-oblast&o=pl:mazowieckie` (native checkbox submission).
- [x] Picker form submits multi-`o` params directly — no inline `<script>`, no hidden input, no `disabled` toggling. JS-free path is now the primary path.
- [x] Helper text clarifies: "first 4 are used if more are checked."

### Redoc API explorer
- [x] `/docs/api/explorer` — Redoc 2.1.5 from jsDelivr renders the live `/api/openapi.json` spec. Themed to the dark tactical palette (accent #ff6b35, sidebar #0f1218, right panel #0a0d12). `noscript` graceful fallback offers spec + Postman downloads. `urls.docsApiExplorer` helper + sitemap entry added.
- [x] `/docs/api` overview gets a top-of-page CTA strip: **Open API explorer → · OpenAPI 3.1 (JSON) · Postman collection**.

### Investigation detail polish
- [x] `Person` JSON-LD node with `@id`, `jobTitle`, `worksFor`. Article `author` now references it by id (cleaner schema graph).
- [x] `citation[]` now includes both source CreativeWork entries and resolved cited events (with `identifier` set to eventId).
- [x] New "Cited events" UI block, rendered when `citedEventIds` is non-empty.
- [x] Demo cited events wired: Iran-Russia drone supply chain links to two Shahed-related events; Mariupol theatre strike links to the Donetsk military event.

### /api/events HATEOAS
- [x] RFC 5988 `Link: <…>; rel="next"` header set whenever `nextCursor` is non-null. URL echoes incoming `country`, `class`, `since`, `hours`, `limit` filters with cursor merged in.
- [x] `Access-Control-Expose-Headers` advertises `Link` (plus the existing rate-limit headers) so browsers can actually read them cross-origin.

---

## Files touched

- `apps/web/src/app/[locale]/regions/[country]/[oblast]/page.tsx` — 4 new sections + 5 new imports
- `apps/web/src/app/[locale]/compare/page.tsx` — `parseOblasts` extended, JS coalescer + hidden input removed
- `apps/web/src/app/[locale]/docs/api/explorer/page.tsx` — new
- `apps/web/src/app/[locale]/docs/api/page.tsx` — CTA strip + corrected response shape + cursor description
- `apps/web/src/app/[locale]/investigations/[slug]/page.tsx` — Person JSON-LD, citedEvents block, citation enrichment
- `apps/web/src/lib/investigations-seed.ts` — demo `citedEventIds` for 2 investigations
- `apps/web/src/app/api/events/route.ts` — Link header + expose-headers
- `apps/web/src/app/api/openapi.json/route.ts` — already covered cursor in 2.6
- `packages/url-builder/src/index.ts` — `urls.docsApiExplorer`
- `apps/web/src/app/sitemap.ts` — `/docs/api/explorer` route

---

## TODO bookkeeping
- `SPRINT_2_6_PROGRESS.md` — top sources + recent reports + civilian safety + Link header all ticked `✓ Sprint 2.7`.
- `SPRINT_2_0_PROGRESS.md` — Redoc UI ticked.
- `SPRINT_2_1_PROGRESS.md` — `/compare` no-JS picker ticked.
- `SPRINT_2_5_PROGRESS.md` — analyst Person JSON-LD + citedEventIds both ticked.

## Open follow-ups
- [ ] OG image for investigations to include a tiny map sparkline of cited regions
- [ ] Region page "Top sources" should rank by *actual* events ingested from each source (needs real ingest)
- [ ] `/docs/api/explorer`: bundle Redoc locally instead of jsDelivr (CSP / offline guarantees)
- [ ] Compare picker: persist last selection in a cookie so the form remembers across pageloads
