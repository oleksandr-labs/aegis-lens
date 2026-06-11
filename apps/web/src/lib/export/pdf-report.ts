/**
 * PDF report export — job queue, config types, pipeline notes, and filename builder.
 * Експорт PDF-звітів — черга завдань, типи конфігурації, нотатки конвеєра та побудова імен файлів.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PdfReportConfig {
  reportId: string;
  title: string;
  sections: string[];
  includeMap: boolean;
  includeSources: boolean;
  watermark?: string;
  locale: "en" | "uk";
}

export interface PdfExportJob {
  jobId: string;
  config: PdfReportConfig;
  status: "queued" | "rendering" | "done" | "failed";
  downloadUrl?: string;
  createdAt: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Playwright print pipeline — headless browser renders HTML to PDF server-side */
export const PDF_NOTE_PLAYWRIGHT_EN =
  "Playwright print pipeline — headless Chromium renders the report HTML to PDF server-side; supports CSS @media print, page-break hints, and custom headers/footers.";
export const PDF_NOTE_PLAYWRIGHT_UK =
  "Конвеєр друку Playwright — headless Chromium рендерить HTML звіту в PDF на стороні сервера; підтримує CSS @media print, підказки page-break та кастомні колонтитули.";

/** Server-side render — no client-side JavaScript required for generation */
export const PDF_NOTE_SSR_EN =
  "Server-side render — PDF generation does not require client-side JavaScript; the entire pipeline runs on the server, making it suitable for scheduled and on-demand report automation.";
export const PDF_NOTE_SSR_UK =
  "Серверний рендер — генерація PDF не потребує JavaScript на стороні клієнта; весь конвеєр виконується на сервері, що робить його придатним для автоматизації запланованих та оn-demand звітів.";

/** Enterprise branded watermark — configurable per-organization watermark overlay */
export const PDF_NOTE_WATERMARK_EN =
  "Enterprise branded watermark — configurable per-organization watermark overlay; set watermark to empty string to suppress for internal reports.";
export const PDF_NOTE_WATERMARK_UK =
  "Корпоративний водяний знак — налаштовуваний водяний знак для кожної організації; встановіть watermark у порожній рядок для приховання у внутрішніх звітах.";

export const PDF_PIPELINE_NOTES_EN = [
  PDF_NOTE_PLAYWRIGHT_EN,
  PDF_NOTE_SSR_EN,
  PDF_NOTE_WATERMARK_EN,
];
export const PDF_PIPELINE_NOTES_UK = [
  PDF_NOTE_PLAYWRIGHT_UK,
  PDF_NOTE_SSR_UK,
  PDF_NOTE_WATERMARK_UK,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a sanitised PDF download filename from report title and locale.
 * Побудова очищеного імені файлу PDF для завантаження з назви звіту та локалі.
 */
export function buildPdfFilename(title: string, locale: "en" | "uk"): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  const date = new Date().toISOString().slice(0, 10);
  return `aegis-report-${slug}-${locale}-${date}.pdf`;
}

// ── Queue ─────────────────────────────────────────────────────────────────────

/**
 * In-memory PDF export job queue.
 * Черга завдань PDF-експорту в пам'яті.
 */
export class PdfExportQueue {
  private readonly jobs = new Map<string, PdfExportJob>();

  /** Submit a new PDF export job and return the created job record. */
  submit(config: PdfReportConfig): PdfExportJob {
    const job: PdfExportJob = {
      jobId: `pdf_${randomUUID()}`,
      config,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  /** Get the current status of a PDF job by ID. */
  getStatus(jobId: string): PdfExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  listJobs(limit = 50): PdfExportJob[] {
    const all = Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return all.slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory PDF export queue singleton. */
export const pdfQueue = new PdfExportQueue();
