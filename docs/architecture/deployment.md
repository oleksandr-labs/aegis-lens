# Deployment Topology

> How Aegis Lens runs in production: multi-region, multi-AZ, GitOps, zero-
> downtime deployments. For scaling tiers see
> [`scalability-plan.md`](scalability-plan.md); for the network/region diagram
> see [`multi-region.md`](multi-region.md).

## 1. Region topology (summary)

| Region | Role | Tier | Data written there |
| --- | --- | --- | --- |
| **eu-central-1** (Frankfurt) | Primary — all writes | Active | All: events, users, billing |
| **us-east-1** (N. Virginia) | Secondary — reads + ingest workers | Active | Ingest workers only (replicate to EU) |
| **ap-southeast-1** (Singapore) | Tertiary — read-only | Planned (100k DAU) | None (read replica) |

EU is primary because the platform serves EU data-subject personal data and must
satisfy GDPR data-residency requirements (see [DPA](../legal/dpa.md)).

## 2. Per-layer deployment

### Web (apps/web)
- Hosted on **Vercel** (Edge Network) with static assets at the CDN edge.
- ISR pages (event region pages, country pages) cached at the edge; revalidated
  on data change via on-demand ISR webhook.
- Environment secrets injected via Vercel encrypted env vars; no secrets in code.

### API services (NestJS / Fastify)
- Deployed as **Kubernetes pods on EKS** (eu-central-1 primary, us-east-1 for
  read-path services and ingest workers).
- Managed by **Argo CD** (GitOps): a PR merge to `main` triggers a Helm chart
  update; Argo CD reconciles the cluster. No SSH, no manual `kubectl apply`.
- **Deployment strategy:** `RollingUpdate` (25% surge, 0 max-unavailable) for
  stateless services. Stateful sets (Kafka, Qdrant) use ordered rolling updates.
- **Health checks:** readiness probe (HTTP `/healthz`) + liveness probe. A pod
  that fails readiness is pulled from the LB before termination.

### Data pipeline (ingest / transform)
- **Ingest workers** (Go): Kubernetes `Deployment` with HPA on Kafka consumer lag.
  Scaled to zero outside peak windows via KEDA.
- **Temporal workers**: Kubernetes `Deployment`; Temporal server on a dedicated
  node pool.
- **Dagster**: deployed on EKS; `DagsterK8sRunLauncher` executes each run as an
  isolated pod.

### AI services (FastAPI / vLLM)
- **API-proxied LLM calls** (Claude, GPT-4o): no GPU needed; stateless FastAPI
  pods behind the API gateway.
- **Self-hosted vLLM** (NLLB, YOLOv8, Whisper): GPU node group
  (`g4dn.xlarge` / `g5.xlarge`), cluster autoscaler + KEDA on queue depth.
  Separate namespace with stricter network policy.

### Data stores
- **RDS PostgreSQL**: Multi-AZ primary (eu-central-1); read replicas via RDS
  reader endpoint; pgBouncer sidecar for connection pooling.
- **Kafka (MSK)**: 3-broker cluster, 3 AZs; replication factor 3.
- **Qdrant**: StatefulSet on EKS (self-hosted on general-purpose nodes, not GPU).
- **Redis**: ElastiCache cluster mode, 2 shards, 1 replica each.
- **S3**: eu-central-1 primary; cross-region replication to us-east-1 for DR.
  Versioning enabled; lifecycle rules move to Glacier after 90 days.

## 3. GitOps release flow

```
Developer PR → CI (lint/test/build/scan) → merge to main
                                                  │
                              Argo CD detects image tag bump in Helm values
                                                  │
                              Sync to staging → smoke test (Playwright)
                                                  │
                              Sync to production → rolling deploy
                                                  │
                              Monitor Grafana 30 min → rollback if SEV-2+
```

- **Image tags** are immutable SHA digests (not `latest`). The Helm `values.yaml`
  image tag is the single source of deployment truth.
- **Rollback**: `argocd app set <app> --helm-set image.tag=<prev-sha>` + sync.
  Takes < 2 minutes for stateless services.
- **Feature flags** (Statsig / custom): decouple deploy from release. New code
  ships dark; flag enables for cohorts.

## 4. Secrets management

All secrets managed via **AWS Secrets Manager**; injected into pods by the
External Secrets Operator (ESO). No secrets in environment variables baked into
images, no secrets in Git. Rotation: automated for DB credentials (RDS rotation
Lambda); manual-triggered for API keys (with runbook). See
[`secrets-management.md`](../security/secrets-management.md).

## 5. Zero-downtime deployments

- `PodDisruptionBudget`: `minAvailable: 1` for every production `Deployment`.
- `preStop` hook: 5-second sleep before SIGTERM so load-balancer drains
  connections before the pod exits.
- DB migrations are backward-compatible (expand/contract pattern): new column
  first, code update second, cleanup migration last. `atlas migrate lint` in CI
  gates unsafe migrations.

## 6. Disaster recovery targets

| Metric | Target | Mechanism |
| --- | --- | --- |
| RTO (Recovery Time Objective) | < 30 min (RDS) / < 5 min (stateless) | Multi-AZ failover / Argo CD rollback |
| RPO (Recovery Point Objective) | < 5 min | RDS automated backups + WAL shipping; Kafka replication |
| Multi-region failover | < 15 min to us-east-1 read-path | Cloudflare health-check-based DNS failover |

Full DR test: quarterly (see [backup-DR runbook](../../TODO/infra/TODO_backup_dr.md)).
