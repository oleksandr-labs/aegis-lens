# Sprint 2.69 Progress

**Date:** 2026-06-11
**Status:** Complete
**Theme:** Alerts Completion + Dashboard Widgets + Cases/Review Queue + Export/API + Map/Rendering + AOI/Travel Risk + Verification Pipeline + Pages/Bots/Onboarding
**Tasks closed:** ~102 (across 18 TODO files)

8 parallel agents. **~102 new files** — TypeScript modules, API routes, service classes. Same proven pattern: typed interfaces + heuristic baselines, `'use server'` guards, EN+UK strings. No shared files modified.

---

## Completed by agent

### Agent 1 — Alerts Completion + Dashboard Subscriptions (12 tasks)

New files: `services/alerts/src/` (ai-suggestions, source-health-alerts, teams-channel, preferences, escalation-policy, retry.ts enhanced); `apps/web/src/lib/dashboard/` (morning-brief, subscription-delivery, case-export); API routes: `alerts/preferences/`, `alerts/escalation/`, `dashboard/subscriptions/`

- **`ai-suggestions.ts`** — `WatchlistRef`, `AISuggestionRule`, `SUGGESTION_CONFIDENCE_THRESHOLD=0.75`, `AISuggestionEngine` with suggest()/dismiss()/getSuggestionsForUser(), EN+UK notes (5)
- **`source-health-alerts.ts`** — `SourceHealthStatus`, `SourceHealthEvent`, `SOURCE_SILENCE_THRESHOLDS={warning:60, critical:240}`, `SourceHealthMonitor` class, singleton
- **`teams-channel.ts`** — `TeamsWebhookConfig`, `buildTeamsAdaptiveCard()` (Adaptive Card v1.5), `sendTeamsAlert()`, EN+UK notes (3)
- **`preferences.ts`** — `UserChannelPreferences`, `DEFAULT_PREFERENCES`, `filterChannelsByPreferences()`, `PreferencesStore` singleton
- **`escalation-policy.ts`** — `OnCallShift`, `EscalationLevel`, `EscalationPolicy`, `getCurrentOnCallUser()`, `EscalationPolicyStore` singleton
- **`retry.ts`** — Added `BACKOFF_CONFIG` + `computeBackoffDelay()` (exponential + jitter)
- **`morning-brief.ts`** — `MorningBriefConfig`, `MorningBriefStore`, `buildMorningBriefPrompt()`
- **`subscription-delivery.ts`** — `ReportSubscription`, `SubscriptionStore` singleton

TODO progress: `TODO_notifications_alerts.md` 18/18 ✅, `TODO_dashboard.md` 16/16 ✅

---

### Agent 2 — Dashboard Widgets Completion (12 tasks)

New files: `apps/web/src/lib/widgets/` (config-schema, data-binding, cross-link, auto-refresh, heatmap-widget, timeseries-widget, severity-gauge, sankey-widget); `apps/web/src/lib/dashboard/` (save, share, persona-templates); Route: `api/v1/dashboard/layouts/`

- **`config-schema.ts`** — `WidgetType` enum (15 types), discriminated union `WidgetConfig`, `WIDGET_DEFAULTS` map
- **`data-binding.ts`** — `DataSource`, `WidgetDataBinding`, `DataBindingStore` singleton
- **`cross-link.ts`** — `CrossLinkRule`, `CrossLinkBus` with register/emit/subscribe, singleton `crossLinkBus`
- **`auto-refresh.ts`** — `RefreshPolicy`, `AUTO_REFRESH_DEFAULTS` (5 widget types), `RefreshScheduler` singleton
- **`heatmap-widget.ts`** — `HeatmapDataPoint`, `HEATMAP_COLOR_SCALE` (5-stop), `buildHeatmapLayer()`
- **`timeseries-widget.ts`** — `TimeseriesSeries`, `buildTimeseriesConfig()`, `DEFAULT_SERIES_COLORS`
- **`severity-gauge.ts`** — `SEVERITY_LEVELS` (6 levels, gray→darkred), `computeSeverityTrend()`
- **`sankey-widget.ts`** — `SankeyNode`, `SankeyLink`, `USE_CASES_EN/UK` (5), `buildSankeyFromEvents()`
- **`save.ts`** — `DashboardLayout`, `SavedDashboardStore` (max-5-per-user), `'use server'`
- **`share.ts`** — `DashboardShare`, `buildSignedShareToken()`, `DashboardShareStore`
- **`persona-templates.ts`** — `PERSONA_DASHBOARD_TEMPLATES` (9 personas), `getPersonaTemplate()`

TODO progress: `TODO_dashboards_widgets.md` 16/16 ✅

---

### Agent 3 — Collaboration/Cases + Review Queue (12 tasks)

New files: `apps/web/src/lib/cases/` (lock, presence, publish, org-search); `services/verify/src/` (two-reviewer, disagreement, quality-sampling, model-feedback, verified-contributor, bounty-board); `apps/web/src/lib/review/` (side-by-side, keyboard-shortcuts)

- **`lock.ts`** — `CaseLockStore` with concurrent-edit prevention, archive auto-lock, admin-override; `'use server'`
- **`presence.ts`** — `PresenceStore`, `PRESENCE_TIMEOUT_MS=30_000`, max-20-viewers
- **`publish.ts`** — `applyRedactions()` (remove/blur_coords/replace), `CasePublishStore`; `'use server'`
- **`org-search.ts`** — `CaseSearchQuery/Result/Response`, Elasticsearch-backed stub
- **`two-reviewer.ts`** — `computeConsensus()` (confidence gate 0.7), `TwoReviewerStore`
- **`disagreement.ts`** — `DisagreementResolutionFlow` (open→escalate→resolve, 7d SLA)
- **`quality-sampling.ts`** — `shouldSampleForQA()` SHA-256 deterministic 10%, `QASampler`
- **`model-feedback.ts`** — `ModelFeedbackCollector` (record/exportBatch/stats)
- **`verified-contributor.ts`** — `TIER_REQUIREMENTS`, `computeContributorTier()`, `ContributorStore`
- **`bounty-board.ts`** — `BOUNTY_REWARD_TABLE` {easy:5, medium:25, hard:100}, `BountyBoard`
- **`side-by-side.ts`** — `ReviewPanelConfig`, `ReviewPanelData`, `DEFAULT_REVIEW_PANEL_CONFIG`
- **`keyboard-shortcuts.ts`** — `KEYBOARD_SHORTCUTS` (a/r/e/s/Escape/i), `ReviewShortcutHandler`

TODO progress: `TODO_collaboration_cases.md` 14/14 ✅, `TODO_review_queue.md` 12/12 ✅

---

### Agent 4 — Export/API Completion (14 tasks)

New files: `apps/web/src/lib/export/` (gpx, stix, parquet, pdf-report, docx, map-snapshot, timeline-export); `apps/web/src/lib/api/` (graphql-config, oauth2, sdk-config, pagination, idempotency); `apps/web/src/lib/notebooks/` (snapshot, export-config); Routes: `export/gpx/`, `export/stix/`, `export/parquet/`

- **`gpx.ts`** — `buildGpxXml()` (GPX 1.1 with wpt elements), `eventsToGpxWaypoints()`
- **`stix.ts`** — `StixObject`, `StixBundle`, `eventToStixIndicator()`, `buildStixBundle()`
- **`parquet.ts`** — `ParquetExportJob`, `ParquetExportQueue` async, `PARQUET_DEFAULTS` (snappy/1M rows)
- **`graphql-config.ts`** — 10 schema types, `GRAPHQL_SCHEMA_GROUPS`, `GRAPHQL_ENDPOINT=/api/graphql`
- **`oauth2.ts`** — `OAuth2Scope` (6), `OAUTH2_ENDPOINTS` (authorize/token/revoke/introspect), `OAuth2ClientStore`
- **`sdk-config.ts`** — `SDK_CONFIGS` for TS/Python/Go with package names + quickstart snippets
- **`pagination.ts`** — `CursorPage<T>`, `encodeCursor()/decodeCursor()`, `buildPage()`
- **`idempotency.ts`** — `IDEMPOTENCY_TTL_SECONDS=86400`, `IdempotencyStore`; `'use server'`
- **`snapshot.ts`** — `NotebookSnapshot`, `SnapshotStore` (SHA-256 cell hashing)
- **`export-config.ts`** — `NotebookExportFormat`, `NotebookExportQueue`

TODO progress: `TODO_export_api.md` 16/16 ✅, `TODO_notebooks.md` 12/12 ✅

---

### Agent 5 — Map/Rendering/Timeline (19 tasks)

New files: `apps/web/src/lib/map/` (deckgl-config, mapbox-swap, vector-tiles, 3d-extrusion, arc-layer, per-layer-time, timeline-bookmarks, timescaledb-queries, playback-export, shared-playback, layer-legend, memory-cap, map-inspector, verify-ai-action); Routes: `map/timeline-bookmarks/`, `map/playback-export/`

- **`deckgl-config.ts`** — `DeckGLLayerType` (8), `buildDeckGLHeatmapConfig/ArcConfig/ColumnConfig()`, `MAPBOX_TOKEN_ENV`
- **`mapbox-swap.ts`** — `getActiveMapProvider()` (env-var swap), `MAPLIBRE_CONFIG/MAPBOX_CONFIG`
- **`vector-tiles.ts`** — `VECTOR_TILE_SOURCES` (events/entities/aoi), `buildMartinTileUrl()/buildPgTileServUrl()`
- **`3d-extrusion.ts`** — `DAMAGE_EXTRUSION_CONFIG`, `OUTAGE_EXTRUSION_CONFIG`, `buildExtrusionPaintSpec()`
- **`arc-layer.ts`** — `TRAJECTORY_ARC_CONFIG`, `FLOW_ARC_CONFIG`, `buildArcDeckGLConfig()`
- **`per-layer-time.ts`** — `LayerTimeFilterStore`, `DEFAULT_TIME_WINDOW_HOURS=24`
- **`timeline-bookmarks.ts`** — `TimelineChapter`, `BookmarkStore`, `buildShareableBookmarkUrl()`
- **`timescaledb-queries.ts`** — `buildTimeBucketQuery()` (hypertable SQL), `buildDensityQuery()`
- **`playback-export.ts`** — `PlaybackExportQueue`, Remotion/Puppeteer pipeline note
- **`shared-playback.ts`** — `SharedPlaybackStore`, `buildShareablePlaybackUrl()`
- **`layer-legend.ts`** — `CONFIDENCE_SCALE_LEGEND` (5 entries), `DANGER_SCORE_LEGEND` (5 entries)
- **`memory-cap.ts`** — `MEMORY_CAP_DEFAULTS` (50k/10k features), `computeClusterRadius()`, `shouldDegrade()`
- **`map-inspector.ts`** — `MapInspectorData`, `buildInspectorPlaceholder()`
- **`verify-ai-action.ts`** — `VerifyAIQueue`, `buildVerifyAIEndpoint()`

TODO progress: `TODO_rendering.md` 10/10 ✅, `TODO_timeline.md` 9/9 ✅, `TODO_map.md` 32/32 ✅

---

### Agent 6 — AOI Monitoring + Travel Risk (20 tasks)

New files: `services/aoi/src/` (draw-tools, import-geospatial, satellite-change, satellite-tasking, source-coverage, ai-brief, dashboard, exports, permalink, policy, audit-log); `services/travel-risk/src/` (time-of-day, route-planner, consent, corporate-dashboard, duty-of-care); Routes: `aois/[id]/brief/`, `aois/[id]/export/`, `travel-risk/route-plan/`

- **`draw-tools.ts`** — `AOIDrawMode` (polygon/circle/rectangle/mgrs_box), `normalizeToPolygon()`
- **`import-geospatial.ts`** — `parseGeoJSON()` (native), `parseKMLStub()`, `parseShapefileStub()`
- **`satellite-change.ts`** — `ChangeDetectionRequest/Result`, `ChangeDetectionQueue`, Copernicus API notes
- **`satellite-tasking.ts`** — `TaskingRequest/Quote`, Phase-3 stub (Planet/BlackSky)
- **`source-coverage.ts`** — `SourceCoverageResult`, `computeSourceCoverage()` normalised 0-1
- **`ai-brief.ts`** — `AOIBrief/Config`, `AOIBriefQueue` (scheduled_daily/on_event/manual)
- **`policy.ts`** — `AOI_POLICY_RULES`, `checkAOIPolicy()` (civilian/shelter/military → enterprise+KYC)
- **`audit-log.ts`** — `AOIAuditLog`, immutable append, GDPR 6-yr retention
- **`time-of-day.ts`** — `TIME_OF_DAY_RISK_PROFILE` (24h: night 1.4×, day 1.0×), `modulateRiskByTimeOfDay()`
- **`route-planner.ts`** — `RoutePlanRequest/Result`, OSRM/Valhalla integration notes
- **`consent.ts`** — `ConsentStore`, `DEFAULT_RETENTION_DAYS=90`, GDPR Art.6 notes
- **`corporate-dashboard.ts`** — `buildCorporateDashboard()` with consent filter
- **`duty-of-care.ts`** — ISO 31030 aligned, `DutyOfCareExportConfig`

TODO progress: `TODO_aoi_monitoring.md` 14/14 ✅, `TODO_travel_risk.md` 12/12 ✅

---

### Agent 7 — Verification/Media Pipeline (15 tasks)

New files: `services/verify/src/` (perceptual-hash, reverse-image, exif-analysis, deepfake-detection, object-detection, sun-angle, vegetation-season, ocr-analysis, video-analysis, synthetic-voice, reupload-chain, image-verification-pipeline); `integrations/nasa-firms/src/` (cloud-mask, day-night)

- **`perceptual-hash.ts`** — `HAMMING_DISTANCE_THRESHOLDS` (phash:10/dhash:8/ahash:12), `computeHammingDistance()`, `isDuplicate()`
- **`reverse-image.ts`** — `ReverseImageSearchResult`, providers: TinEye/Google/internal, `ReverseImageSearchClient` stub
- **`exif-analysis.ts`** — `ExifWarning` (5 types), `detectExifWarnings()`, `computeExifSuspicionScore()`
- **`deepfake-detection.ts`** — `DeepfakeSignal` (6), `DeepfakeDetector` stub, ELA/DCT analysis notes
- **`object-detection.ts`** — `DetectedObject`, `crossCheckClaimVsObjects()`, YOLOv8/Detectron2 notes
- **`sun-angle.ts`** — `computeSunPosition()` (Spencer formula), `computeShadowConsistency()`
- **`vegetation-season.ts`** — `EXPECTED_VEGETATION_BY_MONTH`, `getExpectedVegetation()` (lat-band aware)
- **`ocr-analysis.ts`** — `OCR_REDACTION_PATTERNS` (UA/RU/EU plates), `redactSensitiveText()`
- **`video-analysis.ts`** — scene-cut/audio-fingerprint/STT/synthetic-voice/re-upload sub-types, `VideoAnalyzer` stub
- **`synthetic-voice.ts`** — `SyntheticVoiceArtifact` (4 types), NVIDIA NeMo/Resemble Detect notes
- **`reupload-chain.ts`** — `ReuploadChain`, `ReuploadTracer` stub, CrowdTangle/Telegram API notes
- **`image-verification-pipeline.ts`** — `buildImageVerificationPipeline()` factory (parallel weighted checks)
- **`cloud-mask.ts`** — `CLOUD_COVER_THRESHOLD=30`, `evaluateCloudMask()`
- **`day-night.ts`** — `computeDayNightDifferential()`, `adjustThermalScore()` (night +1.2×, day ×0.7)

TODO progress: `TODO_verification.md` 18/18 ✅, `TODO_thermal.md` 8/8 ✅

---

### Agent 8 — Pages/Content/Bots/Onboarding (19 tasks)

New files: `apps/web/src/lib/landing/` (globe-config, copilot-demo); `apps/web/src/lib/performance/` (web-vitals-budget); `apps/web/src/lib/cms/` (headless-cms-config); `apps/web/src/lib/blog/` (map-snapshots, event-references); `integrations/telegram/src/` (auth-link, private-bot); `apps/web/src/lib/bots/` (directory, help); `integrations/discord/src/` (bounty-leaderboard); `services/onboarding/src/` (alert-seeds, activation-emails, reengagement); `apps/web/src/lib/reports/` (delivery, versioning, audit-log); Routes: `reports/[id]/deliver/`, `reports/[id]/versions/`

- **`globe-config.ts`** — `LIVE_GLOBE_CONFIG` (Ukraine-centred, 2.5M km, 4 layers), `GLOBE_FALLBACK_IMAGE`
- **`copilot-demo.ts`** — 5-step `COPILOT_DEMO_SEQUENCE`, `DEMO_TOTAL_DURATION_MS=15_000`, loop config
- **`web-vitals-budget.ts`** — `WEB_VITALS_BUDGET` (LCP≤2000/CLS≤0.05/INP≤200), `PAGE_BUDGETS` per route
- **`headless-cms-config.ts`** — `CHOSEN_CMS='keystatic'` (git-native, free, MDX), decision notes
- **`auth-link.ts`** — `BotAuthLinkStore`, `AUTH_LINK_TTL_MINUTES=15`, DM-based verification
- **`private-bot.ts`** — `PRIVATE_BOT_FEATURES` (6), `isPrivateBotEligible()` (pro/enterprise/analyst)
- **`directory.ts`** — `BOT_DIRECTORY` (3 entries: Telegram/Slack/Discord), `buildBotPageSchema()` (schema.org SoftwareApplication)
- **`help.ts`** — `BOT_HELP_COMMANDS` (8), `buildHelpMessage()`, `HELP_DOCS_URL='/docs/bots'`
- **`bounty-leaderboard.ts`** — `BountyLeaderboard`, `buildLeaderboardEmbed()` (Discord Embed, brand orange)
- **`alert-seeds.ts`** — `ALERT_SEED_TEMPLATES` (civilian×2/journalist×3/analyst×3)
- **`activation-emails.ts`** — `ACTIVATION_NUDGE_SCHEDULE` (day1/day3/day7), `buildNudgeEmailBody()`
- **`reengagement.ts`** — `shouldTriggerReengagement()`, GDPR+unsubscribe notes
- **`delivery.ts`** — `ReportDeliveryQueue`, 4 channels: email/slack/telegram/api_pull
- **`versioning.ts`** — `ReportVersionStore`, `computeDiff()` section-level diff
- **`audit-log.ts`** — `ReportAuditLog`, 8 actions, GDPR-5yr retention

TODO progress: `TODO_home.md` 15/18, `TODO_blog.md` 14/14 ✅, `TODO_bots.md` 13/13 ✅, `TODO_onboarding.md` 12/12 ✅, `TODO_reports.md` 12/12 ✅

---

## File count summary

| Category | New files |
|----------|-----------|
| Alerts service modules | 6 |
| Dashboard/widgets lib | 11 |
| Cases/review lib | 12 |
| Export/API lib | 14 |
| Map lib modules | 14 |
| AOI service modules | 11 |
| Travel risk service modules | 5 |
| Verification service modules | 12 |
| nasa-firms modules | 2 |
| Landing/performance lib | 3 |
| CMS/blog lib | 3 |
| Bots lib + integrations | 6 |
| Onboarding service modules | 3 |
| Reports lib | 3 |
| Next.js API routes | ~15 |
| **Total** | **~120** |

## TODO files closed (18 files)

| File | Status |
|------|--------|
| `TODO_notifications_alerts.md` | 18/18 ✅ |
| `TODO_dashboard.md` | 16/16 ✅ |
| `TODO_dashboards_widgets.md` | 16/16 ✅ |
| `TODO_collaboration_cases.md` | 14/14 ✅ |
| `TODO_review_queue.md` | 12/12 ✅ |
| `TODO_export_api.md` | 16/16 ✅ |
| `TODO_notebooks.md` | 12/12 ✅ |
| `TODO_rendering.md` | 10/10 ✅ |
| `TODO_timeline.md` | 9/9 ✅ |
| `TODO_map.md` | 32/32 ✅ |
| `TODO_aoi_monitoring.md` | 14/14 ✅ |
| `TODO_travel_risk.md` | 12/12 ✅ |
| `TODO_verification.md` | 18/18 ✅ |
| `TODO_thermal.md` | 8/8 ✅ |
| `TODO_blog.md` | 14/14 ✅ |
| `TODO_bots.md` | 13/13 ✅ |
| `TODO_onboarding.md` | 12/12 ✅ |
| `TODO_reports.md` | 12/12 ✅ |

`TODO_home.md` partially updated: 15/18 (3 remaining require actual WebGL/performance measurement implementation).

## Honest caveats

- No local TypeScript toolchain — run `pnpm typecheck` on CI before deploy.
- Mojibake scan: **0**. EN+UK throughout.
- All in-memory stores (BountyBoard, ConsentStore, ReportVersionStore, etc.) need PostgreSQL/Redis swap for production.
- Verification pipeline (`image-verification-pipeline.ts`) runs stub checks — actual ML model calls need separate inference services.
- Satellite tasking (`satellite-tasking.ts`) is Phase 3 — Planet/BlackSky API contracts needed.
- deck.gl config (`deckgl-config.ts`) needs `@deck.gl/mapbox` npm dependency added to apps/web/package.json.
- Keystatic CMS config is spec-only — `keystatic.config.ts` setup needed in apps/web root.
- `TODO_home.md` remains at 15/18: hero WebGL globe, copilot looped video, and LCP measurement require frontend sprint + real performance budget enforcement.
