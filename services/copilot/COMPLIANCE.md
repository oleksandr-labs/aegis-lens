# Compliance — `@ua-map/copilot`

Core for the Aegis Lens AI analyst copilot: hybrid retrieval, per-case-file memory,
grounding/citation enforcement, and the eval suite. This package is provider- and
storage-agnostic; routes in `apps/web` wire it to live infrastructure.

## LLM provider
- The house default is the **latest Claude models** (Opus 4.x / Sonnet 4.x / Haiku 4.x).
  Do **not** hardcode deprecated model ids. The provider abstraction lives in
  `apps/web/src/lib/llm.ts` (`generate()`); this package never calls a provider directly —
  it consumes/validates the text a runner produces (`CopilotRunner` in `eval.ts`).
- Secrets are read from `process.env` by the route layer, never hardcoded:
  - `ANTHROPIC_API_KEY` — Claude access (already used by `apps/web` `generate()`).

## Retrieval backends (codeable contract)
- `retrieval.ts` defines `VectorIndex` (Qdrant) and `LexicalIndex` (Elasticsearch) seams and
  ships dependency-free in-memory baselines so RAG ranking works offline / in CI.
- Live wiring reads from env (never hardcoded):
  - `QDRANT_URL`, `QDRANT_API_KEY` — dense vector search.
  - `ELASTIC_URL`, `ELASTIC_API_KEY` — lexical search.
  - embedding provider key (e.g. `VOYAGE_API_KEY`) for query/document vectors.
- Fusion is **Reciprocal Rank Fusion** (score-scale-free), so swapping either backend does
  not require re-tuning weights.

## Grounding & citation policy (enforced in code)
- Platform rule: *every claim cites at least one verifiable event ID*. `grounding.ts`
  enforces this server-side — it is NOT left to the model:
  - cited IDs must be a subset of the context allow-list (no hallucinated citations),
  - substantive sentences must carry a citation (configurable `minCoverage`),
  - failing answers are replaced with a localised (en/uk) refusal, not surfaced raw.
- Wired into `apps/web/src/app/api/copilot/route.ts` via `enforceGrounding()`.

## Conversation memory & privacy
- `case-memory.ts` persists copilot memory per **case file** (cross-session), distinct from the
  ephemeral per-session history. In-memory `InMemoryCaseStore` is a stub — swap for a DB-backed
  `CaseMemoryStore` in prod, scoped by org/RBAC.
- Pinned facts MUST carry citations (grounding rule enforced at write time).
- Case text may contain sensitive operational content; storage must honour the platform's
  tenancy/RBAC and retraction rules. No PII enrichment is performed here.

## Safety / guardrails
- Refusal of doxxing / targeting / PII / weapons / info-ops / surveillance is owned by
  `@ua-map/safety`. The eval suite (`eval.ts`) measures **refusal coverage** against that
  layer's red-team cases; this package does not duplicate the rules.

## i18n
- All user-facing strings (grounding refusals, case-context headers) are provided in `en` + `uk`
  and selected by the case/request locale, falling back to `en`.
