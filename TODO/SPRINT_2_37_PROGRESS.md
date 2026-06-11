# Sprint 2.37 — Progress

**Theme:** Topic feed autodiscovery, OpenAPI locale-prefix extension, MiniMap preview on companies-near.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Topic detail feed alternates
- [x] `/topics/<slug>` metadata now registers `<link rel="alternate">` entries for RSS + Atom + JSON Feed via `buildMetadata({ feeds: [...] })` — same pattern as the region and entity pages.
- [x] Confirmed `/entities/<slug>` was already wired for all three formats back in 2.30–2.32, so no duplicate work needed there.

### OpenAPI `x-locale-prefixed` extension
- [x] All 12 feed-path operations carry `x-locale-prefixed: true`.
- [x] `info.description` explains the convention: paths flagged with the extension also exist under `/{locale}/...` for every active non-EN locale. EN remains canonical and unprefixed.
- [x] Codegen tools can now expand the feed surface automatically without us having to enumerate every locale × format combination explicitly.

### MiniMap preview on `/companies-near/<city>`
- [x] When the home city has coordinates, the "Within N km" section now renders a 240px maplibre MiniMap centered on the home city.
- [x] Pins synthesized from `CITY_COORDS`: home city in accent blue (`infrastructure` class color), nearby cities in yellow (`civilian_alert`).
- [x] Zoom adapts to the chosen radius — `100km → 6`, `250 → 5`, `500 → 4`, `1000 → 3.5`, `2500 → 2.5`.
- [x] Uses synthetic `AegisEvent` stubs so we reuse the existing `MiniMap` component instead of writing a new map component.

---

## Files touched

New:
- `TODO/SPRINT_2_37_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/topics/[slug]/page.tsx` — feed alternates
- `apps/web/src/app/api/openapi.json/route.ts` — `x-locale-prefixed: true` on every `tags: ["feeds"]` operation + locale-prefix note in `info.description`
- `apps/web/src/app/[locale]/companies-near/[city]/page.tsx` — synthesized `mapEvents` + `MiniMap` render in the "Within N km" section
- `TODO/SPRINT_2_36_PROGRESS.md` — closed 3 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_36_PROGRESS.md` — all three open follow-ups closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [x] Distance label on the MiniMap pins on hover (tooltip) — ✓ Sprint 2.38 (native `title` attribute on marker elements)
- [x] OpenAPI: `x-locale-prefixed` should also gain a `description` so spec readers understand it inline — ✓ Sprint 2.38 (now described on the `feeds` tag)
- [x] Per-investigation RSS / Atom / JSON Feed at `/investigations/<slug>/feed.*` — ✓ Sprint 2.38
- [x] `/companies-near` index page (not parameterized) listing every covered HQ city as a directory — ✓ Sprint 2.38
