# TODO — Code Review Standards

## Goal
Reviews that catch bugs + share knowledge + ship fast.

## Progress
- 9 / 9 done

## Tasks
- [x] Per-PR turnaround SLA (4h business hours) → [code-review.md](../../docs/engineering/code-review.md) §1 (interrupt-priority, "first response" defined)
- [x] Per-PR size cap (< 400 LOC unless justified) → §2 (stacked PRs preferred for big changes)
- [x] At least 1 reviewer from owning team → §3 (via CODEOWNERS)
- [x] Author + reviewer roles explicit → §4 (author merges; blocking vs nit comments)
- [x] CODEOWNERS enforced → §5 + [.github/CODEOWNERS](../../.github/CODEOWNERS) (full monorepo ownership map, branch-protection enforced)
- [x] Per-area review priorities (security / data / public APIs require senior) → §6 (2-approval matrix incl. auth/migrations/safety/billing/PII)
- [x] No-stamping-without-reading culture → §7 ("approval = I'd be comfortable being paged for it" + reviewer checklist)
- [x] PR description template → §8 + existing [.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md)
- [x] Per-quarter review-culture retro → §9 (metrics: TTR vs 4h SLA, PR size, stamp-rate; fix system not people)

## i18n
- N/A.

### Примітки
Reviews are how culture transmits. Take them seriously.

### Done notes (2026-05-30)
Detailed standard at [docs/engineering/code-review.md](../../docs/engineering/code-review.md)
(handbook carries the summary, links here). Created a real
[.github/CODEOWNERS](../../.github/CODEOWNERS) mapping every package/service/
integration to placeholder `@aegis-lens/*` teams (replace with real GitHub teams),
with senior-review areas (safety, rbac, billing, infra, migrations) called out.
