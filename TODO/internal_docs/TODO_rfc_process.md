# TODO — RFC Process (Beyond ADR)

## Goal
Bigger architectural / product / process changes deserve proposal + review + decision before code.

## Progress
- 8 / 8 done

## Tasks
- [x] RFC template (problem / context / proposed / alternatives / impact / migration / open Qs) → [docs/rfc/0000-template.md](../../docs/rfc/0000-template.md)
- [x] Numbered, versioned in `docs/rfc/NNNN-title.md` → [docs/rfc/](../../docs/rfc/) (README + template + 0001 seed)
- [x] Per-RFC owner + reviewers + decision-by date → template header fields
- [x] 1-week minimum review window → README "The process" §2 (5 business days)
- [x] Decision-meeting if needed; otherwise async approve → README §3
- [x] Implementation links back to RFC → README "Linking implementation back" (RFC-NNNN in PRs, bidirectional)
- [x] Annual RFC retro (which RFCs aged well?) → README "Annual RFC retro"
- [x] Public-safe RFC mirror (engineering credibility) → README "Public-safe RFC mirror"

## i18n
- EN.

### Примітки
RFCs prevent "wait, what?" surprises in code review.

### Done notes (2026-05-30)
RFC framework under [docs/rfc/](../../docs/rfc/): README (incl. a clear RFC-vs-ADR
decision table), [template](../../docs/rfc/0000-template.md), and meta seed
[RFC-0001](../../docs/rfc/0001-rfc-process.md) adopting the process. Reconciled the
engineering handbook's stale path references: ADRs now point at `docs/adr/` (was
`docs/decisions/`) and RFCs at `docs/rfc/` (was `docs/rfcs/`).
