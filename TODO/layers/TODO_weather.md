# TODO — Layer: Weather Overlays

## Goal
Wind, precipitation, visibility, temperature — context for ops, civilian safety, fire risk.

## Progress
- 2 / 9 done

## Tasks
- [x] Open-Meteo / OpenWeather ingestion — `integrations/open-meteo/` (`OpenMeteoClient`, `OpenMeteoAdapter`)
- [ ] NOAA GFS forecast ingestion
- [ ] Wind vector field overlay
- [ ] Precipitation radar
- [ ] Visibility / fog overlay
- [ ] Temperature heatmap
- [x] Severe weather alerts — `isSevere()` filter in adapter (thunderstorm/heavy rain/high wind/low visibility)
- [ ] Per-region forecast widgets
- [ ] Cross-link to fire layer (weather as fire risk)

## i18n
- Units (metric / imperial) per-user; labels localized.

### Примітки
Weather is base-layer for many other interpretations.
