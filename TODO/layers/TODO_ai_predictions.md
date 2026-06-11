# TODO — Layer: AI Predictions

## Goal
Forecast / probability overlays — clearly labeled, never confused with observation.

## Progress
- 10 / 10 done

## Tasks
- [x] Forecasted event-density per region (24h / 7d) — `GET /api/layers/ai-predictions?type=event_density&horizon=24h`
- [x] Anomaly-trigger probability map — `type=anomaly_probability` query param
- [x] Conflict-escalation index per region (composite) — `type=escalation_index` + `escalationProbability` field
- [x] Confidence cones / shaded probability — `ci90` confidence interval in every prediction
- [x] Map style: hatched / dashed overlay, distinct hue — paint spec `ai_predicted_zones` (dashed amber #ffcc00 fill + dashed line overlay) in `c:\tmp\sprint257_shared_C10.txt` for `LAYER_PAINT_SPECS`
- [x] UI badge: "AI prediction — not observation" — `isPrediction: true` + `disclaimerEn/Uk` in every response
- [x] Backtest results published per model version — `services/predictions/src/backtest.ts` (Brier/skill/ECE/calibration/hit-rate schema + `PublishedBacktestRegistry`)
- [x] No actionable point predictions (directional only in UI) — `services/predictions/src/prediction-policy.ts` (`enforceDirectionalOnly` rounds to region/direction/horizon + `findActionableViolations` guard)
- [x] Feedback loop: did the predicted event occur? (model eval) — `services/predictions/src/feedback-eval.ts` (matches predictions to verified events → TP/FP/FN/TN labels + `toScoredOutcomes`)
- [x] Disabled by default for civilian persona — `services/predictions/src/persona-gating.ts` (`PERSONA_LAYER_DEFAULTS`: civilian => `ai_predicted_zones: false`)

## i18n
- Prediction labels + caveats localized.

### Примітки
The most easily misread layer. Restrain UX, label heavily.
