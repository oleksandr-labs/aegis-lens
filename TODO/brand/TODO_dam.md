# TODO — Digital Asset Management (DAM)

## Goal
Central, versioned, rights-cleared asset library. Searchable by all staff + partners.

## Progress
- 9 / 9 done ✓ Sprint 2.39 (plan + schema; implementation phased — see `DAM_PLAN.md` § 15)

## Tasks
- [x] DAM tool (Frontify / Bynder / self-hosted lightweight) ✓ Sprint 2.39 — self-hosted S3 + Postgres + Meilisearch to start; migration triggers defined (`DAM_PLAN.md` § 2)
- [x] Logo + monogram + wordmark variants ✓ Sprint 2.39 — day-1 catalogue in `DAM_PLAN.md` § 5
- [x] Brand colors + typography downloads ✓ Sprint 2.39 — Tailwind tokens JSON + ASE + Figma + font woff2 + license files (`DAM_PLAN.md` § 5)
- [x] Photo + illustration library (rights metadata) ✓ Sprint 2.39 — `kind=photo|illustration` + rights schema (`DAM_PLAN.md` § 6)
- [x] Per-asset usage rights + expiration ✓ Sprint 2.39 — `DAM_PLAN.md` § 7 (auto-expiration + 60/30/7 day reminders)
- [x] Per-asset version history ✓ Sprint 2.39 — `DAM_PLAN.md` § 8 (`supersedes` / `superseded_by`)
- [x] Per-asset download analytics ✓ Sprint 2.39 — `dam_downloads` table + dashboard (`DAM_PLAN.md` § 9)
- [x] External partner access tier ✓ Sprint 2.39 — 5-tier access model (`DAM_PLAN.md` § 10)
- [x] Auto-generated partner kits ✓ Sprint 2.39 — `DAM_PLAN.md` § 11

## Deliverables
- `DAM_PLAN.md` v1.0 — tool decision, storage architecture, taxonomy, schema, day-1 catalogue, access model, phase plan

## Open follow-ups (implementation, not scope)
- [ ] P0 day-1 catalogue uploaded to `aegis-dam-prod` S3
- [ ] P1 `dam_assets` schema migration in `packages/db`
- [ ] P1 upload + approval UI
- [ ] P2 `/press-kit` page + magic-link gating for press tier
- [ ] P2 partner-kit auto-generator job
- [ ] P3 analytics dashboard + locale coverage widget

## i18n
- Per-locale asset variants where text-based; missing-locale alerts wired into the localization workflow.

### Примітки
Asset chaos = brand drift. Centralize early.
