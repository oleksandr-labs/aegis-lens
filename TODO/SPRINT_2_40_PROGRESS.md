# Sprint 2.40 — Progress

**Theme:** RSS badges on investigations index, filter chips for companies-near, newsletter + partner strip on home, pricing billing toggle, citation snippets on datasets, sources sorting, pre-existing TS error fixes.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### RSS / Atom / JSON feed badges on `/investigations` index
- [x] Each investigation card now shows feed badges (RSS / Atom / JSON) in a bordered footer row, separated from the main `<Link>` to avoid nested-anchor invalid HTML.
- [x] Badges use `urls.investigationFeedLocale / AtomLocale / JsonLocale` — locale-aware, matching Sprint 2.39 convention.
- [x] Closes Sprint 2.39 open follow-up: "Surface inbound RSS/Atom/JSON links on `/investigations` index page".

### Filter chips on `/companies-near` index
- [x] Added `?geo=1` searchParam filter: "All (N)" and "Geo-enabled (M)" chips above the city grid.
- [x] Active chip highlighted with `border-accent bg-accent/10` — matches filter chip visual language across site.
- [x] `allCities` vs `cities` split preserves world MiniMap (always shows all geo-enabled cities).
- [x] Closes Sprint 2.39 open follow-up: "Filter chips on `/companies-near` index by geo-enabled vs all".

### Home page — newsletter signup + partner/source strip
- [x] `NewsletterSignup` client component: email input + Subscribe button → `POST /api/subscribe`; handles loading, success, rate-limit, and network error states.
- [x] Partner/source strip: Copernicus/Sentinel, NASA FIRMS, OpenStreetMap, Telegram, DeepStateMAP, ISW as badge-style list items.
- [x] Both sections added to `[locale]/page.tsx` below personas block.
- [x] i18n keys added to `en/home.json` + `uk/home.json` for both sections.
- [x] Closes home TODO tasks: newsletter signup, logo strip.

### Pricing — monthly/annual billing toggle
- [x] `BillingToggle` client component: URL-driven (`?billing=annual`), replaces URL via `router.replace`.
- [x] Annual prices: Pro $31/mo (billed $372/yr, −20%), Team $159+/mo (billed $1,908+/yr, −20%).
- [x] Annual note row shown in green below the price when annual is active.
- [x] i18n keys added for both EN and UK.
- [x] Closes pricing TODO: monthly/annual toggle.

### Datasets — citation snippets
- [x] Each dataset card now has a collapsible `<details>` with APA-style citation (`Aegis Lens. (year). Title [Dataset]. url`).
- [x] Closes datasets TODO: citation snippet per dataset.

### Sources — sortable by reliability / name / type
- [x] Sort searchParam: `?sort=name`, `?sort=kind`, default = reliability.
- [x] Sort chips bar with count badge; active chip highlighted.
- [x] Closes sources TODO: sortable.

### About page — Schema.org `AboutPage` + `Organization`
- [x] `script type="application/ld+json"` with `@graph` containing `AboutPage` + `Organization` nodes.
- [x] Closes about TODO: Schema.org Organization + AboutPage.

### Pre-existing TypeScript fixes
- [x] `lib/investigations-seed.ts:46` — duplicate `citedEventIds` property removed.
- [x] `components/HeaderSearch.tsx:54` — "not all code paths return a value" in useEffect fixed (early return pattern).
- [x] `app/[locale]/threats/[slug]/in/[country]/page.tsx:102` — nested backtick in template literal (broken `/incidents` reference) fixed.
- [x] `app/[locale]/news/archive/[year]/[month]/[day]/page.tsx:161` — `CLASS_COLOR[cls]` index error fixed with `cls as keyof typeof CLASS_COLOR`.
- [x] `app/[locale]/news/archive/[year]/[month]/page.tsx:144` — same fix.
- [x] `packages/url-builder/src/index.ts:411` — `hreflangs()` entries array explicitly typed as `{ hreflang: string; href: string }[]` to allow `"x-default"`.
- [x] **TypeScript now reports 0 errors** (all pre-existing).

---

## Files touched

New:
- `apps/web/src/components/NewsletterSignup.tsx`
- `apps/web/src/components/BillingToggle.tsx`
- `TODO/SPRINT_2_40_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/investigations/page.tsx` — RSS badge footer per card
- `apps/web/src/app/[locale]/companies-near/page.tsx` — geo filter chips + searchParams
- `apps/web/src/app/[locale]/page.tsx` (home) — newsletter + partner strip
- `apps/web/src/app/[locale]/pricing/page.tsx` — billing toggle
- `apps/web/src/app/[locale]/datasets/page.tsx` — citation snippets
- `apps/web/src/app/[locale]/sources/page.tsx` — sort searchParam + chips
- `apps/web/src/app/[locale]/about/page.tsx` — Schema.org jsonLd
- `apps/web/src/messages/en/home.json` — newsletter + partner i18n keys
- `apps/web/src/messages/uk/home.json` — newsletter + partner i18n keys (UK)
- `apps/web/src/messages/en/marketing.json` — billing toggle + annual pricing keys
- `apps/web/src/messages/uk/marketing.json` — same for UK
- `apps/web/src/lib/investigations-seed.ts` — TS fix
- `apps/web/src/components/HeaderSearch.tsx` — TS fix
- `apps/web/src/app/[locale]/threats/[slug]/in/[country]/page.tsx` — TS fix
- `apps/web/src/app/[locale]/news/archive/[year]/[month]/[day]/page.tsx` — TS fix
- `apps/web/src/app/[locale]/news/archive/[year]/[month]/page.tsx` — TS fix
- `packages/url-builder/src/index.ts` — TS fix
- `TODO/pages/TODO_home.md` — 2 tasks closed
- `TODO/pages/TODO_pricing.md` — 1 task closed
- `TODO/pages/TODO_datasets.md` — 1 task closed
- `TODO/pages/TODO_sources_index.md` — 1 task closed
- `TODO/pages/TODO_about.md` — 1 task closed

---

## TODO bookkeeping
- `TODO/pages/TODO_home.md` — newsletter signup + logo strip closed; live ticker (via LiveTicker) marked done
- `TODO/pages/TODO_pricing.md` — monthly/annual toggle closed
- `TODO/pages/TODO_datasets.md` — citation snippet closed
- `TODO/pages/TODO_sources_index.md` — sortable closed
- `TODO/pages/TODO_about.md` — Schema.org closed

## Open follow-ups
- [ ] Methodology eval-results section (needs real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate YAML render against `redocly lint` in CI
- [ ] `/companies-near` world map: cluster overlapping pins
- [ ] Press page: downloadable press kit ZIP
- [ ] Sources page: source-health snapshot (last seen, latency) — needs real ingestion data
- [ ] Home: "As seen in" press mentions block (needs real press citations)
