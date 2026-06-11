/**
 * Missed-warning reporting flow.
 *
 * Users can flag media that reached them without an appropriate content
 * warning. Reports are queued for analyst review.
 * Maximum 1 000 reports held in-memory; replace with DB persistence
 * for production use.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MissedWarningReport {
  /** Auto-generated unique report identifier. */
  reportId: string;
  /** URL or identifier of the media item that lacked a warning. */
  mediaUrl: string;
  /** User ID of the person filing the report. */
  reportedBy: string;
  /** Plain-English description of the concern. */
  description_en: string;
  /** ISO-8601 timestamp of submission. */
  reportedAt: string;
}

// ── Store class ───────────────────────────────────────────────────────────────

const MAX_REPORTS = 1_000;

export class MissedWarningStore {
  private readonly reports: MissedWarningReport[] = [];
  private counter = 0;

  /**
   * Submit a new missed-warning report.
   * A unique reportId is generated and returned to the caller.
   * Oldest reports are evicted when the cap of 1 000 is reached.
   */
  submitReport(report: Omit<MissedWarningReport, "reportId">): string {
    this.counter += 1;
    const reportId = `mwr_${Date.now()}_${this.counter}`;
    const full: MissedWarningReport = { ...report, reportId };

    if (this.reports.length >= MAX_REPORTS) {
      this.reports.shift(); // evict oldest
    }
    this.reports.push(full);

    return reportId;
  }

  /** Return all stored reports (newest-last order). */
  getReports(): MissedWarningReport[] {
    return [...this.reports];
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const missedWarningStore = new MissedWarningStore();
