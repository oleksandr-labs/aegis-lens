# Developer Standards

> Engineering conventions for the Aegis Lens monorepo. These are the decisions
> made once and referenced forever. Relitigate in an RFC, not in a PR review.

---

## 1. Engineering Principles

Ten principles every engineer should be able to recite. These drive decisions
when the handbook is silent.

| # | Principle | What it means in practice |
| --- | --- | --- |
| 1 | **Boring code where possible** | Exotic patterns only where they earn their keep. Clever code is a liability. |
| 2 | **Replayability over realtime perfection** | Keep raw archives. Design every pipeline to be deterministically rebuilt. |
| 3 | **Observability is product** | If it's not logged and traced, it doesn't exist. Ship observability with every feature. |
| 4 | **Idempotency by default** | Every operation must be safe to retry. Design this in from day one, not as a fix. |
| 5 | **Multi-tenant from Day 1** | No global mutable state, ever. RLS at the DB layer. Tenant isolation is a correctness property. |
| 6 | **Privacy + safety > velocity** | Source protection and PII discipline are non-negotiable. No shortcuts. |
| 7 | **Small PRs, fast reviews** | < 400 LOC; first response < 4 hours. Batch reviews compound; small reviews stay clean. |
| 8 | **Tests are part of the change** | An untested merge is an incomplete merge. No exceptions. |
| 9 | **Decisions documented (ADR / RFC)** | Search beats archaeology. If a decision matters, write it down. |
| 10 | **Pay debt continuously** | 20% capacity per cycle. Debt that's invisible compounds. |

These live in PR review comments — quote them by number.

---

## 2. Git Workflow

**Trunk-based development.** `main` is always deployable. GitFlow is legacy.

### Branch naming

```
feat/<slug>       New feature
fix/<slug>        Bug fix
chore/<slug>      Maintenance, dependency bumps
docs/<slug>       Documentation only
refactor/<slug>   Structural change, no behavior change
test/<slug>       Tests only
```

Slug: `kebab-case`, max 50 chars, derived from the Linear issue ID where applicable
(`feat/ABC-123-alert-deduplication`).

### Merge strategy

- **Squash merge** by default: clean, linear history; the PR becomes one commit.
- Only exception: a PR that intentionally preserves multiple distinct commits
  (e.g., a migration + the code that uses it, clearly separated for `git bisect`).
- **No force-push to `main`**, ever. Branch protection enforces this.

### Feature flags > long-lived branches

Code that isn't ready for users ships behind a feature flag, not on a branch.
Long-lived branches diverge and create merge-conflict debt. The rule: if a branch
lives longer than 3 days, it needs a flag.

### Branch protection (`main`)

- Required CI green (all checks pass).
- Required review from at least 1 code owner (per `.github/CODEOWNERS`).
- No direct pushes.
- No force-push.
- Linear history enforced (squash only).

### Tagged releases

Each service is independently versioned via semver tags
(`services/ingest@v1.3.2`). Tags trigger the release pipeline in GitHub Actions.
CHANGELOG is auto-generated from commits.

---

## 3. Commit Conventions

**Conventional Commits** (`<type>(<scope>): <subject>`).

### Types

| Type | When |
| --- | --- |
| `feat` | New feature or behavior visible to users or consuming services |
| `fix` | Bug fix |
| `chore` | Maintenance (deps, config, tooling) — no behavior change |
| `docs` | Documentation only |
| `refactor` | Structural change, no behavior change |
| `test` | Tests only |
| `perf` | Performance improvement |
| `style` | Formatting only (Biome/Prettier handles most of this) |
| `build` | Build system or bundler changes |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverts a prior commit |

### Format rules

```
feat(ingest): add Telegram adapter deduplication

Why: duplicate events from Telegram caused false-positive alert spikes
during high-activity windows. This adds a content-hash dedup step
before events reach the enrichment queue.

Refs: ABC-312
BREAKING CHANGE: ingest adapter interface now requires idempotency_key field
```

- **Subject:** ≤ 72 chars, imperative mood ("add", not "added" / "adds").
- **Body:** the *why* + the *what* (not the *how* — the diff shows the how).
- **Footer:** `BREAKING CHANGE:` if applicable; `Refs:` / `Closes:` for issue links.
- **No period** at the end of the subject line.

### Tooling

- **`commitlint`** in CI: PRs whose squash-merge title doesn't follow the format fail.
- **`commitizen` (`cz`)**: interactive commit helper for engineers who prefer it
  (`pnpm cz`). Optional — the format is enforced by commitlint, not the tool.
- **`husky` pre-commit hook**: runs commitlint on the local message before push.
- **Auto-changelog**: `conventional-changelog` generates `CHANGELOG.md` from
  commits on every tagged release.

---

## 4. Naming Conventions

Bikeshed once, lock forever. Don't relitigate per PR.

### TypeScript / JavaScript

| Thing | Convention | Example |
| --- | --- | --- |
| Files (non-component) | `kebab-case.ts` | `event-dedup.ts` |
| React components | `PascalCase.tsx` | `EventCard.tsx` |
| Variables & functions | `camelCase` | `parseEventPayload()` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Types & interfaces | `PascalCase`; no `I`-prefix | `AegisEvent`, `SourceConfig` |
| Enums | `PascalCase` name, `SCREAMING_SNAKE_CASE` values | `VerificationState.NOT_VERIFIED` |
| Test files | `<name>.test.ts` (unit) / `<name>.spec.ts` (integration) | `event-dedup.test.ts` |

### Python

| Thing | Convention |
| --- | --- |
| Files & modules | `snake_case.py` |
| Variables & functions | `snake_case` |
| Classes | `PascalCase` |
| Constants | `SCREAMING_SNAKE_CASE` |

### Routes & URLs

- **kebab-case** slugs everywhere (see `TODO/urls_slugs` for full rules).
- **Plural for collections:** `/events`, `/sources`, `/users`.
- **Singular for singletons or entities accessed by ID:** `/user/me`, `/events/{id}`.
- No trailing slashes on canonical URLs; 301 redirect the slash version.

### Database

| Thing | Convention | Example |
| --- | --- | --- |
| Tables | `snake_case`, plural | `events`, `ingest_logs` |
| Columns | `snake_case` | `created_at`, `org_id` |
| Foreign keys | `<singular_table>_id` | `source_id`, `user_id` |
| Indexes | `idx_<table>_<columns>` | `idx_events_region_ts` |
| Migrations | `v<major>_<minor>_<patch>__<description>.sql` | `v1_2_0__add_full_text_search.sql` |

### CSS / Tailwind

- Tailwind utility classes are preferred over custom class names.
- Where custom classes are needed: `kebab-case`; namespace by component
  (`event-card__timestamp`).
- CSS custom properties: `--kebab-case` (`--color-accent`, `--motion-fast`).

---

## 5. Error Handling Conventions

"Something went wrong" is a UX failure. Be specific and actionable.

### Backend: error taxonomy

Every service uses a consistent error taxonomy:

| Class | HTTP | Retry? | Example |
| --- | --- | --- | --- |
| `ValidationError` | 400 | No | Missing required field |
| `AuthError` | 401 | No | Invalid or expired token |
| `ForbiddenError` | 403 | No | Insufficient permissions |
| `NotFoundError` | 404 | No | Resource doesn't exist |
| `ConflictError` | 409 | No | Duplicate resource |
| `RateLimitError` | 429 | Yes (backoff) | Too many requests |
| `UpstreamError` | 502/503 | Yes (backoff) | External service failure |
| `InternalError` | 500 | No | Unexpected server error |

### API error format: RFC 7807 `problem+json`

```json
{
  "type": "https://docs.aegis-lens.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The 'region' field is required.",
  "instance": "/api/events?region=",
  "trace_id": "01HX4N2GNZMQZRG3C9VVJ0PHHK"
}
```

Rules:
- **No stack traces in client responses.** Stack traces go to the log, tied to
  `trace_id`. The client gets `trace_id` so they can report it to support.
- **Stable error codes:** `type` URI is permanent. Never change a published error
  type — add a new one.
- **Idempotent error classification:** a client can determine whether to retry
  from the status code and the `type` alone.

### Frontend: error boundaries + fallback UI

- Every route has an `<ErrorBoundary>` wrapping the page content.
- Per-error-class fallback UI:

| Error | Fallback |
| --- | --- |
| Network / upstream | "Unable to load — check your connection. [Retry]" |
| 404 | "This resource was not found. [Go back]" |
| 403 | "You don't have access to this. [Request access]" |
| 500 | "Something went wrong on our end. Reference: {trace_id}. [Report issue]" |

Rules:
- **Never blame the user** ("you entered an invalid…" → "this field requires…").
- **Always offer a recovery path** (retry button, back link, support contact).
- **Copy is actionable**: the user knows what to do next.
- Error message copy is **localized** (same i18n pipeline as UI strings).

### Observability: every error tagged and traced

- Every error in backend services is logged with: `trace_id`, `span_id`,
  `service`, `error_class`, `error_code`, and context fields (no PII).
- **Per-error fingerprinting**: errors are grouped by `error_class + error_code +
  call_site` (Sentry-style) so volume anomalies are visible.
- **Alert thresholds per class**:
  - `InternalError` rate > 0.1% of requests → P2 alert.
  - `UpstreamError` rate > 5% → P2 alert on the upstream.
  - Any `AuthError` spike → security team alert.

---

## 6. Logging Conventions

A log without `trace_id` is half-useful. Always include.

### Required fields (every log line)

```json
{
  "ts": "2026-05-30T12:34:56.789Z",
  "level": "info",
  "service": "ingest",
  "version": "1.3.2",
  "trace_id": "01HX4N2GNZMQZRG3C9VVJ0PHHK",
  "span_id": "abc123",
  "org_id": "org_xxx",
  "event": "event.ingested",
  "msg": "Event ingested successfully",
  "duration_ms": 42
}
```

### Log levels

| Level | When |
| --- | --- |
| `trace` | Fine-grained debug; dev-only; never in production |
| `debug` | Diagnostic detail; sampled in production |
| `info` | Normal business events (request handled, event ingested) |
| `warn` | Unexpected but recoverable (retry triggered, degraded mode) |
| `error` | Failure requiring attention; triggers alert |
| `fatal` | Process cannot continue; triggers page |

### Rules

- **JSON structured everywhere.** No plaintext log lines in production services.
- **No PII in logs — ever.** Linter rule enforces this: any log call containing
  a field matching a known PII pattern (email regex, phone regex, name fields,
  coordinate-to-individual precision) fails CI.
- **No secrets in logs.** Same enforcement.
- **Correlation ID propagation:** the gateway generates a `trace_id` for each
  request and injects it into every downstream service call via header. All log
  lines for a request share the same `trace_id`.
- **Sampling:**
  - `error` + `fatal`: 100% always.
  - `warn`: 100%.
  - `info`: 10% in production (configurable via env var); 100% in staging/dev.
  - `debug` / `trace`: 0% production, on-demand via log-level override.
- **Per-service log volume budget**: each service has a maximum `log_bytes/min`
  in its Helm values. Exceeding budget → auto-sampling increase + alert.
- **Slow queries / slow calls** (> 500 ms) are auto-logged at `warn` with the
  query fingerprint and duration.
- **Retention**: 90 days hot (Loki / OpenSearch) + 1 year cold (S3). See the
  [data governance retention policy](../../TODO/data_governance/TODO_retention_policy.md).

---

## 7. Feature Lifecycle

Every feature has a known state. A feature without a state is in limbo.

### States

| State | Visibility | SLA | Badge in UI | CHANGELOG |
| --- | --- | --- | --- | --- |
| **Alpha** | Internal only | None | Hidden | Internal entry only |
| **Closed Beta** | Invited customers | None (best-effort) | `BETA` (private) | `[beta]` annotation |
| **Open Beta** | Public | Basic (best-effort) | `BETA` (public) | `[beta]` annotation |
| **GA** | All | Full SLA | None (default) | Full entry |
| **Deprecated** | All | Maintenance only | `DEPRECATED` | `[deprecated]` entry |
| **Sunset** | Removed | N/a | — | `[removed]` entry |

### Transition rules

- **Alpha → Closed Beta:** IC approval + at least 1 design review.
- **Closed Beta → Open Beta:** feedback incorporated; basic monitoring in place.
- **Open Beta → GA:** SLA gates met; runbook authored; documentation complete.
- **GA → Deprecated:** minimum **6-month notice** for Pro/Team; **12 months** for
  Enterprise and public API endpoints. Customer comms required.
- **Deprecated → Sunset:** only after the notice period expires and a migration
  path is confirmed working for all affected customers.

### Feature registry

Every feature is registered in the Linear feature-flags project with its current
state, the owning team, the flag key, and the transition dates. No unregistered
flags in production.

---

## 8. Local Development Environment

`git clone && make dev` → working local environment in **< 15 minutes**.

### Commands

```bash
make setup    # One-time: install Node/pnpm/Python, verify Docker, configure git hooks
make dev      # Boot full local stack (see docker-compose.dev.yml)
make seed     # Load dev fixtures: synthetic events, sample users, sample sources
make test     # Run full test suite (unit + integration)
make lint     # Biome + oxlint + commitlint check
make clean    # Stop containers, remove volumes
```

### Local stack (docker-compose.dev.yml)

| Service | Image | Port |
| --- | --- | --- |
| PostgreSQL 16 + PostGIS | `postgis/postgis:16-3.4` | 5432 |
| Redis | `redis:7-alpine` | 6379 |
| Kafka (Redpanda) | `redpandadata/redpanda:latest` | 9092 / 9644 |
| Elasticsearch | `docker.elastic.co/elasticsearch/elasticsearch:8` | 9200 |
| Qdrant | `qdrant/qdrant` | 6333 |
| MinIO (S3-compatible) | `minio/minio` | 9000 / 9001 |

All services have `healthcheck` configurations; `make dev` waits for all to be
healthy before printing the "ready" message.

### Secrets

- **`.env.local`** (git-ignored): developer overrides.
- **`.env.example`** (committed): shows every variable name with a placeholder.
- **1Password / Doppler CLI** for shared secrets in the team. `make setup`
  prompts to configure whichever the team uses.
- No secrets hard-coded in compose files or source.

### Per-service hot-reload

Every service in the monorepo runs with hot-reload in dev:
- Next.js: built-in HMR.
- NestJS / Fastify: `tsx --watch` or `nodemon`.
- Python (FastAPI): `uvicorn --reload`.
- Go (ingest/tiles): `air` for hot-reload.

### Devcontainer (VS Code)

A `.devcontainer/devcontainer.json` provides full parity on macOS, Linux, and
Windows (WSL2). Contains all tools pre-installed. Recommended for new engineers
and cross-platform contributors.

### Per-OS quirks

| Platform | Known issue | Mitigation |
| --- | --- | --- |
| macOS | Kafka broker advertised listener | Set `KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092` |
| WSL2 | Docker Desktop file-sync latency | Use WSL2 filesystem (not /mnt/c/) for the repo |
| Linux | Postgres port conflict | Stop system postgres: `sudo systemctl stop postgresql` |

### Dev-env doctor

```bash
make doctor   # Checks versions, running services, env vars — outputs pass/fail per item
```

Any `make dev` failure in the first-PR flow opens a GitHub issue pre-filled with
the `make dev` output. The on-call for the Platform area owns the SLA for
responding to "I can't get dev running" issues (< 4 h during business hours).

---

## 9. PR & Issue Templates

Templates make best behavior the path of least resistance.

### PR template (`.github/PULL_REQUEST_TEMPLATE.md`)

Already deployed — see the [existing template](../../.github/PULL_REQUEST_TEMPLATE.md).
Extended checklist items beyond the current template:

```markdown
## Reviewer hint
<!-- Who knows this area? Tag them or note the right CODEOWNERS team. -->

## Checklist
- [ ] Tests added / updated
- [ ] i18n keys added to all active locales (or N/A)
- [ ] SEO impact considered (URLs / canonical / schema)
- [ ] No PII in logs or error responses
- [ ] No secrets committed
- [ ] Persona tagged (which user persona does this serve?) [P1/P2/P3/P4/P5/P6/P7/P8]
- [ ] Feature lifecycle state set (Alpha/Beta/GA) + flag registered
- [ ] Accessibility: keyboard + screen-reader tested (if UI change)
- [ ] Error states handled with recovery path
```

### Issue templates (`.github/ISSUE_TEMPLATE/`)

| Template | Filename | Key fields |
| --- | --- | --- |
| Bug report | `bug_report.md` | Steps to reproduce, expected vs. actual, `trace_id` if available, severity estimate |
| Feature request | `feature_request.md` | Problem statement, persona(s) affected, proposed solution, alternatives considered |
| Security disclosure | `security.md` | Points to `/security` policy and `security@aegis-lens.com`; no detail in public issue |
| Documentation issue | `docs_issue.md` | Page URL, what's wrong, suggested fix |
| Source-quality issue | `source_quality.md` | Source ID, issue type (stale / low-quality / mis-attributed), evidence |

**CODEOWNERS** is enforced via branch protection (see `.github/CODEOWNERS`).

---

*This document supersedes any conflicting guidance in the handbook on these
topics. Amendments via RFC; bikeshedding via PR comment with a reference to the
relevant principle number.*
