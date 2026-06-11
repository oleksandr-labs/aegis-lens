/**
 * Analyst Workspace — dashboard widgets and case file schema.
 *
 * Defines the configurable analyst dashboard layout with 8 widget types
 * and the 12-field case file structure for structured investigations.
 *
 * Конфігурація дашборда аналітика: 8 типів віджетів + 12 полів кейс-файлу.
 */

'use server';

// ── Widget types ──────────────────────────────────────────────────────────────

/**
 * Eight widget types available in the analyst dashboard.
 *
 * Вісім типів віджетів у дашборді аналітика.
 */
export const ANALYST_WIDGET_TYPES = [
  'event-feed',
  'entity-graph',
  'heatmap-mini',
  'timeline-bar',
  'anomaly-radar',
  'source-health',
  'ai-briefing',
  'case-tracker',
] as const;

export type AnalystWidgetType = typeof ANALYST_WIDGET_TYPES[number];

// ── Case file fields ──────────────────────────────────────────────────────────

/**
 * The twelve required fields of a structured investigation case file.
 *
 * Дванадцять полів структурованого кейс-файлу розслідування.
 */
export const CASE_FILE_FIELDS = [
  'id',
  'title',
  'status',           // draft | active | closed | archived
  'classification',   // unclassified | restricted | confidential
  'createdBy',
  'createdAt',
  'updatedAt',
  'linkedEventIds',
  'linkedEntityIds',
  'summary',          // AI-assisted or manual
  'timeline',         // ordered event refs with analyst annotations
  'attachments',      // media, docs, exports
] as const;

export type CaseFileField = typeof CASE_FILE_FIELDS[number];

export type CaseStatus = 'draft' | 'active' | 'closed' | 'archived';
export type CaseClassification = 'unclassified' | 'restricted' | 'confidential';

export interface CaseFile {
  id: string;
  title: string;
  status: CaseStatus;
  classification: CaseClassification;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  linkedEventIds: string[];
  linkedEntityIds: string[];
  summary: string;
  timeline: Array<{ eventId: string; annotation: string; addedAt: string }>;
  attachments: Array<{ url: string; type: string; label: string }>;
}

// ── Workspace config ──────────────────────────────────────────────────────────

export interface AnalystWorkspaceConfig {
  widgetTypes: ReadonlyArray<AnalystWidgetType>;
  caseFileFields: ReadonlyArray<CaseFileField>;
  /** Max widgets per dashboard layout — Макс. віджетів у макеті */
  maxWidgetsPerLayout: number;
  /** Max case files per user — Макс. кейс-файлів на користувача */
  maxCaseFilesPerUser: number;
  /** Max events linked to a case — Макс. подій у кейс-файлі */
  maxEventsPerCase: number;
  /** Auto-save interval in seconds — Інтервал авто-збереження (сек) */
  autoSaveIntervalSeconds: number;
  /** Tier required for case files — Tier для кейс-файлів */
  caseFilesRequiredTier: string;
}

export const ANALYST_WORKSPACE_CONFIG: AnalystWorkspaceConfig = {
  widgetTypes: ANALYST_WIDGET_TYPES,
  caseFileFields: CASE_FILE_FIELDS,
  maxWidgetsPerLayout: 12,
  maxCaseFilesPerUser: 100,
  maxEventsPerCase: 500,
  autoSaveIntervalSeconds: 30,
  caseFilesRequiredTier: 'pro',
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const AnalystWorkspaceNote_EN =
  'Case files are the primary unit of structured investigation. ' +
  'They can be exported as PDF reports via the report-generator pipeline.';

export const AnalystWorkspaceNote_UK =
  'Кейс-файли — основна одиниця структурованого розслідування. ' +
  'Можна експортувати як PDF-звіти через пайплайн генератора звітів.';
