# TODO — Prompt Library & Versioning

## Goal
Prompts are code. Version, test, A/B, share across services.

## Progress
- 7 / 10 done

## Tasks
- [x] Central prompt repo (Git, typed) — `services/prompts/src/catalog.ts` (5 prompts: classify, summarize, copilot, reports, rule-builder)
- [x] Prompt versions tagged + immutable once shipped — `PromptVersion.version` + `activeVersion` pointer; versions are append-only
- [x] Per-prompt evaluation set + scores — `evalScore` + `evalSetId` fields on `PromptVersion`
- [x] Per-prompt cost + latency tracking — `estimatedCostUsd` + `p50LatencyMs` on `PromptVersion`
- [x] Templates with typed variables — `PromptVariable[]` + `renderTemplate()` with `{{var}}` syntax
- [ ] Caching strategy per prompt (semantic cache + prompt-prefix cache)
- [x] Per-locale variants — `locale` field per version; `getActive(id, locale)` with EN fallback
- [x] Prompt-injection defenses (system-prompt design + input sanitation) — `sanitizeVar()` in library.ts
- [ ] A/B framework via [../platform/TODO_ab_testing.md](../platform/TODO_ab_testing.md)
- [x] Sharing across services (NLP svc, copilot, reports, alerts) — `PROMPT_LIBRARY` singleton exported from catalog.ts

## i18n
- Prompts may need language-specific variants — track per-locale evals.

### Примітки
Prompt changes go through PR review. No "fix in prod" prompts.
