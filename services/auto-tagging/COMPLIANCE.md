# Compliance — `@ua-map/auto-tagging`

Taxonomy-driven multi-label auto-tagging for Aegis Lens events/posts/reports/listings.

## Data sources & licensing
- **Taxonomy source of truth:** `data/taxonomy/category-tree.yaml` (in-repo, owned by Aegis Lens).
  IDs are language-agnostic slugs; display names are localised (`en` + `uk`). Treat slug changes as
  schema changes (rename/merge/deprecate flows in `governance.ts`).
- No third-party datasets are bundled. Keyword/alias/synonym lists are hand-authored in this repo.

## ML / model provenance (codeable contract)
- `zero-shot.ts` ships a **deterministic, dependency-free** feature-hashing embedder
  (`hashingEmbedder`) as the offline baseline. It fabricates **no** model weights and needs no
  network access — safe for CI.
- A real embedding model plugs in via the typed `Embedder` interface
  (`tagZeroShot(input, { embedder })`). To enable a hosted provider:
  - `AEGIS_EMBEDDINGS_PROVIDER` — provider id (e.g. `voyage`, `openai`, `local-bge`).
  - provider API key in env (e.g. `VOYAGE_API_KEY`, `OPENAI_API_KEY`) — **never hardcoded**.
  - When Anthropic-hosted embeddings are used, default to the latest Claude-family / Voyage models;
    do not hardcode deprecated model ids.
- Confidence schema: every prediction carries `confidence` 0–1 and a `source`
  (`keyword | model | zero_shot`). Zero-shot confidence is capped (default 0.7) so it never
  outranks deterministic keyword/class matches.

## Human-in-the-loop & privacy
- `hitl.ts` records reviewer corrections and mines them into retraining artefacts
  (training set, keyword/synonym proposals, per-tag precision/recall). The in-memory store is a
  stub; in production persist to the governance DB with reviewer audit fields.
- Corrections store the **content text** to mine features. Do not feed PII-bearing content through
  the retraining export without the platform's standard redaction; tags themselves carry no
  personal data.

## i18n
- All user-facing tag labels are provided in `en` + `uk` (`displayName`). Facet labels
  (`facets.ts`) and governance display names honour the requested locale and fall back to `en`.

## Scope / ToS
- This package performs **classification only**; it does not ingest external sources, so no
  third-party ToS/attribution constraints apply at this layer. Source attribution remains the
  responsibility of the ingest/integration packages that produce the events being tagged.
