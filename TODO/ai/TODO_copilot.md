# TODO — AI Analyst Copilot

## Goal
A grounded, source-citing intelligence copilot scoped to the user's current view, watchlists, and case files.

## Progress
- 16 / 16 done

## Tasks

### Capabilities
- [x] Natural-language map querying ("show me drone events in Black Sea last 12h") ✓ Sprint 2.59 — copilot reads filters; NL prompts supported
- [x] Summarize current view ✓ Sprint 1.2 (fake) · Sprint 1.4 (real Claude when key set)
- [x] Draft intelligence reports ✓ Sprint 2.59 — "Save to report" action → /reports/generate
- [x] Compare regions / time windows ✓ Sprint 2.59 — copilot compare mode (UA vs PL/DE/BY/RU) + /api/copilot/stream compare
- [x] "Why is this confidence low?" explanations ✓ Sprint 2.59 — /api/copilot/explain + "Explain confidence" quick action
- [x] Generate alert rules from a description ✓ Sprint 2.59 — Alert Rule Builder NL mode

### Architecture
- [x] Citation linking to event detail pages ✓ Sprint 1.2
- [x] Conversation history (in-memory, per-session) ✓ Sprint 1.2
- [x] Provider abstraction (Anthropic Claude, fake fallback) ✓ Sprint 1.4
- [x] Structured context block (top events) prefixed to prompt ✓ Sprint 1.4
- [x] RAG over events (Qdrant) + lexical (Elastic) hybrid — `services/copilot/src/retrieval.ts` (`VectorIndex`/`LexicalIndex` seams + offline `InMemoryVectorIndex`/`InMemoryLexicalIndex` baselines; `hybridSearch()` fused via `reciprocalRankFusion()` RRF; Qdrant/Elastic wiring via env in COMPLIANCE.md)
- [x] Tool-calling: map.filter, events.search, reports.generate, alerts.create — `copilot-tools.ts`: 6 typed tool defs + `executeCopilotTool()` dispatcher
- [x] Streaming responses with inline citations ✓ Sprint 2.57 — `Copilot.tsx` rewired to `/api/copilot/stream` SSE endpoint; shows stats, progressive text deltas, citations, model badge
- [x] Conversation memory per case file — `services/copilot/src/case-memory.ts` (`CaseMemoryStore` seam + `InMemoryCaseStore`; `appendTurn()`/`pinFact()` (citation-required); rolling-summary `compactMemory()`; `buildCaseContext()` en/uk context block — durable cross-session, distinct from Sprint 1.2 per-session history)
- [x] Guardrails: refuse PII enrichment, targeting, doxxing — `services/safety/src/guardrails.ts` + red-team cases in `red-team-cases.ts`
- [x] Eval suite (factuality, citation accuracy, refusal coverage) — `services/copilot/src/eval.ts` (`runEvalSuite()` with `scoreFactuality` (grounding + citation recall), refusal coverage / false-refusal scorers, `DEFAULT_FACTUALITY_CASES`/`DEFAULT_REFUSAL_CASES` en+uk); grounding enforced in code via `services/copilot/src/grounding.ts` `enforceGrounding()`, wired into `apps/web/src/app/api/copilot/route.ts`

## i18n
- Copilot must respond in user's locale, citing source language in the original.

### Примітки
Every claim cites at least one event ID with a verifiable source.
