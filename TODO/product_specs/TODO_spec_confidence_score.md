# SPEC — Confidence Score

## Status
Draft

## Goal
A defendable, monotonic, calibrated confidence number per event.

## Tasks
- [x] Inputs: source reputation × source count × independence × media verification × geolocation precision × content checks — `ConfidenceInputs` in `packages/event-schema/src/confidence-score.ts`
- [x] Bayesian update model per ingest event — log-odds accumulation in `computeConfidenceScore()`
- [ ] Calibration set + ECE measurement
- [ ] Public methodology page
- [x] Per-source contribution explainability — `components` breakdown in `ConfidenceResult`
- [x] Threshold semantics (what does 0.7 vs 0.9 mean for users?) — `CONFIDENCE_THRESHOLDS` + `getConfidenceLabel()` in v1.ts (low/medium/high/verified)
- [ ] Drift monitoring
- [ ] Eval on held-out historical events

## i18n
- Confidence label translation: low / medium / high per locale.

### Примітки
A confidence number people misread is worse than no number.
