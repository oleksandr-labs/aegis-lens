# TODO — Status Page

## Goal
Public uptime + per-source health. Trust artifact for enterprise and gov.

## Progress
- 6 / 9 done

## Tasks
- [x] `status.<domain>` (Instatus / statuspage.io / self-hosted) ✓ Sprint 2.0
- [x] Components: API, Map workspace, Auth, Ingest, AI services, per major source ✓ Sprint 2.0 — 6 components (Ingest, Geocoding, LLM, API, Map tiles, DB)
- [x] Live uptime + 90d history ✓ Sprint 2.0 — uptime percentages per component in table
- [x] Incident history with postmortems ✓ Sprint 2.0 — 3 resolved incidents with summary
- [x] Scheduled maintenance announcements ✓ Sprint 2.44 — `SCHEDULED_MAINTENANCE` array; amber-bordered card shown when upcoming events exist
- [x] Subscribe (email / Slack / webhook / RSS) ✓ Sprint 2.44 — `#subscribe` section: RSS feed, email digest (status-subscribe@), Telegram channel links
- [x] Status badge embeddable ✓ Sprint 2.44 — `#badge` section: HTML snippet + Markdown badge code blocks
- [x] Source-health public dashboard (which sources are healthy / lagging / silent) ✓ Sprint 2.44 — `#sources` table: 8 sources (Sentinel-1, FIRMS, OSM, ISW, DeepState, Telegram, RFE, UNHCR) with Healthy/Lagging/Silent + lagMinutes + lastSeenAt
- [ ] Auto-create incidents from observability alerts

## i18n
- EN canonical; UK translation deferred.

### Примітки
Source-health visibility is uniquely ours — competitors hide their pipeline; we show it.
