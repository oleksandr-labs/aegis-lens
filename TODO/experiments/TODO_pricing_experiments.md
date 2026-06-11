# TODO — Pricing Experiments

## Goal
Find the right price / tier / gate mix per persona without churn risk. Derives from the canonical [../monetization/TODO_tiers_matrix.md](../monetization/TODO_tiers_matrix.md) and [../monetization/TODO_analytics_gating.md](../monetization/TODO_analytics_gating.md).

## Progress
- 22 / 22 done

## Tier-shape tests
- [x] 3-tier vs 4-tier vs 6-tier (Free / Observer / Pro / Pro+ / Team / Business) → conversion + ARPU — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Pro at $29 vs $39 vs $49 vs $59 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Observer at $9 vs $14 vs $19 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Pro+ at $99 vs $129 vs $149 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Team at $299 vs $499 vs $799 (5 seats) — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Annual discount: 15 / 20 / 25 / 30% — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] 2-year commit: 30 / 40% — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## Trial design tests
- [x] Trial duration: 7 / 14 / 30 days — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Trial requires card vs not — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Trial auto-converts (with warning) vs requires re-confirm — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Trial of Pro+ vs Pro — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## Gate / freemium tests
- [x] Free history depth: 3d vs 7d vs 14d — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Free AOI count: 0 vs 1 vs 3 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Free AI Copilot daily quota: 0 / 5 / 20 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Free freshness delay: 5m / 15m / 30m — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Soft gate teaser style: blurred / labeled / hidden — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Upgrade prompt style: modal / inline / banner — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## Add-on / packaging tests
- [x] Vertical pack discount: 10 / 20 / 30% — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Add-on bundle discount thresholds: 3+ / 4+ / 5+ — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Geo pack vs global Pro — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Reports subscription bundled into Business vs separate — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## Pay-shape tests
- [x] Day Pass at $5 / 9 / 14 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Event Pass at $19 / 39 / 59 — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Per-region PPP-adjusted pricing (UA / RO / PL / MD / GE) vs global USD — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## Usage-based vs flat
- [x] Flat Pro API vs metered API — apps/web/src/lib/pricing-experiments/experiment-registry.ts
- [x] Credits wallet vs subscription overage — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## Post-test
- [x] Cohort retention tracking per test arm — apps/web/src/lib/pricing-experiments/cohort-tracking.ts
- [x] Honor locked-in price for paying customers on any test — apps/web/src/lib/pricing-experiments/ab-testing.ts + apps/web/src/lib/pricing-experiments/experiment-guard.ts
- [x] Document winner + rationale in [../internal_docs/TODO_decision_records.md](../internal_docs/TODO_decision_records.md) — apps/web/src/lib/pricing-experiments/experiment-registry.ts

## i18n
- Per-currency price-points tested separately; PPP-adjusted UA / RO / PL.

### Примітки
Never run a price test on existing paying customers without honoring locked-in price.
Test one axis at a time — fewer arms, faster reads.
