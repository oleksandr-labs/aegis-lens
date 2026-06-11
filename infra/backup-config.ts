/**
 * Backup Config — Postgres snapshot schedule and PITR (Point-in-Time Recovery) policy.
 *
 * Daily snapshots are taken automatically by RDS. WAL archiving enables PITR
 * to any point within the retention window.
 *
 * Конфігурація бекапів: щоденні знімки Postgres + PITR через WAL-архівування.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Hours between automated Postgres snapshots.
 * RDS daily snapshots are taken during the maintenance window.
 *
 * Інтервал між автоматичними знімками Postgres (години).
 */
export const POSTGRES_SNAPSHOT_INTERVAL_HOURS = 24;

/**
 * Days of PITR retention. WAL logs are archived for this duration.
 * Allows recovery to any second within the retention window.
 *
 * Кількість днів для збереження WAL-логів (PITR).
 */
export const PITR_RETENTION_DAYS = 7;

// ── BackupConfig ──────────────────────────────────────────────────────────────

export interface BackupConfig {
  /** Snapshot interval in hours */
  snapshotIntervalHours: number;
  /** PITR retention in days */
  pitrRetentionDays: number;
  /** Snapshot retention in days (before auto-delete) */
  snapshotRetentionDays: number;
  /** Whether snapshots are encrypted at rest */
  encryptedAtRest: boolean;
  /** KMS key alias for snapshot encryption */
  kmsKeyAlias: string;
  /** AWS region where backup snapshots are replicated */
  crossRegionBackupRegion: string;
  /** Maintenance window for snapshots (UTC) */
  maintenanceWindowUtc: string;
  /** S3 bucket for WAL archive (PITR) */
  walArchiveBucket: string;
  /** Whether automated restore drills are scheduled */
  restoreDrillsEnabled: boolean;
  /** Cron expression for restore drills */
  restoreDrillCron: string;
}

// ── BACKUP_CONFIG ─────────────────────────────────────────────────────────────

export const BACKUP_CONFIG: BackupConfig = {
  snapshotIntervalHours: POSTGRES_SNAPSHOT_INTERVAL_HOURS,
  pitrRetentionDays: PITR_RETENTION_DAYS,
  snapshotRetentionDays: 30,
  encryptedAtRest: true,
  kmsKeyAlias: "alias/aegis-lens-rds",
  crossRegionBackupRegion: "us-east-1",
  maintenanceWindowUtc: "03:00-04:00", // 3-4 AM UTC (low traffic)
  walArchiveBucket: "aegis-lens-wal-archive",
  restoreDrillsEnabled: true,
  restoreDrillCron: "0 4 * * 0", // Weekly Sunday 4 AM UTC
};
