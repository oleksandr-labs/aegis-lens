/**
 * Secrets Config — Doppler primary + AWS Secrets Manager backup.
 *
 * Doppler is the single source of truth for all secrets. AWS Secrets Manager
 * serves as a DR backup and is used for EKS pod injection via ASCP.
 *
 * Doppler — основне сховище секретів; AWS Secrets Manager — резервне + EKS-інʼєкція.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SECRETS_NOTE_EN =
  "All secrets are managed in Doppler. AWS Secrets Manager is synced automatically " +
  "via Doppler's AWS sync integration and used for pod-level injection in EKS " +
  "(AWS Secrets and Config Provider — ASCP).";

export const SECRETS_NOTE_UK =
  "Усі секрети керуються в Doppler. AWS Secrets Manager синхронізується автоматично " +
  "через інтеграцію Doppler → AWS. Для EKS-подів — AWS ASCP.";

// ── Provider constants ────────────────────────────────────────────────────────

export const SECRETS_PROVIDER = "doppler" as const;
export const AWS_BACKUP_SECRETS_PROVIDER = "aws-secrets-manager" as const;

/**
 * Doppler namespace (config) names per environment.
 *
 * Назви конфігурацій Doppler для кожного середовища.
 */
export const SECRET_NAMESPACES = ["prod", "staging", "preview"] as const;
export type SecretNamespace = (typeof SECRET_NAMESPACES)[number];

// ── SecretsConfig ─────────────────────────────────────────────────────────────

export interface SecretsConfig {
  provider: typeof SECRETS_PROVIDER;
  backupProvider: typeof AWS_BACKUP_SECRETS_PROVIDER;
  namespaces: readonly SecretNamespace[];
  /** Doppler project name */
  dopplerProject: string;
  /** AWS Secrets Manager path prefix */
  awsSmPathPrefix: string;
  /** Whether secrets are auto-synced from Doppler to AWS SM */
  autoSyncEnabled: boolean;
  /** Rotation interval in days for long-lived credentials */
  rotationIntervalDays: number;
  /** Secret keys that must never appear in logs or error messages */
  sensitiveKeys: string[];
  notes: { en: string; uk: string };
}

// ── SECRETS_CONFIG ────────────────────────────────────────────────────────────

export const SECRETS_CONFIG: SecretsConfig = {
  provider: SECRETS_PROVIDER,
  backupProvider: AWS_BACKUP_SECRETS_PROVIDER,
  namespaces: SECRET_NAMESPACES,
  dopplerProject: "aegis-lens",
  awsSmPathPrefix: "/aegis-lens/",
  autoSyncEnabled: true,
  rotationIntervalDays: 90,
  sensitiveKeys: [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "AWS_SECRET_ACCESS_KEY",
    "REDIS_URL",
    "JWT_SECRET",
    "ENCRYPTION_KEY",
  ],
  notes: {
    en: SECRETS_NOTE_EN,
    uk: SECRETS_NOTE_UK,
  },
};
