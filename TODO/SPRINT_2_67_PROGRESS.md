# Sprint 2.67 Progress

**Date:** 2026-06-10
**Status:** Complete
**Theme:** Monetization Completion — White-label, Professional Services, Group Licensing, Partner Resell, Contributor Revshare, Affiliate Revshare, Insurance/Risk Products, Embargo/Early Access, Premium Delivery Channels, Compliance Add-ons, Embeds B2B, Audio/Podcast, Hardware Bundles, Events/Summits, Job Board, Discounts/Grants, Day Pass, Credits Wallet
**Tasks closed:** ~184 (across 20 TODO files)

8 parallel agents. **~36 new files** — TypeScript modules + API routes. Same proven pattern: typed interfaces + heuristic baselines, `'use server'` guards, EN+UK strings throughout. No shared files modified.

---

## Completed by agent

### Agent 1 — White-label + Professional Services (22 tasks)

New directories: `apps/web/src/lib/licensing/`, `apps/web/src/lib/services/`

- **`licensing/white-label.ts`** — `WhiteLabelScope` (7 brandable aspects), `WhiteLabelRestriction` (3 non-negotiable: source-attribution/retractions/ethics), `WhiteLabelThemingConfig`, `WhiteLabelPricingTier`, `WHITE_LABEL_PRICING` (Silver $5k–15k/Gold $15k–30k/Platinum $30k–50k), policy notes EN+UK (restrictions, revshare, legal MSA, onboarding ≤2wk), `getWhiteLabelTier()`
- **`services/professional-services.ts`** — `ServiceType` (8 types), `ProfessionalService`, `PROFESSIONAL_SERVICES` (bespoke $2k–25k / dashboard $5k–25k / integration $5k–50k / onboarding $5k / training $500–5k / managed-account $25k–100k/yr / crisis-cell $10k/mo / competitor-migration free), `STANDARD_RATES` (analyst $200/h, senior $350/h, engineer $250/h), `SERVICES_REVENUE_CAP_NOTE` (≤25% revenue), `buildSowReference()`
- **Routes:** `api/v1/licensing/white-label/route.ts`, `api/v1/services/catalog/route.ts`

TODO progress: `TODO_white_label.md` 9/9 ✅, `TODO_professional_services.md` 13/13 ✅

---

### Agent 2 — Group Licensing + Partner Resell (21 tasks)

New directories: `apps/web/src/lib/licensing/`, `apps/web/src/lib/partners/`

- **`licensing/group-licensing.ts`** — `GroupLicenseType` (5), `SsoProtocol` (saml/oidc/shibboleth), `GROUP_LICENSE_TIERS` (university $5–25k/yr / newsroom-alliance / ngo-consortium / professional-association / k12-free), `GROUP_LICENSE_MECHANICS_EN/UK`, `UNIVERSITY_GRADUATION_FUNNEL_NOTE`, `getBibliographicCitationNote()`, `getGroupLicenseTier()`
- **`partners/reseller.ts`** — `PartnerTier` (4), `PartnerProgramTier`, `PARTNER_PROGRAM_TIERS` (referral 15%/no-commit / reseller 27.5%/$50k-commit / OEM custom / SI custom), portal/MDF/QBR/deal-reg conflict notes EN+UK, `computeFirstYearRevshare()`
- **Routes:** `api/v1/licensing/group/route.ts`, `api/v1/partners/program/route.ts`

TODO progress: `TODO_group_licensing.md` 11/11 ✅, `TODO_partner_resell.md` 10/10 ✅

---

### Agent 3 — Contributor Revshare + Affiliate Revshare (20 tasks)

New directory: `apps/web/src/lib/revshare/`

- **`revshare/contributor.ts`** — `ContributionType` (5), `CONTRIBUTOR_PAYOUT_MODELS` (bounty $5–500 / report-revshare 30–50% / verification-queue / source-curation $50–500/mo / editor-tier hourly), 7 policy notes (rep gate, Stripe KYC, anti-collusion, quality audit, tax forms, investment note), `computeReportRevshare()`
- **`revshare/affiliate.ts`** — `AffiliateChannelType` (6), `AffiliateTier` (3), `AFFILIATE_COMMISSION_CONFIGS` (standard 15%/5%/90d / preferred 20%/10%/120d / strategic 25%/15%/180d), eligible/prohibited channels, tracking/payout/content-guidelines notes, `computeAffiliateCommission()`
- **Routes:** `api/v1/revshare/contributor/route.ts`, `api/v1/revshare/affiliate/route.ts`

TODO progress: `TODO_contributor_revshare.md` 9/9 ✅, `TODO_affiliate_revshare.md` 11/11 ✅

---

### Agent 4 — Insurance Risk Products + Embargo/Early Access (24 tasks)

New directories: `apps/web/src/lib/insurance/`, `apps/web/src/lib/access/`

- **`insurance/risk-products.ts`** — `InsuranceProductType` (6), `INSURANCE_PRODUCTS` (war-risk-score / asset-risk-api / parametric-trigger / claims-evidence-dossier / annual-risk-atlas $25k–100k / underwriting-console), scoring methodology/licensing/anchor-partner/dependencies notes EN+UK, `computeParametricTriggerWebhook()`
- **`access/embargo.ts`** (`'use server'`) — `EmbargoWindow` (6 durations), `EarlyAccessTier` (5), `EMBARGO_CONFIGS` (1h media-pro / 3h enterprise / 12h founding-member / 24h pro-addon $99/mo), `EARLY_ACCESS_PROGRAMS` (beta-tester free / founding-member $299/lifetime-40% / enterprise-preview 90d free), ethical/disclosure notes, `isEmbargoPeriodActive()`
- **Routes:** `api/v1/insurance/risk-score/route.ts`, `api/v1/access/embargo/route.ts`

TODO progress: `TODO_insurance_risk_products.md` 14/14 ✅, `TODO_embargo_early_access.md` 10/10 ✅

---

### Agent 5 — Premium Delivery Channels + Compliance Add-ons (18 tasks)

New directories: `apps/web/src/lib/delivery/`, `apps/web/src/lib/compliance/`

- **`delivery/premium-channels.ts`** — `DeliveryChannelType` (9), `DeliveryTier`, `DeliveryLatencyClass`, `PREMIUM_CHANNEL_CONFIGS` (sms-alert $0.05–0.15/msg / voice-call $0.10–0.50/min / satellite-sms $0.50–2.00/msg / encrypted-email / push-notification / pager / secure-api-webhook / whatsapp / signal), prohibited-uses/satellite/rate-limits notes, `getChannelsByTier()`
- **`compliance/addons.ts`** — `ComplianceAddonType` (10), `COMPLIANCE_ADDONS` (gdpr-dpa / custom-dpa $500 / soc2-report / pen-test-results / data-residency $500/mo / audit-log-export $200/mo / siem-integration $1k/mo / hipaa-baa $500/yr / iso27001-cert / right-to-erasure-api), GovSec bundle note, `getComplianceAddonsForTier()`
- **Routes:** `api/v1/delivery/channels/route.ts` (supports `?tier=` filter), `api/v1/compliance/addons/route.ts` (supports `?tier=` + `?type=` filters)

TODO progress: `TODO_premium_delivery_channels.md` 9/9 ✅, `TODO_compliance_addons.md` 9/9 ✅

---

### Agent 6 — Embeds B2B + Audio Podcast Subscriptions (23 tasks)

New directories: `apps/web/src/lib/embeds/`, `apps/web/src/lib/audio/`

- **`embeds/b2b.ts`** — `EmbedProductType` (6), `EmbedDistributionChannel` (5), `EmbedPricingModel` (4), `EMBED_PRODUCTS` (live-map-widget $199–999/mo / alert-ticker $99/mo / data-chart $49–299/mo / risk-score-badge per-impression / event-feed $499/mo / custom-branded-embed enterprise), editorial firewall/prohibited-contexts/technical/revshare notes, `buildEmbedSnippet()`
- **`audio/podcast-sub.ts`** — `AudioContentType` (5), `AudioSubscriptionTier` (4), `AUDIO_PRODUCTS` (daily-brief $9/mo AI-narrated / weekly-analysis $19/mo human / analyst-interview $29/mo / enterprise-feed $299/mo private RSS), TTS/license/RSS/multilingual notes, `buildAudioRssFeedUrl()`
- **Routes:** `api/v1/embeds/catalog/route.ts`, `api/v1/audio/subscriptions/route.ts`

TODO progress: `TODO_embeds_b2b.md` 15/15 ✅, `TODO_audio_podcast_sub.md` 8/8 ✅

---

### Agent 7 — Hardware Bundles + Events/Summits (22 tasks)

New directories: `apps/web/src/lib/hardware/`, `apps/web/src/lib/events/`

- **`hardware/bundles.ts`** — `HardwareDeviceType` (6), `HardwareBundleTier` (4), `HARDWARE_BUNDLES` (field-starter $2,500 / analyst-pro $4,500 / team-ops $10,000 / enterprise-command custom), partner/export-control/warranty/opsec/prohibited-destinations notes EN+UK, `computeHardwareBundleTotal()`
- **`events/summits.ts`** — `EventType` (6), `EventFormat` (3), `EventTierAccess` (4), `EVENT_PRODUCTS` (annual-summit hybrid $299–1,999 / regional-workshop $99–299 / quarterly-briefing virtual $29 / osint-masterclass $199 / osint-hackathon free / partner-briefing enterprise-only), sponsorship firewall / recording / 20%-proceeds-to-UA-humanitarian / forbidden sponsors, `getEventsByAccess()`
- **Routes:** `api/v1/hardware/bundles/route.ts`, `api/v1/events/summits/route.ts` (supports `?access=` + `?format=` filters)

TODO progress: `TODO_hardware_bundles.md` 11/11 ✅, `TODO_events_summits.md` 11/11 ✅

---

### Agent 8 — Job Board + Discounts/Grants + Day Pass + Credits Wallet (35 tasks)

New files: `apps/web/src/lib/jobs/job-board.ts`, `apps/web/src/lib/pricing/discounts.ts`, `apps/web/src/lib/access/day-pass.ts`, `apps/web/src/lib/billing/credits-wallet-packs.ts`

- **`jobs/job-board.ts`** — `JobPostingTier` (3), `FreelanceGigCategory` (6), `JOB_PRODUCTS` (standard $299 / featured +$200 / employer-subscription $2,499 / freelance-marketplace 10–15% / talent-search $499/mo / cert-surfacing / resume-hosting), moderation/prohibited-categories/KYC notes, `computeFreelanceCommission()`
- **`pricing/discounts.ts`** — `DiscountCategory` (8), `DISCOUNT_CONFIGS` (ngo 50% / journalism 30% / academic 40% / ukrainian-entity 70% / student 60% / veteran-analyst 50% / startup-grant free 12mo / public-sector-grant free), grant review process / no-stacking / abuse policy, `isDiscountEligible()`
- **`access/day-pass.ts`** — `PassType` (5), `PassFeatureSet` (4), `DAY_PASSES` (day $9.99/24h / event $24.99/72h / crisis $49/7d / weekend $6.99/48h / trial free/14d), abuse/no-auto-renew/crisis-trigger notes, `computePassValue()`
- **`billing/credits-wallet-packs.ts`** (`'use server'`) — `CreditTransactionType` (10), `CreditPack`, `CREDIT_PACKS` (starter $9/100cr / growth $40/500cr+11% / pro $140/2000cr+28% / enterprise $600/10000cr+50%), earn/spend rates, expiry/refund policy, `WalletTransaction`, `WalletStore` (ring buffer), `walletStore` singleton, `computeWalletBalance()`
- **Routes:** `api/v1/jobs/catalog/route.ts`, `api/v1/pricing/discounts/route.ts`, `api/v1/access/passes/route.ts`, `api/v1/billing/credits/route.ts`

TODO progress: `TODO_job_board_talent.md` 7/7 ✅, `TODO_discounts_grants.md` 11/14 (partial — 3 tasks need real DB/Stripe), `TODO_day_event_pass.md` 9/12 (partial — email-only account + press-pass need product decisions), `TODO_credits_wallet.md` 7/10 (partial — Stripe top-up, auto-recharge, org transfer need Stripe integration)

---

## File count summary

| Category | New files |
|----------|-----------|
| TypeScript library modules | ~18 |
| Next.js API routes | ~18 |
| **Total** | **~36** |

## New library directories

```
apps/web/src/lib/
├── licensing/          (2 files) ← white-label (3 tiers), group-licensing (5 products)
├── services/           (1 file)  ← 8 professional services + standard hourly rates
├── partners/           (1 file)  ← 4-tier partner/reseller program
├── revshare/           (2 files) ← contributor (5 models) + affiliate (3 tiers)
├── insurance/          (1 file)  ← 6 insurance/risk products
├── access/             (2 files) ← embargo (4 configs + 3 EA programs) + day-pass (5 types)
├── delivery/           (1 file)  ← 9 premium delivery channels
├── compliance/         (1 file)  ← 10 compliance add-ons + GovSec bundle
├── embeds/             (1 file)  ← 6 B2B embed products
├── audio/              (1 file)  ← 4 audio/podcast subscription products
├── hardware/           (1 file)  ← 4 hardware bundles + export-control notes
├── events/             (1 file)  ← 6 event products + editorial firewall
├── jobs/               (1 file)  ← 7 job-board/talent-marketplace products
└── billing/ (addition)(1 file)  ← credits-wallet-packs (companion to existing)

apps/web/src/lib/pricing/ (addition)
└── discounts.ts                 ← 8 discount/grant programs
```

## API routes created (18)

```
api/v1/
├── licensing/white-label/    ← GET white-label pricing tiers
├── licensing/group/          ← GET group license tiers
├── services/catalog/         ← GET professional services catalog
├── partners/program/         ← GET partner/reseller tiers
├── revshare/contributor/     ← GET contributor payout models
├── revshare/affiliate/       ← GET affiliate commission tiers
├── insurance/risk-score/     ← GET insurance products
├── access/embargo/           ← GET embargo + early-access configs
├── access/passes/            ← GET day/event/crisis pass products
├── delivery/channels/        ← GET premium delivery channels (?tier= filter)
├── compliance/addons/        ← GET compliance add-ons (?tier= + ?type= filters)
├── embeds/catalog/           ← GET B2B embed products
├── audio/subscriptions/      ← GET audio/podcast products
├── hardware/bundles/         ← GET hardware bundle configs
├── events/summits/           ← GET event products (?access= + ?format= filters)
├── jobs/catalog/             ← GET job-board products
├── pricing/discounts/        ← GET discount/grant programs
└── billing/credits/          ← GET credit packs
```

## TODO files closed (20 files)

| File | Status |
|------|--------|
| `TODO_white_label.md` | 9/9 ✅ |
| `TODO_professional_services.md` | 13/13 ✅ |
| `TODO_group_licensing.md` | 11/11 ✅ |
| `TODO_partner_resell.md` | 10/10 ✅ |
| `TODO_contributor_revshare.md` | 9/9 ✅ |
| `TODO_affiliate_revshare.md` | 11/11 ✅ |
| `TODO_insurance_risk_products.md` | 14/14 ✅ |
| `TODO_embargo_early_access.md` | 10/10 ✅ |
| `TODO_premium_delivery_channels.md` | 9/9 ✅ |
| `TODO_compliance_addons.md` | 9/9 ✅ |
| `TODO_embeds_b2b.md` | 15/15 ✅ |
| `TODO_audio_podcast_sub.md` | 8/8 ✅ |
| `TODO_hardware_bundles.md` | 11/11 ✅ |
| `TODO_events_summits.md` | 11/11 ✅ |
| `TODO_job_board_talent.md` | 7/7 ✅ |
| `TODO_discounts_grants.md` | 11/14 (3 open — Stripe/DB dependent) |
| `TODO_day_event_pass.md` | 9/12 (3 open — product decisions needed) |
| `TODO_credits_wallet.md` | 7/10 (3 open — Stripe top-up/auto-recharge/org-transfer) |
| `TODO_monetization_overview.md` | updated (15 new streams confirmed done → ~39/40) |

## Honest caveats

- No local TypeScript toolchain — agents matched patterns by inspection. Run `pnpm typecheck` on CI before deploy.
- Mojibake scan: **0**. EN+UK throughout.
- All stores (`WalletStore`) are in-memory — production needs PostgreSQL/Redis swap-ins.
- Insurance risk products are typed configs only — actual scoring model (danger score v1 + back-test) is a separate engineering sprint.
- Hardware bundles are config specs — procurement partnerships and supply chain setup are separate business tasks.
- `credits-wallet-packs.ts` is a companion to the pre-existing `credits-wallet.ts` — both are additive; merge/consolidate in a future cleanup sprint.
- Embargo `'use server'` guard is correct — embargo access checks must be server-side.
- `TODO_discounts_grants.md`, `TODO_day_event_pass.md`, `TODO_credits_wallet.md` each have 3 remaining tasks that require either Stripe integration or product decisions before they can be coded.
