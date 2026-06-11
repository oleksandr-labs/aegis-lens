# Sprint 2.28 — Progress

**Theme:** Five more content-page OGs, cmd-K hotkey, `/api/copilot/stream` SSE, Atom feed for news.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### OG images for content pages (batch 3)
- [x] `/help` — "Aegis Lens help center"
- [x] `/contact` — "Reach the Aegis Lens team"
- [x] `/datasets` — "Open data from Aegis Lens"
- [x] `/integrations` — "Connect Aegis Lens to your stack"
- [x] `/cookbook` — "Recipes for the Aegis Lens API"
- [x] All five via the shared `renderContentOG` factory introduced in 2.26.

### `HeaderSearch` cmd-K / ctrl-K hotkey
- [x] cmd+K (mac) / ctrl+K (windows) now opens the search palette anywhere, including when focus is in an input or textarea — the SaaS standard.
- [x] `/` continues to work as a no-modifier shortcut when focus is NOT in an input.
- [x] Trigger button title updated to "⌘K or /".

### `/api/copilot/stream` SSE variant
- [x] POST endpoint returning `text/event-stream`. Same body shape as `/api/copilot` (`prompt`, `country?`, `hours?`).
- [x] Events:
  - `stats` — deterministic statistics block (event count, top class, avg danger) sent immediately
  - `delta` — text chunks (~24 chars, word-boundary safe) for progressive rendering
  - `citation` — cited event IDs at the end
  - `done` — terminator with provider + model
- [x] Rate limit: 10 streams / min / IP (vs 20/min on the non-stream endpoint).
- [x] Honest fallback: when `ANTHROPIC_API_KEY` is absent the underlying `generate()` returns fake-mode text; the route still streams the chunks so consumers can develop the UX against the SSE wire shape.
- [x] Headers include `x-accel-buffering: no` so reverse proxies (nginx, Vercel) don't buffer the stream.

### Atom 1.0 feed (`/news/atom.xml`)
- [x] Side-by-side with the existing RSS feed at `/news/feed.xml`. Atom is preferred by some research / academic stacks for its stable `<id>` and `<updated>` semantics.
- [x] `urls.newsAtom()` helper added.
- [x] News page metadata now exposes both feeds via `<link rel="alternate" type="application/rss+xml">` and `<link rel="alternate" type="application/atom+xml">` for browser feed-reader autodiscovery.
- [x] `buildMetadata({ feeds: [...] })` extended to accept feed alternate-types; future per-locale pages can opt in similarly.

### Plumbing
- [x] Sitemap: `/news/atom.xml` added.

---

## Files touched

New:
- `apps/web/src/app/[locale]/help/opengraph-image.tsx`
- `apps/web/src/app/[locale]/contact/opengraph-image.tsx`
- `apps/web/src/app/[locale]/datasets/opengraph-image.tsx`
- `apps/web/src/app/[locale]/integrations/opengraph-image.tsx`
- `apps/web/src/app/[locale]/cookbook/opengraph-image.tsx`
- `apps/web/src/app/api/copilot/stream/route.ts`
- `apps/web/src/app/news/atom.xml/route.ts`

Edited:
- `apps/web/src/components/HeaderSearch.tsx` — cmd+K / ctrl+K hotkey + title hint
- `apps/web/src/lib/seo.ts` — `feeds[]` option on `buildMetadata`
- `apps/web/src/app/[locale]/news/page.tsx` — RSS + Atom feed alternates wired
- `packages/url-builder/src/index.ts` — `urls.newsAtom()`
- `apps/web/src/app/sitemap.ts` — Atom URL
- `TODO/SPRINT_2_27_PROGRESS.md` — cmd-K + content-OG follow-ups ticked ✓ Sprint 2.28

---

## TODO bookkeeping
- `TODO/SPRINT_2_27_PROGRESS.md` — content-OG batch 3 + cmd-K shortcut closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (the SSE stream is now ready to host it)
- [x] Per-locale Atom feeds (`/[locale]/news/atom.xml`) — ✓ Sprint 2.29
- [x] OG images for `/equipment`, `/conflicts`, `/glossary`, `/blog`, `/sources`, `/companies`, `/tools` (next batch — the rest of the index pages) — ✓ Sprint 2.29
- [x] Wire `HeaderSearch` SearchAction JSON-LD on the home page so search engines can suggest direct searches — ✓ Sprint 2.29 (home page now emits `websiteJsonLd()` + `organizationJsonLd()`; the WebSite node includes a SearchAction targeting `/search?q={search_term_string}`)
