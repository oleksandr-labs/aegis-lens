# TODO — Recommendation Engine

## Goal
Surface relevant events, tools, companies, reports, people — personalized to user persona, watchlists, recent activity.

## Progress
- 11 / 11 done

## Tasks
- [x] Hybrid model: collaborative filtering + embedding similarity + recency boost — apps/web/src/lib/recommendations/scoring.ts
- [x] Per-user feature store (recent filters, watchlists, persona) — apps/web/src/lib/recommendations/types.ts
- [x] Cold-start: persona-based defaults — apps/web/src/lib/recommendations/cold-start.ts
- [x] Re-rank by region / topic affinity — apps/web/src/lib/recommendations/scoring.ts
- [x] Diversity injection (no echo chamber) — apps/web/src/lib/recommendations/scoring.ts
- [x] Surface placements: home feed, event inspector, dashboard, sidebar, emails — apps/web/src/lib/recommendations/per-surface-metrics.ts
- [x] Per-surface eval metric (CTR + downstream engagement) — apps/web/src/lib/recommendations/per-surface-metrics.ts
- [x] Per-recommendation explainability ("why am I seeing this?") — apps/web/src/lib/recommendations/explainability.ts
- [x] Opt-out per surface — apps/web/src/lib/recommendations/opt-out.ts
- [x] Editorial overrides (boost / suppress) — apps/web/src/lib/recommendations/editorial-overrides.ts
- [x] Offline + online evaluation — apps/web/src/lib/recommendations/recommendations.test.ts

## i18n
- Per-locale recommendations preferred for content surfaces.

### Примітки
Diversity + transparency keep trust high. Don't optimize purely for CTR.
