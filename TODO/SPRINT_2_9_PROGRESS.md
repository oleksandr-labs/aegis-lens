# Sprint 2.9 — Progress

**Theme:** More programmatic SEO multipliers — Threats hub, pairwise tool comparison, top-tools-by-industry.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Threats hub
- [x] `lib/threats-seed.ts` — 8 named threats with category, eventClass, affected regions, civilian + operator guidance, tags, cited events, related equipment, body sections.
  - shahed-strikes, energy-grid-attacks, long-range-missile-strikes, civilian-cyber-attacks, ais-spoofing, humanitarian-corridor-attacks, civil-aviation-spillover, synthetic-media-disinformation
- [x] `/threats` — category-grouped index (kinetic / infrastructure / cyber / maritime / aviation / humanitarian), CollectionPage JSON-LD.
- [x] `/threats/[slug]` — full detail. Threat profile, civilian/operator guidance side-by-side, body sections, recent events (resolved from `citedEventIds`), related equipment, related threats (category or tag overlap), tag pills. Article + BreadcrumbList + `citation[]` derived from events. Cross-links to topic feed, methodology, equipment, tags.

### Pairwise tool comparison
- [x] `/compare/tools/[pair]` — generated for every UNORDERED same-category tool pair (canonical alphabetical order). Comparison table with category / region / verified / description rows, side-by-side quick-links cards (tool detail + alternatives), "Other tools in this category" footer, equal-treatment policy disclosure.
- [x] `parsePair` accepts only canonical alphabetical order; reverse-order requests `notFound()`.

### Top tools by industry
- [x] `/top-tools-for/[slug]` — one page per industry that has TOOLS, top 10 ranked verified-first then alphabetical. Includes:
  - Year in title (auto-updates)
  - Methodology block (inclusion + ordering rules)
  - "Last reviewed" date + quarterly refresh disclosure
  - Per-row "alternatives →" + "detail →" links
  - "Other industries" footer cross-linking sibling top-lists
- [x] Schema.org `ItemList` (Descending) + `BreadcrumbList`.

### Plumbing
- [x] `urls.threats`, `urls.threat`, `urls.toolPairCompare` (auto-canonicalizes pair order), `urls.topToolsForIndustry` added.
- [x] Sitemap: threats index + 8 detail pages; ~N tool-pair pages (same-category only, canonical order); 1 top-tools page per industry with tools.
- [x] Footer Resources column: `Threats`.

---

## Files touched

New:
- `apps/web/src/lib/threats-seed.ts`
- `apps/web/src/app/[locale]/threats/page.tsx`
- `apps/web/src/app/[locale]/threats/[slug]/page.tsx`
- `apps/web/src/app/[locale]/compare/tools/[pair]/page.tsx`
- `apps/web/src/app/[locale]/top-tools-for/[slug]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+4 helpers — including auto-canonicalizing `toolPairCompare`)
- `apps/web/src/app/sitemap.ts` (+1 import, +3 loops)
- `apps/web/src/components/Footer.tsx` (+1 link)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_threat.md` — 7 / 9 done
- `TODO/programmatic/TODO_template_compare.md` — 3 / 7 done (3-way + feature/pricing matrices deferred)
- `TODO/programmatic/TODO_template_top_lists.md` — 5 / 7 done (deferred: fixed-N and region-scoped variants)
- All marks reference `✓ Sprint 2.9`.

## Open follow-ups
- [ ] Editorial intros + FAQ blocks for each threat detail
- [ ] Localize threat civilian/operator guidance to UK (currently EN only)
- [ ] 3-way and 4-way comparison (`/compare/tools/<a>-vs-<b>-vs-<c>`)
- [ ] `/top-<n>-<thing>` fixed-N variants
- [ ] Region-scoped top lists (`/leading-osint-tools-in-eu`)
- [ ] `/best-<thing>-for-<audience>` — audience-keyed top lists (analysts, journalists, NGOs, defense)
