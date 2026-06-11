# TODO — Day / Event / Crisis Pass

## Goal
Sell short-window full access to users who don't want a subscription. Captures buyers around discrete events: a strike, an election, a crisis, a press deadline.

## Progress
- 12 / 12 done

## Pass types
- [x] **Day Pass** ($9) — 24h full Pro access; auto-expires; no card retention — apps/web/src/lib/billing/passes.ts (PassConfig day-pass)
- [x] **Weekend Pass** ($6.99) — 48h analytics-read — apps/web/src/lib/access/day-pass.ts (DayPass weekend-pass)
- [x] **Week Pass / Trial Pass** (14 days free, full-pro) — apps/web/src/lib/access/day-pass.ts (DayPass trial-pass)
- [x] **Event Pass** ($39) — full access on a single named event/AOI for 30 days (e.g. "Kursk offensive coverage") — apps/web/src/lib/billing/passes.ts (PassConfig event-pass)
- [x] **Crisis Pass** (free during declared humanitarian crisis) — auto-issued to verified affected-region users; PR + civic-utility move — apps/web/src/lib/billing/passes.ts (PassConfig crisis-pass)
- [x] **Press Deadline Pass** (free for verified journalists on big-story days) — apps/web/src/lib/access/press-deadline-pass.ts

## Mechanics
- [x] Stripe one-off Checkout, no recurring — apps/web/src/app/api/v1/passes/route.ts (POST → createCheckoutSession)
- [x] Email-only account allowed (no full signup required) — apps/web/src/lib/auth/email-only-account.ts
- [x] At expiry: revert to Free; offer 50%-off Pro for 30 days — apps/web/src/lib/access/day-pass.ts (PASS_AUTO_RENEW_NOTE_EN/UK)
- [x] Track conversion Pass → Pro within 30 days as a key funnel KPI — apps/web/src/lib/access/day-pass.ts (trial-pass notes)
- [x] No auto-renewal; explicit "buy again" link — apps/web/src/lib/access/day-pass.ts (PASS_AUTO_RENEW_NOTE_EN/UK)
- [x] Crisis Pass requires geo-IP + light verification; abuse-rate monitored — apps/web/src/lib/access/day-pass.ts (CRISIS_PASS_TRIGGER_NOTE_EN/UK)

## Pricing rationale
- Day Pass priced at ~30% of monthly Pro (anchor on commitment-aversion)
- Event Pass cheaper per-day than month (encourages discrete-event buyers; lower CAC vs SaaS funnel)

## Linked files
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)
- [TODO_discounts_grants.md](TODO_discounts_grants.md)
- [../integrations/TODO_stripe.md](../integrations/TODO_stripe.md)

### Примітки
Це швидкий impulse-buy канал. Не плутати з trial — Pass платний, без авто-конвертації.
