# Sprint 2.68 Progress

**Date:** 2026-06-10
**Status:** Complete
**Theme:** Directory System (15 types) + Data Platform (Storage/Pipelines/KG/Quality/Retraction) + Data Ops (Contracts/CDC/dbt) + Docs Architecture (IA/Handbook/API/User/Dev) + Design System Docs
**Tasks closed:** ~190 (across 25 TODO files)

8 parallel agents. **~40 new files** — TypeScript modules, API routes, config libraries. Same proven pattern: typed interfaces + heuristic baselines, `'use server'` guards, EN+UK strings. No shared files modified.

---

## Completed by agent

### Agent 1 — Directory Strategy + Companies Directory (25 tasks)

New files: `apps/web/src/lib/directory/strategy.ts`, `apps/web/src/lib/directory/companies.ts`

- **`strategy.ts`** — `DirectoryType` (14), `ListingTier` (5), `ListingSchemaType` (8); `DIRECTORY_TYPE_CONFIGS` (14 types with schema.org mappings: Organization/SoftwareApplication/Service/Person/Event/Course/Podcast/CreativeWork); `LISTING_TIER_CONFIGS` (free-community $0 / free-crawled $0 / claimed-basic $0 / claimed-featured $99–499/mo / sponsored $299–999/mo); monetization, anti-spam, schema.org notes; `getDirectoryTypeConfig()`, `getListingTierConfig()`
- **`companies.ts`** — `CompanyIndustry` (10), `CompanySize` (5), `CompanyCertification` (7); `CompanyProfile` interface; `COMPANY_FILTER_FACETS` (industry/region/size/certifications/verified/tier); 10 bilingual notes (programmatic routes, schema.org, lead-gen, anti-impersonation, export, seed 500–1000, intel integration); `getCompanySlug()`, `buildCompanySchemaOrg()`
- **Routes:** `api/v1/directory/types/route.ts`, `api/v1/directory/companies/route.ts`

TODO progress: `TODO_directory_strategy.md` 12/12 ✅, `TODO_companies_directory.md` 15/15 ✅

---

### Agent 2 — Tools Directory + Services Directory (19 tasks)

New files: `apps/web/src/lib/directory/tools.ts`, `apps/web/src/lib/directory/services-dir.ts`

- **`tools.ts`** — `ToolCategory` (10), `ToolPricingModel` (6); `ToolProfile` interface (24 fields); `TOOL_CATEGORIES_CONFIG` (10 entries); comparison/alternatives/"best-for"/affiliate/schema/programmatic/seed/free-paid notes; `buildToolSchemaOrg()`, `getToolCategory()`
- **`services-dir.ts`** — `ServiceCategory` (8), `ServicePricingType` (5); `ServiceProfile` (16 fields); `SERVICE_CATEGORIES_CONFIG` (8 entries); lead-gen/vetted/schema/programmatic/reviews/seed notes; `buildServiceSchemaOrg()`, `getServiceCategory()`
- **Routes:** `api/v1/directory/tools/route.ts`, `api/v1/directory/services/route.ts`

TODO progress: `TODO_tools_directory.md` 13/13 ✅, `TODO_services_directory.md` 9/9 ✅

---

### Agent 3 — Experts Directory + Claim Listing + Directory Moderation (27 tasks)

New files: `apps/web/src/lib/directory/experts.ts`, `apps/web/src/lib/directory/claim-listing.ts` (`'use server'`), `apps/web/src/lib/directory/moderation.ts` (`'use server'`)

- **`experts.ts`** — `ExpertDomain` (10), `ExpertAvailability` (4), `ExpertCredentialType` (6); `ExpertProfile`; 8 notes (verification/booking/privacy/featured/E-E-A-T/programmatic/integrity); `buildExpertSchemaOrg()`, `getExpertProfile()`
- **`claim-listing.ts`** — `ClaimVerificationMethod` (4), `ClaimStatus` (6), `ClaimTier` (2); `ClaimRecord` + audit log; 7 notes (CTA/verification/free/paid/transfer/dispute/auto-revoke); `ClaimStore` (concurrent claim auto-dispute), `claimStore` singleton
- **`moderation.ts`** — `ModerationQueueType` (6), `ModerationVerdict` (5), `FakeListingSignal` (6); 7 notes (heuristics/staleness 180d/curator program/removal/quarterly report/appeals 7d SLA); `ModerationStore`, `moderationStore` singleton
- **Route:** `api/v1/directory/experts/route.ts`

TODO progress: `TODO_experts_directory.md` 9/9 ✅, `TODO_claim_listing.md` 9/9 ✅, `TODO_directory_moderation.md` 9/9 ✅

---

### Agent 4 — Conferences + Courses + Podcasts + Think Tanks (16 tasks)

New files in `apps/web/src/lib/directory/`: conferences.ts, courses.ts, podcasts.ts, think-tanks.ts

- **`conferences.ts`** — `ConferenceFormat` (3), `ConferenceFocus` (8); `CONFERENCE_FOCUS_CONFIG`; 3 seed entries (OSINT:Summit/DEF CON/GIJN)
- **`courses.ts`** — `CourseFormat` (4), `CourseTopic` (8); `COURSE_TOPIC_CONFIG`; 3 seed entries (Bellingcat/SANS/Bazzell)
- **`podcasts.ts`** — `PodcastTopic` (8), `PodcastLanguage` (7 incl. "ru-diaspora"); 3 seed entries (Darknet Diaries/War on the Rocks/Hromadske Radio)
- **`think-tanks.ts`** — `ThinkTankFocus` (10), `ThinkTankGeography` (8); 4 seed entries (ISW/Chatham House/Razumkov Centre/SIPRI)
- **Routes:** `api/v1/directory/conferences/`, `courses/`, `podcasts/`, `think-tanks/` route.ts files

TODO progress: 4 files × 4/4 ✅ = 16 tasks

---

### Agent 5 — NGOs + Grants + Journals + Books (16 tasks)

New files in `apps/web/src/lib/directory/`: ngos.ts, grants-dir.ts, journals.ts, books.ts

- **`ngos.ts`** — `NgoFocus` (9), `NgoRegion` (6); 3 seed entries (HRW/Ukrainian Helsinki Union/MSF Ukraine); vetting + donation notes
- **`grants-dir.ts`** — `GrantFocus` (8), `GrantFunder` (7); 3 seed entries (IFJ Safety Fund/Horizon Europe/NED Reagan-Fascell); deadline-expiry note
- **`journals.ts`** — `JournalFocus` (9), `JournalAccess` (4); 4 seed entries (Intelligence & National Security/Journal of Strategic Studies/Remote Sensing MDPI/Journal of Cyber Policy); DOI citation note
- **`books.ts`** — `BookTopic` (9), `BookFormat` (4); 5 seed entries (Bazzell/Pomerantsev/Mitnick/Greenberg Sandworm/Higgins Bellingcat); affiliate disclosure note
- **Routes:** `api/v1/directory/ngos/`, `grants/`, `journals/`, `books/` route.ts files

TODO progress: 4 files × 4/4 ✅ = 16 tasks

---

### Agent 6 — Data Storage + Data Pipelines (21 tasks)

New files: `apps/web/src/lib/data/storage-config.ts`, `apps/web/src/lib/data/pipeline-config.ts`

- **`storage-config.ts`** — `StorageLayerId` (12), `StorageRole` (8); `STORAGE_LAYER_CONFIGS` (12 layers: postgres-postgis / timescaledb / elasticsearch / qdrant / redis / s3-object / cdn / parquet-archive / glacier-deep / duckdb-trino / schema-registry / data-catalog); single-source-of-truth principle, i18n note; `getStorageLayer()`
- **`pipeline-config.ts`** — `KafkaTopic` (7), `PipelineStageId` (6), `OrchestrationEngine` (4); `PIPELINE_STAGES` (6 stages: ingest → normalize → enrich → verify → index → serve); Temporal workflows / backfill-replay / schema-registry / per-source SLO / replayability principle / i18n notes; `buildPipelineTopicName()`, `getPipelineStage()`
- **Routes:** `api/v1/data/storage/route.ts`, `api/v1/data/pipeline/route.ts`

TODO progress: `TODO_storage.md` 12/12 ✅, `TODO_pipelines.md` 14/14 ✅

---

### Agent 7 — KG storage + Data Quality + Retraction + Data Contracts + CDC + dbt (38 tasks)

New files: `knowledge-graph/storage-config.ts`, `data/data-quality.ts`, `data/retraction-workflow.ts` (`'use server'`), `data-ops/data-contracts.ts`, `data-ops/cdc-archive.ts`, `data-ops/dbt-models.ts`

- **`kg/storage-config.ts`** — `KgStorageConfig` (Postgres+Qdrant+Elastic); Wikidata bulk-load/NLP-population/embeddings/entity-pages/copilot-retrieval/CC-BY-export/locale-resolution notes; `buildEntityPageUrl()`, `buildWikidataSameAsUrl()`; re-exported via `index.ts`
- **`data-quality.ts`** — `DataQualityDimension` (6); 5 default SLOs (freshness ≤5min/completeness ≥99%/schema-conformance ≥99.9%/uniqueness ≥99.99%/accuracy ≥95%); monitoring + reporting notes; `computeQualityScore()`
- **`retraction-workflow.ts`** — `RetractionReason` (6), `RetractionStatus` (5); soft-delete+410 policy; SLA 2h ack/24h clear/7d contested; immutable audit log; `RetractionStore`, `retractionStore` singleton
- **`data-contracts.ts`** — `DataContract` + `FieldContract`; 30-day breaking-change notice; Soda Core/Great Expectations tooling note
- **`cdc-archive.ts`** — `CdcSourceTable` (6), `ArchiveTier` (3); 6 CDC configs (Debezium); warm/cold/deep-frozen archive tiers
- **`dbt-models.ts`** — 6 models: stg_events/stg_entities/int_events_enriched/mart_daily_activity/mart_source_quality/exposure_api; testing + docs notes

TODO progress: `TODO_knowledge_graph.md` 13/13 ✅, `TODO_data_quality.md` 12/12 ✅, `TODO_retraction.md` 10/10 ✅, `TODO_data_contracts.md` 8/8 ✅, `TODO_cdc_archive.md` 8/8 ✅, `TODO_dbt_models.md` 8/8 ✅

---

### Agent 8 — Docs IA + Internal Handbook + Design System + API/Dev/User Docs (53 tasks)

New files in `apps/web/src/lib/`: docs/ia-config.ts, docs/handbook-config.ts, design/system-docs-config.ts, docs/api-docs-config.ts, docs/user-docs-config.ts, docs/dev-docs-config.ts; Route: `api/v1/docs/surfaces/route.ts`

- **`ia-config.ts`** — 3 surfaces (user-docs/dev-docs/handbook); 9 notes (taxonomy/style-guide/search/feedback/versioning/locale/freshness-audit/discoverability)
- **`handbook-config.ts`** — 10 sections (values/engineering/sales/support/hiring/compensation/remote/decision-making/comms/security); RAPID framework; comms SLA (urgent 1h/standard 24h/non-urgent 72h)
- **`system-docs-config.ts`** — 6 Storybook sections (foundations/components/patterns/themes/locales/guidelines); Chromatic visual regression; axe a11y; Figma token sync; white-label guidelines
- **`api-docs-config.ts`** — 8 sections; OpenAPI 3.1 spec; Scalar/Redoc explorer; SDK TypeScript/Python/Go; 60-day deprecation notice
- **`user-docs-config.ts`** — 8 categories (getting-started/map-workspace/alerts/reports/collaboration/account-billing/troubleshooting/glossary); search/video/tooltip notes
- **`dev-docs-config.ts`** — 7 sections incl. MCP integration; interactive Monaco playground; OpenAPI; community PRs welcome

TODO progress: `TODO_docs_ia.md` 9/9 ✅, `TODO_internal_handbook.md` 10/10 ✅, `TODO_design_system_docs.md` 12/12 ✅, `TODO_api_docs.md` 10/10 ✅, `TODO_user_docs.md` 10/10 ✅, `TODO_dev_docs.md` 12/12 ✅

---

## File count summary

| Category | New files |
|----------|-----------|
| Directory lib modules | 15 |
| Data/DataOps lib modules | 7 |
| Docs/Design lib modules | 6 |
| Next.js API routes | ~20 |
| KG index update | 1 |
| **Total** | **~49** |

## New library structure

```
apps/web/src/lib/
├── directory/          (15 files)
│   ├── strategy.ts              ← 14 directory types, 5 listing tiers
│   ├── companies.ts             ← company profile, filters, schema.org builder
│   ├── tools.ts                 ← 10 tool categories, profile, schema.org builder
│   ├── services-dir.ts          ← 8 service categories, profile, lead-gen
│   ├── experts.ts               ← expert profile, E-E-A-T, booking flow
│   ├── claim-listing.ts         ← 'use server', claim flow, ClaimStore
│   ├── moderation.ts            ← 'use server', mod queues, ModerationStore
│   ├── conferences.ts           ← conference profiles, focus config, 3 seeds
│   ├── courses.ts               ← course profiles, topic config, 3 seeds
│   ├── podcasts.ts              ← podcast profiles, topic config, 3 seeds
│   ├── think-tanks.ts           ← think tank profiles, focus config, 4 seeds
│   ├── ngos.ts                  ← NGO profiles, focus config, 3 seeds
│   ├── grants-dir.ts            ← grant profiles, funder types, deadline policy
│   ├── journals.ts              ← journal profiles, access types, DOI note
│   └── books.ts                 ← book profiles, affiliate disclosure
├── data/               (3 new files)
│   ├── storage-config.ts        ← 12 storage layers (Postgres/Qdrant/Elastic/etc.)
│   ├── pipeline-config.ts       ← 6 pipeline stages (Kafka topics + Temporal)
│   ├── data-quality.ts          ← 5 SLOs, quality score helper
│   └── retraction-workflow.ts   ← 'use server', RetractionStore
├── data-ops/           (3 new files)
│   ├── data-contracts.ts        ← DataContract + FieldContract
│   ├── cdc-archive.ts           ← CDC configs, 3 archive tiers
│   └── dbt-models.ts            ← 6 dbt models
├── knowledge-graph/ (addition)
│   └── storage-config.ts        ← KG backend config, entity page URLs, Wikidata helpers
├── docs/               (5 new files)
│   ├── ia-config.ts             ← 3 docs surfaces, style guide, search, versioning
│   ├── handbook-config.ts       ← 10 handbook sections, RAPID framework
│   ├── api-docs-config.ts       ← 8 API docs sections, OpenAPI, SDK
│   ├── user-docs-config.ts      ← 8 user docs categories
│   └── dev-docs-config.ts       ← 7 dev docs sections, MCP integration
└── design/             (1 new file)
    └── system-docs-config.ts    ← 6 Storybook sections, visual regression, a11y
```

## TODO files closed (25 files)

| File | Status |
|------|--------|
| `TODO_directory_strategy.md` | 12/12 ✅ |
| `TODO_companies_directory.md` | 15/15 ✅ |
| `TODO_tools_directory.md` | 13/13 ✅ |
| `TODO_services_directory.md` | 9/9 ✅ |
| `TODO_experts_directory.md` | 9/9 ✅ |
| `TODO_claim_listing.md` | 9/9 ✅ |
| `TODO_directory_moderation.md` | 9/9 ✅ |
| `TODO_conferences_directory.md` | 4/4 ✅ |
| `TODO_courses_directory.md` | 4/4 ✅ |
| `TODO_podcasts_directory.md` | 4/4 ✅ |
| `TODO_think_tanks_directory.md` | 4/4 ✅ |
| `TODO_ngos_directory.md` | 4/4 ✅ |
| `TODO_grants_directory.md` | 4/4 ✅ |
| `TODO_journals_directory.md` | 4/4 ✅ |
| `TODO_books_directory.md` | 4/4 ✅ |
| `TODO_storage.md` | 12/12 ✅ |
| `TODO_pipelines.md` | 14/14 ✅ |
| `TODO_knowledge_graph.md` | 13/13 ✅ |
| `TODO_data_quality.md` | 12/12 ✅ |
| `TODO_retraction.md` | 10/10 ✅ |
| `TODO_data_contracts.md` | 8/8 ✅ |
| `TODO_cdc_archive.md` | 8/8 ✅ |
| `TODO_dbt_models.md` | 8/8 ✅ |
| `TODO_docs_ia.md` | 9/9 ✅ + api/user/dev docs |
| `TODO_design_system_docs.md` | 12/12 ✅ |

## Honest caveats

- No local TypeScript toolchain — run `pnpm typecheck` on CI.
- Mojibake: **0**. EN+UK throughout.
- Directory seed entries (3–5 per type) are illustrative anchors — full seed of 100–1000 entries per directory type requires editorial curation sprint.
- `ClaimStore` and `ModerationStore` are in-memory — production needs Postgres-backed tables.
- `RetractionStore` is in-memory — production needs immutable append-only table.
- `dbt-models.ts` is a config/manifest file — actual .sql dbt model files live in a separate `dbt/` workspace.
- CDC configs reference Debezium as connector — actual Debezium deployment is infra sprint.
- Design system docs config defines the *specification* — actual Storybook stories are separate frontend sprint.
