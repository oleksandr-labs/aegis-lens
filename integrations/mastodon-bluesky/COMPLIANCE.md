# Mastodon / Bluesky / Threads — Compliance

## ToS posture

### Mastodon (ActivityPub)
- **Protocol**: ActivityPub — public posts are publicly accessible without authentication
- **Auth**: No authentication required for public timelines; user credentials never stored
- **Scope**: Public posts only; private/followers-only posts are never requested
- **Allowlist**: Hashtag allowlist enforced — only conflict-relevant tags ingested

### Bluesky (AT Protocol)
- **Protocol**: AT Protocol public Firehose (`com.atproto.sync.subscribeRepos`) and XRPC search
- **Auth**: No authentication required for public post search
- **Scope**: Public posts only, scoped to hashtag allowlist
- **Private accounts**: Never ingested — only posts explicitly marked public by author

### Threads (Meta)
- **API**: Meta Content Publishing API — limited availability
- **Auth**: Per-user access token required; not stored in source code
- **Status**: Placeholder implementation; public search API not yet available from Meta

## Data classification
- Content: `PUBLIC_SOCIAL` — publicly posted text and images
- Author data: display names and handles only — publicly visible on all platforms
- No private messages, no follower lists, no account emails

## PII handling
- Author handles and display names retained as-is (public data)
- Post content stored up to 280 chars for summary; full text retained for evidence
- No private profile data collected

## Retention policy
- Posts: 90 days rolling
- Indexed for conflict-event corroboration only
- Not redistributed wholesale

## Legal review status
- APPROVED: ActivityPub/AT Protocol public data collection is lawful
- NOTE: Verify per-instance ToS for high-volume Mastodon scraping

## Compliance changelog
- 2026-06-10 — Initial record: ActivityPub/AT Protocol public data, hashtag allowlist, no private accounts.
