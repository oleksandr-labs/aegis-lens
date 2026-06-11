# TODO — SecOps Runbook

## Goal
Day-to-day security operations: alerts, triage, hardening backlog.

## Progress
- 10 / 10 done

## Tasks
- [x] On-call security rotation → [secops-runbook.md §1](../../docs/security/secops-runbook.md) (Security service area in on-call rotation; primary Security Lead)
- [x] SIEM (OpenSearch / Wazuh / Panther) with alert tuning → §2 (alert categories + triage SLA table; < 5 non-actionable alerts/day target)
- [x] EDR on developer endpoints → §3 (CrowdStrike/SentinelOne; FDE + screen lock policy; enrolled before credentials)
- [x] Per-alert runbook → §4 (runbook_url in every alert rule; quarterly coverage audit; gate on PR checklist)
- [x] Quarterly hardening sprints → §5 (risk register input + scan findings + pen test output; protected capacity; Linear hardening-sprint-YYYY-QN)
- [x] Vendor security review process → §6 (questionnaire / SOC2; data access review; approve / conditions / reject; annual re-review)
- [x] Phishing simulations → §7 (quarterly; team-level results; high-click → targeted training; phishing@ 1h triage)
- [x] Security training cadence → §8 (annual awareness + onboarding secure coding; quarterly tabletop; semi-annual TM workshop)
- [x] Asset inventory (assets + owners) → §9 (CMDB: cloud resources / k8s / SaaS / endpoints / secrets; named owner; 48h decommission removal)
- [x] Risk register → §10 (R-NNN; likelihood × impact; accepted risks need Security Lead + CTO sign-off; top-10 reviewed semi-annually)

## i18n
- Internal docs EN; customer-facing security pages localized.

### Примітки
SecOps without a backlog is just alerts. Always have hardening tasks queued.

### Done notes (2026-05-30)
[docs/security/secops-runbook.md](../../docs/security/secops-runbook.md). Alert-tuning target (<5 non-
actionable/day) mirrors the on-call <2 pages/week principle. Hardening sprint is protected capacity —
not pulled for features.
