/**
 * Image verification pipeline — aggregates all image checks into a single verdict.
 *
 * Runs selected checks in parallel and combines their scores into an overall
 * confidence score and a verification verdict. Human sign-off is always required
 * before a "pass" verdict is published.
 *
 * NOTES:
 * 1. Parallel checks (EN): all enabled checks run concurrently; fastest path returns first.
 *    Parallel checks (UK): всі увімкнені перевірки виконуються паралельно.
 * 2. Human required (EN): a "pass" verdict always requires human-in-the-loop sign-off.
 *    Human required (UK): вердикт «pass» завжди потребує затвердження людини.
 */

export type ImageVerificationCheck =
  | "phash"
  | "reverse-image"
  | "exif"
  | "deepfake"
  | "objects"
  | "sun-angle"
  | "vegetation"
  | "ocr";

export type VerificationVerdict = "pass" | "suspicious" | "fail";

export interface ImageVerificationInput {
  imageUrl: string;
  claimedLocation?: { lat: number; lng: number };
  /** ISO-8601 claimed capture date */
  claimedDate?: string;
  /** Free-text event claim to cross-check against image content */
  eventClaim?: string;
}

export interface ImageVerificationResult {
  imageUrl: string;
  pipelineVersion: string;
  /** Individual check results, keyed by check name */
  results: Record<string, unknown>;
  /** 0–1 weighted aggregate confidence */
  overallConfidence: number;
  verificationVerdict: VerificationVerdict;
  completedAt: string;
}

// ── Pipeline version ──────────────────────────────────────────────────────────

const PIPELINE_VERSION = "1.0.0";

// ── Check weight configuration ────────────────────────────────────────────────

const CHECK_WEIGHTS: Record<ImageVerificationCheck, number> = {
  "phash":         0.10,
  "reverse-image": 0.20,
  "exif":          0.15,
  "deepfake":      0.20,
  "objects":       0.10,
  "sun-angle":     0.10,
  "vegetation":    0.05,
  "ocr":           0.10,
};

// ── Verdict derivation ────────────────────────────────────────────────────────

function deriveVerdict(confidence: number): VerificationVerdict {
  if (confidence >= 0.75) return "pass";
  if (confidence >= 0.45) return "suspicious";
  return "fail";
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const IMAGE_PIPELINE_NOTES_EN = [
  "Parallel checks: all enabled checks run concurrently via Promise.allSettled to avoid one failure blocking others.",
  "Human-in-the-loop: a 'pass' verdict must be reviewed and confirmed by a trained analyst before publication.",
] as const;

export const IMAGE_PIPELINE_NOTES_UK = [
  "Паралельні перевірки: всі увімкнені перевірки виконуються паралельно через Promise.allSettled.",
  "HITL: вердикт 'pass' повинен бути переглянутий і підтверджений аналітиком до публікації.",
] as const;

// ── Pipeline factory ──────────────────────────────────────────────────────────

/**
 * Build a pipeline function that runs the specified checks against an image.
 * Each check is a stub that returns an empty/neutral result. Wire up real
 * check implementations by replacing the stub resolvers below.
 *
 * @param checks - ordered list of check names to run
 */
export function buildImageVerificationPipeline(
  checks: ImageVerificationCheck[],
): (input: ImageVerificationInput) => Promise<ImageVerificationResult> {
  return async (input: ImageVerificationInput): Promise<ImageVerificationResult> => {
    // Run all checks concurrently; individual failures don't abort the pipeline.
    const settlements = await Promise.allSettled(
      checks.map(async (check) => {
        // Stub runner — replace each branch with real check call
        const result: unknown = await runCheckStub(check, input);
        return { check, result };
      }),
    );

    const results: Record<string, unknown> = {};
    for (const settlement of settlements) {
      if (settlement.status === "fulfilled") {
        results[settlement.value.check] = settlement.value.result;
      } else {
        results["error"] = settlement.reason;
      }
    }

    // Weighted average confidence from checks that returned a numeric score.
    const totalWeight = checks.reduce((s, c) => s + (CHECK_WEIGHTS[c] ?? 0), 0);
    let weightedSum = 0;
    for (const check of checks) {
      const r = results[check] as { score?: number } | undefined;
      const score = typeof r?.score === "number" ? r.score : 0.5; // neutral default
      weightedSum += score * (CHECK_WEIGHTS[check] ?? 0);
    }
    const overallConfidence =
      totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0.5;

    return {
      imageUrl: input.imageUrl,
      pipelineVersion: PIPELINE_VERSION,
      results,
      overallConfidence,
      verificationVerdict: deriveVerdict(overallConfidence),
      completedAt: new Date().toISOString(),
    };
  };
}

/** Stub runner — returns a neutral score for every check. */
async function runCheckStub(
  check: ImageVerificationCheck,
  _input: ImageVerificationInput,
): Promise<{ score: number; detail: string }> {
  // In production, import and call the real module for each check here.
  return { score: 0.5, detail: `${check}: stub — not yet wired` };
}
