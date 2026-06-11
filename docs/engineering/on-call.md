# On-Call

> **Philosophy: the best on-call is the boring one. Engineer toward boring.**
> On-call exists to keep the platform reliable for people who depend on it
> during a conflict — not to normalize 3 a.m. heroics. We optimize for
> sustainability first; a humane rotation that people can run for years beats a
> heroic one that burns the team out in months.

## 1. Rotation structure

On-call is organized **per service area** so the pager goes to someone who can
actually fix the thing:

| Service area | What it covers |
| --- | --- |
| **Platform / web** | `apps/web`, API edge, auth, CDN/Cloudflare |
| **Data / ingest** | `services/ingest`, source adapters, Kafka, Airflow/Temporal |
| **Geo / NLP / verify** | `services/geo`, `services/nlp`, `services/verify`, model serving |
| **Infra / data stores** | Postgres/PostGIS, k8s, Terraform, networking, backups |

Each area runs a **weekly** rotation (Mon 10:00 local → next Mon 10:00).
Rotations are sized so each engineer is on-call **no more than 1 week in N**,
with `N ≥ 4` (add people or merge thin areas before going below 4).

## 2. Primary + secondary

Every shift has a **primary** and a **secondary**.

- **Primary** takes the page first.
- **Secondary** is the escalation if the primary doesn't ack within the
  escalation window (see §6), and is a sanity-check partner for big incidents.
- Secondary should be from the same or an adjacent area so they can genuinely
  help, not just re-page.

The **Incident Commander** role (for SEV-1/SEV-2) is separate and may be the
secondary, an EM, or a designated IC — see the incident-response runbook.

## 3. Shift handoff

Every shift ends with a **handoff doc** (template below), posted in the on-call
channel and linked from the rotation. No silent handoffs.

```
## On-call handoff — <area> — <YYYY-MM-DD>
Outgoing: <name>   Incoming: <name>

### Open / watch items
- <alert or system that is flaky / under watch, with link>

### Pages this shift
- <count>; notable: <one-liner + incident link>

### Deploys / changes in flight
- <anything mid-rollout, feature flags toggled, migrations running>

### Follow-ups handed off
- <action items not yet closed, with owner/issue link>

### Anything the incoming on-call should NOT be surprised by
- <e.g., known noisy alert, planned maintenance, source outage>
```

## 4. Compensation policy

On-call is paid work, not a favor.

- **On-call stipend** per completed shift (flat rate, paid regardless of page
  volume) — `[$X / week primary, $Y / week secondary]`, set in the comp policy.
- **Out-of-hours page handling** beyond the stipend: time worked outside normal
  hours is compensated as **time off in lieu (TOIL)** or overtime per local law,
  whichever the jurisdiction requires.
- Stipend and TOIL apply to all engineers on rotation regardless of level.
- Managers running rotations are responsible for ensuring comp is actually paid —
  track it; don't let it lapse.

## 5. Sustainable load & burnout prevention

**Target: fewer than 2 pages per week per shift, averaged per quarter.** This is
a hard signal, not a nicety:

- If an area exceeds 2 pages/week for **2 consecutive weeks**, that triggers a
  reliability review — fix the underlying noise/instability before adding more
  on-call humans.
- **Alert hygiene:** every page must be actionable. A page that resolves itself
  or has no runbook is a bug in the alerting — file it and fix or delete the
  alert. Track "non-actionable page %" and drive it down.
- **Post-incident time off:** anyone who works a SEV-1 or a multi-hour overnight
  incident gets the next day (or equivalent) off, no questions, no guilt. EMs
  enforce this proactively.
- **No double-booking:** don't schedule someone for on-call during PTO,
  immediately after a major incident week, or on top of a launch they own.
- **Right to escalate:** any on-call may wake the secondary, the EM, or pull in
  help at any time. We never penalize "I needed help."

## 6. Paging & escalation mechanics (PagerDuty)

- **Tool:** PagerDuty. Each service area maps to a PagerDuty **service** and
  **escalation policy**; alerts route from monitoring → PagerDuty service →
  primary → (after escalation window) secondary → EM.
- **Escalation window:** primary has `[5 minutes]` to ack a SEV-1/SEV-2 page
  before it escalates to secondary; another `[5 minutes]` before EM.
- **Severity → urgency:** SEV-1/SEV-2 = high-urgency (phone + push, 24×7);
  SEV-3/SEV-4 = low-urgency (notification, business hours where contractually
  allowed — see the SLA addendum response targets).
- **Integration coverage:** every production service emits alerts into its
  PagerDuty service. A service with no PagerDuty integration is **not considered
  production-ready** — this is checked in the runbook-coverage audit (§8).
- Maintain a single source of truth for who is on-call (PagerDuty schedule),
  surfaced in the on-call channel topic and the status dashboard.

## 7. Quarterly on-call retro

Once per quarter, per area + one cross-team:

- Review page volume vs. the < 2/week target, top noisy alerts, MTTA/MTTR.
- Identify the top 3 sources of pages and assign owners to eliminate them.
- Review handoff quality and comp accuracy.
- Surface burnout signals honestly; adjust rotation size if `N` is too small.
- Output: a short action list with owners, tracked to the next retro.

## 8. Runbook coverage audit (quarterly)

- Inventory active alerts per area against the runbooks index
  ([`../../TODO/internal_docs/TODO_runbooks_index.md`](../../TODO/internal_docs/TODO_runbooks_index.md)
  / the runbooks directory).
- **Every alert that can page a human must link to a runbook** with: what it
  means, how to confirm, first mitigations, and escalation. No-runbook alerts
  are either given one or downgraded/deleted.
- New production services must ship with a runbook and PagerDuty integration
  (gate this in the launch checklist).

## Related
- Incident response & severities → [`../security/incident-response-runbook.md`](../security/incident-response-runbook.md)
- Postmortems → [`../security/postmortem-template.md`](../security/postmortem-template.md)
- Source outages → [`../../TODO/incident_response/TODO_source_outage.md`](../../TODO/incident_response/TODO_source_outage.md)
- SLA response targets → [`../legal/msa/sla-addendum.md`](../legal/msa/sla-addendum.md)
