# TODO — Layer: Power Outages

## Goal
Detect and visualize power outages from multiple signals: utility data, satellite night lights, community reports, indirect signals.

## Progress
- 10 / 10 done

## Tasks
- [x] Utility-data ingestion (UA: Ukrenergo, regional oblenergo) — `integrations/power-outages/src/utility-adapter.ts` UtilityFeedRecord + OBLENERGO_REGISTRY + normaliseUtilityRecords()/getUtilitySignals()
- [x] VIIRS night-lights anomaly detection — `integrations/power-outages/src/viirs-nightlights.ts` radiance baseline (median+MAD), detectAnomaly() drop/z-score model, detectNightlightOutages()
- [x] Cloudflare Radar internet outage correlation — `OutageSignalSource.cloudflare_radar` in `integrations/power-outages/src/types.ts`
- [x] Community-report ingestion (Telegram channels, opt-in user reports) — `community_report` + `telegram_channel` signal sources in fusion model
- [x] Multi-signal fusion + confidence — `integrations/power-outages/src/fusion.ts` fuseSignals(); source weights (0.5–1.0), weighted confidence, avg coverage, severity 1–5
- [x] Outage timeline per region (start, duration, intensity) — `OutageEvent.startedAt` + `severity` + `coverage` in `GET /api/layers/power-outages`
- [x] Scheduled blackout schedule integration — `integrations/power-outages/src/schedule-adapter.ts` getScheduledBlackoutSignals(); Ukrenergo-style rotation groups
- [x] Map style: gradient overlay (severity by darkness reduction) — shared paint spec `power_outages` in `c:\tmp\sprint257_shared_C4.txt` (coverage-driven fillColor amber→night + fillOpacity ramp)
- [x] Filter facets: cause (scheduled, damage, weather), region, duration — `apps/web/src/app/api/layers/power-outages/route.ts` query params `cause`, `region`, `minDurationHours`/`maxDurationHours` (duration since startedAt)
- [x] Forecasted-outage layer (clearly labeled prediction) — `integrations/power-outages/src/forecast.ts` OutageForecast.isPrediction + en/uk FORECAST_DISCLAIMER; forecastFromSchedule()/forecastFromRecurrence(); route `?forecast=1` returns labeled `forecasts[]`

## i18n
- Region names + cause categories localized.

### Примітки
Civilian-impact layer — fast updates more important than maximum precision.
