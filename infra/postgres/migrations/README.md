# Database Migrations

Managed with [Atlas](https://atlasgo.io) — declarative SQL migrations with safety checks.

## Directory layout

```
migrations/
  v1_0_0__initial_schema.sql   — baseline (from init/ scripts)
  v1_1_0__add_event_indexes.sql
  ...
  atlas.hcl                    — Atlas configuration
```

## Workflow

```bash
# Dry-run: see what would change
atlas migrate diff --env dev --dry-run

# Apply pending migrations
atlas migrate apply --env dev

# Validate migrations before pushing (CI)
atlas migrate validate --env dev

# Check for dangerous DDL (pg_squawk)
npx pg_squawk migrations/vX_Y_Z__*.sql
```

## Safety rules (enforced by CI)

- No `DROP TABLE` without `IF EXISTS`
- No `DROP COLUMN` without first deprecating the column (set DEFAULT + optional)
- No `ALTER TABLE ... ADD COLUMN NOT NULL` on large tables without default
- No index creation without `CONCURRENTLY` on live tables
- Every migration file must be reviewed by ≥1 DBA before merge

## Naming convention

`v{major}_{minor}_{patch}__{description}.sql`
  - All lowercase with underscores
  - Description must be ≤40 characters
  - Never reorder or rename merged migration files
