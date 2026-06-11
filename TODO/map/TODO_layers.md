# TODO — Map Layers

## Goal
Comprehensive layer catalog with consistent styling, legends, and confidence visualization.

## Progress
- 18 / 22 done

## Tasks

### Military
- [x] Military activity (strikes, engagements) — `layers/src/registry.ts` layer `military_strikes`
- [x] Troop / unit movement (where lawful + verified) — `layers/src/registry.ts` layer `troop_movement`
- [ ] Drone activity & routes — pending separate layer (currently merged into military_strikes)
- [x] Missile launches / impacts / interceptions — part of `military_strikes` layer (subclass missile_strike)
- [x] Air-defense engagements — `layers/src/registry.ts` layer `air_defense`

### Infrastructure
- [x] Damaged infrastructure (energy, transport, telecom, water) — `layers/src/registry.ts` layer `infrastructure_damage`
- [x] Power outage layer (utility data + crowdsourced + satellite night lights) — `layers/src/registry.ts` layer `power_outages`
- [x] Communication outages (Cloudflare Radar, NetBlocks) — `layers/src/registry.ts` layer `communication_outages`
- [ ] Critical infrastructure base layer (from OSM + curated) — pending OSM data import

### Civilian
- [x] Civilian alerts (air-raid sirens, evac orders) — `layers/src/registry.ts` layer `air_raid_alerts`
- [x] Shelters & humanitarian points — `layers/src/registry.ts` layer `shelters`
- [ ] Border crossings status — pending dedicated layer

### Environment
- [x] Fires (FIRMS + Sentinel) — `layers/src/registry.ts` layer `active_fires` (NASA FIRMS source)
- [ ] Thermal imagery overlay — pending Sentinel-1 integration
- [x] Weather overlays (wind, precip, visibility) — `layers/src/registry.ts` layer `weather`
- [ ] Air quality overlay — pending data source

### Motion
- [x] Aviation tracking (ADS-B + military estimates) — `layers/src/registry.ts` layer `aviation`
- [x] Marine tracking (AIS) — `layers/src/registry.ts` layer `maritime`

### Imagery
- [x] Sentinel-2 latest cloud-free mosaic — `layers/src/registry.ts` layer `sentinel_optical`
- [ ] Sentinel-1 SAR overlay — pending
- [x] Change-detection layer — `layers/src/registry.ts` layer `change_detection`

### Information environment
- [x] Social media activity heatmap — `layers/src/registry.ts` layer `social_media_heatmap`
- [ ] Misinformation / disputed-narrative spread layer — pending NLP misinformation output
- [x] AI-predicted hot zones (clearly labeled as prediction) — `layers/src/registry.ts` layer `ai_predicted_zones` (is_prediction: true, hatched pattern)

## i18n
- Layer names, descriptions, legends fully localized.

### Примітки
Predictions must be visually distinct (dashed / hatched) and labeled "AI prediction — not observation".
