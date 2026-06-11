# TODO — Contributor Revshare

## Goal
Pay verified contributors for high-quality content: geolocations, verifications, source curation, translations, reports. Aligns crowd-supply with revenue, recruits long-tail talent.

## Progress
- 9 / 9 done

## Models
- [x] **Bounties** — per-task ($5–500): solve a geolocation, verify a clip, translate a Telegram channel, identify an entity — apps/web/src/lib/revshare/contributor.ts
- [x] **Revshare on reports** — bylined contributors get 30–50% of report revenue — apps/web/src/lib/revshare/contributor.ts
- [x] **Verification queue payments** — per-verified-item, tiered by complexity — apps/web/src/lib/revshare/contributor.ts
- [x] **Source-curation stipend** — $50–500 / mo for maintaining a vetted source list — apps/web/src/lib/revshare/contributor.ts
- [x] **Editor tier** — long-term contributors paid hourly for editorial review — apps/web/src/lib/revshare/contributor.ts

## Mechanics
- [x] Reputation score gates payouts (must hit "Verified Contributor" via [../community_ops/TODO_contributor_program.md](../community_ops/TODO_contributor_program.md)) — apps/web/src/lib/revshare/contributor.ts
- [x] Stripe Connect payouts (KYC) — apps/web/src/lib/revshare/contributor.ts
- [x] Anti-collusion / sockpuppet detection — apps/web/src/lib/revshare/contributor.ts
- [x] Quality audit — random sample re-verified by senior analyst — apps/web/src/lib/revshare/contributor.ts
- [x] Tax forms (1099 / equivalent) — see [../billing/TODO_tax_compliance.md](../billing/TODO_tax_compliance.md) — apps/web/src/lib/revshare/contributor.ts

## Linked files
- [../community_ops/TODO_contributor_program.md](../community_ops/TODO_contributor_program.md)
- [../features/TODO_review_queue.md](../features/TODO_review_queue.md)
- [TODO_reports_marketplace.md](TODO_reports_marketplace.md)

### Примітки
Контриб-payments — це інвестиція в supply, не cost saver. Платити ринковими ставками для якості.
