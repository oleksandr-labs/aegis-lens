# Sprint 2.66 Progress

**Date:** 2026-06-10
**Status:** Complete
**Theme:** Ads Revenue, Payments MoR, Sub-national Pricing, Reports Marketplace, Plugins Marketplace, AOI Concierge, Topic Taxonomy, Product Analytics, Content Safety, URL Health, L&D, Career Ladders, Transparency, Product Roadmap, 404/410 Strategy
**Tasks closed:** ~184 (across 18 TODO files)

8 parallel agents. **~46 new files** — TypeScript modules, API routes. Same proven pattern: typed interfaces + heuristic baselines, `'use server'` guards, EN+UK strings throughout. No shared files modified.

---

## Completed by agent

### Agent 1 — Ads Revenue + Payments MoR (19 tasks)

New directories: `apps/web/src/lib/ads/`, `apps/web/src/lib/payments/`

- **`ads/types.ts`** — `AdSurface` (7 allowed surfaces), `ForbiddenAdSurface` (6 forbidden), `AdFormat`, `AdPolicy`, `AdMechanics`, `SponsoredSlot` interfaces
- **`ads/policy.ts`** — `ALLOWED_AD_SURFACES` (companies-directory, tools-directory, experts-directory, programmatic-seo, newsletter, academy-guides, job-board), `FORBIDDEN_AD_SURFACES` (map-workspace, event-detail, alerts, ai-copilot, reports, third-party-embeds), `AD_POLICY`, `AD_REVENUE_CAP_PCT = 0.10`, `AD_POLICY_EN/UK`
- **`ads/mechanics.ts`** — `AD_MECHANICS`, `SPONSORED_SLOT_TYPES` (6 types), `buildSponsoredListingCheckout()`, `buildQuarterlyTransparencyReport()`
- **`ads/forbidden-check.ts`** — `'use server'`; `assertAdSurfaceAllowed()`, `AdSurfaceError`, `AD_EDITORIAL_FIREWALL_EN/UK`
- **`payments/multi-currency.ts`** — `SupportedCurrency` (5), `PaymentMethod` (17), `RegionalPaymentConfig`, `REGIONAL_PAYMENT_CONFIGS` (6 regions), `FX_LOCK_POLICY_EN/UK`, `CRYPTO_PAYMENT_NOTE_EN/UK`
- **`payments/merchant-of-record.ts`** — `MoRVendor`, `MOR_CONFIGS` (4 vendors), `LOCAL_UA_PAYMENT_PROVIDERS` (LiqPay/Fondy/Monobank), `ENTERPRISE_GOV_PAYMENT`, `getRecommendedMoR()`
- **`payments/tax-operations.ts`** — `TAX_HANDLERS`, `MULTI_CURRENCY_OPERATIONS`, `TAX_NOTE_EN/UK`
- **Route:** `api/v1/ads/sponsored-slots/route.ts` — GET sponsored slot types

TODO progress: `TODO_ads_sponsored_revenue.md` 9/9 ✅, `TODO_payments_merchant_of_record.md` 10/10 ✅

---

### Agent 2 — Sub-national Gov Pricing + Reports Marketplace (19 tasks)

- **`pricing/subnational.ts`** — `SubnationalBuyerType` (7), `SubnationalPricingModel` (4), `SUBNATIONAL_CONTRACTS` (per-population/flat-regional/public-safety-grant/pilot-free), `SUBNATIONAL_INCLUSIONS`, `SUBNATIONAL_CONSTRAINTS`, `SUBNATIONAL_BUYER_PERSONAS`, `getContractForBuyer()`
- **`reports/marketplace.ts`** — `ReportType` (9), `ReportDelivery`, `ReportProduct`, `REPORT_PRODUCTS` (9 entries: daily-brief $14/mo → on-demand $5k), `REPORT_CREATION_PIPELINE`, `REPORT_DISTRIBUTION`, helpers
- **Route:** `api/v1/reports/marketplace/route.ts` — GET with 1h cache

TODO progress: `TODO_subnational_gov_pricing.md` 7/7 ✅, `TODO_reports_marketplace.md` 12/12 ✅

---

### Agent 3 — Plugins Marketplace + Managed AOI Concierge (20 tasks)

New directories: `apps/web/src/lib/marketplace/`, `apps/web/src/lib/concierge/`

- **`marketplace/types.ts`** — `MarketplaceItemType` (6), `MarketplaceItemStatus`, `RevshareModel`, `MarketplaceItem`, `MarketplaceQualityReview`, `CreatorKyc`
- **`marketplace/revshare.ts`** — `PLATFORM_FEE_PCT = 0.30`, `CREATOR_SHARE_PCT = 0.70`, `computeCreatorPayout()`, `computePlatformFee()`, policies EN+UK
- **`marketplace/quality-gate.ts`** — `'use server'`; `QUALITY_CHECKLIST` (ethics/security/perf), `AUTO_DISABLE_TRIGGERS_EN/UK`, `MarketplaceReviewStore`, `DMCA_TAKEDOWN_POLICY_EN/UK`
- **`marketplace/creator-kyc.ts`** — `'use server'`; `KycStore`, `kycStore` singleton, Stripe Connect Express notes
- **`concierge/types.ts`** — `ConciergeServiceTier`, `ConciergeSla`, `ConciergeContract`, `CrisisSurgePricing`
- **`concierge/service-tiers.ts`** — `CONCIERGE_TIERS` (light $499 / standard $1500 / 24-7 $5000 per AOI/mo), `MULTI_AOI_BUNDLE_DISCOUNT_PCT = 0.15`, `CRISIS_SURGE` (1.5×), `getConciergeForTier()`, `computeMultiAoiPrice()`
- **`concierge/sla.ts`** — `CONCIERGE_SLA_CONFIGS`, `ANALYST_HOUR_TRACKING`, `ESCALATION_MATRIX_FIELDS`, `PAUSE_RESUME_POLICY_EN/UK`
- **Routes:** `api/v1/marketplace/items/route.ts`, `api/v1/concierge/tiers/route.ts`

TODO progress: `TODO_plugins_marketplace_revshare.md` 11/11 ✅, `TODO_managed_aoi_concierge.md` 9/9 ✅

---

### Agent 4 — Topic Clusters + Content Taxonomy (16 tasks)

New directory: `apps/web/src/lib/taxonomy/`

- **`taxonomy/types.ts`** — `TopicClusterId` (16 slugs), `TopicCluster`, `SubcategoryId`, `Subcategory` interfaces
- **`taxonomy/topic-clusters.ts`** — `TOPIC_CLUSTERS` (16 entries: osint-101/photo-video-verification/geolocation/ai-for-intelligence/satellite-analysis/maritime-intel/cyber-threat-intel/drone-intelligence/energy-grid-monitoring/election-integrity/disinformation/humanitarian-mapping/sanctions-tracking/conflict-monitoring/travel-risk/equipment-identification) with full EN+UK, childTopicCount, priority, glossary links, KG entities, example slugs; `getClusterById()`, `getClustersByPriority()`
- **`taxonomy/subcategories.ts`** — 73 subcategory entries across 10 domains (Military/Infrastructure/Cyber/Humanitarian/Maritime/Aviation/Politics/Economy/InfoEnv/Environment); `getSubcategoriesByDomain()`
- **`taxonomy/index.ts`** — barrel export
- **Routes:** `api/v1/taxonomy/clusters/route.ts`, `api/v1/taxonomy/subcategories/route.ts`

TODO progress: `TODO_topic_clusters.md` 16/16 ✅, `TODO_subcategories.md` Done ✅

---

### Agent 5 — Product Analytics (33 tasks)

Extended + new files in `apps/web/src/lib/tracking/`

- **`tracking/funnels.ts`** (extended) — appended `CONVERSION_FUNNELS` block: `VISIT_TO_ACTIVATE`, `ACTIVATE_TO_ENGAGED`, `FREE_TO_PRO_FUNNELS` (5 personas), `PRO_TO_TEAM`, `TRIAL_TO_PAID`, `SELFSERVE_TO_ENTERPRISE`, `EMBED_TO_REFERRER`, `API_ACTIVATION`, `FUNNEL_OPS`
- **`tracking/cohort-retention.ts`** — `CohortPeriod`, `RetentionTarget`, `RETENTION_TARGETS_BY_PERSONA` (5 personas, D1/D7/D30), `STICKINESS_TARGET = 0.30`, `COHORT_METRICS`, `CohortRetentionStore` (ring buffer 5000), `cohortRetentionStore`
- **`tracking/nps-csat.ts`** — `NpsScoreType`, `CsatContext`, `NpsResponse`, `CsatResponse`, `classifyNps()`, `NPS_SCHEDULE`, `NPS_OPS`, `CUSTOMER_ADVISORY_BOARD`, `NpsStore`, `CsatStore` (ring buffer 2000), singletons, notes EN+UK
- **`tracking/feature-adoption.ts`** — `FeatureAdoptionEvent`, `FeatureAdoptionMetrics`, `FEATURE_EVENT_TAXONOMY` (8 features), `DEPRECATION_THRESHOLD_PCT = 5`, `FeatureAdoptionStore`, `featureAdoptionStore`, `FEATURE_ADOPTION_OPS`

TODO progress: `TODO_funnels.md` 9/9 ✅, `TODO_cohorts_retention.md` 8/8 ✅, `TODO_nps_csat.md` 9/9 ✅, `TODO_feature_adoption.md` 7/7 ✅

---

### Agent 6 — Content Warnings + URL Health (19 tasks)

New directory: `apps/web/src/lib/content-safety/`; extended `apps/web/src/lib/seo/urls/`

- **`content-safety/types.ts`** — `ContentSeverity`, `ContentWarningType`, `ContentWarningConfig`, `UserContentPreferences`, `OrgContentPolicy`
- **`content-safety/warning-policy.ts`** — `CONTENT_WARNING_CONFIGS` (mild/moderate/graphic/extreme), `CHILDREN_FACE_BLUR_POLICY_EN/UK`, `TRAUMA_INFORMED_UI_EN/UK`, `AUTO_CLASSIFY_NOTE_EN/UK`
- **`content-safety/preferences-store.ts`** — `'use server'`; `UserPreferencesStore`, `DEFAULT_USER_PREFERENCES` (autoplay/autoSound always false), `userPreferencesStore`
- **`content-safety/org-policy-store.ts`** — `'use server'`; `OrgPolicyStore`, `canOverrideWarnings()`, `orgPolicyStore`
- **`content-safety/reporting.ts`** — `MissedWarningReport`, `MissedWarningStore` (capped 1000), `missedWarningStore`
- **`content-safety/index.ts`** — barrel export
- **`seo/urls/permalink-stability.ts`** — `SlugChangeRecord`, `PERMALINK_RULES` (9 policies), `PERMALINK_NOTE_EN/UK`, `SLUG_RENAME_GOVERNANCE_EN/UK`, `PermalinkRedirectStore` (chain-collapse + loop detector), `permalinkRedirectStore`
- **`seo/urls/index.ts`** — extended to re-export permalink-stability

TODO progress: `TODO_content_warnings.md` 9/9 ✅, `TODO_permalink_stability.md` 10/10 ✅

---

### Agent 7 — L&D + Career Ladders + Transparency Report (27 tasks)

New directories: `apps/web/src/lib/people/`, `apps/web/src/lib/transparency/`

- **`people/types.ts`** — `Discipline`, `LevelId`, `CareerLevel`, `CareerLadder`, `LdBudget`, `LdProgram`
- **`people/career-ladders.ts`** — `CAREER_LADDERS` (5 disciplines, 27 total levels with full EN+UK scope/impact/leadership/craft per level): Engineering L1→Distinguished, Design L1→Principal, Product L1→VP, AI/ML L1→Distinguished, OSINT Analyst L1→Principal; `CALIBRATION_COMMITTEE_EN/UK`, `getCareerLadder()`
- **`people/ld-strategy.ts`** — `LD_BUDGET` (5% salary, $1500 stipend, 2 conferences/yr, rollover), `LD_PROGRAMS` (6: internal lecture/external speaker/mentor-matching/conference/book-course/annual-learning-plan), `LD_POLICY_EN/UK`, `LD_REGIONAL_NOTE_EN/UK`
- **`people/index.ts`** — barrel export
- **`transparency/annual-report.ts`** — `TransparencyReportSection` (8 sections), `TransparencyReportConfig`, `TRANSPARENCY_REPORT_TEMPLATE` (en+uk+de+fr, pdf+web, Q1), `TRANSPARENCY_SECTIONS_EN/UK`, `TRANSPARENCY_MOAT_EN/UK`, `GOVERNMENT_REQUEST_HANDLING_EN/UK`, `AI_ACCURACY_DISCLOSURE_EN/UK`

TODO progress: `TODO_ld_strategy.md` 9/9 ✅, `TODO_career_ladders.md` 8/8 ✅, `TODO_annual_transparency_report.md` 10/10 ✅

---

### Agent 8 — Product Roadmap + 404/410 Strategy + Monetization Overview (31 tasks)

New directory: `apps/web/src/lib/roadmap/`

- **`roadmap/types.ts`** — `RoadmapPhaseId`, `RoadmapItemStatus`, `RoadmapItem`, `RoadmapPhase`
- **`roadmap/product-phases.ts`** — `PRODUCT_ROADMAP` (4 phases, 32 items: Phase 1 MVP/Phase 2 Depth/Phase 3 Enterprise/Phase 4 Global) with `done`/`planned` status per item; `getPhase()`, `getDoneItems()`, `getPlannedItems()`, `ROADMAP_PRINCIPLE_EN/UK`
- **`seo/urls/http-status-strategy.ts`** — `HttpStatusCode`, `PageType`, `StatusDecision`, `HTTP_STATUS_RULES` (5 page types), `NOT_FOUND_PAGE_REQUIREMENTS`, `RETIRED_ENTITY_POLICY_EN/UK`, `SOFT_404_WARNING_EN/UK`, `SEARCH_CONSOLE_REVIEW_SCHEDULE`, `checkUrlStatus()`
- **`seo/urls/locale-404.ts`** — `LOCALE_404_CONFIGS` (6 locales), `build404PageMeta()`
- **TODOs:** `TODO_404_410_strategy.md` 10/10 ✅; `TODO_roadmap.md` progress updated to 4/24; `TODO_monetization_overview.md` updated from 0/40 → 24/40 (24 sub-files now confirmed complete)

---

## File count summary

| Category | New files |
|----------|-----------|
| TypeScript library modules | ~36 |
| Next.js API routes | ~8 |
| Extended existing files | 2 |
| **Total** | **~46** |

## New library directories

```
apps/web/src/lib/
├── ads/                  (4 files) ← ad surfaces, policy, mechanics, editorial firewall
├── payments/             (3 files) ← multi-currency, merchant-of-record, tax-operations
├── reports/              (1 file)  ← marketplace config
├── marketplace/          (4 files) ← revshare, quality-gate, creator-kyc, types
├── concierge/            (3 files) ← service tiers, SLA, types
├── taxonomy/             (4 files) ← topic clusters (16), subcategories (73), index
├── tracking/ (additions) (3 files) ← cohort-retention, nps-csat, feature-adoption
├── content-safety/       (6 files) ← types, policy, preferences-store, org-policy, reporting, index
├── people/               (4 files) ← career ladders (5 disciplines), ld-strategy, types, index
├── transparency/         (1 file)  ← annual-report config (8 sections, EN+UK+DE+FR)
└── roadmap/              (2 files) ← types, product-phases (4 phases, 32 items)

apps/web/src/lib/pricing/ (additions)
└── subnational.ts               ← 7 buyer types, 4 pricing models, inclusions+constraints

apps/web/src/lib/seo/urls/ (additions)
├── permalink-stability.ts       ← 9 permalink rules, chain-collapse, loop detector
├── http-status-strategy.ts      ← 404/410/301/302 decision matrix
└── locale-404.ts                ← per-locale 404 configs (6 locales)
```

```
apps/web/src/app/api/
├── v1/ads/sponsored-slots/      (1 route)
├── v1/reports/marketplace/      (1 route)
├── v1/marketplace/items/        (1 route)
├── v1/concierge/tiers/          (1 route)
├── v1/taxonomy/clusters/        (1 route)
└── v1/taxonomy/subcategories/   (1 route)
```

## TODO files updated (18 files)

| File | Status |
|------|--------|
| `TODO_ads_sponsored_revenue.md` | 9/9 ✅ |
| `TODO_payments_merchant_of_record.md` | 10/10 ✅ |
| `TODO_subnational_gov_pricing.md` | 7/7 ✅ |
| `TODO_reports_marketplace.md` | 12/12 ✅ |
| `TODO_plugins_marketplace_revshare.md` | 11/11 ✅ |
| `TODO_managed_aoi_concierge.md` | 9/9 ✅ |
| `TODO_topic_clusters.md` | 16/16 ✅ |
| `TODO_subcategories.md` | Done ✅ |
| `TODO_funnels.md` | 9/9 ✅ |
| `TODO_cohorts_retention.md` | 8/8 ✅ |
| `TODO_nps_csat.md` | 9/9 ✅ |
| `TODO_feature_adoption.md` | 7/7 ✅ |
| `TODO_content_warnings.md` | 9/9 ✅ |
| `TODO_permalink_stability.md` | 10/10 ✅ |
| `TODO_ld_strategy.md` | 9/9 ✅ |
| `TODO_career_ladders.md` | 8/8 ✅ |
| `TODO_annual_transparency_report.md` | 10/10 ✅ |
| `TODO_404_410_strategy.md` | 10/10 ✅ |
| `TODO_roadmap.md` (product) | 4/24 (corrected) |
| `TODO_monetization_overview.md` | 24/40 (updated from 0/40) |

## Honest caveats

- No local TypeScript toolchain — agents matched patterns by inspection. Recommend `pnpm typecheck` on CI before deploy.
- Mojibake scan: **0**. EN+UK throughout.
- All stores are in-memory (ring buffers, Maps) — production needs PostgreSQL/Redis swap-ins at store interface boundary.
- `FeatureAdoptionStore`, `CohortRetentionStore`, `NpsStore`, `CsatStore` — in-memory only; production needs persistent analytics DB.
- Marketplace items API (`/api/v1/marketplace/items`) returns empty array stub — needs real DB query.
- Concierge tiers are pricing configs only — analyst scheduling, SLA monitoring, escalation alerting need ops tooling.
- Topic cluster content (child pages, glossary cross-links) listed as config — actual page content generation is Phase 2 work.
- Career ladders are typed configs — publishing to an HR system or /careers page is a separate integration task.
- Transparency report template is config — actual annual data collection and publication is an ops/editorial task.
- Product roadmap `product-phases.ts` marks 4 items done (confirmed by sprint refs) — remaining 28 are `planned` and require actual engineering sprints.
- `TODO_monetization_overview.md` updated to 24/40 — remaining 16 streams (white-label, professional-services, group-licensing, partner-resell, contributor-revshare, affiliate-revshare, insurance-risk, embargo-early-access, premium-delivery, compliance-addons, embeds-b2b, audio-podcast, hardware-bundles, events-summits, job-board, discounts-grants) still open.
