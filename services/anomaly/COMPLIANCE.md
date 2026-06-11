# Compliance — `@ua-map/anomaly`

Anomaly detection is an early-warning aid, not a fact source. This file records the constraints
the service operates under.

## Operating principles

1. **Signals, not verdicts.** Anomaly alerts mean "something is changing" — they never assert an
   event is real or that a claim is true. Confidence/severity are advisory.
2. **Anti-alarm-fatigue.** Strict thresholds (Z ≥ 2.0, HHI > 0.5, novelty deadbands) and
   per-user calibration are required. **Trend forecasting is directional only** — the UI must
   never show point predictions (see `trend-forecast.ts`, which exposes direction + strength +
   an always-on uncertainty caveat, not a predicted count).
3. **No look-ahead in evaluation.** The backtesting harness updates baselines strictly after
   scoring each bucket, so reported precision/recall reflect causal, deployable behaviour.
4. **Single-source spikes are downweighted.** Cross-source corroboration multiplies an anomaly
   score up only when independent source *domains* agree; a one-domain spike is suspect, not a
   boost (`corroboration-anomaly.ts`).

## Data sources & inputs

- Inputs are normalized event counts, coordinates, source domains, and (for drift) embeddings —
  all produced **upstream** (ingest / NLP). This package performs no scraping and stores no PII.
- The backtesting dataset (2022–2025 Ukraine archive) is loaded by a separate ingest job and is
  **not** bundled here; `syntheticFixture()` provides a runnable stand-in for tests/demos.

## Secrets / environment

Pure computation; reads **no secrets**. If the backtest dataset or alert store is later backed by
a database, configure via `process.env` (e.g. `ANOMALY_DB_URL`) and document it here — never
hardcode credentials.

## ML / model status

Embedding-drift (nearest-neighbour novelty) and trend forecasting (Holt linear smoothing) are
explainable heuristic baselines, dependency-free. Prophet / temporal-transformer / learned drift
models can replace them behind the same interfaces. No model weights are fabricated.
