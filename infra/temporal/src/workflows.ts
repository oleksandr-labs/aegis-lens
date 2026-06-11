/**
 * Temporal workflow definitions for Aegis Lens.
 *
 * These are type-safe workflow + activity signatures.
 * Actual worker implementations register these via Temporal SDK.
 *
 * Activity timeouts follow a tiered model:
 *   - Fast (< 30s): NLP, classification, simple HTTP
 *   - Medium (< 5min): satellite acquisition, bulk indexing
 *   - Long (< 1h): report generation, large backfills
 */

export interface ActivityTimeout {
  scheduleToCloseTimeoutMs: number;
  startToCloseTimeoutMs: number;
  retryPolicy: {
    maximumAttempts: number;
    initialIntervalMs: number;
    backoffCoefficient: number;
    maximumIntervalMs: number;
  };
}

export const TIMEOUTS: Record<string, ActivityTimeout> = {
  fast: {
    scheduleToCloseTimeoutMs: 60_000,
    startToCloseTimeoutMs: 30_000,
    retryPolicy: { maximumAttempts: 3, initialIntervalMs: 1_000, backoffCoefficient: 2, maximumIntervalMs: 10_000 },
  },
  medium: {
    scheduleToCloseTimeoutMs: 600_000,
    startToCloseTimeoutMs: 300_000,
    retryPolicy: { maximumAttempts: 5, initialIntervalMs: 5_000, backoffCoefficient: 2, maximumIntervalMs: 60_000 },
  },
  long: {
    scheduleToCloseTimeoutMs: 7_200_000,
    startToCloseTimeoutMs: 3_600_000,
    retryPolicy: { maximumAttempts: 3, initialIntervalMs: 30_000, backoffCoefficient: 2, maximumIntervalMs: 300_000 },
  },
};

// ── Workflow inputs/outputs ────────────────────────────────────────────────────

export interface IngestBackfillInput {
  sourceId: string;
  since: string;
  until: string;
  batchSize?: number;
}

export interface IngestBackfillOutput {
  totalFetched: number;
  totalIndexed: number;
  errors: string[];
}

export interface SatelliteAcquisitionInput {
  aoiId: string;
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number };
  collections: string[];
  dateRange: { from: string; to: string };
}

export interface SatelliteAcquisitionOutput {
  sceneCount: number;
  downloadedBytes: number;
  storagePaths: string[];
}

export interface ReportGenerationInput {
  reportKind: "regional" | "incident" | "weekly" | "custom";
  params: Record<string, unknown>;
  orgId?: string;
  requestedBy: string;
}

export interface ReportGenerationOutput {
  reportId: string;
  storagePath: string;
  tookMs: number;
}

export interface AOIScheduleInput {
  aoiId: string;
  checkIntervalMinutes: number;
  alertRuleId?: string;
}

export interface NLPEnrichmentBatchInput {
  eventIds: string[];
  pipeline: string[];
}

export interface NLPEnrichmentBatchOutput {
  processed: number;
  failed: number;
  errors: string[];
}

// ── Workflow names (for registration and lookup) ──────────────────────────────

export const WORKFLOW_NAMES = {
  INGEST_BACKFILL: "ingestBackfill",
  SATELLITE_ACQUISITION: "satelliteAcquisition",
  REPORT_GENERATION: "reportGeneration",
  AOI_SCHEDULE: "aoiSchedule",
  NLP_ENRICHMENT_BATCH: "nlpEnrichmentBatch",
  WEBHOOK_DELIVERY: "webhookDelivery",
  SOURCE_HEALTH_CHECK: "sourceHealthCheck",
} as const;

export const TASK_QUEUES = {
  INGEST: "ingest-queue",
  NLP: "nlp-queue",
  REPORTS: "reports-queue",
  AOI: "aoi-queue",
  SATELLITE: "satellite-queue",
  WEBHOOKS: "webhooks-queue",
  MAINTENANCE: "maintenance-queue",
} as const;
