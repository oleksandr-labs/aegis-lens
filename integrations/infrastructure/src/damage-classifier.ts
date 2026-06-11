/**
 * CV damage classifier on event imagery.
 *
 * The production system runs a computer-vision model over event imagery (photos /
 * satellite crops) to classify structural damage as minor / major / destroyed.
 * We cannot ship a trained CV model here, so — exactly like
 * `integrations/missiles/src/classifier.ts` — this module defines the typed
 * CLASSIFIER INTERFACE plus a deterministic heuristic baseline derived from caption
 * keywords and any reported severity hint. A real model can implement
 * `DamageImageClassifier` later without changing callers.
 *
 * Output: { severity: minor|major|destroyed, confidence: 0–1 }.
 */

import { DamageSeverity } from "./types";

/** Input to the classifier: one piece of event imagery + optional caption/context. */
export interface DamageImageInput {
  /** Image URL or opaque handle the model can fetch. */
  imageUrl?: string;
  /** Caption / surrounding OSINT text (Ukrainian or English). */
  caption?: string;
  /** Optional prior severity hint from the ingest pipeline. */
  severityHint?: DamageSeverity;
}

export interface DamageClassification {
  severity: DamageSeverity;
  confidence: number; // 0–1
  /** Which signal produced the label (for explainability / auditing). */
  basis: "image_model" | "caption_heuristic" | "severity_hint" | "default";
}

/** The contract a real CV model must satisfy. */
export interface DamageImageClassifier {
  classify(input: DamageImageInput): Promise<DamageClassification>;
}

const SEVERITY_KEYWORDS: Array<{ keywords: string[]; severity: DamageSeverity; confidence: number }> = [
  {
    keywords: ["destroyed", "levelled", "leveled", "collapsed", "rubble", "burned to the ground",
      "зруйновано", "повністю знищено", "руїни", "згоріло вщент", "обвалився"],
    severity: "destroyed",
    confidence: 0.82,
  },
  {
    keywords: ["major damage", "severe", "gutted", "roof collapsed", "structural damage", "engulfed",
      "значні пошкодження", "серйозно пошкоджено", "вигоріло", "обвал даху"],
    severity: "major",
    confidence: 0.78,
  },
  {
    keywords: ["minor damage", "partial", "shattered windows", "scorch", "shrapnel", "facade",
      "незначні пошкодження", "часткове", "вибиті вікна", "уламки", "фасад"],
    severity: "minor",
    confidence: 0.72,
  },
];

/**
 * Heuristic baseline classifier. Priority:
 *   1. Caption keyword match (most specific signal we actually have without a model).
 *   2. Pipeline-provided severityHint.
 *   3. Conservative default ("minor", low confidence).
 *
 * The imageUrl is accepted but not analysed here — that is the CV model's job.
 */
export const heuristicDamageClassifier: DamageImageClassifier = {
  async classify(input: DamageImageInput): Promise<DamageClassification> {
    const text = (input.caption ?? "").toLowerCase();
    if (text) {
      for (const { keywords, severity, confidence } of SEVERITY_KEYWORDS) {
        if (keywords.some((kw) => text.includes(kw))) {
          return { severity, confidence, basis: "caption_heuristic" };
        }
      }
    }
    if (input.severityHint) {
      return { severity: input.severityHint, confidence: 0.55, basis: "severity_hint" };
    }
    return { severity: "minor", confidence: 0.3, basis: "default" };
  },
};

/** Convenience synchronous wrapper for callers that already have the text. */
export function classifyDamageFromText(caption: string, severityHint?: DamageSeverity): DamageClassification {
  const lower = caption.toLowerCase();
  for (const { keywords, severity, confidence } of SEVERITY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { severity, confidence, basis: "caption_heuristic" };
    }
  }
  if (severityHint) return { severity: severityHint, confidence: 0.55, basis: "severity_hint" };
  return { severity: "minor", confidence: 0.3, basis: "default" };
}
