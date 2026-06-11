# TODO — Backup & Disaster Recovery

## Goal
RPO ≤ 5 min for hot data, RPO ≤ 24h for warm. RTO ≤ 1h for app, ≤ 4h for ingest.

## Progress
- 10 / 10 done

## Tasks
- [x] Postgres PITR (WAL archiving) + daily snapshots → [backup-dr.md §1](../../docs/infra/backup-dr.md) (pgBackRest → S3; WAL 7d; daily snapshots 30d; monthly 1yr; Multi-AZ; cross-region replica)
- [x] Cross-region S3 replication for media + Parquet → §2 (CRR to us-east-1; S3 Object Lock WORM; replication lag alert)
- [x] Kafka tiered storage for replay → §3 (MSK tiered storage; 7d hot / 90d cold S3)
- [x] DR runbook (region failover step-by-step) → §4 (8-step: declare → promote RDS → Cloudflare DNS → Argo CD → Kafka → smoke tests → status → failback)
- [x] Quarterly restore drills (real, not theoretical) → §5 (drill schedule table; actual RTO measurement; runbook last-validated update)
- [x] Per-tenant export + restore → §6 (signed S3 URL; JSON + Parquet; runbook TBD)
- [x] Configuration backups (k8s manifests in Git already) → §7 (full cluster reproducible from Git + Postgres restore in ≤ 4h; Terraform state in S3 + DynamoDB locking)
- [x] Vault snapshot + offsite store → §8 (1h snapshots; S3 eu + CRR us; Shamir 3-of-3, threshold 2)
- [x] DR cost monitoring → §9 (cost-category:dr tag; alert >20% of infra spend; quarterly orphan cleanup)
- [x] Customer-facing DR statement on Trust Center → §10 (→ public-summary.md + SLA addendum reference)

## i18n
- N/A.

### Примітки
A backup that hasn't been restored is not a backup.

### Done notes (2026-05-30)
[docs/infra/backup-dr.md](../../docs/infra/backup-dr.md). RTO targets table at the top. Quarterly drills
are prescriptive (specific drill per quarter, measure actual RTO vs. target, file P0 debt if missed).
