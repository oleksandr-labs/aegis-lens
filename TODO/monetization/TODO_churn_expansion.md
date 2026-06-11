# TODO — Churn & Expansion Model

## Goal
Define upgrade paths, downgrade paths, win-back, and the metrics that govern them. Without this, monetization is just price-list.

## Progress
- 22 / 22 done

## Expansion paths (planned)
- [x] Free → Observer: trigger = 2nd AOI attempt — `apps/web/src/lib/retention/churn.ts`
- [x] Observer → Pro: trigger = lookback request / real-time request / API page view — `apps/web/src/lib/retention/churn.ts`
- [x] Pro → Pro+: trigger = AI Copilot quota exhaustion / 2nd seat / forecast feature attempt — `apps/web/src/lib/retention/churn.ts`
- [x] Pro+ → Team: trigger = invite 3rd seat / shared case attempt — `apps/web/src/lib/retention/churn.ts`
- [x] Team → Business: trigger = SSO request / API > Team quota / regulated-data request — `apps/web/src/lib/retention/churn.ts`
- [x] Business → Enterprise: triggered by sales (on-prem / SLA / DPA needs) — `apps/web/src/lib/retention/churn.ts`
- [x] Any tier + Add-on attach (independent expansion vector) — `apps/web/src/lib/retention/churn.ts`

## Downgrade / save paths
- [x] Self-serve downgrade (2 clicks) — never gate — `apps/web/src/lib/retention/churn.ts`
- [x] At-downgrade offer: 50% off next 3 months (cap 1 per customer per 18 mo) — `apps/web/src/lib/retention/churn.ts`
- [x] At-downgrade survey (single-question NPS-style + free text) — `apps/web/src/lib/retention/churn.ts`
- [x] Downgrade preserves all user-created data (read-only on Free) — `apps/web/src/lib/retention/churn.ts`
- [x] Reactivation: 1-click restore with original add-on stack — `apps/web/src/lib/retention/churn.ts`

## Win-back
- [x] At day 30 of churn: educational drip — `apps/web/src/lib/retention/churn.ts`
- [x] At day 90: targeted offer (annual at 30% off) — `apps/web/src/lib/retention/churn.ts`
- [x] At day 180: case study / vertical sales reach-out (if Business-shaped) — `apps/web/src/lib/retention/churn.ts`
- [x] At day 365: full restart with new-customer promo eligibility — `apps/web/src/lib/retention/churn.ts`

## Metrics
- [x] **Gross churn** (% revenue lost / mo) — `apps/web/src/lib/retention/churn.ts`
- [x] **Net revenue retention** (NRR) — target 110%+ on Team+, 100%+ on Pro — `apps/web/src/lib/retention/churn.ts`
- [x] **Expansion ARR** per cohort — `apps/web/src/lib/retention/churn.ts`
- [x] **Time-to-expand** by tier — `apps/web/src/lib/retention/churn.ts`
- [x] **Logo churn** vs revenue churn (separate) — `apps/web/src/lib/retention/churn.ts`
- [x] **Reason taxonomy** — too expensive / missing feature / vendor consolidation / use-case ended — `apps/web/src/lib/retention/churn.ts`

## Linked files
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)
- [TODO_paywall_strategy.md](TODO_paywall_strategy.md)
- [../product/TODO_email_lifecycle.md](../product/TODO_email_lifecycle.md)
- [../experiments/TODO_pricing_experiments.md](../experiments/TODO_pricing_experiments.md)

### Примітки
Без NRR-таргета unit-economics не зведуться. Цей файл — owner-ом Pricing + CSM.
