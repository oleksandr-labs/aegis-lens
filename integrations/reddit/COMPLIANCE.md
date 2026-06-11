# Reddit (Data API) — Compliance

Compliance/ToS facts for the `@ua-map/reddit` integration.

## API & terms
- **Reddit Data API** under the Reddit Data API Terms + Developer Terms. OAuth2
  `client_credentials` (script/app); credentials read from env, never hardcoded.
- **Rate limit:** ~100 requests/minute per token (advertised 600 req / 10 min).
  Clients must honour `X-Ratelimit-Remaining` / `X-Ratelimit-Reset` headers —
  parsed and enforced via the token-bucket throttle in `src/rate-policy.ts`.
- Set a descriptive, unique `User-Agent` (done in `client.ts`).

## Content / data handling
- Only **public** posts/comments from the curated subreddit registry
  (`src/registry.ts`) are ingested; subreddits flagged `requiresVerifiedOp` only
  admit flaired/verified OPs.
- Noise filtered at ingestion: deleted authors, non-positive score, recycled
  crossposts (see `adapter.ts`).
- Do not republish full post bodies wholesale; retain summaries + evidence links.
  PII redacted via `redactPII`.
- Commercial / bulk-redistribution of Reddit content is restricted by the Data API
  terms — this integration is for internal OSINT corroboration only.

## Archival
- Ingested permalinks may be archived via the shared Internet Archive Save-Page-Now
  client (`integrations/youtube/src/wayback.ts`) and preserved on
  `sources[].archiveUrl`.

## Reputation
- Per-author reputation (`src/reputation.ts`) uses only public account facts
  (account age from `created_utc`, karma, verified status) plus the platform's own
  corroboration history — no private data.

## Compliance changelog
- 2026-06-06 — Initial record: Data API terms, rate-limit policy, public-content
  scope, reputation scoring, Wayback archival.
