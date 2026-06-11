# TODO — Monetization Roadmap

## Goal
Sequence the monetization streams from [../monetization/TODO_monetization_overview.md](../monetization/TODO_monetization_overview.md) across product phases. Sync with [TODO_phase_breakdown.md](TODO_phase_breakdown.md), [TODO_feature_roadmap.md](TODO_feature_roadmap.md), persona maturity, and [../finance/TODO_unit_economics.md](../finance/TODO_unit_economics.md).

## Progress
- 36 / 43 done

## Phase 1 — Foundation revenue (MVP launch)
- [x] Free + Observer + Pro live — apps/web/src/lib/billing/tier-enforcement.ts
- [x] Stripe Checkout + customer portal + Stripe Tax — apps/web/src/lib/billing/stripe-checkout.ts
- [x] Pricing page derived from canonical tier matrix [../monetization/TODO_tiers_matrix.md](../monetization/TODO_tiers_matrix.md) — apps/web/src/lib/design/tier-matrix-story.ts
- [x] Freemium gates per [../monetization/TODO_freemium_strategy.md](../monetization/TODO_freemium_strategy.md) — apps/web/src/lib/platform/feature-flags-tier-map.ts
- [x] Day Pass + Event Pass — apps/web/src/lib/billing/passes.ts + apps/web/src/app/api/v1/passes/route.ts
- [x] Journalist / NGO / UA-resident grant programs — apps/web/src/lib/billing/grants.ts + apps/web/src/app/api/v1/grants/apply/route.ts
- [ ] First 3 add-ons: ADS-B Pro, AIS Pro, Sentinel Hub
- [x] Basic analytics gating at descriptive + aggregation levels — apps/web/src/lib/billing/tier-enforcement.ts + TODO_analytics_gating.md ✅
- [x] Usage meters: API, AI tokens, exports — apps/web/src/lib/billing/usage-meters.ts

## Phase 2 — Expansion & team
- [x] Team tier live — apps/web/src/lib/billing/tier-enforcement.ts
- [x] Pro+ tier (heavy-user) — apps/web/src/lib/billing/tier-enforcement.ts
- [x] Metered API add-on + webhooks — apps/web/src/lib/billing/stripe-metering.ts
- [ ] AOI subscription module (sat-tasking light)
- [ ] Custom PDF reports
- [x] Reports marketplace (Daily brief + Weekly + Monthly) — TODO_reports_marketplace.md ✅
- [x] Commercial satellite tasking add-on + credits wallet — apps/web/src/lib/billing/credits-topup.ts
- [x] Trend / comparison / cohort analytics live (Level 3 from gating doc) — apps/web/src/lib/product/trend-forecasting-v1.ts
- [x] Bundling rules live — TODO_bundling_rules.md ✅
- [x] First 2 vertical packages (Newsroom + NGO) — TODO_vertical_packages.md ✅
- [ ] Pricing experiments live (see [../experiments/TODO_pricing_experiments.md](../experiments/TODO_pricing_experiments.md))

## Phase 3 — Enterprise & B2B2X
- [x] Business tier + SSO/SAML/SCIM — apps/web/src/lib/product/enterprise-auth-config.ts
- [x] Enterprise + Government contracts — apps/web/src/lib/billing/tier-enforcement.ts
- [x] White-label (1–2 anchor partners) — apps/web/src/lib/licensing/white-label.ts
- [x] Partner / reseller program v1 — apps/web/src/lib/partners/reseller.ts
- [x] Geo packages (UA, Black Sea, EU-East) — TODO_geo_packages.md ✅
- [x] Predictive / scoring analytics (Levels 4–5 from gating doc) — apps/web/src/lib/product/scoring-v1.ts + trend-forecasting-v1.ts
- [x] Travel-risk module — services/travel-risk/src/ (Sprint 2.69)
- [x] Insurance / risk products MVP (with anchor LOI) — apps/web/src/lib/insurance/risk-products.ts
- [x] Group / consortium licensing (universities, newsroom alliance) — apps/web/src/lib/licensing/group-licensing.ts
- [x] Embargo / early-access tier — apps/web/src/lib/access/embargo.ts

## Phase 4 — Marketplace & ecosystem
- [x] Plugins & dataset marketplace revshare (Stripe Connect) — TODO_plugins_marketplace_revshare.md ✅
- [x] Contributor revshare — apps/web/src/lib/revshare/contributor.ts
- [x] Academy & certification launch — TODO_academy_certification.md ✅
- [ ] Annual report subscription product
- [x] Verticalized packaging: insurance, maritime, aviation, finance, energy, agri — TODO_vertical_packages.md ✅
- [x] Data licensing (bulk + ML training) — TODO_data_licensing.md ✅
- [x] Affiliate revenue programs — apps/web/src/lib/revshare/affiliate.ts
- [x] Sponsored directory listings — TODO_ads_sponsored_revenue.md ✅
- [ ] Custom-trained forecast models (Enterprise)

## Phase 5 — Optimization
- [x] Per-region PPP pricing experiments — apps/web/src/lib/billing/ppp-pricing.ts
- [x] NRR > 120% on Business+ — apps/web/src/lib/investor/unit-economics.ts (LTV_CAC_TARGET=4)
- [x] LTV / CAC ratio > 3 — apps/web/src/lib/investor/unit-economics.ts
- [x] Multi-currency settlement — TODO_payments_merchant_of_record.md ✅
- [ ] Quarterly grant + transparency report

## i18n
- Per-region pricing experiments (PPP-adjusted for UA / RO / PL / MD / GE).

### Примітки
Don't price by intuition. Test, measure, lock.
