# TODO — Launch Tactics (LTDs, Founder pricing, Beta)

## Goal
Time-bounded launch pricing tactics that drive early ARR / cash without permanently anchoring price low. Used once, retired by Phase 3.

## Progress
- 12 / 12 done

## Tactics
- [x] **Founder pricing** — first 100 paying customers locked at 50% off forever (creates evangelist cohort) — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] **AppSumo / LTD-style lifetime deal** ($199 lifetime Pro) — caps revenue but raises cash + brand awareness; **capped at 500 codes total** to prevent infinite-liability — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] **Annual paid-up-front discount** at launch (30% off year 1) — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] **Beta / early-access pricing** — discounted while feature flag is "beta", reverts at GA — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] **Product Hunt launch promo** — 14-day 40% off code — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] **Reddit / Hacker News launch promo** — code with attribution-tracking — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] **Referral program** (give 30% off, get 1 month free) — `apps/web/src/lib/referral/ambassador.ts`

## Risks / guardrails
- [x] LTD must include carve-out: "lifetime = lifetime of product or 7 years, whichever shorter" + "fair-use cap on resources" — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] LTD does not include add-ons, API beyond fair-use, or future Pro+ features — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] Founder-pricing locked SKU = separate Stripe Product (don't pollute main catalog) — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] Sunset all launch SKUs by end of Phase 2 — `apps/web/src/lib/launch/launch-tactics.ts`
- [x] Track LTD-cohort cost-to-serve quarterly; if > revenue, restructure — `apps/web/src/lib/launch/launch-tactics.ts`

## Linked files
- [TODO_churn_expansion.md](TODO_churn_expansion.md)
- [TODO_bundling_rules.md](TODO_bundling_rules.md)
- [../experiments/TODO_pricing_experiments.md](../experiments/TODO_pricing_experiments.md)

### Примітки
LTD — гроші зараз vs прибуток потім. Робити свідомо, з cap-ом, або не робити взагалі.
