# Sprint 2.60 Progress

**Date:** 2026-06-06
**Status:** Complete
**Theme:** Connector completion + AI/ML services — closes `integrations/` 100% and the entire `ai/` folder
**Tasks closed:** 87 (5 integration connectors = 31 + 8 AI/ML services = 56)

Wave 1 of the "full backlog" program. Same proven pattern (10 parallel agents → typed modules /
codeable contracts → canonical `packages/event-schema` v1 where events are produced → `COMPLIANCE.md`
for license/account/ToS tasks). All handoffs `<none>` — **no new map layers this wave**, so registry/
map-style untouched (still 26 layers). After this sprint **`TODO/integrations/` is fully closed.**

## Integration connectors (31) — folder now 100% done
- **Anthropic/OpenAI (10)** — NEW `integrations/llm-providers` (`@ua-map/llm-providers`): `LlmProvider`
  interface + Anthropic/OpenAI/open-weights clients, prompt caching, provider-agnostic streaming, unified
  tool-calling, cost tracking, BYOK, cross-provider eval harness, pre-send PII redaction, outage failover
  router. **Latest Claude ids only** (opus-4-8/sonnet-4-6/haiku-4-5); fake-mode without keys.
- **Stripe (10)** — NEW `integrations/stripe` (existing webhook route kept): radar rules, tier catalog,
  metered billing (feeds services/metering), Stripe Tax, Connect Express payouts, customer portal,
  idempotency guard, refund/chargeback, en/uk dunning, PCI SAQ-A (Elements-only, Luhn guard). USD+EUR/UAH/GBP.
- **Mapbox (5)** — NEW `integrations/mapbox`: plan/billing config, style-asset CDN, per-feature usage
  tracking + monthly audit, per-layer Mapbox-vs-PostGIS source policy, cache + MapLibre offline fallback.
- **Telegram (4)** — extended: MTProto client contract (flood-wait discipline), media downloader
  (size/MIME/AV quarantine, fail-closed), bounded resumable backfill, inbound webhook secret-token verify.
- **NASA FIRMS (2)** — extended: `FIRMS_API_KEY` env config reader + COMPLIANCE, NRT ~3h-SLA latency monitor.

## AI/ML services (56) — `ai/` folder now 100% done
- **AI SEO generation (11)** — NEW `services/ai-seo`: grounded metadata/FAQ/intro/internal-link/schema.org/
  alt-text/locale-variant generators, hallucination quality-gate (**fail-closed for YMYL**), confidence,
  dedup, cost tracking, editorial/native-review routing. Loose-coupled `LLMBackend`.
- **Vision/CV (17)** — extended `services/vision`: object/aircraft/vessel/damage/vegetation detectors,
  reverse-image (TinEye + pHash), manipulation/deepfake fusion, video keyframes, Sentinel-2/1 + burn-scar,
  AOI subscription scheduler, multimodal geolocation, privacy face/plate blur, confidence calibration,
  model registry, human-review gate. CV tasks = typed interface + heuristic baseline ("weights pending").
- **NLP (8)** — extended `services/nlp`: image/video/document OCR, Whisper+diarization STT, per-language
  uk/ru/en calibration, batch reprocessing, HITL review queue (eval set cited from existing `src/eval/`).
- **Entity extraction (5)** — extended: coreference, cross-doc disambiguation, Wikidata `sameAs`, per-class
  P/R/F1 eval, auto-tagging bridge. Mirrors canonical KG/`EntityMention` vocab + ISW refKey shape.
- **Misinformation (5)** — extended `services/misinfo`: recycled-media (hash/pHash/embedding), geo & temporal
  contradiction (solar-elevation), coordinated-behavior heuristics, public methodology page. Public types
  unchanged → `services/social` + `integrations/milbloggers` mirrors stay compatible.
- **Anomaly (4)** — extended: cross-source corroboration weighting, embedding-drift novelty, directional
  trend forecasting (Holt, no point predictions), no-look-ahead backtest harness.
- **Auto-tagging (3)** — extended: embedding zero-shot fallback (hashing embedder baseline), HITL→retraining
  loop, tag-as-filter-facet.
- **Copilot (3)** — NEW `services/copilot` (route kept, now calls `enforceGrounding`): hybrid RAG
  (Qdrant+Elastic seams + baselines, RRF), per-case-file memory, in-code grounding enforcement
  (uncited claim → localized refusal), eval suite (factuality/citation/refusal).

## Notes / honest caveats
- No local TS toolchain (CI builds); agents matched patterns + verified imports by inspection (one ran a
  Node smoke-test). Recommend `pnpm typecheck` on CI. Mojibake scan: **0**. All re-exports resolve.
- Commercial/ML tasks shipped as the documented codeable contract (typed gated client/interface +
  COMPLIANCE), never fabricated weights/secrets — activation needs env keys + signed agreements.
- Grounding/YMYL/ethics enforced in code (fail-closed): copilot grounding, ai-seo YMYL gate, vision
  privacy/human-review, misinfo neutral-no-takedown, llm-providers pre-send PII redaction.
- One agent corrected a `copilot` header miscount (17→16 actual task lines) and an `nlp` undercount (16→17).
- **Folder status:** `integrations/` and `ai/` are now fully closed. Continues 2.57–2.59.
