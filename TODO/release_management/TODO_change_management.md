# TODO — Customer-Impacting Change Management

## Goal
Anything that changes customer experience, pricing, terms, or data — communicated transparently with lead time.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.56)

## Tasks
- [x] Per-change classification (low / medium / high impact) → [docs/release/release-management.md §3.1](../../docs/release/release-management.md)
- [x] Per-tier notice lead-time (e.g. price change → 60d notice; ToS material → 30d) → [docs/release/release-management.md §3.2](../../docs/release/release-management.md)
- [x] Multi-channel comms (in-app + email + status page + docs) → [docs/release/release-management.md §3.3](../../docs/release/release-management.md)
- [x] Per-change FAQ + support macros → [docs/release/release-management.md §3.4](../../docs/release/release-management.md)
- [x] Migration help articles → [docs/release/release-management.md §3.5](../../docs/release/release-management.md)
- [x] Rollback policy + grace period → [docs/release/release-management.md §3.6](../../docs/release/release-management.md)
- [x] Per-change retrospective → [docs/release/release-management.md §3.7](../../docs/release/release-management.md)
- [x] Customer comms approval gate (legal + leadership) → [docs/release/release-management.md §3.8](../../docs/release/release-management.md)

### Done notes (2026-05-30)
Full change management in `docs/release/release-management.md §Part 3`. Classification: 4 levels (Low: changelog / Medium: 7-day in-app+newsletter / High: 30–60d email+in-app+status / Critical: immediate). Per-tier notice table: Free 30d / Pro/Team 30–60d / Enterprise/Gov 60–180d (or per contract). Multi-channel sequence: docs updated 48h before → in-app banner Day 1 → direct email Day 1 → status page on deploy → changelog on deploy → support macros 7 days before. Per-change FAQ: top 5 anticipated questions + macros loaded in support tool before first ticket. Migration help articles at `/docs/migration/[change-slug]`: old→new→steps→code examples→FAQ; live ≥ 7 days before notice period. Rollback policy: 7-day grace period (30 days Enterprise); no grace for security patches; > 5% enterprise blocking issues → restore old behavior. Per-change retro at 30 days (customer impact, tickets, churn attribution). Approval gate: Legal + CEO/VP Product + Head of CS — all 3 must sign off before High/Critical comms go out.

## i18n
- Customer comms localized.

### Примітки
Surprise changes destroy trust. Even when right, communicate early.
