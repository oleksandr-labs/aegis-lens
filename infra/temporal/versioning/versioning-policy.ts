/**
 * Temporal Workflow Versioning Policy — Aegis Lens
 *
 * Temporal requires explicit handling of workflow code changes so that
 * in-flight workflow executions (which may run for hours or days) are not
 * broken by a new worker deployment.
 *
 * This module defines:
 *   1. The patching / versioning pattern using `patched()` / `getVersion()`
 *   2. Worker build-ID-based versioning (Temporal Cloud / Server ≥ 1.22)
 *   3. Workflow naming conventions that encode compatibility guarantees
 *   4. A migration checklist for breaking workflow changes
 *
 * References:
 *   https://docs.temporal.io/workflows#versioning
 *   https://typescript.temporal.io/api/namespaces/workflow#patched
 */

// ── Version constants ─────────────────────────────────────────────────────────

/**
 * Increment WORKFLOW_BUILD_ID on every deployment that changes *any*
 * workflow or activity implementation.
 *
 * Convention: `<semver>-<git-short-sha>`
 * Example:    "1.4.0-a3f8c2d"
 *
 * Workers registered with a new buildId form a new "version set" and only
 * pick up new workflow executions. Old workers with old buildIds continue
 * processing their in-flight executions.
 */
export const WORKFLOW_BUILD_ID = process.env.WORKFLOW_BUILD_ID ?? "0.1.0-dev";

/**
 * Patch IDs mark specific code changes inside a workflow function.
 * Format: `<workflowName>_<feature>_<yyyymmdd>`
 *
 * Once a patch has been deployed and all pre-patch executions have
 * completed, you may remove the `patched()` branch in a subsequent release.
 */
export const PATCH_IDS = {
  // ── ingestBackfill ────────────────────────────────────────────────────
  /** Added per-batch dedup check (2026-04-10). */
  INGEST_BACKFILL_DEDUP_V1:          "ingestBackfill_batchDedup_20260410",
  /** Added parallel batch fetch (2026-05-20). */
  INGEST_BACKFILL_PARALLEL_FETCH:    "ingestBackfill_parallelFetch_20260520",

  // ── reportGeneration ──────────────────────────────────────────────────
  /** Added AI review step between generate → deliver (2026-05-15). */
  REPORT_AI_REVIEW_STEP:             "reportGeneration_aiReviewStep_20260515",

  // ── nlpEnrichmentBatch ────────────────────────────────────────────────
  /** Added translation fallback activity (2026-06-01). */
  NLP_TRANSLATION_FALLBACK:          "nlpEnrichmentBatch_translationFallback_20260601",
} as const;

export type PatchId = (typeof PATCH_IDS)[keyof typeof PATCH_IDS];

// ── Versioning helpers ────────────────────────────────────────────────────────

/**
 * Workflow versioning strategy enum.
 *
 * PATCH  — use `patched()` for surgical code-path switches inside a workflow.
 *           Best for: adding/removing a single activity, changing activity params.
 *
 * BUILD_ID — use Worker Versioning (Temporal ≥ 1.22).
 *            Best for: large refactors, activity signature changes,
 *            new workflow types.
 *
 * DEPRECATE — old workflow type is deprecated; new executions use a renamed
 *             type. Old in-flight executions drain naturally.
 */
export type VersioningStrategy = "PATCH" | "BUILD_ID" | "DEPRECATE";

export interface WorkflowVersionRecord {
  workflowName: string;
  /** Current semantic version of this workflow's logic. */
  version: string;
  strategy: VersioningStrategy;
  /**
   * Patch IDs that are ACTIVE (in use in the workflow code).
   * Remove a patchId here once all pre-patch executions have completed.
   */
  activePatches: PatchId[];
  /**
   * Patch IDs that have been DEPRECATED (both branches still in code,
   * but the default branch is now the patched version).
   * Clean these up in the next release after confirming zero pre-patch
   * executions in Temporal Cloud / tctl.
   */
  deprecatedPatches: PatchId[];
  notes?: string;
}

/**
 * Canonical versioning registry.
 * Update this table whenever a workflow changes.
 */
export const WORKFLOW_VERSION_REGISTRY: WorkflowVersionRecord[] = [
  {
    workflowName: "ingestBackfill",
    version: "1.3.0",
    strategy: "PATCH",
    activePatches: [
      PATCH_IDS.INGEST_BACKFILL_PARALLEL_FETCH,
    ],
    deprecatedPatches: [
      PATCH_IDS.INGEST_BACKFILL_DEDUP_V1,  // safe to remove after 2026-07-01
    ],
    notes: "Parallel fetch added 2026-05-20. Dedup patch deprecated once old executions drain.",
  },
  {
    workflowName: "reportGeneration",
    version: "1.2.0",
    strategy: "PATCH",
    activePatches: [
      PATCH_IDS.REPORT_AI_REVIEW_STEP,
    ],
    deprecatedPatches: [],
    notes: "AI review step added between generate → deliver. All new executions use the patched path.",
  },
  {
    workflowName: "nlpEnrichmentBatch",
    version: "1.1.0",
    strategy: "PATCH",
    activePatches: [
      PATCH_IDS.NLP_TRANSLATION_FALLBACK,
    ],
    deprecatedPatches: [],
  },
  {
    workflowName: "satelliteAcquisition",
    version: "1.0.0",
    strategy: "BUILD_ID",
    activePatches: [],
    deprecatedPatches: [],
    notes: "No patches yet. Use BUILD_ID strategy for next breaking change.",
  },
  {
    workflowName: "aoiSchedule",
    version: "1.0.0",
    strategy: "BUILD_ID",
    activePatches: [],
    deprecatedPatches: [],
  },
  {
    workflowName: "webhookDelivery",
    version: "1.0.0",
    strategy: "BUILD_ID",
    activePatches: [],
    deprecatedPatches: [],
  },
  {
    workflowName: "sourceHealthCheck",
    version: "1.0.0",
    strategy: "BUILD_ID",
    activePatches: [],
    deprecatedPatches: [],
  },
];

// ── Code pattern templates ────────────────────────────────────────────────────

/**
 * Pattern for using `patched()` inside a workflow function.
 *
 * IMPORTANT: Import `patched` from @temporalio/workflow, NOT from this file.
 *
 * ```typescript
 * import { patched } from "@temporalio/workflow";
 * import { PATCH_IDS } from "../../infra/temporal/versioning/versioning-policy";
 *
 * export async function ingestBackfill(input: IngestBackfillInput) {
 *   // ... existing activities ...
 *
 *   if (patched(PATCH_IDS.INGEST_BACKFILL_PARALLEL_FETCH)) {
 *     // NEW path: parallel batch fetch
 *     await Promise.all(batches.map(b => fetchBatch(b)));
 *   } else {
 *     // OLD path: sequential (kept for in-flight executions on old workers)
 *     for (const b of batches) await fetchBatch(b);
 *   }
 * }
 * ```
 *
 * After the old path is no longer needed (all pre-patch executions done):
 * ```typescript
 * deprecatePatch(PATCH_IDS.INGEST_BACKFILL_PARALLEL_FETCH);
 * // Remove the if/else; keep only the new path.
 * // In the next release, remove deprecatePatch() call entirely.
 * ```
 */

// ── Worker versioning setup (Build-ID strategy) ────────────────────────────────

export interface WorkerVersionConfig {
  /** Temporal task queue this worker processes. */
  taskQueue: string;
  /** Build ID to register. Must match WORKFLOW_BUILD_ID. */
  buildId: string;
  /** If true, this buildId becomes the default for new executions. */
  isDefaultForNewExecutions: boolean;
  /**
   * Build IDs that this version is compatible with (can process their
   * in-flight executions). Leave empty for a clean break.
   */
  compatibleWith: string[];
}

/**
 * Returns worker version configs for the current build.
 * Pass to `workerClient.updateWorkerBuildIdCompatibility()` at startup.
 */
export function getWorkerVersionConfigs(): WorkerVersionConfig[] {
  const taskQueues = [
    "ingest-queue",
    "nlp-queue",
    "reports-queue",
    "aoi-queue",
    "satellite-queue",
    "webhooks-queue",
    "maintenance-queue",
  ];

  return taskQueues.map((taskQueue) => ({
    taskQueue,
    buildId: WORKFLOW_BUILD_ID,
    isDefaultForNewExecutions: true,
    compatibleWith: [],  // set explicitly when a backward-compatible update is deployed
  }));
}

// ── Breaking-change checklist ─────────────────────────────────────────────────

/**
 * WORKFLOW BREAKING CHANGE CHECKLIST
 * ────────────────────────────────────────────────────────────────────────────
 * A "breaking change" is any modification that would cause an in-flight
 * workflow execution to fail if its history were replayed against new code.
 *
 * Examples of BREAKING changes:
 *   - Adding or removing an activity call (change the sequence of history events)
 *   - Changing the order of activity calls
 *   - Adding a new `await` or Signal handler that did not exist before
 *   - Renaming a workflow type or activity type
 *
 * Examples of NON-breaking changes:
 *   - Changing activity implementation (not signature)
 *   - Adding a new workflow type that doesn't affect existing ones
 *   - Changing retry policies (history uses recorded results, not new policy)
 *   - Bug fixes in activity code that don't affect the event sequence
 *
 * Steps for a breaking change:
 *   1. Add a new PATCH_ID to PATCH_IDS above.
 *   2. Wrap the new code path in `patched(PATCH_ID)`.
 *   3. Keep the old path in the `else` branch.
 *   4. Deploy new workers.
 *   5. Monitor Temporal Cloud / tctl for in-flight executions on old path.
 *   6. Once zero in-flight executions remain on old path:
 *      a. Call `deprecatePatch(PATCH_ID)` and re-deploy.
 *      b. After another clean cycle: remove the else branch and the
 *         `deprecatePatch()` call entirely.
 *   7. Update WORKFLOW_VERSION_REGISTRY above.
 *
 * For a LARGE refactor (new activity signatures, renamed workflow):
 *   1. Create a new workflow function with a versioned name suffix
 *      (e.g. "ingestBackfillV2").
 *   2. Route new executions to the new name via a feature flag.
 *   3. Let the old name drain naturally.
 *   4. Once old executions are complete, delete the old workflow type.
 */

export const VERSIONING_DOCS_URL =
  "https://docs.temporal.io/workflows#versioning";
