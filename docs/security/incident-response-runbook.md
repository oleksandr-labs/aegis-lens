# Aegis Lens — Incident Response Runbook

## Severity Classification

| SEV | Definition | Response SLA | Commander |
|-----|------------|-------------|-----------|
| SEV-1 | Complete outage or data breach | 15 min | On-call lead + VP Eng |
| SEV-2 | Major degradation, data quality incident | 1 hour | On-call engineer |
| SEV-3 | Minor degradation, single-service failure | 4 hours | Team lead |
| SEV-4 | Low-impact, cosmetic, no customer impact | Next business day | Assignee |

## Roles

| Role | Responsibility |
|------|----------------|
| **Incident Commander (IC)** | Coordinates response, owns timeline, decides escalations |
| **Technical Lead (TL)** | Investigates root cause, proposes + executes fix |
| **Comms Lead** | Writes customer updates, posts to status page |
| **Scribe** | Keeps the incident timeline, captures decisions |

## SEV-1 / SEV-2 Response Steps

### 1. Detect (0–5 min)
- Alert fires in PagerDuty / Grafana / customer report
- On-call acknowledges within 5 minutes
- Open Slack incident channel: `#incident-YYYY-MM-DD-<slug>`
- Assign IC, TL, Comms Lead, Scribe

### 2. Assess (5–15 min)
- Determine SEV level (see table above)
- Identify affected services, regions, customers
- Declare customer impact: yes / no / unknown
- If SEV-1: notify VP Eng + CEO immediately

### 3. Contain (15–60 min)
- Isolate the blast radius (feature flag off, traffic shifted, rollback deployed)
- Preserve evidence BEFORE fixing (logs, DB snapshots, heap dumps)
- Update status page: "Investigating" → "Identified" → "Monitoring"

### 4. Eradicate (varies)
- Deploy fix to staging → verify → production
- For data incidents: assess scope, determine if GDPR notification required
- For security incidents: rotate secrets, revoke compromised credentials

### 5. Recover (post-fix)
- Run smoke tests, confirm metrics green
- Update status page: "Resolved"
- Send customer communication if impact > 15 min or data involved
- Remove any emergency bypasses (feature flags, allowlists)

### 6. Review (24–72 hours post)
- Mandatory postmortem for SEV-1 and SEV-2 (see `postmortem-template.md`)
- Optional for SEV-3 if systemic issue identified
- Action items assigned with owners and due dates

## Legal Escalation Criteria

Involve legal counsel immediately if:
- Personal data of EU/UK residents was accessed by unauthorized parties (GDPR: 72h notification window)
- A nation-state actor is suspected
- Law enforcement has requested data
- A journalist or activist's data may have been exposed
- Customer contract SLAs are breached

## Communication Templates

### Status Page — Investigating
```
We are investigating reports of [DESCRIPTION]. Our team has been paged and is actively working on the issue.
```

### Status Page — Identified
```
We have identified the cause of [DESCRIPTION] and are deploying a fix. We expect resolution by [TIME UTC].
```

### Status Page — Resolved
```
This incident has been resolved. [DESCRIPTION] was caused by [BRIEF ROOT CAUSE]. We are completing a full postmortem and will publish findings for SEV-1 incidents.
```

### Customer Email (SEV-1 with data impact)
```
Subject: [ACTION REQUIRED] Aegis Lens Security Notification

Dear [NAME],

On [DATE] at [TIME UTC], we detected [BRIEF DESCRIPTION]. We are writing to inform you that [SPECIFIC IMPACT].

What we did:
- [ACTION 1]
- [ACTION 2]

What you should do:
- [USER ACTION IF ANY, otherwise "No action required"]

We take the security of your data seriously. Full details will be shared in our incident report at [URL].

[SIGNATURE]
```
