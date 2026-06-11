# TODO — Schema Migrations

## Goal
Safe, reversible schema changes at any scale. No downtime, no surprise lock contention.

## Progress
- 0 / 10 done

## Tasks
- [x] Migration tool (Atlas / Sqitch / Prisma) with SQL-first format ✓ Sprint 2.2
- [ ] Squawk / pg_squawk in CI on every PR
- [ ] Phase-based migrations (expand → backfill → contract)
- [ ] Backfill in batches with lock-free updates
- [ ] Index creation `CONCURRENTLY` always
- [ ] Per-migration size + duration estimate (CI-enforced limit)
- [ ] Per-migration revert plan
- [ ] Pre-deploy + post-deploy hooks
- [ ] DBA review for risky ops
- [ ] Migration changelog visible in admin CLI

## i18n
- N/A.

### Примітки
The 5-min-lock production migration becomes a 5-hour incident at our scale. Phase everything.
