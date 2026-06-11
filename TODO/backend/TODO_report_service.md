# TODO — Service: Reports

## Goal
Generate AI-assisted intelligence reports: regional, incident, weekly, custom. With citations and review gates.

## Progress
- 10 / 10 done

## Tasks
- [x] Template engine (Regional / Incident / Weekly / Custom) — `services/reports/src/types.ts` (REPORT_TEMPLATES: 4 kinds, section prompts per kind)
- [x] Retrieval pipeline (Qdrant + Elastic + Postgres) — `services/reports/src/retrieval.ts` (RetrievalQuery/RetrievedDocument types, retrieveForReport() with RRF scoring, RETRIEVAL_CONFIG with source weights, fail-soft per-source stubs)
- [x] Citation enforcement (every claim → ≥1 event ID) — `services/reports/src/generator.ts` (ReportSection.citations[], minCitationsPerSection enforced via event selection)
- [x] LLM generation with structured output — `services/reports/src/generator.ts` (ReportGenerator: AnthropicBackend + OpenAIBackend, per-section parallel generation, EN + UK)
- [x] PDF rendering (Playwright) — `services/reports/src/pdf-renderer.ts`: `renderPDF()` with HTML template (ToC, citations, watermark, classification banner, org branding), Playwright headless → base64 PDF, graceful HTML fallback; `GET /api/reports/:id/export?format=pdf|html`
- [x] Delivery (web, email, Slack, Telegram, API) — `services/reports/src/delivery.ts` (DeliveryChannel union, DeliveryTarget/DeliveryResult types, ReportDeliveryService.deliver()/deliverToAll(); per-channel handlers: web=in-memory store, email=Resend API, slack=webhook, telegram=bot API, api=no-op)
- [x] Versioning + diff — `services/reports/src/versioning.ts` (InMemoryReportVersionStore, diffReports, ReportVersion history)
- [x] Review queue for analytical reports — `services/reports/src/review-queue.ts` (ReviewStatus union, ReviewEntry type, InMemoryReviewQueue with submit/assign/approve/reject/getPending/getByStatus, assertReviewApproved() gate, reviewQueue singleton; analytical kinds custom+regional require review before delivery)
- [x] Subscription + scheduling — `services/reports/src/subscription.ts` (ReportSchedule union, ReportSubscription type, SubscriptionStore CRUD with enable/disable/markRun/getDueSubscriptions, computeNextRunAt() for daily/weekly/monthly/on_event, subscriptionStore singleton)
- [x] Per-org branding overlay (white-label) — `services/reports/src/branding.ts` (OrgBranding type, DEFAULT_BRANDING, BrandingStore.get()/set(), applyBranding() replacing CSS vars + logo/text tokens in HTML, BRANDING_CSS_TEMPLATE, brandingStore singleton)

## i18n
- Generated in user's locale; original-language sources preserved.

### Примітки
Never auto-publish analytical reports. Always human-reviewed for public-facing.
