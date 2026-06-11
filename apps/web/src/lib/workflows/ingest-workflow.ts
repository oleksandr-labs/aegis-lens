/**
 * Temporal workflow definition for the ingest pipeline.
 *
 * Pipeline stages:
 *   1. pull       — Fetch raw data from a source (Telegram, Twitter, OSM, manual)
 *   2. normalize  — Transform to canonical Aegis event schema (packages/event-schema)
 *   3. dedup      — Check for duplicate events (hash-based + semantic similarity)
 *   4. store      — Persist to PostgreSQL + update search index
 *   5. emit       — Publish to event bus (aegis.events.verified topic)
 *
 * Workflow guarantees:
 *   - Idempotent: each raw payload has a deterministic correlationId.
 *     Temporal prevents double-execution of successful workflows.
 *   - Dedup is a separate stage so duplicates are logged but not stored.
 *   - Emit only fires after successful store (exactly-once semantics via Kafka
 *     transactions in production).
 *
 * Temporal workflow для ingestion pipeline: pull → normalize → dedup → store → emit.
 */

import {
  type IngestWorkflowInput,
  type IngestWorkflowOutput,
  DEFAULT_ACTIVITY_OPTIONS,
} from "./types";

// ── Activity I/O types ────────────────────────────────────────────────────────

export interface PullActivityInput {
  sourceId: string;
  sourceType: string;
  rawPayload: unknown;
  receivedAt: string;
}

export interface PullActivityOutput {
  rawItems: Array<{ id: string; content: string; metadata: Record<string, unknown> }>;
  pulledAt: string;
}

export interface NormalizeActivityInput {
  sourceType: string;
  rawItems: PullActivityOutput["rawItems"];
}

export interface NormalizeActivityOutput {
  canonicalEvents: Array<{
    id: string;
    type: string;
    lat?: number;
    lon?: number;
    region?: string;
    description: string;
    confidence: number;
    sourceId: string;
    occurredAt: string;
  }>;
}

export interface DedupActivityInput {
  events: NormalizeActivityOutput["canonicalEvents"];
  correlationId: string;
}

export interface DedupActivityOutput {
  newEvents: NormalizeActivityOutput["canonicalEvents"];
  duplicateCount: number;
  duplicateIds: string[];
}

export interface StoreActivityInput {
  events: NormalizeActivityOutput["canonicalEvents"];
  correlationId: string;
}

export interface StoreActivityOutput {
  storedIds: string[];
  storedAt: string;
}

export interface EmitActivityInput {
  events: NormalizeActivityOutput["canonicalEvents"];
  storedAt: string;
}

export interface EmitActivityOutput {
  publishedCount: number;
  topic: string;
}

// ── Activity timeout config ───────────────────────────────────────────────────

export const INGEST_ACTIVITY_OPTIONS = {
  pull: DEFAULT_ACTIVITY_OPTIONS,
  normalize: DEFAULT_ACTIVITY_OPTIONS,
  dedup: DEFAULT_ACTIVITY_OPTIONS,
  store: {
    ...DEFAULT_ACTIVITY_OPTIONS,
    startToCloseTimeout: "2 minutes",
  },
  emit: DEFAULT_ACTIVITY_OPTIONS,
} as const;

// ── Workflow definition ───────────────────────────────────────────────────────

/**
 * Ingest pipeline workflow.
 *
 * Processes a single raw source payload through the full pipeline.
 * Designed to be called once per source fetch (e.g. every 60 seconds per source).
 *
 * In production, Temporal Workers host the activity implementations in
 * services/ingest/src/.
 *
 * Визначення workflow: pull → normalize → dedup → store → emit.
 */
export async function ingestPipelineWorkflow(
  input: IngestWorkflowInput,
): Promise<IngestWorkflowOutput> {
  // Stage 1: Pull (transform raw webhook/fetch payload into raw items)
  const pullResult: PullActivityOutput = await simulateActivity("pull", {
    sourceId: input.sourceId,
    sourceType: input.sourceType,
    rawPayload: input.rawPayload,
    receivedAt: input.receivedAt,
  } satisfies PullActivityInput);

  // Stage 2: Normalize to canonical event schema
  const normalizeResult: NormalizeActivityOutput = await simulateActivity(
    "normalize",
    {
      sourceType: input.sourceType,
      rawItems: pullResult.rawItems,
    } satisfies NormalizeActivityInput,
  );

  // Stage 3: Dedup against existing events
  const dedupResult: DedupActivityOutput = await simulateActivity("dedup", {
    events: normalizeResult.canonicalEvents,
    correlationId: input.correlationId,
  } satisfies DedupActivityInput);

  // If all events are duplicates, short-circuit
  if (dedupResult.newEvents.length === 0) {
    return {
      canonicalEventId: dedupResult.duplicateIds[0] ?? "",
      deduped: true,
      confidence: 0,
      storedAt: new Date().toISOString(),
    };
  }

  // Stage 4: Store to database
  const storeResult: StoreActivityOutput = await simulateActivity("store", {
    events: dedupResult.newEvents,
    correlationId: input.correlationId,
  } satisfies StoreActivityInput);

  // Stage 5: Emit to event bus (triggers alert engine, SSE streams, etc.)
  await simulateActivity("emit", {
    events: dedupResult.newEvents,
    storedAt: storeResult.storedAt,
  } satisfies EmitActivityInput);

  const primaryEvent = dedupResult.newEvents[0];
  return {
    canonicalEventId: primaryEvent?.id ?? storeResult.storedIds[0] ?? "",
    deduped: false,
    confidence: primaryEvent?.confidence ?? 0,
    storedAt: storeResult.storedAt,
  };

  // Suppress unused warning for options (used when Temporal SDK is installed)
  void INGEST_ACTIVITY_OPTIONS;
}

/**
 * Stub activity simulator for type-checking without Temporal SDK.
 */
async function simulateActivity<TInput, TOutput>(
  name: string,
  _input: TInput,
): Promise<TOutput> {
  throw new Error(
    `Activity "${name}" is a stub. Install @temporalio/workflow and register real activities.`,
  );
}
