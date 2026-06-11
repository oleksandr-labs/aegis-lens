# TODO — On-Call

## Goal
Sustainable, humane, effective on-call. No hero culture.

## Progress
- 9 / 9 done

## Tasks
- [x] Rotation per service area → §1 (Platform/web, Data/ingest, Geo-NLP-verify, Infra)
- [x] Primary + secondary → §2 (roles, escalation partner, IC separation)
- [x] Handoff doc per shift → §3 (template included)
- [x] On-call compensation policy → §4 (per-shift stipend + TOIL/overtime)
- [x] Sustainable load target: < 2 pages / week → §5 (with 2-week trigger for reliability review)
- [x] Burnout prevention (post-incident time off) → §5 (mandatory day off after SEV-1/overnight)
- [x] Quarterly on-call retro → §7
- [x] Runbook coverage audit per quarter → §8
- [x] PagerDuty integration with services → §6 (service→escalation-policy mapping, severity→urgency, prod-readiness gate)

## i18n
- N/A.

### Примітки
The best on-call is the boring one. Engineer toward boring.

### Done notes (2026-05-30)
Full on-call handbook at [docs/engineering/on-call.md](../../docs/engineering/on-call.md).
Per-area weekly rotations sized N≥4, primary+secondary with PagerDuty escalation
windows, paid stipend + TOIL, hard <2 pages/week target with escalating
reliability review, mandatory post-incident time off, quarterly retro + runbook
coverage audit. Bracketed values (stipend amounts, escalation minutes) left as
config to set in the comp/PagerDuty policy.
