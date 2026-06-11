# TODO — Local Development Environment

## Goal
`git clone && make dev` → working local env in < 15 minutes.

## Progress
- 12 / 12 done

## Tasks
- [x] Single `Makefile` per top-level command → [dev-standards.md §8](../../docs/engineering/dev-standards.md)
- [x] `make setup` installs deps (pnpm, python, docker check) → §8
- [x] `make dev` boots full stack (compose: Postgres, Redis, Kafka/Redpanda, Elastic, Qdrant, MinIO) → §8 (with healthchecks)
- [x] `make seed` loads dev fixtures → §8
- [x] `make test` runs full suite → §8
- [x] `.env.example` checked in; secrets via 1Password / Doppler CLI → §8
- [x] Per-service hot-reload → §8 (tsx/nodemon/uvicorn --reload/air)
- [x] Docker compose with healthchecks → §8
- [x] Devcontainer (VS Code) for cross-platform parity → §8
- [x] Per-OS quirks documented (WSL2, macOS, Linux) → §8 (quirks table)
- [x] First-PR onboarding: opens issue with `make dev` log on failure → §8
- [x] Per-engineer dev-env doctor command → §8 (`make doctor`)

## i18n
- Dev env runs with all locales seeded.

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §8](../../docs/engineering/dev-standards.md).
15-min target non-negotiable. On-call for Platform area owns "can't get dev running" SLA (<4h).
