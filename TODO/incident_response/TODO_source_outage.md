# TODO — Source Outage Runbook

## Goal
A major source goes silent. Detect, communicate, mitigate, recover.

## Progress
- 8 / 8 done

## Tasks
- [x] Detection: source-health SLO (median gap exceeded) → §1
- [x] Auto-degrade UI badge ("source X delayed") → §2 (with last-successful-update time)
- [x] Re-route to alternate sources where possible → §3 (honest provenance, mark gaps)
- [x] Update public source-health dashboard → §4
- [x] Contact source operator (where applicable) → §5
- [x] Backfill on restoration → §6 (replay window, dedupe, validate via data-quality SLOs)
- [x] Customer comms if material to outputs → §7 (localized, references SLA exclusions)
- [x] Postmortem if outage > 24h → §8 (focus on our resilience)

## i18n
- Status comms localized for major outages.

### Примітки
Transparent outage handling = trust upside.

### Done notes (2026-05-30)
Runbook at [docs/security/source-outage-runbook.md](../../docs/security/source-outage-runbook.md),
linked from the [runbooks index](../../docs/runbooks/README.md). Emphasizes
transparency (badge + public dashboard) and warns that catch-up backfill is a
corruption vector → validate before promoting.
