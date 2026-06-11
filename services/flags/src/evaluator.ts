/**
 * Flag evaluator: determines if a flag is enabled for a given context.
 *
 * Evaluation order:
 *   1. Flag disabled globally → off
 *   2. Explicit userId match → on
 *   3. Explicit orgId match → on
 *   4. Tier match → on
 *   5. Cohort match → on
 *   6. Percentage rollout (sticky via hash) → on/off
 *   7. Default → off
 */

import { createHash } from "crypto";
import type { FeatureFlag, EvaluationContext, EvaluationResult, FlagVariant } from "./types";

function stableHash(flagKey: string, userId: string): number {
  const hash = createHash("sha256")
    .update(`${flagKey}:${userId}`)
    .digest("hex")
    .slice(0, 8);
  return parseInt(hash, 16) % 100;
}

function pickVariant(variants: FlagVariant[], bucket: number): FlagVariant | undefined {
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (bucket < cumulative) return v;
  }
  return variants[variants.length - 1];
}

export function evaluateFlag(
  flag: FeatureFlag,
  ctx: EvaluationContext,
): EvaluationResult {
  if (!flag.enabled) {
    return { enabled: false, reason: "disabled" };
  }

  const targets = flag.targets;

  // Explicit user targeting
  if (targets?.userIds?.includes(ctx.userId ?? "")) {
    return variantResult(flag, ctx, "explicit_target");
  }

  // Explicit org targeting
  if (targets?.orgIds?.includes(ctx.orgId ?? "")) {
    return variantResult(flag, ctx, "explicit_target");
  }

  // Tier targeting
  if (targets?.tiers && ctx.tier && targets.tiers.includes(ctx.tier)) {
    return variantResult(flag, ctx, "cohort");
  }

  // Cohort targeting
  if (targets?.cohorts && ctx.cohorts) {
    const matched = ctx.cohorts.some((c) => targets.cohorts!.includes(c));
    if (matched) return variantResult(flag, ctx, "cohort");
  }

  // Percentage rollout (only if userId available for sticky bucketing)
  if (typeof targets?.percentage === "number" && ctx.userId) {
    const bucket = stableHash(flag.key, ctx.userId);
    if (bucket < targets.percentage) {
      return variantResult(flag, ctx, "percentage");
    }
    return { enabled: false, reason: "percentage" };
  }

  // No targets defined + flag enabled = on for everyone
  if (!targets || Object.keys(targets).length === 0) {
    return variantResult(flag, ctx, "default");
  }

  return { enabled: false, reason: "default" };
}

function variantResult(
  flag: FeatureFlag,
  ctx: EvaluationContext,
  reason: EvaluationResult["reason"],
): EvaluationResult {
  if (!flag.variants || flag.variants.length === 0) {
    return { enabled: true, reason };
  }

  const bucket = ctx.userId ? stableHash(flag.key, ctx.userId) : 0;
  const variant = pickVariant(flag.variants, bucket);
  return {
    enabled: true,
    variant: variant?.key ?? flag.defaultVariant,
    payload: variant?.payload,
    reason,
  };
}
