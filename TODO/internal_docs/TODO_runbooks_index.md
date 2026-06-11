# TODO — Runbooks Index

## Goal
A single navigable index of every operational runbook.

## Progress
- 8 / 8 done

## Tasks
- [x] Index page listing all runbooks (per service + per scenario) → [docs/runbooks/README.md](../../docs/runbooks/README.md)
- [x] Runbook template (trigger / steps / verification / rollback) → [docs/runbooks/_template.md](../../docs/runbooks/_template.md)
- [x] Per-runbook ownership + last-validated-at → header block in template + index table columns
- [x] Quarterly runbook drill schedule → drill schedule table in index
- [x] Link to relevant dashboards + alerts per runbook → Dashboards/Alerts fields in template + index
- [x] Practiced-vs-stale flag → 🟢/🟡/🔴 status derived from last-validated age (≤90 / 91–180 / >180 days)
- [x] Search across runbooks → search section (repo grep + docs-site, keyword-rich titles/triggers)
- [x] Auto-link from PagerDuty alert → runbook → `runbook_url` annotation convention + audit gate

## i18n
- EN.

### Примітки
A runbook unread for 6 months is unverified. Drill regularly.

### Done notes (2026-05-30)
Index at [docs/runbooks/README.md](../../docs/runbooks/README.md) with the six
incident-class runbooks linked + a placeholder section for per-service runbooks.
Reusable template at [docs/runbooks/_template.md](../../docs/runbooks/_template.md).
Staleness flag is mechanical (derived from last-validated date), and the
quarterly drill schedule + PagerDuty `runbook_url` linking close the
"unverified runbook" gap.
