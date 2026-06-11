# TODO — Dunning, Refunds, Credits

## Goal
Recover failed payments politely; handle refunds + credits cleanly.

## Progress
- 8 / 8 done

## Tasks
- [x] Dunning email sequence (D-3, D, D+3, D+7) → [dunning-refunds.md §1](../../docs/billing/dunning-refunds.md) (localized; direct link to payment update; no shame-inducing tone)
- [x] In-app billing prompts → §2 (persistent banner D–D+7; Enterprise suppressed → CSM notified)
- [x] Smart Retries (Stripe) → §3 (Stripe Radar ML-optimized retry timing)
- [x] Grace period before service degradation → §4 (7 days full; D+8 read-only; 30 days → cancel + export offer)
- [x] Refund workflow (with approval matrix) → §5 (support lead / CS lead / VP Revenue / Finance tiers)
- [x] Credit notes (Stripe credit notes) → §6 (for refunds, SLA credits, goodwill; 7y archive)
- [x] Chargeback dispute handling → §7 (Stripe Radar; evidence package; 3+ chargebacks = fraud review)
- [x] Per-customer billing notes in admin → §8 (timestamped, attributed; custom-payment flags)

## i18n
- Dunning emails localized.

### Примітки
A polite dunning email recovers 30%+ of failed cards.

### Done notes (2026-05-30)
[docs/billing/dunning-refunds.md](../../docs/billing/dunning-refunds.md).
Enterprise billing issues bypass generic UI banner → CSM-handled via Slack Connect
to avoid embarrassing named customers.
