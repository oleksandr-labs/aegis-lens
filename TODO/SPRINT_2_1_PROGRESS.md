# Sprint 2.1 — Progress

**Theme:** API surface expansion + side-by-side comparison + iframe widgets + well-known files.

**Date:** 2026-05-24

**Method:** 5 parallel agents.

---

## Delivered

### Public JSON API (4 new endpoints — all 60 req/min/IP, CORS-open)
- [x] `GET /api/regions[?country=ua]` — flattened oblasts with bbox.
- [x] `GET /api/equipment` — equipment catalog.
- [x] `GET /api/glossary[?q=]` — filtered glossary.
- [x] `GET /api/topics` — event classes with recent counts.

### /compare
- [x] `/compare?oblasts=ua:donetsk-oblast,ua:kharkiv-oblast,...` — side-by-side table for up to 4 oblasts. Rows: capital, center, events, avg danger, top 3 classes, latest 3 events, link to detail.
- [x] Empty state renders a checkbox picker that builds the query.
- [x] schema.org `CollectionPage` with Place items.

### Embed widgets (no chrome — minimal `app/embed/layout.tsx`)
- [x] `/embed/feed?country=&class=&theme=` — last 10 events compact list.
- [x] `/embed/incidents` — top 10 high-severity, card view.
- [x] `/embed/stats` — 2×2 KPI grid.
- [x] All `noindex`; "powered by Aegis Lens" footer with `target="_top"`.

### Well-known / discovery files (all 200)
- [x] `/opensearch.xml` — browser search engine descriptor.
- [x] `/.well-known/security.txt` — RFC 9116.
- [x] `/humans.txt` — TEAM / THANKS / SITE.
- [x] `/manifest.webmanifest` — PWA-lite manifest. **Deleted old `manifest.ts`** (Next metadata-file route) to avoid collision with the new explicit route handler.
- [x] `/apple-app-site-association` — stub for future iOS app.

### Glossary expansion
- [x] `GLOSSARY` in `seed-data.ts` grew from 3 to **38 entries** — bilingual `en`/`uk` across OSINT, military, infra/cyber, verification, humanitarian, maritime, geospatial clusters.

### Middleware fix
- [x] Excluded `/embed/*`, `/.well-known/*`, `/apple-app-site-association` from locale-rewrite (otherwise they'd 404 routing through `[locale]`).

### Plumbing
- [x] `urls.compare(locale, oblasts?)` added.
- [x] Sitemap entry for `/compare`.
- [x] Footer Resources column: `Compare`.

---

## Smoke tests

```
200  /api/regions
200  /api/regions?country=ua
200  /api/equipment
200  /api/glossary
200  /api/glossary?q=osint
200  /api/topics
200  /compare
200  /compare?oblasts=ua:donetsk-oblast,ua:kharkiv-oblast
200  /embed/feed
200  /embed/incidents
200  /embed/stats
200  /opensearch.xml
200  /.well-known/security.txt
200  /humans.txt
200  /manifest.webmanifest
200  /apple-app-site-association
200  /sitemap.xml
```

---

## Open follow-ups
- [x] `/compare` picker — replace inline script with proper server-rendered form GET (no JS at all) ✓ Sprint 2.7 (repeated `o=` params now accepted natively, `parseOblasts` reads both legacy `oblasts=` and new `o=` forms, inline script removed)
- [ ] Add embed widget `<iframe>` snippet copy block on `/docs/api` or new `/embed` index
- [ ] Real PWA icons in `/public/icons/`
- [ ] `/api/topics` count should respect 30-day window (currently all-time)
