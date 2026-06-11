import "server-only";

/**
 * analytics-gate/check-gate.ts
 * Server-side gate evaluation functions.
 *
 * All functions resolve the "best available" value for a given (analytic, tier)
 * pair by walking up from the user's tier through the tier hierarchy until a
 * configured value is found in the gate's per-tier map.
 *
 * Серверна логіка — не виконувати на клієнті.
 */

import { ANALYTIC_GATES } from "./gate-config";
import {
  TIER_RANK,
  type AnalyticId,
  type ExportFormat,
  type FreshnessLevel,
  type GateResult,
  type LookbackWindow,
  type ResolutionLevel,
  type Tier,
  type TierMap,
} from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Ordered tier list from lowest to highest privilege. */
const TIER_ORDER: Tier[] = [
  "anonymous",
  "free",
  "observer",
  "pro",
  "pro_plus",
  "team",
  "business",
  "enterprise",
];

/**
 * Resolve a value from a per-tier map for the given user tier.
 * Walks DOWN from the user's tier to find the nearest configured value.
 * Returns undefined only if no value exists at or below the user's tier.
 *
 * Шукаємо найближче налаштоване значення, не вище рівня користувача.
 */
function resolveFromMap<T>(map: TierMap<T>, userTier: Tier): T | undefined {
  const userRank = TIER_RANK[userTier];
  // Walk from user's tier down to find the nearest configured value
  for (let i = TIER_ORDER.indexOf(userTier); i >= 0; i--) {
    const tier = TIER_ORDER[i];
    if (map[tier] !== undefined) return map[tier];
  }
  return undefined;
}

/**
 * Resolve a value, falling back to the lowest configured tier above minTier
 * when the user's tier has no explicit entry (shouldn't normally happen but
 * provides a safe fallback).
 */
function resolveOrFallbackUp<T>(map: TierMap<T>, userTier: Tier): T | undefined {
  const direct = resolveFromMap(map, userTier);
  if (direct !== undefined) return direct;
  // Walk UP from user tier as a fallback
  for (let i = TIER_ORDER.indexOf(userTier); i < TIER_ORDER.length; i++) {
    const tier = TIER_ORDER[i];
    if (map[tier] !== undefined) return map[tier];
  }
  return undefined;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check whether a user tier may access an analytic at all.
 *
 * Returns `{ allowed: true }` when the user's tier >= analytic's minTier,
 * or `{ allowed: false, minTier, teaserPolicy }` otherwise.
 */
export function checkAnalyticAccess(analyticId: AnalyticId, userTier: Tier): GateResult {
  const gate = ANALYTIC_GATES[analyticId];
  if (TIER_RANK[userTier] >= TIER_RANK[gate.minTier]) {
    return { allowed: true };
  }
  return {
    allowed: false,
    minTier: gate.minTier,
    teaserPolicy: gate.teaserPolicy,
  };
}

/**
 * Get the freshness level a user tier receives for an analytic.
 * Falls back to "batch" if the gate has no entry at or below the user's tier.
 */
export function getEffectiveFreshness(analyticId: AnalyticId, userTier: Tier): FreshnessLevel {
  const gate = ANALYTIC_GATES[analyticId];
  return resolveFromMap(gate.freshness, userTier) ?? "batch";
}

/**
 * Get the spatial resolution a user tier receives for an analytic.
 * Falls back to "country" (most coarse) as the safe default.
 */
export function getEffectiveResolution(analyticId: AnalyticId, userTier: Tier): ResolutionLevel {
  const gate = ANALYTIC_GATES[analyticId];
  return resolveFromMap(gate.resolution, userTier) ?? "country";
}

/**
 * Get the lookback window a user tier receives for an analytic.
 * Falls back to "7d" as the safe default.
 */
export function getEffectiveLookback(analyticId: AnalyticId, userTier: Tier): LookbackWindow {
  const gate = ANALYTIC_GATES[analyticId];
  return resolveFromMap(gate.lookback, userTier) ?? "7d";
}

/**
 * Get the list of export formats available to a user tier for an analytic.
 * Falls back to screenshot-only.
 */
export function getExportFormats(analyticId: AnalyticId, userTier: Tier): ExportFormat[] {
  const gate = ANALYTIC_GATES[analyticId];
  return resolveFromMap(gate.exportFormats, userTier) ?? ["screenshot"];
}

/**
 * Check whether a user tier has API access for an analytic.
 * Below Pro → false per section F of the gating rules.
 */
export function hasApiAccess(analyticId: AnalyticId, userTier: Tier): boolean {
  const gate = ANALYTIC_GATES[analyticId];
  return resolveFromMap(gate.apiAccess, userTier) ?? false;
}
