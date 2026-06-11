# TikTok Research API — Compliance

## ToS posture
- **API tier**: TikTok Research API only (https://developers.tiktok.com/products/research-api/)
- **Requires**: approved academic/research application from TikTok Developer Portal
- **Availability flag**: `TIKTOK_RESEARCH_ENABLED` — defaults to `false`; must be explicitly set to `true` after application approval
- **Data scope**: public posts only; no private accounts, no DMs, no follower data

## PII handling
- **Author data retained**: display name (`author_name`) and handle (`author_unique_id`) only — both are publicly visible on TikTok
- **No private profile data**: email, phone, follower lists, private account details are never requested
- **Faces in video**: frame capture is NOT performed by this integration; `cover_image_url` (thumbnail) is stored but face detection/extraction is explicitly prohibited
- **Audio capture**: none — this integration does not download or process audio

## Geo precision
- Region-level only (`region_code`) — no precise GPS or city-level location data is stored

## Data classification
- Source content: `PUBLIC_SOCIAL`
- Author identifiers: `PUBLIC_DISPLAY_NAME`
- Retention: 90 days rolling window; delete on user request where applicable

## Rate limits
- Research API: ~1,000 requests/day per application
- Client enforces per-request throttling (~86s spacing) — see `client.ts`

## Legal review status
- PENDING: TikTok Research API application required before production use
- Integration is gated behind `TIKTOK_RESEARCH_ENABLED=false` until approval confirmed

## Compliance changelog
- 2026-06-10 — Initial record: Research API only, face-capture prohibition, geo restriction, availability gate.
