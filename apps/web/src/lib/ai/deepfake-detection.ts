/**
 * Deepfake / Misinformation Detection — codeable contract + heuristic stub
 *
 * Phase 3 codeable contract — not production.
 *
 * Provides typed interfaces for media authenticity checking.
 * All instances set `requiresManualReview: true` until a production
 * computer-vision model is trained and integrated.
 *
 * Production path:
 *   - Image: Hive Moderation API / internal CNN classifier
 *   - Video:  frame-level face-swap detector (e.g. FaceForensics++ fine-tune)
 *   - Recycled media: reverse-image search (TinEye / Google Vision)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MediaAuthenticityCheck {
  mediaUrl: string;
  mediaType: "image" | "video";
  /**
   * 0-1 probability that this media has been recycled from an unrelated prior event.
   * 0 = likely original, 1 = highly likely recycled.
   */
  recycledMediaScore: number;
  /**
   * 0-1 probability of a synthetically-generated or manipulated face.
   * 0 = no synthetic face detected, 1 = near-certain deepfake.
   */
  syntheticFaceScore: number;
  /**
   * 0-1 internal consistency of EXIF / container metadata.
   * 1 = fully consistent, 0 = significant inconsistencies.
   */
  metadataConsistencyScore: number;
  /** Aggregated risk level derived from the three scores above. */
  overallRisk: "low" | "medium" | "high";
  /** Always true until a production model is deployed. */
  requiresManualReview: boolean;
  modelVersion: string;
}

// ── Risk aggregation ──────────────────────────────────────────────────────────

function aggregateRisk(
  recycled: number,
  synthetic: number,
  metadata: number,
): MediaAuthenticityCheck["overallRisk"] {
  // Weighted average: recycled 40%, synthetic face 40%, metadata 20%
  const score = recycled * 0.4 + synthetic * 0.4 + (1 - metadata) * 0.2;
  if (score >= 0.6) return "high";
  if (score >= 0.3) return "medium";
  return "low";
}

// ── Detector ──────────────────────────────────────────────────────────────────

class DeepfakeDetector {
  /**
   * Check a media URL for signs of inauthenticity.
   *
   * Current implementation: heuristic stub.
   * All scores are 0 (cannot determine without a model) and
   * `requiresManualReview` is always `true`.
   */
  async check(
    url: string,
    mediaType: "image" | "video",
  ): Promise<MediaAuthenticityCheck> {
    // Future production path: call external classifier endpoints here,
    // then compute scores from their responses.
    const recycledMediaScore = 0;
    const syntheticFaceScore = 0;
    const metadataConsistencyScore = 1; // unknown → assume consistent

    return {
      mediaUrl: url,
      mediaType,
      recycledMediaScore,
      syntheticFaceScore,
      metadataConsistencyScore,
      overallRisk: aggregateRisk(recycledMediaScore, syntheticFaceScore, metadataConsistencyScore),
      requiresManualReview: true, // always true until production model deployed
      modelVersion: "heuristic-stub-v0",
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const deepfakeDetector = new DeepfakeDetector();
export { DeepfakeDetector };
