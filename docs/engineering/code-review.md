# Code Review Standards

> Reviews that **catch bugs + share knowledge + ship fast** — in that order, but
> all three matter. **Reviews are how culture transmits. Take them seriously.**

This is the detailed standard. The [engineering handbook](handbook.md#code-review-standards)
carries the summary; this page is the source of truth.

## 1. Turnaround SLA

- **First response within 4 business hours.** A PR that's ready for review should
  not sit longer. "First response" = an approval, a request for changes, or a
  substantive question — not a 👀 emoji.
- Reviewing is **interrupt-priority work**, above your own feature work but below
  an active incident. Unblocking a teammate beats making marginal progress alone.
- If you can't review within the SLA, say so and reassign — don't silently sit on
  it.

## 2. PR size cap

- **Target under 400 lines of diff** (excluding generated files, lockfiles,
  snapshots). Larger PRs hide bugs and get rubber-stamped.
- Bigger is allowed **only when justified** — say why in the description
  (mechanical rename, generated code, a migration that can't be split). Reviewers
  may ask to split a PR that's large without justification.
- Stacked/sequential PRs are the preferred way to ship a big change in
  reviewable chunks.

## 3. Reviewers required

- **At least 1 reviewer from the owning team** (the team that owns the touched
  code, per CODEOWNERS). Cross-team context is not a substitute for owning-team
  knowledge.
- **1 approval** for most changes.
- **2 approvals, at least one senior**, for high-risk areas (see §6).

## 4. Author & reviewer roles

**Author responsibilities:**
- Open a PR that's actually ready: passes CI, fills the
  [PR template](../../.github/PULL_REQUEST_TEMPLATE.md), small and focused.
- Write the description so the reviewer can understand *why* without a meeting.
- Respond to every comment (resolve, push a fix, or push back with reasoning).
- The author merges after approvals + green CI (you own your change landing).

**Reviewer responsibilities:**
- Review against the description and the checklist in §7.
- Be specific and kind; distinguish **blocking** ("must fix") from
  **non-blocking** ("nit:" / "consider:"). Prefix non-blocking comments so the
  author can triage.
- Approve when it's good enough to ship, not when it's perfect. Don't gate on
  taste; gate on correctness, safety, and maintainability.

## 5. CODEOWNERS enforced

- Ownership is defined in [`.github/CODEOWNERS`](../../.github/CODEOWNERS) and
  **enforced via branch protection** (required review from code owners on `main`).
- Touching a path auto-requests its owners. Owners keep their globs current as
  the codebase evolves.

## 6. Per-area review priorities

Some changes carry more risk and need senior eyes:

| Area | Requirement |
| --- | --- |
| Auth / authn / authz, session, RLS | **2 approvals, ≥1 senior** |
| Schema migrations | **2 approvals, ≥1 senior**; migration safety verified (no unguarded `DROP`, no `ADD COLUMN NOT NULL` without default) |
| Safety / verification guardrails | **2 approvals, ≥1 senior**; red-team suite green |
| Public APIs / event schema (breaking) | **2 approvals, ≥1 senior**; backward-compat or RFC linked |
| Billing / payments | **2 approvals, ≥1 senior** |
| Anything touching source-protection / PII redaction | **2 approvals, ≥1 senior** |
| Everything else | 1 approval |

High-risk PRs should also reference the relevant [ADR](../adr/README.md) or
[RFC](../rfc/README.md).

## 7. No stamping without reading

- **An approval means "I read this and I'd be comfortable being paged for it."**
  Stamping unread is a culture failure, not a favor.
- If a PR is too big or outside your expertise to review honestly, say so and
  pull in the right reviewer — don't approve to be polite.
- Reviewer checklist:
  - [ ] Does it do what the description says?
  - [ ] Security: injection, XSS, unauthed endpoints, secrets, PII in logs?
  - [ ] Migration safety (see §6)?
  - [ ] Edge cases and error paths handled?
  - [ ] Is it easy to change/delete later?
  - [ ] Tests cover the behavior (not internals)?
- **Not** the reviewer's job: style (ESLint/Prettier), micro-optimizations
  without a baseline, chasing 100% coverage.

## 8. PR description template

Already enforced repo-wide via [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)
(summary, motivation, approach, screenshots, migration notes, test plan, and a
checklist for tests / i18n / SEO / no-PII / no-secrets). Authors fill it; empty
sections that don't apply get an explicit "n/a", not silence.

## 9. Quarterly review-culture retro

- Each quarter, a short retro on review health metrics: median time-to-first-
  review vs. the 4h SLA, PR size distribution, % of PRs with 2+ review rounds,
  and "stamp rate" signals.
- Surface friction (bottleneck reviewers, areas with no owner, recurring nit
  debates that should be auto-enforced) and fix the system, not the people.
- Recurring style debates → move to a lint rule. Recurring bug classes → add a
  check or a checklist item.
