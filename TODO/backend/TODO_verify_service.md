# TODO — Service: Verify

## Goal
Cross-source corroboration + confidence scoring + verification-state machine.

## Progress
- 10 / 10 done

## Tasks
- [x] Verification state machine: ingested → enriched → corroborated → verified | disputed | retracted — `services/verify/src/state-machine.ts` (canTransition, transition, recommendTransition)
- [x] Cross-source agreement scorer — `services/verify/src/corroboration.ts` (scoreAgreement: location/timing/class/subclass disagreement detection, weighted votes, haversine 10km tolerance)
- [x] Provenance chain builder — `services/verify/src/provenance.ts` (ProvenanceChain, appendNode, initChain, formatCitation, InMemoryProvenanceStore)
- [x] Confidence model (Bayesian update per source) — `services/verify/src/confidence.ts` (computeConfidence, log-odds Bayesian update)
- [x] Danger score model — `services/verify/src/confidence.ts` (computeDangerScore, severity × confidence × class multiplier)
- [x] HITL review queue feed — `services/verify/src/review-queue.ts` (`reviewQueue` singleton, `computePriority()` = danger×uncertainty×freshness, `claimNext()`/`resolve()`); route `GET/POST /api/review/queue`
- [x] Retraction propagation downstream — `services/verify/src/retraction.ts` (`buildPropagationTargets()` + `propagateRetraction()` fans out to alerts/reports/linked events/notebooks/cases/caches/embeds/webhooks with per-artifact action)
- [x] Per-event audit log — `services/verify/src/audit-log.ts` (AuditEntry, InMemoryAuditStore)
- [x] Eval suite (gold-standard verified events) — `services/verify/src/eval.ts` (`VERIFY_GOLD_SET` 10 events, `runVerifyEval()` → precision/recall/F1/ECE calibration/danger MAE/confusion)
- [x] Configurable thresholds per layer / per tier — `services/verify/src/state-machine.ts` (VerificationThresholds + DEFAULT_THRESHOLDS)

## i18n
- Verification outputs translated for user display.

### Примітки
Verification is the moat. Don't tune it on instinct — backtest.
