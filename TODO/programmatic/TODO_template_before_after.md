# Programmatic Template — Before/After Imagery Article

## Goal
Standalone, indexable per-event article pairing satellite before/after imagery with narrative context (e.g. "Before and after: [facility] strike, [date]") — the compare-slider *tool* already exists in the map layer (`layers/TODO_satellite_imagery.md`, 10/10 done), but there is no publishable article template surfacing individual comparisons for search/social/backlinks.

## Progress
- 0 / 4 done

## URLs
- `/before-after` (index) · `/before-after/<event-slug>` (per-event article, e.g. `/before-after/zaporizhzhia-plant-2026-05`)

## Tasks
- [ ] `/before-after/<slug>` page: embeds the existing compare-slider component (`integrations/sentinel-hub/src/compare.ts`) + narrative (what changed, why, sourcing, confidence)
- [ ] `/before-after` index: chronological + filterable by conflict/region
- [ ] Data model: `BeforeAfterArticleSeed` (eventSlug, beforeSceneId, afterSceneId, narrative EN/UK, relatedEntitySlugs[], sourceUrls[]) in `apps/web/src/lib/programmatic/before-after.ts`
- [ ] `ImageObject`/`Article` schema.org + FAQPage JSON-LD (10 Q&A)

## Notes
- High social-share / backlink surface (journalists routinely embed or screenshot these) — treat as a growth/PR content type, cross-link `seo/TODO_backlinks_pr.md`.

## i18n
- EN + UK; narrative text is the only translatable piece (imagery itself is language-agnostic).
