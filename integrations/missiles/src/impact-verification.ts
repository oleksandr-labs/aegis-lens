/**
 * Impact site verification pipeline.
 *
 * Verifying that a strike actually hit a claimed location requires inputs this
 * project cannot procure live (a trained CV crater/damage detector and tasked
 * before/after satellite imagery). We therefore define the *codeable contract*:
 * a typed verification-stage interface plus a heuristic corroboration scorer that
 * fuses whatever evidence IS available (CV detections, satellite change-detection
 * pixels, geolocated media, multiple independent OSINT sources) into a single
 * verification verdict with a confidence schema — same pattern as `classifier.ts`.
 */

export type VerificationVerdict =
  | "verified"      // strong corroboration across independent stages
  | "in_review"     // partial corroboration, needs analyst sign-off
  | "disputed"      // stages conflict
  | "insufficient"; // not enough evidence

/** Output of a computer-vision crater/damage detector (contract, not a model). */
export interface CvDamageDetection {
  /** 0–1 model confidence that damage consistent with a strike is present. */
  confidence: number;
  /** Detected damage class, if any. */
  damageClass?: "crater" | "structural_collapse" | "fire" | "debris_field";
  /** Pixel/metre footprint of the detected damage. */
  footprintM2?: number;
  modelVersion: string;
}

/** Output of satellite before/after change detection over the impact bbox. */
export interface ChangeDetectionResult {
  /** Fraction of pixels in the AOI that changed beyond threshold (0–1). */
  changedFraction: number;
  baselineImageDate: string;
  recentImageDate: string;
  source: "sentinel_hub";
}

/** A geolocated piece of corroborating media (photo/video of the site). */
export interface GeolocatedMedia {
  url: string;
  lat: number;
  lon: number;
  /** Geolocation confidence 0–1. */
  geoConfidence: number;
  capturedAt?: string;
}

export interface ImpactVerificationInput {
  eventId: string;
  claimedLat: number;
  claimedLon: number;
  cv?: CvDamageDetection;
  changeDetection?: ChangeDetectionResult;
  media?: GeolocatedMedia[];
  /** Count of independent OSINT sources reporting this impact. */
  independentSourceCount: number;
}

export interface ImpactVerificationResult {
  eventId: string;
  verdict: VerificationVerdict;
  /** 0–1 fused corroboration score. */
  score: number;
  /** Per-stage contributions for transparency / audit. */
  signals: {
    cv: number;
    changeDetection: number;
    media: number;
    sourceAgreement: number;
  };
  reasonsEn: string[];
  reasonsUk: string[];
}

/** Stage weights — sum to 1. CV + change-detection are the strongest signals. */
export const VERIFICATION_WEIGHTS = {
  cv: 0.3,
  changeDetection: 0.3,
  media: 0.2,
  sourceAgreement: 0.2,
};

/**
 * Heuristic corroboration scorer. Each available stage contributes a 0–1 signal;
 * missing stages contribute 0 (they neither help nor penalise beyond their weight).
 */
export function verifyImpact(input: ImpactVerificationInput): ImpactVerificationResult {
  const reasonsEn: string[] = [];
  const reasonsUk: string[] = [];

  const cvSignal = input.cv ? clamp01(input.cv.confidence) : 0;
  if (input.cv) {
    reasonsEn.push(`CV detector: ${(cvSignal * 100).toFixed(0)}% (${input.cv.damageClass ?? "damage"}).`);
    reasonsUk.push(`CV-детектор: ${(cvSignal * 100).toFixed(0)}% (${input.cv.damageClass ?? "пошкодження"}).`);
  }

  // Change detection: modest change is expected; saturate around 25% changed.
  const cdSignal = input.changeDetection
    ? clamp01(input.changeDetection.changedFraction / 0.25)
    : 0;
  if (input.changeDetection) {
    reasonsEn.push(`Satellite change detection: ${(input.changeDetection.changedFraction * 100).toFixed(0)}% AOI changed.`);
    reasonsUk.push(`Супутникове виявлення змін: змінено ${(input.changeDetection.changedFraction * 100).toFixed(0)}% зони.`);
  }

  // Media: best single geolocated item near the claimed point.
  const mediaSignal = (input.media ?? []).reduce((best, m) => {
    const distOk = m.geoConfidence; // proximity assumed validated upstream
    return Math.max(best, clamp01(distOk));
  }, 0);
  if ((input.media ?? []).length > 0) {
    reasonsEn.push(`${input.media!.length} geolocated media item(s).`);
    reasonsUk.push(`${input.media!.length} геолокованих медіа.`);
  }

  // Source agreement: saturates at 3 independent sources.
  const sourceSignal = clamp01(input.independentSourceCount / 3);
  reasonsEn.push(`${input.independentSourceCount} independent source(s).`);
  reasonsUk.push(`${input.independentSourceCount} незалежних джерел.`);

  const score = clamp01(
    VERIFICATION_WEIGHTS.cv * cvSignal +
      VERIFICATION_WEIGHTS.changeDetection * cdSignal +
      VERIFICATION_WEIGHTS.media * mediaSignal +
      VERIFICATION_WEIGHTS.sourceAgreement * sourceSignal,
  );

  let verdict: VerificationVerdict;
  if (score >= 0.7) verdict = "verified";
  else if (score >= 0.4) verdict = "in_review";
  else if (cvSignal > 0 && cdSignal === 0 && sourceSignal === 0) verdict = "disputed";
  else verdict = "insufficient";

  return {
    eventId: input.eventId,
    verdict,
    score: parseFloat(score.toFixed(3)),
    signals: {
      cv: parseFloat(cvSignal.toFixed(3)),
      changeDetection: parseFloat(cdSignal.toFixed(3)),
      media: parseFloat(mediaSignal.toFixed(3)),
      sourceAgreement: parseFloat(sourceSignal.toFixed(3)),
    },
    reasonsEn,
    reasonsUk,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
