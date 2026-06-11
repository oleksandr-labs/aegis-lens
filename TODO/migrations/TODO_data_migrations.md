# TODO — Data Migrations

## Goal
Move large datasets between systems (Postgres → Elastic, raw → enriched) without consistency drift.

## Progress
- 0 / 9 done

## Tasks
- [ ] Per-migration runbook
- [ ] Idempotent migration jobs (Temporal workflows)
- [ ] Dual-write phase (old + new) → cutover → cleanup
- [ ] Consistency reconciliation jobs
- [ ] Per-tenant migration scoping
- [ ] Per-migration audit log
- [ ] Rollback plan documented
- [ ] Pre-migration snapshot
- [ ] Post-migration verification (sampled vs full)

## i18n
- N/A.

### Примітки
Dual-write is your friend. Premature cutover is your enemy.
