# Sprint 2.25 — Progress

**Theme:** Per-country RSS syndication, robots.txt sitemap-index pointers, search autocomplete API, year-roll banner.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Per-country RSS (`/country/<iso2>/feed.xml`)
- [x] Root-level EN feed at `/country/<iso2>/feed.xml` (middleware skips dot-suffix paths) + locale-prefixed `/[locale]/country/<iso2>/feed.xml`.
- [x] Bbox-based event filter — any event whose location falls inside the country's `COUNTRY_BBOX`. Reuses `buildRssFeedFiltered` so the channel and item shape stays consistent with `/news/feed.xml` and `/topics/<class>/feed.xml`.
- [x] `urls.countryFeed(locale, iso2)` helper added; country hub page surfaces an "RSS feed →" link next to "operational map →" in its eyebrow.
- [x] Sitemap emits both `/country/<iso2>` and `/country/<iso2>/feed.xml` per supported region × locale.

### robots.txt — sitemap-index pointers
- [x] `app/robots.ts` now declares all five sitemap URLs (`/sitemap-index.xml` + `/sitemap.xml` + `/sitemap-events.xml` + `/sitemap-cross-cuts.xml` + `/sitemap-media.xml`). Search engines now see the index AND each shard at the entry point.
- [x] Existing rules untouched: AI crawlers (GPTBot / ClaudeBot / PerplexityBot / Google-Extended / OAI-SearchBot) explicitly allowed; `/api`, `/admin`, `/_next`, `/preview` disallowed.

### Search autocomplete (`/api/search/suggest`)
- [x] CORS-open, rate-limited (60/min/IP). Returns ranked suggestions across glossary, equipment, conflicts, investigations, reports, threats, regions, sources, companies, tools, and events.
- [x] Score function: exact prefix > exact contains > token-overlap × 15. Per-kind weighting (event hits de-prioritized vs structural surfaces).
- [x] Response shape: `{ q, suggestions: Suggestion[], meta: { total, returned } }`. Each suggestion carries `{ kind, slug, label, href, sub, score }` for direct rendering in a typeahead.
- [x] Cache: `public, max-age=60, stale-while-revalidate=300`.

### Year-roll banner
- [x] `/best-of/[year]` and `/news/archive/[year]` now render an "Archived" banner on past years, linking to the most recent year-in-review / archive.
- [x] Canonical URLs are kept self-referential — these are genuinely per-year pages, not evergreen content that should canonical-collapse. The banner is a UX signal, not a canonical signal.

---

## Files touched

New:
- `apps/web/src/app/country/[iso2]/feed.xml/route.ts` (EN canonical)
- `apps/web/src/app/[locale]/country/[iso2]/feed.xml/route.ts` (locale-prefixed)
- `apps/web/src/app/api/search/suggest/route.ts`

Edited:
- `apps/web/src/app/robots.ts` — sitemap field now an array of 5 URLs
- `packages/url-builder/src/index.ts` — `urls.countryFeed` helper
- `apps/web/src/app/sitemap.ts` — country-feed URL per region
- `apps/web/src/app/[locale]/country/[slug]/page.tsx` — "RSS feed →" link
- `apps/web/src/app/[locale]/best-of/[year]/page.tsx` — archived-year banner
- `apps/web/src/app/[locale]/news/archive/[year]/page.tsx` — archived-year banner
- `TODO/SPRINT_2_15_PROGRESS.md` — canonical-to-current ticked ✓ Sprint 2.25
- `TODO/SPRINT_2_22_PROGRESS.md`, `TODO/SPRINT_2_23_PROGRESS.md`, `TODO/SPRINT_2_24_PROGRESS.md` — same follow-up closed in each

---

## TODO bookkeeping
- Canonical-to-current strategy on year-roll — closed across four progress files ✓ Sprint 2.25

## Open follow-ups
- [x] Wire `/api/search/suggest` into the existing `/search` page as a client typeahead ✓ Sprint 2.26 (`SearchTypeahead` client component: debounced fetch, ↑/↓ keyboard nav, click-out close, Esc dismiss; full-results submission preserved on Enter without active selection)
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (hand-written `analystCommentary` is the placeholder)
