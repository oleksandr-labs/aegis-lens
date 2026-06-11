# Sprint 2.11 — Progress

**Theme:** Three more programmatic templates closed — persona×task use-cases, the knowledge-graph entity surface, and the companies-by-region intersect.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Use-case task-level pages (`/use-cases/<vertical>/<task>`)
- [x] `lib/use-case-tasks.ts` — 12 high-intent tasks across the 4 existing verticals:
  - defense: situational-awareness, battle-damage-assessment, force-protection
  - journalism: verify-a-photo, investigation-research, breaking-news-corroboration
  - humanitarian: evacuation-pre-positioning, documenting-civilian-harm, cluster-munitions-tracking
  - financial: sanctions-screening, commodity-flow-monitoring, insurance-war-risk
  Each task carries: problem framing, 4–5 step recommended workflow (with surface references), preferred tool categories, related threat slugs, related guide slugs, tag slugs.
- [x] `/use-cases/[vertical]/[task]` page — problem framing, numbered workflow, recommended tools (auto-pulled from TOOLS by category), related threats, related guides, sibling tasks. Article + BreadcrumbList JSON-LD.

### Entities knowledge graph (`/entities/<slug>`)
- [x] `lib/entities-seed.ts` — 10 seed entities across kinds: `organization`, `military_unit`, `platform`, `place`. Fields: aliases, country, Wikidata QID, related entities, related equipment, related events, related investigations, tags.
- [x] `entitySchemaType(kind)` maps `military_unit` → `Organization`, `platform` → `Product`, etc.
- [x] `/entities/[slug]` — full detail page with aliases pill row, Wikidata link, tags → `/tags`, Related entities (graph traversal), Investigations referencing this entity, Recent mentions (events), Related equipment.
- [x] `/entities` index page extended with a new "Knowledge graph" section (the existing equipment/conflicts/glossary groups remain).
- [x] JSON-LD per entity uses the correct schema type (`Organization` / `Person` / `Product` / `Place`) with `sameAs` from Wikidata.

### Companies × Region intersect (`/companies/region/<slug>`)
- [x] `/companies/region/[slug]` — for every distinct region value in COMPANIES (UA / EU / US / UK / CA / —). Grouped by industry/category within the region, sorted by group size. Per-group "industry hub →" link. "Other regions" footer with counts. CollectionPage + ItemList + BreadcrumbList.
- [x] All listing rows link to company detail; verified badge surfaced.

### Plumbing
- [x] `urls.useCaseTask`, `urls.companiesByRegion` added to `@aegis/url-builder`. (`urls.entity` already existed from Sprint 0; no duplication.)
- [x] Sitemap: +12 use-case task URLs, +10 entity URLs, +N region intersect URLs. Cleaned up triple-imported `COMPANIES`/`TOOLS` while passing through.

---

## Files touched

New:
- `apps/web/src/lib/use-case-tasks.ts`
- `apps/web/src/lib/entities-seed.ts`
- `apps/web/src/app/[locale]/use-cases/[vertical]/[task]/page.tsx`
- `apps/web/src/app/[locale]/entities/[slug]/page.tsx`
- `apps/web/src/app/[locale]/companies/region/[slug]/page.tsx`

Edited:
- `apps/web/src/app/[locale]/entities/page.tsx` (new "Knowledge graph" section above the existing groups)
- `packages/url-builder/src/index.ts` (+2 helpers)
- `apps/web/src/app/sitemap.ts` (+3 imports, +3 loops, +duplicate-import cleanup)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_use_case.md` — **5 / 8 done** ✓ Sprint 2.11 (deferred: demo media, testimonial, pricing rec)
- `TODO/programmatic/TODO_template_entity.md` — **7 / 9 done** ✓ Sprint 2.11 (deferred: significant-mentions timeline, automated neutrality gate)
- `TODO/programmatic/TODO_template_companies_city.md` — **5 / 9 done** ✓ Sprint 2.11 (deferred: full city-level intersect — needs richer COMPANIES seed; HQ mini-map; FAQ block; LocalBusiness per-entry schema)

## Open follow-ups
- [ ] Demo screenshot / video on use-case task pages
- [x] Add `city: string` field to COMPANIES seed so `/companies/<industry>/<city>` becomes possible ✓ Sprint 2.12 (20 well-known HQs populated; `lib/company-city.ts` derives slug index)
- [ ] Timeline of significant mentions on entity detail
- [ ] Person-kind entities (currently none seeded — sensitivity policy needs to be agreed first)
- [ ] LocalBusiness schema per company entry when address fields land
- [ ] Use-case task: pricing-recommendation block tied to /pricing
