# Backup & Disaster Recovery

> RPO ≤ 5 min for hot data, RPO ≤ 24 h for warm. RTO ≤ 1 h for app, ≤ 4 h
> for ingest rebuild. **A backup that hasn't been restored is not a backup.**

## Recovery targets

| Data class | RPO | RTO | Mechanism |
| --- | --- | --- | --- |
| **Postgres (hot events, users, billing)** | ≤ 5 min | ≤ 30 min | WAL archiving + Multi-AZ failover |
| **Kafka (event stream)** | ≤ 60 s | ≤ 10 min | Replication factor 3 + tiered storage |
| **S3 / Parquet archive** | ≤ 24 h | ≤ 4 h (replay) | Cross-region replication |
| **Application (stateless)** | N/A | ≤ 5 min | Argo CD re-sync from Git |
| **Qdrant vectors** | ≤ 24 h | ≤ 2 h (rebuild) | Snapshot to S3 daily |
| **Secrets (Vault / AWS SM)** | ≤ 1 h | ≤ 30 min | Vault snapshot + S3 offsite |

## 1. Postgres PITR (WAL archiving) + daily snapshots

- **WAL archiving** via `pgBackRest` → S3 bucket with versioning. Enables
  point-in-time recovery to any second within the retention window.
- **Retention:** WAL archives for 7 days; daily snapshots for 30 days;
  monthly snapshot retained 1 year.
- **Multi-AZ RDS**: automatic synchronous replication to a standby in a second
  AZ. Failover RTO < 60 s (DNS flip, automatic).
- **Cross-region replica** (us-east-1): asynchronous read replica used for both
  disaster recovery and read-path scaling. Promotion to primary is a manual step
  (runbook §4).

## 2. Cross-region S3 replication (media + Parquet)

- All S3 buckets with durable data have **Cross-Region Replication (CRR)** to
  us-east-1 with **S3 Object Lock** (WORM) for compliance-critical data
  (billing records, audit logs).
- Replication lag monitored via `s3:Replication:OperationFailedReplication`
  CloudWatch metric — alert if lag > 15 min.
- Media assets (images, video) replicated; tile cache is ephemeral and
  regenerated on demand (not replicated).

## 3. Kafka tiered storage (event replay)

- **Kafka Tiered Storage** (MSK feature) offloads cold segments to S3
  automatically. Hot segments stay on broker disk; cold segments are fetched
  from S3 on consumer request.
- **Hot retention:** 7 days on broker disk.
- **Cold retention:** 90 days in S3 (Intelligent-Tiering).
- On DR: a new consumer can replay the full 90-day history from S3 without any
  broker disk available — critical for the [data incident runbook](../security/data-incident-runbook.md)
  replay-from-raw step.

## 4. DR runbook — region failover (step-by-step)

**Trigger:** eu-central-1 is fully unavailable (confirmed after 15 min of
multi-signal failure — don't trigger on a transient blip).

```
1. Declare SEV-1; assign IC per incident-response runbook.
2. Promote RDS cross-region replica (us-east-1) to primary:
     aws rds promote-read-replica --db-instance-identifier aegis-prod-us-replica
   RTO: ~3 min (replica warm-up + DNS flip).
3. Update Cloudflare DNS: point aegis-lens.com → us-east-1 ALB.
   (Cloudflare health checks may already have done this if configured.)
4. Verify Argo CD syncs aegis-prod-us cluster with the full app manifests.
5. Verify Kafka consumers reconnect to MSK us-east-1 cluster.
6. Run smoke tests (Playwright critical-flow suite) against us-east-1.
7. Update status page: "Operating from secondary region."
8. When eu-central-1 recovers: verify data sync, then execute failback plan
   (reverse the above; drain us-east-1 sessions gracefully).
```

Full procedure and decision tree in the on-call runbook; IC owns execution.

## 5. Quarterly restore drills (real, not theoretical)

**Schedule:** once per quarter, per-area:

| Quarter | Drill type | Who runs it |
| --- | --- | --- |
| Q1 | Postgres PITR restore to staging (specific timestamp) | Infra + Data |
| Q2 | Full region failover to us-east-1 (staging env) | Infra + Eng lead |
| Q3 | Kafka replay from tiered storage | Data/ingest |
| Q4 | Vault snapshot restore + Secrets Manager rotation | Infra + Security |

Each drill:
1. Execute the runbook (no deviations from script — validates the runbook, not heroics).
2. Measure actual RTO vs. target.
3. Log findings; update runbook `last validated` date.
4. File any gap as a P0 tech-debt item if the RTO target was missed.

## 6. Per-tenant data export + restore

Enterprise customers with a data-portability clause can request a full export of
their data (events queried, alerts, reports, notebooks):
- Export job generates a signed S3 URL with a 24-hour TTL.
- Format: JSON + Parquet (per the event schema).
- Restore: customer can re-import via the API or a bulk-load endpoint.
- Runbook for export: `infra/runbooks/per-tenant-export.md` (to be authored).

## 7. Configuration backups (already in Git)

- All Kubernetes manifests, Helm charts, and Terraform state are in Git — the
  cluster configuration is fully reproducible from `infra/`.
- Terraform state is stored in S3 with versioning and DynamoDB locking.
- A full cluster can be rebuilt from Git + a Postgres restore in ≤ 4 h.

## 8. Vault snapshot + offsite storage

- **HashiCorp Vault** (if used for additional secret management beyond AWS SM):
  automated snapshots on a 1-hour schedule via the Vault operator snapshot agent.
- Snapshots are encrypted and stored in S3 (eu-central-1) + replicated to
  us-east-1 (§2).
- Vault unsealing keys (Shamir shares) are held by at least 3 named keyholders
  (threshold: 2 of 3) stored offline in geographically separated secure locations.

## 9. DR cost monitoring

DR infrastructure (cross-region replica, CRR, MSK tiered storage) is tagged
`cost-category: dr` and tracked separately in AWS Cost Explorer.
- Alert: DR cost > 20% of total infra spend → review what's being replicated
  unnecessarily.
- Quarterly: verify replicas are healthy and cost-justified; prune orphaned
  replicas from cancelled experiments.

## 10. Customer-facing DR statement (Trust Center)

The [public architecture summary](../architecture/public-summary.md) includes
uptime targets and the note that Multi-AZ deployment + Cloudflare provide an
additional availability layer. A more detailed DR SLA is available on request
(for enterprise procurement) and documented in the
[SLA addendum](../legal/msa/sla-addendum.md).
