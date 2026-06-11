# TODO — Workflow Orchestration

## Goal
Reliable batch + scheduled jobs (Airflow / Dagster / Prefect / Temporal as appropriate).

## Progress
- 8 / 8 done

## Tasks
- [x] Choose tool per workload (Temporal for app workflows; Dagster for data pipelines) → [workflow-orchestration.md §1](../../docs/data/workflow-orchestration.md) (4-tool selection table; streaming stays in Kafka)
- [x] DAG conventions (naming, tags, ownership) → §2 (asset key_prefix convention; job naming; tags: owner/tier/sla_hours; Temporal workflowId convention)
- [x] Retries + alerting per task → §3 (Dagster RetryPolicy exponential; Temporal retry config; PagerDuty for tier=critical; Linear tickets for failures)
- [x] Idempotent task design → §4 (partition-aware Dagster; Temporal idempotency keys; ingest dedup; backfill UPSERT)
- [x] Cost-aware scheduling → §5 (off-peak for heavy jobs; spot-instance-aware launcher; KEDA scale-to-zero; LLM batch off-peak)
- [x] Backfill tooling → §6 (dagster asset backfill CLI; Temporal BackfillWorkflow with rate limiter + checkpoint)
- [x] Lineage to data catalog → §7 (Dagster asset lineage → OpenMetadata/DataHub; materialization events feed catalog)
- [x] Per-DAG SLO → §8 (SLO table: tier / max lag / alert channel; enforced via Dagster sensors + Temporal schedule monitors)

## i18n
- N/A.

### Примітки
Don't pick one orchestrator for everything. Right tool per job.

### Done notes (2026-05-30)
[docs/data/workflow-orchestration.md](../../docs/data/workflow-orchestration.md). SLO breaches feed the
incident program as mandatory postmortem triggers when error budget is consumed.
