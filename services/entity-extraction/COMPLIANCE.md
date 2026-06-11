# `@ua-map/entity-extraction` — Compliance, Licensing & Operational Notes

Entity extraction + knowledge-graph population: NER patterns, entity linking,
transliteration, within-document coreference, cross-document disambiguation, Wikidata
`sameAs` enrichment, per-class evaluation, and the auto-tagging handoff. This document
records third-party data sources and their license/ToS constraints. **No secrets are
hardcoded — endpoints are read from `process.env`.**

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `WIKIDATA_SPARQL_ENDPOINT` | `wikidata.ts` (WikidataClient) | Wikidata SPARQL endpoint (defaults to the public `query.wikidata.org/sparql`). |

## Data source licensing

- **Wikidata** — all structured data is released under **CC0 1.0 (public domain)**. We may
  store Q-numbers, labels, descriptions, and coordinates and republish them freely. The
  `sameAs` links point to `https://www.wikidata.org/entity/<QID>`.
  - **Query Service ToS (crawler discipline):** the public SPARQL endpoint asks for a
    descriptive `User-Agent` (set in `WikidataClient`), reasonable query rates, and no
    abusive bulk querying. Enrichment runs in the nightly batch path at a polite cadence,
    not per-request on the hot path. For heavy use, mirror Wikidata locally.
- **Live network availability:** this environment cannot reach Wikidata, so `wikidata.ts`
  ships as a codeable contract — a typed SPARQL client + an offline CC0 gazetteer fixture
  for high-frequency entities. `resolveSameAs` uses the fixture first and only queries the
  live endpoint when a `WikidataClient` is supplied. Failures return no match (the entity
  stays unlinked) rather than throwing.

## Codeable-contract / model status

- NER is heuristic/regex (`patterns.ts`) — no bundled model weights. A fine-tuned NER
  model would slot behind the same `EntityMention` contract.
- Coreference (`coreference.ts`) is a surface + transliteration + acronym heuristic; a
  neural multilingual coref model would replace the `corefers` predicate behind the same
  `resolveCoreference` contract.
- Evaluation (`eval.ts`) ships a labelled UK+EN golden set and a per-class
  precision/recall/F1 scorer for regression tracking.

## Confidence & human-in-the-loop

- Every mention carries a 0–1 `confidence`; KG entities carry provenance via
  `mentionEventIds[]`.
- Link proposals below 0.85 set `requiresHumanReview` (`linker.ts`).
- Cross-document confidence grows with independent-document corroboration
  (`coreference.ts`) and is capped at 0.99 — never asserted as certain.
- Weak `sameAs` matches (below the configurable floor) are returned as candidates for
  human review rather than auto-attached, and a curated `wikidataId` is never overwritten.

## Downstream integration

- Extracted entities feed the auto-tagging service via `auto-tagging-bridge.ts`
  (`TaggingInput`-shaped handoff + advisory tag hints). The bridge mirrors the
  auto-tagging public interface without a cross-workspace import.
