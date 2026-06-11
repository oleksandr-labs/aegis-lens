# Compliance — `@ua-map/misinfo`

Misinformation flagging is reputationally and legally sensitive. This file records the
constraints the service operates under. The user-facing rules are published verbatim from
`src/methodology.ts` (`MISINFO_METHODOLOGY`) — code and public page can never diverge.

## Operating principles (hard constraints)

1. **No arbiter of truth.** The service never asserts a claim is true or false. It emits
   neutral, evidence-based `MisinfoSignal`s and a `DisputedBadge` caveat. No verdict field
   claims finality.
2. **No auto-takedown / no censorship.** The service only surfaces caveats. It never deletes,
   hides, demotes, or blocks content. There is no code path that removes an event.
3. **Conservative thresholds.** Aggregate suspicion < 0.25 → no badge. Automated confidence is
   never reported as 1.0. High-impact flags (`requiresHumanReview`) enter a human queue and are
   `pending` until a reviewer clears/confirms.
4. **Transparent + appealable.** Source reputation uses a documented, smoothed formula; every
   detector and the appeals route are published in the methodology page.

## Data sources & inputs

- **Media fingerprints** (`MediaFingerprint`: sha256 / pHash / embeddings) are computed
  **upstream** by the vision/ingest pipeline. This service stores only fingerprints and
  provenance metadata in its index, **not** raw media. Retaining hashes rather than copies keeps
  us clear of third-party media copyright/redistribution constraints.
- **Visual geo/temporal cues** (`VisualGeoCue`, `TemporalEvidence`) are structured extractions
  supplied by upstream services; this package performs no scraping.
- **Account behavioural metadata** (`AccountActivity`) for CIB detection uses only
  platform-provided/observable metadata (account age, timestamps, normalized text, re-share
  edges). No private/PII profile data is required or stored. Do not feed it data obtained in
  violation of a platform's ToS.

## Secrets / environment

This package is pure computation and reads **no secrets**. If a future provenance index is
backed by a vector DB or object store, configure it via `process.env` (e.g.
`MISINFO_INDEX_URL`) and document the variable here — never hardcode credentials.

## ML / model status

Recycled-media (perceptual + embedding), geo, and CIB detection ship as **typed contracts with
heuristic baselines**, not trained models. No model weights are fabricated. The CV/embedding
producers and any future learned models plug in behind these interfaces unchanged.

## Public methodology (transparency requirement)

`src/methodology.ts` is the single source of truth (EN + UK; Tier-2 PL/RO/BG/DE via translation
tooling). The web app must render it at a stable public URL and link every badge to it. Any
change to detector behaviour must update the corresponding methodology section in the same change.
