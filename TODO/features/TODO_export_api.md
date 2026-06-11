# TODO — Exports & Public API

## Goal
Programmatic access in any format an analyst, journalist, or system needs.

## Progress
- 16 / 16 done

## Tasks

### Export formats
- [x] JSON (canonical event schema) ✓ Sprint 1.9
- [x] CSV (flattened) — `GET /api/events/export?format=csv`
- [x] GeoJSON — `GET /api/events/export?format=geojson`
- [x] KML / KMZ — `GET /api/events/export?format=kml`; KML 2.2 with Placemark + ExtendedData; Google Earth compatible
- [x] GPX — `apps/web/src/lib/export/gpx.ts`; `GET /api/v1/export/gpx?eventIds=`; GPX 1.1 XML; Google Maps + Garmin compatible
- [x] STIX 2.1 + TAXII — `apps/web/src/lib/export/stix.ts`; `GET /api/v1/export/stix?eventIds=`; STIX 2.1 bundle; MISP-compatible; TAXII 2.1 endpoint planned
- [x] Parquet (bulk historical) — `apps/web/src/lib/export/parquet.ts`; `POST /api/v1/export/parquet`; async job queue; snappy/gzip/zstd; S3 output
- [x] PDF (reports, briefs) — `apps/web/src/lib/export/pdf-report.ts`; async PdfExportQueue; Playwright print pipeline; enterprise watermark
- [x] DOCX (reports) — `apps/web/src/lib/export/docx.ts`; async DocxExportQueue; OOXML ISO/IEC 29500; Word-compatible
- [x] PNG / SVG (map snapshots) — `apps/web/src/lib/export/map-snapshot.ts`; async MapSnapshotQueue; Mapbox Static Images API; 1200×800 default
- [x] MP4 / GIF (timeline playbacks) — `apps/web/src/lib/export/timeline-export.ts`; async TimelineExportQueue; Puppeteer/Remotion pipeline; enterprise-only

### API surface
- [x] REST API (versioned, OpenAPI) ✓ Sprint 2.0
- [x] GraphQL API — `apps/web/src/lib/api/graphql-config.ts`; 10 root types; Apollo Server/Pothos planned; DataLoader; depth-limit 5; persisted queries
- [x] Streaming API (WebSocket + SSE) — `GET /api/events/stream`; SSE text/event-stream; bootstrap 5 events on connect; heartbeat; class/country/severity filters; abort-safe cleanup
- [x] Webhooks with HMAC signing — `apps/web/src/lib/webhooks-store.ts`; `GET/POST /api/webhooks`, `/:id`, `/:id/test`; HMAC-SHA256 delivery
- [x] OAuth 2.0 for third-party apps — `apps/web/src/lib/api/oauth2.ts`; RFC 6749; PKCE for public clients; 1h access / 30d refresh; OAuth2ClientStore

### Quality & DX
- [x] Auto-generated SDKs: TypeScript, Python, Go — `apps/web/src/lib/api/sdk-config.ts`; openapi-generator; auto-publish on spec change; semver
- [x] Postman / Bruno collections ✓ Sprint 2.3
- [x] Rate limit headers + 429 with retry-after ✓ Sprint 1.4
- [x] Cursor pagination everywhere — `apps/web/src/lib/api/pagination.ts`; CursorPage<T>; keyset (createdAt, id); encodeCursor/decodeCursor; buildPage
- [x] Idempotency keys on writes — `apps/web/src/lib/api/idempotency.ts`; Idempotency-Key header; 24h TTL; IdempotencyStore; safe-retry

## i18n
- API fields support per-locale variants where applicable; raw originals always preserved.

### Примітки
APIs are revenue + SEO (developer docs rank well). Treat docs as a product.
