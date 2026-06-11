# Runbook: <Scenario / Service>

> Copy this file to `docs/runbooks/<area>/<slug>.md`. Every alert that can page a
> human MUST link to a runbook built from this template.

| Field | Value |
| --- | --- |
| **Owner** | `<team / person>` |
| **Service area** | `<platform / data / geo-nlp-verify / infra / security>` |
| **Severity** | `<typical SEV when this fires>` |
| **Last validated** | `<YYYY-MM-DD>` — see [staleness rule](README.md#practiced-vs-stale) |
| **Status** | `🟢 practiced` / `🟡 aging` / `🔴 stale` |
| **Dashboards** | `<links>` |
| **Alerts** | `<PagerDuty service / alert names that route here>` |

## Trigger

What fires this runbook (alert name, symptom, or report). Be specific enough
that the on-call knows they're in the right place within 10 seconds.

## Confirm / assess

How to verify it's real and gauge blast radius before acting (queries,
dashboards, what "normal" looks like). Distinguish from look-alikes.

## Steps (mitigate)

Numbered, copy-pasteable. Least-disruptive first. Each step says what to run,
expected result, and how to tell if it worked.

1. ...
2. ...

## Verification

How to confirm the issue is mitigated (metrics green, error rate normal for N
minutes).

## Rollback

How to undo each mitigation safely, in reverse order, if it makes things worse.

## Escalation

Who to pull in and when (secondary, IC, EM, security, legal). Link the relevant
incident-response runbook.

## Related
- `<linked runbooks, ADRs, postmortems>`
