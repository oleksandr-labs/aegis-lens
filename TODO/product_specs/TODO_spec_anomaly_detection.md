# SPEC — Anomaly Detection

## Status
In Progress

## Goal
Surface "something has changed" with calibrated alarm thresholds.

## Tasks
- [x] Time-series baselines per (region × class) — 24h / 7d / 30d — `services/anomaly/src/baseline.ts`
- [x] Z-score + EWMA + change-point detection — `RollingBaseline.zScore()` + `EWMADetector`
- [x] Spatial clustering (HDBSCAN) for fast emergent clusters — `services/anomaly/src/spatial-cluster.ts`
- [ ] Embedding-space drift for topic shifts
- [x] Per-anomaly explanation (what + vs what) — `explanationEn/Uk` on `AnomalyAlert` with ratio + region + class
- [ ] Suppression rules (planned scheduled events / known noise)
- [ ] Backtests on 2022–2025 historical data
- [ ] Eval: TP/FP rates per class

## i18n
- N/A directly.

### Примітки
Conservative thresholds protect from alarm fatigue.
