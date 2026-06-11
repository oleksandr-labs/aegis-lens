# TODO — Git Workflow

## Goal
Trunk-based development. Short-lived branches. Fast merges.

## Progress
- 10 / 10 done

## Tasks
- [x] Trunk-based: `main` is always deployable → [dev-standards.md §2](../../docs/engineering/dev-standards.md)
- [x] Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>` → §2
- [x] Squash-merge default (clean linear history) → §2
- [x] Feature flags > long-lived branches → §2 (if branch lives > 3 days → needs flag)
- [x] Per-PR small (< 400 LOC; exceptions justified) → §2
- [x] Required reviews: 1+ from owning team → §2
- [x] Required CI green → §2 (branch protection)
- [x] Branch protection on `main` → §2 (no direct push, no force-push, linear history)
- [x] No force-push to `main` → §2
- [x] Tagged releases per service → §2 (semver `services/<name>@v<major>.<minor>.<patch>`)

## i18n
- N/A.

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §2](../../docs/engineering/dev-standards.md).
Trunk-based + feature flags is the modern default. GitFlow is legacy.
