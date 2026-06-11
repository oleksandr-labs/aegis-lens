# TODO — Deployment Architecture

## Goal
How code becomes production. Per service, per env, per region.

## Progress
- 3 / 10 done

## Tasks
- [x] Per-service Dockerfile + multi-arch builds — `apps/web/Dockerfile` (3-stage: deps/builder/runner, non-root user, healthcheck); `services/ingest/Dockerfile`
- [x] Helm chart per service in `infra/charts/` — `infra/charts/aegis-web/` with Chart.yaml + values.yaml (HPA, PDB, topology spread, probes, ingress, TLS)
- [ ] Argo CD app-of-apps GitOps pattern
- [x] Per-env values (dev / staging / prod / sovereign) — Terraform workspaces (dev/staging/prod) + GitHub Actions deploy.yml with per-env secrets
- [ ] Canary + blue-green strategies per service
- [ ] Per-env secrets via External Secrets Operator
- [ ] Image signing + admission control (cosign + Kyverno)
- [ ] PR preview environments (FE on Vercel, BE on ephemeral k8s)
- [ ] Per-region failover playbooks
- [ ] Deployment frequency target: > 5 per day per service

## i18n
- N/A.

### Примітки
Boring deploys = happy engineers. Make it boring.
