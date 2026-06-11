# Sprint 2.0 — Progress

**Theme:** Discovery + transparency surface — public stats dashboard, timeline view, subscriptions, OpenAPI spec, press kit, status page.

**Date:** 2026-05-24

**Method:** 5 parallel agents.

---

## Delivered

### Visualization & discovery
- [x] `/stats` — public dashboard. KPI strip (total / 7d / 24h / avg danger / avg confidence), by-class table, by-country bbox detection, source-tier breakdown, 30-day SVG sparkline. schema.org `Dataset` JSON-LD (CC-BY-4.0).
- [x] `/timeline` — 90-day chronological event view, grouped by ISO date, vertical rail with class-colored dots, anchor-link day filter chips. schema.org `ItemList`.

### Subscriptions
- [x] `/alerts` — RSS feed catalog (news + per-class) with copy buttons, email subscribe form. schema.org `SubscribeAction`.
- [x] `POST /api/subscribe` — stub endpoint, validates email shape, 5 req/min/IP rate limit. Accepts JSON and FormData.

### Developer surface
- [x] `GET /api/openapi.json` — full OpenAPI 3.1 spec for events / sources / reports / subscribe with `Event`, `Source`, `Report` schemas modeled from real types. Cache 5min.

### Marketing
- [x] `/press` — factsheet, brand assets stubs, spokesperson placeholder, 5 example coverage cards, press contact. schema.org `Organization` with `sameAs` + `contactPoint`.
- [x] `/status` — operational banner, 6-component status table with uptime %, 3 resolved incidents log. schema.org `WebPage`.

### Plumbing
- [x] `urls.stats`, `urls.timeline`, `urls.alerts`, `urls.press`, `urls.status` added to `@aegis/url-builder`.
- [x] Sitemap +5 new hreflang sets.
- [x] Footer Resources column: `Timeline`, `Stats`, `Alerts`. Legal column: `Press`, `Status`.

---

## Smoke tests

```
200  /stats
200  /uk/stats
200  /timeline
200  /uk/timeline
200  /alerts
200  /press
200  /status
200  /api/openapi.json
200  /api/subscribe (POST email=...)
200  /sitemap.xml
```

---

## Open follow-ups
- [ ] `/stats`: pull live data once DB is wired
- [ ] `/timeline`: client-side filter chips (by class, by region)
- [ ] `/alerts`: wire `/api/subscribe` to a real queue (Resend / Postmark)
- [x] `/api/openapi.json`: serve Redoc UI at `/docs/api/explorer` ✓ Sprint 2.7 (jsDelivr Redoc bundle, themed to dark tactical palette, noscript fallback to spec download)
- [ ] `/press`: real brand asset files in `/public/brand/`
- [ ] `/status`: pull from real uptime monitor
