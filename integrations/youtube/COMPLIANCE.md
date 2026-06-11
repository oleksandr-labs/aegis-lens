# YouTube (Data API v3) — Compliance

Compliance/ToS facts for the `@ua-map/youtube` integration.

## API & terms
- **YouTube Data API v3** under the YouTube API Services Terms of Service +
  Developer Policies. Access via an API key (read from env; never hardcoded).
- **Quota:** 10,000 units/day default. Costs are encoded in `src/rate-policy.ts`
  (`QUOTA_COST`): search.list=100, videos/playlistItems.list=1, captions.list=50.
  The `YouTubeQuotaGuard` keeps the curated-channel fleet inside the daily budget
  with a reserve fraction.
- **Polling discipline:** channels are polled via the cheap uploads-playlist path
  (cost 1), not search.list (cost 100); keyword search runs only a few times/day.

## Content / data handling
- Only **public** videos from the curated, ToS-vetted channel registry
  (`src/registry.ts`) are ingested. No private/unlisted content.
- **Transcripts** (`src/transcripts.ts`): public timedtext captions are used where
  available; caption-track *download* via the Data API requires OAuth as the
  channel owner and is therefore not performed. STT fallback is a pluggable
  handoff (`SttProvider`) — no audio is redistributed.
- **Frame sampling** (`src/frame-sampling.ts`) produces a sampling *plan* only; the
  integration does not download or re-host video. Extracted frames are for
  internal CV verification, not republication.
- Do not store full video bodies; retain metadata, transcript text, and evidence
  links. PII is redacted in the adapter (`redactPII`).

## Archival
- Ingested video URLs are archived via Internet Archive Save-Page-Now
  (`src/wayback.ts`) and the snapshot is preserved on `sources[].archiveUrl`,
  consistent with fair-use evidence preservation.

## Reputation
- `src/reputation.ts` blends the editorial registry prior with dynamic track-record
  signals; it does not scrape private user data — only public channel metadata and
  the platform's own corroboration history.

## Compliance changelog
- 2026-06-06 — Initial record: Data API ToS, quota policy, transcript/STT &
  frame-sampling handling, Wayback archival, reputation scoring.
