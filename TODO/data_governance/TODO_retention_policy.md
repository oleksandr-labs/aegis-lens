# TODO — Retention Policy

## Goal
Per-class retention. Default to short; extend only with justification.

## Progress
- 9 / 9 done

## Policy by class
- [x] Public events: indefinite (we're the archive) → [data-governance.md §3](../../docs/data/data-governance.md)
- [x] Raw source archives: 5 years (replayability) → §3
- [x] User-account data: until deletion + 30d grace → §3
- [x] User content (cases, notebooks): until deletion + 90d grace → §3
- [x] Logs: 90 days hot + 1 year cold → §3
- [x] AI inference logs: 30 days (privacy) → §3
- [x] Billing data: 7 years (tax law) → §3
- [x] Session replays: 14 days max → §3
- [x] Backups: 30 days hot + 1 year cold + glacier 5y → §3

## i18n
- Per-jurisdiction retention adjustments.

### Done notes (2026-05-30)
→ [docs/data/data-governance.md §3](../../docs/data/data-governance.md).
Full retention table + implementation mechanism (S3 lifecycle / TimescaleDB / Loki / Dagster retention job).
Legal-hold via S3 Object Lock for active proceedings.
