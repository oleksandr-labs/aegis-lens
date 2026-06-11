# Sprint 2.26 — Progress

**Theme:** Search typeahead UX, investigation + report RSS, per-tag RSS, OG images for content pages.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Search typeahead on `/search`
- [x] New `SearchTypeahead` client component (`apps/web/src/components/SearchTypeahead.tsx`).
- [x] Debounced fetch (120 ms) against `/api/search/suggest?q=&limit=8` with AbortController to cancel in-flight requests on keystroke.
- [x] Keyboard navigation: ↑/↓ to cycle, Enter on active item navigates, Esc closes and blurs.
- [x] Click-outside closes the dropdown.
- [x] Server form submission preserved — Enter without an active selection still submits to the full-results page.
- [x] `/[locale]/search/page.tsx` swapped from inline form to `<SearchTypeahead initialQuery={q} action={…}/>`.

### Investigations + Reports RSS
- [x] `/investigations/feed.xml` — RSS 2.0 feed of investigations, newest first. Per-item `<author>`, tag `<category>` repeated for each tag.
- [x] `/reports/feed.xml` — RSS 2.0 feed of reports sorted by `publishedAt`. Description carries kind + author + citation count + summary.
- [x] Both indexes (`/investigations`, `/reports`) surface a "RSS feed →" link in the page header.
- [x] `urls.investigationsFeed()` and `urls.reportsFeed()` added to `@aegis/url-builder`.

### Per-tag RSS (`/tags/<slug>/feed.xml`)
- [x] Aggregates investigations + guides + equipment that share the tag into one chronological feed (newest first; equipment uses build time as pubDate fallback).
- [x] Tag detail page surfaces an "RSS feed →" link below the header.
- [x] `urls.tagFeed(slug)` helper.

### OG images for content pages
- [x] Shared `components/og/ContentOG.tsx` — `renderContentOG({ eyebrow, title, tagline, footer })` factory. Same dark tactical palette and accent rail as the existing OG routes.
- [x] `/[locale]/faq/opengraph-image` — "Frequently asked questions".
- [x] `/[locale]/methodology/opengraph-image` — "How we know what we publish".
- [x] `/[locale]/pricing/opengraph-image` — "Free for individuals, real for teams".
- [x] `/[locale]/trust/opengraph-image` — "Data policy, transparency, corrections".

### Plumbing
- [x] Sitemap: investigations/reports feed URLs + per-tag feed URLs added (still root-level URLs since they're dot-suffix paths, not locale-prefixed).

---

## Files touched

New:
- `apps/web/src/components/SearchTypeahead.tsx`
- `apps/web/src/components/og/ContentOG.tsx`
- `apps/web/src/app/investigations/feed.xml/route.ts`
- `apps/web/src/app/reports/feed.xml/route.ts`
- `apps/web/src/app/tags/[slug]/feed.xml/route.ts`
- `apps/web/src/app/[locale]/faq/opengraph-image.tsx`
- `apps/web/src/app/[locale]/methodology/opengraph-image.tsx`
- `apps/web/src/app/[locale]/pricing/opengraph-image.tsx`
- `apps/web/src/app/[locale]/trust/opengraph-image.tsx`

Edited:
- `apps/web/src/app/[locale]/search/page.tsx` — inline form replaced with `<SearchTypeahead>`
- `apps/web/src/app/[locale]/investigations/page.tsx` — RSS link
- `apps/web/src/app/[locale]/reports/page.tsx` — RSS link
- `apps/web/src/app/[locale]/tags/[slug]/page.tsx` — RSS link
- `packages/url-builder/src/index.ts` (+3 helpers)
- `apps/web/src/app/sitemap.ts` — investigations / reports / per-tag feed URLs
- `TODO/SPRINT_2_25_PROGRESS.md` — search typeahead ticked ✓ Sprint 2.26

---

## TODO bookkeeping
- `TODO/SPRINT_2_25_PROGRESS.md` — search typeahead follow-up closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (hand-written placeholder lives in `Trend.analystCommentary`)
- [x] Per-locale variants of the new RSS feeds ✓ Sprint 2.27 (`/[locale]/investigations/feed.xml`, `/[locale]/reports/feed.xml`, `/[locale]/tags/<slug>/feed.xml`)
- [x] OG images for `/changelog`, `/press`, `/status`, `/careers`, `/partners` ✓ Sprint 2.27 (all 5 ship via the shared `renderContentOG` factory)
- [x] Wire the same `SearchTypeahead` into the global header ✓ Sprint 2.27 (new `HeaderSearch` client component: icon → inline expand, debounced suggest dropdown, "/" hotkey, "See all results for X →" footer)
