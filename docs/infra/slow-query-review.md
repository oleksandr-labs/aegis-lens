# Slow-Query Review — pgBadger + pganalyze

**Owner:** Platform Engineering  
**Cadence:** Weekly (every Monday, reviewed by on-call DBA)  
**Audience:** Backend engineers, DBAs  
**Updated:** 2026-06-13

---

## 1. Goal

Identify and resolve queries whose P95 latency exceeds 500 ms before they
become production incidents. Catch regressions within one week of deploy.

---

## 2. PostgreSQL Logging Setup

### 2.1 postgresql.conf parameters

Set the following in `postgresql.conf` (or via `ALTER SYSTEM` on RDS/Aurora):

```sql
-- Log queries slower than 100 ms (captures ≈ top 1–5% in production)
ALTER SYSTEM SET log_min_duration_statement = 100;    -- ms

-- Include per-query plan (requires PG 14+ and auto_explain)
-- Load in shared_preload_libraries:
--   shared_preload_libraries = 'pg_stat_statements,auto_explain'
ALTER SYSTEM SET auto_explain.log_min_duration = 500; -- ms; only expensive plans
ALTER SYSTEM SET auto_explain.log_analyze      = on;
ALTER SYSTEM SET auto_explain.log_buffers      = on;
ALTER SYSTEM SET auto_explain.log_format       = 'json';

-- Log format suitable for pgBadger
ALTER SYSTEM SET log_line_prefix      = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
ALTER SYSTEM SET log_checkpoints      = on;
ALTER SYSTEM SET log_connections      = off;   -- too noisy with PgBouncer
ALTER SYSTEM SET log_disconnections   = off;
ALTER SYSTEM SET log_lock_waits       = on;    -- catch lock contention
ALTER SYSTEM SET log_temp_files       = 0;     -- log ALL temp file creation
ALTER SYSTEM SET log_autovacuum_min_duration = 250;  -- ms

SELECT pg_reload_conf();
```

> **RDS note:** Use a Parameter Group. `log_line_prefix` must exactly match the
> pattern above for pgBadger to parse correctly. Enable Enhanced Monitoring and
> Performance Insights in addition.

### 2.2 pg_stat_statements

Aggregate statistics across all executions (no per-call log needed):

```sql
-- Already enabled in 01_extensions.sql
-- View top-20 slowest by mean exec time:
SELECT
  round(mean_exec_time::numeric, 2)             AS mean_ms,
  round(stddev_exec_time::numeric, 2)           AS stddev_ms,
  calls,
  round(total_exec_time::numeric / 1000, 2)    AS total_s,
  rows,
  left(query, 120)                             AS query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

Reset after each tuning cycle:

```sql
SELECT pg_stat_statements_reset();
```

---

## 3. pgBadger

### 3.1 Installation

```bash
# Debian / Ubuntu
apt-get install pgbadger

# macOS
brew install pgbadger

# From source (latest)
git clone https://github.com/darold/pgbadger.git
cd pgbadger && perl Makefile.PL && make && make install
```

### 3.2 Generate weekly report

```bash
# Collect logs from RDS (or copy from /var/log/postgresql/ on self-hosted)
aws rds download-db-log-file-portion \
  --db-instance-identifier aegis-prod \
  --log-file-name error/postgresql.log \
  --output text > /tmp/pg-$(date +%Y-%m-%d).log

# Parse and generate HTML report
pgbadger \
  --format         stderr \
  --prefix         '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ' \
  --outfile        /var/reports/pgbadger/$(date +%Y-%W).html \
  --extension      html \
  --top            50 \
  --log-duration   on \
  --slow-only      \
  --sample         3 \
  /tmp/pg-$(date +%Y-%m-%d).log

# Open report
open /var/reports/pgbadger/$(date +%Y-%W).html
```

### 3.3 Key sections to review

| Section | What to look for |
|---------|-----------------|
| **Slowest individual queries** | Any single execution > 2 s |
| **Most time-consuming queries** | High `calls × mean` products |
| **Queries by type** | SELECT / UPDATE / DELETE ratio |
| **Wait events** | Lock waits, IO waits |
| **Temp file usage** | Missing sort/hash indexes |
| **Lock waits** | `log_lock_waits = on` reveals contention |

---

## 4. pganalyze Integration

pganalyze provides continuous automated monitoring, fingerprinting, and
historical trending — complementing the weekly pgBadger batch report.

### 4.1 Setup steps

1. **Create read-only monitoring user:**

```sql
CREATE USER pganalyze WITH PASSWORD '<strong-password>';
GRANT pg_monitor       TO pganalyze;
GRANT pg_read_all_data TO pganalyze;

-- Allow access to pg_stat_statements
GRANT EXECUTE ON FUNCTION pg_stat_statements_reset() TO pganalyze;
```

2. **Install pganalyze collector** (runs as a sidecar or standalone process):

```bash
# Docker (recommended alongside PgBouncer)
docker run -d \
  --name pganalyze-collector \
  --restart unless-stopped \
  -e DB_URL="postgres://pganalyze:<password>@<rds-host>:5432/aegis_prod" \
  -e PGA_API_KEY="<from pganalyze dashboard>" \
  quay.io/pganalyze/collector:stable
```

3. **RDS-specific:** Grant `rds_superuser` to `pganalyze` or use the AWS
   Performance Insights integration directly in the pganalyze dashboard.

4. **Terraform secret** (do not commit plain credentials):

```hcl
resource "aws_secretsmanager_secret" "pganalyze_url" {
  name = "aegis/pganalyze/db-url"
}
```

5. **Verify connection** in the pganalyze web UI — the collector should report
   `pg_stat_statements` loaded and `EXPLAIN` samples arriving within 5 minutes.

### 4.2 Alerts to enable in pganalyze

| Alert | Threshold |
|-------|-----------|
| Query regression (P95 increase) | > 50% week-over-week |
| New slow query fingerprint | > 500 ms mean |
| Index bloat | > 30% bloat ratio |
| Autovacuum not running | > 4 h since last vacuum on hot table |
| Connection saturation | > 80% of max_connections |

---

## 5. Weekly Review Cadence

**Every Monday 09:00 UTC — on-call DBA reviews:**

### Step 1 — pganalyze dashboard (10 min)
- Open **Query Performance** → sort by **P95 latency**
- Flag any query with P95 > 500 ms that was not flagged last week
- Review **EXPLAIN plans** for flagged queries in the pganalyze plan visualizer
- Check **Index Advisor** recommendations

### Step 2 — pgBadger report (10 min)
- Review **Top slowest queries** section
- Cross-reference with `pg_stat_statements` for call counts
- Note any new queries not present last week

### Step 3 — Triage (15 min)

| Priority | Criteria | Action |
|----------|----------|--------|
| **P1** | P95 > 2 s, calls > 100/min | Fix within 24 h |
| **P2** | P95 > 500 ms, calls > 10/min | Fix within 1 week |
| **P3** | P95 > 500 ms, calls < 10/min | Backlog, review monthly |
| **Ignore** | P95 > 500 ms, batch job, off-hours | Document, no action |

### Step 4 — Index review (5 min)
- Run `SELECT * FROM aegis_ops.bloated_indexes;`
- Run `SELECT * FROM aegis_ops.missing_index_candidates;`
- Schedule `REINDEX CONCURRENTLY` for any index > 30% bloat

### Step 5 — Document findings
Record in the weekly Slack thread `#db-ops` with:
- Queries fixed or escalated
- Index changes made or planned
- Any anomalies (lock waits, temp files > 1 GB)

---

## 6. Query Optimization Playbook

### Seq scan on large table
```sql
-- Find the filter columns
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) <query>;

-- Add a partial index if the filter is selective
CREATE INDEX CONCURRENTLY idx_events_region_occurred
  ON events (region_id, occurred_at DESC)
  WHERE verified = true;  -- partial if most queries filter on this
```

### N+1 in ORM layer
- Use `EXPLAIN ANALYZE` with `pganalyze`'s query fingerprinter
- Look for many identical queries with different literal values
- Fix: add `.include()` / `.prefetch()` at the ORM layer or use a JOIN

### High temp file usage
```sql
-- Increase work_mem for sessions that sort/hash large result sets
-- (do NOT set globally — use per-session or per-role)
ALTER ROLE api_user SET work_mem = '64MB';
```

### Lock contention
```sql
-- Find blocking queries
SELECT
  pid,
  wait_event_type,
  wait_event,
  state,
  query_start,
  left(query, 80) AS query
FROM pg_stat_activity
WHERE wait_event_type = 'Lock'
ORDER BY query_start;
```

---

## 7. Tooling Reference

| Tool | Purpose | Link |
|------|---------|------|
| pgBadger | Log-file report generator | https://pgbadger.darold.net |
| pganalyze | Continuous query monitoring | https://pganalyze.com |
| pg_stat_statements | In-DB query stats | PG built-in |
| auto_explain | Per-query plan logging | PG built-in |
| Grafana dashboard | `aegis_ops` views → Prometheus → Grafana | `infra/grafana/` |
