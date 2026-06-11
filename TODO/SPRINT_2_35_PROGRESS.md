# Sprint 2.35 — Progress

**Theme:** Atom + JSON Feed parity for regional feeds, distance-sort variant on `/companies-near`, OpenAPI schemas for JSON Feed + `_aegis`.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Regional feeds: Atom + JSON parity
- [x] `/regions/<country>/<oblast>/atom.xml` (EN) and `/[locale]/regions/<country>/<oblast>/atom.xml` (per-locale).
- [x] `/regions/<country>/<oblast>/feed.json` (EN) and per-locale variant.
- [x] `lib/region-feed.ts` introduces `buildRegionAtomFeed` and `buildRegionJsonFeed` — both filter events by the oblast's bbox, both honor localized oblast names, JSON feed carries the `_aegis` extension block.
- [x] URL helpers: `urls.oblastAtom`, `urls.oblastAtomLocale`, `urls.oblastJson`, `urls.oblastJsonLocale`.
- [x] Sitemap emits all four formats × locales for every admin-1.

### Distance-sort on `/companies-near/<city>`
- [x] `?sort=distance` swaps the by-industry grouping for a flat list sorted by distance from the home city center (home city companies render with the "here" label, then nearby cities ascending).
- [x] Compact "Sort: Industry / Distance" chip-bar appears only when the home city has coordinates.
- [x] Distance variant is noindexed; canonical stays on the unparametrized URL — same approach as the radius variants.

### OpenAPI: JSON Feed shape
- [x] New `feeds` tag introduced.
- [x] `/news/feed.json` GET documented with `application/feed+json` response referencing the new `JsonFeed` envelope schema.
- [x] Reusable `JsonFeed`, `JsonFeedItem`, `JsonFeedAegisEvent` schemas added under `components.schemas`. `JsonFeedAegisEvent` references existing `EventClass`, `VerificationState`, and `GeoPoint` so the extension shape stays in sync with the events schema.

---

## Files touched

New:
- `apps/web/src/lib/region-feed.ts`
- `apps/web/src/app/regions/[country]/[oblast]/atom.xml/route.ts`
- `apps/web/src/app/regions/[country]/[oblast]/feed.json/route.ts`
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/atom.xml/route.ts`
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/feed.json/route.ts`
- `TODO/SPRINT_2_35_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/companies-near/[city]/page.tsx` — distance-sort variant + noindex
- `apps/web/src/app/sitemap.ts` — per-oblast Atom + JSON URLs (EN + per-locale)
- `apps/web/src/app/api/openapi.json/route.ts` — `feeds` tag, `/news/feed.json` path, JSON Feed schemas
- `packages/url-builder/src/index.ts` — `oblastAtom`/`oblastAtomLocale`/`oblastJson`/`oblastJsonLocale`
- `TODO/SPRINT_2_34_PROGRESS.md` — closed 3 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_34_PROGRESS.md` — regional Atom/JSON, distance sort, OpenAPI JSON Feed all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [x] More HQ-city coordinates as the directory grows (carry-forward from 2.34) — ✓ Sprint 2.36 (~45 anticipated cities pre-seeded)
- [x] Surface RSS/Atom/JSON feed links on `/regions/<country>/<oblast>` detail page metadata — ✓ Sprint 2.36
- [x] Document `/news/feed.xml`, `/news/atom.xml`, per-topic, per-entity, per-region feed endpoints in OpenAPI alongside `/news/feed.json` — ✓ Sprint 2.36 (11 new path entries under the `feeds` tag)
- [x] JSON Feed shape on `_aegis` for non-event items (investigations) — currently only `JsonFeedAegisEvent` is defined; investigation items need `JsonFeedAegisInvestigation` — ✓ Sprint 2.36 (`oneOf` in `JsonFeedItem._aegis`)
