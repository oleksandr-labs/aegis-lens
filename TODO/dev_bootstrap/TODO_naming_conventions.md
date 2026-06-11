# TODO — Naming Conventions

## Goal
Consistent naming across files, components, variables, branches, commits, routes.

## Progress
- 12 / 12 done

## Tasks

### Code
- [x] TS files: `kebab-case.ts`; React components: `PascalCase.tsx` → [dev-standards.md §4](../../docs/engineering/dev-standards.md)
- [x] Component variables / functions: `camelCase` → §4
- [x] Constants: `SCREAMING_SNAKE_CASE` → §4
- [x] Types / interfaces: `PascalCase`; no `I`-prefix → §4
- [x] Python: `snake_case`; classes `PascalCase` → §4

### Routes / URLs
- [x] kebab-case slugs → §4
- [x] Plural for collections, singular for entities → §4

### Branches
- [x] `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/` → §2 (git workflow)
- [x] `feat/short-description` (kebab) → §2

### Commits
- [x] Conventional Commits → §3

### Database
- [x] Tables: `snake_case`, plural → §4
- [x] Columns: `snake_case` → §4
- [x] FKs: `<singular_table>_id` → §4

## i18n
- Code base is EN-English regardless of speaker locale.

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §4](../../docs/engineering/dev-standards.md).
Bikeshed once, lock forever. Don't relitigate per PR.
