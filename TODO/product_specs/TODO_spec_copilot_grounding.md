# SPEC — AI Copilot Grounding

## Status
In Progress

## Goal
Every copilot answer cites events. No hallucinated entities. Graceful refusal of unsafe requests.

## Tasks
- [ ] Retrieval pipeline: Qdrant + Elastic + PostGIS hybrid
- [ ] Reranker
- [x] Tool-calling contract (map.filter, events.search, reports.generate, alerts.create) — `apps/web/src/lib/copilot-tools.ts`: `COPILOT_TOOLS` array (6 tools with full JSON schemas), `executeCopilotTool()` dispatcher, `CopilotToolResult` with `citedEventIds[]`
- [ ] Citation enforcement at generation
- [ ] Refusal patterns + safety classifier
- [ ] Conversation memory scoped to session + case
- [ ] Per-locale prompts
- [ ] Eval: factuality, citation accuracy, refusal coverage
- [ ] Latency budget: TTFT < 1s; full < 8s for typical queries

## i18n
- Prompt + tool descriptions per locale.

### Примітки
Hallucinated copilot = product death in this category.
