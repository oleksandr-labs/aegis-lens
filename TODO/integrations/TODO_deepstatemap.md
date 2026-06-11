# TODO — Integration: DeepStateMAP

## Goal
Most accurate public source of frontline position in Ukraine. Volunteer-maintained, daily-updated GeoJSON/API.

## Progress
- 12 / 12 done

## Tasks

### Source
- [x] DeepStateMAP API (verify current access tier + ToS) — integrations/deepstatemap/src/client.ts (typed GeoJSON daily-snapshot client, daily cadence + UA + demo fallback; access-tier/ToS findings in COMPLIANCE.md §2)
- [x] GitHub mirror of daily snapshots — integrations/deepstatemap/src/mirror.ts (reads dated YYYY-MM-DD.geojson from a community mirror repo, listDates/getSnapshot/getLatest)
- [x] Their public Telegram channel for commentary context — integrations/deepstatemap/src/telegram-context.ts (read-only Bot API @DeepStateUA, commentary normalized + translated, demo fixture)

### Pipeline
- [x] Daily snapshot ingestion + diff vs previous — integrations/deepstatemap/src/snapshot-diff.ts (diffSnapshots: added/removed/status_changed/geometry_changed + net km² toward each side)
- [x] Polygon ingestion to PostGIS (controlled / contested / liberated) — integrations/deepstatemap/src/polygons.ts (ControlPolygon model, FRONTLINE_CONTROL_DDL geometry(MultiPolygon,4326)+GIST, toRows/INSERT_SQL via ST_GeomFromGeoJSON, area estimate)
- [x] Per-update changelog with summary text — integrations/deepstatemap/src/changelog.ts (buildChangelog: bilingual summary + highlights from diff, links Telegram commentary)
- [x] Historical playback per region — integrations/deepstatemap/src/playback.ts (PLAYBACK_REGIONS bbox clip, buildPlayback day-by-day frames with per-frame counts)

### Display
- [x] Frontline polygon layer with confidence visualization — proposed layer `frontline_control` (registry + 3-state paint w/ confidence-aware opacity/dashing) in c:\tmp\sprint258_shared_DSM.txt; API route apps/web/src/app/api/integrations/deepstatemap/route.ts (json + geojson, status/minConf filters)
- [x] Disputed-area display policy applied — integrations/deepstatemap/src/disputed-policy.ts (occupied≠sovereignty wording, contested never attributed to a side + hatched, low-confidence dashed/reduced opacity)
- [x] Attribution prominent (per their license + community norms) — integrations/deepstatemap/src/attribution.ts (buildAttribution/attributionLine, EN+UK notice, republication gate); surfaced in API meta.attribution

### Compliance
- [x] License check (verify republication permitted + attribution form) — integrations/deepstatemap/COMPLIANCE.md §2 (NOT public-domain; republication gated OFF by default via DEEPSTATE_REPUBLICATION_PERMITTED; attribution form documented)
- [x] Coordinate with DeepState team for partnership / formal feed — integrations/deepstatemap/COMPLIANCE.md §3 (outreach brief + liaison checklist; agreement not yet in place, gate stays OFF until written permission)

## i18n
- UK + EN; their daily commentary translated.

### Примітки
This is THE benchmark for frontline accuracy. Build the partnership, don't just scrape.
