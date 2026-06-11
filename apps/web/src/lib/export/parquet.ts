/**
 * Parquet bulk-historical export — job queue, config types, and policy notes.
 * Масовий архівний експорт Parquet — черга завдань, типи конфігурації та правила.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParquetExportConfig {
  datasetId: string;
  fromDate: string;
  toDate: string;
  fields: string[];
  compressionCodec: "snappy" | "gzip" | "zstd";
  maxRowsPerFile: number;
}

export interface ParquetExportJob {
  jobId: string;
  config: ParquetExportConfig;
  status: "queued" | "running" | "done" | "failed";
  outputUrls?: string[];
  rowCount?: number;
  createdAt: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const PARQUET_DEFAULTS = {
  compressionCodec: "snappy" as const,
  maxRowsPerFile: 1_000_000,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Output files are written to S3-compatible object storage; URLs are pre-signed for 48 h */
export const PARQUET_NOTE_S3_EN =
  "Output files are written to S3-compatible object storage; download URLs are pre-signed and expire after 48 hours.";
export const PARQUET_NOTE_S3_UK =
  "Вихідні файли записуються в S3-сумісне об'єктне сховище; URL-адреси для завантаження є попередньо підписаними та дійсні 48 годин.";

/** Export is async — jobs are queued and processed in the background */
export const PARQUET_NOTE_ASYNC_EN =
  "Export is asynchronous — jobs are queued and processed in the background; poll GET /api/v1/export/parquet/:jobId for status updates.";
export const PARQUET_NOTE_ASYNC_UK =
  "Експорт є асинхронним — завдання ставляться в чергу та обробляються у фоновому режимі; опитуйте GET /api/v1/export/parquet/:jobId для отримання оновлень статусу.";

/** Maximum date range per job is 5 years */
export const PARQUET_NOTE_RANGE_EN =
  "Maximum date range per job is 5 years; for ranges exceeding 5 years, split the request into multiple jobs across sub-periods.";
export const PARQUET_NOTE_RANGE_UK =
  "Максимальний діапазон дат на завдання — 5 років; для діапазонів понад 5 років розбийте запит на кілька завдань по підперіодах.";

export const PARQUET_NOTES_EN = [
  PARQUET_NOTE_S3_EN,
  PARQUET_NOTE_ASYNC_EN,
  PARQUET_NOTE_RANGE_EN,
];
export const PARQUET_NOTES_UK = [
  PARQUET_NOTE_S3_UK,
  PARQUET_NOTE_ASYNC_UK,
  PARQUET_NOTE_RANGE_UK,
];

// ── Queue ─────────────────────────────────────────────────────────────────────

/**
 * In-memory Parquet export job queue.
 * Черга завдань Parquet-експорту в пам'яті.
 */
export class ParquetExportQueue {
  private readonly jobs = new Map<string, ParquetExportJob>();

  /** Submit a new export job and return the created job record. */
  submit(config: ParquetExportConfig): ParquetExportJob {
    const job: ParquetExportJob = {
      jobId: `parquet_${randomUUID()}`,
      config,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  /** Get the current status of a job by ID. */
  getStatus(jobId: string): ParquetExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  listJobs(limit = 50): ParquetExportJob[] {
    const all = Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return all.slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory Parquet export queue singleton. */
export const parquetQueue = new ParquetExportQueue();
