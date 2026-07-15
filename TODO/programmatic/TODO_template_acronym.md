# Programmatic Template — Military Acronym / Jargon Lookup

## Goal
Individual SEO-indexable pages per military/OSINT acronym (e.g. "what does HIMARS stand for", "what is FPV drone") — high search-volume, low-competition long-tail queries distinct from the full-term `TODO/pages/TODO_glossary.md` entries.

## Progress
- 0 / 5 done

## URLs
- `/acronyms` (A–Z index) · `/acronyms/<acronym-slug>` (e.g. `/acronyms/himars`)

## Tasks
- [ ] Data model: `AcronymSeed` (acronym, expansion, category, shortDefinition, relatedGlossarySlug?, relatedEquipmentSlug?) in `apps/web/src/lib/programmatic/acronyms.ts`
- [ ] `/acronyms` A–Z index page (paginated/filterable by category: weapons/orgs/procedures/ranks)
- [ ] `/acronyms/<slug>` detail page: expansion, plain-language definition, cross-link to `/glossary/<term>` and `/equipment/<slug>` where applicable
- [ ] Seed initial ~150 acronyms (NATO reporting names, weapon designations, org abbreviations: HIMARS, FPV, MANPADS, ISR, EW, C-UAS, ATACMS, NASAMS, IRIS-T, etc.)
- [ ] FAQPage JSON-LD; `DefinedTerm` schema.org markup reused from glossary pattern

## Notes
- Deliberately separate from `/glossary` — acronym pages target "what does X stand for" query intent, glossary targets "what is X" conceptual intent. Cross-link both directions.

## i18n
- EN first (acronyms are largely English/NATO-standard); UK expansion/definition text still required.
