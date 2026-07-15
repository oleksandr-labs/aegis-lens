# TODO — Public Widget Gallery

## Goal
A public, unauthenticated marketing/SEO page showcasing embeddable widgets (map, ticker, region-brief, KPI, heatmap) with live previews and one-click "get embed code" — distinct from the in-dashboard embed-builder wizard (`features/TODO_embeds_widgets.md`, requires login).

## Progress
- 0 / 4 done

## URLs
- `/widgets` (gallery index) · `/widgets/<widget-type-slug>` (per-widget demo + docs)

## Tasks
- [ ] `/widgets` index: live-preview cards per widget type (map/ticker/event-card/timeline/heatmap/region-brief/KPI)
- [ ] `/widgets/<type>` page: interactive config demo (theme/size/region params) + generated embed snippet, sample use cases, backlink-worthy for newsrooms/blogs
- [ ] Cross-link to `monetization/TODO_embeds_b2b.md` (paid tiers/usage limits) and `docs/TODO_api_docs.md`
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- This is the public discovery surface that should exist upstream of the authenticated embed-builder — without it, embeds are undiscoverable to non-customers (a backlink/growth-loop gap).

## i18n
- EN primary; widget UI chrome should respect `platform/TODO_localization_workflow.md`.
