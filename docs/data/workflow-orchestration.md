# Workflow Orchestration

> Reliable batch and scheduled jobs. **Don't pick one orchestrator for
> everything — right tool per job.**

## 1. Tool selection per workload

| Workload type | Tool | Why |
| --- | --- | --- |
| **Application workflows** (alert delivery, report generation, export jobs, onboarding sequences) | **Temporal** | Durable execution; workflow survives pod restarts; typed SDK; built-in retry + timeout |
| **Data pipelines** (ingest schedules, enrichment DAGs, model training, Parquet exports) | **Dagster** | Asset-based; built-in lineage; software-defined assets map to catalog; testable |
| **One-off / ad-hoc scripts** | Raw k8s `Job` or Argo Workflow | No overhead for simple one-shots |
| **Real-time stream processing** | Kafka + consumer workers (no orchestrator needed) | Streaming = continuous, not scheduled |

**Do not** use a single orchestrator for all four categories — it creates a God
DAG / God Workflow and couples disparate concerns.

## 2. DAG / workflow naming conventions

### Dagster assets and jobs

```python
# Asset: <domain>__<entity>__<action>
@asset(key_prefix=["ingest", "telegram"])
def telegram_raw_events(context) -> None: ...

# Job: <domain>_<cadence>
@job(name="ingest_hourly")
def ingest_hourly_job(): ...

# Partitions: time-based where sensible
@daily_partitioned_config(start_date="2024-01-01")
def daily_partition(start, end): ...
```

**Tags** on every asset/job: `owner` (team), `tier` (critical | standard | low),
`sla_hours` (max acceptable lag). Tier is used for priority scheduling.

### Temporal workflows

```typescript
// Workflow ID convention: <domain>/<entity-id>/<action>
// e.g. "alerts/event-123/fanout"
// e.g. "reports/report-456/generate"
const handle = client.workflow.start(alertFanoutWorkflow, {
  workflowId: `alerts/${eventId}/fanout`,
  taskQueue: 'alerts',
});
```

One task queue per service area (alerts, reports, onboarding, exports) so
workers are specialized and autoscale independently.

## 3. Retries + alerting per task

### Dagster

```python
@op(retry_policy=RetryPolicy(max_retries=3, delay=30, backoff=Backoff.EXPONENTIAL))
def fetch_source_events(context): ...
```

- SLA alert: if a `tier=critical` asset is > `sla_hours` stale, PagerDuty via
  Dagster sensor → on-call. Non-critical: Slack alert only.
- Run failure → Dagster alert → auto-creates a Linear ticket tagged `data-ops`.

### Temporal

```typescript
const result = await proxyActivities<Activities>({
  startToCloseTimeout: '30s',
  retry: { maximumAttempts: 5, initialInterval: '5s', backoffCoefficient: 2 },
});
```

- Workflow timeouts and schedule-to-start timeouts are set per workflow (not
  globally).
- `WorkflowExecutionTimedOut` events feed the incident channel via a Temporal
  interceptor that emits a PagerDuty alert for `tier=critical` workflows.

## 4. Idempotent task design

All tasks (Dagster ops and Temporal activities) are **idempotent** — running
them twice produces the same result as running once:

- Dagster: partition-aware → re-materializing a partition replaces, not appends.
- Temporal: activities use unique idempotency keys (e.g., event ID + action) as
  deduplication keys at the storage layer.
- Ingest: dedup at the pipeline level (content hash in `ingest_log` table)
  prevents duplicate events from multiple retries.
- Backfill: backfill operations always target a time window and are safe to
  re-run (idempotent UPSERTs, not INSERTs).

## 5. Cost-aware scheduling

- **Dagster schedules** avoid peak compute windows (EU business hours 09:00–18:00
  CET) for non-urgent, expensive jobs (model re-scoring, large Parquet exports).
- **Spot-instance-aware**: Dagster `DagsterK8sRunLauncher` targets the
  `batch-spot` node group for jobs that can tolerate interruption. Retry on
  interruption is handled by the `RetryPolicy`.
- **KEDA** scales Temporal worker pods to zero outside their scheduled window
  (e.g., the overnight enrichment worker scales down at 08:00 CET).
- LLM-heavy jobs that aren't user-facing are batched and run off-peak to benefit
  from lower queuing times and to avoid consuming LLM quota during real-time use.

## 6. Backfill tooling

### Dagster

```bash
# Backfill a partition range
dagster asset backfill \
  --asset telegram_raw_events \
  --start-date 2026-05-01 \
  --end-date 2026-05-15 \
  --partition-key-range daily
```

Backfills are partition-safe (idempotent UPSERTs) and can be paused/resumed.
Large backfills run in the off-peak window with reduced concurrency to avoid
starving real-time pipelines.

### Temporal

Ad-hoc backfills via a dedicated `BackfillWorkflow` that:
1. Iterates over the time window in chunks.
2. Starts child workflows per chunk with a rate limiter (token bucket).
3. Checkpoints progress so it can resume from where it left off after a restart.

## 7. Lineage to data catalog

- **Dagster's asset lineage** is the primary lineage graph — all assets declare
  their upstream dependencies, creating an automatic DAG of the data flow.
- Lineage is exported to the **data catalog** (OpenMetadata / DataHub, TBD) via
  the Dagster metadata API on each materialization.
- Critical events in the lineage (schema changes, SLO misses) surface in the
  data catalog so data consumers can see upstream health without checking Dagster
  directly.

## 8. Per-DAG / per-workflow SLO

Every job or workflow at `tier=critical` or `tier=standard` has a documented SLO:

| Job | Tier | SLO (max lag) | Alert channel |
| --- | --- | --- | --- |
| `ingest_realtime` (Kafka consumer) | Critical | < 30 s lag | PagerDuty |
| `enrich_events_hourly` | Critical | < 90 min | PagerDuty |
| `generate_daily_briefing` | Standard | < 4 h | Slack |
| `export_parquet_nightly` | Low | < 24 h | Slack |
| `model_scoring_weekly` | Low | < 7 days | Linear ticket |

SLOs are enforced via Dagster sensors (for assets) and Temporal schedule
monitors (for workflows). SLO breaches feed the [incident program](../security/incident-program.md)
as mandatory postmortem triggers when the error budget is consumed.
