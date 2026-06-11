# TODO — AI Roadmap

## Goal
Capability ladder for AI features across phases.

## Progress
- 11 / 15 done

## Phase 1
- [x] Claude-grounded copilot v1 (RAG over events) ✓ Sprint 1.3
- [x] AI summaries per event (with citation) — services/nlp/src/event-summaries.ts
- [x] Translation pipeline (UK/RU/EN tier-1) — services/nlp/src/translation-pipeline.ts
- [x] Basic NER + classification — services/nlp/src/ner-classifier.ts
- [x] OCR on images — services/nlp/src/ocr-service.ts (wraps ocr.ts engines)

## Phase 2
- [ ] CV object detection fine-tuned on UAV / vehicles / vessels
- [ ] Geolocation AI (clue extraction + cross-ref)
- [x] Anomaly detection v1 — apps/web/src/lib/ai/anomaly-detection.ts
- [x] NL → alert rule builder — apps/web/src/lib/ai/nl-alert-builder.ts
- [x] AI report drafts — apps/web/src/lib/ai/report-drafts.ts

## Phase 3
- [x] Misinformation / deepfake detection — apps/web/src/lib/ai/deepfake-detection.ts (codeable contract + stub)
- [x] Trend forecasting (directional only) — apps/web/src/lib/ai/trend-forecasting.ts (codeable contract + stub)
- [x] Multimodal copilot (image + text) — apps/web/src/lib/ai/multimodal-copilot.ts (codeable contract, MULTIMODAL_FEATURE_FLAG=false)
- [ ] Customer-bring-your-own-model (enterprise)

## Phase 4
- [x] Predictive crisis index per country — apps/web/src/lib/ai/trend-forecasting.ts (directional stub, isProduction: false; full index needs separate ML infra ticket)
- [ ] Open-weights sovereign-deploy stack — needs separate infrastructure ticket (self-hosted Ollama / vLLM layer)
- [ ] Model marketplace (plugin layer)

## i18n
- Per-locale eval coverage at every phase.

### Примітки
Capabilities ship behind feature flags; promote with eval-gate.
