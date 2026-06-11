# TODO — Integration: Ukrhydromet (UA Weather Service)

## Goal
National-grade UA weather (forecasts, severe warnings, hydrology) — preferred over generic global APIs for UA users.

## Progress
- 8 / 8 done

## Tasks

### Source
- [x] meteo.gov.ua public feed — integrations/ukrhydromet/src/client.ts (typed forecast client + throttle/UA + deterministic demo fixture `demoForecast`)
- [x] Severe-weather warnings (per-oblast) — integrations/ukrhydromet/src/severe-warnings.ts (per-oblast warning model + yellow/orange/red colour/level taxonomy in types.ts)
- [x] Hydrology (river levels, flood risk) — integrations/ukrhydromet/src/hydrology.ts (river-gauge model + `deriveFloodRisk` adverse/danger bands)

### Pipeline
- [x] Daily forecast sync — integrations/ukrhydromet/src/sync.ts (`runForecastSync` → overlay snapshot; 6-hourly cadence)
- [x] Severe-weather alert push — integrations/ukrhydromet/src/alert-push.ts (severe→civilian-safe Web Push payload; silent-by-default, orange+ only, requireInteraction for red/danger)
- [x] Cross-reference with global feeds (Open-Meteo, NOAA) for divergence detection — integrations/ukrhydromet/src/divergence.ts (per-day temp/precip/wind divergence vs integrations/open-meteo via `fromOpenMeteoDaily` shim)

### Use in product
- [x] Weather overlay defaults to Ukrhydromet inside UA — integrations/ukrhydromet/src/source-preference.ts (`selectWeatherSource`: UA bbox → ukrhydromet, else open-meteo) + apps/web/src/app/api/integrations/ukrhydromet/route.ts (feeds existing `weather` layer)
- [x] Severe-weather civilian alerts — integrations/ukrhydromet/src/civilian-alerts.ts (`warningToAdvisory`/`floodToAdvisory` → calm en/uk advisory with protective actions)

## i18n
- UK + EN.

### Примітки
Local authority > global API for UA context. Worth the integration effort.
