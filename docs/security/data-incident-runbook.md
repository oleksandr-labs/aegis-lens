# Data Incident Runbook

> **Scope:** data corruption, data loss, or wrong data published to customers.
> **Goal: limit blast radius and trust damage.**
>
> **Key fact: replayability from the raw archive is what makes this
> recoverable.** Everything below assumes we can rebuild derived state from
> immutable raw ingest. If that assumption ever fails, that is itself a SEV-1.

| Field | Value |
| --- | --- |
| Owner | Data / ingest |
| Service area | Data / ingest |
| Typical severity | SEV-2 (SEV-1 if wrong data is public + high-stakes) |
| Related | [IR overview](incident-response-runbook.md) · [Source outage](source-outage-runbook.md) · [Postmortem](postmortem-template.md) |

## 1. Detect

- **Data-quality SLO alerts** fire on: row-count anomalies, null/duplicate spikes,
  schema drift, geocode-failure rate, verification-state distribution shift,
  freshness lag, or out-of-range coordinate/timestamp values.
- Also: customer report of a wrong event, or an analyst spotting an implausible
  output.
- On alert, open an incident channel and assign IC/TL/Scribe per the IR overview.

## 2. Halt downstream consumers (contain first)

**Stop the bleed before investigating.** Wrong data spreading is worse than a
brief processing pause.

- Pause the affected pipeline stage(s) — ingest → transform → publish — at the
  earliest point upstream of the corruption.
- Freeze promotion to the published/serving store (feature flag or pipeline gate).
- If wrong data is already serving, flip the affected layer/dataset to a
  "degraded — under review" state in the UI rather than serving known-bad data.

## 3. Snapshot affected state

Before any remediation, snapshot for forensics and to enable a clean replay:

- The corrupted derived tables/partitions (tag with incident ID).
- The relevant raw-archive offsets / time window.
- Pipeline config and the deploy/commit that was live when corruption started.
- Relevant logs (ingest, transform, store) for the window.

## 4. Identify root cause (ingest / transform / store)

Localize where the corruption entered:

- **Ingest:** bad source payload, adapter parsing bug, dedup/merge error.
- **Transform:** NLP/geo/verify logic regression, bad migration, race condition.
- **Store:** failed migration, partial write, replication/restore error.

Use the snapshot + raw archive to bisect: does replaying the raw window through
the *previous* pipeline version produce correct output? If yes → the regression
is in the current transform; if no → look upstream at ingest or the source.

## 5. Replay from raw archive (and prove replayability)

- Rebuild the affected derived state by replaying the raw archive for the impacted
  window through the corrected pipeline.
- Validate the replayed output against the data-quality SLOs and spot-check
  known-good records before re-publishing.
- This step **proves replayability** — if you cannot cleanly rebuild from raw,
  treat the gap as a top hardening action item.
- Re-enable downstream consumers / lift the UI degradation only after validation
  passes.

## 6. Customer-facing retraction (if data was public)

If wrong data was visible to customers/users:

- Issue a **retraction/correction** on the affected events/outputs (not a silent
  overwrite — show that a correction occurred, with timestamp).
- Localize the retraction in **every locale where the data was published**.
- Be specific and plain: what was wrong, the corrected value, the time window,
  and that it's now fixed. Trust is the asset; transparency protects it.

## 7. Affected-customer outreach

- Identify customers who queried/consumed the affected data in the window (from
  access logs / API logs).
- Notify per their support tier; for high-stakes use (defense/humanitarian
  decisions), prioritize direct outreach.
- Provide the corrected data and the impact window so they can re-check decisions.

## 8. Postmortem + preventive control

- Blameless postmortem ([template](postmortem-template.md)) for any SEV-2+ data
  incident.
- Ship a **control that prevents recurrence**, not just a one-off fix: e.g., a
  validation gate in the pipeline, a contract test on the source payload, a
  pre-publish SLO check that blocks promotion.

## 9. Tighten SLO / monitoring threshold

- If the incident slipped past monitoring, add or tighten the data-quality SLO
  that should have caught it, and add the missed case to the validation suite.
- Record the new threshold and its rationale; review for false-positive noise at
  the next on-call retro.

## Verification (incident resolved when)

Published data matches replayed-from-raw ground truth; data-quality SLOs green
for the affected datasets; retractions posted in all locales; affected customers
notified; preventive control merged or ticketed with an owner.
