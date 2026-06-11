# Sprint 2.24 — Progress

**Theme:** Three more open follow-ups — analyst commentary on trends, OG images for media detail, per-recipe Postman.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Analyst commentary on `/trends/<slug>`
- [x] `Trend` type extended with optional `analystCommentary: { analyst, writtenAt, paragraphs[] }`.
- [x] All 5 seed trends populated with 2-paragraph analyst notes. Each paragraph uses **bracketed citations** to event IDs (e.g. `[01HXKHARKIVDRONE001]`) and investigation slugs (e.g. `[shahed-launch-site-network]`) — the same discipline we ask of external contributors.
- [x] Trend detail renders the block as a left-accent quote card with author + date eyebrow, followed by a methodology pointer that explains the citation convention.

### OG images for media detail
- [x] `/case-studies/[slug]/opengraph-image` — industry · region eyebrow + client + one-liner clip.
- [x] `/podcast/[slug]/opengraph-image` — series eyebrow + "Episode N · duration · date" line + episode title + guests.
- [x] `/videos/[slug]/opengraph-image` — category · duration · date eyebrow + title + summary clip.

### Per-recipe Postman (`/api/cookbook/<slug>/postman.json`)
- [x] Per-recipe Postman v2.1 collection. Parses the recipe's first cURL snippet (method + URL + headers) and emits a portable single-request collection with `{{base_url}}` variable substitution.
- [x] Fallback when no curl snippet: emits a collection pointing at the recipe page so the user has a starting place.
- [x] `/cookbook/[slug]` detail page gets a "Run this recipe" download block with the per-recipe `.postman.json` link plus the existing full-API collection.
- [x] HTTP: `content-type: application/json`, `content-disposition: inline; filename="aegis-recipe-<slug>.postman.json"`, CORS-open.

---

## Files touched

New:
- `apps/web/src/app/[locale]/case-studies/[slug]/opengraph-image.tsx`
- `apps/web/src/app/[locale]/podcast/[slug]/opengraph-image.tsx`
- `apps/web/src/app/[locale]/videos/[slug]/opengraph-image.tsx`
- `apps/web/src/app/api/cookbook/[slug]/postman.json/route.ts`

Edited:
- `apps/web/src/lib/trends-seed.ts` — `Trend.analystCommentary` field + populated for 5 trends
- `apps/web/src/app/[locale]/trends/[slug]/page.tsx` — renders analyst commentary block
- `apps/web/src/app/[locale]/cookbook/[slug]/page.tsx` — "Run this recipe" download block
- `TODO/SPRINT_2_13_PROGRESS.md` — per-recipe Postman ticked ✓ Sprint 2.24
- `TODO/SPRINT_2_14_PROGRESS.md` — analyst commentary on trends ticked ✓ Sprint 2.24
- `TODO/SPRINT_2_18_PROGRESS.md` — media-detail OGs ticked ✓ Sprint 2.24
- `TODO/programmatic/TODO_template_trend.md` — **8 / 8 done** ✓ Sprint 2.24
- `TODO/programmatic/TODO_template_api_recipes.md` — **4 / 4 done** ✓ Sprint 2.24

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_trend.md` — **8 / 8 done** ✓ Sprint 2.24
- `TODO/programmatic/TODO_template_api_recipes.md` — **4 / 4 done** ✓ Sprint 2.24
- Earlier sprint follow-ups closed: 2.13 per-recipe Postman, 2.14 trend AI commentary, 2.18 media OGs

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [x] Canonical-to-current strategy on year-roll ✓ Sprint 2.25 (archived-year banner on past /best-of and /news/archive years)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission (needs production hosting)
- [ ] Per-company coordinates so `/companies-near/<city>` can render radius search
- [ ] LLM-driven commentary on `/api/copilot` infrastructure (the current `analystCommentary` is hand-written but follows the citation discipline an LLM would need to enforce)
