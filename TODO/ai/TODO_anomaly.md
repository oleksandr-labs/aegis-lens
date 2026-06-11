# TODO — Anomaly & Trend Detection

## Goal
Surface "something is changing" before any single event is newsworthy.

## Progress
- 10 / 10 done

## Tasks
- [x] Time-series baselines per region × event class (24h/7d/30d) — `services/anomaly/src/baseline.ts` (RollingBaseline: 7-day hourly ring-buffer per region×class key)
- [x] Z-score + EWMA anomaly detection — `services/anomaly/src/baseline.ts` (RollingBaseline.zScore() + EWMADetector with configurable α and σ threshold)
- [x] Spatial clustering (DBSCAN / HDBSCAN) on incoming events — `services/anomaly/src/spatial-cluster.ts` (pure DBSCAN haversine, detectSurges for rapid temporal+spatial concentration)
- [x] Cross-source corroboration scoring (multiple independent sources → boost) — `scoreCorroboration()` + `applyCorroboration()` in `services/anomaly/src/corroboration-anomaly.ts` (distinct-domain independence → multiplier 0.5–1.5; mirrors `services/verify/src/corroboration.ts` SourceReport; single-domain spikes down-weighted)
- [x] Embedding-space drift detection (new topic emerging) — `EmbeddingDriftDetector` in `services/anomaly/src/embedding-drift.ts` (per-region rolling reference set, nearest-neighbour novelty by cosine, warm-up + deadband)
- [x] Source-burst detection (one channel suddenly dominating a topic = suspicion) — `services/anomaly/src/source-burst.ts` (HHI-based SourceDiversityTracker, burst flag at HHI > 0.5)
- [x] Trend forecasting (Prophet / temporal transformers) — directional only, no point predictions in UI — `forecastTrend()` in `services/anomaly/src/trend-forecast.ts` (Holt linear smoothing → direction + strength + always-on uncertainty caveat EN/UK; NO point predictions exposed)
- [x] Alert generation on anomaly + escalation rules — `services/anomaly/src/alert-generator.ts`: `generateAlert()`, `evaluateZScore()`, `evaluateSourceDiversity()`, `listAlerts()`; `GET /api/anomalies`
- [x] Per-anomaly explanation (what's unusual, vs what) — `explanationEn`/`explanationUk` on `AnomalyAlert` with templated context (ratio, region, class)
- [x] Backtesting harness on historical 2022–2025 Ukraine data — `runBacktest()` + `syntheticFixture()` in `services/anomaly/src/backtest.ts` (chronological replay, no look-ahead, precision/recall/F1 + mean lead-time vs labeled anomaly windows; runnable synthetic fixture pending the private archive)

## i18n
- N/A.

### Примітки
Anomaly UX must avoid alarm fatigue — strict thresholds + per-user calibration.
