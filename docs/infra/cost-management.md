# Cloud Cost Management

> Predictable unit economics. No surprise bills. **Run lean — cost = runway =
> optionality.**

## 1. Per-service cost tags

Every AWS resource is tagged at creation via Terraform:

```hcl
locals {
  common_tags = {
    Project     = "aegis-lens"
    Environment = var.environment           # prod | staging | dev
    Service     = var.service_name          # ingest | nlp | geo | web | ...
    Team        = var.team                  # data | platform | ai | infra
    CostCenter  = var.cost_center           # engineering | product | research
    ManagedBy   = "terraform"
  }
}
```

Tags are enforced by an AWS Config rule — untagged resources trigger a Slack
alert within 24 h. Terraform PRs without `tags` blocks fail CI.

## 2. AWS Cost Explorer + custom dashboards

- **AWS Cost Explorer**: baseline view by service, account, and tag.
- **Custom Grafana dashboard** (pulls from Cost Explorer API + CloudWatch):
  - Daily spend per `Service` tag vs. budget.
  - Month-to-date vs. forecast.
  - Top-10 cost drivers (by service, by region, by instance type).
  - LLM token spend vs. feature flag enabling model calls.
- Dashboard reviewed in the monthly FinOps review (§10) and shared with
  leadership weekly.

## 3. Anomaly detection on daily spend

**AWS Cost Anomaly Detection** configured with:
- Per-service monitors (alerts if a service's daily cost is > 2σ above its
  30-day baseline or > `[$100]` above baseline, whichever is less).
- Per-environment monitor (flags any dev/staging cost spike — often a forgotten
  load-test cluster or a GPU node left running).
- Notifications → Slack `#finops-alerts` + weekly email digest.
- On alert: on-call infra rotates to investigate within 4 h (not a P1, but
  must be triaged the same business day).

## 4. Per-tenant cost allocation

For SaaS cost accounting and enterprise pricing validation:
- Each API call and query is tagged with `tenant_id` at the application layer.
- Logs are aggregated daily: compute seconds × request count, Elasticsearch
  queries, LLM tokens, tile renders, storage bytes — all per tenant.
- **Cost-per-tenant report** generated monthly via DuckDB over the log Parquet.
- Used for: verifying that Enterprise pricing covers actual cost, identifying
  disproportionate tenants (usage anomalies or candidates for custom pricing),
  and building the [unit economics model](../architecture/cost-model.md).

## 5. Cost-per-event KPI

The foundational unit-economics metric:

```
cost_per_event = (total_infra_cost_period) / (events_ingested_period)
```

- Tracked weekly; graphed on the FinOps dashboard.
- Target trajectory: decreasing as economies of scale kick in (tiered storage,
  batch processing, Kafka cost-per-message decreases with volume).
- Alert: `cost_per_event` increases > 20% week-over-week → investigate
  (could be an ingest bug, an expensive new source, or a mis-provisioned service).

## 6. Cost-per-LLM-call KPI

LLM costs are the largest single variable expense (50–60% of Tier 3 infra
bill per [cost model](../architecture/cost-model.md)):

```
cost_per_llm_call = (total_LLM_spend) / (llm_calls_count)
broken down by: model, call_type (briefing | copilot | classification | translation)
```

- **Langfuse** tracks token usage per call type, per model, per feature flag.
- Optimization levers:
  - Route simpler calls (classification, short summarization) to `claude-haiku`
    or a self-hosted model.
  - Cache identical or near-identical briefing requests (content hash → Redis TTL).
  - Batch non-urgent calls (overnight enrichment vs. real-time response).
- Cost-per-LLM-call reviewed monthly; any model-routing change goes through
  an eval run ([AI regression runbook](../security/ai-regression-runbook.md)) before shipping.

## 7. Reserved Instances / Savings Plans

For stable, predictable workloads:

| Resource | Commitment type | Savings |
| --- | --- | --- |
| RDS (Postgres primary, r6g.xlarge) | 1-year Reserved Instance | ~35% vs. on-demand |
| EKS on-demand baseline nodes (m7g.large) | Compute Savings Plan (1yr, no-upfront) | ~20% |
| ElastiCache (r7g.small) | 1-year Reserved Node | ~30% |
| NAT Gateway | No commitment | (minimize via VPC endpoints §3) |

Spot instances handle burst capacity (§8) — don't commit Reserved capacity for
burst-only workloads.

## 8. Spot instances for batch / CV / replay

- **Ingest workers** (stateless, Kafka-offset-checkpointed): Karpenter schedules
  on spot `m7g` instances. Spot interruption handler checkpoints Kafka offsets
  and drains gracefully before termination.
- **vLLM / CV inference batch** (overnight enrichment, not real-time):
  `g4dn.xlarge` spot with KEDA scale-to-zero outside batch windows. Saves
  ~65% vs. on-demand GPU.
- **Replay / backfill jobs** (Dagster): spot `r7g.xlarge` for large Parquet
  re-processing. Retries on interruption are idempotent (§ workflow orchestration).

## 9. Cold-storage lifecycle policy (S3)

All S3 buckets have lifecycle rules:

| Age | Storage class | Cost (approx.) |
| --- | --- | --- |
| 0–30 days | S3 Standard | ~$0.023/GB/mo |
| 30–90 days | S3 Infrequent Access | ~$0.0125/GB/mo |
| 90–365 days | S3 Glacier Instant Retrieval | ~$0.004/GB/mo |
| > 365 days | S3 Glacier Deep Archive | ~$0.00099/GB/mo |

Exception: billing/audit logs use S3 Standard for 7 years (compliance +
fast access for audits); then Glacier Deep Archive.

Lifecycle policies are defined in Terraform and reviewed in the annual cost audit.

## 10. Monthly FinOps review

Owner: Finance + Infra lead. Agenda:
1. Actual vs. budget by environment and service.
2. Cost-per-event + cost-per-LLM-call KPI trends.
3. Anomaly recap: what fired, root cause, resolved?
4. Reserved Instance / Savings Plan utilization (are we over-committed?).
5. Next month's growth assumptions and cost forecast.
6. Top-3 optimization opportunities with owners.

Output: a 1-page FinOps summary shared with leadership and the cost dashboard
updated with new forecasts. Major optimizations (> $1k/mo savings) are tracked
as engineering tasks in Linear.
