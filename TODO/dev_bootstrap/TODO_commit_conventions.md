# TODO — Commit Conventions

## Goal
Machine-readable commits → auto-changelog + auto-versioning + better history.

## Progress
- 9 / 9 done

## Format
- [x] Conventional Commits: `<type>(<scope>): <subject>` → [dev-standards.md §3](../../docs/engineering/dev-standards.md)
- [x] Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `style`, `build`, `ci`, `revert` → §3 type table
- [x] Scope optional (component / service name) → §3
- [x] Subject ≤ 72 chars, imperative ("add", not "added") → §3
- [x] Body: why + what (not how — code shows how) → §3 + full example
- [x] Footer: `BREAKING CHANGE:` + issue refs → §3

## Tooling
- [x] `commitlint` in CI → §3 tooling
- [x] `cz` (commitizen) for interactive option → §3 (`pnpm cz`)
- [x] Pre-commit hook (`husky`) on local → §3
- [x] Auto-changelog from commits → §3 (`conventional-changelog`)

## i18n
- EN canonical.

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §3](../../docs/engineering/dev-standards.md).
Full commit format with worked example (feat/scope/body/footer). "Future-you thanks present-you."
