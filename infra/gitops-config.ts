/**
 * GitOps Config — Helm + ArgoCD application definitions.
 *
 * ArgoCD manages all service deployments from the `charts/` directory.
 * Each app has its own Helm chart; values are environment-specific.
 *
 * GitOps: ArgoCD керує деплоями з директорії `charts/` через Helm-чарти.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const GITOPS_TOOL = "argocd" as const;

/**
 * Root directory for all Helm charts in the monorepo.
 *
 * Директорія Helm-чартів у монорепо.
 */
export const HELM_CHART_DIR = "charts/" as const;

// ── ArgoAppConfig ─────────────────────────────────────────────────────────────

export type ArgoSyncPolicy = "auto" | "manual";
export type ArgoPrunePolicy = "enabled" | "disabled";

export interface ArgoAppConfig {
  /** ArgoCD Application name */
  name: string;
  /** Helm chart directory (relative to HELM_CHART_DIR) */
  chart: string;
  /** Target Kubernetes namespace */
  namespace: string;
  /** Git branch tracked by ArgoCD */
  targetRevision: string;
  /** Path to values file for this environment */
  valuesFile: string;
  syncPolicy: ArgoSyncPolicy;
  prunePolicy: ArgoPrunePolicy;
  /** Whether ArgoCD self-heals drift automatically */
  selfHeal: boolean;
  /** Services this app depends on (for wave ordering) */
  dependencies: string[];
  /** ArgoCD sync wave (lower = syncs first) */
  syncWave: number;
}

// ── ARGO_APPS ─────────────────────────────────────────────────────────────────

/**
 * All ArgoCD-managed applications in the platform.
 *
 * Всі застосунки під управлінням ArgoCD.
 */
export const ARGO_APPS: ArgoAppConfig[] = [
  {
    name: "aegis-web",
    chart: "web",
    namespace: "aegis-prod",
    targetRevision: "main",
    valuesFile: "charts/web/values-prod.yaml",
    syncPolicy: "auto",
    prunePolicy: "enabled",
    selfHeal: true,
    dependencies: [],
    syncWave: 3,
  },
  {
    name: "aegis-ingest",
    chart: "ingest",
    namespace: "aegis-prod",
    targetRevision: "main",
    valuesFile: "charts/ingest/values-prod.yaml",
    syncPolicy: "auto",
    prunePolicy: "enabled",
    selfHeal: true,
    dependencies: [],
    syncWave: 1,
  },
  {
    name: "aegis-alerts",
    chart: "alerts",
    namespace: "aegis-prod",
    targetRevision: "main",
    valuesFile: "charts/alerts/values-prod.yaml",
    syncPolicy: "auto",
    prunePolicy: "enabled",
    selfHeal: true,
    dependencies: ["aegis-ingest"],
    syncWave: 2,
  },
  {
    name: "aegis-aoi",
    chart: "aoi",
    namespace: "aegis-prod",
    targetRevision: "main",
    valuesFile: "charts/aoi/values-prod.yaml",
    syncPolicy: "auto",
    prunePolicy: "enabled",
    selfHeal: true,
    dependencies: [],
    syncWave: 2,
  },
  {
    name: "aegis-verify",
    chart: "verify",
    namespace: "aegis-prod",
    targetRevision: "main",
    valuesFile: "charts/verify/values-prod.yaml",
    syncPolicy: "manual", // manual sync for verification service (safety-critical)
    prunePolicy: "disabled",
    selfHeal: false,
    dependencies: ["aegis-ingest"],
    syncWave: 2,
  },
];
