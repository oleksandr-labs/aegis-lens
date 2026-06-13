# TODO — Experimentation (A/B / Multivariate)

## Goal
Data-driven decisions on UX, pricing, and AI behavior. Avoid HiPPO-driven choices.

## Progress
- 10 / 10 done

## Tasks
- [x] Experiment platform (GrowthBook / Statsig / Eppo / custom) — custom: `services/experiments/` with ExperimentRegistry, assignment, types
- [x] Experiment lifecycle: design → review → ship → analyze → ship-or-kill — `ExperimentStatus`: draft → running → paused → shipped | killed; `PATCH /api/experiments/:id?action=start|pause|ship|kill`
- [x] Stat-significance + sequential testing where appropriate — `services/experiments/src/statistics.ts`: `testProportions()` (pooled z-test, Newcombe CI), `testMeans()` (Welch z-test), `runSequentialTest()` (mSPRT always-valid p-values, valid at any interim look), `calculateSampleSize()` (power calculation for proportions), `evaluateGuardrails()` (direction-aware breach detection), `runMultivariateTests()` (pairwise control vs all treatments)
- [x] Pre-registered hypotheses + guardrail metrics — `Hypothesis` type with metric/direction/minimumDetectableEffect/guardrails[]
- [x] Per-experiment dashboard — `GET /api/experiments`, `GET /api/experiments/:id`
- [x] Stratification by persona / locale / acquisition channel — `Eligibility.personas[]`, `.tiers[]`, `.locales[]` + SHA-256 sticky bucketing
- [x] No experiments that risk user safety (critical alerts excluded from any test) — safety gate in `POST /api/experiments`: blocks names matching alert/critical/safety keywords unless safetyExcluded:true
- [x] Holdout cohort for measuring cumulative impact — `type: "holdout"` ExperimentType; un-allocated percentage = holdout bucket
- [x] Experiment registry (shippable + killed) — `experimentRegistry.list("shipped")` / `.list("killed")`; `winnerVariantKey` on ship
- [x] Lessons-learned doc per killed experiment — `lessonLearned` field on `kill(id, lessonLearned)`

## i18n
- Localized variants need separate statistical power planning.

### Примітки
Never A/B-test misinformation thresholds or safety-critical UX.
