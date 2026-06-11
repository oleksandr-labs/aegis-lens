# Sprint 2.27 — Progress

**Theme:** Five more content-page OGs, per-locale RSS variants, per-oblast RSS, global header search.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### OG images for content pages (batch 2)
- [x] `/changelog` — "What shipped, when, and why"
- [x] `/press` — "Press kit — Aegis Lens"
- [x] `/status` — "Aegis Lens system status"
- [x] `/careers` — "Build the OSINT platform we want to use"
- [x] `/partners` — "Aegis Lens partner program"
- [x] All use the shared `renderContentOG` factory from `components/og/ContentOG.tsx` introduced in 2.26.

### Per-locale RSS variants
- [x] `/[locale]/investigations/feed.xml`
- [x] `/[locale]/reports/feed.xml`
- [x] `/[locale]/tags/[slug]/feed.xml`
- [x] Each emits `<language>{locale}</language>` and links back to its locale-prefixed listing page.
- [x] `urls.investigationsFeedLocale`, `urls.reportsFeedLocale`, `urls.tagFeedLocale` helpers added.

### Per-oblast RSS (`/regions/<country>/<oblast>/feed.xml`)
- [x] Root-level EN + `/[locale]/regions/<country>/<oblast>/feed.xml`. Bbox-filtered events.
- [x] `urls.oblastFeed(locale, iso2, slug)` helper.
- [x] Oblast detail page surfaces an "RSS feed →" link below the header.
- [x] Sitemap emits the feed URL per oblast per locale (58 admin-1 × N locales).

### Global header search (`HeaderSearch`)
- [x] New client component replaces the icon-link search button in the global Header.
- [x] Collapsed: same icon button as before (no visual regression).
- [x] Expanded: inline input + suggestions dropdown with 6 results, "See all results for X →" footer item routing to `/search?q=`.
- [x] Keyboard: `/` global hotkey to focus, `↑`/`↓` cycles items, `Enter` on active item navigates, `Esc` closes + clears.
- [x] 120ms debounce, AbortController for in-flight cancellation, click-outside closes.

---

## Files touched

New:
- `apps/web/src/app/[locale]/changelog/opengraph-image.tsx`
- `apps/web/src/app/[locale]/press/opengraph-image.tsx`
- `apps/web/src/app/[locale]/status/opengraph-image.tsx`
- `apps/web/src/app/[locale]/careers/opengraph-image.tsx`
- `apps/web/src/app/[locale]/partners/opengraph-image.tsx`
- `apps/web/src/app/[locale]/investigations/feed.xml/route.ts`
- `apps/web/src/app/[locale]/reports/feed.xml/route.ts`
- `apps/web/src/app/[locale]/tags/[slug]/feed.xml/route.ts`
- `apps/web/src/app/regions/[country]/[oblast]/feed.xml/route.ts`
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/feed.xml/route.ts`
- `apps/web/src/components/HeaderSearch.tsx`

Edited:
- `apps/web/src/components/Header.tsx` — replaced icon link with `<HeaderSearch>`
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/page.tsx` — "RSS feed →" link
- `packages/url-builder/src/index.ts` (+5 helpers)
- `apps/web/src/app/sitemap.ts` — per-oblast feed URL emission
- `TODO/SPRINT_2_26_PROGRESS.md` — three follow-ups ticked ✓ Sprint 2.27

---

## TODO bookkeeping
- `TODO/SPRINT_2_26_PROGRESS.md` — per-locale RSS, content-page OGs (batch 2), header search all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK (RSS feeds are now per-locale but the underlying body content is still EN-only on most surfaces)
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure
- [x] OG images for `/help`, `/contact`, `/datasets`, `/integrations`, `/cookbook` ✓ Sprint 2.28 (all 5 ship via the shared renderContentOG factory)
- [x] Wire `HeaderSearch` cmd-K shortcut ✓ Sprint 2.28 (cmd+K / ctrl+K works inside inputs too; "/" still works outside; trigger title updated to "⌘K or /")
