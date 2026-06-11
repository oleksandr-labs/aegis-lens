/**
 * GPU Autoscaling Policy — decision logic for vision inference fleet.
 *
 * Provides the policy configuration type and a pure decision function.
 * Actual cloud API calls (GCP/AWS/Hetzner) live in the worker / infra layer;
 * this module is pure-TS and has zero side-effects so it can be unit-tested
 * without any cloud credentials.
 *
 * Usage pattern:
 *   1. Worker polls its queue depth every N seconds.
 *   2. Calls `evaluateScaling(currentGpus, queueDepth, policy)`.
 *   3. If `action !== 'no_change'`, passes `targetGpus` to the cloud scaler.
 *   4. Records the decision to the observability pipeline (see `telemetry.ts`).
 */

// ── Tier enum ────────────────────────────────────────────────────────────────

/** Logical GPU tier for the vision inference fleet. */
export enum GpuTier {
  /** No GPU attached — CPU-only path (OCR / EXIF / heuristics). */
  NONE = "NONE",
  /** Single GPU node — default inference target. */
  SINGLE = "SINGLE",
  /** Multi-GPU node — used for batch bursts. */
  MULTI = "MULTI",
  /** On-demand spot/preemptible instance — cheapest burst option. */
  ON_DEMAND = "ON_DEMAND",
}

// ── Policy type ───────────────────────────────────────────────────────────────

/**
 * Autoscaling policy configuration.
 * All numeric thresholds refer to the number of pending inference jobs in the
 * queue at the time of evaluation.
 */
export interface GpuAutoscalePolicy {
  /** Minimum number of GPU nodes to keep running (0 = scale-to-zero allowed). */
  minGpus: number;
  /** Hard cap on GPU nodes — never exceed this regardless of queue depth. */
  maxGpus: number;
  /**
   * Queue depth at which to trigger a scale-up if `currentGpus < maxGpus`.
   * Scale-up adds one node per evaluation cycle (gradual).
   */
  scaleUpThresholdQueueDepth: number;
  /**
   * Queue depth below which to trigger a scale-down if `currentGpus > minGpus`.
   * Scale-down removes one node per evaluation cycle (gradual).
   */
  scaleDownThresholdQueueDepth: number;
  /**
   * Minimum milliseconds between consecutive scaling actions in the same
   * direction (prevents flapping). Evaluated by the caller — this module
   * returns the decision; cooldown enforcement is the caller's responsibility.
   */
  cooldownMs: number;
  /**
   * Soft hourly spend limit in USD. When the projected cost of `targetGpus`
   * exceeds this, `evaluateScaling` caps `targetGpus` at the affordable count
   * and includes a cost-cap note in `reason`.
   * Set to `Infinity` to disable cost-capping.
   */
  costLimitUsdPerHour: number;
}

// ── Default policy ────────────────────────────────────────────────────────────

/**
 * Default policy — conservative defaults suitable for a small OSINT team.
 * Adjust per environment (dev / staging / production) via config injection.
 */
export const DEFAULT_POLICY: GpuAutoscalePolicy = {
  minGpus: 0,
  maxGpus: 4,
  scaleUpThresholdQueueDepth: 10,
  scaleDownThresholdQueueDepth: 2,
  cooldownMs: 5 * 60 * 1000, // 5 minutes
  costLimitUsdPerHour: 2.0,
};

// ── Decision types ────────────────────────────────────────────────────────────

export type ScalingAction = "scale_up" | "scale_down" | "no_change";

export interface ScalingDecision {
  action: ScalingAction;
  /** Recommended absolute GPU count after this action. */
  targetGpus: number;
  /** Human-readable explanation for logs / audit trail. */
  reason: string;
}

// ── Cost estimation helper ────────────────────────────────────────────────────

/**
 * Approximate cost per GPU per hour in USD.
 * Real costs vary by provider/region; this is a conservative estimate for
 * mid-tier GPU nodes (A10 / L4 class). Override in production via policy
 * tuning once actual invoices are available.
 */
const APPROX_COST_PER_GPU_USD_PER_HOUR = 0.80;

function maxAffordableGpus(costLimitUsdPerHour: number): number {
  if (!isFinite(costLimitUsdPerHour) || costLimitUsdPerHour <= 0) return 0;
  return Math.floor(costLimitUsdPerHour / APPROX_COST_PER_GPU_USD_PER_HOUR);
}

// ── Core decision function ────────────────────────────────────────────────────

/**
 * Evaluate whether to scale the GPU fleet up, down, or hold.
 *
 * Pure function — no side effects, no I/O. Safe to call in tests.
 *
 * @param currentGpus  Number of GPU nodes currently running (>= 0).
 * @param queueDepth   Number of inference jobs waiting in the queue (>= 0).
 * @param policy       Autoscaling policy to apply.
 */
export function evaluateScaling(
  currentGpus: number,
  queueDepth: number,
  policy: GpuAutoscalePolicy = DEFAULT_POLICY,
): ScalingDecision {
  const affordable = maxAffordableGpus(policy.costLimitUsdPerHour);
  const effectiveMax = Math.min(policy.maxGpus, affordable);

  // Clamp current to valid range (handles transient over-provisioning)
  const current = Math.max(0, Math.min(currentGpus, policy.maxGpus));

  // ── Scale up ──────────────────────────────────────────────────────────────
  if (
    queueDepth >= policy.scaleUpThresholdQueueDepth &&
    current < effectiveMax
  ) {
    const targetGpus = Math.min(current + 1, effectiveMax);
    const costCapNote =
      effectiveMax < policy.maxGpus
        ? ` (capped at ${effectiveMax} by $${policy.costLimitUsdPerHour}/hr limit)`
        : "";
    return {
      action: "scale_up",
      targetGpus,
      reason:
        `Queue depth ${queueDepth} >= threshold ${policy.scaleUpThresholdQueueDepth}; ` +
        `scaling ${current} → ${targetGpus} GPU(s)${costCapNote}.`,
    };
  }

  // ── Scale down ────────────────────────────────────────────────────────────
  if (
    queueDepth <= policy.scaleDownThresholdQueueDepth &&
    current > policy.minGpus
  ) {
    const targetGpus = Math.max(current - 1, policy.minGpus);
    return {
      action: "scale_down",
      targetGpus,
      reason:
        `Queue depth ${queueDepth} <= threshold ${policy.scaleDownThresholdQueueDepth}; ` +
        `scaling ${current} → ${targetGpus} GPU(s).`,
    };
  }

  // ── No change ─────────────────────────────────────────────────────────────
  return {
    action: "no_change",
    targetGpus: current,
    reason:
      `Queue depth ${queueDepth} within thresholds ` +
      `[${policy.scaleDownThresholdQueueDepth}, ${policy.scaleUpThresholdQueueDepth}); ` +
      `holding at ${current} GPU(s).`,
  };
}
