# Sprint 1.3 — DONE (programmatic SEO hubs + dynamic OG + sparkline)

> Live on http://localhost:5454. Continues from `SPRINT_1_2_PROGRESS.md`.

## Headline
Four new programmatic surfaces shipped: `/entities`, `/news` (paginated), `/topics/<slug>` (per-class hubs),
dynamic per-event OG images. Region pages now show events-per-hour sparkline.
Sitemap grew from 41 → 54 URLs.

## Done

### `/entities` (KG view)
- [x] Aggregates equipment + conflicts + glossary in one index
- [x] schema.org `CollectionPage` (in header layout)
- [x] hreflang per locale

### `/news` (paginated archive)
- [x] All seed events sorted by `occurredAt` desc
- [x] 12 per page, `?page=N` query param
- [x] `rel=prev/next` pagination
- [x] schema.org `CollectionPage` with `NewsArticle` parts
- [x] Each row links to event detail

### `/topics` + `/topics/<slug>` (per-event-class hubs)
- [x] Index with all 10 classes, event counts
- [x] Per-class detail page with sorted events, "Open on live map" deep-link
- [x] schema.org `CollectionPage`
- [x] `dynamicParams = false` — unknown slugs → 404 (verified UK)
- [x] All locales pre-built

### Per-event OG image
- [x] `apps/web/src/app/[locale]/events/[id]/opengraph-image.tsx`
- [x] Edge runtime, 1200×630 PNG
- [x] Class-colored dot + class label + title + severity/danger/confidence/verification
- [x] Verified: returns 113KB image/png
- [x] Fixed root `opengraph-image.tsx` Satori CSS issue (`background:` shorthand → `backgroundColor` + `backgroundImage`)

### Sparkline (server-rendered SVG)
- [x] `<EventsPerHourSparkline events={...} hours={24} />`
- [x] No client JS, pure SVG
- [x] Buckets events into per-hour bars, peak labeled
- [x] Hour ticks every 6h
- [x] Used on every region page

### URL builder
- [x] `urls.entities`, `urls.news(page?)`, `urls.topic`, `urls.topics`

### Sitemap
- [x] Added /entities, /news, /topics, /topics/<each-class>
- [x] 54 URLs total

### Footer
- [x] Added News archive + Topics + Entities links

## Verification

```bash
curl -I http://localhost:5454/entities              # 200
curl -I http://localhost:5454/news?page=2           # 200
curl -I http://localhost:5454/topics                # 200
curl -I http://localhost:5454/topics/cyber          # 200
curl -I http://localhost:5454/uk/topics/drones      # 404 (unknown class)

curl -o og.png http://localhost:5454/events/01HXDNIPRO001/opengraph-image
file og.png   # PNG 1200x630
```

## Files added / changed

### Added
- `apps/web/src/app/[locale]/entities/page.tsx`
- `apps/web/src/app/[locale]/news/page.tsx`
- `apps/web/src/app/[locale]/topics/page.tsx`
- `apps/web/src/app/[locale]/topics/[slug]/page.tsx`
- `apps/web/src/app/[locale]/events/[id]/opengraph-image.tsx`
- `apps/web/src/components/Sparkline.tsx`

### Changed
- `packages/url-builder/src/index.ts` — entities, news, topic helpers
- `apps/web/src/app/[locale]/regions/[country]/page.tsx` — Sparkline
- `apps/web/src/app/sitemap.ts` — new routes + topic hubs
- `apps/web/src/app/opengraph-image.tsx` — Satori CSS fix
- `apps/web/src/components/Footer.tsx` — news/topics/entities links

## Sprint 1.4 candidates
- Real Postgres + PostGIS via docker-compose + Drizzle
- Per-event share permalink button (copy-to-clipboard with hreflang-aware URL)
- Cluster markers (supercluster) for the map
- Real Anthropic API when `ANTHROPIC_API_KEY` set
- Real auth (WorkOS / Clerk)
- Per-locale slugs (translated, with redirect)
- /admin route group (auth-gated)
