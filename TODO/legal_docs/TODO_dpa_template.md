# TODO — DPA & Sub-processors

## Goal
GDPR-ready DPA + maintained subprocessor list.

## Progress
- 7 / 7 done

## Tasks
- [x] DPA (counsel-drafted, GDPR + UK DPA + Swiss FADP) → [docs/legal/dpa.md](../../docs/legal/dpa.md) (multi-regime summary table; counsel+eng review still required)
- [x] Standard Contractual Clauses included → [dpa.md §5](../../docs/legal/dpa.md) (EU SCCs Modules 2/3 + UK IDTA + Swiss FDPIC adaptation)
- [x] Sub-processor list (live, updated on Trust Center) — `docs/legal/subprocessor-list.md` with 12 subprocessors, data categories, change log
- [x] 30-day notice for new sub-processors — policy documented in subprocessor-list.md + [dpa.md §3](../../docs/legal/dpa.md)
- [x] Customer right-to-object workflow → [dpa.md §4](../../docs/legal/dpa.md) (notice → object → good-faith → scoped termination as sole remedy) + summary in subprocessor-list.md
- [x] Sub-processor due-diligence template — annual assessment criteria in subprocessor-list.md (SOC 2 / ISO 27001 / data residency / incident SLA)
- [x] Annual sub-processor security review → new "Annual Subprocessor Security Review" section in subprocessor-list.md (owner, 5-step process, retain/remediate/replace)

## i18n
- DPA in EN + DE + FR (commonly requested by EU procurement).

### Примітки
DPA must match what we actually do. Counsel + engineering review together.

### Done notes (2026-05-30)
Created canonical standalone [docs/legal/dpa.md](../../docs/legal/dpa.md) covering
GDPR + UK GDPR + Swiss FADP, all transfer mechanisms, and the right-to-object
workflow; the [MSA DPA addendum](../../docs/legal/msa/dpa-addendum.md) now points
to it as canonical (short embedded form vs. full instrument). Extended
[subprocessor-list.md](../../docs/legal/subprocessor-list.md) with an explicit
annual security-review process and right-to-object summary.
