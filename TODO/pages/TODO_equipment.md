# TODO — Programmatic: Equipment Pages

## Goal
Per-equipment-model identification reference: photos (cleared rights), specs (public), identification cues, sightings on the map.

## Progress
- 9 / 10 done (Sprint 0/1/1.2/2.45)

## Tasks
- [x] `/equipment/<slug>` template ✓ Sprint 0
- [x] Schema.org `Product` JSON-LD ✓ Sprint 0
- [x] Public specifications (source-cited) ✓ Sprint 2.45 — `specs[]` with label/value/source, rendered as table on detail page
- [x] Identification cues (visual + audio signatures) ✓ Sprint 2.45 — `identificationCues[]` numbered list on detail page
- [x] Recent sightings linked via subclass match ✓ Sprint 1.2
- [x] Each sighting links to event detail page ✓ Sprint 1.2
- [x] Operators (publicly attributed) ✓ Sprint 2.45 — `operators[]` with name/iso2/note, flag emojis
- [x] Variants ✓ Sprint 2.45 — `variants[]` with name/note on detail page
- [x] Related equipment (functional or visual lookalikes) ✓ Sprint 2.45 — `relatedSlugs[]` rendered as chips
- [ ] Image gallery (rights-cleared only)
- [x] FAQ block ✓ Sprint 2.45 — `faq[]` rendered as `<details>` accordion; FAQPage JSON-LD in @graph

## i18n
- Specs + descriptions localized; equipment name as-is + transliteration.

### Примітки
Stick to public-domain spec sources. No targeting-grade detail.
