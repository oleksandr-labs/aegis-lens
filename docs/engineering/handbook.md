# Engineering Handbook — Aegis Lens

The canonical reference for how we build. Conventions, decisions, expectations.

---

## Tech Stack Rationale

| Layer | Choice | Why |
|-------|--------|-----|
| Web app | Next.js 15 (App Router) | RSC for SEO + ISR; React ecosystem; Vercel deployment |
| Language | TypeScript (strict) everywhere | Type safety across monorepo; great tooling |
| Database | PostgreSQL 16 + PostGIS + TimescaleDB | Spatial queries (events), time-series partitioning, RLS for multi-tenancy |
| Streaming | Apache Kafka (MSK) | Reliable, replayable event backbone; separates ingest from enrichment |
| Vector search | Qdrant | Rust-native, fast, supports payload filtering; self-hostable |
| Full-text search | Elasticsearch | Proven; multilingual analyzers; strong Ukraine-specific support |
| AI (LLM) | Anthropic Claude (primary) | Grounding, citation adherence; safety-first design |
| Package manager | pnpm + Turbo | Fast monorepo builds; workspace hoisting |
| Infrastructure | AWS + Terraform | Mature, compliant; eu-central-1 primary for EU data residency |
| CDN / DDoS | Cloudflare | Performance + DDoS protection; Workers for edge logic |
| CI/CD | GitHub Actions | Integrated; matrix builds; environment secrets |

---

## Branching & PR Workflow

```
main (protected) ← feature/JIRA-123-short-description
                 ← fix/JIRA-456-short-description
                 ← chore/...
                 ← docs/...
```

Rules:
- **Never push directly to main.** All changes via PR.
- Branch names: `type/TICKET-brief-slug` (kebab-case, max 50 chars)
- PR title: imperative mood, ≤70 chars (`Add drone layer filter by model`)
- Every PR needs: description + test plan + screenshots for UI changes
- Delete branch after merge

---

## Code Review Standards

> Summary below; full standard in [`code-review.md`](code-review.md) (turnaround
> SLA, size cap, CODEOWNERS, per-area senior-review matrix, no-stamping culture,
> quarterly retro).

**Speed:** First response within 4 business hours. Don't let PRs sit.

**Who reviews:**
- 1 approval required (senior or above) for most changes
- 2 approvals for: auth changes, schema migrations, safety/guardrail changes, billing

**What reviewers check:**
- Does it do what the description says?
- Are there obvious security issues (injection, XSS, unauthed endpoints)?
- Are migrations safe? (No `DROP TABLE`, no `ADD COLUMN NOT NULL` without default)
- Are edge cases handled?
- Is the code easy to delete / change later?

**What reviewers do NOT check:**
- Style (enforced by ESLint/Prettier automatically)
- Micro-optimizations without a measured baseline
- Perfect test coverage (pragmatic coverage, not 100%)

---

## Testing Expectations

| Area | Minimum | Target |
|------|---------|--------|
| Services (pure logic) | Unit tests for all exported functions | 80%+ branch coverage |
| API routes | Integration tests for happy path + 401/422/404 | All error paths |
| Safety guardrails | Red-team test suite passes | 100% — no regressions |
| DB migrations | Tested on a real Postgres in CI | All migrations |
| UI components | Story in Storybook | Visual regression via Chromatic |
| E2E | Critical flows (signup, event view, alert create) | Playwright |

**Do not write tests for:**
- Implementation details (test behaviour, not internals)
- Third-party library behaviour
- Type assertions (TypeScript handles this)

---

## Performance Gates (CI)

- TypeScript: zero type errors (strict mode)
- ESLint: zero errors, zero disabled rules without comment
- Bundle: `size-limit` must pass (150KB marketing JS, 600KB workspace JS)
- Postgres migrations: `atlas migrate lint` must pass; `pg_squawk` on changed files
- Security: `trivy fs` must find no CRITICAL/HIGH unfixed vulnerabilities

---

## Architecture Decision Records (ADRs)

ADRs live in [`docs/adr/`](../adr/README.md), numbered and immutable
(`docs/adr/NNNN-title.md`). Use the [template](../adr/0000-template.md):
status / context / options / decision / consequences. Supersede, don't rewrite.

Require an ADR for:
- Introducing a new service or database
- Changing event schema (breaking)
- Adding a new external dependency (billing, legal, data residency implications)
- Changing deployment topology

---

## RFC Process

For significant architectural / product / process changes, write an RFC before
implementing. Full process + template: [`docs/rfc/`](../rfc/README.md)
(`docs/rfc/NNNN-title.md`).

Fields: Problem, Context, Proposed Solution, Alternatives, Impact, Migration
Plan, Open Questions.

RFC must be open for comments for **≥5 business days** before a decision.
Implementation PRs link back to `RFC-NNNN`.

---

## Release Process

1. Merge to `main` → automatic deploy to staging
2. QA smoke test on staging (5 min, manual or automated)
3. Production deploy: `workflow_dispatch` on GitHub Actions → `deploy.yml` → prod
4. Monitor Grafana for 30 min post-deploy; any SEV-2+ → rollback immediately
5. Update CHANGELOG.md

---

## On-Call Expectations

> Full rotation/comp/burnout policy in [`on-call.md`](on-call.md).

- Acknowledge PagerDuty within 5 minutes
- Follow incident runbook (`docs/security/incident-response-runbook.md`)
- If unsure, escalate early — escalation is free
- Update the incident Slack channel every 30 min while active

---

## Sandbox Policy

Want to experiment? Create a branch prefixed `sandbox/` — no review required, deleted after 30 days.
No sandbox code may be merged to main without a proper PR and review.

---

## Open-Source Contribution Policy

Some packages (e.g. `@aegis/filter-dsl`, `@aegis/event-schema`) may be open-sourced.

For contributions *to* external OSS: any PR must be reviewed by a senior engineer to ensure no proprietary logic leaks.
