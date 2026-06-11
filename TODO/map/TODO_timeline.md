# TODO — Timeline & Historical Playback

## Goal
Scrub through history of any region / layer / topic with variable speed and event clustering.

## Progress
- 9 / 9 done

## Tasks
- [x] Time scrubber UI (1h / 6h / 24h / 7d / 30d / custom) ✓ Sprint 2.57 — MapTimelineBar scrubber + time window presets
- [x] Per-layer time filtering — `apps/web/src/lib/map/per-layer-time.ts`
- [x] Playback: 0.25× → 100× speed ✓ Sprint 2.57 — playback speed selector (0.5×/1×/2×/5×) in MapTimelineBar; Timeline page playback
- [x] Event-density mini-histogram inside scrubber — `GET /api/events/density?from=&to=&buckets=60`; returns per-bucket count + maxSeverity
- [x] "Jump to next significant event" control — `isSignificant` flag per bucket when `maxSeverity >= threshold`; `significantBuckets` count in meta
- [x] Bookmarks / chapters on timeline — `apps/web/src/lib/map/timeline-bookmarks.ts`
- [x] Server-side time-windowed queries with TimescaleDB hypertables — `apps/web/src/lib/map/timescaledb-queries.ts`
- [x] Playback recording → MP4 / GIF export — `apps/web/src/lib/map/playback-export.ts`
- [x] Public shareable playback links — `apps/web/src/lib/map/shared-playback.ts`

## i18n
- N/A directly; UI strings localized.

### Примітки
This is the killer demo feature. Polish it.
