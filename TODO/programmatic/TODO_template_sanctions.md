# Template — Sanctions Pages

## URLs
- `/sanctions` index ✓ Sprint 2.14 (grouped by jurisdiction)
- `/sanctions/<list-slug>` ✓ Sprint 2.14 (8 seed lists: us-ofac-sdn, us-bis-entity-list, eu-consolidated, uk-ofsi-consolidated, ca-sema, au-consolidated, ua-nszsr, un-1267)
- `/sanctions/entity/<slug>` ✓ Sprint 2.21 (entity-keyed sanctions history — emits per entity referenced by any list via `relatedEntitySlugs`; Article + BreadcrumbList JSON-LD with `citation[]` per authority URL)

## Progress
- 5 / 5 done

## Content
- [x] Per-list overview + last-updated ✓ Sprint 2.14 (description + updateCadence + use-cases)
- [x] Linked entities (KG) ✓ Sprint 2.14 (`relatedEntitySlugs` → entity detail; UA: Wagner Group, Rosenergoatom on relevant lists)
- [x] Per-entity sanctions history ✓ Sprint 2.21 (`/sanctions/entity/<slug>` jurisdiction-grouped citations + authority-of-record disclaimer; uses existing `relatedEntitySlugs` inverse-index)
- [x] Schema.org `Article` + `Organization` (per entity) ✓ Sprint 2.14 (Article + BreadcrumbList per list; entity Organization JSON-LD already on /entities/<slug>)
- [x] Source citation (OFAC / EU / UK official) ✓ Sprint 2.14 (`authorityUrl` link with nofollow/noopener; `citation[]` in Article JSON-LD)
