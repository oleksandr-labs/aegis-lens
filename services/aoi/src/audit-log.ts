/**
 * AOI audit log.
 *
 * Immutable append-only log of all AOI creation, access, modification, and
 * policy-check events.  Supports GDPR 6-year retention requirements.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN compliance notes */
export const AOI_AUDIT_NOTES_EN = [
  "immutable-append: audit entries must never be updated or deleted; implement as an append-only Postgres table or immutable object-store prefix",
  "GDPR-6yr-retention: retain audit logs for a minimum of 6 years per GDPR record-keeping requirements; automated deletion after retention window",
] as const;

/** UA нотатки з відповідності */
export const AOI_AUDIT_NOTES_UK = [
  "immutable-append: записи аудиту ніколи не повинні оновлюватись або видалятись; реалізуйте як append-only таблицю Postgres або незмінний префікс об'єктного сховища",
  "GDPR-6yr-retention: зберігайте журнали аудиту щонайменше 6 років відповідно до вимог GDPR; автоматичне видалення після закінчення терміну зберігання",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Actions that generate audit entries */
export type AOIAuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "share"
  | "policy_check";

/** A single immutable audit record */
export interface AOIAuditEntry {
  entryId: string;
  aoiId: string;
  action: AOIAuditAction;
  /** User / service account that performed the action */
  actorId: string;
  /** IP address of the actor, if available */
  actorIp?: string;
  /** Arbitrary action-specific metadata */
  metadata?: Record<string, unknown>;
  /** ISO-8601 timestamp — server-set, never client-provided */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Log
// ---------------------------------------------------------------------------

interface ListOptions {
  limit?: number;
  action?: AOIAuditAction;
  /** Only return entries at or after this ISO-8601 timestamp */
  since?: string;
}

/**
 * In-memory AOI audit log.
 *
 * Production: replace with an append-only database table; add composite
 * index on (aoi_id, timestamp); enforce row-level security so only admins
 * can read entries of other orgs.
 */
export class AOIAuditLog {
  private readonly entries: AOIAuditEntry[] = [];

  /**
   * Record a new audit entry.
   * Generates entryId and timestamp server-side; caller cannot override them.
   */
  record(
    entry: Omit<AOIAuditEntry, "entryId" | "timestamp">,
  ): AOIAuditEntry {
    const full: AOIAuditEntry = {
      ...entry,
      entryId: `aud_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(full);
    return full;
  }

  /**
   * List audit entries for an AOI, newest first.
   */
  list(aoiId: string, options: ListOptions = {}): AOIAuditEntry[] {
    const { limit = 100, action, since } = options;
    let result = this.entries.filter((e) => e.aoiId === aoiId);
    if (action) result = result.filter((e) => e.action === action);
    if (since) result = result.filter((e) => e.timestamp >= since);
    result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return result.slice(0, limit);
  }

  /**
   * Export all audit entries for an AOI (for compliance downloads).
   * Returns the full untruncated history, oldest first.
   */
  export(aoiId: string): AOIAuditEntry[] {
    return this.entries
      .filter((e) => e.aoiId === aoiId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /** Total entry count (for monitoring) */
  get size(): number {
    return this.entries.length;
  }
}

/** Module-level singleton */
export const aoiAuditLog = new AOIAuditLog();
