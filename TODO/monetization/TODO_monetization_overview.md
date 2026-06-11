# TODO — Monetization Overview (Master)

## Goal
Define a multi-stream revenue model that monetizes **access**, **speed**, **depth of analytics**, **scope of data**, **collaboration**, **automation**, and **redistribution rights** — without breaking the free public-utility promise.

> This is the master index. Each revenue stream has its own file in this folder.
> Replaces and expands [../product/TODO_monetization.md](../product/TODO_monetization.md).

## Progress
- 24 / 40 done

## Revenue Streams (each = separate file)

### 1. Core subscriptions
- [ ] [Tier matrix (Free → Gov)](TODO_tiers_matrix.md) — canonical feature/limits per tier
- [x] [Analytics gating](TODO_analytics_gating.md) — which analytic locked at which tier (★ key file)
- [x] [Freemium strategy](TODO_freemium_strategy.md) — what free gives away, what it withholds

### 2. Usage / metered
- [ ] [Usage metering model](TODO_usage_metering_model.md) — meters (API calls, AI tokens, AOI-ha, exports, alerts)
- [ ] [Credits / wallet system](TODO_credits_wallet.md) — prepaid credits for spiky workloads

### 3. Add-ons & modules
- [x] [Add-ons & data modules](TODO_addons_modules.md) — satellite, ADS-B Pro, AIS Pro, thermal, social firehose, KG-graph, etc.
- [x] [Vertical packages](TODO_vertical_packages.md) — insurance / maritime / aviation / finance / energy / agri / NGO bundles
- [x] [Geographic packages](TODO_geo_packages.md) — country / region packs (UA, EU-East, MENA, SCS, etc.)

### 4. One-off / time-bounded
- [x] [Reports marketplace](TODO_reports_marketplace.md) — one-shot or subscription intelligence reports
- [ ] [Day / Event / Crisis pass](TODO_day_event_pass.md) — short-window full access for ad-hoc users
- [ ] [Professional services](TODO_professional_services.md) — custom investigations, integration, training

### 5. Distribution / B2B2X
- [ ] [White-label & OEM](TODO_white_label.md) — newsrooms, defense primes, governments
- [x] [Data licensing](TODO_data_licensing.md) — bulk / historical / redistribution rights
- [ ] [Group / consortium licensing](TODO_group_licensing.md) — universities, newsroom alliances, NGO consortia
- [ ] [Partner & reseller program](TODO_partner_resell.md) — channel revshare

### 6. Marketplace / network revenue
- [x] [Plugins & dataset marketplace revshare](TODO_plugins_marketplace_revshare.md) — 70/30 split (Stripe Connect)
- [ ] [Contributor revshare](TODO_contributor_revshare.md) — pay verified-content contributors
- [x] [Ads & sponsored placements](TODO_ads_sponsored_revenue.md) — directory only, never on map/events
- [ ] [Affiliate revenue](TODO_affiliate_revshare.md) — refer satellite / security / hardware providers

### 7. Education
- [x] [Academy & certification](TODO_academy_certification.md) — paid courses, exams, "Certified OSINT Analyst"

### 8. Specialty products
- [ ] [Insurance & risk products](TODO_insurance_risk_products.md) — risk scores for underwriters / reinsurance
- [ ] [Embargo / early-access tier](TODO_embargo_early_access.md) — premium early window before public release
- [x] [Risk-score API for fintech / KYC](TODO_risk_score_api_fintech.md) — narrow self-serve API
- [x] [Managed AOI / concierge](TODO_managed_aoi_concierge.md) — we-run-it-for-you AOI monitoring
- [x] [LLM / AI training data licensing](TODO_llm_training_data_licensing.md) — corpora for AI labs
- [ ] [Premium delivery channels](TODO_premium_delivery_channels.md) — SMS / voice / sat-message
- [ ] [Compliance & trust add-ons](TODO_compliance_addons.md) — SOC2, DPA, data-residency
- [ ] [Embeds-as-a-product (B2B)](TODO_embeds_b2b.md) — sold to publishers
- [ ] [Audio / podcast subscriptions](TODO_audio_podcast_sub.md) — paid private feed
- [ ] [Hardware bundles](TODO_hardware_bundles.md) — field kits with attached subscription

### 9. Non-commercial revenue
- [x] [Donations & patronage](TODO_donations_patronage.md) — civic giving, Patreon-style, crypto
- [x] [Public grants & institutional funding](TODO_grants_public_funding.md) — EU/US/UA/UN
- [x] [Sub-national / municipal pricing](TODO_subnational_gov_pricing.md) — oblasts, cities, civil defense

### 10. Growth & community revenue
- [x] [Ambassador & referral](TODO_ambassador_referral.md) — give-X-get-X, individual revshare
- [x] [Launch tactics (LTD, founder)](TODO_launch_tactics.md) — time-bounded only
- [ ] [Events & summits](TODO_events_summits.md) — paid events + sponsorships
- [ ] [Job board / talent marketplace](TODO_job_board_talent.md) — hiring + freelance

### Cross-cutting
- [x] [Pricing principles (meta)](TODO_pricing_principles.md) — the "why" behind all pricing
- [x] [Competitive pricing & anchoring](TODO_competitive_pricing.md) — vs LiveUAmap, Janes, RF, Palantir
- [x] [Payments / merchant-of-record / multi-currency](TODO_payments_merchant_of_record.md)
- [x] [Paywall & gating strategy](TODO_paywall_strategy.md) — soft vs hard gates, teaser depth, dark-pattern bans
- [ ] [Discounts, grants, free programs](TODO_discounts_grants.md) — NGO, journalist, academic, UA-resident
- [x] [Bundling rules](TODO_bundling_rules.md) — how add-ons combine, when discounts trigger
- [x] [Churn & expansion model](TODO_churn_expansion.md) — upsell paths, downgrade paths, win-back

## Principles
1. **Free tier is non-negotiable** — civilians, students, journalists in crisis countries must keep meaningful access.
2. **Speed is the most valuable axis.** Delayed → near-real-time → real-time → webhook push is the strongest gate.
3. **Depth of analytics is the second axis.** Counts → aggregates → trends → predictions → custom models.
4. **Scope (geography, time-range, source firehose) is the third axis.**
5. **Redistribution & API are the fourth axis** — anyone embedding / re-selling pays.
6. **No dark patterns.** No "free trial that auto-charges with no warning". No data hostage.
7. **Locked-in pricing for existing customers** on any price test.
8. **Sovereignty constraints honoured** — gov contracts can be on-prem / air-gapped (different SKU).

## i18n
- USD primary; EUR, UAH, PLN, GBP listed. PPP-adjusted experiments for UA/RO/PL/MD/GE.
- VAT/Tax via Stripe Tax. Reverse-charge for EU B2B.

### Примітки
Це базова структура з 25+ потенційних потоків доходу. Не всі мають запускатись одразу — пріоритезація живе у [../roadmap/TODO_monetization_roadmap.md](../roadmap/TODO_monetization_roadmap.md).
