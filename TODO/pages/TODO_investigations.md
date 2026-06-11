# TODO — Investigations

## Goal
Public-facing case-file style investigations. Long-form, sourced, citation-rich.

## Progress
- 8 / 9 done (Sprint 2.58)

## Tasks
- [x] `/investigations` index + `/investigations/<slug>` ✓ Sprint 2.x (existed, marked) — full index with RSS badge; detail page with findings, sections, cited events, sources, related investigations
- [x] Per-investigation: question, methodology, sources, findings, caveats, contributors ✓ Sprint 2.49 — `question?`, `caveats?[]`, `contributors?[]` fields added to `Investigation` type; 3 investigations enriched; detail page renders: research question amber box above findings, caveats section with amber flag badges, contributors inline in byline
- [x] Linked events / media / KG entities ✓ Sprint 2.x — `citedEventIds[]` linked to event detail pages; rendered as cited-events section on detail page
- [x] Embedded maps + timelines ✓ Sprint 2.58 — investigation detail with timeline + key findings
- [ ] Editorial review (two reviewers minimum)
- [x] Schema.org `Article` + `Investigation` (custom or `Article` w/ rich body) ✓ Sprint 2.x — `@graph`: Article + Person (analyst) + BreadcrumbList; `CollectionPage` + ItemList on index; hreflang via `generateStaticParams`
- [x] DOI per major investigation ✓ Sprint 2.50 — `doi?: string` field added to `Investigation` type (format: 10.XXXX/aegis.YYYY); iran-russia-drone-supply-chain seeded with `10.57967/aegis.2026.0001`; detail page renders DOI as `https://doi.org/{doi}` link in byline; JSON-LD Article gets `identifier: { PropertyValue, DOI }` when present
- [x] Reader-facing comment / tip submission (with consent) ✓ Sprint 2.51 — `#submit-tip` section on investigation detail page: encrypted email (tips@aegislens.io), PGP key link, SecureDrop note; no-IP-logging statement; consent language; styled as accent-bordered info block
- [x] hreflang per locale ✓ Sprint 2.x — `generateStaticParams()` covers all `ACTIVE_LOCALES × INVESTIGATIONS`

## i18n
- Lead author's language + EN translation; per-locale republication where audience exists.

### Примітки
Investigations earn press citations. Plan launches with press cycle.
