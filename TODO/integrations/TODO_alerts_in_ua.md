# TODO — Integration: Air Alerts (alerts.in.ua)

## Goal
Canonical real-time air-raid alert feed for Ukraine — oblast + hromada granularity. P0 critical for civilian persona + civilian_alerts layer.

## Progress
- 13 / 13 done

## Tasks

### Source
- [x] Primary: alerts.in.ua API (free + commercial tiers) — integrations/alerts-in-ua/src/client.ts (TIER_CONFIG free/commercial/enterprise + DEMO fixture, env token)
- [x] Fallback: official `air_alert_ua` Telegram bot — integrations/alerts-in-ua/src/telegram-fallback.ts (reuses @ua-map/telegram Bot API client, read-only)
- [x] Fallback: regional OVA Telegram channels (per-oblast) — integrations/alerts-in-ua/src/ova-fallback.ts (OVA_CHANNELS registry per oblast)
- [x] Cross-validate active vs cleared status across sources — integrations/alerts-in-ua/src/cross-validate.ts (fail-safe multi-source quorum, SOURCE_WEIGHT)

### Pipeline
- [x] WebSocket / polling adapter — integrations/alerts-in-ua/src/feed-adapter.ts (mode=websocket|polling, change-only emit via quorum)
- [x] End-to-end latency budget: < 5s (source → user push) — integrations/alerts-in-ua/src/latency-slo.ts (per-stage budgets summing to 5s + LatencyBreachDetector)
- [x] Per-location alert state machine (active / cleared / partial) — integrations/alerts-in-ua/src/state-machine.ts (active/partial/cleared FSM, ratio-driven)
- [x] Historical alert archive (every alert, every duration) — integrations/alerts-in-ua/src/archive.ts (start/clear → ArchivedAlert with durationSec, query+stats)

### Schema mapping
- [x] Map location IDs to UA admin hierarchy (oblast → raion → hromada) — integrations/alerts-in-ua/src/admin-hierarchy.ts (ALERTS_IN_UA_OBLAST_UID map + resolveAdminPath, KATOTTG passthrough)
- [x] `alert_type` taxonomy (air, artillery, urban combat, chemical) — integrations/alerts-in-ua/src/alert-types.ts (ALERT_TYPE_TAXONOMY, uk/en/ru labels, severity/danger)
- [x] Source freshness SLO per location — integrations/alerts-in-ua/src/freshness-slo.ts (per-tier FRESHNESS_BUDGET_MS, fresh/aging/stale, staleOblasts)

### Compliance
- [x] Respect API ToS + attribution — integrations/alerts-in-ua/COMPLIANCE.md (ToS/tiers/attribution per source; route exposes attribution meta)
- [x] No alert delay for civilian persona — integrations/alerts-in-ua/src/no-delay-policy.ts (hard invariant: civilian raise/clear delayMs=0, assertNoCivilianDelay guard)

## i18n
- UK + EN + RU; alert text generated per locale.

### Примітки
This is the lowest-latency, highest-stakes layer. Test failover quarterly.
