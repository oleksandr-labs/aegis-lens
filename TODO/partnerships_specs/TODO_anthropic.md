# TODO — Partnership: Anthropic (Claude)

## Goal
Strategic LLM partner. Predictable capacity, early access, support.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.56)

## Tasks
- [x] Move from pay-go to committed-spend tier → [docs/partnerships/partnerships.md §4.1](../../docs/partnerships/partnerships.md)
- [x] Prompt-caching enablement + tuning → [docs/partnerships/partnerships.md §4.2](../../docs/partnerships/partnerships.md)
- [x] Capacity commitments for traffic spikes (breaking events) → [docs/partnerships/partnerships.md §4.3](../../docs/partnerships/partnerships.md)
- [x] Joint case study (with our consent) → [docs/partnerships/partnerships.md §4.4](../../docs/partnerships/partnerships.md)
- [x] Early access to new models / features → [docs/partnerships/partnerships.md §4.5](../../docs/partnerships/partnerships.md)
- [x] Engineering escalation contact → [docs/partnerships/partnerships.md §4.6](../../docs/partnerships/partnerships.md)
- [x] Safety + responsible-AI alignment public statement → [docs/partnerships/partnerships.md §4.7](../../docs/partnerships/partnerships.md)
- [x] Multi-provider hedge maintained (OpenAI + open-weights) → [docs/partnerships/partnerships.md §4.8](../../docs/partnerships/partnerships.md)

### Done notes (2026-05-30)
Full Anthropic partnership spec in `docs/partnerships/partnerships.md §Part 4`. Committed spend at $5K/month (15–25% discount + named TAM). Prompt caching: > 70% cache target, system prompts + conversation history + event batch context cache-optimized. Burst capacity: guaranteed tier rate (no throttling) during breaking events; OpenAI budget reserved as burst backup. Case study: Aegis Lens approval gate, timing at 1K MAU or Series A. Early access to new models + research partner program. Engineering escalation: 2 business hour SLA for production issues. Responsible AI statement: "Claude assists analysts, not replaces them; every AI output is human-reviewed." Multi-provider hedge: Claude primary + GPT-4o secondary + open-weights (Llama/Mistral) for sovereign/offline deployments; LLMProvider interface abstraction.

## i18n
- N/A.

### Примітки
LLM provider lock-in is a real risk. Hedge structurally; partner emotionally.
