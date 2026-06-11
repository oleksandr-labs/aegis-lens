# Sprint 2.31 — Progress

**Theme:** Atom 1.0 per-entity feed, per-locale entity feeds in the sitemap, OpenAPI coverage for the rest of `/api/*`, ⌘K affordance on the header search button.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Atom 1.0 per-entity feed
- [x] `/entities/<slug>/atom.xml` (EN canonical) and `/[locale]/entities/<slug>/atom.xml` (per-locale) both available alongside the existing RSS routes.
- [x] `buildEntityAtomFeed(slug, locale, selfPath)` factored into `lib/entity-feed.ts` next to the RSS builder; both share a single `collectEntries` helper so they always stay in sync.
- [x] Entity detail-page metadata registers BOTH `application/rss+xml` and `application/atom+xml` alternates when the entity has events or investigations attached. Feed readers can autodiscover whichever wire format they prefer.

### Sitemap surfacing
- [x] Sitemap now emits both RSS and Atom URLs for every entity that has events or investigations — EN canonical at full priority plus per-locale variants at a slightly lower priority.
- [x] Helpers added: `urls.entityAtom(slug)`, `urls.entityAtomLocale(locale, slug)`.

### OpenAPI: cover the rest of `/api/*`
- [x] Documented six previously undocumented endpoints: `/api/topics`, `/api/glossary`, `/api/equipment`, `/api/regions`, `/api/search/suggest`, `/api/copilot`, `/api/copilot/stream`.
- [x] Added three new OpenAPI tags: `reference` (static lookup data), `search`, `copilot`.
- [x] SSE wire-shape for `/api/copilot/stream` documented as `text/event-stream` returning `stats` / `delta` / `citation` / `done` events — consumers building UIs can now generate clients straight from the spec.

### ⌘K affordance on the header search button
- [x] The collapsed header search trigger renders a small `⌘K` `<kbd>` chip next to the magnifier icon — hidden on `<sm` screens to keep the mobile header tight.
- [x] `aria-keyshortcuts="Control+K Meta+K /"` set on the trigger so assistive tech announces the shortcut.
- [x] Visitors who scroll past the home hero (where the existing hint lives) still see a constant in-header reminder.

---

## Files touched

New:
- `apps/web/src/app/entities/[slug]/atom.xml/route.ts`
- `apps/web/src/app/[locale]/entities/[slug]/atom.xml/route.ts`
- `TODO/SPRINT_2_31_PROGRESS.md`

Edited:
- `apps/web/src/lib/entity-feed.ts` — `collectEntries` helper + `buildEntityAtomFeed`
- `apps/web/src/app/[locale]/entities/[slug]/page.tsx` — RSS + Atom alternates
- `apps/web/src/app/sitemap.ts` — Atom + per-locale entity feed URLs
- `apps/web/src/app/api/openapi.json/route.ts` — six new path entries + three tags
- `apps/web/src/components/HeaderSearch.tsx` — ⌘K kbd chip on collapsed trigger, ARIA keyshortcuts
- `packages/url-builder/src/index.ts` — `urls.entityAtom`, `urls.entityAtomLocale`
- `TODO/SPRINT_2_30_PROGRESS.md` — closed 4 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_30_PROGRESS.md` — Atom entity feed, per-locale sitemap surfacing, full `/api/*` OpenAPI coverage, header ⌘K hint all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (the SSE stream is now ready to host it)
- [x] Swagger / Redoc viewer page at `/docs/api` rendering `/api/openapi.json` for human browsing — ✓ Sprint 2.32 (already shipped at `/docs/api/explorer` with Redoc; `/docs/api` now also links to YAML)
- [ ] Atom self-link on the home-page autodiscovery (currently only the news/feed/atom pair surfaces — add SearchEngine `<link>` if/when search itself gets a feed)
- [x] `application/feed+json` (JSON Feed 1.1) variant of news + per-entity feeds for stacks that prefer JSON over XML — ✓ Sprint 2.32
- [x] OpenAPI spec exposed under `/docs/openapi.yaml` (YAML) in addition to JSON, for tools that parse YAML by default — ✓ Sprint 2.32 (served from `/api/openapi.yaml`)
