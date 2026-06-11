# Sprint 1.7 — DONE (admin-2 cities · UK feed · API rate limiting)

> Live on http://localhost:5454. Continues from `SPRINT_1_6_PROGRESS.md`.

## Headline
**Admin-2 city pages** ship in hierarchical URLs `/regions/<iso2>/<oblast>/<city>` for
10 UA cities + 5 PL + 5 DE = **20 cities**, each with schema.org `City` + breadcrumb
trail. UK locale gets its own RSS feed. API copilot now rate-limited (20/min/IP)
with standard X-RateLimit-* headers.

## Done

### Admin-2 city pages
- [x] `apps/web/src/lib/cities-seed.ts` — 20 cities (10 UA + 5 PL + 5 DE)
- [x] Per-city: iso2, oblastSlug, slug, name (EN + local), center, population, capital flag
- [x] `/regions/[country]/[oblast]/[city]/page.tsx` route
- [x] schema.org `City` + `BreadcrumbList` (3-level: country → oblast → city) JSON-LD
- [x] KPI strip (events, severity, top class, slug)
- [x] EventsPerHourSparkline scoped to ~30km radius around city center
- [x] MiniMap centered on city, zoom 10
- [x] Recent events list + "capital" badge on oblast capitals
- [x] Sibling cities cross-links
- [x] Three-segment breadcrumb nav
- [x] `dynamicParams = false` → 404 on unknown slug (verified)
- [x] Oblast page now shows cities grid linking to city pages

### UK locale RSS feed
- [x] `apps/web/src/lib/rss.ts` — extracted `buildRssFeed(locale, selfPath)`
- [x] `/news/feed.xml` (EN canonical at root)
- [x] `/uk/news/feed.xml` under `[locale]` segment
- [x] Per-locale event titles, channel title localized
- [x] Atom self-link points to locale-correct URL
- [x] Verified: EN 7.8KB, UK 8.7KB (larger because Cyrillic UTF-8)

### API rate limiter
- [x] `lib/rate-limit.ts` — in-memory sliding-window
- [x] `identifyRequest()` reads X-Forwarded-For / X-Real-IP / falls back to "anonymous"
- [x] `/api/copilot` limited to 20 req/min per IP
- [x] 429 with `Retry-After` + structured `{ error, message }` body
- [x] `X-RateLimit-Limit` / `Remaining` / `Reset` headers on every copilot response
- [x] GC of expired buckets every 60s
- [x] Verified: response headers show `limit=20, remaining=19, reset=60`
- [x] Sprint 2 swaps for Redis-backed implementation

### Sitemap
- [x] Grew 113 → 133 URLs (added 20 city URLs)

## Verification

```bash
# Cities
curl -I http://localhost:5454/regions/ua/kharkiv-oblast/kharkiv     # 200
curl -I http://localhost:5454/regions/pl/mazowieckie/warsaw         # 200
curl -I http://localhost:5454/regions/de/bayern/munich              # 200
curl -I http://localhost:5454/regions/ua/kyiv-city/bad-city         # 404

# Feeds (per-locale)
curl http://localhost:5454/news/feed.xml | head -c 300
curl http://localhost:5454/uk/news/feed.xml | head -c 300

# Rate limit
curl -i -X POST -H 'content-type: application/json' \
  -d '{}' http://localhost:5454/api/copilot | grep X-RateLimit
# X-RateLimit-Limit: 20
# X-RateLimit-Remaining: 19
# X-RateLimit-Reset: 60
```

## Files added

- `apps/web/src/lib/cities-seed.ts`
- `apps/web/src/lib/rate-limit.ts`
- `apps/web/src/lib/rss.ts`
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/[city]/page.tsx`
- `apps/web/src/app/[locale]/news/feed.xml/route.ts`

## Files changed

- `apps/web/src/app/news/feed.xml/route.ts` — now uses `buildRssFeed("en", …)`
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/page.tsx` — Cities grid section
- `apps/web/src/app/api/copilot/route.ts` — rate-limit + headers
- `apps/web/src/app/sitemap.ts` — added 20 city URLs

## Sprint 1.8 candidates
- Real Auth.js with magic-link + Resend
- Redis-backed rate limiter (replace in-memory)
- City-level OG image template
- More cities (admin-2 expansion: Donetsk, Zaporizhzhia, Mariupol, more Polish cities, Frankfurt etc.)
- Per-event `/uk/news/feed.xml` already shipped — add per-class feeds (`/topics/<slug>/feed.xml`)
- Real ingestion from DeepStateMAP / Oryx / alerts.in.ua
