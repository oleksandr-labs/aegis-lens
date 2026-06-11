# TODO — Integration: YouTube & Reddit

## Goal
Long-form video evidence (YT) + curated discussion intel (Reddit).

## Progress
- 11 / 11 done

## Tasks

### YouTube
- [x] YouTube Data API access — `integrations/youtube/src/client.ts` (`YouTubeApiClient`)
- [x] Curated channel + playlist ingestion — `integrations/youtube/src/registry.ts` (7 channels, 1 playlist)
- [x] Transcript fetch + STT fallback (where transcripts disabled) — `integrations/youtube/src/transcripts.ts` (`fetchTranscript`: timedtext manual→ASR captions, `parseTimedTextXml`, `SttProvider` STT-fallback handoff)
- [x] Frame sampling for CV checks — `integrations/youtube/src/frame-sampling.ts` (`buildSamplePlan` uniform/head_tail/scene_change, `FrameCvAnalyzer` CV-handoff model, `summariseCv`)

### Reddit
- [x] Reddit API access — `integrations/reddit/src/client.ts` (`RedditApiClient`, OAuth2)
- [x] Curated subreddit list — `integrations/reddit/src/registry.ts` (7 subreddits)
- [x] Comment + post ingestion — `integrations/reddit/src/client.ts` (`getPostComments`)
- [x] Score / awards as engagement signal — `inferSeverityFromScore` in adapter

### Common
- [x] Author / channel reputation scoring — shared engine `integrations/youtube/src/reputation.ts` (`scoreReputation`, editorial-prior + track-record + longevity + identity blend) + Reddit per-author wrapper `integrations/reddit/src/reputation.ts` (`scoreRedditAuthor`)
- [x] Schedule + rate-limit policy — `integrations/youtube/src/rate-policy.ts` (`QUOTA_COST`, `YouTubeQuotaGuard` daily-unit budget, poll schedule) + `integrations/reddit/src/rate-policy.ts` (`RedditThrottle` token bucket, `parseRedditRateHeaders`)
- [x] Archive each ingested URL via Wayback — `integrations/youtube/src/wayback.ts` (`WaybackClient` Save-Page-Now + availability fallback; reused by reddit/twitter)

## i18n
- EN primary; UK + DE + PL as content language demands.

### Примітки
YT comments are noisy. Filter for verified OPs.
