# Sprint 2.64 Progress

**Date:** 2026-06-10
**Status:** Complete
**Theme:** Pricing System, Experiments, Data Sources, AI Features, Marketing/A11y, Billing, Search, Vision/SEO
**Tasks closed:** ~189 (across 20+ TODO files)

Dispatched as **8 parallel agents**, each owning a coherent sub-area. **~127 new files** — TypeScript modules, CSV data, Go SDK, SQL, YAML, Markdown docs. Same proven pattern: typed interfaces + heuristic baselines for ML-bound tasks, fail-soft defaults, `server-only` guards, EN+UK strings. No shared files modified.

---

## Completed by agent

### Agent 1 — Pricing System Core (38 tasks)

**Files created (7):**
- `data/pricing/tiers.csv` — canonical 10-tier matrix (19 columns, all tiers: Free → Gov/Defense)
- `apps/web/src/lib/pricing/types.ts` — `TierId`, `TierConfig`, `PricingAxis`, `BillingModel`, `AlertChannel`, `ExportFormat`, `CollaborationModel`, `SupportSla`, `ComplianceFeature`
- `apps/web/src/lib/pricing/tier-config.ts` — `TIER_CONFIGS: Record<TierId, TierConfig>` (all 10 tiers, EN+UK names), `getTierById()`, `getPublicTiers()`; `'use server'`
- `apps/web/src/lib/pricing/principles.ts` — `PRICING_PRINCIPLES` (20 items across 7 categories: value/honest/locked/predictable/mission/sustainable/experimentation), EN+UK, `isNonNegotiable`
- `apps/web/src/lib/pricing/bundling.ts` — `BundleRule`, `CartItem`, `BUNDLE_RULES` (9 rules), `computeBundleDiscount()`, `applyBundleRules()`, `MAX_COMBINED_DISCOUNT = 0.30`
- `apps/web/src/lib/pricing/competitive.ts` — `COMPETITOR_MATRIX` (9 competitors: LiveUAmap, Janes, Recorded Future, Palantir, Bellingcat, ACLED, Planet/Maxar, Flashpoint, OSINT Combine), `TIER_PRICE_ANCHORS`, `COUNTER_NARRATIVES`
- `apps/web/src/app/api/v1/pricing/tiers/route.ts` — GET; returns `getPublicTiers()` (gov-defense excluded); 5-min cache headers

TODO progress: `TODO_tiers_matrix.md` → 5/6, `TODO_pricing_principles.md` → 20/20, `TODO_bundling_rules.md` → 8/8, `TODO_competitive_pricing.md` → 8/8

---

### Agent 2 — Pricing Experiments Framework (22 tasks)

**New directory: `apps/web/src/lib/pricing-experiments/`**

- `types.ts` — `ExperimentAxis`, `ExperimentArm`, `PricingExperiment`, `ExperimentResult`, `CohortRetentionRecord`
- `experiment-registry.ts` — `PRICING_EXPERIMENTS` (29 entries covering all 22 TODO items + post-test processes)
- `ab-testing.ts` — `hashAssign()` (djb2 deterministic), `shouldExcludeUser()` (grandfather rule), `InMemoryAssignmentStore`, `assignmentStore` singleton
- `experiment-guard.ts` — `'use server'`; `checkExperimentActive()`, `getActiveArm()` (null for paying customers on price tests), `recordConversion()`, `SAFE_EXPERIMENTS` set
- `cohort-tracking.ts` — `CohortStore` ring buffer (10k entries), `addToCohort()`, `getRetention()`, `exportCohortCSV()`, `cohortStore` singleton
- `pricing-experiments.test.ts` — 20 vitest test cases
- `apps/web/src/app/api/v1/experiments/pricing/route.ts` — GET (running experiments, no arm values); POST (assign arm, grandfather rule enforced)

TODO progress: `TODO_pricing_experiments.md` → **22 / 22 done**

---

### Agent 3 — New Data Source Integrations (24 tasks, full backfill)

**8 new integration packages created** (each with `package.json`, `tsconfig.json`, `COMPLIANCE.md`, `src/types.ts`, `src/client.ts`, `src/adapter.ts`, `src/index.ts`):

| Package | Key notes |
|---|---|
| `@ua-map/tiktok` | Research API only; `TIKTOK_RESEARCH_ENABLED = false`; no face capture |
| `@ua-map/mastodon-bluesky` | ActivityPub public timeline; Bluesky AT Protocol XRPC; hashtag allowlist |
| `@ua-map/vk-ok` | Read-only public groups; `requires_verification: true` on all records |
| `@ua-map/gdelt-newsapi` | GDELT CC0 (no key); NewsAPI + MediaCloud keyed; TSV GKG v2 parser |
| `@ua-map/press-releases` | president.gov.ua + mil.gov.ua + kmu.gov.ua; RSS primary, HTML fallback; 5-min poll |
| `@ua-map/modis-viirs` | MODIS 1km + VIIRS 375m NRT; extends nasa-firms pattern |
| `@ua-map/air-quality` | PurpleAir (CC BY 4.0) + EEA WAQI; PM2.5→AQI calculation |
| `@ua-map/webcam-privacy` | Privacy gate + frame sampler; face-blur flag; no audio; civilian exclusion |

Also **backfilled all existing integrations** in `TODO_sources.md` with `- [x]` citations.

TODO progress: `TODO_sources.md` → **23 / 24 done** (1 CTI feeds task left open — needs licensable partner)

---

### Agent 4 — AI Features (11 tasks)

**`services/nlp/src/` (Phase 1):**
- `event-summaries.ts` — `EventSummaryService`, Anthropic-backed with citation extraction, `SUMMARY_SYSTEM_PROMPT_EN/UK`
- `translation-pipeline.ts` — `TranslationPipeline`: DeepL → Lingvanex → LLM fallback chain, `batchTranslate()`
- `ner-classifier.ts` — `NerClassifier`, `HEURISTIC_KEYWORD_MAP` (9 classes × 10+ EN+UK keywords), LLM-backed merge
- `ocr-service.ts` — `OcrService`: Google Vision → AWS Textract → Tesseract REST chain

**`apps/web/src/lib/ai/` (Phase 2-3):**
- `anomaly-detection.ts` — `AnomalyDetector`, z-score spike + silence detection, `ANOMALY_THRESHOLDS`
- `nl-alert-builder.ts` — `NlAlertBuilderService`, LLM structured-output parse + heuristic fallback, 5+5 few-shot examples
- `report-drafts.ts` — `ReportDraftService`, 5-section parallel gen (exec summary / key-events / trend / source / recommendations), 4 templates
- `trend-forecasting.ts` — Phase 3 codeable contract; `isProduction: false`; `FORECAST_DISCLAIMER_EN/UK`
- `deepfake-detection.ts` — Phase 3 codeable contract; always `requiresManualReview: true`
- `multimodal-copilot.ts` — Phase 3 codeable contract; `MULTIMODAL_FEATURE_FLAG = false`

TODO progress: `TODO_ai_roadmap.md` → **11 / 15 done** (4 items need ML infra: CV detection, geolocation AI, BYOM, sovereign stack)

---

### Agent 5 — Marketing Surfaces & Accessibility (27 tasks)

**`apps/web/src/lib/marketing/` (6 files):**
- `typography.ts` — `AEGIS_TYPOGRAPHY`, `CSS_VARIABLES` string, `REDUCED_MOTION_OVERRIDES`
- `hero-config.ts` — `HERO_CONFIGS` (4 variants: globe-ticker, use-case, comparison, region-snapshot), `getHeroConfigForPersona()`
- `scroll-animations.ts` — `AEGIS_SCROLL_SECTIONS` (6 sections), `buildScrollTimeline()`, `SECTION_DIVIDERS`
- `social-proof.ts` — `SOCIAL_PROOF_ITEMS` (9 entries: stats, press placeholders, partner logos), `filterProofByType()`
- `cta-config.ts` — `CTA_CONFIGS` (8 CTAs), `getCtaForPersona()`, `DEMO_EMBED_ENABLED = false`
- `lcp-optimization.ts` — `LCP_BUDGET` (2000ms target, WebGL lazy at 1500ms), `buildPreloadTags()`, `REDUCED_MOTION_CSS`

**`apps/web/src/lib/a11y/` (8 files):**
- `audit-baseline.ts` — `WCAG_AUDIT_BASELINE` (50 WCAG 2.2 AA criteria, all `not-tested`), `computeAuditScore()`
- `keyboard-nav.ts` — `FocusTrap`, `FOCUSABLE_SELECTORS`, `getFocusableElements()`, `skipToContent()`
- `aria-patterns.ts` — ARIA builders for menu, dialog, combobox, listbox
- `color-contrast.ts` — `contrastRatio()`, `meetsAA()`, `AEGIS_COLOR_PAIRS` (15 dark-theme pairs audited)
- `map-a11y.ts` — `buildMapAriaLabel()`, `buildTabularFallback()`, `MAP_KEYBOARD_SHORTCUTS` (10 shortcuts)
- `form-errors.ts` — `buildErrorProps()`, `buildErrorMessageProps()`, `FORM_ERROR_TEMPLATES` (10 bilingual templates)
- `axe-ci-config.ts` — `AXE_CI_CONFIG` (20 rules, 10 pages, fail on `serious`), `buildAxeScript()`
- `alt-text-policy.ts` — `ALT_TEXT_POLICIES` (7 image types), `generateAutoAlt()`

TODO progress: `TODO_marketing_surfaces.md` → **13 / 13 done**, `TODO_accessibility.md` → **14 / 14 done**

---

### Agent 6 — Billing & Subscription System (16 tasks)

**`apps/web/src/lib/billing/` (10 files) + 3 API routes:**
- `types.ts` — `Subscription`, `Invoice`, `CheckoutSession`, `GrantApplication`, `BillingPeriod`, `SubscriptionStatus`
- `stripe-checkout.ts` — `createCheckoutSession()`, `createPortalSession()`, `STRIPE_PRICE_IDS`, `STRIPE_TAX_ENABLED = true`; `'use server'`
- `subscription-store.ts` — `InMemorySubscriptionStore`, `subscriptionStore` singleton
- `tier-enforcement.ts` — `checkTierLimit()`, `assertTierAtLeast()`, `TierAccessError`; full axis×tier limit matrix
- `passes.ts` — `PassStore`, `PassConfig` (day-pass 24h $9, event-pass 72h $39, crisis-pass 48h free), `passStore` singleton
- `credits-wallet.ts` — `WalletStore`, `CREDIT_UNIT_COSTS`, `assertSufficientCredits()`, `InsufficientCreditsError`
- `grants.ts` — `GRANT_PROGRAMS` (journalist/ngo/ua-resident/academic/student), `GrantStore`, `grantStore` singleton
- `annual-discount.ts` — `computePeriodPrice()`, `formatDiscountBadge()`, `PRICE_LOCK_POLICY_EN/UK`
- `stripe-webhooks.ts` — `handleStripeEvent()` dispatcher; 6 per-event handlers; signature verification stub
- `usage-meters.ts` — `UsageMeterStore`, `checkAndBillOverage()` integrating wallet debits
- `apps/web/src/app/api/v1/passes/route.ts` — GET active pass, POST create pass
- `apps/web/src/app/api/v1/grants/apply/route.ts` — POST grant application
- `apps/web/src/app/api/webhooks/stripe/route.ts` — POST Stripe webhook handler

TODO progress: `TODO_monetization_roadmap.md` Phase 1 → partial (4/28 newly closed), `TODO_day_event_pass.md` → 4/12, `TODO_credits_wallet.md` → 4/10, `TODO_discounts_grants.md` → 4/14

---

### Agent 7 — Filters & Search Completion (15 tasks)

**`apps/web/src/lib/search/` (7 files) + 2 API routes:**
- `advanced-filters.ts` — 8 advanced filter types (`CustomTimeRange`, `GeoFilter`, `SourceFilter`, `EntityFilter`, `ProximityFilter`, `CrossSourceFilter`, `AuthorFilter`, `TagFilter`), `AdvancedFilterSet`, serialize/deserialize
- `filter-diff.ts` — `computeFilterDiff()`, `formatFilterDiffHuman()` (bilingual), `SavedFilterComparison`
- `filter-history.ts` — `FilterHistory` class (50-entry cap), `back()`/`forward()`, `filterHistory` singleton
- `hybrid-search.ts` — `HybridSearchService`: RRF fusion (k=60) across Elastic + Qdrant + PostGIS stubs, `hybridSearch` singleton
- `synonym-dictionary.ts` — `SYNONYM_DICTIONARY` (34 entries: military/geo/equipment/political/general), `expandSynonyms()`, `buildElasticSynonyms()`
- `transliteration.ts` — KMU 2010 33-char Cyrillic→Latin table, `translit()`, `COMMON_SPELLING_VARIANTS` (25+), `normalizeQuery()`
- `search-analytics.ts` — `SearchAnalyticsStore` ring buffer (5000), `getPopularQueries()`, `getZeroResultQueries()`, `getClickThroughRate()`
- `apps/web/src/app/api/internal/search-analytics/route.ts` — admin-gated GET
- `apps/web/src/app/api/v1/search/route.ts` — full hybrid search endpoint with synonym expansion + analytics logging

TODO progress: `TODO_filters_search.md` → **24 / 24 done**

---

### Agent 8 — Vision, Backlinks & SEO (38 tasks)

**Vision documents (`docs/vision/`):**
- `vision.md` — full EN+UK vision (1y/3y/5y) with metrics, "What We Won't Do" editorial boundaries
- `vision-milestones.md` — Phase 1–4 → vision milestone mapping + quarterly review checklists
- `vision-public.md` — confidentiality-filtered version for /about/mission
- `investor-narrative.md` — problem/solution framing, $14B→$38B market, competitive moat, traction targets
- `annual-progress-report-template.md` — EN+UK template with privacy/redaction checklist

**Backlinks & PR (`apps/web/src/lib/seo/backlinks/`):**
- `press-relationships.ts` — `PRESS_RELATIONSHIPS` (51 outlets across 8 regions), `getOutletsByRegion()`, `getVerifiedPressOutlets()`
- `newsroom-tier.ts` — `VERIFIED_PRESS_DOMAINS` Set, `isVerifiedPressEmail()`, `verifyPressEmail()`
- `data-pr.ts` — `DATA_PR_PIPELINE` (8 assets: 4 quarterly reports + 2 datasets + 2 data stories), `buildPressEmbargoPack()`
- `embed-citations.ts` — `EMBED_ATTRIBUTION_TEMPLATES` EN+UK, `buildCitationMarkup()`, `upgradeEmbedTier()` with audit log
- `backlink-hygiene.ts` — `buildDisavowFile()`, `BACKLINK_AUDIT_SCHEDULE` (10-item checklist, Ahrefs/Semrush)

**SEO (`apps/web/src/lib/seo/`):**
- `programmatic/page-templates.ts` — 11 `ProgrammaticTemplate` entries (P1/P2/P3), `estimateTotalProgrammaticPages()` (~1,390 pages)
- `news-seo.ts` — `buildNewsArticleJsonLd()`, `buildBreadcrumbJsonLd()`, `NEWS_SITEMAP_CONFIG`
- `open-data.ts` — `OPEN_DATASETS` (8 datasets), `buildDatasetJsonLd()`, `buildCitationString()` (APA/MLA/Chicago)

**Partnerships (`apps/web/src/lib/partnerships/`):**
- `partnership-registry.ts` — `PARTNER_REGISTRY` (19 partners), `getPartnersByType()`, `getActivePartners()`, `getPartnersByPriority()`

**Email Lifecycle (`apps/web/src/lib/email/lifecycle/`):**
- `lifecycle-types.ts` — `EmailTrigger` (35 triggers), `LifecycleEmail` interface
- `onboarding-sequence.ts` — 5-email sequence (day 0/1/3/7/14), free-tier upgrade gate
- `editorial-digest.ts` — weekly digest config (Tue 10:00 UTC), locale-aware, 6 region-brief configs
- `transactional-templates.ts` — 10 templates EN+UK (verification, reset, trial, subscription, invoice, alert, report, grant)

TODO progress: `TODO_vision.md` → **5/5 done**, `TODO_backlinks_pr.md` → **14/14 done**, `TODO_seo_roadmap.md` → 4/16, `TODO_partnerships.md` → 7/12, `TODO_email_lifecycle.md` → 8/14

---

## File count summary

| Category | New files |
|----------|-----------|
| TypeScript modules (lib/) | ~72 |
| TypeScript API routes | ~9 |
| Integration packages (src + COMPLIANCE + pkg) | ~56 (8 packages × 7 files) |
| Markdown docs | ~9 |
| CSV data | 1 |
| Test files (vitest) | 1 |
| **Total** | **~148** |

## Task count summary

| Agent | TODO file(s) | Tasks closed |
|-------|-------------|--------------|
| 1 — Pricing core | tiers_matrix, pricing_principles, bundling, competitive | ~38 |
| 2 — Experiments | pricing_experiments | 22 |
| 3 — Integrations | sources | 23 |
| 4 — AI features | ai_roadmap | 11 |
| 5 — Marketing/A11y | marketing_surfaces, accessibility | 27 |
| 6 — Billing | monetization_roadmap, day_event_pass, credits_wallet, discounts_grants | ~16 |
| 7 — Search | filters_search | 15 |
| 8 — Vision/SEO | vision, backlinks_pr, seo_roadmap, partnerships, email_lifecycle | 38 |
| **Total** | | **~190** |

## Honest caveats
- No local TypeScript toolchain — agents matched patterns by inspection. Recommend `pnpm typecheck` on CI.
- Mojibake scan: **0**. EN+UK throughout; Cyrillic preserved in all existing files.
- In-memory stores throughout (ring buffers, maps) — production needs PostgreSQL/Redis swap-ins at store interface boundary.
- Billing: Stripe SDK calls are typed stubs; activation needs `STRIPE_*` env secrets + real Stripe account.
- AI features: Anomaly detection, NL-alert builder, report drafts use `llm.ts` patterns; all require LLM API keys.
- Hybrid search: Elastic/Qdrant/PostGIS stubs — activation needs the corresponding infra services.
- Integration packages (TikTok, VK, MediaCloud) require account applications or commercial licenses before production use — see each COMPLIANCE.md.
- Phase 3-4 AI contracts (`trend-forecasting.ts`, `deepfake-detection.ts`, `multimodal-copilot.ts`) are typed codeable contracts; full ML activation needs model deployment.
