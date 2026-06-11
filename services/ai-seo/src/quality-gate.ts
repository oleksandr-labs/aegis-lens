/**
 * Hallucination / quality gate.
 *
 * Every generated artifact MUST pass this before it can be published. The gate
 * is grounding-first: text is decomposed into checkable claims, and any claim
 * (especially numbers and dates) that cannot be traced to a `GroundingFact` is
 * flagged as `ungrounded_claim` / `fabricated_number`.
 *
 * FAIL-CLOSED for YMYL: for YMYL page types the gate rejects on ANY issue and
 * forces native-reviewer sign-off (see review-gate.ts). For non-YMYL pages the
 * gate blocks only when aggregate severity crosses the threshold.
 *
 * This is a heuristic baseline (no model weights). It is deterministic and
 * dependency-free so it can run in CI and offline. An optional LLM-judge can be
 * layered on top by the caller, but the heuristic gate is always authoritative
 * for the fail-closed decision.
 */

import type { GroundingFact, PageType, QualityIssue } from "./types";
import { isYmyl } from "./types";

export interface QualityGateConfig {
  /** Aggregate-severity threshold above which non-YMYL artifacts are blocked. */
  blockThreshold: number;
  /** Min/max acceptable character length (per kind, caller supplies). */
  minLength?: number;
  maxLength?: number;
  /** Max share of words that may be target keywords before stuffing flag. */
  maxKeywordDensity: number;
  /** Require >= 1 citation (intros, YMYL). */
  requireCitation?: boolean;
}

export const DEFAULT_GATE_CONFIG: QualityGateConfig = {
  blockThreshold: 0.5,
  maxKeywordDensity: 0.06,
};

export interface QualityGateInput {
  text: string;
  pageType: PageType;
  facts: GroundingFact[];
  /** Fact ids the generator claims it used / cited. */
  usedFactIds: string[];
  keywords?: string[];
  config?: Partial<QualityGateConfig>;
  /** Whether an AI-disclosure is attached (transparency requirement). */
  hasDisclosure?: boolean;
}

export interface QualityGateResult {
  passed: boolean;
  /** True when YMYL fail-closed forced a hard block / mandatory review. */
  failClosed: boolean;
  issues: QualityIssue[];
  /** Sum of issue severities (for confidence penalty). */
  aggregateSeverity: number;
}

const NUMBER_RE = /\b\d[\d,.\s]*\d|\b\d\b/g;
const DATE_RE = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\s+\w+\s+\d{4}|\d{4})\b/g;

/** Normalize a numeric/date token for comparison against evidence text. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[\s,]/g, "");
}

/** Build the concatenated evidence haystack from grounding facts. */
function evidenceHaystack(facts: GroundingFact[]): string {
  return norm(facts.map((f) => f.statement).join(" "));
}

/**
 * Extract numeric and date tokens not present in the evidence haystack.
 * These are the highest-risk hallucinations.
 */
function findFabricatedNumbers(text: string, haystack: string): string[] {
  const found = new Set<string>();
  for (const re of [NUMBER_RE, DATE_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const tok = m[0].trim();
      if (tok.length < 1) continue;
      if (!haystack.includes(norm(tok))) found.add(tok);
    }
  }
  return [...found];
}

function keywordDensity(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let hits = 0;
  const kw = keywords.map((k) => k.toLowerCase());
  for (const w of words) if (kw.some((k) => k.includes(w) || w.includes(k))) hits++;
  return hits / words.length;
}

export function runQualityGate(input: QualityGateInput): QualityGateResult {
  const cfg = { ...DEFAULT_GATE_CONFIG, ...input.config };
  const issues: QualityIssue[] = [];
  const ymyl = isYmyl(input.pageType);

  // 1. No grounding at all → cannot verify anything.
  if (input.facts.length === 0) {
    issues.push({
      flag: "no_grounding_facts",
      severity: 1,
      detail: "Generator ran without any grounding facts; nothing is verifiable.",
    });
  }

  const haystack = evidenceHaystack(input.facts);

  // 2. Fabricated numbers / dates.
  const fab = input.facts.length > 0 ? findFabricatedNumbers(input.text, haystack) : [];
  for (const tok of fab) {
    issues.push({
      flag: "fabricated_number",
      severity: 0.9,
      detail: `Numeric/date value "${tok}" not found in grounding evidence.`,
      span: tok,
    });
  }

  // 3. Citation requirement.
  if ((cfg.requireCitation || ymyl) && input.usedFactIds.length === 0) {
    issues.push({
      flag: "missing_citation",
      severity: 0.8,
      detail: "Content requires at least one cited grounding fact but none were supplied.",
    });
  }

  // 4. Used fact ids must actually exist in the fact set (no phantom citations).
  const factIdSet = new Set(input.facts.map((f) => f.id));
  for (const id of input.usedFactIds) {
    if (!factIdSet.has(id)) {
      issues.push({
        flag: "ungrounded_claim",
        severity: 0.7,
        detail: `Cited fact id "${id}" does not exist in the grounding set.`,
        span: id,
      });
    }
  }

  // 5. Length window.
  if (cfg.minLength !== undefined && input.text.length < cfg.minLength) {
    issues.push({
      flag: "length_out_of_range",
      severity: 0.4,
      detail: `Length ${input.text.length} < min ${cfg.minLength}.`,
    });
  }
  if (cfg.maxLength !== undefined && input.text.length > cfg.maxLength) {
    issues.push({
      flag: "length_out_of_range",
      severity: 0.4,
      detail: `Length ${input.text.length} > max ${cfg.maxLength}.`,
    });
  }

  // 6. Keyword stuffing.
  const density = keywordDensity(input.text, input.keywords ?? []);
  if (density > cfg.maxKeywordDensity) {
    issues.push({
      flag: "keyword_stuffing",
      severity: 0.5,
      detail: `Keyword density ${(density * 100).toFixed(1)}% exceeds ${(cfg.maxKeywordDensity * 100).toFixed(0)}%.`,
    });
  }

  // 7. Disclosure (transparency policy — see COMPLIANCE.md).
  if (input.hasDisclosure === false) {
    issues.push({
      flag: "disclosure_missing",
      severity: ymyl ? 0.6 : 0.3,
      detail: "AI-content disclosure not attached.",
    });
  }

  const aggregateSeverity = issues.reduce((s, i) => s + i.severity, 0);

  // Decision. YMYL fails closed on ANY issue.
  let passed: boolean;
  let failClosed = false;
  if (ymyl) {
    passed = issues.length === 0;
    failClosed = !passed;
  } else {
    passed = aggregateSeverity < cfg.blockThreshold;
  }

  return { passed, failClosed, issues, aggregateSeverity };
}
