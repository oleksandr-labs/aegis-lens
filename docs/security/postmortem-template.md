# Postmortem: [INCIDENT TITLE]

> **Status:** Draft / Review / Final
> **SEV:** 1 / 2 / 3
> **Incident date:** YYYY-MM-DD HH:MM UTC
> **Resolution date:** YYYY-MM-DD HH:MM UTC
> **Duration:** X hours Y minutes
> **Incident Commander:** @name
> **Authors:** @name, @name

---

## Impact

- **Users affected:** ~N users / all users in region X / specific org Y
- **Services affected:** service-a, service-b
- **Data impact:** None / Read-only data exposed / Write data corrupted
- **SLA breach:** Yes / No — [details]

---

## Timeline

All times UTC.

| Time | Event |
|------|-------|
| HH:MM | Alert fires in PagerDuty |
| HH:MM | On-call acknowledges, opens #incident channel |
| HH:MM | IC assigned, SEV declared |
| HH:MM | Root cause identified: [brief] |
| HH:MM | Fix deployed to staging |
| HH:MM | Fix deployed to production |
| HH:MM | Metrics confirmed green, incident resolved |
| HH:MM | Status page updated: Resolved |

---

## Root Cause

[Precise, technical description of what caused the incident. Include the specific line of code, config value, dependency version, race condition, or operational mistake.]

---

## Contributing Factors

[What made this incident more likely or harder to detect/resolve? These are systemic issues, not individuals.]

- Factor 1: [e.g., no alerting on X metric]
- Factor 2: [e.g., runbook was outdated]
- Factor 3: [e.g., dependency had no fallback]

---

## What went well

- Detection was fast (X minutes)
- Rollback procedure was clear and worked
- Team communication was effective

---

## Action Items

| Item | Owner | Due | Status |
|------|-------|-----|--------|
| Add alert for [metric] | @engineer | YYYY-MM-DD | Open |
| Update runbook for [scenario] | @engineer | YYYY-MM-DD | Open |
| Add integration test for [case] | @engineer | YYYY-MM-DD | Open |
| Review [dependency] upgrade path | @engineer | YYYY-MM-DD | Open |

---

## Lessons Learned

[3–5 sentences on what the team collectively learned. Focus on systemic improvements, not individual blame.]

---

*Blameless postmortem. The goal is systemic learning, not individual accountability.*
