# TODO — Kubernetes Platform

## Goal
Production-grade EKS clusters, GitOps deploys, autoscaling, network policies.

## Progress
- 12 / 12 done

## Tasks
- [x] EKS clusters: prod + staging + dev (separate AWS accounts) → [kubernetes.md §1](../../docs/infra/kubernetes.md) (prod-eu / prod-us / staging / dev; account isolation)
- [x] Karpenter / Cluster Autoscaler for node autoscaling → §2 (Karpenter NodePools; Graviton spot; GPU node group)
- [x] HPA per service (CPU / memory / custom metrics) → §3 (CPU 65% + Kafka consumer lag; KEDA for scale-to-zero)
- [x] VPA for right-sizing recommendations → §4 (Recommend mode only; weekly report; requests = p50+10%)
- [x] Network policies (default deny, explicit allow) → §5 (default-deny-all base policy per namespace)
- [x] Cilium / Calico CNI → §6 (Cilium: eBPF, L7 policy, mTLS SPIFFE, Hubble observability)
- [x] Argo CD GitOps from `infra/` repo → §7 (auto-sync staging; manual-sync prod; App-of-Apps)
- [x] Helm charts per service → §8 (standard structure; library chart for shared helpers)
- [x] PodDisruptionBudgets + topologySpreadConstraints → §9 (minAvailable: 1; spread across AZs)
- [x] Pod security standards: restricted profile → §10 (namespace label enforce: restricted)
- [x] cert-manager + external-dns → §11
- [x] Karmada / KubeFed if multi-region (Phase 3) → §12 (gated on Phase 3 traffic requirements)

## i18n
- N/A.

### Примітки
Default profile = restricted. Migration friction is worth the security posture.

### Done notes (2026-05-30)
[docs/infra/kubernetes.md](../../docs/infra/kubernetes.md). Separate AWS accounts per env; Karpenter
Graviton spot; default-deny network policy; restricted PSS; App-of-Apps Argo CD pattern.
