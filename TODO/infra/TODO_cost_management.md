# TODO — Cloud Cost Management

## Goal
Predictable unit economics. No surprise bills.

## Progress
- 10 / 10 done

## Tasks
- [x] Per-service cost tags → [cost-management.md §1](../../docs/infra/cost-management.md) (Terraform common_tags; AWS Config rule; CI gate)
- [x] AWS Cost Explorer + custom dashboards → §2 (Grafana; daily spend per Service tag; top-10 drivers; LLM feature-flag spend)
- [x] Anomaly detection on daily spend → §3 (Cost Anomaly Detection; >2σ or >$100 above 30d baseline; Slack alert; same-day triage)
- [x] Per-tenant cost allocation → §4 (tenant_id in app logs; daily DuckDB aggregation; monthly cost-per-tenant report)
- [x] Cost-per-event KPI → §5 (total_infra / events_ingested; weekly; alert >20% WoW increase)
- [x] Cost-per-LLM-call KPI → §6 (Langfuse per call_type/model; cache, batch, routing levers; monthly review)
- [x] Reserved instances / Savings Plans for stable workloads → §7 (RDS 1yr RI -35%; EKS Compute Savings Plan -20%; ElastiCache 1yr -30%)
- [x] Spot instances for batch CV / replay → §8 (ingest workers; vLLM batch; Dagster replay; KEDA scale-to-zero; ~65% GPU savings)
- [x] Cold-storage policy (S3 → IA → Glacier → Deep Archive) → §9 (30d/90d/365d lifecycle; billing/audit exception 7yr then Deep Archive)
- [x] Monthly FinOps review → §10 (Finance + Infra; actuals vs budget; KPI trends; RI utilization; top-3 optimizations)

## i18n
- N/A.

### Примітки
Run lean. Cost = runway = optionality.

### Done notes (2026-05-30)
[docs/infra/cost-management.md](../../docs/infra/cost-management.md). LLM is 50-60% of Tier 3 bill —
routing, caching, and batching are the primary cost levers.
