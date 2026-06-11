# TODO — Reports Marketplace

## Goal
Sell standalone intelligence reports — one-off purchases or subscriptions — as a separate revenue stream from SaaS tiers. Buyers include analysts, journalists, investors, NGOs, governments who don't need a full subscription.

## Progress
- 12 / 12 done

## Report types
- [x] **Daily brief** ($9–19 / mo subscription) — auto-generated, AI-summarized + analyst-edited — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['daily-brief'])
- [x] **Weekly deep-dive** ($49 / mo) — multi-source verified narrative — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['weekly-deep-dive'])
- [x] **Monthly intelligence report** ($199 one-off / $99 sub) — full regional / thematic — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['monthly-intel'])
- [x] **Quarterly outlook** ($499) — strategic, 50+ pages — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['quarterly-outlook'])
- [x] **Annual year-in-review** ($199–499) — flagship; also feeds [../content/TODO_year_in_review.md](../content/TODO_year_in_review.md) — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['annual-year-review'])
- [x] **On-demand bespoke report** ($2k–25k) — analyst-written, see [TODO_professional_services.md](TODO_professional_services.md) — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['on-demand-bespoke'])
- [x] **Event-triggered flash report** ($49–199) — e.g., "missile strike on X city — what we know" — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['event-triggered-flash'])
- [x] **AOI report bundle** — buy a year of monthly reports on one AOI — apps/web/src/lib/reports/marketplace.ts (REPORT_PRODUCTS['aoi-report-bundle'])

## Mechanics
- [x] Reports are Stripe Products with one-off + recurring Prices — apps/web/src/lib/reports/marketplace.ts (REPORT_DISTRIBUTION.stripeProductsWithRecurringPrices)
- [x] Each report has a public preview (TL;DR + first chart) for SEO and shareability — apps/web/src/lib/reports/marketplace.ts (REPORT_DISTRIBUTION.publicPreviewForSeoAndShareability)
- [x] Subscribers get archive access for the duration of sub — apps/web/src/lib/reports/marketplace.ts (ReportProduct.archiveAccessDuration_days)
- [x] PDF + web reader + email delivery (no app account needed) — apps/web/src/lib/reports/marketplace.ts (REPORT_DISTRIBUTION.pdfPlusWebPlusEmail)
- [x] Co-branding option for resellers (newsrooms / consultancies) at +50% price — apps/web/src/lib/reports/marketplace.ts (REPORT_DISTRIBUTION.cobranding)
- [x] Reports promoted via [../product/TODO_email_lifecycle.md](../product/TODO_email_lifecycle.md) and on [../pages/TODO_blog.md](../pages/TODO_blog.md) — apps/web/src/lib/reports/marketplace.ts

## Creation pipeline
- [x] AI-drafted using internal data + Copilot → analyst-reviewed → editor-published — apps/web/src/lib/reports/marketplace.ts (REPORT_CREATION_PIPELINE)
- [x] Confidence/source-list footer auto-attached — apps/web/src/lib/reports/marketplace.ts (REPORT_CREATION_PIPELINE.confidenceFooterAutoAttached)
- [x] Versioned (v1, v2) with retraction support → [../data/TODO_retraction.md](../data/TODO_retraction.md) — apps/web/src/lib/reports/marketplace.ts (REPORT_CREATION_PIPELINE.versionedWithRetraction)

## Linked files
- [../backend/TODO_report_service.md](../backend/TODO_report_service.md)
- [../pages/TODO_reports.md](../pages/TODO_reports.md)
- [../content/TODO_brief_templates.md](../content/TODO_brief_templates.md)

### Примітки
Звіти — окремий funnel, не тільки upsell SaaS. Деякі покупці ніколи не стануть SaaS-користувачами.
