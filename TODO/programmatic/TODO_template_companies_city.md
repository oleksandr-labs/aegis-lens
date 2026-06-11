# Template — Companies × Industry × City

## URLs
- `/industries` + `/industries/<industry>` ✓ Sprint 2.8 (by industry)
- `/companies/region/<region>` ✓ Sprint 2.11 (by region — UA / EU / US / UK / CA / —)
- `/companies/city/<city>` ✓ Sprint 2.12 (by HQ city — derived from COMPANIES.city field added this sprint)
- `/industries/<industry>/<city>` ✓ Sprint 2.12 (full industry × city intersect — only emits pages where ≥1 company actually qualifies)

## Progress
- 7 / 9 done

## Content
- [x] H1: parametric ✓ Sprint 2.11 ("Companies in {Region}")
- [x] Intro paragraph: market context, count, top-rated highlights ✓ Sprint 2.11 (count + N industries surfaced)
- [x] Filterable list (with directory-style cards) ✓ Sprint 2.11 (grouped by category, sorted by group size)
- [ ] Inline mini-map of HQ markers — deferred (no per-company geocoordinates)
- [ ] Top 5 featured / verified
- [ ] FAQ block (top questions per industry × city)
- [x] Related: same industry other cities, other industries same city ✓ Sprint 2.11 (region footer) / ✓ Sprint 2.12 (industry × city pages explicitly cross-link "same industry, other cities" + "same city, other industries")
- [x] Schema.org `ItemList` + `LocalBusiness` per entry ✓ Sprint 2.11 (CollectionPage + ItemList + BreadcrumbList; LocalBusiness per entry deferred — needs address fields)
- [ ] Quality gate: ≥10 listings → indexable — not enforced; the 5 region buckets are small (best regions have ~10–15 listings)

## i18n
- Localized per supported locale.

### Примітки
This template alone produces N_industries × N_cities pages. Threshold strictly.
