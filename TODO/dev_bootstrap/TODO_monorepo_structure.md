# TODO — Monorepo Structure

## Goal
Single repo, multiple apps + packages, shared types, fast builds.

## Progress
- 5 / 15 done (Sprint 0)

## Layout
- [x] `apps/web` — Next.js (marketing + workspace + programmatic) ✓ Sprint 0
- [ ] `apps/admin` — admin back-office
- [ ] `apps/api-gateway`
- [ ] `services/ingest` · `geo` · `nlp` · `vision` · `verify` · `alert` · `report` · `search` · `tile`
- [x] `packages/types` ✓ Sprint 0
- [ ] `packages/sdk-ts`
- [ ] `packages/ui`
- [x] `packages/i18n-config` ✓ Sprint 0 (renamed from i18n)
- [x] `packages/url-builder` ✓ Sprint 0
- [ ] `infra/`
- [ ] `docs/`

## Tooling
- [x] pnpm + Turbo ✓ Sprint 0
- [ ] CODEOWNERS
- [ ] Build cache (Turbo remote)
- [ ] Per-package CI gates

## i18n
- N/A.

### Примітки
Monorepo with discipline > polyrepo with chaos. Discipline = strict package boundaries.
