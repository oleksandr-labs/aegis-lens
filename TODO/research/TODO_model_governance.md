# TODO — AI Model Governance

## Goal
Every model deployed is versioned, evaluated, monitored, and rollback-able. No silent regressions.

## Progress
- 4 / 14 done

## Tasks

### Inventory
- [x] Model registry (MLflow / Weights & Biases / custom) with metadata: provenance, training data, license, eval scores, deployment status — `docs/ai/model-registry.md` with model card template + 4 registered models
- [x] Per-model card (purpose, intended use, limitations, biases known) — model card template in registry; all 4 current models have cards
- [ ] License tracking (especially for open-weights)

### Lifecycle
- [x] Eval-gated promotion (staging → prod requires passing eval suite) — promotion checklist in `model-registry.md`
- [ ] Shadow deployment (run new model alongside current; compare offline)
- [ ] Canary deployment
- [ ] Auto-rollback on regression

### Monitoring
- [ ] Prediction drift detection
- [ ] Output quality sampling + human grading
- [ ] Cost per prediction
- [ ] Per-model latency p50/p95/p99

### Compliance
- [x] EU AI Act readiness (risk classification per model) — EU AI Act risk class field on every model card; all current models classified
- [ ] Data provenance for training (where applicable)
- [ ] Right-to-explanation for high-impact outputs

## i18n
- Per-locale eval suites; do not promote globally on EN-only evals.

### Примітки
A model regression in production = a credibility incident. Treat model deploys with the rigor of code deploys.
