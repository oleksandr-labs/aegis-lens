/**
 * Report audit log — immutable record of every action taken on a report.
 * GDPR retention: 5 years.
 *
 * Журнал аудиту звітів — незмінний запис кожної дії над звітом.
 * Зберігання GDPR: 5 років.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportAuditAction =
  | "create"
  | "edit"
  | "publish"
  | "unpublish"
  | "delete"
  | "approve"
  | "reject"
  | "deliver";

export interface ReportAuditEntry {
  entryId: string;
  reportId: string;
  action: ReportAuditAction;
  actorId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Log
// ---------------------------------------------------------------------------

export class ReportAuditLog {
  private readonly entries: ReportAuditEntry[] = [];
  private entryCounter = 0;

  /**
   * Records a new audit entry.
   * Записує новий запис аудиту.
   */
  record(
    entry: Omit<ReportAuditEntry, "entryId" | "timestamp">,
  ): ReportAuditEntry {
    const full: ReportAuditEntry = {
      ...entry,
      entryId:   `rae_${Date.now()}_${++this.entryCounter}`,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(full);
    return full;
  }

  /**
   * Lists audit entries for a report, with optional filtering.
   * Повертає записи аудиту для звіту з опціональною фільтрацією.
   */
  list(
    reportId: string,
    options?: {
      action?: ReportAuditAction;
      actorId?: string;
      limit?: number;
    },
  ): ReportAuditEntry[] {
    let results = this.entries.filter((e) => e.reportId === reportId);

    if (options?.action) {
      results = results.filter((e) => e.action === options.action);
    }
    if (options?.actorId) {
      results = results.filter((e) => e.actorId === options.actorId);
    }
    // Return newest first
    results = results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    return results;
  }
}

/** Module-level singleton */
export const reportAuditLog = new ReportAuditLog();

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const AUDIT_LOG_NOTES_EN: string[] = [
  "GDPR-retention-5yr: audit log entries must be retained for 5 years from creation date; a scheduled purge job should delete entries older than 5 years — but ONLY for reports that have also been deleted (active-report audit trails are kept indefinitely per compliance requirement).",
];

export const AUDIT_LOG_NOTES_UK: string[] = [
  "GDPR-retention-5yr: записи журналу аудиту зберігаються 5 років з дати створення; заплановане завдання очищення видаляє записи старше 5 років — але ТІЛЬКИ для видалених звітів (журнали аудиту активних звітів зберігаються безстроково відповідно до вимог відповідності).",
];
