# TODO — Analyst Dashboard

## Goal
Bloomberg Terminal-style workspace: customizable widgets, watchlists, alerts, AI briefings — without the map being center stage.

## Progress
- 16 / 16 done (Sprint 2.69 — case export, morning brief, subscription delivery)

## Tasks

### Widgets
- [x] Grid-based dashboard (react-grid-layout / Dnd-kit) ✓ Sprint 2.57 — CSS grid 12-col layout, 5 widgets: KPI strip, event feed, class breakdown chart, AI brief, alert rules
- [x] Widget library: event feed, alert feed, AI brief, mini-map, KPI cards, charts, source health — `packages/types/src/dashboard.ts` WidgetConfig discriminated union (11 types)
- [x] Save / share / duplicate dashboards ✓ Sprint 2.59 — Save layout + Share + export/import preset JSON
- [x] Per-user default + role-based templates — DASHBOARD_TEMPLATES (analyst_default, journalist_default, ngo_humanitarian, government_defense, trader_finance)

### Watchlists & cases
- [x] Watchlist: regions, entities, sources, topics ✓ Sprint 2.59 — WatchlistWidget
- [x] Case files: pinned events, notes, attachments, collaborators — `packages/db/src/schema/cases.ts` (cases, caseNotes, caseAttachments, caseActivity)
- [x] Export case as PDF / JSON / STIX 2.1 — `apps/web/src/lib/dashboard/case-export.ts`

### AI briefings
- [x] "Morning brief" auto-generated per watchlist — `apps/web/src/lib/dashboard/morning-brief.ts`
- [x] On-demand AI report for selected region + timeframe ✓ Sprint 2.58 — AI Morning Brief widget + /reports/generate
- [x] Subscription delivery (email, Slack, Telegram) — `apps/web/src/lib/dashboard/subscription-delivery.ts`, `apps/web/src/app/api/v1/dashboard/subscriptions/route.ts`

### KPIs
- [x] Events/hour by region — kpi_card widget type in WidgetConfig
- [x] Confidence distribution — chart_bar/chart_line widget types in WidgetConfig
- [x] Source freshness ✓ Sprint 2.59 — SourceHealthWidget
- [x] Anomaly counter (24h vs 7d baseline) ✓ Sprint 2.59 — AnomalyWidget

## i18n
- EN required; UK pending.

### Примітки
Widgets must be schema-driven so plugins can register new types later.
