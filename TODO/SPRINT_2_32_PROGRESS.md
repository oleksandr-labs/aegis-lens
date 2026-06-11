# Sprint 2.32 — Progress

**Theme:** JSON Feed 1.1 for news + per-entity feeds, OpenAPI 3.1 YAML rendering, docs/api YAML link.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### JSON Feed 1.1 (`application/feed+json`)
- [x] `/news/feed.json` (EN canonical) and `/[locale]/news/feed.json` per-locale.
- [x] `/entities/<slug>/feed.json` (EN) and `/[locale]/entities/<slug>/feed.json` per-locale.
- [x] `buildEntityJsonFeed(slug, locale, selfPath)` factored into `lib/entity-feed.ts` alongside the RSS + Atom builders — all three share `collectEntries`.
- [x] News page metadata + entity detail metadata register `<link rel="alternate" type="application/feed+json">` so JSON Feed clients (NetNewsWire, FeedLand, Inoreader) autodiscover.
- [x] Sitemap emits both news JSON Feed and per-entity JSON Feed URLs, EN canonical plus per-locale.
- [x] `seo.ts` `buildMetadata` `feeds[]` type union extended to include `application/feed+json`.
- [x] URL helpers added: `urls.newsJson`, `urls.newsJsonLocale`, `urls.entityJson`, `urls.entityJsonLocale`.

### OpenAPI 3.1 YAML
- [x] `SPEC` exported from `/api/openapi.json` so other endpoints can reuse it without duplication.
- [x] `/api/openapi.yaml` route serializes `SPEC` via a small dependency-free YAML emitter (handles strings/numbers/booleans/null/arrays/plain objects — everything the spec uses). Quoting is conservative so codegen tools accept it.
- [x] `/docs/api` page now links to both `OpenAPI 3.1 (JSON)` and `OpenAPI 3.1 (YAML)`.

### Redoc viewer follow-up
- [x] Confirmed `/docs/api/explorer` already renders the OpenAPI spec via Redoc — closed the standing 2.31 follow-up rather than duplicate work.

---

## Files touched

New:
- `apps/web/src/app/news/feed.json/route.ts`
- `apps/web/src/app/[locale]/news/feed.json/route.ts`
- `apps/web/src/app/entities/[slug]/feed.json/route.ts`
- `apps/web/src/app/[locale]/entities/[slug]/feed.json/route.ts`
- `apps/web/src/app/api/openapi.yaml/route.ts`
- `TODO/SPRINT_2_32_PROGRESS.md`

Edited:
- `apps/web/src/lib/entity-feed.ts` — `buildEntityJsonFeed`
- `apps/web/src/lib/seo.ts` — `feeds[]` accepts `application/feed+json`
- `apps/web/src/app/[locale]/news/page.tsx` — JSON Feed alternate
- `apps/web/src/app/[locale]/entities/[slug]/page.tsx` — JSON Feed alternate
- `apps/web/src/app/sitemap.ts` — JSON Feed URLs (news + per-entity, EN + per-locale)
- `apps/web/src/app/[locale]/docs/api/page.tsx` — YAML link in the resources strip
- `apps/web/src/app/api/openapi.json/route.ts` — export `SPEC`
- `packages/url-builder/src/index.ts` — JSON Feed helpers
- `TODO/SPRINT_2_31_PROGRESS.md` — closed 3 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_31_PROGRESS.md` — Redoc viewer (already shipped), JSON Feed variant, OpenAPI YAML all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary infrastructure (the SSE stream is now ready to host it)
- [x] Atom self-link on home-page autodiscovery (carry-forward from 2.31) — ✓ Sprint 2.33 (home metadata now lists RSS + Atom + JSON Feed alternates)
- [x] JSON Feed variant for `/topics/<slug>/feed.xml` too — currently only news + entity have a JSON variant — ✓ Sprint 2.33
- [x] Add `_aegis` extension namespace to JSON Feed items (danger score, verification state) so power consumers don't have to parse `content_text` — ✓ Sprint 2.33 (news + topic + per-entity)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
