# TODO — Postgres / PostGIS Ops

## Goal
A boring, healthy Postgres. Migrations safe, performance predictable.

## Progress
- 8 / 12 done

## Tasks
- [x] PostgreSQL 16 + PostGIS + TimescaleDB — `infra/postgres/init/01_extensions.sql`
- [x] RDS Multi-AZ + read replicas — `infra/terraform/modules/rds/main.tf` with `multi_az` + read replica for prod
- [x] Connection pooling (PgBouncer or RDS Proxy) — `infra/postgres/pgbouncer/` with config, Dockerfile, k8s Deployment + Service
- [x] Migration tool (Atlas / Sqitch / Prisma Migrate) with safety checks — Atlas config in `infra/postgres/migrations/atlas.hcl` + versioned SQL files v1.0–v1.3
- [x] Squawk / pg_squawk in CI for dangerous DDL — `db-migration-check` job in `.github/workflows/ci.yml`
- [x] Per-table partitioning strategy for `events` — `PARTITION BY RANGE(occurred_at)` in `infra/postgres/init/03_events_table.sql`
- [x] Hypertable for time-series — `create_hypertable` monthly chunks in `03_events_table.sql`
- [ ] Index audit + bloat monitoring
- [ ] Vacuum / autovacuum tuning
- [ ] pgBadger / pganalyze for slow-query review
- [ ] Backup verification (restore drill quarterly)
- [x] Row-level security policies enforced (multi-tenancy) — `02_rls_setup.sql` + RLS policies in `03_events_table.sql` and `04_ancillary_tables.sql`

## i18n
- Multilingual columns + full-text indexes per locale.

### Примітки
Postgres scales further than people think. Don't go distributed without measuring.
