/**
 * Timeline export (MP4 / GIF) — job queue, config types, and pipeline notes.
 * Експорт таймлайну (MP4 / GIF) — черга завдань, типи конфігурації та нотатки конвеєра.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimelineExportConfig {
  region: string;
  fromDate: string;
  toDate: string;
  format: "mp4" | "gif";
  fps: number;
  speedMultiplier: number;
}

export interface TimelineExportJob {
  jobId: string;
  config: TimelineExportConfig;
  status: "queued" | "rendering" | "done" | "failed";
  downloadUrl?: string;
  createdAt: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Puppeteer or Remotion pipeline — frames are captured headlessly and encoded to video */
export const TIMELINE_NOTE_PIPELINE_EN =
  "Puppeteer or Remotion pipeline — map frames are captured headlessly at each time step and encoded to MP4 (H.264) or GIF via ffmpeg; output file size scales with fps and date range.";
export const TIMELINE_NOTE_PIPELINE_UK =
  "Конвеєр Puppeteer або Remotion — кадри карти захоплюються без відображення на кожному часовому кроці та кодуються в MP4 (H.264) або GIF через ffmpeg; розмір вихідного файлу залежить від fps та діапазону дат.";

/** Enterprise-only feature — timeline exports are gated behind the Enterprise tier */
export const TIMELINE_NOTE_ENTERPRISE_EN =
  "Enterprise-only feature — timeline video/GIF exports are gated behind the Enterprise subscription tier; rendering is resource-intensive and queued separately from other export jobs.";
export const TIMELINE_NOTE_ENTERPRISE_UK =
  "Функція тільки для Enterprise — відео/GIF-експорт таймлайну доступний лише на рівні підписки Enterprise; рендеринг є ресурсоємним і ставиться в окрему чергу від інших завдань експорту.";

export const TIMELINE_EXPORT_NOTES_EN = [
  TIMELINE_NOTE_PIPELINE_EN,
  TIMELINE_NOTE_ENTERPRISE_EN,
];
export const TIMELINE_EXPORT_NOTES_UK = [
  TIMELINE_NOTE_PIPELINE_UK,
  TIMELINE_NOTE_ENTERPRISE_UK,
];

// ── Queue ─────────────────────────────────────────────────────────────────────

/**
 * In-memory timeline export job queue.
 * Черга завдань експорту таймлайну в пам'яті.
 */
export class TimelineExportQueue {
  private readonly jobs = new Map<string, TimelineExportJob>();

  /** Submit a new timeline export job and return the created job record. */
  submit(config: TimelineExportConfig): TimelineExportJob {
    const job: TimelineExportJob = {
      jobId: `timeline_${randomUUID()}`,
      config,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  /** Get the current status of a timeline job by ID. */
  getStatus(jobId: string): TimelineExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  listJobs(limit = 50): TimelineExportJob[] {
    const all = Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return all.slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory timeline export queue singleton. */
export const timelineExportQueue = new TimelineExportQueue();
