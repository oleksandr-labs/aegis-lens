# TODO — Incident Response Overview

## Goal
Clear, practiced playbook for any incident class. Detect → contain → eradicate → recover → review.

## Progress
- 10 / 10 done

## Tasks
- [x] Incident classification: SEV-1 / SEV-2 / SEV-3 / SEV-4 — SEV table in `docs/security/incident-response-runbook.md`
- [x] On-call rotation per service area → [docs/engineering/on-call.md](../../docs/engineering/on-call.md)
- [x] Incident commander role + handoff protocol — IC/TL/Comms Lead/Scribe roles defined in runbook
- [x] PagerDuty + Slack #incidents bridge → [docs/security/incident-program.md](../../docs/security/incident-program.md) §1 (auto-create channel, runbook deep-link, severity actions)
- [x] Status page + customer comms templates — 3 status page templates + customer email template in runbook
- [x] Postmortem template (blameless) — `docs/security/postmortem-template.md`
- [x] Action-item tracking + ownership → [incident-program.md](../../docs/security/incident-program.md) §2 (Linear `incident-action`, named owner + due date, P0/P1/P2, biweekly review)
- [x] Quarterly tabletop exercises → [incident-program.md](../../docs/security/incident-program.md) §7 (feeds scenario library, updates runbook last-validated)
- [x] External communications policy → [incident-program.md](../../docs/security/incident-program.md) §9 (single approver, no premature attribution, EN+UK, public SEV-1 postmortems)
- [x] Legal escalation criteria (incident → counsel involvement) — legal escalation section in runbook (GDPR 72h, nation-state, law enforcement)

## i18n
- Customer comms templates in EN + UK.

### Примітки
Practice before you need to. The first real incident exposes every weak runbook.

### Done notes (2026-05-30)
Closed the remaining 5 items via [docs/security/incident-program.md](../../docs/security/incident-program.md)
(the program layer around the runbooks: PagerDuty↔Slack bridge, action-item
tracking, tabletops, external-comms policy) plus the new
[on-call handbook](../../docs/engineering/on-call.md). The six incident-class
runbooks are now all written and indexed in [docs/runbooks/README.md](../../docs/runbooks/README.md).
