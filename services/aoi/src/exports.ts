/**
 * AOI export jobs.
 *
 * Async job system for exporting AOI event history and satellite snapshots
 * in JSON / CSV / GeoJSON format.  Download links are valid for 72 hours.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN operational notes */
export const AOI_EXPORT_NOTES_EN = [
  "async-job: export jobs are queued and processed asynchronously; poll status endpoint until 'done', then fetch downloadUrl",
  "download-link-72h-ttl: generated download URLs (signed S3 / R2 links) expire after 72 hours; re-run the export to refresh",
] as const;

/** UA операційні примітки */
export const AOI_EXPORT_NOTES_UK = [
  "async-job: завдання експорту ставляться в чергу й обробляються асинхронно; опитуйте endpoint статусу до 'done', потім завантажуйте downloadUrl",
  "download-link-72h-ttl: згенеровані посилання (підписані S3/R2) дійсні 72 години; повторіть експорт для оновлення",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for an AOI data export */
export interface AOIExportConfig {
  aoiId: string;
  /** ISO-8601 start date */
  fromDate: string;
  /** ISO-8601 end date */
  toDate: string;
  includeEvents: boolean;
  includeSatelliteSnapshots: boolean;
  format: "json" | "csv" | "geojson";
}

/** State of an export job */
export type AOIExportStatus = "queued" | "running" | "done" | "failed";

/** An export job record */
export interface AOIExportJob {
  jobId: string;
  config: AOIExportConfig;
  status: AOIExportStatus;
  /** Signed download URL (present when status = 'done') */
  downloadUrl?: string;
  /** ISO-8601 expiry of the download link (72 h from job completion) */
  downloadExpiresAt?: string;
  enqueuedAt: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

/**
 * In-memory AOI export queue.
 *
 * Production: replace with BullMQ or pg-boss; write output to object storage
 * and set a signed URL with 72-h TTL.
 */
export class AOIExportQueue {
  private readonly jobs = new Map<string, AOIExportJob>();

  enqueue(config: AOIExportConfig): AOIExportJob {
    const jobId = `exp_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const job: AOIExportJob = {
      jobId,
      config,
      status: "queued",
      enqueuedAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, job);
    return job;
  }

  getJob(jobId: string): AOIExportJob | undefined {
    return this.jobs.get(jobId);
  }

  listForAOI(aoiId: string): AOIExportJob[] {
    return [...this.jobs.values()]
      .filter((j) => j.config.aoiId === aoiId)
      .sort((a, b) => b.enqueuedAt.localeCompare(a.enqueuedAt));
  }

  /** Mark a job as done and store its download URL */
  complete(jobId: string, downloadUrl: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    const now = new Date();
    const expires = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    job.status = "done";
    job.downloadUrl = downloadUrl;
    job.downloadExpiresAt = expires.toISOString();
    job.completedAt = now.toISOString();
  }

  fail(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = "failed";
    job.completedAt = new Date().toISOString();
  }

  /** Drain pending jobs (for worker loop) */
  drainPending(): AOIExportJob[] {
    const pending: AOIExportJob[] = [];
    for (const job of this.jobs.values()) {
      if (job.status === "queued") {
        job.status = "running";
        pending.push(job);
      }
    }
    return pending;
  }
}

/** Module-level singleton */
export const aoiExportQueue = new AOIExportQueue();
