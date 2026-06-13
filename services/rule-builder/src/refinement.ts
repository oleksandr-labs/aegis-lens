/**
 * AI Rule Refinement Loop
 *
 * Handles the "too noisy" → narrow feedback loop.
 * When a user's alert rule fires too frequently, the system suggests
 * more specific sub-conditions to reduce noise while preserving intent.
 *
 * Sprint 2.73 — closes TODO_ai_rule_builder.md "Refinement loop" task
 */

import type { ParseResult, ParsedRule } from "./parser";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NoisinessLevel = "fine" | "moderate" | "noisy" | "very_noisy";

export interface RefinementSuggestion {
  /** Human-readable explanation of the suggested change */
  description: { en: string; uk: string };
  /** What field/condition to add or tighten */
  field: string;
  /** Suggested operator */
  operator: "gte" | "lte" | "within_km" | "equals" | "in" | "not_in";
  /** Suggested value */
  value: unknown;
  /** Estimated reduction in daily fire count */
  estimatedReductionPct: number;
}

export interface RefinementResult {
  originalRule: ParsedRule;
  noisiness: NoisinessLevel;
  firesPerDay: number;
  suggestions: RefinementSuggestion[];
  /** Refined rule JSON incorporating the top suggestion automatically */
  autoRefinedRule: ParsedRule | null;
  /** Preview NL of the auto-refined rule */
  autoRefinedPreview: string | null;
}

// ── Noise thresholds ──────────────────────────────────────────────────────────

const NOISE_THRESHOLDS = {
  fine: 10,         // ≤10 fires/day — fine
  moderate: 30,     // 11–30 fires/day — moderate
  noisy: 100,       // 31–100 fires/day — noisy
  very_noisy: Infinity, // >100 fires/day — very noisy
} as const;

function classifyNoisiness(firesPerDay: number): NoisinessLevel {
  if (firesPerDay <= NOISE_THRESHOLDS.fine) return "fine";
  if (firesPerDay <= NOISE_THRESHOLDS.moderate) return "moderate";
  if (firesPerDay <= NOISE_THRESHOLDS.noisy) return "noisy";
  return "very_noisy";
}

// ── Suggestion generators ─────────────────────────────────────────────────────

function suggestConfidenceTighten(rule: ParsedRule): RefinementSuggestion | null {
  const currentConfidence = rule.conditions.find(c => c.field === "confidence")?.value as number | undefined;
  if (currentConfidence !== undefined && currentConfidence >= 0.9) return null;

  const newValue = currentConfidence === undefined ? 0.7 : Math.min(currentConfidence + 0.1, 0.95);
  return {
    description: {
      en: `Raise confidence threshold to ≥${(newValue * 100).toFixed(0)}% to filter out unverified reports`,
      uk: `Підвищте поріг достовірності до ≥${(newValue * 100).toFixed(0)}% для фільтрації неперевірених повідомлень`,
    },
    field: "confidence",
    operator: "gte",
    value: newValue,
    estimatedReductionPct: 30,
  };
}

function suggestRadiusReduce(rule: ParsedRule): RefinementSuggestion | null {
  const radiusCond = rule.conditions.find(c => c.field === "radius_km");
  if (!radiusCond) return null;
  const current = radiusCond.value as number;
  if (current <= 10) return null;
  const newValue = Math.round(current * 0.5);
  return {
    description: {
      en: `Reduce search radius from ${current}km to ${newValue}km for tighter geographic focus`,
      uk: `Зменшіть радіус пошуку з ${current}км до ${newValue}км для точнішого географічного охоплення`,
    },
    field: "radius_km",
    operator: "lte",
    value: newValue,
    estimatedReductionPct: 40,
  };
}

function suggestEventTypeFilter(rule: ParsedRule): RefinementSuggestion | null {
  const typesCond = rule.conditions.find(c => c.field === "event_type");
  if (typesCond) return null; // already filtered
  return {
    description: {
      en: "Add a specific event type filter (e.g., drone_strike, artillery) to narrow the scope",
      uk: "Додайте фільтр за типом події (напр., drone_strike, artillery) для звуження охоплення",
    },
    field: "event_type",
    operator: "in",
    value: ["drone_strike"],
    estimatedReductionPct: 50,
  };
}

function suggestSourceQuality(rule: ParsedRule): RefinementSuggestion | null {
  const sourceCond = rule.conditions.find(c => c.field === "source_tier");
  if (sourceCond) return null;
  return {
    description: {
      en: "Restrict to Tier 1 + Tier 2 sources only (excludes social media rumours)",
      uk: "Обмежте джерелами Рівня 1 та Рівня 2 (виключає чутки з соцмереж)",
    },
    field: "source_tier",
    operator: "in",
    value: [1, 2],
    estimatedReductionPct: 35,
  };
}

function suggestSeverityFloor(rule: ParsedRule): RefinementSuggestion | null {
  const severityCond = rule.conditions.find(c => c.field === "severity");
  if (severityCond) return null;
  return {
    description: {
      en: "Add minimum severity level = 'high' to skip low-impact events",
      uk: "Додайте мінімальний рівень серйозності = 'high', щоб пропускати малозначущі події",
    },
    field: "severity",
    operator: "in",
    value: ["high", "critical"],
    estimatedReductionPct: 45,
  };
}

// ── Main refinement function ──────────────────────────────────────────────────

export function generateRefinements(
  rule: ParsedRule,
  firesPerDay: number,
): RefinementResult {
  const noisiness = classifyNoisiness(firesPerDay);

  const suggestions: RefinementSuggestion[] = [
    suggestConfidenceTighten(rule),
    suggestRadiusReduce(rule),
    suggestEventTypeFilter(rule),
    suggestSourceQuality(rule),
    suggestSeverityFloor(rule),
  ]
    .filter((s): s is RefinementSuggestion => s !== null)
    .sort((a, b) => b.estimatedReductionPct - a.estimatedReductionPct);

  // Auto-refine: apply top suggestion
  let autoRefinedRule: ParsedRule | null = null;
  let autoRefinedPreview: string | null = null;

  if (suggestions.length > 0 && noisiness !== "fine") {
    const top = suggestions[0];
    autoRefinedRule = {
      ...rule,
      conditions: [
        ...rule.conditions.filter(c => c.field !== top.field),
        { field: top.field, operator: top.operator, value: top.value },
      ],
    };
    autoRefinedPreview = buildRefinedPreview(autoRefinedRule, top);
  }

  return {
    originalRule: rule,
    noisiness,
    firesPerDay,
    suggestions,
    autoRefinedRule,
    autoRefinedPreview,
  };
}

function buildRefinedPreview(rule: ParsedRule, appliedSuggestion: RefinementSuggestion): string {
  return (
    `You will be alerted when ${rule.summary ?? "matching events occur"} ` +
    `— refined to reduce noise by ~${appliedSuggestion.estimatedReductionPct}% ` +
    `(${appliedSuggestion.description.en})`
  );
}

// ── POST /api/rule-builder/refine request handler shape ──────────────────────

export interface RefineRequest {
  ruleId: string;
  feedbackType: "too_noisy" | "too_quiet" | "wrong_events";
  firesLast30dActual: number;
}

export interface RefineResponse {
  refinement: RefinementResult;
  /** Top suggestion already applied to the stored draft */
  autoApplied: boolean;
}
