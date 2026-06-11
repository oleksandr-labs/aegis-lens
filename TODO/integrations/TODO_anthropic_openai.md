# TODO — Integration: Anthropic / OpenAI (LLM providers)

## Goal
Multi-provider LLM strategy: Anthropic primary, OpenAI secondary, open-weights for sovereignty.

## Progress
- 11 / 11 done

## Tasks
- [x] Anthropic Claude API integration (primary copilot + summarization + reports) ✓ Sprint 1.3 — extended to unified `LlmProvider` w/ latest model ids (opus-4-8/sonnet-4-6/haiku-4-5) in integrations/llm-providers/src/anthropic-client.ts (+ models.ts)
- [x] OpenAI API integration (failover + specialty models) — integrations/llm-providers/src/openai-client.ts (Chat Completions, gpt-4o; wired into failover-router.ts)
- [x] HuggingFace Inference or self-hosted vLLM (open-weights fallback) — integrations/llm-providers/src/openweights-client.ts (OpenAI-compatible; HF router or keyless internal vLLM via OPENWEIGHTS_BASE_URL)
- [x] Prompt caching where available (Anthropic prompt caching, OpenAI cached prefixes) — integrations/llm-providers/src/prompt-cache.ts (anthropic ephemeral breakpoints + OpenAI cached-prefix usage read; consumed by anthropic/openai clients)
- [x] Streaming response handling everywhere — integrations/llm-providers/src/streaming.ts (provider-agnostic StreamChunk iterator + SSE parser; stream() on all 3 clients + router)
- [x] Tool-calling abstraction across providers — integrations/llm-providers/src/tool-calling.ts (ToolSpec → anthropic/openai/openweights formats + unified ToolCall normalization)
- [x] Cost dashboard per provider per feature — integrations/llm-providers/src/cost-tracking.ts (token+USD accounting by provider×feature, pricing table, snapshot/onUsage; recorded by all clients)
- [x] Per-customer key bring-your-own-key (enterprise) — integrations/llm-providers/src/byok.ts (per-tenant key resolution → env fallback; registerTenantKey/revokeTenantKey)
- [x] Eval suite for cross-provider parity — integrations/llm-providers/src/eval-suite.ts (typed harness + heuristic baseline scorer + confidence schema + per-locale parity matrix)
- [x] PII redaction before send — integrations/llm-providers/src/pii-pre-send.ts (fail-closed, mirrors un-ocha pii-redaction; redactMessages/assertSafeToSend run inside every client before send)
- [x] Provider outage failover routing — integrations/llm-providers/src/failover-router.ts (circuit-breaker health + ordered failover Anthropic→OpenAI→open-weights; defaultRouter)

## i18n
- Per-locale eval coverage for each provider.

### Примітки
Never single-provider. Concentration risk + ToS volatility.
