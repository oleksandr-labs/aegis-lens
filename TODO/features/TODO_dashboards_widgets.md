# TODO — Custom Dashboards & Widgets

## Goal
Bloomberg Terminal-style customizable workspaces. Each persona builds their own.

## Progress
- 21 / 22 done (Sprint 2.59 + 2.69 — all done; Marketplace of community dashboards is Phase 2)

## Tasks

### Engine
- [x] Grid-layout engine (react-grid-layout) with drag, resize, snap ✓ Sprint 2.59 — DraggableGrid (HTML5 drag API, localStorage order)
- [x] Per-widget config schema (typed) — `apps/web/src/lib/widgets/config-schema.ts`
- [x] Per-widget data binding (filters + sources from current org) — `apps/web/src/lib/widgets/data-binding.ts`
- [x] Cross-widget linking (click in widget A → filters widget B) — `apps/web/src/lib/widgets/cross-link.ts`
- [x] Auto-refresh per widget (interval or push) — `apps/web/src/lib/widgets/auto-refresh.ts`

### Widget library
- [x] Event feed ✓ Sprint 2.59
- [x] Mini-map ✓ Sprint 1.1
- [x] Heatmap — `apps/web/src/lib/widgets/heatmap-widget.ts`
- [x] Time-series chart — `apps/web/src/lib/widgets/timeseries-widget.ts`
- [x] Severity gauge — `apps/web/src/lib/widgets/severity-gauge.ts`
- [x] Source-health card ✓ Sprint 2.59 — SourceHealthWidget
- [x] AI brief card ✓ Sprint 2.59
- [x] Alert feed ✓ Sprint 2.59
- [x] Watchlist card ✓ Sprint 2.59 — WatchlistWidget
- [x] KPI / counter ✓ Sprint 2.59
- [x] Sankey / flow — `apps/web/src/lib/widgets/sankey-widget.ts`
- [x] Anomaly card ✓ Sprint 2.59 — AnomalyWidget

### Sharing & templates
- [x] Save dashboard — `apps/web/src/lib/dashboard/save.ts`
- [x] Share with org (read / edit perms) — `apps/web/src/lib/dashboard/share.ts`
- [x] Public read-only link (signed) — `apps/web/src/lib/dashboard/share.ts`
- [x] Per-persona dashboard templates (seeded on signup) — `apps/web/src/lib/dashboard/persona-templates.ts`
- [ ] Marketplace of community dashboards (Phase 2)

## i18n
- Widget titles, descriptions, units fully localized.

### Примітки
Widget SDK so partners can register new types — see [TODO_plugins_marketplace.md](TODO_plugins_marketplace.md).
