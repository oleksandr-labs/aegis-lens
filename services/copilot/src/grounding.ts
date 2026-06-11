/**
 * Grounding & citation enforcement.
 *
 * Platform rule (TODO_copilot.md → Примітки): "Every claim cites at least one
 * event ID with a verifiable source." This module enforces that *in code*,
 * server-side, instead of trusting the model to behave:
 *
 *   - `extractCitations()`  — pull `[EVENT_ID]` references out of an answer.
 *   - `verifyGrounding()`   — every cited ID must exist in the provided context
 *     allow-list; every substantive sentence must carry at least one citation;
 *     no hallucinated IDs.
 *   - `enforceGrounding()`  — gate an answer: pass through if grounded, otherwise
 *     replace with a safe, localised "insufficient grounded evidence" refusal.
 *
 * Citation token format matches the existing copilot routes: square-bracketed
 * event IDs, e.g. `[01HXKHARKIVDRONE001]`.
 */

/** Matches bracketed event-id citations like [01HX...], [UA-EVT-12], multiple per bracket allowed. */
const CITATION_RE = /\[([A-Za-z0-9][A-Za-z0-9_,\-\s]*)\]/g;

/** Sentence-ish splitter (handles EN + UK punctuation). */
function sentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** A sentence is "substantive" (must be grounded) unless it's trivial scaffolding. */
function isSubstantive(sentence: string): boolean {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;
  // Skip pure meta/disclaimer lines and stat-block lines.
  if (/^\s*(stats|note|summary|disclaimer|country|time window|events|top class|avg danger)\b/i.test(sentence)) {
    return false;
  }
  if (/^[-*#>\d.\s]+$/.test(sentence)) return false;
  return true;
}

export interface GroundingReport {
  grounded: boolean;
  /** Distinct event IDs cited in the answer. */
  citedIds: string[];
  /** Cited IDs that are NOT in the allowed context (hallucinated citations). */
  hallucinatedIds: string[];
  /** Substantive sentences with no citation. */
  ungroundedSentences: string[];
  /** Fraction of substantive sentences that carry a citation (0–1). */
  coverage: number;
}

/** Extract distinct event IDs cited in an answer. */
export function extractCitations(text: string): string[] {
  const ids = new Set<string>();
  for (const m of text.matchAll(CITATION_RE)) {
    for (const raw of m[1].split(",")) {
      const id = raw.trim();
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

export interface VerifyOptions {
  /** Minimum fraction of substantive sentences that must be cited. Default 1.0 (every claim). */
  minCoverage?: number;
}

/**
 * Verify an answer against the allow-list of context event IDs that were
 * actually supplied to the model.
 */
export function verifyGrounding(
  answer: string,
  allowedEventIds: string[],
  opts: VerifyOptions = {},
): GroundingReport {
  const minCoverage = opts.minCoverage ?? 1.0;
  const allowed = new Set(allowedEventIds);
  const citedIds = extractCitations(answer);
  const hallucinatedIds = citedIds.filter((id) => !allowed.has(id));

  const subs = sentences(answer).filter(isSubstantive);
  const ungroundedSentences = subs.filter((s) => extractCitations(s).length === 0);
  const coverage = subs.length === 0 ? 1 : Number(((subs.length - ungroundedSentences.length) / subs.length).toFixed(3));

  const grounded =
    hallucinatedIds.length === 0 &&
    coverage >= minCoverage &&
    (subs.length === 0 || citedIds.length > 0);

  return { grounded, citedIds, hallucinatedIds, ungroundedSentences, coverage };
}

export interface EnforceResult {
  /** The answer to surface to the user (original if grounded, else a refusal). */
  text: string;
  report: GroundingReport;
  blocked: boolean;
}

const REFUSAL = {
  en: "I can't substantiate that from the current verified events. I only answer from the events in view, each cited by ID. Try narrowing the time window or region so corroborating events are available.",
  uk: "Я не можу підтвердити це на основі поточних верифікованих подій. Я відповідаю лише на основі подій у полі зору, кожна з яких цитується за ID. Спробуйте звузити часовий проміжок або регіон, щоб з’явилися підтверджуючі події.",
};

/**
 * Gate an answer: return it unchanged if grounded, otherwise replace it with a
 * localised refusal. This is the enforcement point a route should call before
 * returning model output to the client.
 */
export function enforceGrounding(
  answer: string,
  allowedEventIds: string[],
  locale: "en" | "uk" = "en",
  opts: VerifyOptions = {},
): EnforceResult {
  const report = verifyGrounding(answer, allowedEventIds, opts);
  if (report.grounded) return { text: answer, report, blocked: false };
  return { text: REFUSAL[locale] ?? REFUSAL.en, report, blocked: true };
}
