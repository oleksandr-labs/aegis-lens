/**
 * Notebook export configuration — formats, job queue, and policy notes.
 * Конфігурація експорту блокнотів — формати, черга завдань та правила.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotebookExportFormat = "pdf" | "html" | "json" | "public-link";

export interface NotebookExportConfig {
  notebookId: string;
  format: NotebookExportFormat;
  includeOutputs: boolean;
  includeDataSnapshots: boolean;
  isPublic: boolean;
}

export interface NotebookExportJob {
  jobId: string;
  config: NotebookExportConfig;
  status: "queued" | "rendering" | "done" | "failed";
  downloadUrl?: string;
  publicUrl?: string;
  createdAt: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** HTML export embeds all cell outputs and data snapshots in a single self-contained file */
export const NOTEBOOK_EXPORT_NOTE_HTML_EN =
  "HTML export embeds all cell outputs, chart renders, and data snapshots into a single self-contained file; viewable offline in any browser without a platform account.";
export const NOTEBOOK_EXPORT_NOTE_HTML_UK =
  "HTML-експорт вбудовує всі виводи комірок, рендери графіків та знімки даних в єдиний самодостатній файл; переглядається офлайн у будь-якому браузері без облікового запису платформи.";

/** Public link requires owner consent — notebook must be explicitly set to isPublic */
export const NOTEBOOK_EXPORT_NOTE_PUBLIC_EN =
  "Public link requires owner consent — the notebook must be explicitly set to isPublic by the owner; the public URL is a read-only view that does not expose raw data beyond cell outputs.";
export const NOTEBOOK_EXPORT_NOTE_PUBLIC_UK =
  "Публічне посилання потребує згоди власника — блокнот повинен бути явно встановлений власником як isPublic; публічний URL є доступним тільки для читання переглядом, який не розкриває сирі дані поза виводами комірок.";

export const NOTEBOOK_EXPORT_NOTES_EN = [
  NOTEBOOK_EXPORT_NOTE_HTML_EN,
  NOTEBOOK_EXPORT_NOTE_PUBLIC_EN,
];
export const NOTEBOOK_EXPORT_NOTES_UK = [
  NOTEBOOK_EXPORT_NOTE_HTML_UK,
  NOTEBOOK_EXPORT_NOTE_PUBLIC_UK,
];

// ── Queue ─────────────────────────────────────────────────────────────────────

/**
 * In-memory notebook export job queue.
 * Черга завдань експорту блокнотів у пам'яті.
 */
export class NotebookExportQueue {
  private readonly jobs = new Map<string, NotebookExportJob>();

  /** Submit a new notebook export job and return the created job record. */
  submit(config: NotebookExportConfig): NotebookExportJob {
    const job: NotebookExportJob = {
      jobId: `nbexport_${randomUUID()}`,
      config,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  /** Get the current status of a notebook export job by ID. */
  getStatus(jobId: string): NotebookExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  listJobs(limit = 50): NotebookExportJob[] {
    const all = Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return all.slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory notebook export queue singleton. */
export const notebookExportQueue = new NotebookExportQueue();
