# TODO — Ambassador & Referral Program (B2C/B2B-light)

## Goal
Convert power-users into a viral distribution channel. Distinct from partner / reseller (which is contractual): this is informal, individual-level.

## Progress
- 9 / 9 done

## Mechanics
- [x] **Give-X-get-X** — refer a paying user: they get 30% off first 3 months, you get 1 free month — `apps/web/src/lib/referral/ambassador.ts`
- [x] **Ambassador program** — top contributors (verified) get free Pro+, swag, early-access to features, speaking slots — `apps/web/src/lib/referral/ambassador.ts`
- [x] **Affiliate-light** — for individual influencers (journalists with substacks), 20% revshare for 12 months — `apps/web/src/lib/referral/ambassador.ts`
- [x] **Public referral leaderboard** (opt-in) — community gamification — `apps/web/src/lib/referral/ambassador.ts`
- [x] **Team-invite credit** — admin who invites a paying seat gets account credit — `apps/web/src/lib/referral/ambassador.ts`
- [x] **Reseller-pass-through** for boutique consultancies (<$50k commit, lower revshare than formal channel) — `apps/web/src/lib/referral/ambassador.ts`

## Anti-abuse
- [x] Self-referral blocked (KYC + IP / device fingerprint) — `apps/web/src/lib/referral/ambassador.ts`
- [x] Sock-puppet detection (referral spike anomaly) — `apps/web/src/lib/referral/ambassador.ts`
- [x] Refunded referee → claw back referrer credit — `apps/web/src/lib/referral/ambassador.ts`

## Linked files
- [TODO_partner_resell.md](TODO_partner_resell.md)
- [TODO_contributor_revshare.md](TODO_contributor_revshare.md)
- [../community_ops/TODO_ambassador.md](../community_ops/TODO_ambassador.md)

### Примітки
Ambassador-програма — слабо грошова, сильно community-будівнича. Не плутати з affiliate (комерційним).
