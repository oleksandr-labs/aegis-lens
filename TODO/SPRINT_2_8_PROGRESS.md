# Sprint 2.8 — Progress

**Theme:** Programmatic SEO multipliers — Guides library, Industries hub, Tool alternatives, cross-cutting Tags index.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

**Motivation:** Master prompt audit identified four high-multiplier SEO surfaces that were missing or thin: guides, industry hubs, tool-alternative comparison pages, and a cross-cutting tag namespace.

---

## Delivered

### Guides library
- [x] `lib/guides-seed.ts` — 6 substantive guides with category, level, reading time, sections, related cross-links (glossary, investigations), and tags.
- [x] `/guides` — index with category/level/reading-time chips, tag pills, CollectionPage JSON-LD.
- [x] `/guides/[slug]` — full detail with `TechArticle` JSON-LD (incl. `proficiencyLevel`, `timeRequired`, `dateModified`), BreadcrumbList, glossary cross-links, related investigations, related guides (tag overlap).
- [x] `lib/seed-helpers.ts` — small lookup shim exposing `getGlossaryEntry` and `getEquipment` (used by guides + future surfaces).

### Industries hub (derived from directory)
- [x] `lib/industries.ts` — synthesizes industries from `COMPANIES.category` and `TOOLS.category`. `industrySlug()` normalizes labels, `getIndustry()` resolves by slug.
- [x] `/industries` — sorted by total entries, badge shows `N co · M tools`.
- [x] `/industries/[slug]` — company + tool subsections, breadcrumb, "Other industries" footer, CollectionPage + BreadcrumbList.

### Tool alternatives
- [x] `/alternatives/[slug]` — for every tool in TOOLS, lists up to 12 same-category alternatives. CollectionPage with `ItemList`, BreadcrumbList, links back to industry hub.
- [x] Inline `alternatives →` link on every tool row inside `/industries/<slug>`.

### Cross-cutting Tags
- [x] `lib/tags-index.ts` — single canonical tag namespace synthesized from `investigations.tags`, `guides.tags`, and `equipment.type`. Slug normalization with longest-label-wins canonicalization.
- [x] `/tags` — "Most used" cloud (top 24) + alphabetic browse with letter buckets.
- [x] `/tags/[slug]` — grouped subsections per surface (investigations / guides / equipment), BreadcrumbList.

### Plumbing
- [x] `urls.guides`, `urls.guide`, `urls.industries`, `urls.industry`, `urls.alternatives`, `urls.tags`, `urls.tag` added.
- [x] Sitemap: indexes + per-slug entries for guides (6), industries (~18), alternative pages (25 tools), and tags (~30+ derived) — call it **~80+ new URLs × locales** added to the sitemap.
- [x] Footer Resources column: `Guides`, `Industries`, `Tags`.

---

## Files touched

New:
- `apps/web/src/lib/guides-seed.ts`
- `apps/web/src/lib/industries.ts`
- `apps/web/src/lib/tags-index.ts`
- `apps/web/src/lib/seed-helpers.ts`
- `apps/web/src/app/[locale]/guides/page.tsx`
- `apps/web/src/app/[locale]/guides/[slug]/page.tsx`
- `apps/web/src/app/[locale]/industries/page.tsx`
- `apps/web/src/app/[locale]/industries/[slug]/page.tsx`
- `apps/web/src/app/[locale]/alternatives/[slug]/page.tsx`
- `apps/web/src/app/[locale]/tags/page.tsx`
- `apps/web/src/app/[locale]/tags/[slug]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+7 helpers)
- `apps/web/src/app/sitemap.ts` (+4 imports, ~80+ new URLs)
- `apps/web/src/components/Footer.tsx` (+3 links)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_alternatives.md` — 3 / 7 done
- `TODO/programmatic/TODO_template_industry_hub.md` — 4 / 9 done
- `TODO/programmatic/TODO_template_tag_pages.md` — 3 / 7 done
- `TODO/pages/TODO_guides_library.md` — 5 / 9 done
- All marked entries reference `✓ Sprint 2.8`.

## Open follow-ups
- [ ] Editorial intro paragraph on each `/alternatives/<slug>` (currently auto-generated, no narrative)
- [ ] Industry overview paragraphs + FAQ blocks on `/industries/<slug>`
- [ ] Tag overview paragraphs + "Related tags" cross-links on `/tags/<slug>`
- [ ] Guides: PDF download + reader feedback widget
- [ ] `/companies/<industry>/<city>` intersect pages (multiplicative growth; needs richer company seed with explicit city)
- [ ] Threat pages (`/threats/<slug>`) — distinct from `/topics/<class>`; named-threat hubs (Shahed, Iskander, ransomware-strain-X, etc.)
