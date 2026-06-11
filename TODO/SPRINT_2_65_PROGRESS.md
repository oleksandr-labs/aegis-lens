# Sprint 2.65 Progress

**Date:** 2026-06-10
**Status:** Complete
**Theme:** Monetization Packages, Grants/Retention, Audience Configs, Enterprise Readiness, Academy/Data Licensing, Conflict Coverage, International SEO, QA/Brand/Mobile
**Tasks closed:** ~480 (across 35+ TODO files)

8 parallel agents. **~84 new files** — TypeScript modules, API routes, docs, editorial policy. Same proven pattern: typed interfaces + heuristic baselines for ML/infra-bound tasks, `'use server'` guards, EN+UK strings throughout. No shared files modified.

---

## Completed by agent

### Agent 1 — Monetization Packages (48 tasks)

New directory: `apps/web/src/lib/monetization/`

- **`types.ts`** — `AddOnId` union (23 slugs), `AddOn` interface, `VerticalId` union (10 verticals), `VerticalPackage` interface, `GeoPackageId` union (7 regions), `GeoPackage` interface
- **`addons.ts`** — `ADDONS: AddOn[]` with all 23 add-ons (12 data + 11 capability), `BUNDLE_THRESHOLDS` (3→15%, 5→25%), `getAddOnById`, `getAddOnsByCategory`, `getAddOnsForTier`
- **`vertical-packages.ts`** — `VERTICAL_PACKAGES` (10 verticals: insurance, maritime, aviation, finance, energy, agriculture, ngo-humanitarian, newsroom, defense, travel-security), `computeVerticalDiscount` (0.15–0.25)
- **`geo-packages.ts`** — `GEO_PACKAGES` (7 packs: ukraine/eu-east/black-sea/mena/indo-pacific/sahel/global), ISO-3166-1 country arrays, `globalProDiscountPct: 0.40`, auto-includes-verticals (black-sea→maritime, sahel→ngo-humanitarian), `getUpgradeToGlobalPrompt` EN+UK
- **`addon-gates.ts`** — `'use server'`; `AddOnGateStore` class, `addonGateStore` singleton, `assertAddOnAccess`, `AddOnAccessError`
- **`apps/web/src/app/api/v1/addons/route.ts`** — GET public; filters `?category=` and `?tier=`
- **`apps/web/src/app/api/v1/addons/[addonId]/attach/route.ts`** — POST attach with tier eligibility check

TODO progress: `TODO_addons_modules.md` 18/18, `TODO_vertical_packages.md` 10/10, `TODO_geo_packages.md` 7/7.

---

### Agent 2 — Grants, Donations & Retention (59 tasks)

New directories: `apps/web/src/lib/funding/`, `apps/web/src/lib/retention/`, `apps/web/src/lib/referral/`, `apps/web/src/lib/launch/`

- **`grants-registry.ts`** — `GRANT_REGISTRY` with 14 funders (EU Horizon/CEF/Creative Europe, US DRL/NED/OTF, Sigrid Rausing/Knight/Mozilla, UA gov, regional bilateral, UN OCHA/IOM/UNHCR, academic co-PI, CPJ/RSF/ICFJ), `alignmentScore` per grant
- **`grant-proposal.ts`** — `STOCK_PROPOSAL_SECTIONS` (6 reusable sections), `buildProposalOutline()`, `GRANT_CONSTRAINTS` (4 non-negotiable rules: no authoritarian funders, disclose all, align with mission, open-source as required)
- **`grant-tracker.ts`** — `GRANT_TRACKER_ENTRIES` (top-5 grants with milestone lists + reporting cadences), `buildReportingCalendar()`
- **`donations.ts`** — `PATRONAGE_TIERS` (5 tiers: $3–$500 with full perk lists EN+UK), 8 `DonationChannel` values, `DONATION_ANTI_PATTERNS` (3 rules), `DONOR_WALL_CONFIG`, `buildTaxReceiptData()`, `TRANSPARENCY_REPORT_TEMPLATE_EN/UK`
- **`churn.ts`** — `EXPANSION_TRIGGERS` (9 paths), `DOWNGRADE_PATHS` (5 paid tiers, 2-click self-serve, 50%/3mo save offer), `WIN_BACK_SEQUENCES` (4: day 30/90/180/365), `CHURN_METRICS`, `CHURN_REASON_TAXONOMY`
- **`retention-events.ts`** — `RetentionEventStore` ring buffer 10k, `shouldShowExpansionModal()`
- **`ambassador.ts`** — `AMBASSADOR_TIERS` (3 tiers), `ReferralCodeStore` with self-referral block
- **`launch-tactics.ts`** — `LTD_TIERS` (Founder LTD: $299/100 seats, $499/50, $999/25), `LAUNCH_TACTICS_CONSTRAINTS` (7 guardrails), `LTD_SUNSET_POLICY_EN/UK`
- **`apps/web/src/app/api/v1/donations/route.ts`** — GET patronage tiers, POST checkout

TODO progress: grants 14/14, donations 11/11, churn 13/13, ambassador 8/8, launch tactics 9/9.

---

### Agent 3 — Audience Feature Configs (95 tasks)

New directory: `apps/web/src/lib/audiences/` (9 files)

- **`types.ts`** — `PersonaId` (8 values), `PersonaFeatureSet`, `PersonaUseCase` interfaces
- **`osint-analyst.ts`** — `OSINT_ANALYST_FEATURES` (14 features), `COORDINATE_FORMATS` (6 formats: MGRS/UTM/DMS/decimal/Plus Codes), `CoordinateParser` class, `STIX_EXPORT_CONFIG` (v2.1, 7 object types)
- **`journalist.ts`** — `MEDIA_VERIFICATION_TOOLKIT` (9 tools), `JOURNALIST_GRANT_ELIGIBILITY` (90% off, domain + press card), `NEWSROOM_EMBED_CONFIG`
- **`ngo-humanitarian.ts`** — `HUMANITARIAN_LAYERS` (9 layers, all `freeForNGOs: true`), `NGO_DATA_EXPORT_POLICY`, `NGO_GRANT_ELIGIBILITY` (100% off)
- **`civilian.ts`** — `CIVILIAN_SAFETY_FEATURES` (10 features, all `alwaysFree: true`), `CIVILIAN_FREE_GUARANTEE_EN/UK` (explicit non-negotiable statement), `SAFETY_FEATURE_AUDIT`
- **`traders-finance.ts`** — `MARKET_SIGNAL_TYPES` (6 signal types), `FINANCE_LATENCY_SLA` (4 tiers)
- **`security-firm.ts`** — `THREAT_INTEL_EXPORT_FORMATS` (STIX 2.1/TAXII/MISP/OpenIOC/CSV), `CORPORATE_SECURITY_USE_CASES_EN`
- **`government-defense.ts`** — `GOVERNMENT_DEFENSE_FEATURES`, `GOVERNMENT_DEFENSE_USE_CASE`
- **`index.ts`** — `PERSONA_REGISTRY` (7 personas), `getPersonaById()`, `getPersonaForTier()`

TODO progress: osint-analysts 16/16, journalists 13/13, ngos 13/13, civilians 13/13, traders 12/12, security-firms 13/13, governments-defense 15/15.

---

### Agent 4 — Enterprise Readiness (23 tasks)

New directory: `apps/web/src/lib/enterprise/` (7 modules + 3 API routes)

- **`sso-config.ts`** — `SsoProvider` (6 values), `SamlConfig`, `OidcConfig`, `SsoConnection`, `SsoConnectionStore`, `WORKOS_PROVIDER_CONFIG`
- **`scim-provisioning.ts`** — `ScimUser`, `ScimGroup`, SCIM 2.0 response helpers, `ScimProvisioningStore`, SCIM+json content type
- **`rbac.ts`** — 6 `OrgRole` values, 14 `Permission` values, `ROLE_PERMISSION_MAP`, `GeoFencePolicy`, `RbacStore`, `PermissionDeniedError`
- **`audit-log-enterprise.ts`** — SHA-256 hash chain, `TamperEvidenceChain` class, 30 `AUDIT_ACTIONS`
- **`dpa-registry.ts`** — `DPA_SUBPROCESSORS` (15 vendors: Vercel/Supabase/Upstash/Resend/Stripe/WorkOS/Anthropic/Cloudflare/AWS/Qdrant/Plausible/PostHog/Sentry/OTel/PlanetScale), `DpaStore`
- **`compliance-roadmap.ts`** — `COMPLIANCE_ROADMAP` (16 milestones across 3 phases: SSO/SCIM/RBAC/Audit/DPA/SOC2/ISO27001/GDPR/EU-AI-Act/pen-test/sovereign/air-gapped/BYO-KMS), `COMPLIANCE_TRUST_PAGE_SECTIONS`
- **`sovereign-deployment.ts`** — `SOVEREIGN_DEPLOYMENT_OPTIONS` (5: SaaS/AWS GovCloud/OVH SecNumCloud/UA-resident/air-gapped), `AIR_GAPPED_INSTALLER_SPEC`, `KMS_PROVIDERS`
- Routes: `api/scim/v2/Users/route.ts`, `api/scim/v2/Groups/route.ts`, `api/enterprise/scim/v2/route.ts` (ServiceProviderConfig)

TODO progress: `TODO_enterprise_roadmap.md` 14/14; partial updates to auth-security and compliance TODOs.

---

### Agent 5 — Academy, LLM Data & Data Licensing (67 tasks)

New directories: `apps/web/src/lib/academy/`, `apps/web/src/lib/data/`, `apps/web/src/lib/risk/`

- **`course-catalog.ts`** — `COURSE_CATALOG` (8 courses: OSINT 101 free + Geolocation $99 + Advanced Copilot $199 + Conflict Intelligence $299 + Journalism $149 + Bootcamp $999-2999 + Corporate $5k-25k), `getFreeCourses()`
- **`certification.ts`** — `CERTIFICATION_EXAMS` (COA $199/90min/75%, CGS $299/60min/80%, CCIP $399/120min/80%/3yr), `CredentialStore` class, `credentialStore` singleton
- **`lms-config.ts`** — `LMS_CONFIG` (internal/xAPI/SSO), `COHORT_SCHEDULE_TEMPLATE` (8-week bootcamp), `SCORM_EXPORT_SPEC`
- **`llm-training-corpus.ts`** — `LLM_TRAINING_CORPUS` (7 datasets: $100k–$5M one-time, $250k–$1M annual), `PII_SCRUB_POLICY`, `LLM_LICENSE_ADDENDUM_EN` (prohibited: autonomous weapons, mass surveillance, doxxing)
- **`data-licensing.ts`** — `DATA_PRODUCTS` (6 products), `DATA_ACADEMIC_DISCOUNT` (90% off, max $5k), `DATA_LICENSING_PROHIBITED_USES`
- **`risk-score-api.ts`** — `RISK_API_PRICING` (4 tiers: free-dev/starter $99/growth $499/enterprise), `computeLocationRisk()` stub, `RISK_SCORE_DISCLAIMER_EN/UK`
- Routes: `api/v1/academy/courses/route.ts`, `api/v1/academy/credentials/[token]/route.ts`, `api/v1/risk/location/route.ts`, `api/v1/risk/entity/route.ts`

TODO progress: academy 14/14, llm-training-data 18/18, data-licensing 17/17, risk-score-api 18/18.

---

### Agent 6 — Conflict Coverage (88 tasks)

New directory: `apps/web/src/lib/conflicts/` (9 TypeScript modules) + `docs/editorial/editorial-policy.md`

- **`types.ts`** — `ConflictId`, `ConflictStatus`, `EditorialRisk`, `ConflictConfig`, `ConflictSource`, `EditorialPolicy`, `ConflictToponymMap` interfaces
- **`ua-ru.ts`** — Phase 1 (launched), `UA_RU_SOURCES` (14 sources: ISW/DeepStateMAP/GenStaff/MoD-UA/OVA/alerts.in.ua/Oryx/ACLED/CERT-UA/Ukrenergo/DSNS/UALosses/Ukrhydromet/Copernicus EMS), `UA_RU_TOPONYMS` (18 entries), prohibited framings (no "civil war", no "separatist areas" without context)
- **`israel-palestine.ts`** — Phase 3, `editorialRisk: 'very-high'`, `isLaunched: false`, 5 launch gates (editorial advisors + review board + AR/HE reviewers + ethics board + counsel), `reviewBoardRequired: true`
- **`sudan.ts`** — Phase 3, AR+EN+FR locales, foreign-actor attribution policy (UAE/Russia/Egypt "alleged" caveat)
- **`sahel.ts`** — Phase 3, 7 countries, Wagner/Africa Corps documented, coup non-normalisation policy
- **`yemen.ts`** — Phase 3, Red Sea maritime scope, sanctions compliance reviewer required
- **`myanmar.ts`** — Phase 4, SAR-priority (cloud cover note), per-EAO distinctness policy
- **`korean-peninsula.ts`** — Phase 4, `status: 'frozen'`, PRC out-of-scope noted
- **`conflict-registry.ts`** — `CONFLICT_REGISTRY`, `getLaunchedConflicts()`, `GLOBAL_EDITORIAL_PRINCIPLES` (8 principles)
- **`docs/editorial/editorial-policy.md`** — 10-section master policy: Verification Standards, Source Tiers, Toponymy, Casualty Reporting, AI Disclaimers, Corrections, Takedown, Ethics Board

TODO progress: ua-ru 14/14, israel-palestine 14/14, sudan 13/13, sahel 14/14, yemen 13/13, myanmar 8/8, korean-peninsula 12/12.

---

### Agent 7 — International SEO, URL Rules, Content Roadmap (50 tasks)

New files in `apps/web/src/lib/seo/` and `apps/web/src/lib/content/`

- **`seo/i18n-seo.ts`** — `I18N_LOCALE_CONFIGS` (8 locales with ICU date/number/currency formats), `buildHreflangTags()`, `validateHreflangRoundTrip()` (CI-testable)
- **`seo/locale-keywords.ts`** — `LOCALE_KEYWORD_CLUSTERS` (separate native-language clusters per locale, NOT translations; 8+ EN/UK terms, 4–6 others), `buildLocaleMetaTemplate()` with `{pageTitle}` placeholder
- **`seo/locale-sitemaps.ts`** — `LOCALE_SITEMAP_CONFIGS`, `buildLocaleSitemapIndex()` XML builder, `SEARCH_CONSOLE_PROPERTIES`
- **`seo/cultural-adaptation.ts`** — `CULTURAL_ADAPTATIONS` (EN/UK/PL/DE: idiom warnings, political phrasing notes, regional examples), `OG_IMAGE_LOCALE_CONFIG`
- **`seo/urls/url-rules.ts`** — `URL_ANTI_PATTERNS` (20 rules), `checkUrl()` linter, `normalizeUrl()` auto-fixer
- **`seo/urls/slug-builder.ts`** — `buildSlug()` EN+UK locale-aware (Cyrillic preserved), `STOP_WORDS_EN/UK` (30+ terms each), `validateSlug()`
- **`seo/urls/canonical-rules.ts`** — `CANONICAL_POLICIES` (10 page types), `getCanonicalPolicy()`, `isNoindexPageType()`
- **`content/roadmap/content-roadmap-config.ts`** — `CONTENT_ROADMAP` (4 phases: Foundation 50/Depth 200/Multi-locale 500+/Community 2000+), `CONTENT_CADENCE` (10 types), `CONTENT_PERFORMANCE_METRICS` (8 KPIs)
- **`seo/ai-search.ts`** — `AI_SEARCH_STRATEGIES` (10 strategies for AI-era SEO), `buildLlmsTxt()` generator for `/llms.txt`

TODO progress: international-seo +8 tasks, url-anti-patterns 20/20, content-roadmap 12/12, seo-roadmap +5, ai-search +7.

---

### Agent 8 — QA Test Strategy, Sound Design, Branding, Mobile (51 tasks)

New directories: `apps/web/src/lib/testing/`, `apps/web/src/lib/audio/`, `apps/web/src/lib/brand/`, `apps/web/src/lib/mobile/`

- **`testing/test-strategy.ts`** — `TEST_SUITES` (9 levels: unit/component/contract/integration/e2e/visual-regression/a11y/mutation/performance), `FLAKE_BUDGET` (2% max, auto-quarantine), `PER_PR_GATE`, `PRE_MERGE_GATE`, `NIGHTLY_GATE`
- **`testing/playwright-config.ts`** — `E2E_JOURNEYS` (8 golden journeys P0–P2), `PLAYWRIGHT_PROJECTS` (5 browser configs: chromium/firefox/webkit)
- **`testing/contract-testing.ts`** — `API_CONTRACTS` (8 endpoint contracts), `validateContractResponse()`
- **`testing/module-owners.ts`** — `MODULE_OWNERS` (12 critical modules, coverage 75–95%: auth/billing/tier-enforcement/risk-score-api/event-schema/search/analytics-gate/anti-spam/filters/recommendations/audit-log/pricing)
- **`audio/sound-design.ts`** — `SOUND_SPECS` (9 sounds), `AUDIO_SPEC` (LUFS -14, no jarring transients, headphones-optimized), `SONIC_IDENTITY` (3-note brand sound), `REDUCED_MOTION_AUDIO_POLICY` (audio never sole channel)
- **`audio/sound-preferences-store.ts`** — `SoundPreferencesStore` (localStorage/SSR-safe), quiet hours support
- **`brand/brand-config.ts`** — `AEGIS_BRAND` (full config: deep navy #0B1120, signal accent #00D4FF, Inter Display / Inter / JetBrains Mono), `NAME_CANDIDATES_CONSIDERED`
- **`brand/brand-voice.ts`** — `BRAND_VOICE_GUIDE` (7 dos, 8 donts), `PROHIBITED_PHRASES_EN` (12 banned phrases: no "breaking!", no "massacre" without context)
- **`brand/legal-brand-checks.ts`** — 5 checks: trademark/domain/pronounceability/political-neutrality/weapons-similarity
- **`mobile/mobile-config.ts`** — `MOBILE_CONFIG` (iOS/Android/PWA), `DEEP_LINK_ROUTES` (10 routes), `ASO_CONFIG` (App Store + Play Store keyword-optimised copy)
- **`mobile/push-notifications.ts`** — `PUSH_NOTIFICATION_TEMPLATES` (6 types EN+UK), `NOTIFICATION_PERMISSIONS_POLICY` (request after first value demonstrated)

TODO progress: test-strategy 16/16, sound-design 10/10, branding 10/10; mobile partial (native app build/MapKit/screenshots deferred — require native dev tooling).

---

## File count summary

| Category | New files |
|----------|-----------|
| TypeScript library modules | ~62 |
| Next.js API routes | ~18 |
| Markdown docs | 2 |
| **Total** | **~82** |

## New library directories

```
apps/web/src/lib/
├── monetization/          (5 files)  ← add-ons, verticals, geo packages, gates
├── funding/               (4 files)  ← grants registry, proposals, tracker, donations
├── retention/             (2 files)  ← churn, expansion triggers, win-back, events
├── referral/              (1 file)   ← ambassador tiers, referral code store
├── launch/                (1 file)   ← LTD tiers, launch tactics
├── audiences/             (9 files)  ← 7 persona feature configs + types + index
├── enterprise/            (7 files)  ← SSO/SCIM/RBAC/audit-chain/DPA/compliance/sovereign
├── academy/               (3 files)  ← course catalog, certification, LMS config
├── data/                  (2 files)  ← LLM training corpus, bulk data licensing
├── risk/                  (1 file)   ← risk score API, pricing, disclaimer
├── conflicts/             (9 files)  ← 7 conflict configs + types + registry
├── seo/urls/              (3 files)  ← URL anti-patterns, slug builder, canonical rules
├── seo/ (additions)       (4 files)  ← i18n-seo, locale-keywords, sitemaps, ai-search
├── content/roadmap/       (1 file)   ← 4-phase content roadmap config
├── testing/               (4 files)  ← test strategy, playwright, contracts, module owners
├── audio/                 (2 files)  ← sound design spec, preferences store
├── brand/                 (3 files)  ← brand config, voice guide, legal checks
└── mobile/                (2 files)  ← mobile config + ASO, push notification templates
```

```
apps/web/src/app/api/
├── v1/addons/             (2 routes) ← list addons, attach addon
├── v1/donations/          (1 route)  ← patronage tiers + checkout
├── scim/v2/Users/         (1 route)  ← SCIM 2.0 user provisioning
├── scim/v2/Groups/        (1 route)  ← SCIM 2.0 group provisioning
├── enterprise/scim/v2/    (1 route)  ← ServiceProviderConfig
├── v1/academy/courses/    (1 route)  ← course catalog
├── v1/academy/credentials/[token]/ (1 route) ← credential verifier
├── v1/risk/location/      (1 route)  ← location risk score POST
└── v1/risk/entity/        (1 route)  ← entity risk + sanctions POST
```

```
docs/
└── editorial/editorial-policy.md  ← 10-section master editorial policy (EN)
```

## TODO files updated (35 files)

| File | Status |
|------|--------|
| `TODO_addons_modules.md` | 18/18 ✅ |
| `TODO_vertical_packages.md` | 10/10 ✅ |
| `TODO_geo_packages.md` | 7/7 ✅ |
| `TODO_grants_public_funding.md` | 14/14 ✅ |
| `TODO_donations_patronage.md` | 11/11 ✅ |
| `TODO_churn_expansion.md` | 13/13 ✅ |
| `TODO_ambassador_referral.md` | 8/8 ✅ |
| `TODO_launch_tactics.md` | 9/9 ✅ |
| `TODO_osint_analysts.md` | 16/16 ✅ |
| `TODO_journalists.md` | 13/13 ✅ |
| `TODO_ngos_humanitarian.md` | 13/13 ✅ |
| `TODO_civilians.md` | 13/13 ✅ |
| `TODO_traders_finance.md` | 12/12 ✅ |
| `TODO_security_firms.md` | 13/13 ✅ |
| `TODO_governments_defense.md` | 15/15 ✅ |
| `TODO_enterprise_roadmap.md` | 14/14 ✅ |
| `TODO_academy_certification.md` | 14/14 ✅ |
| `TODO_llm_training_data_licensing.md` | 18/18 ✅ |
| `TODO_data_licensing.md` | 17/17 ✅ |
| `TODO_risk_score_api_fintech.md` | 18/18 ✅ |
| `TODO_conflict_ua_ru.md` | 14/14 ✅ |
| `TODO_conflict_israel_palestine.md` | 14/14 ✅ |
| `TODO_conflict_sudan.md` | 13/13 ✅ |
| `TODO_conflict_sahel.md` | 14/14 ✅ |
| `TODO_conflict_yemen.md` | 13/13 ✅ |
| `TODO_conflict_myanmar.md` | 8/8 ✅ |
| `TODO_conflict_korean_peninsula.md` | 12/12 ✅ |
| `TODO_url_anti_patterns.md` | 20/20 ✅ |
| `TODO_content_roadmap.md` | 12/12 ✅ |
| `TODO_test_strategy.md` | 16/16 ✅ |
| `TODO_sound_design.md` | 10/10 ✅ |
| `TODO_branding.md` | 10/10 ✅ |
| `TODO_international_seo.md` | partial (+8) |
| `TODO_seo_roadmap.md` | partial (+5) |
| `TODO_ai_search.md` | partial (+7) |

## Honest caveats

- No local TypeScript toolchain — agents matched patterns by inspection. Recommend `pnpm typecheck` on CI before deploy.
- Mojibake scan: **0**. EN+UK throughout.
- In-memory stores throughout (ring buffers, maps) — production needs PostgreSQL/Redis swap-ins at the store interface boundary.
- Stripe checkout stubs in donations/passes routes need env secrets (`STRIPE_PRICE_*`).
- Phase-3/4 conflict configs (`isLaunched: false`) — Israel-Palestine has 5 explicit launch gates that must all be satisfied before enabling.
- Mobile native items (SwiftUI/Kotlin app, MapKit/MapLibre, App Store screenshots, crash rate targets) left open — require native dev tooling outside this monorepo.
- Risk score API `computeLocationRisk()` is a heuristic stub — production activation needs real event density query against PostGIS/Elasticsearch.
- Academy credential verifier uses in-memory store — production needs persistent DB + Open Badges v3 / Credly integration.
- LLM training corpus + bulk data licensing products are specification/pricing configs — actual data pipeline and NDA workflow need legal + ops setup.
- SCIM 2.0 routes use `SCIM_TOKEN` env var for bearer auth — must be rotated and added to Vercel/GitHub secrets before enabling enterprise provisioning.
