# TODO — Master Architecture

## Goal
Single canonical view of the system: layers, services, data flow, deployment, scaling, security.

## Progress
- 12 / 12 done

## Tasks
- [x] System context diagram (C4 Level 1) — `docs/architecture/c4-diagrams.md`
- [x] Container diagram (C4 Level 2) — `docs/architecture/c4-diagrams.md` (17 containers with relationships)
- [x] Component diagrams per service (C4 Level 3) — Ingest Service component diagram in c4-diagrams.md
- [x] Data-flow diagrams for ingest → enrich → serve — `docs/architecture/data-flow.md`
- [x] Sequence diagrams (auth, alert delivery, AI copilot, AOI monitoring) — `docs/architecture/sequence-diagrams.md` (5 diagrams)
- [x] Deployment topology (multi-region, multi-cloud-ready) → [docs/architecture/deployment.md](../../docs/architecture/deployment.md) (per-layer: Vercel/EKS/MSK/RDS/S3; GitOps Argo CD flow; zero-downtime; DR targets)
- [x] Scaling plan (per service, per region) — `docs/architecture/scalability-plan.md`
- [x] Security architecture overview → [docs/architecture/security-architecture.md](../../docs/architecture/security-architecture.md) (defence-in-depth layers; authn/authz; network; secrets; PII/source-protection; vuln mgmt; supply-chain)
- [x] Cost model overlay (per architectural choice) → [docs/architecture/cost-model.md](../../docs/architecture/cost-model.md) (Tier 1/2/3 estimates; unit-economics targets; ADR cost-annotation pattern)
- [x] ADRs cross-referenced → [docs/architecture/tech-stack.md](../../docs/architecture/tech-stack.md) (ADR cross-ref table at bottom) + [docs/adr/README.md](../../docs/adr/README.md)
- [x] Architecture review board cadence → [docs/architecture/architecture-review-board.md](../../docs/architecture/architecture-review-board.md) (charter; membership; triggers; monthly sync + annual audit)
- [x] Public-safe summary → [docs/architecture/public-summary.md](../../docs/architecture/public-summary.md) (for Trust Center + enterprise procurement; no sensitive detail)

## i18n
- N/A.

### Примітки
Diagrams as code (Structurizr / Mermaid / D2). Versioned in repo.

### Done notes (2026-05-30)
Closed 6 remaining tasks. New docs:
- [deployment.md](../../docs/architecture/deployment.md) — GitOps Argo CD flow, per-layer topology, zero-downtime, DR targets (RTO <30m, RPO <5m)
- [security-architecture.md](../../docs/architecture/security-architecture.md) — defence-in-depth with Cloudflare→EKS→RLS+Cilium layering; PII/source-protection pipeline
- [cost-model.md](../../docs/architecture/cost-model.md) — Tier 1 ~$700-1100/mo → Tier 3 ~$16k-35k/mo; LLM is 50-60% of Tier 3 bill
- [architecture-review-board.md](../../docs/architecture/architecture-review-board.md) — ARB charter, cadence (as-needed + monthly sync + annual audit)
- [public-summary.md](../../docs/architecture/public-summary.md) — Trust Center / procurement overview
- ADR cross-ref table in [tech-stack.md](../../docs/architecture/tech-stack.md)
