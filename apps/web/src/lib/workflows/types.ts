/**
 * Temporal workflow type definitions for Aegis Lens.
 *
 * Temporal (https://temporal.io) provides durable workflow execution:
 *   - Workflows survive process crashes and restarts
 *   - Activities are automatically retried on failure
 *   - Workflow history is stored in the Temporal server
 *
 * Install: npm install @temporalio/client @temporalio/worker @temporalio/workflow @temporalio/activity
 *
 * Environment variables:
 *   TEMPORAL_ADDRESS   — Temporal server address (default: localhost:7233)
 *   TEMPORAL_NAMESPACE — Temporal namespace (default: default)
 *   TEMPORAL_TLS_CERT  — Optional TLS certificate for production
 *   TEMPORAL_TLS_KEY   — Optional TLS key for production
 *
 * Типи для Temporal workflow: звіти, ingestion, верифікація.
 */

// ── Workflow type union ────────────────────────────────────────────────────────

export type WorkflowType =
  | "report-generation"
  | "ingest-pipeline"
  | "event-verification"
  | "alert-fanout"
  | "image-analysis";

// ── Generic workflow I/O ──────────────────────────────────────────────────────

export interface WorkflowInput<T = Record<string, unknown>> {
  workflowId: string;
  type: WorkflowType;
  payload: T;
  /** ISO timestamp for scheduling (undefined = start immediately). */
  scheduleAt?: string;
  /** Parent workflow ID for child workflows. */
  parentWorkflowId?: string;
}

export interface WorkflowOutput<T = Record<string, unknown>> {
  workflowId: string;
  type: WorkflowType;
  status: "completed" | "failed" | "cancelled" | "timed_out";
  result?: T;
  error?: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

// ── Report workflow ───────────────────────────────────────────────────────────

export interface ReportWorkflowInput {
  reportId: string;
  reportType: "intelligence" | "incident" | "regional" | "entity";
  region?: string;
  entityId?: string;
  dateRange: { from: string; to: string };
  requestedBy: string;
  outputFormat: "pdf" | "docx" | "html" | "json";
  locale: "en" | "uk";
}

export interface ReportWorkflowOutput {
  reportId: string;
  reportUrl: string;
  pageCount: number;
  generatedAt: string;
  outputFormat: string;
}

// ── Ingest workflow ───────────────────────────────────────────────────────────

export interface IngestWorkflowInput {
  sourceId: string;
  sourceType: "telegram" | "twitter" | "osm" | "liveuamap" | "manual";
  rawPayload: unknown;
  receivedAt: string;
  correlationId: string;
}

export interface IngestWorkflowOutput {
  canonicalEventId: string;
  deduped: boolean;
  confidence: number;
  storedAt: string;
}

// ── Temporal connection config ────────────────────────────────────────────────

export interface TemporalConfig {
  address: string;
  namespace: string;
  taskQueue: string;
  tlsCert?: string;
  tlsKey?: string;
}

export const DEFAULT_TEMPORAL_CONFIG: TemporalConfig = {
  address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  taskQueue: "aegis-main",
  tlsCert: process.env.TEMPORAL_TLS_CERT,
  tlsKey: process.env.TEMPORAL_TLS_KEY,
};

// ── Activity timeout defaults ─────────────────────────────────────────────────

export const DEFAULT_ACTIVITY_OPTIONS = {
  startToCloseTimeout: "5 minutes",
  retryPolicy: {
    initialInterval: "1s",
    backoffCoefficient: 2,
    maximumInterval: "60s",
    maximumAttempts: 5,
  },
} as const;

export const LONG_ACTIVITY_OPTIONS = {
  startToCloseTimeout: "30 minutes",
  heartbeatTimeout: "2 minutes",
  retryPolicy: {
    initialInterval: "5s",
    backoffCoefficient: 2,
    maximumInterval: "5 minutes",
    maximumAttempts: 3,
  },
} as const;
