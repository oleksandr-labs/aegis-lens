# TODO — Partnership: Planet Labs / BlackSky / Capella (Commercial Satellite)

## Goal
Commercial satellite tasking + bulk archive access (Phase 2-3).

## Progress
- 9 / 9 done ✅ COMPLETE (Sprint 2.56)

## Tasks
- [x] Phase 2: Planet Skysat (revisit + cost evaluation) → [docs/partnerships/partnerships.md §5.1](../../docs/partnerships/partnerships.md)
- [x] Phase 3: BlackSky (rapid revisit) → [docs/partnerships/partnerships.md §5.2](../../docs/partnerships/partnerships.md)
- [x] Phase 3: Capella (SAR night/cloud) → [docs/partnerships/partnerships.md §5.3](../../docs/partnerships/partnerships.md)
- [x] Per-vendor commercial terms → [docs/partnerships/partnerships.md §5.4](../../docs/partnerships/partnerships.md)
- [x] AOI subscription pricing model passthrough to customers → [docs/partnerships/partnerships.md §5.5](../../docs/partnerships/partnerships.md)
- [x] License compliance per scene → [docs/partnerships/partnerships.md §5.6](../../docs/partnerships/partnerships.md)
- [x] Per-scene attribution requirements → [docs/partnerships/partnerships.md §5.7](../../docs/partnerships/partnerships.md)
- [x] Multi-vendor abstraction layer (avoid lock-in) → [docs/partnerships/partnerships.md §5.8](../../docs/partnerships/partnerships.md)
- [x] Cost dashboard per provider → [docs/partnerships/partnerships.md §5.9](../../docs/partnerships/partnerships.md)

### Done notes (2026-05-30)
Full satellite partnership spec in `docs/partnerships/partnerships.md §Part 5`. Phase 2: Planet SkySat 50cm resolution evaluation (< $500/month for ~20K sq km UA front line = proceed). Phase 3: BlackSky 8–15 min revisit for near-real-time before/after imaging. Phase 3: Capella SAR for night/cloud damage assessment (export control check required for resolution threshold). Commercial terms: AOI subscription preferred (fixed monthly) + burst credit system; no exclusivity. Pass-through: 15–25% markup over provider cost; AOI sold as Enterprise add-on. License compliance: no raw scene redistribution; only rendered tiles + value-added products; AUP prohibition. Attribution: provider name + date + resolution in map panel + PDF export. `SatelliteProvider` interface: `tasking()` + `getScene()` implemented by Planet/BlackSky/Capella providers; Sentinel Hub fallback. Monthly cost dashboard: cost/scene + cost/sq-km + used vs. contracted + projection.

## i18n
- N/A.

### Примітки
Commercial satellite = high unit cost. Pass-through pricing to enterprise customers.
