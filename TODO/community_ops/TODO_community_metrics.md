# TODO — Community Metrics

## Goal
Measure community health to invest where it works.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.53)

## Tasks
- [x] DAU / WAU / MAU per channel (forum, Discord, Telegram) → [docs/community/community-metrics.md §2](../../docs/community/community-metrics.md)
- [x] Contribution rate (active contributors / MAU) → [docs/community/community-metrics.md §3](../../docs/community/community-metrics.md)
- [x] Time-to-first-contribution per new user → [docs/community/community-metrics.md §4](../../docs/community/community-metrics.md)
- [x] Mod actions / 1000 posts (lower = healthier) → [docs/community/community-metrics.md §5](../../docs/community/community-metrics.md)
- [x] Sentiment (auto + sampled human) → [docs/community/community-metrics.md §6](../../docs/community/community-metrics.md)
- [x] Geographic distribution → [docs/community/community-metrics.md §7](../../docs/community/community-metrics.md)
- [x] Retention curves per cohort → [docs/community/community-metrics.md §8](../../docs/community/community-metrics.md)
- [x] Quarterly community health report → [docs/community/community-metrics.md §9](../../docs/community/community-metrics.md)

### Done notes (2026-05-30)
Full community metrics framework in `docs/community/community-metrics.md`. Covers: composite health score hierarchy, DAU/WAU/MAU definitions + targets + data collection (Discourse API, Discord bot, Telegram Bot API, privacy-preserving hashing), contribution rate target (> 8% of MAU), time-to-first-contribution targets (median < 14 days), moderation actions / 1k posts metric + 6-type categorization, automated + human-sampled sentiment with alert thresholds, geographic distribution targets (35%+ UA, 25%+ EU), cohort retention curves with 12-month targets + churn early-warning, quarterly health report 10-section template + publication cadence. Metric collection stack appendix (PostHog / Grafana / Metabase).

## i18n
- Per-language breakouts.

### Примітки
A community is a flywheel or a sinkhole. Measure quarterly, adjust.
