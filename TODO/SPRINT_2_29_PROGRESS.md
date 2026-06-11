# Sprint 2.29 — Progress

**Theme:** OG images for the remaining index pages, per-locale Atom feed, home-page SearchAction JSON-LD, expanded `/api/health`, per-entity RSS.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### OG images for content pages (batch 4 — index pages)
- [x] `/equipment` — "Weapons systems and platforms catalogue"
- [x] `/conflicts` — "Tracked conflicts"
- [x] `/glossary` — "OSINT, conflict, and security terminology"
- [x] `/blog` — "Field briefs from Aegis Lens"
- [x] `/sources` — "Vetted public-source directory"
- [x] `/companies` — "Defence-industrial directory"
- [x] `/tools` — "OSINT, geospatial, and verification tools"
- [x] All seven via the shared `renderContentOG` factory introduced in 2.26.

### Per-locale Atom feed
- [x] `/[locale]/news/atom.xml` route emits Atom 1.0 with per-locale `xml:lang`, channel title, and localized entry summaries (`e.summary[locale] ?? e.summary.en`).
- [x] `urls.newsAtomLocale(locale)` helper added so other code can build the right path per locale (`/news/atom.xml` for EN canonical, `/{locale}/news/atom.xml` otherwise).

### SearchAction JSON-LD on the home page
- [x] Home page now renders a `@graph` of `WebSite` + `Organization`. The `WebSite` node includes a `SearchAction` with `target: /search?q={search_term_string}` and `query-input: required name=search_term_string` — the standard Google Sitelinks-Searchbox shape.

### Expanded `/api/health` JSON endpoint
- [x] Returns `status`, `service`, `version`, `ts`, `region`, `runtime`, plus a `data` block with event totals (`total`, `last24h`, `last7d`) and counts for sources/investigations/reports/threats.
- [x] `llm.anthropic` boolean reports whether the LLM key is wired up.
- [x] `Cache-Control: no-store, no-transform` so uptime probes always read fresh state; CORS allow-origin `*` so it can be polled from external dashboards.

### Per-entity RSS
- [x] `/entities/<slug>/feed.xml` aggregates the events whose IDs appear in `ENTITIES.relatedEventIds[]` plus investigations referenced via `relatedInvestigationSlugs[]`, sorted newest-first, channel-titled with the entity name.
- [x] `urls.entityFeed(slug)` helper added (EN canonical — root-level since middleware skips dot paths).
- [x] Entity detail page surfaces an "RSS feed →" link in the metadata bar when at least one event or investigation is attached.
- [x] Sitemap: emits feed URLs for every entity that has at least one related event or investigation.

---

## Files touched

New:
- `apps/web/src/app/[locale]/equipment/opengraph-image.tsx`
- `apps/web/src/app/[locale]/conflicts/opengraph-image.tsx`
- `apps/web/src/app/[locale]/glossary/opengraph-image.tsx`
- `apps/web/src/app/[locale]/blog/opengraph-image.tsx`
- `apps/web/src/app/[locale]/sources/opengraph-image.tsx`
- `apps/web/src/app/[locale]/companies/opengraph-image.tsx`
- `apps/web/src/app/[locale]/tools/opengraph-image.tsx`
- `apps/web/src/app/[locale]/news/atom.xml/route.ts`
- `apps/web/src/app/entities/[slug]/feed.xml/route.ts`

Edited:
- `apps/web/src/app/api/health/route.ts` — expanded payload + caching/CORS headers
- `apps/web/src/app/[locale]/page.tsx` — home `WebSite` + `Organization` JSON-LD with SearchAction
- `apps/web/src/app/[locale]/entities/[slug]/page.tsx` — RSS link in metadata bar
- `apps/web/src/app/sitemap.ts` — per-entity feed URLs
- `packages/url-builder/src/index.ts` — `urls.newsAtomLocale`, `urls.entityFeed`
- `TODO/SPRINT_2_28_PROGRESS.md` — closed 3 follow-ups (Atom locale, OG batch 4, SearchAction)

---

## TODO bookkeeping
- `TODO/SPRINT_2_28_PROGRESS.md` — per-locale Atom, OG batch 4, home SearchAction JSON-LD all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (the SSE stream is now ready to host it)
- [x] Per-entity feed: per-locale variant (currently EN canonical only) — ✓ Sprint 2.30 (`/[locale]/entities/<slug>/feed.xml`)
- [x] Surface RSS feed link on the entity index list (`/entities`) — currently only on detail pages — ✓ Sprint 2.30
- [x] OpenAPI / Swagger doc for `/api/health` so external monitors can validate the response shape — ✓ Sprint 2.30
- [x] cmd-K affordance hint in the home hero so first-time visitors discover the shortcut — ✓ Sprint 2.30
