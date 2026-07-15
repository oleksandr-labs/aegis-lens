# TODO — Public No-Code Data Explorer

## Goal
A lightweight, public-tier "explore the data" surface: drag-and-drop filter → chart → embed, gated to a subset of open data — distinct from the full Analyst Dashboard (`pages/TODO_dashboard.md`, paid/pro) and the raw programmatic API (`features/TODO_export_api.md`). Meaningful differentiation vs. Palantir/LiveUAmap positioning and a strong content-marketing/backlink magnet (users embed charts they build themselves).

## Progress
- 0 / 6 done

## URLs
- `/explore` (query-builder UI) · `/explore/<saved-view-slug>` (shareable permalink to a built view)

## Tasks
- [ ] `/explore` UI: pick dataset (open-data subset only — see `pages/TODO_datasets.md` for what's public), pick dimensions/filters, pick chart type (bar/line/map/table), live preview
- [ ] Shareable permalink generation for a built view (`/explore/<slug>`) — SSR-rendered for SEO + social preview image
- [ ] "Get embed code" action → hands off into `pages/TODO_widget_gallery.md` embed pipeline
- [ ] Rate-limit / usage tier gating (free: limited datasets + refresh rate; reuse `platform/TODO_feature_flags.md` + `monetization/TODO_usage_metering_model.md`)
- [ ] Data model: reuse existing open-data query layer from `features/TODO_export_api.md` (GraphQL) — do not build a second data-access path
- [ ] FAQPage JSON-LD on `/explore` landing (10 Q&A); saved-view pages get lighter per-view metadata only (avoid duplicate-content — see `seo/TODO_duplicate_content.md`)

## Notes
- Higher effort than most content-gap items in this pass — a real product surface, not a doc page. Sequence after `features/TODO_export_api.md` GraphQL layer is stable; this is a UI layer on top of it, not new backend work.
- Distinct from the in-app Analyst Dashboard: no login required for basic use, deliberately simplified (fewer dimensions, no AI copilot, no case-file integration).

## i18n
- UI chrome only needs standard i18n; underlying data labels reuse existing taxonomy translations.
