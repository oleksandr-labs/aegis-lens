# Backup Verification & Restore Drill Procedure

**Owner:** Platform Engineering / On-call DBA  
**Frequency:** Quarterly (Jan, Apr, Jul, Oct — first week)  
**RTO target:** < 1 hour (full restore to serving traffic)  
**RPO target:** < 5 minutes (PITR from WAL archive)  
**Updated:** 2026-06-13

---

## 1. Overview

A backup that has never been tested is not a backup — it is a hypothesis.
This document defines the quarterly drill procedure for:

1. **pg_dump verification** — logical snapshot restore to an isolated cluster
2. **PITR (Point-in-Time Recovery)** — WAL archive replay to a target LSN
3. **RTO validation** — measuring wall-clock time from "disaster declared" to
   "read traffic redirected"

All drills run against **a separate isolated restore cluster**, never against
production or any replica in the production read path.

---

## 2. Pre-Drill Checklist

Complete at least 48 hours before the drill date:

- [ ] Notify team in `#db-ops` Slack: date, time window, lead DBA
- [ ] Confirm restore cluster is provisioned (see §3 below)
- [ ] Verify WAL archive is healthy:
  ```bash
  # On primary or via AWS CLI
  aws s3 ls s3://aegis-wal-archive/basebackups/ --recursive | tail -5
  ```
- [ ] Confirm latest base backup timestamp is < 24 hours old
- [ ] Confirm `pg_dump` schedule ran successfully (check cron logs / CI artifacts)
- [ ] Obtain latest pg_dump file size and checksum:
  ```bash
  sha256sum /backups/aegis_prod_$(date +%Y-%m-%d).dump > /backups/aegis_prod_$(date +%Y-%m-%d).dump.sha256
  ```
- [ ] Ensure restore cluster has the same Postgres minor version as production
- [ ] Ensure PostGIS, TimescaleDB, pg_cron extension versions match

---

## 3. Restore Cluster Provisioning

Use Terraform to spin up a temporary instance. The module is parameterized to
avoid accidental reuse of production identifiers.

```bash
cd infra/terraform

terraform apply \
  -target module.rds_restore \
  -var environment=drill \
  -var db_instance_class=db.r6g.2xlarge \
  -var db_name=aegis_drill \
  -auto-approve

# Record the endpoint
RESTORE_HOST=$(terraform output -raw rds_restore_endpoint)
```

The restore cluster must be:
- In a **private VPC subnet** with no public access
- Connected to the **same WAL archive S3 bucket** (read-only IAM policy)
- Tagged `Purpose=restore-drill` and `TerminateAfter=<drill-date+3days>`

---

## 4. Drill Procedure A — pg_dump Logical Restore

**Estimated time: 20–40 minutes** (depending on database size)

### 4.1 Transfer latest dump

```bash
DUMP_DATE=$(date +%Y-%m-%d)
DUMP_FILE="aegis_prod_${DUMP_DATE}.dump"
S3_PATH="s3://aegis-backups/postgres/${DUMP_FILE}"

# Download
aws s3 cp "${S3_PATH}" /tmp/${DUMP_FILE}

# Verify checksum
aws s3 cp "${S3_PATH}.sha256" /tmp/${DUMP_FILE}.sha256
sha256sum -c /tmp/${DUMP_FILE}.sha256
# Expected: /tmp/<file>.dump: OK
```

### 4.2 Restore to drill cluster

```bash
# Create target database
psql -h "${RESTORE_HOST}" -U postgres -c "CREATE DATABASE aegis_drill;"

# Restore (parallel jobs = 4 for speed)
pg_restore \
  --host="${RESTORE_HOST}" \
  --port=5432 \
  --username=postgres \
  --dbname=aegis_drill \
  --jobs=4 \
  --verbose \
  --exit-on-error \
  /tmp/${DUMP_FILE} \
  2>&1 | tee /tmp/restore_$(date +%Y%m%d_%H%M%S).log
```

### 4.3 Sanity checks after logical restore

```sql
-- Row counts — compare with production baseline (recorded in §7)
SELECT relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC
LIMIT 20;

-- Extension check
SELECT extname, extversion FROM pg_extension ORDER BY extname;

-- Schema version
SELECT version FROM atlas_schema_revisions ORDER BY applied_at DESC LIMIT 1;

-- RLS is active
SELECT tablename, rowsecurity FROM pg_tables
WHERE rowsecurity = true AND schemaname = 'public';

-- Sample data integrity
SELECT count(*), min(occurred_at), max(occurred_at)
FROM events
WHERE occurred_at > now() - interval '7 days';

-- Foreign key violations (should return 0 rows)
-- (Adapt per schema; example for events → regions)
SELECT e.id
FROM events e
LEFT JOIN regions r ON r.id = e.region_id
WHERE r.id IS NULL
LIMIT 10;
```

Record: row counts, schema version, and extension versions in §7.

---

## 5. Drill Procedure B — PITR from WAL Archive

**Estimated time: 15–30 minutes**

PITR replay is the recovery path for data corruption or accidental mass-delete.
Target: replay to a point 30 minutes before the simulated incident.

### 5.1 Choose recovery target

```bash
# Record current production LSN before starting drill
PROD_LSN=$(psql -h prod-host -U postgres -At -c "SELECT pg_current_wal_lsn();")
TARGET_TIME=$(date -u -d "30 minutes ago" +"%Y-%m-%d %H:%M:%S UTC")
echo "Recovery target: ${TARGET_TIME}"
```

### 5.2 Restore base backup

```bash
# Latest base backup from archive
LATEST_BACKUP=$(aws s3 ls s3://aegis-wal-archive/basebackups/ | \
  sort | tail -1 | awk '{print $NF}')

aws s3 sync \
  "s3://aegis-wal-archive/basebackups/${LATEST_BACKUP}/" \
  /var/lib/postgresql/16/drill/
```

### 5.3 Configure recovery

Create `postgresql.conf` overrides in the restore data directory:

```bash
cat >> /var/lib/postgresql/16/drill/postgresql.conf <<EOF

# PITR recovery settings
restore_command = 'aws s3 cp s3://aegis-wal-archive/wal/%f %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# Signal file to enter recovery mode (PG 12+)
touch /var/lib/postgresql/16/drill/recovery.signal
```

### 5.4 Start and monitor

```bash
pg_ctl start -D /var/lib/postgresql/16/drill/ -l /tmp/pitr-drill.log

# Tail until "recovery stopping before commit" or "database system is ready"
tail -f /tmp/pitr-drill.log
```

### 5.5 Validate PITR state

```sql
-- Confirm recovery target was reached
SELECT pg_is_in_recovery();  -- should return false after promote
SELECT now() - pg_postmaster_start_time() AS uptime;

-- Check data matches expected state at TARGET_TIME
SELECT count(*) FROM events
WHERE occurred_at > '${TARGET_TIME}'::timestamptz - interval '1 hour'
  AND occurred_at <= '${TARGET_TIME}'::timestamptz;
```

---

## 6. RTO Measurement

The drill lead **starts a stopwatch** when the simulated incident is declared
and stops it when the first read query succeeds against the restore cluster.

| Phase | Target | Notes |
|-------|--------|-------|
| Incident declared → base backup download starts | < 2 min | Automation via runbook |
| Base backup download | < 10 min | Depends on backup size; ~150 GB → ~8 min on 200 Mb/s |
| pg_restore (logical) OR PITR replay | < 30 min | Parallel restore; 4 workers |
| Sanity checks pass | < 10 min | Script §4.3 or §5.5 |
| Read traffic redirected | < 5 min | Update Cloudflare / RDS Proxy endpoint |
| **Total RTO** | **< 60 min** | Hard target |

If any phase exceeds its target, create a follow-up issue before the next
quarterly drill.

---

## 7. Drill Result Log

Complete this table after every drill and commit to `docs/infra/`.

```
═══════════════════════════════════════════════════════════════
Drill Date:          YYYY-MM-DD
Lead DBA:            <name>
Environment:         drill (isolated cluster)
Production baseline: events = <N> rows, schema = v<X.Y.Z>
═══════════════════════════════════════════════════════════════

A. pg_dump Logical Restore
──────────────────────────
  Dump file:              aegis_prod_YYYY-MM-DD.dump
  Dump file size:         <N> GB
  Checksum verified:      YES / NO
  Restore duration:       <N> min
  Row count match:        YES / NO (delta: <N> rows)
  Schema version match:   YES / NO
  Extension versions OK:  YES / NO
  RLS policies active:    YES / NO
  FK violations:          0 / <N>
  Outcome:                PASS / FAIL

B. PITR Recovery
────────────────
  Base backup timestamp:  YYYY-MM-DDTHH:MM:SSZ
  Recovery target time:   YYYY-MM-DDTHH:MM:SSZ
  WAL replay duration:    <N> min
  Recovery target reached: YES / NO
  Data integrity check:   PASS / FAIL
  Outcome:                PASS / FAIL

C. RTO Measurement
──────────────────
  Incident declared:      HH:MM:SS
  First read query OK:    HH:MM:SS
  Total RTO:              <N> min
  RTO target (< 60 min):  MET / MISSED

D. Issues Found
───────────────
  1. <description> → <ticket/follow-up>
  2. ...

E. Sign-off
───────────
  DBA:          <signature>
  Eng Manager:  <signature>
═══════════════════════════════════════════════════════════════
```

---

## 8. Teardown

After the drill, within 24 hours:

```bash
# Destroy restore cluster
cd infra/terraform
terraform destroy \
  -target module.rds_restore \
  -var environment=drill \
  -auto-approve

# Remove downloaded dump from local disk
rm -f /tmp/aegis_prod_*.dump /tmp/aegis_prod_*.dump.sha256

# Remove PITR data directory
rm -rf /var/lib/postgresql/16/drill/
```

Confirm teardown in `#db-ops` Slack.

---

## 9. Failure Scenarios

| Scenario | Response |
|----------|----------|
| Checksum mismatch on pg_dump | Abort, page on-call, investigate S3 upload job |
| pg_restore exits with error | Capture log, identify missing dependency, re-run single-thread |
| PITR: WAL files missing | Check archive gap in S3; fall back to logical restore |
| RTO > 60 min | Post-mortem required; identify bottleneck; update procedure |
| Restore cluster not reachable | Check VPC security groups; verify IAM role permissions |

---

## 10. Related Documents

- `infra/postgres/ops/index-audit.sql` — index health queries
- `infra/postgres/ops/autovacuum-tuning.sql` — vacuum configuration
- `docs/infra/slow-query-review.md` — query performance monitoring
- `infra/terraform/modules/rds/main.tf` — RDS module with Multi-AZ + replicas
- `docs/runbooks/oncall-diagnostics.md` — general on-call diagnostics
