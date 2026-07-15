# Hub — Cultural Heritage Destruction Tracker

## Goal
UNESCO-style tracker of damaged/destroyed cultural heritage sites (monuments, museums, religious buildings, archaeological sites) across tracked conflicts — currently only a single throwaway mention exists in the codebase (`apps/web/src/lib/seo/open-data.ts:133`, a generic description phrase); no entity model, map layer, or data source is lined up yet, making this the highest-effort item of the round-3 gap pass.

## Progress
- 0 / 5 done

## URLs
- `/cultural-heritage` (pillar, cross-conflict) · `/cultural-heritage/<site-slug>` (per-site status page)

## Tasks
- [ ] Pillar page: cumulative count of documented incidents by conflict/region, methodology citing UNESCO/ICOMOS/Blue Shield as primary sources
- [ ] Per-site page: site name, heritage designation (UNESCO World Heritage / national monument / etc.), damage date and description, verification status (satellite/on-ground), before/after imagery where available (cross-link `programmatic/TODO_template_before_after.md`)
- [ ] Data model: `HeritageSiteIncidentSeed` (siteSlug, name, designation, conflictSlug, damageDate, damageType, verificationStatus, sourceUrls[]) in `apps/web/src/lib/hubs/cultural-heritage.ts`
- [ ] Add `heritage` as a new leaf under the **Infrastructure** taxonomy branch (currently power/transport/telecom/water/healthcare/education/residential only — see `categories_taxonomy/TODO_category_tree.md`)
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Highest-effort net-new hub of this round — no existing data source lined up (UNESCO/ICOMOS/Blue Shield feeds would need their own integration spec, similar in shape to `TODO/integrations/`). Sequence after the lower-effort round-3 items.

## i18n
- EN + UK.
