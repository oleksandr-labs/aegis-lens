import { createHash } from "crypto";
import type { Experiment, AssignmentContext, AssignmentResult, ExperimentVariant } from "./types";

/** Deterministic bucket 0–99 for sticky assignment. */
function bucket(experimentId: string, userId: string): number {
  const hex = createHash("sha256")
    .update(`${experimentId}:${userId}`)
    .digest("hex")
    .slice(0, 8);
  return parseInt(hex, 16) % 100;
}

function pickVariant(variants: ExperimentVariant[], b: number): ExperimentVariant | undefined {
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (b < cumulative) return v;
  }
  return undefined; // falls into un-allocated bucket → control
}

function isEligible(experiment: Experiment, ctx: AssignmentContext): boolean {
  const { eligibility } = experiment;
  if (!eligibility) return true;
  if (eligibility.personas?.length && ctx.persona && !eligibility.personas.includes(ctx.persona)) return false;
  if (eligibility.tiers?.length && ctx.tier && !eligibility.tiers.includes(ctx.tier)) return false;
  if (eligibility.locales?.length && ctx.locale && !eligibility.locales.includes(ctx.locale)) return false;
  return true;
}

/**
 * Assign a user to a variant for the given experiment.
 * Returns a stable assignment — same userId always gets the same variant
 * for the lifetime of the experiment (SHA-256 sticky bucketing).
 */
export function assign(experiment: Experiment, ctx: AssignmentContext): AssignmentResult {
  if (experiment.status !== "running") {
    return { experimentId: experiment.id, variantKey: "control", reason: "experiment_off" };
  }

  // Force assignment for QA
  const forced = experiment.eligibility.forceUserIds?.[ctx.userId];
  if (forced) {
    const v = experiment.variants.find((v) => v.key === forced);
    return {
      experimentId: experiment.id,
      variantKey: forced,
      payload: v?.payload,
      reason: "forced",
    };
  }

  if (!isEligible(experiment, ctx)) {
    return { experimentId: experiment.id, variantKey: "control", reason: "not_eligible" };
  }

  const b = bucket(experiment.id, ctx.userId);
  const variant = pickVariant(experiment.variants, b);

  if (!variant) {
    // In holdout bucket (un-allocated percentage)
    return { experimentId: experiment.id, variantKey: "control", reason: "eligible_bucket" };
  }

  return {
    experimentId: experiment.id,
    variantKey: variant.key,
    payload: variant.payload,
    reason: "eligible_bucket",
  };
}

/**
 * Assign a user to all running experiments at once.
 */
export function assignAll(
  experiments: Experiment[],
  ctx: AssignmentContext,
): AssignmentResult[] {
  return experiments
    .filter((e) => e.status === "running")
    .map((e) => assign(e, ctx));
}
