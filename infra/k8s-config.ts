/**
 * Kubernetes / EKS Config — cluster and workload configuration spec.
 *
 * Provider: AWS EKS (managed Kubernetes).
 * Stateful workloads (Postgres, Kafka, Qdrant) run on dedicated node groups.
 * Stateless workloads scale via KEDA / HPA.
 *
 * Специфікація Kubernetes/EKS: провайдер, регіони, типи навантажень.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const K8S_NOTE_EN =
  "EKS cluster per region. Stateful workloads use dedicated EBS-backed node groups; " +
  "stateless workloads use Spot instances via Karpenter for cost optimisation.";

export const K8S_NOTE_UK =
  "EKS кластер на кожен регіон. Stateful — виділені вузли з EBS; " +
  "stateless — Spot через Karpenter для зниження витрат.";

// ── Constants ─────────────────────────────────────────────────────────────────

export const K8S_PROVIDER = "eks" as const;

/**
 * Regions where EKS clusters are provisioned.
 *
 * Регіони, де розгорнуті EKS-кластери.
 */
export const K8S_CLUSTER_REGIONS = ["eu-central-1"] as const;
export type K8sClusterRegion = (typeof K8S_CLUSTER_REGIONS)[number];

export const K8S_WORKLOAD_TYPES = ["stateful", "stateless"] as const;
export type K8sWorkloadType = (typeof K8S_WORKLOAD_TYPES)[number];

// ── NodeGroupConfig ───────────────────────────────────────────────────────────

export interface NodeGroupConfig {
  name: string;
  workloadType: K8sWorkloadType;
  /** EC2 instance type(s) for this node group */
  instanceTypes: string[];
  /** Minimum number of nodes */
  minSize: number;
  /** Maximum number of nodes */
  maxSize: number;
  /** Use Spot instances */
  spot: boolean;
  /** EBS volume size in GB for stateful nodes */
  ebsVolumeSizeGb: number | null;
  taints: string[];
}

// ── K8sClusterConfig ──────────────────────────────────────────────────────────

export interface K8sClusterConfig {
  provider: typeof K8S_PROVIDER;
  region: K8sClusterRegion;
  clusterName: string;
  kubernetesVersion: string;
  nodeGroups: NodeGroupConfig[];
  /** Whether KEDA is installed for event-driven autoscaling */
  kedaEnabled: boolean;
  /** Whether Karpenter is used for node provisioning */
  karpenterEnabled: boolean;
  notes: { en: string; uk: string };
}

// ── K8S_CLUSTER_CONFIG ────────────────────────────────────────────────────────

export const K8S_CLUSTER_CONFIG: K8sClusterConfig = {
  provider: K8S_PROVIDER,
  region: "eu-central-1",
  clusterName: "aegis-lens-prod",
  kubernetesVersion: "1.30",
  nodeGroups: [
    {
      name: "stateless-standard",
      workloadType: "stateless",
      instanceTypes: ["m7i.large", "m7a.large"],
      minSize: 2,
      maxSize: 20,
      spot: true,
      ebsVolumeSizeGb: null,
      taints: [],
    },
    {
      name: "stateful-data",
      workloadType: "stateful",
      instanceTypes: ["r7i.xlarge"],
      minSize: 2,
      maxSize: 6,
      spot: false,
      ebsVolumeSizeGb: 200,
      taints: ["dedicated=stateful:NoSchedule"],
    },
  ],
  kedaEnabled: true,
  karpenterEnabled: true,
  notes: {
    en: K8S_NOTE_EN,
    uk: K8S_NOTE_UK,
  },
};
