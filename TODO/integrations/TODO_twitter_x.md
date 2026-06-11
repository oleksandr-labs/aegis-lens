# TODO — Integration: X / Twitter

## Goal
Ingest public-relevant posts despite API constraints.

## Progress
- 7 / 7 done

## Tasks
- [x] X API v2 (Enterprise tier if budget) — `integrations/twitter/src/client.ts` (XApiClient: Bearer Token auth, searchRecent, getUserTimeline, getUserByUsername)
- [x] Free / Basic tier feature matrix (rate, fields available) — client enforces max_results ≤ 100, lang filter, excludes retweets; 429 → retryAfterMs
- [x] Curated account list per region/topic — `integrations/twitter/src/registry.ts` (ACCOUNT_REGISTRY: officials, OSINT analysts, correspondents; XAccountRegistryService with sourceWeight)
- [x] Webhook / streaming for tracked accounts — `integrations/twitter/src/streaming.ts` (`buildStreamRules` filtered-stream rules, `FilteredStreamConsumer`, `TrackedAccountPoller` poll fallback, per-tier `POLL_INTERVAL_MS`)
- [x] Archive fallback via Wayback / academic dumps where lawful — `integrations/twitter/src/archive.ts` (reuses youtube `WaybackClient` via `archiveTweet`; `AcademicDumpRef` + `isDumpIngestPermitted` rehydration gate)
- [x] Media extraction — `integrations/twitter/src/media.ts` (`extractMedia` / `resolveMediaFromIncludes` from v2 `includes.media`, `toCanonicalMedia`, `extractLinks`)
- [x] Rate-limit + 429 backoff strategy — client throws Error with retryAfterMs from x-rate-limit-reset header

## i18n
- Multi-language; downstream NLP handles translation.

### Примітки
X API ToS is volatile. Track a compliance changelog.
