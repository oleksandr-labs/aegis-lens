# Sprint 2.23 — Progress

**Theme:** Closing four open follow-ups — finish the cross-cut FAQ rollout, OG images for year-scoped surfaces, sanctions-entity cadence indicator.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### FAQ on `/topics/<class>/in/<country>`
- [x] Parametric 4-question FAQ:
  - "How many {class} events has Aegis Lens catalogued in {country}?" (live count + avg danger)
  - "Are these events independently verified?" (points at /methodology/verification)
  - "Can I subscribe to this slice as a feed?" (RSS + /api/events example)
  - "Why might the count here differ from /incidents?"
- [x] FAQPage JSON-LD merged into the existing graph; UI uses `<details>` collapsibles consistent with the threat × country page from 2.22.

### FAQ on `/use-cases/<vertical>/<task>/in/<country>`
- [x] Parametric 4-question FAQ:
  - "Can I run this workflow against {country} today?" (cites live event count)
  - "What tooling does Aegis Lens recommend here?" (references task's preferred categories)
  - "What's different about running this in {country} vs. globally?"
  - "Where do I get help if the workflow doesn't fit our org?"
- [x] FAQPage JSON-LD + collapsibles.

### OG images for year-scope pages
- [x] `/best-of/[year]/opengraph-image` — giant year typography + stats line (event count · avg danger · class count).
- [x] `/news/archive/[year]/opengraph-image` — "ARCHIVE" eyebrow + giant year + months-covered + event count.

### Sanctions × Entity cadence indicator
- [x] Tri-card on `/sanctions/entity/<slug>` above the Authority-of-record warning: **Page assembled** (today's date), **Re-check cadence** (every 7 days), **Next scheduled check** (today + 7).
- [x] Explanation paragraph clarifying that authority-of-record cadence is per-list (already rendered below) and that Aegis Lens does not mirror underlying data.

---

## Files touched

New:
- `apps/web/src/app/[locale]/best-of/[year]/opengraph-image.tsx`
- `apps/web/src/app/[locale]/news/archive/[year]/opengraph-image.tsx`

Edited:
- `apps/web/src/app/[locale]/topics/[slug]/in/[country]/page.tsx` (FAQ + FAQPage JSON-LD)
- `apps/web/src/app/[locale]/use-cases/[vertical]/[task]/in/[country]/page.tsx` (FAQ + FAQPage JSON-LD)
- `apps/web/src/app/[locale]/sanctions/entity/[slug]/page.tsx` (cadence tri-card above authority-of-record block)
- `TODO/SPRINT_2_16_PROGRESS.md` — cross-cut FAQ rollout fully closed ✓ Sprint 2.23
- `TODO/SPRINT_2_20_PROGRESS.md` — cross-cut FAQ rollout fully closed ✓ Sprint 2.23
- `TODO/SPRINT_2_21_PROGRESS.md` — FAQ + cadence indicator ticked ✓ Sprint 2.23
- `TODO/SPRINT_2_22_PROGRESS.md` — FAQ rollout + year-scope OG ticked ✓ Sprint 2.23

---

## TODO bookkeeping
- `TODO/SPRINT_2_16_PROGRESS.md` — cross-cut FAQ rollout complete (all three surfaces)
- `TODO/SPRINT_2_20_PROGRESS.md` — same
- `TODO/SPRINT_2_21_PROGRESS.md` — FAQ + cadence indicator both closed
- `TODO/SPRINT_2_22_PROGRESS.md` — FAQ rollout + year-scope OGs closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [x] Canonical-to-current strategy on year-roll ✓ Sprint 2.25 (archived-year banner on past years; canonical self-referential)
- [ ] Localize methodology limitations + version-history + FAQ copy to UK
- [ ] Localize sanctions-entity copy to UK
- [ ] AI commentary block per trend with strict citation grounding
- [ ] Methodology + scoring localized bodies (UK)
- [ ] Per-recipe Postman / Bruno run-files
