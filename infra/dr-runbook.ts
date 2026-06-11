/**
 * DR Runbook — disaster recovery procedure steps and objectives.
 *
 * RTO (Recovery Time Objective): 4 hours.
 * RPO (Recovery Point Objective): 1 hour.
 * 10-step runbook covers detection → failover → validation → post-incident.
 *
 * Книга аварійного відновлення: RTO=4h, RPO=1h, 10 кроків.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const DR_NOTE_EN =
  "Run restore drills weekly (cron: 0 4 * * 0). All steps must complete within RTO_HOURS. " +
  "Drill results are logged to the incident management system.";

export const DR_NOTE_UK =
  "Проводити відновлювальні навчання щотижня. Усі кроки мають вкластись у RTO_HOURS. " +
  "Результати фіксуються у системі управління інцидентами.";

// ── Objectives ────────────────────────────────────────────────────────────────

/**
 * Recovery Time Objective: maximum acceptable downtime in hours.
 *
 * Максимально допустимий час простою (години).
 */
export const RTO_HOURS = 4;

/**
 * Recovery Point Objective: maximum acceptable data loss window in hours.
 *
 * Максимально допустимий обсяг втрачених даних (годин).
 */
export const RPO_HOURS = 1;

// ── DRStep ────────────────────────────────────────────────────────────────────

export interface DRStep {
  step: number;
  title: string;
  description: string;
  /** Estimated time to complete in minutes */
  estimatedMinutes: number;
  /** Team responsible for this step */
  owner: "on-call-engineer" | "platform-lead" | "dba" | "security" | "all";
  /** Runbook commands or references (stub strings) */
  commands: string[];
  /** Verification check to confirm step completion */
  verificationCheck: string;
}

// ── DRRunbook ─────────────────────────────────────────────────────────────────

export interface DRRunbook {
  version: string;
  rtoHours: number;
  rpoHours: number;
  steps: DRStep[];
  notes: { en: string; uk: string };
}

// ── DR_RUNBOOK_STEPS ──────────────────────────────────────────────────────────

/**
 * 10-step disaster recovery runbook.
 *
 * 10 кроків відновлення після катастрофи.
 */
export const DR_RUNBOOK_STEPS: DRStep[] = [
  {
    step: 1,
    title: "Detect & Declare Incident",
    description:
      "On-call receives PagerDuty alert. Confirm outage scope (partial vs full). " +
      "Declare P0 incident in incident management system. Notify stakeholders.",
    estimatedMinutes: 5,
    owner: "on-call-engineer",
    commands: [
      "# Check monitoring dashboard: https://grafana.aegis-lens.uk",
      "# Declare in Incident.io: /incident declare --severity p0",
    ],
    verificationCheck: "Incident created in Incident.io with P0 severity and stakeholders notified.",
  },
  {
    step: 2,
    title: "Assess Data Loss Window",
    description:
      "Query RDS PITR metadata to determine last consistent point. " +
      "Compare against RPO_HOURS. If data loss exceeds RPO, escalate to DBA immediately.",
    estimatedMinutes: 10,
    owner: "dba",
    commands: [
      "aws rds describe-db-instances --db-instance-identifier aegis-lens-prod --query 'DBInstances[0].LatestRestorableTime'",
    ],
    verificationCheck: "Confirmed last restorable time is within RPO_HOURS.",
  },
  {
    step: 3,
    title: "Activate DR Database (PITR Restore)",
    description:
      "Restore Postgres to the latest restorable time in the DR region (us-east-1). " +
      "Use RDS PITR restore-db-instance-to-point-in-time command.",
    estimatedMinutes: 30,
    owner: "dba",
    commands: [
      "aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier aegis-lens-prod --target-db-instance-identifier aegis-lens-dr --restore-time <LATEST_RESTORABLE_TIME> --region us-east-1",
    ],
    verificationCheck: "DR Postgres instance status = 'available' in us-east-1.",
  },
  {
    step: 4,
    title: "Update Secrets / Connection Strings",
    description:
      "Update DATABASE_URL in Doppler (prod namespace) to point to DR Postgres endpoint. " +
      "Trigger Doppler → AWS SM sync. Verify ASCP picks up new value in running pods.",
    estimatedMinutes: 10,
    owner: "platform-lead",
    commands: [
      "doppler secrets set DATABASE_URL='<DR_POSTGRES_URL>' --project aegis-lens --config prod",
      "# Wait for ASCP rotation (up to 5 min) or restart deployments",
    ],
    verificationCheck: "All pods read updated DATABASE_URL from ASCP / env.",
  },
  {
    step: 5,
    title: "Failover Frontend to Cloudflare Pages",
    description:
      "If Vercel is affected: update DNS CNAME for aegis-lens.uk to point to CF Pages deployment. " +
      "CF Pages is kept in sync with main branch via CI.",
    estimatedMinutes: 10,
    owner: "platform-lead",
    commands: [
      "# In Cloudflare DNS: update CNAME aegis-lens.uk → aegis-lens-fallback.pages.dev",
      "# Propagation: ~2 min with Cloudflare proxied record",
    ],
    verificationCheck: "curl -I https://aegis-lens.uk returns 200 from CF Pages origin.",
  },
  {
    step: 6,
    title: "Redeploy Backend Services to DR Region",
    description:
      "Trigger ArgoCD sync against the DR EKS cluster in us-east-1. " +
      "Services pull images from ECR (cross-region replicated). " +
      "Verify all ARGO_APPS reach Healthy status.",
    estimatedMinutes: 20,
    owner: "on-call-engineer",
    commands: [
      "argocd app sync --all --server argocd.dr.aegis-lens.uk",
      "argocd app wait --all --health --timeout 600",
    ],
    verificationCheck: "argocd app list shows all apps Healthy + Synced in us-east-1 cluster.",
  },
  {
    step: 7,
    title: "Validate S3 Media Replication",
    description:
      "Verify that the media, tiles, and exports buckets in us-east-1 are up-to-date " +
      "via S3 replication metrics. Update CDN origin to us-east-1 bucket if needed.",
    estimatedMinutes: 10,
    owner: "platform-lead",
    commands: [
      "aws s3api get-bucket-replication --bucket aegis-lens-media-eu-central-1",
      "# Update CloudFront origin to aegis-lens-media-us-east-1 if EU bucket unavailable",
    ],
    verificationCheck: "Media URLs resolve correctly from DR S3 bucket.",
  },
  {
    step: 8,
    title: "Run Smoke Tests",
    description:
      "Execute the automated smoke test suite against the DR environment. " +
      "Tests cover: auth, event ingestion, search, map render, and alerts.",
    estimatedMinutes: 10,
    owner: "on-call-engineer",
    commands: [
      "pnpm test:smoke --env=dr",
    ],
    verificationCheck: "All smoke tests pass (0 failures).",
  },
  {
    step: 9,
    title: "Communicate Status to Users",
    description:
      "Post status update on status.aegis-lens.uk. " +
      "Notify enterprise customers via email. " +
      "Update the incident timeline in Incident.io.",
    estimatedMinutes: 5,
    owner: "all",
    commands: [
      "# Post on status.aegis-lens.uk: 'Service restored. Investigating root cause.'",
    ],
    verificationCheck: "Status page updated. Enterprise notification emails sent.",
  },
  {
    step: 10,
    title: "Post-Incident Review & Failback Plan",
    description:
      "Schedule post-incident review (within 48h). " +
      "Document root cause, timeline, and action items. " +
      "Plan failback to eu-central-1 once primary region recovers.",
    estimatedMinutes: 15,
    owner: "platform-lead",
    commands: [
      "# Create PIR doc from template: docs/incident-template.md",
      "# Schedule failback maintenance window (off-peak)",
    ],
    verificationCheck: "PIR document created and shared. Failback window scheduled.",
  },
];

// ── DR_RUNBOOK ────────────────────────────────────────────────────────────────

export const DR_RUNBOOK: DRRunbook = {
  version: "1.0",
  rtoHours: RTO_HOURS,
  rpoHours: RPO_HOURS,
  steps: DR_RUNBOOK_STEPS,
  notes: {
    en: DR_NOTE_EN,
    uk: DR_NOTE_UK,
  },
};
