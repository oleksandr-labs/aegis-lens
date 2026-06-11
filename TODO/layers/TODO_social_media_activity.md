# TODO — Layer: Social Media Activity

## Goal
Heatmap of social-media activity by topic / region — early-warning signal for breaking events.

## Progress
- 10 / 10 done

## Tasks
- [x] Topic detection per region (clustering) — `SocialTopic` enum + `topic` field in `SocialRegionSignal`
- [x] Volume vs baseline (anomaly) — `vsBaseline` ratio field
- [x] Source diversity score (single channel vs many) — `sourceDiversityScore` 0–1
- [x] Velocity score (rate of new posts) — `postsPerHour` + `velocityTrend` fields
- [x] Sentiment trajectory — `sentiment` -1 to +1 per region
- [x] Map style: pulsing intensity overlay — paint spec `social_media_heatmap` (orange heatmap ramp + pulse hints) in `c:\tmp\sprint257_shared_C10.txt` for `LAYER_PAINT_SPECS`
- [x] Filter facets: platform, language, topic — `GET /api/layers/social-activity` with query params
- [x] Misinfo flag (cross-layer with misinformation detection) — `services/social/src/misinfo-link.ts` (`linkSocialToMisinfo` links signals to `@ua-map/misinfo` verdicts → risk band + caveat)
- [x] Privacy: aggregate only, no per-account display — `SocialRegionSignal` is region-level only
- [x] Latency budget < 60s end-to-end — `services/social/src/latency-slo.ts` (`SOCIAL_ACTIVITY_SLO` 60s + per-stage budget breakdown + `detectLatencyBreaches`)

## i18n
- Topic labels in local language; cluster names AI-translated + reviewed.

### Примітки
Pre-event signal layer. Validate against ground-truth events to tune.
