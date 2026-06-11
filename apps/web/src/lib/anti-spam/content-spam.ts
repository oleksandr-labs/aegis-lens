/**
 * Content-level spam and AI-generated-text detection.
 *
 * All checks are synchronous and heuristic — no external API calls.
 * Results feed into decision-engine.ts for aggregation.
 */

import type { BotCheckResult, ContentSubmission, SpamSignal } from "./types";

// ── Thresholds ────────────────────────────────────────────────────────────────

/** More than this many links in a single review is suspicious. */
export const SPAM_LINK_THRESHOLD = 3 as const;

/**
 * Minimum character length of a substring that, when repeated inside the
 * same text, is treated as a repetitive-phrase signal.
 */
export const REPETITIVE_PHRASE_MIN_LEN = 50 as const;

// ── AI-content heuristics ─────────────────────────────────────────────────────

/**
 * Heuristic patterns that frequently appear in LLM-generated text.
 * These are soft signals — any single match is insufficient alone.
 */
export const AI_CONTENT_HEURISTICS: {
  /** Regex patterns for overly formal / stock phrases. */
  formalPhrases: RegExp[];
  /**
   * Minimum ratio of sentences whose length (in chars) falls within a
   * suspiciously narrow band — indicates unnaturally uniform output.
   */
  uniformSentenceLengthRatio: number;
  /**
   * How many heuristic signals must fire before hasAiContentSignals
   * returns true.
   */
  signalThreshold: number;
} = {
  formalPhrases: [
    /\bin conclusion\b/i,
    /\bit is worth noting\b/i,
    /\bit is important to note\b/i,
    /\bfurthermore\b/i,
    /\bin summary\b/i,
    /\bmoreover\b/i,
    /\bto summarize\b/i,
    /\bin addition to the above\b/i,
    /\boverall,\s/i,
    /\bas (an|a) AI\b/i,
    /\bI (cannot|can't) (help|assist) with\b/i,
    /\bdelve\b/i,
    /\btailored\s+to\s+(your|the)\s+(needs|requirements)\b/i,
    /\bseamlessly\b/i,
    /\bpivot\b/i,
    /\bleverage\b/i,
    /\bsynergy\b/i,
    /\bparadigm\s+shift\b/i,
    /\bproactive(ly)?\b/i,
  ],
  uniformSentenceLengthRatio: 0.7,
  signalThreshold: 3,
};

// ── AI-content check ──────────────────────────────────────────────────────────

/**
 * Heuristic check for AI-generated content.
 *
 * Returns `true` when at least `AI_CONTENT_HEURISTICS.signalThreshold`
 * individual signals fire.
 */
export function hasAiContentSignals(text: string): boolean {
  if (text.trim().length === 0) return false;

  let signals = 0;

  // 1. Count formal-phrase matches.
  const formalMatches = AI_CONTENT_HEURISTICS.formalPhrases.filter((re) =>
    re.test(text),
  ).length;
  if (formalMatches >= 2) signals += 1;

  // 2. Check for unnaturally uniform sentence lengths.
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length >= 4) {
    const lengths = sentences.map((s) => s.length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const withinBand = lengths.filter(
      (l) => Math.abs(l - mean) < mean * 0.25,
    ).length;
    if (withinBand / sentences.length >= AI_CONTENT_HEURISTICS.uniformSentenceLengthRatio) {
      signals += 1;
    }
  }

  // 3. Absence of any contractions or colloquialisms.
  const hasContractions = /\b\w+'(t|re|ve|ll|d|s)\b/i.test(text);
  if (!hasContractions && text.length > 200) signals += 1;

  // 4. Suspiciously perfect punctuation (every sentence ends with a period).
  const rawSentences = text.split(/\n+/).filter((l) => l.trim().length > 20);
  if (rawSentences.length >= 3) {
    const endsWithPeriod = rawSentences.filter((l) =>
      /[.]\s*$/.test(l.trim()),
    ).length;
    if (endsWithPeriod / rawSentences.length >= 0.9) signals += 1;
  }

  return signals >= AI_CONTENT_HEURISTICS.signalThreshold;
}

// ── Content-spam check ────────────────────────────────────────────────────────

/**
 * Checks a content submission for spam signals and returns a BotCheckResult.
 */
export function checkContentSpam(submission: ContentSubmission): BotCheckResult {
  const { text, links } = submission;
  const signals: SpamSignal[] = [];
  const reasons: string[] = [];

  // --- Too many links ---
  if (links.length > SPAM_LINK_THRESHOLD) {
    signals.push("review_spam");
    reasons.push(`${links.length} links exceed threshold of ${SPAM_LINK_THRESHOLD}.`);
  }

  // --- Repeated phrases (naive O(n²) substring check) ---
  if (text.length >= REPETITIVE_PHRASE_MIN_LEN * 2) {
    const chunk = text.slice(0, REPETITIVE_PHRASE_MIN_LEN);
    const firstIndex = text.indexOf(chunk);
    const secondIndex = text.indexOf(chunk, firstIndex + 1);
    if (secondIndex !== -1) {
      signals.push("review_spam");
      reasons.push("Repeated phrase detected.");
    }
  }

  // --- All-caps ratio ---
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 20) {
    const upperCount = letters.replace(/[^A-Z]/g, "").length;
    if (upperCount / letters.length > 0.5) {
      signals.push("review_spam");
      reasons.push(`All-caps ratio ${(upperCount / letters.length).toFixed(2)} exceeds 0.5.`);
    }
  }

  // --- URL embedded in what looks like a display name (authorId) ---
  if (/https?:\/\//i.test(submission.authorId)) {
    signals.push("review_spam");
    reasons.push("URL detected in author identifier.");
  }

  // --- AI-content heuristic ---
  if (hasAiContentSignals(text)) {
    signals.push("ai_content");
    reasons.push("AI-generated content heuristics triggered.");
  }

  // Deduplicate signals.
  const uniqueSignals = [...new Set(signals)] as SpamSignal[];

  // Score: each unique signal adds 25 points, capped at 100.
  const score = Math.min(uniqueSignals.length * 25, 100);

  const decision =
    score >= 80 ? "block"
    : score >= 60 ? "quarantine"
    : score >= 40 ? "captcha"
    : "allow";

  return {
    decision,
    signals: uniqueSignals,
    score,
    reason: reasons.length > 0 ? reasons.join(" ") : "Content passed spam checks.",
  };
}
