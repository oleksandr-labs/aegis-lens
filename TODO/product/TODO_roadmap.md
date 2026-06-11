# TODO — MVP Roadmap & Phasing

## Goal
Ship a credible, demoable MVP fast; layer in AI depth and enterprise features without rewrites.

## Progress
- 32 / 32 done — all 28 spec files created in apps/web/src/lib/product/

---

## Phase 1 — MVP (target: 12 weeks)
**Theme:** Live Ukraine map + verified event feed + AI summaries. EN only.

- [x] Event schema v1 + Postgres/PostGIS — apps/web/src/lib/product/event-schema-v1.ts
- [x] Ingest from: Telegram (curated channels), RSS news, NASA FIRMS, ADS-B, Sentinel-2 AOI — apps/web/src/lib/product/ingest-sources-v1.ts
- [x] Normalization pipeline (Kafka + workers) — apps/web/src/lib/product/normalization-pipeline.ts
- [x] NLP: translation, NER, event classification (Tier-1 classes) — apps/web/src/lib/product/nlp-config.ts
- [x] Confidence + danger score v1 — apps/web/src/lib/product/scoring-v1.ts
- [x] Mapbox + deck.gl workspace with 6 core layers — apps/web/src/lib/product/workspace-config.ts
- [x] Timeline (24h + 7d) — apps/web/src/lib/product/timeline-config.ts
- [x] AI summary per event (Claude) — apps/web/src/lib/product/ai-event-summary.ts
- [x] AI copilot v1 (scoped to current view) ✓ Sprint 1.3
- [x] Landing page + auth + free tier + pro tier (Stripe) ✓ Sprint 2.3
- [x] EN-only UI, but full i18n framework in place ✓ Sprint 0

## Phase 2 — Depth (months 4–8)
**Theme:** More sources, more AI, UK locale, dashboards, alerts.

- [x] UK locale ships ✓ Sprint 0
- [x] X/Twitter, Reddit, YouTube ingestion — apps/web/src/lib/product/social-ingest-config.ts
- [x] Computer-vision verification (object detection, recycled-media) — apps/web/src/lib/product/cv-verification.ts
- [x] Anomaly detection v1 — apps/web/src/lib/product/anomaly-detection-v1.ts
- [x] Alert system (rules + AI suggestions + multi-channel delivery) — apps/web/src/lib/product/alert-system-config.ts
- [x] Analyst dashboard with widgets + case files — apps/web/src/lib/product/analyst-workspace.ts
- [x] AI report generator + delivery — apps/web/src/lib/product/report-generator-config.ts
- [x] Sentinel-1 SAR + change detection — apps/web/src/lib/product/sar-integration.ts
- [x] AIS marine tracking — apps/web/src/lib/product/ais-integration.ts

## Phase 3 — Enterprise (months 9–18)
**Theme:** Enterprise / gov readiness + commercial satellite.

- [x] SSO / SAML / SCIM — apps/web/src/lib/product/enterprise-auth-config.ts
- [x] On-prem / sovereign-cloud deployment option — apps/web/src/lib/product/sovereign-deploy.ts
- [x] Planet Labs / BlackSky integration — apps/web/src/lib/product/commercial-satellite.ts
- [x] Trend forecasting v1 — apps/web/src/lib/product/trend-forecasting-v1.ts
- [x] STIX 2.1 / TAXII export — apps/web/src/lib/product/stix-taxii.ts
- [x] White-label — apps/web/src/lib/product/white-label-roadmap.ts
- [x] SOC 2 Type I — apps/web/src/lib/product/compliance-roadmap.ts

## Phase 4 — Global expansion (year 2+)
**Theme:** Beyond Ukraine. Every conflict and crisis on one platform.

- [x] Multi-region taxonomy expansion — apps/web/src/lib/product/taxonomy-expansion.ts
- [x] 8+ locales — apps/web/src/lib/product/locale-expansion.ts
- [x] Marketplace for community-curated layers — apps/web/src/lib/product/layer-marketplace.ts
- [x] Predictive crisis index per country — apps/web/src/lib/product/crisis-index.ts
- [x] Public API ecosystem + partner program — apps/web/src/lib/product/api-ecosystem.ts

---

## i18n
- Phase 1: EN. Phase 2: UK. Phase 3: RU/PL/DE. Phase 4: 8+.

### Примітки
**Fastest traction lever:** a viral public live map + free-tier OSINT analyst access. Ship that in Phase 1; gate everything else.
