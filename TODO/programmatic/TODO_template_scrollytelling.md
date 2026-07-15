# Programmatic Template — Scrollytelling / Interactive Data-Explainer Article

## Goal
Scroll-triggered, map/chart-driven long-form editorial format (e.g. "How the front line moved in 2025") — the single content format most associated with the Bellingcat/NYT/Reuters Graphics tier of authority that TODO_MAIN §1 explicitly names as a positioning benchmark ("Bellingcat-grade verification"), and currently absent as a distinct editorial template. `design/TODO_marketing_surfaces.md` has scroll-driven motion only for marketing/landing pages, not an editorial content type; `design/TODO_data_viz.md` ships chart primitives but no sequencing template.

## Progress
- 0 / 5 done

## URLs
- `/stories` (index of scrollytelling pieces) · `/stories/<story-slug>` (e.g. `/stories/frontline-2025`)

## Tasks
- [ ] Editorial template spec: scroll-triggered step sequence (text panel + synced map/chart state per step), reuse existing map component + `design/TODO_data_viz.md` chart primitives — not a new rendering engine
- [ ] `/stories/<slug>` page: authoring format (structured steps array: narrative text, map viewport/layer state, chart snapshot, per-step), fallback static/linear rendering for reduced-motion + screen readers (a11y — see `design/TODO_accessibility.md`)
- [ ] `/stories` index: curated list, filterable by conflict/topic
- [ ] Performance budget check: scroll-driven map re-renders must respect `frontend/TODO_performance_budget.md` (this is the highest CWV-risk content type on the site — sequence review with `seo/TODO_core_web_vitals.md`)
- [ ] `Article` schema.org + FAQPage JSON-LD (10 Q&A); strong social/OG preview (this format is the platform's primary backlink/press-pickup vehicle)

## Notes
- Highest production effort of the round-2 findings — needs both an editorial-authoring spec and reuse/extension of existing map + chart libraries, not new infrastructure.
- Pair first pieces with high-profile anniversaries (`programmatic/TODO_template_anniversary.md`) or major front-line shifts for maximum launch impact.

## i18n
- EN + UK; narrative text translated per step, map/chart state is language-agnostic.
