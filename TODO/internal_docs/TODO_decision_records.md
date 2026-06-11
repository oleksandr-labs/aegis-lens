# TODO — Architecture Decision Records (ADRs)

## Goal
Each significant technical decision recorded with context, options, decision, consequences.

## Progress
- 8 / 8 done

## Tasks
- [x] ADR template (status / context / decision / consequences) → [docs/adr/0000-template.md](../../docs/adr/0000-template.md)
- [x] ADR repo in `docs/adr/NNNN-title.md` → [docs/adr/](../../docs/adr/) (README + 0000 template + 0001 seed)
- [x] Numbered, immutable history (deprecate, don't rewrite) → README conventions + status lifecycle (supersede via new ADR)
- [x] CI links ADRs to PRs that implement them → README "CI: link ADRs to PRs" (ADR-NNNN reference, warning-level check)
- [x] Quarterly ADR review for staleness → README "Quarterly staleness review"
- [x] Public ADR mirror for select decisions (engineering credibility) → README "Public ADR mirror"
- [x] New-hire reading list = top 20 ADRs → README "New-hire reading list"
- [x] Tooling (log4brains or similar) → README "Tooling" (markdown source of truth, optional log4brains)

## i18n
- EN.

### Примітки
ADRs prevent "why did we do this?" archaeology. Cheap insurance.

### Done notes (2026-05-30)
ADR framework under [docs/adr/](../../docs/adr/): index README with all
conventions, a reusable [template](../../docs/adr/0000-template.md), and seed
[ADR-0001](../../docs/adr/0001-record-architecture-decisions.md) (the meta-decision
to adopt ADRs). Immutability enforced by convention (supersede, never edit).
