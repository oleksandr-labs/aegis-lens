# Sprint 2.21 — Progress

**Theme:** Closing four deferred items — sanctions-entity history, 3-way tool comparison, the rest of the cross-cut OG images, and pricing × case-study integration.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Sanctions × Entity (`/sanctions/entity/<slug>`)
- [x] One page per entity referenced by any sanctions list via `relatedEntitySlugs` (inverse index over `SANCTIONS_LISTS`). Currently emits for Wagner Group and Rosenergoatom.
- [x] Page renders a jurisdiction-grouped list of every list citing the entity, with the issuing authority's URL on each (rel="nofollow noopener noreferrer") and a clear authority-of-record disclaimer ("Aegis Lens does not mirror the underlying data").
- [x] Article + BreadcrumbList JSON-LD; `citation[]` derived from authority URLs; `about` carries the entity Organization with optional Wikidata `sameAs`.
- [x] Footer pivot to other entities with sanctions citations.

### 3-way tool comparison (`/compare/tools/3way/<a>-vs-<b>-vs-<c>`)
- [x] Same-category triples only, canonical alphabetical order.
- [x] Mounted under `/3way/` prefix so the existing 2-way `[pair]` route is untouched (Next dynamic segments at the same level can't coexist).
- [x] Robust `parseTriple` — supports slugs that contain `-vs-` by trying every 2-split boundary.
- [x] 4-row comparison table (Category / Region / Verified / Description) + per-tool quick-links cards (detail + alternatives) + equal-treatment policy disclosure.
- [x] ItemList + BreadcrumbList JSON-LD with all three tools as ListItems.

### OG images for the remaining cross-cuts
- [x] `/equipment/<slug>/operated-by/<operator>/opengraph-image` — type · operator eyebrow + headline + "operated by {operator}".
- [x] `/sources/<slug>/in/<country>/opengraph-image` — kind · country eyebrow + headline + reliability % + language.
- [x] `/use-cases/<vertical>/<task>/in/<country>/opengraph-image` — vertical · country eyebrow + "{Task} in {Country}" + problem-statement clip.

### Pricing × Case studies
- [x] `/pricing` page now lifts a `featuredCaseStudy` per tier (Pro → investigative-newsroom-verification; Team → humanitarian-ngo-pre-positioning; Enterprise → european-defense-ministry-situational-awareness). Each tier renders a "Used by — {client} → Read case study" card linking into the case-study detail.
- [x] A footer block lists 6 more case studies for skimming. Verified-first ordering preserved.

### Plumbing
- [x] `urls.toolTripleCompare(locale, a, b, c)` (auto-canonicalizes via `.sort()`) and `urls.sanctionsEntity(locale, slug)` added to `@aegis/url-builder`.
- [x] Sitemap: +1 sanctions-entity loop, +1 tool-triple loop (same-category triples only, canonical order, deduped).

---

## Files touched

New:
- `apps/web/src/app/[locale]/sanctions/entity/[slug]/page.tsx`
- `apps/web/src/app/[locale]/compare/tools/3way/[triple]/page.tsx`
- `apps/web/src/app/[locale]/equipment/[slug]/operated-by/[operator]/opengraph-image.tsx`
- `apps/web/src/app/[locale]/sources/[slug]/in/[country]/opengraph-image.tsx`
- `apps/web/src/app/[locale]/use-cases/[vertical]/[task]/in/[country]/opengraph-image.tsx`

Edited:
- `apps/web/src/app/[locale]/pricing/page.tsx` — per-tier featured case-study card + bottom "more stories" block
- `packages/url-builder/src/index.ts` (+2 helpers)
- `apps/web/src/app/sitemap.ts` (+2 loops)
- `TODO/SPRINT_2_14_PROGRESS.md` — sanctions-entity follow-up ticked ✓ Sprint 2.21
- `TODO/SPRINT_2_18_PROGRESS.md` — per-tier featured case-study ticked ✓ Sprint 2.21
- `TODO/SPRINT_2_20_PROGRESS.md` — remaining cross-cut OGs ticked ✓ Sprint 2.21
- `TODO/programmatic/TODO_template_sanctions.md` — 5 / 5 done ✓ Sprint 2.21
- `TODO/programmatic/TODO_template_compare.md` — 3-way unblocked ✓ Sprint 2.21
- `TODO/programmatic/TODO_template_case_studies.md` — pricing-placement ticked ✓ Sprint 2.21

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_sanctions.md` — **5 / 5 done** ✓ Sprint 2.21
- `TODO/programmatic/TODO_template_compare.md` — 3-way ticked; feature-parity / pricing / user-review / verdict blocks still deferred (editorial work)
- `TODO/programmatic/TODO_template_case_studies.md` — pricing placement ticked ✓ Sprint 2.21
- `TODO/SPRINT_2_14_PROGRESS.md`, `TODO/SPRINT_2_18_PROGRESS.md`, `TODO/SPRINT_2_20_PROGRESS.md` — relevant follow-ups ticked

## Open follow-ups
- [ ] Feature parity matrix / pricing comparison / user-review blocks on the head-to-head pages (needs editorial content + a pricing source)
- [x] FAQ blocks on cross-cut pages ✓ Sprint 2.22 + 2.23 (all three surfaces ship parametric FAQ + FAQPage JSON-LD)
- [ ] Localize sanctions-entity copy to UK
- [x] Authority-of-record verification cadence indicator on `/sanctions/entity/<slug>` ✓ Sprint 2.23 (Page-assembled / Re-check cadence / Next-scheduled-check tri-card; 7-day cadence)
