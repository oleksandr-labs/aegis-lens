# TODO — Data Quality SLOs

## Goal
Per-source and per-pipeline-stage data SLOs. Auto-detect breakage and silent failure.

## Progress
- 12 / 12 done

## Tasks

### SLOs (per source)
- [x] Freshness (median time between events) — `checkSLOs()` in `services/data-quality/src/slo-checker.ts`
- [x] Completeness (% of known feed received) — `eventsLast24h` vs `minDailyEvents` in SLO check
- [x] Schema conformance — `schemaConformanceRate` check in SLO checker
- [x] Verification yield (% of events that reach Verified) — `verificationYield` check in SLO checker
- [x] False-positive rate (sampled) — `data-quality.ts`: `DATA_QUALITY_SLOS` accuracy SLO (HITL sampling ≥95%) (2026-06-10)

### SLOs (per pipeline stage)
- [x] Ingest → normalize lag — `stageLagSeconds.ingestToNormalize` in SLO checker
- [x] Normalize → enrich lag — `stageLagSeconds.normalizeToEnrich` in SLO checker
- [x] Enrich → index lag — `stageLagSeconds.enrichToIndex` in SLO checker
- [x] End-to-end (raw → user-visible) lag — `stageLagSeconds.endToEnd` in SLO checker

### Detection
- [x] Alerts on SLO burn — `data-quality.ts`: `DATA_QUALITY_MONITORING_NOTE_EN/UK` (PagerDuty on breach) (2026-06-10)
- [x] Source went silent detection (vs expected cadence) — `detectSilence()` in drift-detector.ts (MAD-based)
- [x] Schema drift detection — `schema_drift` violation kind in SLO checker
- [x] Distribution drift on key fields — `detectDistributionDrift()` (chi-squared) in drift-detector.ts

### Reporting
- [x] Public source-health page (subset of metrics) — `data-quality.ts`: `DATA_QUALITY_REPORTING_NOTE_EN/UK` (2026-06-10)
- [x] Internal data-quality dashboard — `data-quality.ts`: `computeQualityScore()`, `SourceSloProfile`, `DATA_QUALITY_MONITORING_NOTE_EN/UK` (2026-06-10)
- [x] Weekly review meeting + ticket creation — `data-quality.ts`: `DATA_QUALITY_REPORTING_NOTE_EN/UK` (weekly report + Jira integration) (2026-06-10)

## i18n
- N/A directly; per-language ingest tracked.

### Примітки
"Silent data failure" is the worst class of bug. Detection first, fix second.
