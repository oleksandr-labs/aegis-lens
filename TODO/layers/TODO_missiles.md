# TODO — Layer: Missiles & Ballistic / Cruise

## Goal
Track launches, transit, intercepts, impacts. Distinguish missile classes.

## Progress
- 12 / 12 done

## Tasks
- [x] Subtypes: ballistic, cruise, hypersonic, air-launched, ATGM, MLRS — `integrations/missiles/src/types.ts`
- [x] Launch detection from satellite IR (FIRMS / Sentinel adapted) + community OSINT — `integrations/missiles/src/launch-detection.ts`
- [x] Trajectory reconstruction with uncertainty cones — `integrations/missiles/src/trajectory.ts`
- [x] Intercept events (with intercept system if known) — `intercepted` + `interceptSystem` fields
- [x] Impact site verification (CV + satellite change detection) — `integrations/missiles/src/impact-verification.ts`
- [x] Per-model classification (Kinzhal, Iskander, Kalibr, Storm Shadow, etc.) — `integrations/missiles/src/classifier.ts`
- [x] Damage assessment auto-link to infrastructure layer — `linkedInfrastructureEventId` field
- [x] Animated arc styling distinct from drones — `missilesArc` paint spec in `c:\tmp\sprint257_shared_C6.txt` (red ballistic arc + uncertainty cone; distinct from drones amber)
- [x] Filter facets: class, origin, target type, intercept status — `GET /api/layers/missiles`
- [x] Civilian-alert auto-fanout for impact areas — `integrations/missiles/src/alert-fanout.ts`
- [x] Historical heatmap of impact zones — `integrations/missiles/src/impact-heatmap.ts`
- [x] Compliance: do not publish predicted-impact projections for live events — `integrations/missiles/src/compliance.ts`

## i18n
- Class names + transliteration; civilian alerts localized to all civilian-tier locales.

### Примітки
Most reputation-sensitive layer. Verification gate before public publish.
