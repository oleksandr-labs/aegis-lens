# Sprint 1.9 — Progress

**Theme:** Public JSON API + content surface expansion (methodology, API docs, incidents hub, security, changelog, DMCA, cookies, OG images for new entities).

**Date:** 2026-05-24

**Method:** 5 parallel agents on non-overlapping file surface.

---

## Delivered

### Public JSON API (rate-limited, CORS-open)
- [x] `GET /api/events` — query: `country`, `class` (repeatable), `since` (ISO), `limit` (≤200, default 50). Returns `{ data, meta: { count, total } }`.
- [x] `GET /api/sources` — full PUBLIC_SOURCES list.
- [x] `GET /api/reports` — query: `limit` (default 20). Body trimmed (no full markdown).
- [x] All 60 req/min/IP via `rateLimit()`, `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=60, stale-while-revalidate=300`.

### Content pages
- [x] `/incidents` — high-severity hub (dangerScore ≥ 70, confidence ≥ 0.7, last 90d), grouped by class, CollectionPage JSON-LD.
- [x] `/methodology` — source tiering, confidence scoring, verification workflow, danger model, geolocation classes. TechArticle JSON-LD.
- [x] `/docs/api` — endpoint reference with parameter tables + curl examples. TechArticle JSON-LD.
- [x] `/changelog` — 9 entries Sprint 0 → 1.8. Article JSON-LD.
- [x] `/security` — disclosure policy, scope, safe harbor, PGP placeholder.
- [x] `/legal/dmca` — takedown procedure (noindex).
- [x] `/legal/cookies` — expanded from stub (noindex).

### OpenGraph images
- [x] `/sources/<slug>/opengraph-image` — source name, tier, reliability, country.
- [x] `/reports/<slug>/opengraph-image` — localized title, kind, date, citation count.
- [x] `/regions/<country>/<oblast>/<city>/opengraph-image` — city, oblast, flag, population, coords.
- [x] All three include Satori safety (explicit display:flex, no background shorthand, concatenated children).

### Plumbing
- [x] `urls.incidents`, `urls.methodology`, `urls.docsApi`, `urls.changelog`, `urls.security`, `urls.legalDmca`, `urls.legalCookies` added to `@aegis/url-builder`.
- [x] Sitemap emits new routes (+5 marketing entries × hreflang).
- [x] Footer Resources column gets `Incidents`; Legal column gets `DMCA`, `Cookies`, `Security`, `Methodology`, `API`, `Changelog`.

### Bug fix during integration
- [x] Three new pages (`/methodology`, `/incidents`, `/docs/api`) initially shipped with `dynamicParams = false` + `generateStaticParams` excluding EN. Middleware rewrites `/foo` → `/en/foo`, so EN was 404. Removed `dynamicParams = false` to match the home-page convention.

---

## Smoke tests

```
200  /incidents
200  /uk/incidents
200  /methodology
200  /uk/methodology
200  /docs/api
200  /uk/docs/api
200  /changelog
200  /security
200  /legal/dmca
200  /legal/cookies
200  /api/events
200  /api/events?country=ua&class=cyber&limit=5
200  /api/sources
200  /api/reports
200  /sources/alerts-in-ua/opengraph-image
200  /reports/weekly-ua-2026-w21/opengraph-image
200  /regions/ua/donetsk-oblast/mariupol/opengraph-image
200  /sitemap.xml
```

---

## Open follow-ups
- [x] `/incidents`: link region badge once reverse-geocode is available ✓ Sprint 2.6 (bbox-based oblast lookup via `lib/region-lookup.ts`)
- [x] `/api/events`: paginate via `cursor` once DB lands ✓ Sprint 2.6 (cursor scheme works on seed; ports cleanly to DB later)
- [ ] `/docs/api`: add OpenAPI 3.1 JSON download endpoint
- [ ] `/methodology`: localize UK body
- [ ] `/security`: replace PGP placeholder with real key
- [ ] OG images: add timestamp watermark for cache-bust visibility
