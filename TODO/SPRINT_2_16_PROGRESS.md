# Sprint 2.16 — Progress

**Theme:** Cross-cut multipliers — topic × country, topic × year, threat × country. Closes the cross-cuts TODO.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

**Trigger:** User opened `TODO/categories_taxonomy/TODO_cross_cuts.md` in IDE.

---

## Delivered

### Topic × Country (`/topics/<class>/in/<country>`)
- [x] Generated for every (event class × country) pair where ≥1 event qualifies. Same-topic / same-country sibling pivots both axes. CollectionPage + ItemList + BreadcrumbList. Cross-links to topic, country, RSS feed.
- [x] Used `/in/<country>` sub-route to avoid colliding with the existing `[slug]/feed.xml` and `[slug]/year/[year]` siblings.

### Topic × Year (`/topics/<class>/year/<year>`)
- [x] Per-(class × year) pages. Events grouped by month within the year. Sibling pivots: same topic other years; same year other topics. Deep-links to `/best-of/<year>` and `/news/archive/<year>`.

### Threat × Country (`/threats/<slug>/in/<country>`)
- [x] Per-(threat × affected country) pages. Civilian + operator guidance cards under the country lens, cited events in that country, country-class events from the same event class, sibling cross-links. Article + BreadcrumbList with `Place` `about`.

### Plumbing
- [x] `urls.topicCountry`, `urls.topicYear`, `urls.threatCountry` added to `@aegis/url-builder`.
- [x] `eventsInCountry` consolidated into the existing `@/lib/events-seed` import in `sitemap.ts`.
- [x] Sitemap: +3 cross-cut loops. Each respects the same min-data threshold as the page (only emits where the page would render).

### Quality gates (TODO_cross_cuts.md)
- [x] **Min data threshold** — every cross-cut page-emitter checks for ≥1 event/threat in the intersection before emitting. Sitemap mirrors the same filter so we never advertise a 404.
- [x] **No tag-stuffed dupes** — each cross-cut has exactly one canonical URL; no `?param` variants.
- [x] **Canonical strategy per cut** — each page exposes a single `pathFor` to `buildMetadata`; hreflang covers locale variants only.

---

## Files touched

New:
- `apps/web/src/app/[locale]/topics/[slug]/in/[country]/page.tsx`
- `apps/web/src/app/[locale]/topics/[slug]/year/[year]/page.tsx`
- `apps/web/src/app/[locale]/threats/[slug]/in/[country]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+3 helpers)
- `apps/web/src/app/sitemap.ts` (+1 import consolidation, +3 cross-cut loops)
- `TODO/categories_taxonomy/TODO_cross_cuts.md` (10 / 12 multipliers + all 3 gates ticked ✓ Sprint 2.16; earlier sprints credited where applicable)

---

## TODO bookkeeping
- `TODO/categories_taxonomy/TODO_cross_cuts.md` — **13 / 15 items done** ✓ Sprint 2.16
  - 10 / 12 multipliers ✓ (category × city + equipment × operator + source × region deferred)
  - 3 / 3 gates ✓

## Open follow-ups
- [ ] category × city (`/topics/<class>/in/<city>`) — needs finer per-city event counts
- [ ] equipment × operator (`/equipment/<slug>/<country>`) — needs operator field on EQUIPMENT
- [ ] source × region (`/sources/<slug>/<country>`) — sources aren't currently bbox-located
- [ ] persona × task × region (3D intersection) — feasible now; consider Sprint 2.17
- [x] OG images for cross-cut pages ✓ Sprint 2.20 (threat×country + topic×country shipped; equipment×operator / source×country / 3D use-case deferred)
- [x] Cross-cut FAQ blocks ✓ Sprint 2.22 (threat × country) + Sprint 2.23 (topic × country + 3D use-case × country); all three surfaces ship parametric 4-Q FAQs + FAQPage JSON-LD
