# TODO — AI Regression Incident Runbook

## Goal
A model deploy makes outputs worse. Roll back, root-cause, prevent recurrence.

## Progress
- 8 / 8 done

## Tasks
- [x] Detect: eval-suite regression alert OR user-report cluster → §1 (per-locale drop alone triggers)
- [x] One-click rollback (Argo CD / model registry) → §2 (pin last-known-good, verify served version)
- [x] Halt new promotions until cleared → §3
- [x] Re-grade affected outputs (HITL sweep) → §4 (window × version, prioritize high-stakes/affected locales)
- [x] Customer comms if user-visible → §5
- [x] Eval-set expansion to cover the missed case → §6
- [x] Promotion-gate review (why did this pass eval?) → §7 (require per-locale non-regression, canary/shadow-eval)
- [x] Postmortem → §8

## i18n
- Per-locale eval coverage check after any regression.

### Примітки
Model regressions hide in tail languages. Test all locales pre-promote.

### Done notes (2026-05-30)
Runbook at [docs/security/ai-regression-runbook.md](../../docs/security/ai-regression-runbook.md),
linked from the [runbooks index](../../docs/runbooks/README.md). Core fix is
process-level: promotion gate must require per-locale non-regression so a model
that improves EN can't silently break tail languages.
