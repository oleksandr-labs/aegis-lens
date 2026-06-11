# TODO — Data Incident Runbook

## Goal
Data corruption / loss / wrong-data-published. Limit blast radius and trust damage.

## Progress
- 9 / 9 done

## Tasks
- [x] Detect via data-quality SLO alerts → §1 (row-count/null/dup/schema/freshness/verification-distribution)
- [x] Halt downstream consumers → §2 (pause earliest upstream of corruption, freeze promotion, UI degrade)
- [x] Snapshot affected state → §3 (corrupted tables + raw offsets + config/commit + logs, incident-ID tagged)
- [x] Identify root cause (ingest / transform / store) → §4 (bisect via replay through prior pipeline version)
- [x] Replay from raw archive (proves replayability) → §5
- [x] Customer-facing retraction if public → §6 (visible correction, all locales)
- [x] Affected-customer outreach → §7 (from access logs, prioritize high-stakes use)
- [x] Postmortem + control to prevent recurrence → §8 (preventive control, not one-off fix)
- [x] Tighten SLO / monitoring threshold → §9

## i18n
- Retraction comms in every locale where data was published.

### Примітки
Replayability from raw is what makes this recoverable.

### Done notes (2026-05-30)
Runbook at [docs/security/data-incident-runbook.md](../../docs/security/data-incident-runbook.md),
linked from the [runbooks index](../../docs/runbooks/README.md). Built on the
contain-first / replay-from-raw principle; calls out that an inability to replay
from raw is itself a SEV-1.
