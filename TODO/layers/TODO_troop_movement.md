# TODO — Layer: Troop Movement (Lawful + Verified)

## Goal
Aggregate publicly verified troop / unit movement reports — never targeting-grade, never live.

## Progress
- 10 / 10 done

## Tasks
- [x] Strict ingestion policy: only post-event, publicly attributed reports — integrations/troop-movement/src/ingestion-policy.ts (evaluateIngestion: typed reject reasons, fail-closed, MIN_POST_EVENT_LAG)
- [x] Verification threshold: ≥2 independent sources + media corroboration — integrations/troop-movement/src/verification.ts (checkVerification + countIndependentSources by unique host)
- [x] Delay policy: no near-real-time precise positions (configurable per scenario) — integrations/troop-movement/src/delay-policy.ts (SCENARIO_MIN_DELAY_MS, applyDelay, ABSOLUTE_MIN_DELAY floor, fail-closed)
- [x] Unit identification (publicly attributed OOB only) — integrations/troop-movement/src/oob.ts (OobUnit model, publiclyAttributed required, resolveUnit fail-closed)
- [x] Direction-of-movement vectors at low precision — integrations/troop-movement/src/movement-vectors.ts (8-point BearingBucket, no exact coords)
- [x] Cross-link to equipment layer per unit — integrations/troop-movement/src/equipment-link.ts (equipmentRefsForUnit → equipment layer hrefs)
- [x] Map style: large radius / fuzzed marker — apps/web/src/lib/map-style.ts LAYER_PAINT_SPECS.troop_movement (large radius + circleBlur 1 + low opacity)
- [x] Filter facets: side, branch, era — apps/web/src/app/api/layers/troop-movement/route.ts (side/branch/era/region filters; records pre-delayed+fuzzed)
- [x] Editorial review queue mandatory before publish — integrations/troop-movement/src/review-queue.ts (editorialReviewQueue, canPublish/canExposeToPublic gate, default draft)
- [x] Disable layer entirely if exporters flag misuse spike — integrations/troop-movement/src/kill-switch.ts (isMisuseSpike + troopMovementKillSwitch circuit breaker, manual clear only)

## i18n
- Unit names + transliteration.

### Примітки
Most ethically loaded layer. Default: gated to vetted accounts. Public view delayed and fuzzed.
