/**
 * Per-piece confidence score.
 *
 * Combines three signals into a 0–1 confidence for any generated artifact:
 *   - grounding:        share of claims/citations traceable to evidence
 *   - sourceConfidence: mean upstream confidence of the cited facts
 *   - qualityPenalty:   deduction from quality-gate issue severities
 * Plus an optional localeAdaptation term for translated variants.
 *
 * Deterministic, dependency-free. Mirrors the 0–1 confidence convention used
 * across services (nlp, misinfo, event-schema).
 */

import type { ArtifactConfidence, GroundingFact, QualityIssue } from "./types";

export interface ConfidenceInput {
  /** Fact ids the artifact actually used. */
  usedFactIds: string[];
  /** Total claims the artifact makes (>= usedFactIds.length ideally). */
  totalClaims: number;
  facts: GroundingFact[];
  issues: QualityIssue[];
  /** 0–1, only for locale variants: how much adaptation (vs literal MT) occurred. */
  localeAdaptation?: number;
}

export function scoreConfidence(input: ConfidenceInput): ArtifactConfidence {
  const usedSet = new Set(input.usedFactIds);
  const usedFacts = input.facts.filter((f) => usedSet.has(f.id));

  // grounding: fraction of claims backed by a real fact (capped at 1).
  const grounding =
    input.totalClaims > 0 ? Math.min(1, usedFacts.length / input.totalClaims) : usedFacts.length > 0 ? 1 : 0;

  // sourceConfidence: mean upstream confidence of used facts (default 0.7 when absent).
  const sourceConfidence =
    usedFacts.length > 0
      ? usedFacts.reduce((s, f) => s + (f.confidence ?? 0.7), 0) / usedFacts.length
      : 0;

  // qualityPenalty: clamp of summed issue severities.
  const qualityPenalty = Math.min(1, input.issues.reduce((s, i) => s + i.severity, 0) / 3);

  const localeAdaptation = input.localeAdaptation;

  // Weighted aggregate.
  const base = 0.5 * grounding + 0.35 * sourceConfidence + 0.15 * (localeAdaptation ?? 1);
  const score = Math.max(0, Math.min(1, base * (1 - qualityPenalty)));

  return {
    score: Number(score.toFixed(4)),
    components: {
      grounding: Number(grounding.toFixed(4)),
      sourceConfidence: Number(sourceConfidence.toFixed(4)),
      qualityPenalty: Number(qualityPenalty.toFixed(4)),
      ...(localeAdaptation !== undefined ? { localeAdaptation: Number(localeAdaptation.toFixed(4)) } : {}),
    },
  };
}
