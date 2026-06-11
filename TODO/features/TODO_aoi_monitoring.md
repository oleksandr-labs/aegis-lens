# TODO — Custom AOI (Area of Interest) Monitoring

## Goal
Users define geographic AOIs (polygons / radii) and the system continuously monitors them: events, satellite changes, sources.

## Progress
- 14 / 14 done

## Tasks

### AOI definition
- [x] Draw on map: polygon, circle, rectangle, MGRS box — `services/aoi/src/draw-tools.ts`
- [x] Import GeoJSON / KML / shapefile — `services/aoi/src/import-geospatial.ts`
- [x] Named AOIs + tags — `services/aoi/src/types.ts` AOI Zod schema with name + tags
- [x] Per-AOI quota (free / pro / enterprise) — AOI_QUOTA = {free:1, pro:20, enterprise:500}
- [x] Privacy-sensitive AOI flag (no auto-publish, restricted sharing) — is_private field in AOI schema

### Monitoring
- [x] Continuous event subscription per AOI — `services/aoi/src/monitor.ts` matchEventToAOIs() with bbox pre-filter + ray-casting
- [x] Sentinel-2 / Sentinel-1 change detection per AOI (scheduled) — `services/aoi/src/satellite-change.ts`
- [x] Commercial satellite tasking integration (Phase 3 — Planet / BlackSky) — `services/aoi/src/satellite-tasking.ts`
- [x] Source-coverage detection (which sources mention this area) — `services/aoi/src/source-coverage.ts`
- [x] AOI-specific AI brief (daily / on-event) — `services/aoi/src/ai-brief.ts`

### Output
- [x] AOI dashboard — `services/aoi/src/dashboard.ts`
- [x] AOI alert delivery (channels per AOI) — alert_rule_ids linked per AOI in schema
- [x] AOI exports (events + satellite snapshots over time) — `services/aoi/src/exports.ts`
- [x] Per-AOI permalink for sharing — `services/aoi/src/permalink.ts`

### Compliance
- [x] AOI policy: no real-time high-precision civilian / shelter AOIs without enterprise + KYC — `services/aoi/src/policy.ts`
- [x] Audit log of AOI creation + access — `services/aoi/src/audit-log.ts`

## i18n
- AOI names accept any locale; reverse-geocoded labels localized.

### Примітки
This is a major enterprise / security-firm revenue hook. Price per AOI.
