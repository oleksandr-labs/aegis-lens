# TODO — DevOps & Infrastructure

## Goal
Reproducible infra, fast deploys, resilient at multi-region scale.

## Progress
- 17 / 17 done

## Tasks

### Cloud
- [x] Primary: AWS (eu-central + us-east). Hedge: Hetzner for batch / cold storage. — infra/cloud-spec.ts
- [x] Terraform / Pulumi IaC — `infra/terraform/` with workspace-per-env, network/rds/s3 modules
- [x] Multi-AZ Postgres (RDS) + read replicas — `modules/rds/main.tf` with multi_az + read replica for prod
- [x] S3 + Cloudfront for media — `modules/s3/main.tf` with media + tiles buckets + cross-region replication

### Containers & orchestration
- [x] Docker images per service, multi-arch — infra/docker-config.ts
- [x] Kubernetes (EKS) for stateful workloads — infra/k8s-config.ts
- [x] Vercel / Cloudflare Pages for frontend — infra/frontend-hosting.ts
- [x] Helm charts + Argo CD (GitOps) — infra/gitops-config.ts

### CI/CD
- [x] GitHub Actions pipelines — `.github/workflows/ci.yml` (build/test/security) + `deploy.yml` (staging/prod)
- [x] Per-PR preview envs — infra/preview-envs.ts
- [x] Migration safety checks (squawk / atlas) — `db-migration-check` job in ci.yml
- [x] Canary / blue-green deploys — infra/deploy-strategy.ts

### Secrets & config
- [x] Doppler / AWS Secrets Manager — infra/secrets-config.ts
- [x] Per-env config separation; no secrets in repo — infra/env-config.ts

### Backups & DR
- [x] Daily Postgres snapshots + PITR — infra/backup-config.ts
- [x] Cross-region S3 replication for media — infra/s3-replication.ts
- [x] DR runbook + restore drills — infra/dr-runbook.ts

## i18n
- N/A.

### Примітки
Don't pick a cloud before MVP traction. Stay portable (no proprietary services in the hot path).
