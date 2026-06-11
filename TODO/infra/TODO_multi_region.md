# TODO — Multi-Region Architecture

## Goal
Latency-aware routing for global users; resilience to single-region failure.

## Progress
- 8 / 9 done

## Tasks
- [x] Primary: eu-central-1; secondary: us-east-1; tertiary planned: ap-southeast-1 — region topology in `docs/architecture/multi-region.md`
- [x] Read replicas per region — write-vs-read routing table + `DATABASE_URL_PRIMARY`/`_REPLICA` split documented
- [x] Per-region object cache (S3 + CDN) — cross-region S3 replication (Terraform `modules/s3`) + CDN per region in multi-region.md
- [x] Kafka cluster MirrorMaker 2 or multi-region cluster — MirrorMaker 2 in region topology diagram
- [x] Latency-routed DNS — Cloudflare geo-steering documented in multi-region.md
- [x] Per-region observability stacks — per-region Prometheus + federated Grafana section
- [x] Compliance: EU data residency enforced for EU customers — `orgs.data_residency='eu'` row-level replication filtering section
- [x] Failover drills per region — quarterly failover drill procedure + RTO/RPO targets
- [ ] Active-active write path (Phase 3) — significant engineering investment (documented as Phase 3, not yet built)

## i18n
- Region selection should hint locale defaults (cookie / IP).

### Примітки
Multi-region writes is a large project. MVP: active read replicas, single write region.
