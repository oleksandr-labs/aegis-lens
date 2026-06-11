/**
 * Sentinel-2 / Sentinel-1 change detection per AOI.
 *
 * Builds change-detection requests, defines result shapes, and provides a
 * simple in-memory queue that the scheduler drives.
 *
 * Production implementation should call the Copernicus Open Access Hub
 * (https://scihub.copernicus.eu/dhus/odata/v1) or the newer Copernicus
 * Dataspace STAC API to obtain before/after scene pairs, then run a
 * normalised-difference or coherence-change algorithm.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN implementation notes */
export const SENTINEL_NOTES_EN = [
  "Copernicus-Open-Access-Hub-API: query scenes at https://scihub.copernicus.eu/dhus/odata/v1 (or Copernicus Dataspace STAC); free registration required",
  "6-day-revisit-S2: Sentinel-2 has ~5-day global revisit (2-satellite constellation); set satellite_cadence_days ≥ 6 for fresh comparisons",
  "12-day-revisit-S1: Sentinel-1 SAR has ~6-12 day revisit depending on orbit and latitude; useful for cloud-covered regions",
  "cloud-cover-filter: use cloudCoverMaxPct (default 20%) to reject cloudy Sentinel-2 scenes; Sentinel-1 is cloud-independent",
] as const;

/** UA нотатки щодо реалізації */
export const SENTINEL_NOTES_UK = [
  "Copernicus-Open-Access-Hub-API: запитуйте сцени на https://scihub.copernicus.eu/dhus/odata/v1 (або Copernicus Dataspace STAC); потрібна безкоштовна реєстрація",
  "6-day-revisit-S2: Sentinel-2 має ~5-денний глобальний перегляд (2 супутники); встановлюйте satellite_cadence_days ≥ 6 для свіжих порівнянь",
  "12-day-revisit-S1: Sentinel-1 SAR має ~6-12-денний перегляд залежно від орбіти та широти; корисний для хмарних регіонів",
  "cloud-cover-filter: використовуйте cloudCoverMaxPct (за замовчуванням 20%) для відхилення хмарних сцен Sentinel-2; Sentinel-1 не залежить від хмарності",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Sentinel satellite mission identifier */
export type SentinelMission = "sentinel-2" | "sentinel-1";

/** Request to run change detection for one AOI over a date window */
export interface ChangeDetectionRequest {
  aoiId: string;
  mission: SentinelMission;
  /** ISO-8601 date string for the "before" scene */
  beforeDate: string;
  /** ISO-8601 date string for the "after" scene */
  afterDate: string;
  /** Maximum allowed cloud cover percentage for optical scenes (0-100, default 20) */
  cloudCoverMaxPct?: number;
}

/** Result produced after processing a change detection pair */
export interface ChangeDetectionResult {
  aoiId: string;
  mission: SentinelMission;
  /** Normalised change intensity 0 (no change) – 1 (complete change) */
  score: number;
  /** Estimated area of detected change in km² */
  changedAreaSqKm?: number;
  /** True when score exceeds the AOI alert threshold */
  alertTriggered: boolean;
  /** ISO-8601 timestamp of processing completion */
  processedAt: string;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Build a ChangeDetectionRequest for an AOI.
 *
 * @param aoi  — any AOI-like object with an `aoi_id` field
 * @param mission — which Sentinel satellite to task
 * @param days  — how many days back to set the "before" date
 */
export function buildChangeDetectionRequest(
  aoi: { aoi_id: string },
  mission: SentinelMission,
  days: number,
): ChangeDetectionRequest {
  const after = new Date();
  const before = new Date(after.getTime() - days * 86_400_000);
  return {
    aoiId: aoi.aoi_id,
    mission,
    beforeDate: before.toISOString().slice(0, 10),
    afterDate: after.toISOString().slice(0, 10),
    cloudCoverMaxPct: mission === "sentinel-1" ? undefined : 20,
  };
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

interface QueuedJob {
  request: ChangeDetectionRequest;
  status: "pending" | "running" | "done" | "failed";
  result?: ChangeDetectionResult;
  enqueuedAt: string;
}

/**
 * In-memory change detection queue.
 *
 * Production should replace this with a durable job queue (BullMQ / pg-boss).
 */
export class ChangeDetectionQueue {
  private readonly jobs = new Map<string, QueuedJob>();

  enqueue(request: ChangeDetectionRequest): string {
    const jobId = `cdq_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    this.jobs.set(jobId, {
      request,
      status: "pending",
      enqueuedAt: new Date().toISOString(),
    });
    return jobId;
  }

  getJob(jobId: string): QueuedJob | undefined {
    return this.jobs.get(jobId);
  }

  listForAOI(aoiId: string): QueuedJob[] {
    return [...this.jobs.values()].filter((j) => j.request.aoiId === aoiId);
  }

  /**
   * Mark a job as done and store its result.
   * Called by the worker after Sentinel scene processing.
   */
  complete(jobId: string, result: ChangeDetectionResult): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = "done";
    job.result = result;
  }

  fail(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = "failed";
  }

  /** Drain all pending jobs (returns job IDs to process). */
  drainPending(): string[] {
    const ids: string[] = [];
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "pending") {
        job.status = "running";
        ids.push(id);
      }
    }
    return ids;
  }
}

/** Module-level singleton */
export const changeDetectionQueue = new ChangeDetectionQueue();
