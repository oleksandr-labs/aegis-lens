# Sprint 1.6 — DONE (58 admin-1 + RSS feed + event GET API)

> Live on http://localhost:5454. Continues from `SPRINT_1_5_PROGRESS.md`.

## Headline
Admin-1 coverage extended to **all 3 active countries**: 26 UA oblasts + 16 PL voivodeships
+ 16 DE Bundesländer = **58 admin-1 pages**, each with localized name, capital, bbox,
events filter, sparkline, mini-map, sibling cross-links. RSS 2.0 feed for newsrooms.
`/api/events/<id>` GET endpoint.

## Done

### Admin-1: PL voivodeships + DE Bundesländer
- [x] 16 PL voivodeships (Mazowieckie → Opolskie) with PL/EN names
- [x] 16 DE Bundesländer (Berlin → Thüringen) with DE/EN names
- [x] All entries: capital, [lon,lat] center, [W,S,E,N] bbox
- [x] Schema generalized: `kindLabel` ("Oblast" / "Voivodeship" / "Bundesland")
- [x] `OblastSeed.iso2` widened from `"ua"` → `"ua" | "pl" | "de"`
- [x] Page eyebrow + "Other {kind}s" section uses dynamic label
- [x] Country page renders correct admin-1 grid label per country
- [x] `generateStaticParams` iterates all 3 countries (58 × 2 locales = 116 builds)
- [x] Verified: all 32 PL+DE slugs return HTTP 200
- [x] Verified: invalid slugs return 404

### RSS feed
- [x] `/news/feed.xml` route (root, NOT under [locale])
- [x] RSS 2.0 + atom:link self-reference
- [x] Last 50 events sorted by `occurredAt` desc
- [x] Per-item: title, link (event detail permalink), guid, pubDate, description, category
- [x] Description includes class/subclass + danger + confidence + verification
- [x] Cache: 5min + stale-while-revalidate 15min
- [x] XML-escaped output
- [x] Middleware passes through (matched dot-suffix exclusion)

### Event detail API
- [x] `/api/events/<id>` GET endpoint
- [x] Returns `{ data: AegisEvent, meta }` envelope
- [x] 404 with `{ error: "event_not_found", id }` on unknown
- [x] Cache 30s + SWR 120s

### Sitemap
- [x] Grew 81 → 113 URLs (added 16 PL + 16 DE admin-1)

## Verification

```bash
# All admin-1 routes:
for c in ua pl de; do
  curl -s -o /dev/null -w "$c %{http_code}\n" "http://localhost:5454/regions/$c"
done

# 32 new admin-1 pages all 200
curl -s http://localhost:5454/regions/pl/mazowieckie | head -c 100
curl -s http://localhost:5454/regions/de/bayern | head -c 100

# RSS
curl -s http://localhost:5454/news/feed.xml | head -c 400
# <?xml version="1.0" encoding="UTF-8"?>
# <rss version="2.0">…

# Event API
curl -s http://localhost:5454/api/events/01HXDNIPRO001 | head -c 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5454/api/events/bad-id  # 404
```

## Files added

- `apps/web/src/app/api/events/[id]/route.ts`
- `apps/web/src/app/news/feed.xml/route.ts`

## Files changed

- `apps/web/src/lib/oblasts-seed.ts` — type widened, +32 entries (PL + DE)
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/page.tsx` — generateStaticParams iterates 3 countries, eyebrow uses kindLabel
- `apps/web/src/app/[locale]/regions/[country]/page.tsx` — admin-1 grid label per country
- `apps/web/src/app/sitemap.ts` — iterate UA + PL + DE for admin-1

## Sprint 1.7 candidates
- Real Auth.js with magic-link (Resend env var)
- Drizzle + Postgres migration runs (requires docker compose up)
- Per-locale slug aliases with 301
- News feed per-locale (`/uk/news/feed.xml`)
- City-level (admin-2) for top UA cities + Warsaw + Berlin
- Per-event subscribe-to-similar email digest
- API rate limiting via Redis
- Image proxy / OG cache via S3 / MinIO
