# Sprint 2.30 — Progress

**Theme:** Per-locale entity RSS, RSS surfacing on the entities index, `/api/health` OpenAPI coverage, home hero cmd-K hint, entities-index OG image.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Per-locale per-entity RSS
- [x] `/[locale]/entities/<slug>/feed.xml` route emits locale-aware Atom-style RSS — event summaries, investigation titles, and category labels localized when translations exist.
- [x] Builder logic factored into `lib/entity-feed.ts` so the EN-canonical `/entities/<slug>/feed.xml` route and the locale-prefixed route share a single implementation.
- [x] `urls.entityFeedLocale(locale, slug)` helper added.
- [x] Entity detail page registers a feed `<link rel="alternate" type="application/rss+xml">` via `buildMetadata({ feeds: [...] })` for browser feed-reader autodiscovery — but only when the entity actually has events or investigations attached.

### RSS surfacing on `/entities`
- [x] Each entity card in the knowledge-graph index now renders a small "RSS" link in the bottom-right corner — only when at least one event or investigation is attached, mirroring the detail-page rule.
- [x] Uses the per-locale helper so UK visitors get the UK feed.

### OpenAPI coverage for `/api/health`
- [x] Added a new `ops` tag and `/api/health` path entry to `/api/openapi.json`.
- [x] Schema covers `status`, `service`, `version`, `ts`, `region`, `runtime`, the nested `data.events` block (`total`, `last24h`, `last7d`), `data.{sources,investigations,reports,threats}` counts, and `llm.anthropic` boolean.
- [x] Description spells out the probe-pattern contract: response is always 200, consumers must check `status === "ok"` AND the HTTP code.

### cmd-K affordance hint on the home hero
- [x] Below the primary/secondary CTAs, the hero now reads: "Press ⌘K or / to search anywhere" — styled as muted monospace with `<kbd>` rendering for the keys. First-time visitors now discover the shortcut without having to hunt for the small button in the header.

### OG image for `/entities`
- [x] `/[locale]/entities/opengraph-image.tsx` via the shared `renderContentOG` factory.

---

## Files touched

New:
- `apps/web/src/lib/entity-feed.ts`
- `apps/web/src/app/[locale]/entities/[slug]/feed.xml/route.ts`
- `apps/web/src/app/[locale]/entities/opengraph-image.tsx`
- `TODO/SPRINT_2_30_PROGRESS.md`

Edited:
- `apps/web/src/app/entities/[slug]/feed.xml/route.ts` — collapsed to call `buildEntityRssFeed`
- `apps/web/src/app/[locale]/entities/page.tsx` — RSS link per card
- `apps/web/src/app/[locale]/entities/[slug]/page.tsx` — feed `<link rel="alternate">` in metadata
- `apps/web/src/app/[locale]/page.tsx` — cmd-K hero hint
- `apps/web/src/app/api/openapi.json/route.ts` — `/api/health` path + `ops` tag
- `packages/url-builder/src/index.ts` — `urls.entityFeedLocale`
- `TODO/SPRINT_2_29_PROGRESS.md` — closed 4 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_29_PROGRESS.md` — per-locale entity RSS, entity index feed link, `/api/health` OpenAPI, cmd-K hero hint all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (the SSE stream is now ready to host it)
- [x] Per-locale entity feed entries in the sitemap (only EN canonical is listed right now) — ✓ Sprint 2.31
- [x] Atom 1.0 variant of the per-entity feed (currently RSS 2.0 only) — ✓ Sprint 2.31
- [x] Document remaining `/api/*` endpoints (`/api/copilot`, `/api/copilot/stream`, `/api/topics`, `/api/glossary`, `/api/equipment`, `/api/regions`, `/api/search/suggest`) in OpenAPI — ✓ Sprint 2.31
- [x] cmd-K hint A/B: also surface it inline next to the header search button for users who scroll past the hero immediately — ✓ Sprint 2.31 (⌘K kbd chip on the collapsed trigger, hidden on mobile via `sm:inline`)
