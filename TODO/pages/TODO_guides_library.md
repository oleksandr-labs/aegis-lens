# TODO — Guides Library

## Goal
A library of focused how-tos. Different from academy (courses) and blog (long-form).

## Progress
- 8 / 9 done

## Tasks
- [x] `/guides` index with topical filters ✓ Sprint 2.8 + Sprint 2.51 — URL-driven `?category=` and `?level=` filter chips added; preserves both states; shows N/total count when filtered; no-match empty state; intro/intermediate/advanced and topic chips with counts
- [x] Per-guide: problem → step-by-step → tools → next steps ✓ Sprint 2.8 (sections-based structure; "Cited events" / "Related investigations" cross-links)
- [x] Schema.org `HowTo` — used `TechArticle` instead (broader fit for analyst+OSINT how-tos than `HowTo`) ✓ Sprint 2.8
- [ ] Downloadable PDF + checklist
- [x] Cross-link to relevant tools / use-cases ✓ Sprint 2.8 (relatedGlossarySlugs + relatedInvestigationSlugs wired)
- [x] Author byline (E-E-A-T) ✓ Sprint 2.8 (author + updated date in eyebrow)
- [x] Per-guide last-reviewed-at + refresh cadence ✓ Sprint 2.52 — guide detail page footer displays `updatedAt` formatted as "Last updated: DD Month YYYY" with "reviewed on a quarterly cadence" statement
- [x] Reader feedback ("was this helpful?") ✓ Sprint 2.52 — static feedback section added at bottom of guide detail page; two mailto CTA links (helpful / could be better); pre-filled subject + body with guide URL
- [x] hreflang per locale ✓ Sprint 2.8 (buildMetadata pathFor)

## i18n
- EN + UK at launch.

### Примітки
"How to X" SEO is high-volume + high-conversion. Build the library steadily.
