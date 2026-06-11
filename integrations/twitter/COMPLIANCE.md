# X / Twitter (API v2) — Compliance

Compliance/ToS facts for the `@ua-map/twitter` integration. **X's Terms are
volatile — keep the changelog below current.**

## API & terms
- **X API v2** under the X Developer Agreement & Policy. Auth: App-only **Bearer
  Token** (read-only); token read from env, never hardcoded.
- **Tier matrix** (subject to change): Free (very low read caps, no search/stream),
  Basic (recent search, limited reads), Pro/Enterprise (filtered stream, higher
  caps). The client caps `max_results ≤ 100`, excludes retweets, filters by lang.
- **Rate limits:** honoured via `x-rate-limit-reset` → `retryAfterMs` backoff in
  `client.ts`. Streaming vs. polling is selected by tier (`streaming.ts`).

## Streaming / tracked accounts (`src/streaming.ts`)
- Filtered stream (`/2/tweets/search/stream`) is used only where the tier permits;
  otherwise the integration **polls** tracked accounts' public timelines. No
  scraping of the web app, no logged-in session reuse.
- Tracked accounts come from the curated, ToS-vetted registry (`registry.ts`).

## Media extraction (`src/media.ts`)
- Media entities are read from the API's `includes.media` expansion only. Media is
  referenced by URL for CV/archival; full media bodies are not re-hosted/republished.

## Archival & academic dumps (`src/archive.ts`)
- Canonical public tweet URLs are archived via the shared Internet Archive
  Save-Page-Now client (`integrations/youtube/src/wayback.ts`).
- Bulk/historical access uses lawful **academic-dump** paths only: tweet-ID
  *rehydration* datasets, IA Twitter Stream Grab, GDELT. Full-content
  redistribution is NOT performed; `isDumpIngestPermitted()` gates ingest and
  requires an explicit license note. Do not redistribute hydrated content beyond
  what each dataset's license allows.

## Data handling
- Public posts only; PII redacted in the adapter (`redactPII`). Retain summaries +
  evidence/archive links, not bulk corpora, consistent with the Developer Policy's
  content-redistribution restrictions.

## Compliance changelog
- 2026-06-06 — Initial record: v2 ToS, tier/rate model, filtered-stream vs. poll,
  media extraction, Wayback + academic-dump archival gating. (Re-verify tier caps
  and stream availability — X changes these frequently.)
