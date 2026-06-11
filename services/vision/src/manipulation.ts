/**
 * Deepfake / manipulation detection (Verification cluster).
 *
 * Aggregates several cheap forensic signals into a single calibrated
 * "is this manipulated?" estimate. Detecting AI-generated / edited media is an
 * arms race — NO single detector is reliable, and a "manipulated" verdict can
 * defame a real source. Therefore this output is ADVISORY and high-stakes: it is
 * never the sole basis for retracting/flagging an event, and a positive verdict
 * is gated behind human review (see COMPLIANCE.md).
 *
 * === MODEL WEIGHTS PENDING ===
 * The learned detector (`manip-detect-v0`: EfficientNet + DCT/noise-residual head)
 * is a stub. The heuristic baseline below fuses signals the worker CAN compute
 * cheaply today:
 *   - metadata/software mismatch (e.g. "Adobe Photoshop" in EXIF Software)
 *   - missing/clipped EXIF where camera-original is claimed
 *   - C2PA / content-credentials provenance (if present)
 *   - caller-supplied ELA / noise-residual / face-blend scores (0–1) when available
 * These are weak; treat the magnitude as a triage signal only until weights ship.
 */

import { ExifData, ManipulationResult, ManipulationType } from "./types";
import { calibrate } from "./confidence";

const MANIP_MODEL_ID = "manip-detect-v0";

const EDITING_SOFTWARE = [
  "photoshop", "gimp", "lightroom", "affinity", "pixelmator",
  "facetune", "snapseed", "midjourney", "stable diffusion", "dall-e", "dall·e",
  "runway", "sora", "firefly",
];
const GENERATIVE_SOFTWARE = ["midjourney", "stable diffusion", "dall-e", "dall·e", "runway", "sora", "firefly"];

/** Optional forensic scores the worker may pre-compute (all 0–1, higher = more suspicious). */
export interface ManipulationSignals {
  exif?: ExifData;
  /** Claimed to be a camera original (raises weight of missing-EXIF signal). */
  claimedCameraOriginal?: boolean;
  /** Error-Level-Analysis anomaly score. */
  elaScore?: number;
  /** Noise-residual / PRNU inconsistency score. */
  noiseResidualScore?: number;
  /** Face-blend / face-swap artifact score from a face-region check (NOT identification). */
  faceBlendScore?: number;
  /** C2PA / content-credentials present and valid? */
  c2paValid?: boolean;
  /** C2PA present but indicates AI generation? */
  c2paIndicatesAi?: boolean;
}

interface Signal { type: ManipulationType; weight: number; note: string }

export function detectManipulation(mediaId: string, signals: ManipulationSignals = {}): ManipulationResult {
  const start = Date.now();
  const found: Signal[] = [];

  const sw = (signals.exif?.software ?? "").toLowerCase();
  if (sw) {
    if (GENERATIVE_SOFTWARE.some((g) => sw.includes(g))) {
      found.push({ type: "generative_ai", weight: 0.7, note: `EXIF Software indicates generative tool: ${signals.exif?.software}` });
    } else if (EDITING_SOFTWARE.some((g) => sw.includes(g))) {
      found.push({ type: "inpainting", weight: 0.35, note: `Edited in ${signals.exif?.software} (editing alone is not proof of deception)` });
    }
  }

  if (signals.claimedCameraOriginal && signals.exif && !signals.exif.make && !signals.exif.model) {
    found.push({ type: "metadata_mismatch", weight: 0.4, note: "Claimed camera-original but EXIF has no Make/Model — possibly re-encoded or screenshotted" });
  }

  if (typeof signals.elaScore === "number" && signals.elaScore > 0.5) {
    found.push({ type: "splicing", weight: 0.5 * signals.elaScore + 0.2, note: `Elevated ELA anomaly (${signals.elaScore.toFixed(2)})` });
  }
  if (typeof signals.noiseResidualScore === "number" && signals.noiseResidualScore > 0.5) {
    found.push({ type: "copy_move", weight: 0.4 * signals.noiseResidualScore + 0.2, note: `Noise-residual inconsistency (${signals.noiseResidualScore.toFixed(2)})` });
  }
  if (typeof signals.faceBlendScore === "number" && signals.faceBlendScore > 0.5) {
    found.push({ type: "face_swap", weight: 0.5 * signals.faceBlendScore + 0.2, note: `Face-blend artifacts (${signals.faceBlendScore.toFixed(2)})` });
  }
  if (signals.c2paIndicatesAi) {
    found.push({ type: "generative_ai", weight: 0.85, note: "C2PA content credentials declare AI generation" });
  }

  // Valid C2PA from a trusted issuer is exculpatory — reduce suspicion.
  const c2paBonus = signals.c2paValid && !signals.c2paIndicatesAi ? -0.3 : 0;

  const manipulationTypes = Array.from(new Set(found.map((f) => f.type)));
  // Combine via noisy-OR over weights, then calibrate.
  const noisyOr = 1 - found.reduce((acc, f) => acc * (1 - Math.min(0.95, Math.max(0, f.weight))), 1);
  const rawConfidence = Math.min(0.95, Math.max(0, noisyOr + c2paBonus));
  const conf = calibrate(rawConfidence, MANIP_MODEL_ID);

  return {
    mediaId,
    manipulationTypes: manipulationTypes.length ? manipulationTypes : ["none"],
    overallConfidence: conf.calibrated,
    // Conservative threshold; positive verdict requires human review (see COMPLIANCE.md).
    isManipulated: conf.calibrated >= 0.6,
    processingMs: Date.now() - start,
    modelVersion: `${MANIP_MODEL_ID} (heuristic stub — learned detector pending; output ADVISORY)`,
  };
}

/** A "manipulated" verdict is high-stakes and must never auto-retract an event. */
export function manipulationRequiresHumanReview(result: ManipulationResult): boolean {
  return result.isManipulated || result.overallConfidence >= 0.4;
}
