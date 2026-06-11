# TODO — Integration: Ukrenergo + Oblenergo

## Goal
Power-grid status: scheduled outages, emergency shutdowns, restoration. Civilian-critical.

## Progress
- 13 / 13 done

## Tasks

### Sources
- [x] Ukrenergo official site + Telegram + their published API where available — integrations/ukrenergo/src/ukrenergo-client.ts (typed client, ToS throttle/UA, demo fixture)
- [x] 24 regional oblenergo sites + Telegram (per-oblast) — integrations/ukrenergo/src/oblenergo-registry.ts (25 entries: 24 oblasts + Kyiv city, per-provider site/Telegram/format hints)
- [x] Yasno / DTEK consumer-facing schedules (where service area) — integrations/ukrenergo/src/dtek-yasno-client.ts (per-group schedules, service-area mapping, demo)

### Pipeline
- [x] Per-oblast adapter (each has different format) — integrations/ukrenergo/src/provider-adapters.ts (ProviderAdapter interface + per-format parsers, format→adapter registry)
- [x] Schedule parsing (queues / lines / time-blocks) — integrations/ukrenergo/src/schedule-parser.ts (OFF-window/hour-grid/prose → ScheduleGroup time-blocks)
- [x] Emergency-shutdown vs scheduled distinguishing — integrations/ukrenergo/src/classify-outage.ts (kind+cause+confidence+predictable, uk/ru/en rationale)
- [x] Per-region restoration ETAs — integrations/ukrenergo/src/eta.ts (provider_declared / schedule_inferred / historical_median bases)

### Schema mapping
- [x] Map to power-outages layer — integrations/ukrenergo/src/to-power-outages.ts (emits OutageSignal[] for power-outages fusion; no new layer)
- [x] Cross-correlate with VIIRS night-lights for verification — integrations/ukrenergo/src/viirs-correlation.ts (corroborated/contradicted/unreported verdicts + confidence delta)
- [x] Cross-correlate with Cloudflare Radar for impact extent — integrations/ukrenergo/src/radar-correlation.ts (traffic-drop → impact-extent + coverage delta)

### Display
- [x] Per-region outage schedule widget — integrations/ukrenergo/src/schedule-widget.ts + apps/web/src/app/api/integrations/ukrenergo/route.ts
- [x] "Power in my area" civilian view — integrations/ukrenergo/src/my-area.ts (per-group state/ETA/next-outage + advice, uk/ru/en)
- [x] Historical outage statistics — integrations/ukrenergo/src/stats.ts (per-region OFF-hours, scheduled/emergency split, hardship index)

## i18n
- UK + RU + EN.

### Примітки
Each oblenergo publishes differently. Adapters per provider — bulk work but high civilian value.
