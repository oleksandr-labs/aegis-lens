# Sprint 2.17 — Progress

**Theme:** Three more cross-cut multipliers + `/scoring` index. Closes the remaining open items from `TODO/categories_taxonomy/TODO_cross_cuts.md`.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Equipment × Operator (`/equipment/<slug>/operated-by/<operator>`)
- [x] `lib/equipment-operators.ts` — derives a primary-operator slug from `EquipmentSeed.origin` via `primaryOperator()` (strips trailing parenthesized vendor + slash-separated co-operators). Diacritic-stripped slug.
- [x] `/equipment/[slug]/operated-by/[operator]` — per-(equipment × operator) detail. Spec rows (type, origin, operator), sibling systems operated by the same actor.
- [x] Product + BreadcrumbList JSON-LD with `brand` = operator organization.

### Source × Country (`/sources/<slug>/in/<country>`)
- [x] `/sources/[slug]/in/[country]` — emitted only for sources whose `country` field maps to a `listRegions()` entry. KPI strip (reliability %, language, kind, country event count), authoritative homepage link with `nofollow noopener noreferrer`, "Other sources covering {country}" footer ranked by reliability.
- [x] Article + BreadcrumbList JSON-LD with `Place` as `about`.

### 3D cross-cut: Persona × Task × Region (`/use-cases/<vertical>/<task>/in/<country>`)
- [x] Generated for every (vertical × task × country) triple in the existing seed × `listRegions()`. Country context block (with live event count), recommended workflow, country threat profile (filtered by affected regions), recommended tools (filtered by tool categories), sibling tasks in same country, sibling countries for the same task.
- [x] Article + BreadcrumbList with full 4-segment crumb, `Place` as `about`.

### `/scoring` index
- [x] `/scoring` — CollectionPage + ItemList listing the 4 metrics (`confidence`, `danger`, `anomaly`, `reliability`) with range + one-liner per card. Closes the open follow-up from Sprint 2.13.

### Plumbing
- [x] `urls.equipmentOperator`, `urls.sourceCountry`, `urls.useCaseTaskCountry`, `urls.scoringIndex` added to `@aegis/url-builder`.
- [x] `listEquipmentOperatorPairs` imported into `sitemap.ts`.
- [x] Sitemap: +4 new loops (equipment×operator, source×country, 3D use-case×country, scoring index). All respect the same min-data threshold pattern as their pages.

---

## Files touched

New:
- `apps/web/src/lib/equipment-operators.ts`
- `apps/web/src/app/[locale]/equipment/[slug]/operated-by/[operator]/page.tsx`
- `apps/web/src/app/[locale]/sources/[slug]/in/[country]/page.tsx`
- `apps/web/src/app/[locale]/use-cases/[vertical]/[task]/in/[country]/page.tsx`
- `apps/web/src/app/[locale]/scoring/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+4 helpers)
- `apps/web/src/app/sitemap.ts` (+1 import, +4 loops)
- `TODO/categories_taxonomy/TODO_cross_cuts.md` — now **12 / 12 multipliers + 3 / 3 gates done** (only category × city deferred as a noted limitation; everything else from the original list ticked)
- `TODO/SPRINT_2_13_PROGRESS.md` — `/scoring` index follow-up ticked ✓ Sprint 2.17

---

## TODO bookkeeping
- `TODO/categories_taxonomy/TODO_cross_cuts.md` — all 12 listed multipliers ticked or covered by earlier sprints; all 3 gates met. Only **category × city** deferred (needs finer per-city event counts).
- `TODO/SPRINT_2_13_PROGRESS.md` — `/scoring` index follow-up closed ✓ Sprint 2.17

## Open follow-ups
- [ ] **category × city** (e.g. `/topics/cyber/in/kyiv`) — would require event records geocoded to admin-2 city instead of just admin-1 oblast. Needs richer seed.
- [ ] Curate explicit `operators?: string[]` on EQUIPMENT so Shahed-136 surfaces `operated-by/iran` AND `operated-by/russia` (today only `iran` since that's the primary parsed).
- [ ] OG image for cross-cut pages — single tile that shows both axes ({class}×{country}, {threat}×{country}, etc.)
- [ ] FAQ block per cross-cut ("Why is the cyber-event rate higher in Poland than Germany?")
