# Kubernetes Platform

> Production-grade EKS clusters, GitOps deploys, autoscaling, network policies.
> **Default pod security profile = restricted. Migration friction is worth the
> security posture.**

## 1. Cluster topology

| Cluster | AWS account | Purpose |
| --- | --- | --- |
| `aegis-prod-eu` | Production EU | All production workloads; eu-central-1 |
| `aegis-prod-us` | Production US | Ingest workers + read-path; us-east-1 |
| `aegis-staging` | Staging | Pre-production validation; eu-central-1 |
| `aegis-dev` | Dev / sandbox | Developer sandboxes; can use Minikube / kind locally |

**Separate AWS accounts** per environment (production isolation):
- No cross-account IAM with production assume-role from dev.
- Billing and cost anomaly detection separated.
- Blast radius of a dev/staging mistake can't touch production.

## 2. Node autoscaling — Karpenter

**Karpenter** (preferred over Cluster Autoscaler for faster scale-out and
spot-instance flexibility):

```yaml
# NodePool: general workloads
spec:
  requirements:
    - key: karpenter.sh/capacity-type
      values: ["on-demand", "spot"]   # spot for stateless; on-demand for stateful
    - key: node.kubernetes.io/instance-type
      values: ["m7g.large", "m7g.xlarge", "r7g.large"]   # Graviton (cost -20%)
  limits:
    cpu: 200
    memory: 800Gi
```

Separate `NodePool` for GPU nodes (`g4dn.xlarge`) gated by `karpenter.k8s.aws/instance-family: g4dn`.
GPU nodes have `Taint: nvidia.com/gpu:NoSchedule` — only AI-service pods tolerate it.

## 3. Horizontal Pod Autoscaler (HPA)

Every stateless service has an HPA:

```yaml
apiVersion: autoscaling/v2
spec:
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }
    - type: External                     # custom: Kafka consumer lag
      external:
        metric: { name: kafka_consumer_lag }
        target: { type: AverageValue, averageValue: "1000" }
  behavior:
    scaleUp:   { stabilizationWindowSeconds: 30  }
    scaleDown: { stabilizationWindowSeconds: 300 }  # slow cool-down prevents thrash
```

KEDA handles event-driven scaling (Kafka lag, queue depth) for ingest workers
that should scale to zero outside peak windows.

## 4. Vertical Pod Autoscaler (VPA) — recommendations only

VPA deployed in **`Recommend` mode only** (not `Auto`) to avoid unexpected pod
evictions in production:
- Weekly VPA report reviews under/over-provisioned pods.
- `requests` and `limits` in Helm charts are updated based on VPA recommendations
  each sprint.
- Rule: `requests` = VPA p50 + 10%; `limits` = VPA p95 + 20%.

## 5. Network policies — default deny

Base policy applied to every namespace:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-all }
spec:
  podSelector: {}          # all pods
  policyTypes: [Ingress, Egress]
  # no ingress/egress rules = deny all
```

Services add explicit allow policies via Helm chart. Cross-namespace traffic
requires a policy in both namespaces. Cilium enforces these at the eBPF layer
(kernel-level, faster than iptables).

## 6. Cilium CNI

Cilium handles: CNI, network policy, mTLS (Cilium Mutual Auth), and network
observability (Hubble). Chosen over Calico for eBPF-native performance and the
built-in mTLS without a full service-mesh overlay.

Key Cilium configs:
- `enable-l7-proxy: true` — HTTP/gRPC aware policies.
- `mutual-auth: "spiffe"` — mTLS between services using SPIFFE identities.
- `hubble-relay: enabled` — network observability dashboard.

## 7. Argo CD GitOps

Argo CD syncs from `infra/charts/` in the monorepo:

```
infra/charts/
  aegis-web/       Chart.yaml + values-{prod,staging}.yaml
  aegis-ingest/
  aegis-nlp/
  aegis-verify/
  ...
```

- **Auto-sync** on `staging` (reconciles immediately on merge to `main`).
- **Manual sync** on `prod` (requires explicit Argo CD UI approval or CLI sync).
- **Image promotion**: CI updates `values-prod.yaml` `image.tag` via a PR;
  merge = deploy trigger.
- All Argo CD `Application` manifests are themselves in Git (App-of-Apps pattern).

## 8. Helm charts per service

Each service has a standard Helm chart structure:

```
charts/<service>/
  Chart.yaml
  values.yaml            # defaults
  values-staging.yaml    # overrides for staging
  values-prod.yaml       # overrides for prod
  templates/
    deployment.yaml
    service.yaml
    hpa.yaml
    pdb.yaml             # PodDisruptionBudget
    networkpolicy.yaml
    serviceaccount.yaml
```

Shared helpers live in `charts/library/` (a Helm library chart) — no duplication
of probes, resource-request patterns, or IRSA annotations across 20+ charts.

## 9. PodDisruptionBudgets + topology spread

Every production `Deployment`:

```yaml
# PodDisruptionBudget
spec:
  minAvailable: 1        # at least 1 pod always up during drains

# TopologySpreadConstraint (in Deployment spec)
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
```

This spreads pods across AZs so a single-AZ failure doesn't take down a service.

## 10. Pod security standards — restricted profile

All namespaces enforce the `restricted` PSS:

```yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
```

Restricted requires: no privileged containers, no hostNetwork/hostPID, no
`capabilities` beyond `NET_BIND_SERVICE`, read-only root filesystem, non-root
user. Services that genuinely need privileges (e.g., the node-monitoring DaemonSet)
are in a dedicated namespace with a looser profile and explicit approval.

## 11. cert-manager + external-dns

- **cert-manager** issues and renews TLS certificates (Let's Encrypt for staging,
  ACM/private CA for production) for Ingress resources.
- **external-dns** syncs Kubernetes Service and Ingress hostnames to Route 53 /
  Cloudflare DNS automatically — no manual DNS management.

## 12. Multi-region (Phase 3) — Karmada / KubeFed

When the us-east-1 cluster needs to run more than ingest workers (full Phase 3
active-active), evaluate **Karmada** for cross-cluster resource propagation:
- Karmada `PropagationPolicy` distributes Deployments to member clusters.
- Cluster-level failover via Karmada override policies.
- This is a significant operational investment — gate on Phase 3 traffic
  requirements before adopting.
