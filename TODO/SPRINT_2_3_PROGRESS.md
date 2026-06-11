# Sprint 2.3 — Progress

**Theme:** Developer surface (SDKs, Postman collection, docs hub), Trust Center sub-pages, auth flow, TODO bookkeeping audit.

**Date:** 2026-05-24

**Method:** 6 parallel agents (4 ship, 2 audit).

---

## Delivered

### Developer surface
- [x] `/docs/sdks` — code samples for JS/TS, Python, cURL, Go, Ruby, PHP, with downloads of Postman + OpenAPI. `TechArticle`.
- [x] `GET /api/postman.json` — Postman Collection v2.1 covering all 9 public endpoints, with `{{base_url}}` variable.
- [x] `/docs` rewritten to a ToC with 8 topics + `WebPage`/`ItemList` JSON-LD.
- [x] `/docs/getting-started`, `/docs/concepts`, `/docs/rate-limits`, `/docs/webhooks` (marked "Coming Sprint 3.x"), `/docs/errors`. All `TechArticle`.

### Trust Center
- [x] `/trust` — hub linking to 8 trust artifacts (cards).
- [x] `/trust/data-policy` — data collection, retention, processors, GDPR rights.
- [x] `/trust/transparency` — Q1 2026 stub numbers: 0 govt requests, 2 DMCA, 12 removals + 38 flagged + 9 corrections, 99.94% uptime.
- [x] `/trust/corrections` — 5 sample corrections log entries with eventId + original-vs-corrected diff.

### Auth flow (stub — real auth Sprint 3.x)
- [x] `/login` (`LoginAction` JSON-LD), `/signup` (`RegisterAction` JSON-LD). Hidden `next=` field on login.
- [x] `POST /api/auth/login` — accepts any well-formed email, sets httpOnly `aegis_session` cookie (30d), 303 to `next ?? /account`. Bad email → `/login?error=invalid`. Open-redirect protection on `next`.
- [x] `POST /api/auth/signup` — same, requires `name`, redirects to `/account`.
- [x] `POST|GET /api/account/logout` — clears cookie, 303 to `/`.
- [x] Removed stale `(auth)` group that collided with the new flat `/login`+`/signup`.

### TODO bookkeeping audit
- [x] **106 tasks marked `[x] ✓ Sprint N.M`** across 38 TODO files.
  - Pages cluster: 26 marked across 13 files.
  - SEO cluster: 41 marked across 10 files (biggest cluster — metadata, structured data, programmatic, breadcrumbs, hreflang, internal links, OG, news, source profiles, local).
  - Programmatic templates: 3 marked.
  - API: 1 (OpenAPI 3.1).
  - Directory: 3 (companies / tools / compare).
  - URLs/slugs: 21 (slug rules, locale prefixing, canonical strategy).
  - Frontend: 6 (routing, state mgmt).
  - i18n: 3 (en + uk translations).
  - Security: 1 (cookie consent in compliance).
  - A11y: 2 (contrast + focus visibility).

### Plumbing
- [x] `urls.docsSdks`, `urls.docsGettingStarted`, `urls.docsConcepts`, `urls.docsRateLimits`, `urls.docsWebhooks`, `urls.docsErrors`, `urls.trust`, `urls.trustDataPolicy`, `urls.trustTransparency`, `urls.trustCorrections` added.
- [x] Sitemap +10 hreflang sets.
- [x] Footer Legal column: `SDKs`, `Trust`.

---

## Smoke tests

```
200  /docs (rewritten ToC)
200  /docs/sdks
200  /docs/getting-started
200  /docs/concepts
200  /docs/rate-limits
200  /docs/webhooks
200  /docs/errors
200  /trust
200  /trust/data-policy
200  /trust/transparency
200  /trust/corrections
200  /login
200  /signup
200  /api/postman.json
303  POST /api/auth/login (valid email) → cookie set, redirect /account
303  POST /api/auth/login (junk)        → /login?error=invalid
303  POST /api/account/logout           → cookie cleared, redirect /
200  /sitemap.xml
```

---

## Open follow-ups
- [ ] Real password hashing + DB-backed session via Drizzle `users` table
- [ ] Email verification flow
- [ ] Webhook signing implementation (Sprint 3.x)
- [ ] /trust/transparency: pull real quarterly numbers from DB once available
- [ ] Footer: split Legal column into Legal vs. Trust as it's getting tall
