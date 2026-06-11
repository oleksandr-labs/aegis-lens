# TODO — Group / Consortium Licensing

## Goal
Sell to organizations whose end-users are individuals: universities, newsroom alliances, NGO consortia, professional associations.

## Progress
- 11 / 11 done

## Products
- [x] **University site license** ($5–25k / yr) — all faculty + students; SSO via Shibboleth / SAML — apps/web/src/lib/licensing/group-licensing.ts
- [x] **Newsroom alliance** (per-newsroom seat blocks + shared verification queue) — apps/web/src/lib/licensing/group-licensing.ts
- [x] **NGO consortium** (multi-org shared workspace + grant pricing) — apps/web/src/lib/licensing/group-licensing.ts
- [x] **Professional association** (member benefit; per-member seat at discount) — apps/web/src/lib/licensing/group-licensing.ts
- [x] **K-12 / civic education** (free with curriculum support) — apps/web/src/lib/licensing/group-licensing.ts

## Mechanics
- [x] Bulk seat allocation, named or floating — apps/web/src/lib/licensing/group-licensing.ts
- [x] SSO mandatory (SAML / OIDC) — apps/web/src/lib/licensing/group-licensing.ts
- [x] Admin portal: assign / revoke / report — apps/web/src/lib/licensing/group-licensing.ts
- [x] Bibliographic citation support (DOI / persistent URL for every event used in research) — apps/web/src/lib/licensing/group-licensing.ts
- [x] Annual usage report to the licensee — apps/web/src/lib/licensing/group-licensing.ts
- [x] Renewal triggers: per-seat utilization rate, papers citing the data — apps/web/src/lib/licensing/group-licensing.ts

## Linked files
- [TODO_discounts_grants.md](TODO_discounts_grants.md)
- [TODO_white_label.md](TODO_white_label.md)
- [../platform/TODO_multitenancy.md](../platform/TODO_multitenancy.md)

### Примітки
Університетські ліцензії — слабо прибуткові, сильно репутаційні. Часто конвертують випускників у Pro / Business.
