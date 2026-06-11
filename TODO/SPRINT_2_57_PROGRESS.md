# Sprint 2.57 Progress

**Date:** 2026-06-06
**Status:** Complete
**Theme:** Map Layers Subsystem Hardening — verification, styling, policy & cross-linking
**Tasks closed:** 100 (across 15 layer TODO files)

Implemented as genuine TypeScript across 15 integration packages + the layer registry +
API routes + map paint specs, dispatched as 10 parallel package-scoped agents and merged
centrally. Where a task depends on ML training or commercial data that cannot be obtained
locally, it was delivered as the repo's sanctioned **codeable contract** — a typed interface +
heuristic baseline + confidence schema (the pattern already used by
`integrations/missiles/src/classifier.ts`). 94 new integration modules + 3 new API routes
(`maritime`, `aviation`, `troop-movement`) + 1 new SEO page (`/vessels/[mmsi]`).

## Completed by layer

### `layers/maritime` — 11/11 (Progress 1→12) — `integrations/ais/src/`
Dark-vessel detection (`dark-vessel.ts`, SAR↔AIS gap correlation); MarineTraffic/VesselFinder
cross-reference (`cross-reference.ts`); vessel type+flag+operator (`vessel-registry.ts`, MID→flag);
cargo/class inference (`cargo-inference.ts`); port-call timeline (`port-calls.ts`); OFAC/EU/UK
sanctions screening + highlight (`sanctions.ts`); shadow-fleet scoring (`shadow-fleet.ts`); Black
Sea/Azov focus polygons (`focus-zones.ts`); heading-arrow + class-color paint (`maritime`);
filter facets route (`api/layers/maritime`); per-vessel SEO page (`/vessels/[mmsi]`).

### `layers/aviation` — 8/8 (Progress 2→10) — `integrations/adsb/src/`
Military/restricted estimation (`mil-estimation.ts`, squawk/hex/callsign heuristic); callsign+hex
resolution (`callsign-resolver.ts`); operator+type lookup (`operator-lookup.ts`); no-fly airspace
GeoJSON (`airspace.ts`); altitude-ramp heading-arrow paint (`aviation`); filter facets route;
private-aircraft redaction (`privacy.ts`, PIA/LADD); historical replay (`replay.ts`).

### `layers/civilian_alerts` — 9/9 (Progress 2→11) — `integrations/civilian-alerts/src/`
Active-alert highlighting (`highlight.ts`); Web Push/VAPID delivery (`web-push.ts`); family/watchlist
scoping (`watchlist.ts`); per-region archive (`archive.ts`); duration stats (`stats.ts`); pulsing
overlay paint (`air_raid_alerts`); opt-in no-autoplay sound policy (`sound-policy.ts`); shelter
cross-link (`shelter-link.ts`); civilian-safe plain-language mode uk/ru/en (`civilian-mode.ts`).

### `layers/power_outages` — 5/5 (Progress 4→10) — `integrations/power-outages/src/`
Ukrenergo/oblenergo ingestion (`utility-adapter.ts`); VIIRS night-lights anomaly
(`viirs-nightlights.ts`); coverage-gradient paint (`power_outages`); cause/region/duration facets
(route); clearly-labeled forecast layer (`forecast.ts`).

### `layers/communications_outages` — 7/7 (Progress 2→9) — `integrations/netblocks/src/`
RIPE Atlas (`ripe-atlas.ts`); operator status pages (`operator-status.ts`); BGP anomaly
(`bgp-anomaly.ts`); submarine cables (`submarine-cables.ts`); per-region severity index
(`severity-index.ts`); dashed-outline paint (`communication_outages`); power correlation
(`power-correlation.ts`, editorially neutral).

### `layers/infrastructure` — 7/7 (Progress 5→12) — `integrations/infrastructure/src/`
OSM base + curated, military-excluded (`osm-base.ts`); Sentinel change-detection link
(`change-detection-link.ts`); CV damage classifier interface+heuristic (`damage-classifier.ts`);
severity 3D fill-extrusion paint (`infrastructure_damage`); power auto-link (`power-link.ts`);
comms auto-link (`comms-link.ts`); per-oblast aggregation (`aggregation.ts`).

### `layers/missiles` — 7/7 (Progress 5→12) — `integrations/missiles/src/`
IR+OSINT launch detection (`launch-detection.ts`); trajectory + uncertainty cone (`trajectory.ts`);
impact verification pipeline (`impact-verification.ts`); distinct ballistic-arc paint (`missilesArc`);
civilian-alert impact fanout (`alert-fanout.ts`); impact heatmap (`impact-heatmap.ts`); compliance
guard blocking predicted-impact for live events (`compliance.ts`).

### `layers/drones` — 8/8 (Progress 6→14) — `integrations/drones/src/`
UAV silhouette classifier interface+heuristic (`classifier.ts`); audio classifier (`audio-classifier.ts`);
arc+decay paint (`dronesArc`); verify-cues panel (`verify-cues.ts`); playback animation (`playback.ts`);
NRT civilian-launch privacy guard (`privacy.ts`); feed-source config + verification gate (`feeds.ts`);
equipment-page SEO link (`equipment-link.ts`).

### `layers/fires` — 7/7 (Progress 3→10) — `integrations/nasa-firms/src/`
Sentinel-2 SWIR hot-spots (`swir-hotspots.ts`); conflict-vs-wildfire classifier, conservative
(`fire-classifier.ts`); burn-scar persistence (`burn-scar.ts`); per-fire timeline (`fire-timeline.ts`);
air-quality cross-ref (`air-quality.ts`); pulsing radiance + smoke-direction paint (`active_fires`);
evac-advisory tie-in (`evac-tie-in.ts`).

### `layers/thermal` — 3/8 closed this sprint (Progress 3→6) — `integrations/nasa-firms/src/`
Sentinel-3 SLSTR ingestion (`slstr-adapter.ts`); Landsat 8/9 TIRS thermal bands
(`landsat-thermal.ts`); heat-gradient paint (`thermal`). *(Left open: cloud-mask handling, day/night
differential.)*

### `layers/satellite_imagery` — 10/10 (Progress 0→10) — `integrations/sentinel-hub/src/`
S2 cloud-free mosaic (`s2-mosaic.ts`); S1 SAR overlay (`s1-sar.ts`); change-detection differencing
(`change-detection.ts`); AOI scheduler (`aoi-scheduler.ts`); phase-gated commercial providers +
per-scene metering (`commercial-providers.ts`); scene metadata + license (`scene-metadata.ts`);
overlay opacity model (`overlay-config.ts`); per-tile attribution (`attribution.ts`); compare slider
(`compare.ts`); annotation tool (`annotations.ts`).

### `layers/troop_movement` — 10/10 (Progress 0→10) — `integrations/troop-movement/src/`
**Ethics-loaded layer — fail-closed by default.** Strict post-event/attributed ingestion guard
(`ingestion-policy.ts`); ≥2 independent sources + media corroboration (`verification.ts`);
per-scenario enforced delay floor (`delay-policy.ts`); publicly-attributed OOB only (`oob.ts`);
low-precision 8-point bearing buckets (`movement-vectors.ts`); equipment cross-link
(`equipment-link.ts`); large fuzzed-marker paint (`troop_movement`); side/branch/era facets route
(pre-delayed + fuzzed demo data); mandatory editorial review gate (`review-queue.ts`); misuse-spike
kill-switch, operator-clear-only (`kill-switch.ts`).

### `layers/ai_predictions` — 5/5 (Progress 5→10) — `services/predictions/src/`
Hatched/dashed distinct-hue paint (`ai_predicted_zones`); per-model-version backtest scorecard
(`backtest.ts`, Brier/ECE/hit-rate); directional-only enforcement (`prediction-policy.ts`);
did-event-occur feedback eval (`feedback-eval.ts`); civilian-default-off persona gating
(`persona-gating.ts`).

### `layers/social_media_activity` — 3/3 (Progress 7→10) — `services/social/src/`
Pulsing intensity paint (`social_media_heatmap`); misinfo cross-layer link (`misinfo-link.ts`);
<60s end-to-end SLO + stage budgets + breach detector (`latency-slo.ts`).

## Registry & shared-file merges
- `layers/src/registry.ts`: added missing `LayerConfig` entries for **`missiles`** (military),
  **`thermal`** (environment), **`sentinel_sar`** (imagery). Braces balanced (161/161, 56/56).
- `apps/web/src/lib/map-style.ts`: merged 10 new `LAYER_PAINT_SPECS` keys (maritime, aviation,
  air_raid_alerts[+outline], power_outages, communication_outages, missilesArc, dronesArc,
  ai_predicted_zones, social_media_heatmap) plus the in-place infrastructure_damage / active_fires /
  thermal / troop_movement entries. Braces balanced (28/28, 201/201).

## Incidental fixes (pre-existing bugs found during the sprint)
- `integrations/missiles/src/classifier.ts` — MLRS subtype pattern array closed with `)` instead of
  `]` (would break `tsc` of the package). Fixed (one char), Cyrillic preserved.
- `integrations/infrastructure/src/adapter.ts` — transport keyword `міст"` missing its opening
  quote. Fixed.

## Notes / honest caveats
- No local TypeScript toolchain (builds run on CI per project convention); code mirrors existing
  patterns and imports were resolved by inspection. Recommend a CI `pnpm typecheck` before deploy.
- Mojibake scan across all new/edited files: **0 markers**. All `uk`/`ru` Cyrillic intact.
- Several modules carry explicit "external fetch not wired" caveats (Sentinel Hub SWIR, air-quality
  network, SLSTR/Landsat raster download) — the math/normalisation/contracts are real; the upstream
  data download is the remaining production step.
- `services/predictions` and `services/social` were created as `@ua-map/*` service packages (matching
  `services/misinfo` / `services/anomaly`), since the AI/social tasks are governance/eval logic, not
  data-source integrations.
