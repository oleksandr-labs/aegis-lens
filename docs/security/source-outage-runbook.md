# Source Outage Runbook

> **Scope:** a major OSINT source goes silent. Detect, communicate, mitigate,
> recover.
> **Goal: transparent outage handling = trust upside.** Users trust us more when
> we say "source X is delayed" than when we silently serve stale data.

| Field | Value |
| --- | --- |
| Owner | Data / ingest |
| Service area | Data / ingest |
| Typical severity | SEV-2/3 (SEV-1 if a critical source + customer-material) |
| Related | [IR overview](incident-response-runbook.md) · [Data incident](data-incident-runbook.md) · [SLA exclusions](../legal/msa/sla-addendum.md) |

## 1. Detection: source-health SLO

- Each source has a **health SLO** based on its expected cadence: alert when the
  **median gap between updates exceeds** the source's baseline by a defined
  factor (e.g., 3× normal), or when ingest errors/empty-pulls cross a threshold.
- Distinguish a source outage from an ingest-adapter failure on our side (check:
  is the adapter erroring, or is the source genuinely quiet? probe the source
  directly).

## 2. Auto-degrade UI badge

- Flip the affected source to a **"source X delayed / unavailable"** badge in the
  UI automatically when the health SLO breaches. Show last-successful-update time.
- Outputs that depend materially on the degraded source carry a freshness caveat
  rather than presenting stale data as current.

## 3. Re-route to alternate sources where possible

- For coverage that has redundant sources, shift weight to healthy alternates so
  outputs degrade gracefully rather than going blank.
- Note in the event/output provenance that an alternate source was used (keep
  provenance honest — it's part of verification).
- Where no alternate exists, mark the coverage gap explicitly.

## 4. Update public source-health dashboard

- Reflect the outage on the **public source-health dashboard** (and status page
  if customer-material). Show which source, since when, and current state.
- Keep it updated through the lifecycle: degraded → recovering → healthy.

## 5. Contact source operator (where applicable)

- For sources with an operator relationship (APIs, partners, official feeds),
  open a ticket / reach the contact to confirm scope and ETA.
- For open/community sources, monitor known channels for status; don't assume
  it's our fault or theirs without checking.

## 6. Backfill on restoration

- When the source returns, **backfill the missed window** from its archive/replay
  endpoint where available, deduping against anything captured via alternates.
- Validate backfilled data through the data-quality SLOs before promoting (a
  flood of catch-up data is a common corruption vector — see the
  [data incident runbook](data-incident-runbook.md)).
- Clear the UI badge and dashboard state once caught up.

## 7. Customer comms (if material to outputs)

- If the outage materially affected outputs customers rely on, notify per support
  tier and localize for major outages.
- Be specific: which source, which coverage/region affected, the window, and what
  we did (re-routing, backfill on recovery).
- Reference [SLA exclusions](../legal/msa/sla-addendum.md): upstream source
  outages are excluded from our uptime commitment, but transparency is still the
  policy.

## 8. Postmortem if outage > 24h

- Any source outage exceeding **24 hours** gets a postmortem
  ([template](postmortem-template.md)), even if upstream-caused — focus on *our*
  resilience: did re-routing work, was the badge accurate, did backfill restore
  cleanly, should we add an alternate source for this coverage?

## Verification (incident resolved when)

Source health SLO green; missed window backfilled and validated; UI badge and
public dashboard cleared; provenance reflects any alternate-source use; customers
notified if material.
