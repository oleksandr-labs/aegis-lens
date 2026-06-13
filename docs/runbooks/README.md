# Runbooks Index

> A single navigable index of every operational runbook. **A runbook unread for
> 6 months is unverified — drill regularly.**

Every runbook is built from [`_template.md`](_template.md): trigger → confirm →
steps → verification → rollback → escalation, with an owner and a
**last-validated-at** date.

## How to use this index

- **During an incident:** Ctrl-F the symptom or service. PagerDuty alerts
  deep-link straight to the matching runbook (see [Alert → runbook linking](#alert--runbook-linking)).
- **Adding a runbook:** copy the template, fill the header, and add a row below.
  A production service with no runbook is not launch-ready.

## Index

### Incident-class runbooks (scenario-based)

| Runbook | Trigger | Owner | Last validated | Status |
| --- | --- | --- | --- | --- |
| [Incident response (overview)](../security/incident-response-runbook.md) | Any SEV-1/2 | Eng leadership | 2026-05 | 🟢 |
| [On-call diagnostics (`ax` CLI)](oncall-diagnostics.md) | Any page — fact-finding before mitigation | Platform on-call | 2026-06 | 🟢 |
| [Data incident](../security/data-incident-runbook.md) | Data quality SLO breach / wrong data published | Data/ingest | 2026-05 | 🟢 |
| [Security incident](../security/security-incident-runbook.md) | Compromised credential / breach / active exploit | Security | 2026-05 | 🟢 |
| [Source outage](../security/source-outage-runbook.md) | Source-health SLO (median gap exceeded) | Data/ingest | 2026-05 | 🟢 |
| [AI regression](../security/ai-regression-runbook.md) | Eval-suite regression / user-report cluster | Geo-NLP-verify | 2026-05 | 🟢 |
| [DDoS / abuse](../security/ddos-response-runbook.md) | Edge traffic spike / 5xx surge | Platform + Security | 2026-05 | 🟢 |

### Service runbooks (per-service operations)

> Add as services harden. Each new production service ships one of these.

| Runbook | Service area | Owner | Last validated | Status |
| --- | --- | --- | --- | --- |
| _(add: Postgres failover, Kafka lag, ingest adapter stall, model-serving OOM, …)_ | | | | 🔴 |

## Practiced-vs-stale

A runbook's **Status** flag is derived from `last validated`:

| Status | Meaning | Age |
| --- | --- | --- |
| 🟢 practiced | Validated in a drill or used in a real incident | ≤ 90 days |
| 🟡 aging | Due for a drill | 91–180 days |
| 🔴 stale | Unverified — **do not trust blindly** | > 180 days |

The runbook-coverage audit (quarterly, see [on-call §8](../engineering/on-call.md))
flags every 🔴 and schedules a drill.

## Quarterly runbook drill schedule

Each quarter, every owning team drills at least the incident-class runbooks for
its area plus its oldest 🔴 service runbook. Drills update `last validated` and
feed gaps into the [tabletop library](../security/incident-program.md#tabletop-exercises).

| Quarter | Area | Runbooks drilled |
| --- | --- | --- |
| Q3 2026 | Data/ingest | Data incident, Source outage |
| Q3 2026 | Security | Security incident, DDoS |
| Q4 2026 | Geo-NLP-verify | AI regression |
| Q4 2026 | Infra | Postgres failover, Kafka lag (once authored) |

## Alert → runbook linking

Each PagerDuty alert carries a `runbook_url` annotation pointing to the matching
file in this directory. The runbook-coverage audit fails any pageable alert
whose `runbook_url` is missing or returns 404. New alerts must set it at
creation — enforce in the alert-definition review.

## Search

Runbooks are plain markdown under `docs/runbooks/` + the incident-class set under
`docs/security/`. Search via repo grep or the docs-site search. Keep titles and
trigger lines keyword-rich (service name, alert name, symptom) so search finds
them under pressure.
