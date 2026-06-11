/**
 * Ingest Service — Bounded Backfill Workers
 *
 * Backfills historical data from a source between two cursor positions.
 * Bounded by:
 *   - maxConcurrency (global cap: 3 simultaneous jobs)
 *   - per-batch rate limiting (rateLimitMs sleep between batches)
 *   - explicit start/end cursor range
 *
 * Jobs are enqueued and executed asynchronously.
 * Checkpoint progression is recorded after each batch.
 */

import { InMemoryCheckpointStore } from "./checkpoint";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BackfillConfig {
  sourceId: string;
  /** Opaque cursor marking the start of the backfill range (oldest) */
  startCursor: string;
  /** Opaque cursor marking the end of the backfill range (newest) */
  endCursor: string;
  /** Number of items to fetch per batch */
  batchSize: number;
  /** Max parallel batches for this job (capped at global MAX_CONCURRENT_JOBS) */
  maxConcurrency: number;
  /** Minimum milliseconds to wait between batches (rate limiting) */
  rateLimitMs: number;
}

export interface BackfillJob {
  id: string;
  config: BackfillConfig;
  status: "pending" | "running" | "done" | "failed";
  processed: number;
  errors: number;
  startedAt?: string;
  completedAt?: string;
  /** Last error message, if any */
  lastError?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_CONCURRENT_JOBS = 3;

// ── Worker ────────────────────────────────────────────────────────────────────

let _jobSeq = 0;

export class BackfillWorker {
  private readonly jobs = new Map<string, BackfillJob>();
  private readonly checkpoints = new InMemoryCheckpointStore();
  private runningCount = 0;

  enqueue(config: BackfillConfig): BackfillJob {
    const id = `backfill-${++_jobSeq}-${Date.now()}`;
    const job: BackfillJob = {
      id,
      config,
      status: "pending",
      processed: 0,
      errors: 0,
    };
    this.jobs.set(id, job);

    // Kick off asynchronously without blocking the caller
    void this._maybeStart(id);

    return { ...job };
  }

  getJob(id: string): BackfillJob | undefined {
    const job = this.jobs.get(id);
    return job ? { ...job } : undefined;
  }

  listJobs(): BackfillJob[] {
    return [...this.jobs.values()].map((j) => ({ ...j }));
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async _maybeStart(id: string): Promise<void> {
    // Wait until a slot is available (poll with short delay)
    while (this.runningCount >= MAX_CONCURRENT_JOBS) {
      await sleep(500);
    }
    const job = this.jobs.get(id);
    if (!job || job.status !== "pending") return;
    await this._runJob(job);
  }

  private async _runJob(job: BackfillJob): Promise<void> {
    this.runningCount++;
    job.status = "running";
    job.startedAt = new Date().toISOString();
    this.jobs.set(job.id, job);

    try {
      const { config } = job;

      // Initialise checkpoint to startCursor
      await this.checkpoints.set(
        backfillCheckpointKey(job.id),
        config.startCursor,
      );

      let cursor = config.startCursor;
      let batchNum = 0;

      while (cursor !== config.endCursor) {
        batchNum++;

        // Simulate fetching a batch: advance cursor to next batch position.
        // Real implementation would call adapter.fetchSince(cursor) here.
        const { nextCursor, fetched, fetchErrors } = await simulateBatch(
          cursor,
          config.endCursor,
          config.batchSize,
        );

        job.processed += fetched;
        job.errors += fetchErrors;

        // Persist checkpoint after each successful batch
        cursor = nextCursor;
        await this.checkpoints.set(backfillCheckpointKey(job.id), cursor);

        this.jobs.set(job.id, job);

        // Rate limit between batches
        if (cursor !== config.endCursor && config.rateLimitMs > 0) {
          await sleep(config.rateLimitMs);
        }

        // Safety: break if we somehow loop > 10 000 batches (unbounded cursor)
        if (batchNum > 10_000) {
          job.lastError = "Exceeded maximum batch iterations (10 000)";
          job.status = "failed";
          break;
        }
      }

      if (job.status !== "failed") {
        job.status = "done";
      }
    } catch (err) {
      job.status = "failed";
      job.lastError = err instanceof Error ? err.message : String(err);
    } finally {
      job.completedAt = new Date().toISOString();
      this.jobs.set(job.id, job);
      this.runningCount = Math.max(0, this.runningCount - 1);
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function backfillCheckpointKey(jobId: string): string {
  return `backfill:${jobId}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Codeable-contract stub for batch fetching.
 * In production, replace with adapter.fetchSince(cursor, batchSize).
 *
 * Advances the cursor by one unit toward endCursor.
 * Returns the next cursor, number of items fetched, and error count.
 */
async function simulateBatch(
  cursor: string,
  endCursor: string,
  batchSize: number,
): Promise<{ nextCursor: string; fetched: number; fetchErrors: number }> {
  // If cursors are numeric strings, increment by batchSize
  const curNum = parseInt(cursor, 10);
  const endNum = parseInt(endCursor, 10);

  if (!isNaN(curNum) && !isNaN(endNum)) {
    const next = Math.min(curNum + batchSize, endNum);
    return {
      nextCursor: String(next),
      fetched: next - curNum,
      fetchErrors: 0,
    };
  }

  // For opaque string cursors: treat endCursor as terminal
  return {
    nextCursor: endCursor,
    fetched: batchSize,
    fetchErrors: 0,
  };
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const backfillWorker = new BackfillWorker();
