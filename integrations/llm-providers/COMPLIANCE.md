# Compliance — `@ua-map/llm-providers`

Multi-provider LLM abstraction. This file records the providers' Terms of
Service, account/key requirements, the data-handling rules this package
enforces, and the env vars it reads. **Never single-provider** — concentration
risk plus ToS volatility make any single dependency unacceptable; the failover
router enforces this at runtime.

## Providers, ToS & accounts

### Anthropic (Claude) — PRIMARY
- **Endpoint:** `https://api.anthropic.com/v1/messages`, `anthropic-version: 2023-06-01`.
- **Models:** latest only — `claude-opus-4-8`, `claude-sonnet-4-6`,
  `claude-haiku-4-5` (default). **Never** legacy ids (`claude-3-*`, `claude-2-*`).
- **ToS:** Anthropic Commercial Terms + Usage Policy. No prohibited-use content;
  no training on customer inputs/outputs by default. Respect rate limits (SDK/our
  router backs off). Prompt caching billed per Anthropic schedule (write premium,
  read discount).
- **Account:** Anthropic Console org + API key. Enterprise tenants may BYOK (their
  own org/key) — see BYOK below.

### OpenAI — FAILOVER + specialty
- **Endpoint:** `${OPENAI_BASE_URL or https://api.openai.com/v1}/chat/completions`.
- **Models:** `gpt-4o` (default), `gpt-4o-mini`. Update ids as OpenAI revises.
- **ToS:** OpenAI Business Terms + Usage Policies. API data not used for training
  by default. Automatic prompt-prefix caching (no PII implication beyond the send
  itself). Respect rate limits.
- **Account:** OpenAI API key (platform or Azure-OpenAI-compatible gateway via
  `OPENAI_BASE_URL`). Enterprise BYOK supported.

### Open-weights (HuggingFace Inference / self-hosted vLLM) — SOVEREIGNTY fallback
- **Endpoint:** `${OPENWEIGHTS_BASE_URL or https://router.huggingface.co/v1}/chat/completions`
  (OpenAI-compatible). Self-hosted vLLM on our Hetzner box may be keyless.
- **Models:** server-defined; default `meta-llama/Llama-3.3-70B-Instruct`.
- **ToS / licenses:** the *model weights'* license governs (e.g. Llama 3.x
  Community License — note its acceptable-use policy and the >700M-MAU clause; not
  an issue at our scale, but verify before swapping in a differently-licensed
  model). HF Inference adds HuggingFace ToS. Self-hosted vLLM has no third-party
  ToS — this is the path for data that must not leave our infrastructure.
- **Account:** `HUGGINGFACE_API_KEY` for HF; none for internal vLLM (reach via
  `OPENWEIGHTS_BASE_URL`).

## Data handling (enforced in code)

- **PII pre-send redaction (`pii-pre-send.ts`):** every outbound message is
  scrubbed of email/phone/national-id/credit-card/exact-coords/IP before any
  provider call (fail-closed approach mirrored from
  `integrations/un-ocha/src/pii-redaction.ts`). High-sensitivity categories
  (credit card, exact individual coordinates) flip a `blocked` flag;
  `assertSafeToSend()` throws so callers can refuse the call entirely.
- **Sovereignty:** route data that must stay on-infra to the open-weights /
  self-hosted vLLM provider; do not send it to Anthropic/OpenAI.
- **No secrets in code:** all keys come from `process.env` or per-tenant BYOK
  injected at runtime. Keys are never logged.

## Bring-Your-Own-Key (enterprise)

`byok.ts` resolves keys as: per-tenant registered key → platform env fallback.
Enterprise tenants' LLM traffic can be billed to and governed by their own
provider accounts. Hosts inject per-tenant keys at runtime (`registerTenantKey`)
from a secrets manager; revoke on offboarding/rotation (`revokeTenantKey`).

## Environment variables

| Var | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Platform Anthropic key (fallback when no tenant BYOK). |
| `ANTHROPIC_MODEL` | Optional default model override (must be a latest Claude id). |
| `OPENAI_API_KEY` | Platform OpenAI key. |
| `OPENAI_BASE_URL` | Optional OpenAI-compatible gateway base URL. |
| `OPENAI_MODEL` | Optional default model override. |
| `HUGGINGFACE_API_KEY` | HF Inference token (omit for keyless internal vLLM). |
| `OPENWEIGHTS_BASE_URL` | Self-hosted vLLM / HF router base URL. |
| `OPENWEIGHTS_MODEL` | Optional served-model id override. |

## Cost accounting

`cost-tracking.ts` records token usage + USD per **provider × feature** (pricing
table in USD/1M tokens; cache reads credited at the discounted rate). Update the
`PRICING` table when providers change rates. Self-hosted open-weights is amortized
infra and costed at ~0 per token.
