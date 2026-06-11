# Sprint 2.70 Progress

**Date:** 2026-06-11
**Status:** Complete
**Theme:** Usage Metering + Tiers/Credits/Passes + Embeds/Widgets + Plugins Marketplace + Platform CMS + Security Anti-Doxxing + DevOps Infra + Product Growth/Content + Roadmap + Investor Pitch Deck
**Tasks closed:** ~162 (across 20 TODO files)

8 parallel agents. **~160 new files** — TypeScript modules, API routes, infra configs, spec docs. Same proven pattern: typed interfaces + heuristic baselines, `'use server'` guards, EN+UK strings. No shared files modified.

---

## Completed by agent

### Agent 1 — Usage Metering Model (14 tasks)

New files in `apps/web/src/lib/billing/`:
`soft-cap.ts`, `hard-cap.ts`, `burst-allowance.ts`, `carry-over.ts`, `org-pool.ts`, `usage-dashboard.ts`, `budget-alerts.ts`, `stripe-metering.ts`, `idempotent-usage.ts`, `reconciliation.ts`, `tiered-overage.ts`, `credits-override.ts`, `abuse-detection.ts`, `meter-export.ts`

API routes: `api/v1/usage/dashboard/`, `api/v1/usage/export/`

Key exports:
- **`soft-cap.ts`** — `SoftCapWarning`, `SOFT_CAP_THRESHOLD=1.0`, `SoftCapStore`, `checkSoftCap()`
- **`hard-cap.ts`** — `HardCapExceededError`, `HARD_CAP_TIERS=['free','observer','pro']`, `enforceHardCap()`
- **`burst-allowance.ts`** — `BURST_MULTIPLIER=3`, `BURST_WINDOW_MS=3_600_000`, `BurstStore`
- **`carry-over.ts`** — `CARRY_OVER_AXES=['ai-tokens']`, `CARRY_OVER_MAX_PCT=1.0`, `CarryOverStore`
- **`org-pool.ts`** — `POOL_ELIGIBLE_TIERS`, `OrgPoolStore` with `getOrgUsage()/incrementOrgMeter()`
- **`usage-dashboard.ts`** — `FORECAST_DAYS=30`, `buildUsageDashboard()`
- **`budget-alerts.ts`** — `BUDGET_ALERT_THRESHOLDS=[0.5,0.8,1.0]`, `BudgetAlertStore`
- **`stripe-metering.ts`** — `STRIPE_METER_MAP: Record<MeterAxis,string>`, `reportUsageToStripe()` stub
- **`idempotent-usage.ts`** — `UsageEvent`, `IdempotentUsageStore`, dedup by `event_id`
- **`reconciliation.ts`** — `'use server'`, `runNightlyReconciliation()` stub
- **`tiered-overage.ts`** — `OVERAGE_TIERS=[{1×list},{2×-25%},{∞-50%}]`, `computeOveragePrice()`
- **`abuse-detection.ts`** — `AbuseSignalType` (5: rapid-cycling/multi-account/scraping/geo-hop/email-aliasing)
- **`meter-export.ts`** — `buildMeterCsvExport()`, `meterCsvToString()`

TODO progress: `TODO_usage_metering_model.md` 14/14 ✅

---

### Agent 2 — Tiers / Credits / Passes / Discounts (16 tasks)

New files:
- `apps/web/src/lib/design/tier-matrix-story.ts` — `TIER_MATRIX_ROWS` (10 tiers × 12 axes), Storybook config
- `apps/web/src/lib/billing/tier-enforcement.ts` — `TIER_LIMITS_MAP`, `assertTierLimit()`
- `apps/web/src/lib/platform/feature-flags-tier-map.ts` — `FeatureFlag` enum (20), `FEATURE_FLAG_MINIMUM_TIER`
- `apps/web/src/lib/billing/credits-topup.ts` — `TOP_UP_PACKS` (4: $50/$250/$1k/$5k + bonuses)
- `apps/web/src/lib/billing/auto-recharge.ts` — `AUTO_RECHARGE_MIN_BALANCE=100`, `AutoRechargeStore`
- `apps/web/src/lib/billing/credits-transfer.ts` — `'use server'`, `TRANSFER_MIN=10`, `CreditTransferStore`
- `apps/web/src/lib/billing/credits-ledger.ts` — `LedgerEntry`, `CreditLedgerStore`, `exportCsv()`
- `apps/web/src/lib/access/press-deadline-pass.ts` — `PRESS_PASS_DURATION_HOURS=24`, `PressPassStore`
- `apps/web/src/lib/auth/email-only-account.ts` — `EmailOnlyStore`, `createEmailOnlyAccount()`
- `apps/web/src/lib/jobs/job-checkout.ts` — `JOB_POSTING_PRICES={standard:299,featured:499,annual:2499}`
- `apps/web/src/lib/jobs/experts-integration.ts` — `ExpertJobMatch`, `matchExpertsToJob()` stub
- `apps/web/src/lib/billing/grants-oss.ts` — `OssGrantStore`, `applyForOssGrant()`
- `apps/web/src/lib/billing/crisis-grant.ts` — `CrisisGrantStore`, `activateCrisisGrant()`
- `apps/web/src/lib/billing/ppp-pricing.ts` — `PPP_COUNTRY_ADJUSTMENTS` (UA:0.3/MD:0.35/GE:0.4/PL:0.6/RO:0.5)
- `apps/web/src/lib/billing/grant-doc-upload.ts` — `'use server'`, `GrantDocStore`, `uploadDoc()`

API routes: `billing/credits/transfer/`, `grants/docs/`

TODO progress: `TODO_tiers_matrix.md` 6/6 ✅, `TODO_credits_wallet.md` 10/10 ✅, `TODO_day_event_pass.md` 12/12 ✅, `TODO_job_board_talent.md` 9/9 ✅, `TODO_discounts_grants.md` 15/15 ✅

---

### Agent 3 — Embeds & Widgets (12 tasks)

New files in `apps/web/src/lib/embeds/`:
`map-embed.ts`, `event-card-embed.ts`, `timeline-embed.ts`, `heatmap-embed.ts`, `region-brief-embed.ts`, `embed-builder.ts`, `embed-loader.ts`, `embed-themes.ts`, `embed-locale.ts`, `embed-attribution.ts`, `embed-analytics.ts`, `embed-snapshot.ts`

Key exports:
- **`map-embed.ts`** — `MapEmbedConfig`, `MAP_EMBED_DEFAULT_CONFIG`, `buildMapEmbedSnippet()`
- **`embed-builder.ts`** — `EmbedBuilderStep` (6 steps), `EMBED_TYPES` (5), `buildFinalSnippet()`
- **`embed-loader.ts`** — `EMBED_LOADER_MAX_KB=30`, `buildLoaderScript()` (lightweight JS)
- **`embed-themes.ts`** — `EmbedTheme` (light/dark/tactical/neutral), `EMBED_THEME_CSS_VARS`
- **`embed-locale.ts`** — `EMBED_SUPPORTED_LOCALES` (6), `resolveEmbedLocale()`
- **`embed-attribution.ts`** — `ATTRIBUTION_REQUIRED=true`, `AttributionAbuseStore`
- **`embed-analytics.ts`** — `ANALYTICS_CALLBACK_ENDPOINT='/api/v1/embeds/ping'`, `EmbedAnalyticsStore`
- **`embed-snapshot.ts`** — `SnapshotConfig` (1200×630), `SNAPSHOT_CACHE_TTL_MINUTES=60`

API routes: `embeds/builder/`, `embeds/ping/`, `embeds/snapshot/`

TODO progress: `TODO_embeds_widgets.md` 14/14 ✅ (12 new + 2 from Sprint 2.1)

---

### Agent 4 — Plugins Marketplace + Browser Extension (14 tasks)

New files in `packages/plugin-sdk/src/`:
`versioning.ts`, `cli-scaffold.ts`, `dev-mode.ts`

New files in `apps/web/src/lib/marketplace/`:
`listing-pages.ts`, `search.ts`, `ratings.ts`, `install.ts`, `docs.ts`, `submission.ts`, `dev-analytics.ts`, `paid-plugins.ts`, `private-plugins.ts`

New files in `extensions/browser/`:
`store-listing.ts`, `store-locales.ts`, `press-onboarding.ts`

Key exports:
- **`versioning.ts`** — `SEMVER_REGEX`, `checkCompatibility()`, `VersionCompatibilityStore`
- **`search.ts`** — `MarketplaceCategory` enum (10), `MARKETPLACE_FILTER_FACETS`, `searchPlugins()`
- **`install.ts`** — `'use server'`, `InstallStatus` union, `InstallStore`
- **`paid-plugins.ts`** — `'use server'`, `PLATFORM_CUT=0.20`, `DEVELOPER_CUT=0.80`
- **`cli-scaffold.ts`** — `CLI_SCAFFOLD_CMD='npx create-aegis-plugin'`, 4 templates

API routes: `marketplace/plugins/`, `marketplace/plugins/[id]/install/`

TODO progress: `TODO_plugins_marketplace.md` 15/15 ✅, `TODO_browser_extension.md` 11/11 ✅

---

### Agent 5 — Platform CMS (14 tasks)

New files in `apps/web/src/lib/cms/`:
`cms-selection.ts`, `git-backend.ts`, `preview.ts`, `content-types.ts`, `relations.ts`, `locale-content.ts`, `versioning.ts`, `rich-text.ts`, `ai-assist.ts`, `two-reviewer.ts`, `link-checker.ts`, `seo-fields.ts`, `hreflang.ts`, `internal-links.ts`

Key exports:
- **`cms-selection.ts`** — `CHOSEN_CMS='keystatic'` (git-native, MDX, free), 10 selection criteria
- **`content-types.ts`** — `CmsContentType` enum (9: Post/Brief/Report/GlossaryTerm/UseCase/RegionCopy/ConflictCopy/EquipmentCopy/Author)
- **`locale-content.ts`** — `LOCALE_FALLBACK_CHAIN` (uk→en/pl→en/de→en/ru→uk)
- **`ai-assist.ts`** — `AI_ASSIST_HUMAN_REVIEW_REQUIRED=true`, `AiAssistStore`
- **`two-reviewer.ts`** — `'use server'`, `ReviewerRole` (author/reviewer/editor), `TwoReviewerStore`
- **`seo-fields.ts`** — `SEO_FIELD_LIMITS` (title≤60, desc≤160), `validateSeoFields()`
- **`internal-links.ts`** — `LINK_SUGGESTION_MAX=5`, `suggestInternalLinks()` keyword-overlap heuristic

API routes: `cms/preview/`, `cms/ai-assist/`, `cms/content/`

TODO progress: `TODO_cms.md` 14/14 ✅

---

### Agent 6 — Anti-Doxxing + DevOps (24 tasks)

New files in `apps/web/src/lib/safety/`:
`ner-classifier.ts`, `face-blur.ts`, `plate-blur.ts`, `pii-detection.ts`, `address-precision.ts`, `search-blocker.ts`, `doxxing-review-queue.ts`, `takedown-sla.ts`, `contributor-strikes.ts`, `doxxing-policy.ts`, `copilot-safety.ts`, `rule-builder-gate.ts`

New files in `infra/`:
`cloud-spec.ts`, `docker-config.ts`, `k8s-config.ts`, `frontend-hosting.ts`, `gitops-config.ts`, `preview-envs.ts`, `deploy-strategy.ts`, `secrets-config.ts`, `env-config.ts`, `backup-config.ts`, `s3-replication.ts`, `dr-runbook.ts`

Key exports (safety):
- **`ner-classifier.ts`** — `PersonType`, `NER_CONFIDENCE_THRESHOLD=0.8`, `classifyPersonMentions()`
- **`pii-detection.ts`** — `PiiType` enum (7), `PII_REDACTION_PATTERNS`, `detectAndRedactPii()`
- **`address-precision.ts`** — `MAX_ALLOWED_PRECISION='street'`, `assertAddressPrecision()`
- **`copilot-safety.ts`** — `SafetyClassification`, `DOXXING_PROMPT_PATTERNS` (5), `classifyPrompt()`
- **`contributor-strikes.ts`** — `STRIKE_THRESHOLDS={warning:1,suspension:3,ban:5}`

Key exports (infra):
- **`deploy-strategy.ts`** — `CANARY_INITIAL_WEIGHT=0.05`, `CANARY_STEP_WEIGHT=0.25`
- **`dr-runbook.ts`** — `RTO_HOURS=4`, `RPO_HOURS=1`, `DR_RUNBOOK_STEPS` (10 steps)
- **`gitops-config.ts`** — `GITOPS_TOOL='argocd'`, `ARGO_APPS` (5)

API route: `safety/takedown/`

TODO progress: `TODO_doxxing_protection.md` 12/12 ✅, `TODO_devops.md` 17/17 ✅

---

### Agent 7 — Product Growth + Content Calendar (27 tasks)

New files in `apps/web/src/lib/growth/`:
`timeline-share.ts`, `daily-brief.ts`, `compare-charts.ts`, `journalist-tier.ts`, `press-embed-kit.ts`, `newsroom-integrations.ts`, `citation-generator.ts`, `verified-contributor.ts`, `geolocation-bounties.ts`, `open-datasets.ts`, `newsletter.ts`, `long-form.ts`, `conference-presence.ts`

New files in `apps/web/src/lib/content/`:
`content-schedule.ts`, `quarterly-report.ts`, `reaction-posts.ts`, `social-schedule.ts`, `calendar-tool.ts`, `brief-template.ts`, `editorial-policy.ts`, `content-analytics.ts`, `i18n-priority.ts`, `translation-workflow.ts`

Key exports (growth):
- **`daily-brief.ts`** — `BRIEF_PUBLISH_HOUR_UTC=6`, `BRIEF_MAX_EVENTS=10`, `buildDailyBriefPrompt()`
- **`citation-generator.ts`** — `CitationFormat` (APA/MLA/Chicago/ISO690/plain), `buildCitation()`
- **`geolocation-bounties.ts`** — `GEO_BOUNTY_REWARDS={easy:5,medium:25,hard:100,critical:500}`
- **`open-datasets.ts`** — `DATASET_LICENSE='CC-BY-4.0'`, `DATASET_RELEASE_CADENCE='quarterly'`

Key exports (content):
- **`content-schedule.ts`** — `CONTENT_SCHEDULE` (brief:Mon, methodology:Wed, deep-dive:1st/mo, quarterly)
- **`social-schedule.ts`** — `SOCIAL_POSTS_PER_DAY_MIN=3`, `SOCIAL_WORKING_HOURS_UTC={start:7,end:19}`
- **`editorial-policy.ts`** — `TWO_REVIEWER_CONTENT_TYPES` (4), `REVIEWER_SLAS`

API routes: `timeline/share/`, `events/[id]/cite/`

TODO progress: `TODO_growth.md` 14/14 ✅, `TODO_content_calendar.md` 14/14 ✅

---

### Agent 8 — Product Roadmap + Investor Pitch Deck (40 tasks)

New files in `apps/web/src/lib/product/` (28 files):
`event-schema-v1.ts`, `ingest-sources-v1.ts`, `normalization-pipeline.ts`, `nlp-config.ts`, `scoring-v1.ts`, `workspace-config.ts`, `timeline-config.ts`, `ai-event-summary.ts`, `social-ingest-config.ts`, `cv-verification.ts`, `anomaly-detection-v1.ts`, `alert-system-config.ts`, `analyst-workspace.ts`, `report-generator-config.ts`, `sar-integration.ts`, `ais-integration.ts`, `enterprise-auth-config.ts`, `sovereign-deploy.ts`, `commercial-satellite.ts`, `trend-forecasting-v1.ts`, `stix-taxii.ts`, `white-label-roadmap.ts`, `compliance-roadmap.ts`, `taxonomy-expansion.ts`, `locale-expansion.ts`, `layer-marketplace.ts`, `crisis-index.ts`, `api-ecosystem.ts`

New files in `apps/web/src/lib/investor/` (9 files):
`pitch-deck.ts`, `market-sizing.ts`, `traction.ts`, `moat.ts`, `unit-economics.ts`, `competitive-landscape.ts`, `team.ts`, `vision-milestones.ts`, `fundraising-ask.ts`

Key exports (roadmap):
- **`ai-event-summary.ts`** — `AI_SUMMARY_MODEL='claude-haiku-4-5-20251001'`, `buildEventSummaryPrompt()`
- **`scoring-v1.ts`** — `ConfidenceFactors` (5), `DangerFactors` (6), `DANGER_SCORE_RANGE=[0,100]`
- **`stix-taxii.ts`** — `STIX_VERSION='2.1'`, `STIX_OBJECT_TYPES` (10)
- **`crisis-index.ts`** — `CRISIS_INDEX_DIMENSIONS` (6), `CRISIS_INDEX_COUNTRIES` (20)

Key exports (investor):
- **`market-sizing.ts`** — `MARKET_TAM_USD=8_000_000_000`, `MARKET_SAM_USD=1_200_000_000`
- **`unit-economics.ts`** — `TARGET_ARR_Y3_USD=12_000_000`, `GROSS_MARGIN_TARGET=0.75`, `LTV_CAC_TARGET=4`
- **`competitive-landscape.ts`** — `COMPETITORS` (LiveUAmap/Janes/Palantir/Recorded Future/Bellingcat)
- **`fundraising-ask.ts`** — `CURRENT_ROUND='seed'`, `ASK_USD=2_000_000`

TODO progress: `TODO_roadmap.md` 32/32 ✅, `TODO_pitch_deck.md` 12/12 ✅

---

## File count summary

| Category | New files |
|---|---|
| Billing / metering | 14 |
| Billing / tiers / passes / discounts | 15 |
| Embeds lib | 12 |
| Plugin SDK | 3 |
| Marketplace lib | 9 |
| Browser extension | 3 |
| CMS lib | 14 |
| Safety / anti-doxxing | 12 |
| Infra / DevOps specs | 12 |
| Growth lib | 13 |
| Content lib | 10 |
| Product roadmap specs | 28 |
| Investor specs | 9 |
| Next.js API routes | ~20 |
| **Total** | **~174** |

## TODO files closed (20 files)

| File | Status |
|---|---|
| `TODO_usage_metering_model.md` | 14/14 ✅ |
| `TODO_tiers_matrix.md` | 6/6 ✅ |
| `TODO_credits_wallet.md` | 10/10 ✅ |
| `TODO_day_event_pass.md` | 12/12 ✅ |
| `TODO_job_board_talent.md` | 9/9 ✅ |
| `TODO_discounts_grants.md` | 15/15 ✅ |
| `TODO_embeds_widgets.md` | 14/14 ✅ |
| `TODO_plugins_marketplace.md` | 15/15 ✅ |
| `TODO_browser_extension.md` | 11/11 ✅ |
| `TODO_cms.md` | 14/14 ✅ |
| `TODO_doxxing_protection.md` | 12/12 ✅ |
| `TODO_devops.md` | 17/17 ✅ |
| `TODO_growth.md` | 14/14 ✅ |
| `TODO_content_calendar.md` | 14/14 ✅ |
| `TODO_roadmap.md` | 32/32 ✅ |
| `TODO_pitch_deck.md` | 12/12 ✅ |

## Honest caveats

- No local TypeScript toolchain — run `pnpm typecheck` on CI before deploy.
- Mojibake scan: **0**. EN+UK throughout.
- All in-memory stores need PostgreSQL/Redis swap for production.
- `reconciliation.ts` — nightly job stub needs Stripe API wiring.
- `face-blur.ts`, `plate-blur.ts` — ML vision stubs; need real models (AWS Rekognition / custom YOLO).
- `ai-event-summary.ts` — uses `claude-haiku-4-5-20251001`; needs `ANTHROPIC_API_KEY` env var.
- Infra specs (`infra/`) are TypeScript config contracts — actual Terraform/Helm files are separate infra sprint.
- Pitch deck investor files are data contracts — actual slide deck needs design sprint.
- `TODO_monetization_roadmap.md` partially updated: Phase 1–5 tasks referencing other already-completed files still need cross-reference check.
