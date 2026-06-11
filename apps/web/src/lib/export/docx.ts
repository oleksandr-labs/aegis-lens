/**
 * DOCX report export — job queue, config types, and compatibility notes.
 * Експорт DOCX-звітів — черга завдань, типи конфігурації та нотатки сумісності.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DocxReportSection {
  heading: string;
  body: string;
}

export interface DocxReportConfig {
  reportId: string;
  title: string;
  sections: DocxReportSection[];
  locale: "en" | "uk";
  includeFootnotes: boolean;
}

export interface DocxExportJob {
  jobId: string;
  config: DocxReportConfig;
  status: "queued" | "rendering" | "done" | "failed";
  downloadUrl?: string;
  createdAt: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** docx npm library planned — will use the 'docx' npm package for server-side generation */
export const DOCX_NOTE_LIBRARY_EN =
  "DOCX generation uses the 'docx' npm library (server-side); supports headings, paragraphs, tables, images, and footnotes without requiring a Microsoft Word installation.";
export const DOCX_NOTE_LIBRARY_UK =
  "Генерація DOCX використовує npm-бібліотеку 'docx' (на сервері); підтримує заголовки, абзаци, таблиці, зображення та виноски без необхідності встановлення Microsoft Word.";

/** Word-compatible — output conforms to OOXML (ISO/IEC 29500) */
export const DOCX_NOTE_WORD_EN =
  "Word-compatible — output conforms to OOXML (ISO/IEC 29500); files open correctly in Microsoft Word 2016+, LibreOffice Writer, and Google Docs.";
export const DOCX_NOTE_WORD_UK =
  "Сумісний з Word — вихідні файли відповідають OOXML (ISO/IEC 29500); коректно відкриваються в Microsoft Word 2016+, LibreOffice Writer та Google Docs.";

export const DOCX_NOTES_EN = [DOCX_NOTE_LIBRARY_EN, DOCX_NOTE_WORD_EN];
export const DOCX_NOTES_UK = [DOCX_NOTE_LIBRARY_UK, DOCX_NOTE_WORD_UK];

// ── Queue ─────────────────────────────────────────────────────────────────────

/**
 * In-memory DOCX export job queue.
 * Черга завдань DOCX-експорту в пам'яті.
 */
export class DocxExportQueue {
  private readonly jobs = new Map<string, DocxExportJob>();

  /** Submit a new DOCX export job and return the created job record. */
  submit(config: DocxReportConfig): DocxExportJob {
    const job: DocxExportJob = {
      jobId: `docx_${randomUUID()}`,
      config,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  /** Get the current status of a DOCX job by ID. */
  getStatus(jobId: string): DocxExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  listJobs(limit = 50): DocxExportJob[] {
    const all = Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return all.slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory DOCX export queue singleton. */
export const docxQueue = new DocxExportQueue();
