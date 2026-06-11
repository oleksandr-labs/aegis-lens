# VK / OK — Compliance

## ToS posture
- **VK (VKontakte)**: Public group wall posts via VK API v5.199 — https://dev.vk.com/reference
  - Service token optional; basic public reads permitted without token
  - Access to public group walls only (negative owner_id = public community)
- **OK (Odnoklassniki)**: Public group discussions via OK API — https://apiok.ru/
  - Requires application key + access token
  - Public groups only

## Data scope
- **Read-only**: No write operations; no likes, comments, or reposts performed
- **Public posts only**: No private user profiles, no private messages, no friend data
- **Stored**: Post ID + text only; photo URLs retained as evidence references
- **No personal data stored** beyond post ID + text

## Verification requirement
- `requires_verification: true` on ALL posts from both platforms
- Russian-affiliated platforms are subject to elevated disinformation risk
- All claims must be corroborated via independent sources before surfacing
- Source weight: 0.25 (lowest tier — corroboration only)

## Legal / sanctions notes
- VK is subject to EU/UK sanctions restrictions; use limited to OSINT/public information
- No financial transactions; no advertising; no data sharing with VK/OK
- Legal review: PENDING — obtain legal sign-off for each jurisdiction before production use

## Rate limits
- VK: ~3 req/sec without token; ~5 req/sec with service token; enforced in client
- OK: ~3 req/sec; enforced in client

## Compliance changelog
- 2026-06-10 — Initial record: public-only, read-only, requires_verification, sanctions note, pending legal review.
