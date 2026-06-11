# Sprint 1.8 — Progress

**Theme:** Programmatic SEO expansion + ops surface — public Sources directory, Reports hub, per-topic RSS feeds, admin sub-pages, 15 additional cities.

**Dates:** shipped 2026-05-23 / 2026-05-24

---

## Delivered

### Programmatic SEO
- [x] `/sources` index + `/sources/<slug>` per-source page (10 PUBLIC_SOURCES seeded: alerts.in.ua, deepstatemap, oryx, isw, ukrenergo, cert-ua, sentinel-2, bellingcat, hajun-bypol, un-ocha)
- [x] `/reports` listing + `/reports/<slug>` detail (5 bilingual reports: weekly, incident, regional, trend, methodology)
- [x] schema.org `Organization` JSON-LD on source detail; `Article` + `BreadcrumbList` on report detail
- [x] reliability bar UI on source detail

### Syndication
- [x] Per-event-class RSS feeds at `/topics/<class>/feed.xml` + `/uk/topics/<class>/feed.xml`
- [x] Root-level EN handler at `app/topics/[slug]/feed.xml/route.ts` (middleware skips dot paths)
- [x] `buildRssFeedFiltered()` helper added to `lib/rss.ts`

### Cities expansion (admin-2)
- [x] +15 cities (UA: Mariupol, Kryvyi Rih, Vinnytsia, Poltava, Ivano-Frankivsk; PL: Wrocław, Katowice, Lublin, Białystok, Szczecin; DE: Stuttgart, Düsseldorf, Leipzig, Dresden, Hanover)
- [x] Total cities: **35** (UA 15 + PL 10 + DE 10)

### Admin
- [x] `/admin/sources` — moderation queue placeholder
- [x] `/admin/queue` — review queue
- [x] `/admin/users` — user management
- [x] `/admin/flags` — feature flag toggles
- [x] All four gated by `isAdminAuthenticated()`

### Plumbing
- [x] `urls.reports`, `urls.report`, `urls.sources`, `urls.source`, `urls.topicFeed`, `urls.newsFeed` added to `@aegis/url-builder`
- [x] Sitemap now emits: reports index, per-report, sources index, per-source, news feed, per-topic feeds (≈ +25 URLs)
- [x] Footer `Resources` column links to `/reports` and `/sources`

---

## Smoke tests (all 200 unless noted)

```
200  /sources
200  /uk/sources
200  /sources/alerts-in-ua
200  /reports
200  /uk/reports
200  /reports/weekly-ua-2026-w21
200  /admin/sources
200  /admin/queue
200  /admin/users
200  /admin/flags
200  /topics/cyber/feed.xml
200  /uk/topics/cyber/feed.xml
200  /topics/military_action/feed.xml
404  /topics/notreal/feed.xml   ← intentional
200  /regions/ua/donetsk-oblast/mariupol
200  /regions/pl/dolnoslaskie/wroclaw
200  /regions/de/bayern/munich
200  /sitemap.xml
```

---

## Open follow-ups

- [ ] Sources detail: pull live reputation score from DB once ingest lands
- [x] Reports: per-region cross-link blocks ✓ Sprint 2.6 (derived from cited events via bbox lookup, oblast-first with country fallback)
- [ ] Admin sub-pages: replace placeholder data with live queries when DB is wired
- [ ] Localize report bodies for UK (currently bilingual headers, EN-leaning body)
