# TODO — Technical Debt Management

## Goal
Track + repay debt deliberately. No "we'll fix it later" black holes.

## Progress
- 8 / 8 done

## Tasks
- [x] Tech-debt register (issue label + Linear list) → §1
- [x] Per-debt: cost / risk / owner / planned remediation → §2 (table of required fields)
- [x] 20% of engineering capacity dedicated to debt + tooling → §3
- [x] Per-quarter debt retro → §4
- [x] Per-team debt budget envelope → §5
- [x] Critical-debt fast-track → §6 (`tech-debt:critical`, jumps the budget)
- [x] No "TODO" comments without ticket reference → §7 (CI linter, ratchet on new only)
- [x] Annual debt audit → §8

## i18n
- N/A.

### Примітки
Debt that's invisible compounds. Make it visible.

### Done notes (2026-05-30)
Policy at [docs/engineering/tech-debt.md](../../docs/engineering/tech-debt.md):
single visible register, mandatory cost/risk/owner per item, 20% capacity
envelope (per-team), critical fast-track, CI-enforced TODO-needs-ticket rule
(ratcheted on new code), and an annual audit that can formally write off accepted
debt. Cross-links the incident quarterly-theme review.
