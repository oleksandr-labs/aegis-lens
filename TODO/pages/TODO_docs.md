# TODO — Docs & API Portal

## Goal
Developer & analyst documentation: getting started, API reference, data schema, OSINT methodology, integration guides.

## Progress
- 11 / 11 done ✅ COMPLETE

## Tasks
- [x] Docs platform (Nextra / Mintlify / custom) ✓ Sprint 0
- [x] Getting started guide ✓ Sprint 2.47 (existed, marked) — 5-step quickstart: open map, search events, subscribe, generate API key, first request; `TechArticle` JSON-LD
- [x] REST + GraphQL API reference (auto-generated from OpenAPI) ✓ Sprint 1.9
- [x] Webhooks documentation ✓ Sprint 2.47 (existed, marked) — full webhooks doc with request headers, sample payload, HMAC-SHA256 signature verification code, delivery semantics; "Coming Sprint 3.x" notice
- [x] Event schema & taxonomy reference ✓ Sprint 2.49 — `/docs/schema` page: full Event object shape, VerifyState/Severity/GeoPrecision enums, 6-group event-class taxonomy table (kinetic/infrastructure/cyber/maritime/humanitarian/diplomatic), SourceRef and LocalizedString objects; `TechArticle` JSON-LD; added to docs index and sitemap (0.6)
- [x] Confidence / danger score methodology ✓ Sprint 2.49 — `/docs/confidence` page: confidence inputs table (tier weights, geo, imagery, official, decay), simplified formula, practical thresholds table; danger score inputs table (class baseline, munition, target criticality, population, proximity, casualties, area-of-effect), severity label mapping, API filter examples; `TechArticle` JSON-LD
- [x] OSINT methodology guide ✓ Sprint 2.49 — `/docs/osint-guide` page: source-tier cards (Tier 1–4 with examples and criteria), 7-step verification pipeline (collect/dedup/triage/geolocate/corroborate/verify/publish+monitor), what we do not use (dark-web, subscription, AI-generated primary sources), geolocation standards, editorial independence; `TechArticle` JSON-LD
- [x] SDK examples (TS, Python) ✓ Sprint 2.47 (existed, marked) — SDKs page with JS/TS/Python/cURL/Go/Ruby/PHP samples + OpenAPI + Postman download links
- [x] Rate limits + quotas ✓ Sprint 2.47 (existed, marked) — per-endpoint table, response headers, 429 handling, reference backoff implementation in TypeScript
- [x] Changelog ✓ Sprint 1.9
- [x] Status page link ✓ Sprint 2.0

## i18n
- EN required. UK technical translation deferred to Phase 3.

### Примітки
Docs is a sales surface for enterprise — invest in it.
