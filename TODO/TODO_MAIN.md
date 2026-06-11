**Sprint 2.4 complete (2026-05-24)** — ~170 TODO tasks marked across ~55 files. Full skeleton shipped across 14 sprints.
**Sprint 2.39 complete (2026-05-24)** — brand foundation: Brand Book v1.0, Voice & Tone v1.0, Social Playbook v1.0, Brand Governance v1.0, DAM Plan v1.0 shipped under `TODO/brand/`. 45 brand-scope tasks closed across 5 brand TODO files + 2 in `design/TODO_branding.md`.
**Sprint 2.57 complete (2026-06-06)** — Map Layers Subsystem hardening: **100 tasks** closed across 15 `TODO/layers/` files (12 layers fully closed). 94 new integration modules + 3 API routes (`maritime`/`aviation`/`troop-movement`) + `/vessels/[mmsi]` SEO page; registry entries added for `missiles`/`thermal`/`sentinel_sar`; 10 new `LAYER_PAINT_SPECS`. See [SPRINT_2_57_PROGRESS.md](SPRINT_2_57_PROGRESS.md). 2 pre-existing `tsc`-breaking typos fixed (missiles/infrastructure adapters).
**Sprint 2.58 complete (2026-06-06)** — OSINT Data-Source Integrations (ingest for 2.57 layers): **100 tasks** closed across 9 `TODO/integrations/` files (ISW, Oryx, DeepStateMAP, Ukrenergo, alerts.in.ua, ACLED/GDELT/UCDP, CERT-UA, DSNS, UN OCHA). 9 new `@ua-map/*` packages (120 modules) + 9 `api/integrations/*` routes + 9 `COMPLIANCE.md`; 5 new map layers (`equipment_losses`/`frontline_control`/`cyber_incidents`/`emergencies`/`humanitarian`) → registry now 24 layers. License/PII enforced in code (ACLED raw + DeepState polygons gated OFF; OCHA fail-closed PII redactor). See [SPRINT_2_58_PROGRESS.md](SPRINT_2_58_PROGRESS.md).
**Sprint 2.59 complete (2026-06-06)** — OSINT Source Ingest Fleet completion: **100 tasks** closed across 13 `TODO/integrations/` files (Copernicus EMS, data.gov.ua, Hajun/BYPOL, milbloggers, OVA Telegram, Genstaff/MoD, UALosses, Ukrhydromet + finished ADS-B/AIS/Sentinel Hub/YouTube-Reddit/X partials). 8 new `@ua-map/*` packages + 8 routes + 14 `COMPLIANCE.md`; 2 new map layers (`belarus_flank`/`crisis_mapping`) → registry now 26 layers. Ethics/source-protection in code (UALosses aggregate-only fail-closed; Hajun contributor anonymity; milbloggers no-false-equivalence). Remaining `TODO/integrations/` = commercial connectors (Anthropic/OpenAI, Stripe, Mapbox). See [SPRINT_2_59_PROGRESS.md](SPRINT_2_59_PROGRESS.md).
**Sprint 2.60 complete (2026-06-06)** — Connectors completion + AI/ML services: **87 tasks** — closes `TODO/integrations/` **100%** (Anthropic/OpenAI multi-provider, Stripe billing, Mapbox, Telegram, NASA FIRMS) and the entire `TODO/ai/` folder (ai_seo_generation, vision, nlp, entity_extraction, misinformation, anomaly, auto_tagging, copilot). New pkgs `@ua-map/llm-providers`, `@ua-map/stripe`, `@ua-map/mapbox`, `@ua-map/ai-seo`, `@ua-map/copilot`; rest extended. No new map layers (still 26). Grounding/YMYL/PII enforced in code. See [SPRINT_2_60_PROGRESS.md](SPRINT_2_60_PROGRESS.md).
**Sprint 2.61 complete (2026-06-06)** — Technical SEO subsystem: **107 tasks** across 13 `TODO/seo/` files (crawl/index, robots, sitemaps, archive, internal-link engine, anchor text, redirects, URL SEO, duplicate content, breadcrumbs, schema, Core Web Vitals). **97 new `apps/web/src/lib/seo/**` modules + tests** (additive). Safe robots.ts changes applied; all request-flow wirings captured in [apps/web/src/lib/seo/WIRING.md](../apps/web/src/lib/seo/WIRING.md) for a CI-typecheck-gated activation pass (NOT blind-merged). See [SPRINT_2_61_PROGRESS.md](SPRINT_2_61_PROGRESS.md). Remaining SEO (~177): content/analytics/backlinks/international/news/keywords/semantic/topical/eeat/local.

# TODO_MAIN — AI-OSINT Intelligence Platform

> **Working language for all TODO files: English.**
> Ukrainian (UK) and other locales are scaffolded but not yet authored — see [i18n/TODO_i18n.md](i18n/TODO_i18n.md).

---

## 1. Project Snapshot

**Codename:** *Aegis Lens* (working name — see [design/TODO_branding.md](design/TODO_branding.md))

**One-liner:** AI-native OSINT fusion platform that aggregates, verifies and visualizes real-time conflict, infrastructure and geopolitical intelligence — starting with Ukraine, scaling globally.

**Positioning:** Palantir-grade analytics × LiveUAmap-grade speed × Bellingcat-grade verification × Bloomberg Terminal-grade UX, in a single AI-native product.

**Primary audience (MVP):** OSINT analysts, journalists, NGOs, defense researchers. **Secondary:** governments, security firms, humanitarian orgs, traders, informed civilians.

**North-star metric:** *time-from-event-to-verified-intelligence* (target: < 90 seconds).

---

## 2. Current Status

| Area | Status |
| --- | --- |
| Concept & vision | drafted (this doc) |
| Architecture | designing |
| Frontend skeleton | not started |
| Backend skeleton | not started |
| Data pipelines | not started |
| AI services | not started |
| MVP scope locked | no |

**Phase:** *Pre-MVP / Architecture & Planning.*

---

## 3. Categories

### Pages — Core
- [Home / Landing](pages/TODO_home.md)
- [About](pages/TODO_about.md)
- [Blog / Intelligence Briefs](pages/TODO_blog.md)
- [Contact](pages/TODO_contact.md)
- [Live Map Workspace](pages/TODO_map.md)
- [Analyst Dashboard](pages/TODO_dashboard.md)
- [AI Reports](pages/TODO_reports.md)
- [Auth (login / signup / SSO)](pages/TODO_auth.md)
- [Pricing & Plans](pages/TODO_pricing.md)
- [Docs & API portal](pages/TODO_docs.md)

### Pages — Trust / Support / Community
- [Legal (Terms, Privacy, AUP, DPA)](pages/TODO_legal.md)
- [Press / Newsroom](pages/TODO_press.md)
- [Trust Center](pages/TODO_trust_center.md)
- [Help Center / Knowledge Base](pages/TODO_help_center.md)
- [Community](pages/TODO_community.md)
- [Careers](pages/TODO_careers.md)
- [Changelog](pages/TODO_changelog.md)
- [Status page](pages/TODO_status.md)
- [Public sources directory](pages/TODO_sources_index.md)
- [Public datasets index](pages/TODO_datasets.md)

### Pages — Internal / Account
- [Admin / back-office](pages/TODO_admin.md)
- [User & org settings](pages/TODO_settings.md)

### Pages — Programmatic SEO
- [Region pages](pages/TODO_regions.md)
- [Conflict pages](pages/TODO_conflicts.md)
- [Equipment pages](pages/TODO_equipment.md)
- [Use-case pages (persona × task)](pages/TODO_use_cases.md)
- [Comparison / alternatives pages](pages/TODO_comparisons.md)
- [Glossary](pages/TODO_glossary.md)

### SEO
- [Keywords](seo/TODO_keywords.md)
- [Metadata](seo/TODO_metadata.md)
- [Internal linking](seo/TODO_internal_links.md)
- [Structured data & sitemaps](seo/TODO_structured_data.md)
- [Programmatic SEO](seo/TODO_programmatic_seo.md)
- [Core Web Vitals & technical SEO](seo/TODO_core_web_vitals.md)
- [Content strategy & topic clusters](seo/TODO_content_strategy.md)
- [Backlinks & digital PR](seo/TODO_backlinks_pr.md)
- [International SEO](seo/TODO_international_seo.md)
- [Analytics & attribution](seo/TODO_analytics_attribution.md)
- [E-E-A-T author profiles](seo/TODO_eeat_authors.md)
- [Source-profile SEO](seo/TODO_source_profiles_seo.md)
- [Open data / dataset SEO](seo/TODO_open_data_seo.md)
- [News SEO (Google News / Top Stories)](seo/TODO_news_seo.md)
- [Local SEO](seo/TODO_local_seo.md)
- [Date archive pages](seo/TODO_archive_pages.md)
- [AI search optimization (LLMO / GEO)](seo/TODO_ai_search.md)

### Design
- [UI system](design/TODO_ui.md)
- [Graphics & illustrations](design/TODO_graphics.md)
- [Styles & design tokens](design/TODO_styles.md)
- [Branding](design/TODO_branding.md)
- [Motion & cinematic UX](design/TODO_motion.md)
- [Design system docs (Storybook)](design/TODO_design_system_docs.md)
- [Data visualization](design/TODO_data_viz.md)
- [Accessibility (a11y)](design/TODO_accessibility.md)
- [Marketing surfaces](design/TODO_marketing_surfaces.md)
- [Sound design](design/TODO_sound_design.md)
- [Map style guide](design/TODO_map_style_guide.md)
- [Notification design hierarchy](design/TODO_notification_design.md)
- [Print / PDF / report styling](design/TODO_print_pdf_styling.md)

### Features (cross-cutting)
- [Filters & search](features/TODO_filters_search.md)
- [Notifications & alerts](features/TODO_notifications_alerts.md)
- [Media verification](features/TODO_verification.md)
- [Embeds & widgets](features/TODO_embeds_widgets.md)
- [Mobile & PWA](features/TODO_mobile_pwa.md)
- [Onboarding](features/TODO_onboarding.md)
- [Collaboration & case files](features/TODO_collaboration_cases.md)
- [Exports & public API](features/TODO_export_api.md)
- [Custom dashboards & widgets](features/TODO_dashboards_widgets.md)
- [Plugins & marketplace](features/TODO_plugins_marketplace.md)
- [Custom AOI monitoring](features/TODO_aoi_monitoring.md)
- [Travel risk module](features/TODO_travel_risk.md)
- [Workspace presets / saved views](features/TODO_workspace_presets.md)
- [AI rule builder (NL → alerts)](features/TODO_ai_rule_builder.md)
- [Telegram / Slack / Discord bots](features/TODO_bots.md)
- [Verification review queue (HITL)](features/TODO_review_queue.md)
- [Browser extension](features/TODO_browser_extension.md)
- [Analyst notebooks](features/TODO_notebooks.md)
- [Command palette & keyboard shortcuts](features/TODO_command_palette.md)

### Audiences
- [Personas overview](audiences/TODO_personas_overview.md)
- [Civilians](audiences/TODO_civilians.md)
- [Journalists](audiences/TODO_journalists.md)
- [OSINT analysts](audiences/TODO_osint_analysts.md)
- [NGOs & humanitarian](audiences/TODO_ngos_humanitarian.md)
- [Governments & defense](audiences/TODO_governments_defense.md)
- [Security & private intel firms](audiences/TODO_security_firms.md)
- [Traders & finance](audiences/TODO_traders_finance.md)

### Tech
- [Server / backend services](tech/TODO_server.md)
- [Performance optimization](tech/TODO_optimization.md)
- [Third-party integrations](tech/TODO_integrations.md)
- [DevOps & infrastructure](tech/TODO_devops.md)
- [Observability & monitoring](tech/TODO_observability.md)

### AI
- [NLP, OCR, STT, translation](ai/TODO_nlp.md)
- [Computer vision & geo-AI](ai/TODO_vision.md)
- [AI analyst copilot](ai/TODO_copilot.md)
- [Anomaly & trend detection](ai/TODO_anomaly.md)
- [Misinformation detection](ai/TODO_misinformation.md)

### Data
- [Data sources & ingestion](data/TODO_sources.md)
- [Pipelines & ETL](data/TODO_pipelines.md)
- [Storage (PostGIS, vector, blob)](data/TODO_storage.md)
- [Event schema & taxonomy](data/TODO_schema.md)
- [Data quality SLOs](data/TODO_data_quality.md)
- [Retraction & corrections workflow](data/TODO_retraction.md)

### QA
- [Test strategy](qa/TODO_test_strategy.md)
- [Load, performance, chaos](qa/TODO_load_chaos.md)
- [User research & UX studies](qa/TODO_user_research.md)

### Platform
- [Multi-tenancy & org model](platform/TODO_multitenancy.md)
- [Feature flags & progressive delivery](platform/TODO_feature_flags.md)
- [A/B testing & experimentation](platform/TODO_ab_testing.md)
- [CMS (editorial & marketing)](platform/TODO_cms.md)
- [Localization workflow](platform/TODO_localization_workflow.md)

### Research
- [AI model governance](research/TODO_model_governance.md)
- [Prompt library & versioning](research/TODO_prompt_library.md)
- [Red teaming & AI safety](research/TODO_red_teaming.md)

### Map Layers (per-layer specs)
- [Drones](layers/TODO_drones.md) · [Missiles](layers/TODO_missiles.md) · [Fires](layers/TODO_fires.md) · [Infrastructure](layers/TODO_infrastructure.md) · [Power outages](layers/TODO_power_outages.md) · [Comms outages](layers/TODO_communications_outages.md) · [Civilian alerts](layers/TODO_civilian_alerts.md) · [Troop movement](layers/TODO_troop_movement.md) · [Aviation](layers/TODO_aviation.md) · [Maritime](layers/TODO_maritime.md) · [Weather](layers/TODO_weather.md) · [Thermal](layers/TODO_thermal.md) · [Satellite](layers/TODO_satellite_imagery.md) · [Social activity](layers/TODO_social_media_activity.md) · [AI predictions](layers/TODO_ai_predictions.md)

### Integrations (per-vendor — infra / global)
- [Mapbox](integrations/TODO_mapbox.md) · [Sentinel Hub](integrations/TODO_sentinel_hub.md) · [NASA FIRMS](integrations/TODO_nasa_firms.md) · [ADS-B / OpenSky](integrations/TODO_adsb.md) · [AIS](integrations/TODO_ais.md) · [Telegram](integrations/TODO_telegram.md) · [X / Twitter](integrations/TODO_twitter_x.md) · [YouTube & Reddit](integrations/TODO_youtube_reddit.md) · [Stripe](integrations/TODO_stripe.md) · [Anthropic / OpenAI](integrations/TODO_anthropic_openai.md)

### Integrations — UA-specific high-priority sources
- [Air alerts (alerts.in.ua)](integrations/TODO_alerts_in_ua.md) · [DeepStateMAP](integrations/TODO_deepstatemap.md) · [Oryx](integrations/TODO_oryx.md) · [ISW](integrations/TODO_isw.md) · [Ukrenergo + oblenergo](integrations/TODO_ukrenergo.md) · [Genstaff + MoD](integrations/TODO_ua_genstaff_mod.md) · [ДСНС](integrations/TODO_ua_dsns.md) · [CERT-UA + SSSCIP](integrations/TODO_cert_ua.md) · [24 OVA Telegram channels](integrations/TODO_ova_telegram.md) · [UALosses](integrations/TODO_ualosses.md) · [data.gov.ua + civic-tech](integrations/TODO_data_gov_ua.md) · [Hajun (BY tracking)](integrations/TODO_hajun_bypol.md) · [Ukrhydromet](integrations/TODO_ukrhydromet.md) · [Curated milbloggers](integrations/TODO_milbloggers_curated.md)

### Integrations — international humanitarian / research
- [Copernicus EMS](integrations/TODO_copernicus_ems.md) · [UN OCHA / ReliefWeb](integrations/TODO_un_ocha.md) · [ACLED + GDELT + UCDP](integrations/TODO_acled_gdelt.md)

### Frontend
- [Next.js App Router](frontend/TODO_nextjs_app_router.md) · [State management](frontend/TODO_state_management.md) · [Performance budgets](frontend/TODO_performance_budget.md) · [Browser compatibility](frontend/TODO_browser_compat.md) · [Animation system](frontend/TODO_animation_system.md)

### Backend Services
- [API gateway](backend/TODO_api_gateway.md) · [Ingest](backend/TODO_ingest_service.md) · [Geo](backend/TODO_geo_service.md) · [NLP](backend/TODO_nlp_service.md) · [Vision](backend/TODO_vision_service.md) · [Verify](backend/TODO_verify_service.md) · [Alert](backend/TODO_alert_service.md) · [Report](backend/TODO_report_service.md) · [Search](backend/TODO_search_service.md) · [Tile](backend/TODO_tile_service.md)

### Infra
- [Kubernetes](infra/TODO_k8s.md) · [Terraform / IaC](infra/TODO_terraform.md) · [Networking](infra/TODO_networking.md) · [DNS / CDN](infra/TODO_dns_cdn.md) · [Secrets](infra/TODO_secrets_management.md) · [Backup & DR](infra/TODO_backup_dr.md) · [Multi-region](infra/TODO_multi_region.md) · [Cost management](infra/TODO_cost_management.md) · [Kafka & Temporal](infra/TODO_kafka_temporal.md) · [Postgres ops](infra/TODO_postgres_ops.md)

### Incident Response
- [IR overview](incident_response/TODO_ir_overview.md) · [Security incident](incident_response/TODO_security_incident.md) · [Data incident](incident_response/TODO_data_incident.md) · [Source outage](incident_response/TODO_source_outage.md) · [AI regression](incident_response/TODO_ai_regression.md) · [DDoS / abuse](incident_response/TODO_ddos_response.md) · [Postmortems](incident_response/TODO_postmortems.md)

### Accessibility (deep)
- [WCAG 2.2 AA audit](a11y/TODO_wcag_audit.md) · [Screen reader](a11y/TODO_screen_reader.md) · [Keyboard navigation](a11y/TODO_keyboard_nav.md) · [Cognitive](a11y/TODO_cognitive.md)

### API
- [API design](api/TODO_api_design.md) · [Versioning](api/TODO_versioning.md) · [Rate limiting](api/TODO_rate_limiting.md) · [Webhooks](api/TODO_webhooks.md) · [SDKs](api/TODO_sdks.md)

### Billing
- [Invoicing](billing/TODO_invoicing.md) · [Tax & VAT](billing/TODO_tax_compliance.md) · [Usage metering](billing/TODO_usage_metering.md) · [Dunning / refunds](billing/TODO_dunning_refunds.md)

### Customer Support
- [Support strategy](support/TODO_support_strategy.md) · [Escalation & SLA](support/TODO_escalation_sla.md) · [Customer success](support/TODO_customer_success.md)

### Brand
- [Voice & tone](brand/TODO_voice_tone.md) · [Brand book](brand/TODO_brand_book.md) · [Social playbook](brand/TODO_social_playbook.md) · [Governance](brand/TODO_brand_governance.md)

### Legal Documents
- [MSA template](legal_docs/TODO_msa_template.md) · [DPA + subprocessors](legal_docs/TODO_dpa_template.md) · [NDAs](legal_docs/TODO_nda_templates.md) · [Partner / reseller](legal_docs/TODO_partner_reseller.md) · [Takedown / licensing](legal_docs/TODO_takedown_licensing.md)

### Investor
- [Pitch deck](investor/TODO_pitch_deck.md) · [Financial model](investor/TODO_financial_model.md) · [Due-diligence room](investor/TODO_dd_room.md) · [Investor updates](investor/TODO_investor_updates.md)

### Finance
- [Budget & runway](finance/TODO_budget_runway.md) · [Unit economics](finance/TODO_unit_economics.md) · [Fundraising](finance/TODO_fundraising.md) · [Cap table & equity](finance/TODO_cap_table.md)

### Data Ops
- [Orchestration](data_ops/TODO_airflow_workflows.md) · [dbt](data_ops/TODO_dbt_models.md) · [Data contracts](data_ops/TODO_data_contracts.md) · [CDC & cold archive](data_ops/TODO_cdc_archive.md)

### Security Ops
- [SecOps runbook](security_ops/TODO_secops_runbook.md) · [Threat modeling](security_ops/TODO_threat_modeling.md) · [Vulnerabilities](security_ops/TODO_vuln_management.md) · [Supply chain](security_ops/TODO_supply_chain.md)

### Content (long-form / editorial)
- [Pillar: What is OSINT?](content/TODO_pillar_osint.md) · [Pillar: Verify a photo](content/TODO_pillar_verify_photo.md) · [Pillar: Geolocation](content/TODO_pillar_geolocation.md) · [Brief & report templates](content/TODO_brief_templates.md) · [Year-in-review](content/TODO_year_in_review.md)

### Product Specs (RFCs)
- [Event schema](product_specs/TODO_spec_event_schema.md) · [Confidence score](product_specs/TODO_spec_confidence_score.md) · [Danger score](product_specs/TODO_spec_danger_score.md) · [Geolocation pipeline](product_specs/TODO_spec_geolocation_pipeline.md) · [Copilot grounding](product_specs/TODO_spec_copilot_grounding.md) · [Filter DSL](product_specs/TODO_spec_filter_dsl.md) · [Anomaly detection](product_specs/TODO_spec_anomaly_detection.md)

### Mobile Native (Phase 3+)
- [iOS](mobile_native/TODO_ios.md) · [Android](mobile_native/TODO_android.md) · [ASO](mobile_native/TODO_aso.md)

### Experiments (A/B backlog)
- [Experiment backlog](experiments/TODO_experiment_backlog.md) · [Pricing](experiments/TODO_pricing_experiments.md) · [Landing & onboarding](experiments/TODO_landing_experiments.md)

### Community Ops
- [Moderation playbook](community_ops/TODO_moderation_playbook.md) · [Contributor program](community_ops/TODO_contributor_program.md) · [Ambassador program](community_ops/TODO_ambassador.md) · [Community metrics](community_ops/TODO_community_metrics.md)

### Internal Docs
- [New-hire onboarding](internal_docs/TODO_new_hire.md) · [Engineering handbook](internal_docs/TODO_engineering_handbook.md) · [ADRs](internal_docs/TODO_decision_records.md) · [On-call](internal_docs/TODO_on_call.md) · [Runbooks index](internal_docs/TODO_runbooks_index.md)

### Architecture (canonical docs)
- [Master architecture](architecture/TODO_master_architecture.md) · [ERD](architecture/TODO_erd.md) · [Data flow](architecture/TODO_data_flow.md) · [Sequence diagrams](architecture/TODO_sequence_diagrams.md) · [Tech stack](architecture/TODO_tech_stack.md) · [Deployment](architecture/TODO_deployment.md) · [Scalability plan](architecture/TODO_scalability_plan.md)

### Roadmap (multi-view)
- [Index](roadmap/TODO_roadmap_index.md) · [Feature](roadmap/TODO_feature_roadmap.md) · [Sprint](roadmap/TODO_sprint_roadmap.md) · [SEO](roadmap/TODO_seo_roadmap.md) · [AI](roadmap/TODO_ai_roadmap.md) · [Content](roadmap/TODO_content_roadmap.md) · [Monetization](roadmap/TODO_monetization_roadmap.md) · [Scaling](roadmap/TODO_scaling_roadmap.md) · [Enterprise](roadmap/TODO_enterprise_roadmap.md) · [Phase breakdown](roadmap/TODO_phase_breakdown.md)

### Docs (information architecture)
- [Docs IA](docs/TODO_docs_ia.md) · [Dev docs](docs/TODO_dev_docs.md) · [User docs](docs/TODO_user_docs.md) · [API docs](docs/TODO_api_docs.md) · [Internal handbook](docs/TODO_internal_handbook.md)

### Directory (companies / tools / services / experts)
- [Strategy](directory/TODO_directory_strategy.md) · [Companies](directory/TODO_companies_directory.md) · [Tools](directory/TODO_tools_directory.md) · [Services](directory/TODO_services_directory.md) · [Experts](directory/TODO_experts_directory.md) · [Claim listing](directory/TODO_claim_listing.md) · [Moderation](directory/TODO_directory_moderation.md)

### Programmatic SEO Templates
- [Index](programmatic/TODO_template_index.md) · [Companies × city](programmatic/TODO_template_companies_city.md) · [Tools for industry / best-of](programmatic/TODO_template_tools_for_industry.md) · [X for Y](programmatic/TODO_template_x_for_y.md) · [Top lists](programmatic/TODO_template_top_lists.md) · [Near-me](programmatic/TODO_template_near_me.md) · [Alternatives](programmatic/TODO_template_alternatives.md) · [Compare](programmatic/TODO_template_compare.md) · [Industry hub](programmatic/TODO_template_industry_hub.md) · [City / country hub](programmatic/TODO_template_city_country.md) · [Tag pages](programmatic/TODO_template_tag_pages.md) · [Entity / KG](programmatic/TODO_template_entity.md) · [Threat](programmatic/TODO_template_threat.md) · [Use case](programmatic/TODO_template_use_case.md) · [Trend](programmatic/TODO_template_trend.md)

### Features (further)
- [Recommendation engine](features/TODO_recommendations.md) · [AI-generated landing pages](features/TODO_ai_landing_generator.md) · [Lead generation](features/TODO_lead_generation.md) · [Ads system](features/TODO_ads_system.md) · [Sponsored listings](features/TODO_sponsored_listings.md) · [Affiliate integrations](features/TODO_affiliate.md) · [Anti-spam / anti-bot / WAF](features/TODO_anti_spam_bot.md)

### AI (further)
- [Entity extraction & KG population](ai/TODO_entity_extraction.md) · [Auto-tagging & categorization](ai/TODO_auto_tagging.md) · [AI for SEO generation](ai/TODO_ai_seo_generation.md)

### SEO (further)
- [Topical authority](seo/TODO_topical_authority.md) · [Semantic SEO & schema](seo/TODO_semantic_seo.md) · [Duplicate content prevention](seo/TODO_duplicate_content.md) · [Crawl & indexing strategy](seo/TODO_crawl_indexing.md)

### Data (further)
- [Crawler system](data/TODO_crawler_system.md) · [Knowledge graph](data/TODO_knowledge_graph.md)

### Pages (further)
- [Industries hub](pages/TODO_industries_hub.md) · [Threats hub](pages/TODO_threats_hub.md) · [Investigations](pages/TODO_investigations.md) · [Entities (KG) index](pages/TODO_entities_kg.md) · [Academy](pages/TODO_academy.md) · [Guides library](pages/TODO_guides_library.md) · [Trends hub](pages/TODO_trends.md)

### Monetization (separate detailed system)
- Full monetization system lives in **[monetization/](monetization/)** (tiers, add-ons, vertical / geo packages, reports marketplace, day-passes, credits wallet, white-label, data licensing, group / consortium licensing, partner / reseller, professional services, plugins-marketplace revshare, contributor revshare, ads / sponsored, affiliate, academy / certification, insurance / risk, embargo / early-access, freemium / paywall strategy, discounts / grants, bundling, churn / expansion). Page stub: [product/TODO_monetization.md](product/TODO_monetization.md).

### OKRs & Metrics
- [North-star metric](okrs_metrics/TODO_north_star.md) · [OKRs (quarterly)](okrs_metrics/TODO_okrs.md) · [Metrics tree](okrs_metrics/TODO_metrics_tree.md) · [Leading vs lagging](okrs_metrics/TODO_leading_lagging.md) · [Dashboards](okrs_metrics/TODO_dashboards.md)

### Region Playbooks
- [Ukraine](region_playbooks/TODO_ua.md) · [Poland](region_playbooks/TODO_pl.md) · [Germany](region_playbooks/TODO_de.md) · [United States](region_playbooks/TODO_us.md) · [United Kingdom](region_playbooks/TODO_uk.md) · [Baltics + Romania](region_playbooks/TODO_baltics_ro.md) · [Middle East](region_playbooks/TODO_middle_east.md) · [APAC](region_playbooks/TODO_apac.md)

### Partnerships (per-partner specs)
- [DeepStateMAP](partnerships_specs/TODO_deepstate.md) · [Bellingcat](partnerships_specs/TODO_bellingcat.md) · [Mapbox](partnerships_specs/TODO_mapbox.md) · [Anthropic](partnerships_specs/TODO_anthropic.md) · [Planet / BlackSky / Capella](partnerships_specs/TODO_planet_blacksky.md) · [UN OCHA](partnerships_specs/TODO_un_ocha_partner.md) · [Anchor newsrooms](partnerships_specs/TODO_newsrooms.md) · [Universities / research](partnerships_specs/TODO_universities.md) · [ISW](partnerships_specs/TODO_isw_partner.md) · [Cloud (AWS / Cloudflare)](partnerships_specs/TODO_cloud_aws_cf.md)

### Internal Tools
- [Admin CLI](tools_internal/TODO_admin_cli.md) · [Backfill / replay tools](tools_internal/TODO_backfill_tools.md) · [Data import tools](tools_internal/TODO_data_import.md) · [Monitoring scripts](tools_internal/TODO_monitoring_scripts.md)

### Recruiting (per-role)
- [Hiring strategy](recruiting/TODO_hiring_strategy.md) · [Engineer](recruiting/TODO_role_engineer.md) · [AI / ML](recruiting/TODO_role_ai_ml.md) · [Design](recruiting/TODO_role_design.md) · [OSINT analyst](recruiting/TODO_role_osint_analyst.md) · [Sales / CS](recruiting/TODO_role_sales_cs.md) · [Ops / security / compliance](recruiting/TODO_role_ops_security.md)

### Sales
- [Sales playbook (master)](sales/TODO_sales_playbook.md) · [SDR / outbound](sales/TODO_sdr_motion.md) · [Enterprise motion](sales/TODO_enterprise_motion.md) · [Government motion](sales/TODO_gov_motion.md) · [Newsroom motion](sales/TODO_newsroom_motion.md)

### Release Management
- [Release process](release_management/TODO_release_process.md) · [Release notes](release_management/TODO_release_notes.md) · [Change management](release_management/TODO_change_management.md)

### HR / People
- [Compensation](hr_people/TODO_compensation.md) · [Remote / hybrid / travel](hr_people/TODO_remote_policy.md) · [DEI](hr_people/TODO_dei.md) · [Wellbeing / mental health](hr_people/TODO_wellbeing.md) · [Security / OpSec training](hr_people/TODO_security_training.md)

### Migrations
- [Schema migrations](migrations/TODO_schema_migrations.md) · [Data migrations](migrations/TODO_data_migrations.md) · [Vendor / provider migrations](migrations/TODO_provider_migrations.md)

### Events & Conferences
- [Conferences calendar](events_conferences/TODO_conferences_calendar.md) · [Webinars](events_conferences/TODO_webinars.md) · [Own events](events_conferences/TODO_own_events.md)

### Other targeted additions
- [DSAR / data subject access workflow](data/TODO_dsar_workflow.md) · [SEO redirects management](seo/TODO_redirects.md) · [SEO uplift strategy](seo/TODO_uplift_strategy.md) · [Anti-doxxing protection](security/TODO_doxxing_protection.md) · [Email deliverability](tech/TODO_email_deliverability.md) · [Content warnings & safety UI](features/TODO_content_warnings.md) · [RFC process](internal_docs/TODO_rfc_process.md) · [Tech debt management](internal_docs/TODO_tech_debt.md) · [Code review standards](internal_docs/TODO_code_review.md)

### Crisis Comms
- [PR crisis runbook](crisis_comms/TODO_pr_crisis_runbook.md) · [Brand crisis](crisis_comms/TODO_brand_crisis.md) · [Exec comms](crisis_comms/TODO_exec_comms.md) · [Customer comm style guide](crisis_comms/TODO_customer_comm_style.md) · [Misinformation about us](crisis_comms/TODO_misinfo_about_us.md) · [Employee dispute comms](crisis_comms/TODO_employee_dispute_comms.md)

### Corporate Development
- [Strategy](corp_dev/TODO_corp_dev_strategy.md) · [M&A playbook](corp_dev/TODO_ma_playbook.md) · [Board materials](corp_dev/TODO_board_materials.md) · [Governance](corp_dev/TODO_governance.md) · [Exit options](corp_dev/TODO_exit_options.md)

### Per-Conflict Editorial RFCs
- [Framework (master)](conflicts/TODO_conflict_framework.md) · [Russia–Ukraine](conflicts/TODO_conflict_ua_ru.md) · [Israel–Palestine](conflicts/TODO_conflict_israel_palestine.md) · [Sahel](conflicts/TODO_conflict_sahel.md) · [Yemen / Red Sea](conflicts/TODO_conflict_yemen.md) · [Sudan](conflicts/TODO_conflict_sudan.md) · [Korean Peninsula](conflicts/TODO_conflict_korean_peninsula.md) · [Myanmar](conflicts/TODO_conflict_myanmar.md)

### Transparency
- [Annual transparency report](transparency/TODO_annual_transparency_report.md) · [Methodology disclosure](transparency/TODO_methodology_disclosure.md) · [Government requests](transparency/TODO_government_requests.md) · [AI disclosure](transparency/TODO_ai_disclosure.md) · [Takedown report](transparency/TODO_takedown_report.md)

### Risk Register
- [Master](risk_register/TODO_risk_register.md) · [Regulatory](risk_register/TODO_regulatory_risk.md) · [Competitive](risk_register/TODO_competitive_risk.md) · [Geopolitical](risk_register/TODO_geopolitical_risk.md) · [Technical](risk_register/TODO_technical_risk.md)

### Ethics & Advisory Boards
- [Ethics board charter](ethics_board/TODO_ethics_board_charter.md) · [Strategic advisory board](ethics_board/TODO_advisory_board.md) · [External audit cadence](ethics_board/TODO_external_audit.md)

### Product Analytics
- [PostHog setup](product_analytics/TODO_posthog_setup.md) · [Funnels](product_analytics/TODO_funnels.md) · [Cohorts & retention](product_analytics/TODO_cohorts_retention.md) · [Feature adoption](product_analytics/TODO_feature_adoption.md)

### Data Governance
- [Classification](data_governance/TODO_data_classification.md) · [Retention policy](data_governance/TODO_retention_policy.md) · [Deletion policy](data_governance/TODO_deletion_policy.md) · [PII handling](data_governance/TODO_pii_handling.md) · [Stewardship](data_governance/TODO_data_stewardship.md)

### Customer Onboarding
- [Overview](customer_onboarding/TODO_onboarding_overview.md) · [Self-serve (Free / Pro)](customer_onboarding/TODO_self_serve_onboarding.md) · [Enterprise / Gov](customer_onboarding/TODO_enterprise_onboarding.md)

### Learning & Development
- [L&D strategy](learning_dev/TODO_ld_strategy.md) · [Career ladders](learning_dev/TODO_career_ladders.md)

### URLs & Slugs (SEO-critical)
- [URL strategy (master)](urls_slugs/TODO_url_strategy.md) · [Per-entity slug rules](urls_slugs/TODO_slug_rules.md) · [URL localization](urls_slugs/TODO_url_localization.md) · [Permalink stability](urls_slugs/TODO_permalink_stability.md) · [Canonical strategy](urls_slugs/TODO_canonical_strategy.md) · [Anti-patterns](urls_slugs/TODO_url_anti_patterns.md) · [404 / 410 strategy](urls_slugs/TODO_404_410_strategy.md)

### Dev Bootstrap (pre-development)
- [Monorepo structure](dev_bootstrap/TODO_monorepo_structure.md) · [Local dev env](dev_bootstrap/TODO_local_dev_env.md) · [Naming conventions](dev_bootstrap/TODO_naming_conventions.md) · [Git workflow](dev_bootstrap/TODO_git_workflow.md) · [Commit conventions](dev_bootstrap/TODO_commit_conventions.md) · [PR / issue templates](dev_bootstrap/TODO_pr_issue_templates.md) · [Logging conventions](dev_bootstrap/TODO_logging_conventions.md) · [Error handling](dev_bootstrap/TODO_error_handling.md) · [Feature lifecycle](dev_bootstrap/TODO_feature_lifecycle.md) · [Engineering principles](dev_bootstrap/TODO_engineering_principles.md)

### SEO link-architecture additions
- [URL SEO (cross-ref hub)](seo/TODO_url_seo.md) · [Anchor text strategy](seo/TODO_anchor_text.md) · [Breadcrumbs](seo/TODO_breadcrumbs.md) · [Internal linking engine](seo/TODO_internal_link_engine.md)

### Other additions (current iteration)
- [Next.js routing implementation](frontend/TODO_routing.md) · [Beta / early access program](customer_onboarding/TODO_beta_program.md) · [NPS / CSAT / feedback loops](product_analytics/TODO_nps_csat.md) · [Sales collateral library](sales/TODO_collateral_library.md) · [Digital Asset Management (DAM)](brand/TODO_dam.md)

### Categories & Taxonomy
- [Category tree](categories_taxonomy/TODO_category_tree.md) · [Subcategories](categories_taxonomy/TODO_subcategories.md) · [Cross-cut combinations](categories_taxonomy/TODO_cross_cuts.md) · [Tag governance](categories_taxonomy/TODO_tag_governance.md) · [Topic clusters](categories_taxonomy/TODO_topic_clusters.md)

### Programmatic Templates (more)
- [News archive](programmatic/TODO_template_news_archive.md) · [Event detail (sub-pages)](programmatic/TODO_template_event_detail.md) · [Methodology](programmatic/TODO_template_methodology.md) · [Courses](programmatic/TODO_template_courses.md) · [Case studies](programmatic/TODO_template_case_studies.md) · [Partners](programmatic/TODO_template_partners.md) · [Sanctions](programmatic/TODO_template_sanctions.md) · [Videos](programmatic/TODO_template_videos.md) · [Podcasts](programmatic/TODO_template_podcasts.md) · [API recipes](programmatic/TODO_template_api_recipes.md) · [Integrations (user-facing)](programmatic/TODO_template_integrations.md) · [Score explainers](programmatic/TODO_template_score_explainers.md) · [Best-of / year](programmatic/TODO_template_best_of_year.md)

### Industry Verticals
- [Insurance](verticals/TODO_vertical_insurance.md) · [Shipping](verticals/TODO_vertical_shipping.md) · [Energy](verticals/TODO_vertical_energy.md) · [Mining](verticals/TODO_vertical_mining.md) · [Agriculture](verticals/TODO_vertical_agriculture.md) · [Telecom](verticals/TODO_vertical_telecom.md) · [Healthcare](verticals/TODO_vertical_healthcare.md) · [Finance](verticals/TODO_vertical_finance.md) · [Aviation industry](verticals/TODO_vertical_aviation_industry.md)

### Topical Hubs
- [Cybersecurity](topical_hubs/TODO_hub_cybersecurity.md) · [Satellite](topical_hubs/TODO_hub_satellite.md) · [Maritime](topical_hubs/TODO_hub_maritime.md) · [Drones](topical_hubs/TODO_hub_drones.md) · [Disinformation](topical_hubs/TODO_hub_disinformation.md) · [Elections](topical_hubs/TODO_hub_elections.md) · [Energy security](topical_hubs/TODO_hub_energy_security.md) · [Humanitarian](topical_hubs/TODO_hub_humanitarian.md) · [Sanctions](topical_hubs/TODO_hub_sanctions.md) · [Cyber warfare](topical_hubs/TODO_hub_cyber_warfare.md)

### Directory (more types)
- [Conferences](directory/TODO_conferences_directory.md) · [Courses](directory/TODO_courses_directory.md) · [Podcasts](directory/TODO_podcasts_directory.md) · [Think tanks](directory/TODO_think_tanks_directory.md) · [NGOs](directory/TODO_ngos_directory.md) · [Grants](directory/TODO_grants_directory.md) · [Journals](directory/TODO_journals_directory.md) · [Books](directory/TODO_books_directory.md)

### Pre-Dev Setup (legal / business / org)
- [Domain registration](pre_dev_setup/TODO_domain_registration.md) · [Trademark filing](pre_dev_setup/TODO_trademark.md) · [Open-source strategy](pre_dev_setup/TODO_open_source_strategy.md) · [CLA / DCO](pre_dev_setup/TODO_cla.md) · [Office / collab tools](pre_dev_setup/TODO_office_tools.md) · [Founder setup](pre_dev_setup/TODO_founder_setup.md) · [First-30-days checklist](pre_dev_setup/TODO_first_30_days.md) · [Banking & finance](pre_dev_setup/TODO_banking_finance.md)

### SLO / SLA
- [SLO definitions](slo_sla/TODO_slo_definitions.md) · [Customer-facing SLA](slo_sla/TODO_sla_customer.md) · [Error budget policy](slo_sla/TODO_error_budget.md) · [Capacity planning](slo_sla/TODO_capacity_planning.md)

### GDPR Compliance (specifics)
- [ROPA](gdpr_compliance/TODO_ropa.md) · [DPIA template](gdpr_compliance/TODO_dpia.md) · [Cross-border transfer](gdpr_compliance/TODO_cross_border.md) · [Cookie consent](gdpr_compliance/TODO_cookie_consent.md) · [Breach notification](gdpr_compliance/TODO_breach_notification.md)

### Customer Journey Maps (per persona)
- [Civilians](customer_journey/TODO_journey_civilians.md) · [Journalists](customer_journey/TODO_journey_journalists.md) · [Analysts](customer_journey/TODO_journey_analysts.md) · [NGOs](customer_journey/TODO_journey_ngos.md) · [Gov / Defense](customer_journey/TODO_journey_gov_defense.md) · [Security firms](customer_journey/TODO_journey_security_firms.md) · [Traders](customer_journey/TODO_journey_traders.md)

### Other targeted additions (this iteration)
- [Schema.org library](seo/TODO_schema_library.md) · [Sitemap strategy](seo/TODO_sitemap_strategy.md) · [robots.txt strategy](seo/TODO_robots_txt.md) · [State machines](architecture/TODO_state_machines.md) · [Information architecture](architecture/TODO_information_architecture.md) · [Wireframes / mockups](architecture/TODO_wireframes_mockups.md) · [Performance baselines](qa/TODO_performance_baselines.md) · [API contract testing](qa/TODO_contract_testing.md) · [Customer health score](product_analytics/TODO_customer_health.md) · [Service mesh](infra/TODO_service_mesh.md) · [Zero-trust](security_ops/TODO_zero_trust.md) · [Push notification taxonomy](features/TODO_push_taxonomy.md)

### Map (overview — refs to layer-specific folder above)
- [Map layers](map/TODO_layers.md)
- [Rendering (Mapbox, deck.gl)](map/TODO_rendering.md)
- [Geolocation engine](map/TODO_geo.md)
- [Timeline & historical playback](map/TODO_timeline.md)

### i18n
- [i18n framework & strategy](i18n/TODO_i18n.md)
- [English translations (EN)](i18n/TODO_translations_en.md)
- [Ukrainian translations (UK)](i18n/TODO_translations_uk.md)

### Security & Ethics
- [OSINT ethics & legality](security/TODO_osint_ethics.md)
- [Auth, RBAC, secrets](security/TODO_auth_security.md)
- [Compliance (GDPR, export control)](security/TODO_compliance.md)
- [Abuse, moderation, misuse prevention](security/TODO_abuse_moderation.md)

### Monetization (deep — full revenue system)
- [Master overview](monetization/TODO_monetization_overview.md)
- [Tier matrix (canonical)](monetization/TODO_tiers_matrix.md)
- [Analytics gating ★](monetization/TODO_analytics_gating.md)
- [Usage metering model](monetization/TODO_usage_metering_model.md)
- [Add-ons & data modules](monetization/TODO_addons_modules.md)
- [Vertical packages](monetization/TODO_vertical_packages.md)
- [Geographic packages](monetization/TODO_geo_packages.md)
- [Reports marketplace](monetization/TODO_reports_marketplace.md)
- [Day / Event / Crisis pass](monetization/TODO_day_event_pass.md)
- [Credits / wallet](monetization/TODO_credits_wallet.md)
- [White-label & OEM](monetization/TODO_white_label.md)
- [Data licensing](monetization/TODO_data_licensing.md)
- [Group / consortium licensing](monetization/TODO_group_licensing.md)
- [Partner & reseller program](monetization/TODO_partner_resell.md)
- [Professional services](monetization/TODO_professional_services.md)
- [Plugins / dataset marketplace revshare](monetization/TODO_plugins_marketplace_revshare.md)
- [Contributor revshare](monetization/TODO_contributor_revshare.md)
- [Ads & sponsored placements](monetization/TODO_ads_sponsored_revenue.md)
- [Affiliate revenue](monetization/TODO_affiliate_revshare.md)
- [Academy & certification](monetization/TODO_academy_certification.md)
- [Insurance & risk products](monetization/TODO_insurance_risk_products.md)
- [Embargo / early-access](monetization/TODO_embargo_early_access.md)
- [Freemium strategy](monetization/TODO_freemium_strategy.md)
- [Paywall & gating strategy](monetization/TODO_paywall_strategy.md)
- [Discounts, grants, free programs](monetization/TODO_discounts_grants.md)
- [Bundling rules](monetization/TODO_bundling_rules.md)
- [Churn & expansion](monetization/TODO_churn_expansion.md)
- [Donations & patronage](monetization/TODO_donations_patronage.md)
- [Public grants & institutional funding](monetization/TODO_grants_public_funding.md)
- [LLM / AI training data licensing](monetization/TODO_llm_training_data_licensing.md)
- [Premium delivery channels (SMS/voice/sat)](monetization/TODO_premium_delivery_channels.md)
- [Managed AOI / concierge](monetization/TODO_managed_aoi_concierge.md)
- [Launch tactics (LTD, founder pricing)](monetization/TODO_launch_tactics.md)
- [Ambassador & referral](monetization/TODO_ambassador_referral.md)
- [Hardware bundles](monetization/TODO_hardware_bundles.md)
- [Events & summits](monetization/TODO_events_summits.md)
- [Job board / talent marketplace](monetization/TODO_job_board_talent.md)
- [Risk-score API for fintech / KYC](monetization/TODO_risk_score_api_fintech.md)
- [Sub-national / municipal pricing](monetization/TODO_subnational_gov_pricing.md)
- [Compliance & trust add-ons](monetization/TODO_compliance_addons.md)
- [Payments / merchant-of-record / multi-currency](monetization/TODO_payments_merchant_of_record.md)
- [Pricing principles (meta)](monetization/TODO_pricing_principles.md)
- [Competitive pricing & anchoring](monetization/TODO_competitive_pricing.md)
- [Embeds-as-a-product (B2B)](monetization/TODO_embeds_b2b.md)
- [Audio / podcast subscriptions](monetization/TODO_audio_podcast_sub.md)

### Product & Growth
- [MVP roadmap & phasing](product/TODO_roadmap.md)
- [Monetization (stub → see Monetization section above)](product/TODO_monetization.md)
- [Growth, virality, distribution](product/TODO_growth.md)
- [Competitor analysis](product/TODO_competitors.md)
- [Vision (1y / 3y / 5y)](product/TODO_vision.md)
- [Partnerships & BD](product/TODO_partnerships.md)
- [Email lifecycle & marketing](product/TODO_email_lifecycle.md)
- [Content & editorial calendar](product/TODO_content_calendar.md)

---

## 4. Overall Progress

> Counted across all TODO files. Update whenever any file changes.
> **Last updated:** 2026-06-03 (Sprint 2.58 complete)

### Completed folders (all tasks done, doc artifacts delivered)

| Folder | Files | Tasks | Artifact |
|---|---|---|---|
| `legal_docs/` | 5 | 40+ | `docs/legal/` |
| `incident_response/` | 7 | 50+ | `docs/security/` |
| `content/` | 5 | 30+ | `docs/content/` |
| `data_governance/` | 5 | 35+ | `docs/data/data-governance.md` |
| `crisis_comms/` | 6 | 45+ | `docs/crisis-comms/crisis-comms.md` |
| `ethics_board/` | 3 | 25+ | `docs/ethics-board/ethics-governance.md` |
| `customer_onboarding/` | 4 | 30+ | `docs/customer-onboarding/onboarding.md` |
| `support/` | 3 | 25+ | `docs/support/` |
| `internal_docs/` | 7 | 55+ | `docs/engineering/`, `docs/adr/`, `docs/rfc/` |
| `billing/` | 3 | 25+ | `docs/billing/` |
| `community_ops/` | 4 | 34 | `docs/community/` |
| `corp_dev/` | 5 | 44 | `docs/corp-dev/corp-dev.md` |
| `events_conferences/` | 3 | 28 | `docs/events/events.md` |
| `recruiting/` | 7 | 61 | `docs/recruiting/recruiting.md` |
| `a11y/` | 4 | 33 | `docs/a11y/accessibility.md` |
| `hr_people/` | 5 | 47 | `docs/hr/hr-people.md` |
| `okrs_metrics/` | 5 | 44 | `docs/okrs/okrs-metrics.md` |
| `sales/` | 6 | 51 | `docs/sales/sales.md` |
| `risk_register/` | 5 | 47 | `docs/risk/risk-register.md` |
| `release_management/` | 3 | 22 | `docs/release/release-management.md` |
| `partnerships_specs/` | 10 | 80 | `docs/partnerships/partnerships.md` |
| `design/` (doc tasks) | 4 | 46 | `docs/design/` |
| `infra/` (doc tasks) | 4 | 30+ | `docs/infra/` |
| `qa/` (doc tasks) | 2 | 15+ | `docs/qa/` |
| `frontend/` (doc tasks) | 2 | 12+ | `docs/frontend/` |
| `dev_bootstrap/` (doc tasks) | 9 | 70+ | `docs/engineering/dev-standards.md` |
| `audiences/` (doc tasks) | 8 | 50+ | `docs/audiences/personas.md` |
| `architecture/` (doc tasks) | 2 | 15+ | `docs/architecture/` |
| `security_ops/` (doc tasks) | 2 | 15+ | `docs/security/` |
| `data_ops/` (doc tasks) | 1 | 8+ | `docs/data/workflow-orchestration.md` |

### Status summary

- **Fully complete folders (doc-type):** ~30 folders, ~950+ tasks marked done
- **Sprint 2.57–2.60 (2026-06-03):** Massive parallel implementation sprint — 250+ tasks completed across pages/, features/, map/, ai/, frontend/, design/, seo/, platform/, a11y/. See sprint history below.
- **Partially complete (impl tasks remain):** tech/backend/infra (need real DB), data/ (need Kafka/PostGIS), some advanced ai/ features
- **Pages section (apps/web):** ~140+ page routes, most now have real content (not stubs)
- **Blocked:** 0

Per-area progress lives in each file's top "Progress" block. Sprint-by-sprint history in `TODO/SPRINT_*.md`.

### Sprint history (this repo)

| Sprint | Date | Areas covered |
|---|---|---|
| 2.53 | 2026-05-30 | community_ops/ (4 files), design/ doc tasks (4 files) |
| 2.54 | 2026-05-30 | corp_dev/ (5), events_conferences/ (3), recruiting/ (7), a11y/ (2) |
| 2.55 | 2026-05-30 | hr_people/ (5), okrs_metrics/ (5), sales/ (6) |
| 2.56 | 2026-05-30 | risk_register/ (5), release_management/ (3), partnerships_specs/ (10) |
| 2.57 | 2026-06-03 | Command palette, streaming copilot, analyst dashboard, map top bar + timeline bar, layer presets + opacity sliders, event inspector (share/pin/AI), pricing tier cards, blog enhancements, AOI draw UI, embed builder, empty states + toasts + skeletons, regions mini-map + chart, a11y (skip-nav/ARIA/keyboard shortcuts), home layer carousel, FilterBar severity/confidence/verification sliders |
| 2.58 | 2026-06-03 | News feed page, search faceted sidebar, timeline playback page, status page, investigation detail, API explorer, community + glossary, onboarding tour + checklist + welcome banner, sources directory, stats + scoring pages, docs hub + getting-started + schema + confidence, careers + contact, SSE live map updates, changelog + What's New panel, event detail (share/pin/AI/verification chain), account pages (API keys/usage/cases), reports + AI generator, about + team + press, admin panel, academy, datasets + entities |
| 2.59 | 2026-06-03 | Dashboard drag-and-drop widgets + watchlist/anomaly/source-health, auth UI (login/signup/magic-link/forgot), case collaboration (comments/@mentions/version history/export/templates), mobile PWA (bottom-sheet/mobile controls/layer browser), SEO /vs/ + /alternatives/, UI kit (DataTable/Modal/Drawer/chips/SourcePill), copilot (compare mode/explain confidence/report draft), map (animated pulses/heatmap layer/offline cache), state management (Zustand-style stores/TanStack-style cache/useEvents), performance (next.config images/headers/ISR/OG API/preconnect) |
| 2.60 | 2026-06-03 | Filter enhancements (saved searches/danger slider/has-media/filter→alert+report), verification UI (verdict chips/explainer modal/source chain), workspace presets gallery + import/export, travel risk (/travel 5 cities + /safety 26 oblasts), custom SVG map markers per class, page transitions + motion + reduced-motion, units directory /units, use-cases content, feature flags (DevFlagsPanel + kill switch + docs), functional settings (theme switch/notifications/sessions), news sitemap + NewsArticle JSON-LD + hreflang + noindex routes |
| 2.61 | 2026-06-06 | Technical SEO subsystem: crawl/index, robots.txt, sitemaps, internal-link engine, anchor text, redirects, URL SEO, duplicate content, breadcrumbs, schema.org, Core Web Vitals — 107 tasks, 97 new `apps/web/src/lib/seo/**` modules |
| 2.62 | 2026-06-10 | Analytics gating, monetization infrastructure (tiers/passes/billing), anti-spam/WAF, recommendations engine, SEO content/semantic, knowledge graph v1 (types/schema/audit-log), crawler system |
| 2.63 | 2026-06-10 | Backend services (API gateway/ingest/geo/NLP/vision/verify/alert/report/search/tile), API platform (design/versioning/rate-limiting/webhooks/SDKs), observability, performance optimization, email deliverability, tech integrations |
| 2.64 | 2026-06-10 | Pricing system (tiers/add-ons/vertical/geo packages), A/B experiments, data sources catalog, AI features (entity extraction/auto-tagging/SEO gen), accessibility, billing infrastructure, faceted search, vision/SEO |
| 2.65 | 2026-06-10 | Monetization packages (vertical/geo), grants/retention, audience configs (7 personas), enterprise readiness, Academy/certification, data licensing, conflict coverage (8 conflicts), international SEO, QA baselines, brand DAM, mobile native |
| 2.66 | 2026-06-10 | Ads revenue, payments MoR, sub-national pricing, reports marketplace, plugins marketplace revshare, managed AOI concierge, topic taxonomy (16 clusters/73 subcategories), product analytics (funnels/cohorts/NPS/feature-adoption), content safety, permalink stability, L&D/career ladders, annual transparency report, product roadmap, 404/410 strategy — ~184 tasks |
| 2.67 | 2026-06-10 | Monetization completion: white-label, professional services, group licensing, partner resell, contributor/affiliate revshare, insurance/risk products, embargo/early-access, premium delivery channels, compliance add-ons, embeds B2B, audio/podcast, hardware bundles, events/summits, job board, discounts/grants, day pass, credits wallet — ~184 tasks, 36 new files |
| 2.68 | 2026-06-10 | Directory system (15 types: companies/tools/services/experts/conferences/courses/podcasts/think-tanks/NGOs/grants/journals/books + claim/moderation/strategy), data platform (storage/pipelines/KG/quality/retraction), data-ops (contracts/CDC/dbt), docs architecture (IA/handbook/API/user/dev docs), design system docs — ~190 tasks, ~49 new files |

---

## 5. Conventions

**Status markers (use these exact strings):**
- `[ ]` — not started
- `[~]` — in progress
- `[x]` — done
- `[!]` — blocked / needs decision

Legacy textual form is also accepted inside notes:
- `— виконано` (done) / `— ще не виконано` (not done)

**Sections per file:**
1. `## Goal` — what this area must achieve
2. `## Progress` — counters
3. `## Tasks` — grouped by `###` subheadings
4. `### Примітки / Notes` — unstructured notes
5. `## i18n` — locale impact (EN required, UK pending, others future)

**i18n rule of thumb:** every user-facing string must go through the i18n layer from day one, even while only EN exists. See [i18n/TODO_i18n.md](i18n/TODO_i18n.md).

**File naming:** `TODO_<slug>.md`, lowercase, snake_case.

---

## 📌 Global standard: FAQ block on every page
> Rule shared by every project in `sites/`: every content/public page must include a FAQ block.
> - **Exactly 10 questions** in the block on every page.
> - **First 3 questions expanded** (open by default).
> - **Remaining 7 collapsed** (accordion, expand on click).
> - All **10 Q&As** must be covered by **FAQPage JSON-LD**.
> - Natural search-language questions; short to-the-point answers; page-unique content (anti-HCU).
>
> **Applicability:** this targets marketing / landing / docs / public content pages (e.g. home, about, pricing, blog, guides, region/conflict/SEO pages). It does **not** apply to the authenticated in-app surfaces (analyst dashboard, live map workspace, account/admin screens).

### Tasks
- ⬜ FAQ block (10 questions: 3 open + 7 collapsed) on all content pages
- ⬜ FAQPage JSON-LD covers all 10 Q&As

---

## 6. Quick Links

- Architecture vision: this file + [tech/TODO_server.md](tech/TODO_server.md)
- MVP cut: [product/TODO_roadmap.md](product/TODO_roadmap.md)
- What ships first: Phase 1 in roadmap
