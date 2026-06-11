/**
 * Temporal workflow definition for intelligence report generation.
 *
 * Pipeline stages:
 *   1. retrieve   — Fetch events, entities, and source data for the time range
 *   2. generate   — LLM-based report synthesis (calls llm.ts)
 *   3. review     — Automated quality checks + optional human-in-the-loop
 *   4. deliver    — Render to output format and upload to storage
 *
 * Workflow guarantees:
 *   - If the process crashes between stages, Temporal replays from the last
 *     completed activity (durable execution).
 *   - Each activity is independently retried with exponential backoff.
 *   - The workflow signals progress to the requestor via SSE (see realtime/sse.ts).
 *
 * Note: Temporal SDK imports are typed interfaces. Install SDK for production:
 *   npm install @temporalio/workflow @temporalio/activity @temporalio/client
 *
 * Temporal workflow для генерації звітів: 4 стадії з автоматичним
 * відновленням після збоїв.
 */

import {
  type ReportWorkflowInput,
  type ReportWorkflowOutput,
  DEFAULT_ACTIVITY_OPTIONS,
  LONG_ACTIVITY_OPTIONS,
} from "./types";

// ── Activity definitions ──────────────────────────────────────────────────────
// In production these are imported from @temporalio/activity and registered
// on the Worker. Here they are typed stubs.

export interface RetrieveActivityInput {
  reportId: string;
  region?: string;
  entityId?: string;
  dateRange: { from: string; to: string };
}

export interface RetrieveActivityOutput {
  eventCount: number;
  events: Array<{ id: string; type: string; timestamp: string }>;
  entities: Array<{ id: string; name: string }>;
  sources: Array<{ id: string; url: string; credibility: number }>;
}

export interface GenerateActivityInput {
  reportId: string;
  reportType: string;
  locale: string;
  data: RetrieveActivityOutput;
  outputFormat: string;
}

export interface GenerateActivityOutput {
  draftContent: string;
  wordCount: number;
  tokensUsed: number;
  modelId: string;
}

export interface ReviewActivityInput {
  reportId: string;
  draftContent: string;
  reportType: string;
  locale: string;
}

export interface ReviewActivityOutput {
  approved: boolean;
  revisions: string[];
  reviewedContent: string;
  qualityScore: number;
}

export interface DeliverActivityInput {
  reportId: string;
  content: string;
  outputFormat: "pdf" | "docx" | "html" | "json";
  locale: string;
  requestedBy: string;
}

export interface DeliverActivityOutput {
  reportUrl: string;
  pageCount: number;
  fileSizeBytes: number;
}

// ── Activity timeout config ───────────────────────────────────────────────────

export const REPORT_ACTIVITY_OPTIONS = {
  retrieve: DEFAULT_ACTIVITY_OPTIONS,
  generate: LONG_ACTIVITY_OPTIONS,
  review: { ...DEFAULT_ACTIVITY_OPTIONS, startToCloseTimeout: "10 minutes" },
  deliver: DEFAULT_ACTIVITY_OPTIONS,
} as const;

// ── Workflow definition ───────────────────────────────────────────────────────

/**
 * Report generation workflow.
 *
 * In production, this function is registered with Temporal Worker:
 *   import { proxyActivities } from '@temporalio/workflow';
 *   const activities = proxyActivities<typeof reportActivities>(options);
 *
 * Typed interface for the workflow contract — activities are wired in worker.ts.
 *
 * Визначення workflow: retrieve → generate → review → deliver.
 */
export async function reportGenerationWorkflow(
  input: ReportWorkflowInput,
): Promise<ReportWorkflowOutput> {
  const startedAt = new Date().toISOString();

  // Stage 1: Retrieve source data
  const retrieveResult: RetrieveActivityOutput = await simulateActivity(
    "retrieve",
    {
      reportId: input.reportId,
      region: input.region,
      entityId: input.entityId,
      dateRange: input.dateRange,
    } satisfies RetrieveActivityInput,
  );

  // Stage 2: Generate draft
  const generateResult: GenerateActivityOutput = await simulateActivity(
    "generate",
    {
      reportId: input.reportId,
      reportType: input.reportType,
      locale: input.locale,
      data: retrieveResult,
      outputFormat: input.outputFormat,
    } satisfies GenerateActivityInput,
  );

  // Stage 3: Review (automated quality checks)
  const reviewResult: ReviewActivityOutput = await simulateActivity(
    "review",
    {
      reportId: input.reportId,
      draftContent: generateResult.draftContent,
      reportType: input.reportType,
      locale: input.locale,
    } satisfies ReviewActivityInput,
  );

  // Stage 4: Deliver (render + upload)
  const deliverResult: DeliverActivityOutput = await simulateActivity(
    "deliver",
    {
      reportId: input.reportId,
      content: reviewResult.reviewedContent,
      outputFormat: input.outputFormat,
      locale: input.locale,
      requestedBy: input.requestedBy,
    } satisfies DeliverActivityInput,
  );

  const completedAt = new Date().toISOString();

  return {
    reportId: input.reportId,
    reportUrl: deliverResult.reportUrl,
    pageCount: deliverResult.pageCount,
    generatedAt: completedAt,
    outputFormat: input.outputFormat,
  };

  // Suppress unused variable warnings for options (used when SDK is installed)
  void REPORT_ACTIVITY_OPTIONS;
  void startedAt;
}

/**
 * Stub activity simulator for type-checking without Temporal SDK.
 * Replace with real proxyActivities() when SDK is installed.
 */
async function simulateActivity<TInput, TOutput>(
  name: string,
  _input: TInput,
): Promise<TOutput> {
  // In production: activities are registered Workers that execute the real logic
  throw new Error(
    `Activity "${name}" is a stub. Install @temporalio/workflow and register real activities.`,
  );
}
