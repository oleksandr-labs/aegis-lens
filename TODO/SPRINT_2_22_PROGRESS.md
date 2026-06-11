# Sprint 2.22 — Progress

**Theme:** Closing four open follow-ups — video category pages, per-day news archive, methodology limitations + version history, threat × country FAQ.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Videos by category (`/videos/category/<slug>`)
- [x] One page per category (explainer / walkthrough / investigation / interview / briefing) where ≥1 video exists.
- [x] Mounted under `/videos/category/<slug>` to avoid colliding with the per-video `[slug]` route.
- [x] CollectionPage + ItemList JSON-LD; sibling-categories footer.

### News archive per-day (`/news/archive/<year>/<month>/<day>`)
- [x] `lib/news-archive.ts` extended with `eventYearMonthDays()`, `eventsInDay()`, `parseDaySlug()`, `daySlug()`.
- [x] `/news/archive/[year]/[month]/[day]` page — emits only for days that actually contain ≥1 event. Class-coloured breakdown, time-of-day per row, sibling-days-in-this-month footer, deep-link back to month archive.

### Methodology subpages — limitations + version history
- [x] `MethodologyTopic` extended with `limitations: string[]` and `versionHistory: { version, date, change }[]`.
- [x] All 5 topics (source-tiering, verification, geolocation, scoring, ethics) populated with honest limitations + dated version-history entries.
- [x] Page renders a yellow-bordered Limitations block ("What this approach does not do") and a dated changelog under it.

### Threat × Country FAQ
- [x] Parametric 4-Q FAQ added to `/threats/[slug]/in/[country]`:
  - "Is {threat} active in {country} right now?"
  - "What should civilians in {country} do?" (pulls `civilianGuidance`)
  - "What should operators in {country} do?" (pulls `operatorGuidance`)
  - "Where does this assessment come from?"
- [x] FAQPage JSON-LD merged into the existing graph. Q&A rendered as `<details>` collapsibles.

### Plumbing
- [x] `urls.newsArchiveDay`, `urls.videosByCategory` added to `@aegis/url-builder`.
- [x] Sitemap: +N per-day archive URLs (one per active day), +5 video-category URLs.

---

## Files touched

New:
- `apps/web/src/app/[locale]/videos/category/[slug]/page.tsx`
- `apps/web/src/app/[locale]/news/archive/[year]/[month]/[day]/page.tsx`

Edited:
- `apps/web/src/lib/news-archive.ts` (+4 day helpers)
- `apps/web/src/lib/methodology-topics.ts` (limitations + versionHistory on type and all 5 topics)
- `apps/web/src/app/[locale]/methodology/[topic]/page.tsx` (renders Limitations + Version history sections)
- `apps/web/src/app/[locale]/threats/[slug]/in/[country]/page.tsx` (FAQ + FAQPage JSON-LD)
- `packages/url-builder/src/index.ts` (+2 helpers)
- `apps/web/src/app/sitemap.ts` (+1 import, +2 loops)
- `TODO/SPRINT_2_15_PROGRESS.md` — per-day + methodology limitations ticked ✓ Sprint 2.22
- `TODO/SPRINT_2_16_PROGRESS.md` — cross-cut FAQ ticked (partial) ✓ Sprint 2.22
- `TODO/SPRINT_2_18_PROGRESS.md` — `/videos/<category>` ticked ✓ Sprint 2.22
- `TODO/SPRINT_2_20_PROGRESS.md` — cross-cut FAQ ticked (partial) ✓ Sprint 2.22
- `TODO/programmatic/TODO_template_news_archive.md` — per-day rollups + new URL row ticked ✓ Sprint 2.22
- `TODO/programmatic/TODO_template_methodology.md` — limitations + version history ticked ✓ Sprint 2.22

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_news_archive.md` — per-day rollups + URL ticked ✓ Sprint 2.22
- `TODO/programmatic/TODO_template_methodology.md` — **5 / 6 done** ✓ Sprint 2.22 (only eval results deferred)
- `TODO/SPRINT_2_15_PROGRESS.md`, `TODO/SPRINT_2_16_PROGRESS.md`, `TODO/SPRINT_2_18_PROGRESS.md`, `TODO/SPRINT_2_20_PROGRESS.md` — relevant follow-ups closed

## Open follow-ups
- [x] FAQ blocks on topic × country and 3D use-case × country ✓ Sprint 2.23 (parametric 4-Q FAQs + FAQPage JSON-LD on both surfaces)
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [x] Canonical-to-current strategy on year-roll ✓ Sprint 2.25 (archived-year banner on past /best-of/<y> and /news/archive/<y>; canonical kept self-referential — these are genuinely per-year pages, not evergreen)
- [x] OG images for `/news/archive/<year>` and `/best-of/<year>` ✓ Sprint 2.23 (giant-year typography with event count + months covered / class count + avg danger)
- [ ] Localize methodology limitations + version-history copy to UK
