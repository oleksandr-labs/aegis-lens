# Template — Near-Me / Geo-Aware

## URLs
- `/companies-near/<city>` ✓ Sprint 2.20 (one per HQ city in COMPANIES — near-me semantics: companies in or near the named city)
- `/<thing>-near-me` (geo-aware redirect) — deferred until geolocation prompt UX is wired

## Progress
- 4 / 8 done

## Content
- [x] Geo-aware list — substituted with HQ-city-keyed list ✓ Sprint 2.20 (radius math deferred until per-company coordinates land)
- [ ] Map with markers + filters — deferred (no per-company coords yet)
- [ ] Distance + travel-time hints — deferred (same reason)
- [x] Top-rated locally — verified-first "Top near {city}" block at the top of each page ✓ Sprint 2.20
- [ ] FAQ block — deferred
- [x] Schema.org `Place` / `LocalBusiness` — CollectionPage + ItemList ✓ Sprint 2.20; LocalBusiness per entry deferred until address fields land
- [x] hreflang per language ✓ Sprint 2.20 (buildMetadata pathFor)
- [ ] Quality gate: ≥5 nearby entries — not strictly enforced; current implementation emits with MIN_ENTRIES=1 since our seed is small

## i18n
- City + region names per locale.

### Примітки
"Near me" intent for OSINT/security firms is real — security buyers want local providers.
