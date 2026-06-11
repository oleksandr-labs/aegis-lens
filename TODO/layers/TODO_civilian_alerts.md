# TODO — Layer: Civilian Alerts

## Goal
Air-raid sirens, evac orders, shelter-in-place, mass-warning notices — surfaced fast, localized, calm.

## Progress
- 11 / 11 done

## Tasks
- [x] Air-raid alert ingestion (UA: official APIs + Telegram bots like air_alert_ua) — `integrations/civilian-alerts/src/client.ts` UkraineAlarmClient (api.ukrainealarm.com), `adapter.ts` CivilianAlertAdapter
- [x] Per-oblast / per-hromada granularity — all 27 oblasts in `OBLASTS` registry with ISO 3166-2:UA codes, center coords, population
- [x] Active-alert highlighting on map — `integrations/civilian-alerts/src/highlight.ts` deriveHighlights() → per-oblast styling state (active/recent_clear/calm)
- [x] Push / web-push delivery — `integrations/civilian-alerts/src/web-push.ts` typed VAPID subscription + WebPushPayload + deliverAlert() (no secrets; silent-by-default)
- [x] Family / watchlist scoping — `integrations/civilian-alerts/src/watchlist.ts` Watchlist/WatchlistMember + scopeSnapshotToWatchlist()
- [x] Historical alert archive per region — `integrations/civilian-alerts/src/archive.ts` ArchiveQuery + queryArchive() over UkraineAlarmClient.getAlertHistory
- [x] Alert-duration statistics — `integrations/civilian-alerts/src/stats.ts` computeDurationStats() (avg/median/longest, count, perDay)
- [x] Map style: pulsing region overlay — paint spec `air_raid_alerts` (+ outline) appended to `c:/tmp/sprint257_shared_C3.txt` (SHARED RULE); registry entry already present
- [x] Sound: distinct + opt-in (no auto-play) — `integrations/civilian-alerts/src/sound-policy.ts` decideSound() with NEVER_AUTOPLAY invariant + consent-gesture gate
- [x] Cross-link to shelters layer — `integrations/civilian-alerts/src/shelter-link.ts` linkSheltersForAlert() referencing SHELTERS_LAYER_ID ("shelters")
- [x] Civilian-safe UI mode (no jargon, plain labels) — `integrations/civilian-alerts/src/civilian-mode.ts` PLAIN_ALERT_LABELS (uk/ru/en) + deJargonize()

## i18n
- UK + RU + EN required minimum; future PL for refugee corridors.

### Примітки
Highest stakes layer. Latency budget < 5s end-to-end.
