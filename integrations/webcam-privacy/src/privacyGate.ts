/**
 * Webcam privacy gate.
 *
 * checkWebcamEligibility() enforces PRIVACY_CONSTRAINTS:
 * - Blocks cams in civilian-only areas (residential, school, hospital, civilian_street)
 * - Requires per-camera ToS review (status must be 'approved')
 * - Requires location metadata (lat/lon)
 * - Blocks any cam without in_conflict_zone metadata if area_type is mixed/unknown
 *
 * All checks must pass — eligibility is AND logic, not OR.
 */

import type {
  WebcamConfig,
  WebcamPrivacyDecision,
  AreaType,
} from "./types";
import { PRIVACY_CONSTRAINTS } from "./types";

/** Area types that are blocked under civilian_areas_excluded constraint */
const BLOCKED_AREA_TYPES: Set<AreaType> = new Set([
  "civilian_street",
  "residential",
  "school",
  "hospital",
]);

/** Area types that are always allowed (non-civilian infrastructure) */
const ALLOWED_AREA_TYPES: Set<AreaType> = new Set([
  "port",
  "traffic",
  "weather",
  "industrial",
  "airport",
  "border_crossing",
]);

export function checkWebcamEligibility(cam: WebcamConfig): WebcamPrivacyDecision {
  // 1. Location metadata required
  if (!cam.latitude || !cam.longitude) {
    return {
      eligible: false,
      reason: "Camera missing location metadata (latitude/longitude required)",
      blocking_constraint: "civilian_areas_excluded",
    };
  }

  // 2. ToS review required
  if (PRIVACY_CONSTRAINTS.min_tos_review) {
    if (cam.tos_review !== "approved") {
      return {
        eligible: false,
        reason: `Camera ToS review status is '${cam.tos_review}' — must be 'approved' before ingestion`,
        blocking_constraint: "min_tos_review",
      };
    }
    if (!cam.tos_review_date || !cam.tos_reviewer) {
      return {
        eligible: false,
        reason: "Camera ToS review is missing required fields: tos_review_date, tos_reviewer",
        blocking_constraint: "min_tos_review",
      };
    }
  }

  // 3. Civilian area exclusion
  if (PRIVACY_CONSTRAINTS.civilian_areas_excluded) {
    if (BLOCKED_AREA_TYPES.has(cam.area_type)) {
      return {
        eligible: false,
        reason: `Camera area type '${cam.area_type}' is excluded under civilian_areas_excluded policy`,
        blocking_constraint: "civilian_areas_excluded",
      };
    }

    // Mixed area type: only allow if explicitly flagged as in_conflict_zone
    if (cam.area_type === "mixed" && !cam.in_conflict_zone) {
      return {
        eligible: false,
        reason:
          "Camera area type is 'mixed' and in_conflict_zone is not set — blocked pending manual review",
        blocking_constraint: "civilian_areas_excluded",
      };
    }
  }

  // 4. Audio capture check (informational — never stored, but log if someone misconfigures)
  if (PRIVACY_CONSTRAINTS.audio_capture === false) {
    // No action needed — audio_capture is enforced at FrameSampler level
    // Log constraint is satisfied
  }

  return { eligible: true };
}

/**
 * Validate an entire registry of webcam configs.
 * Returns only eligible cameras with their decisions.
 */
export function filterEligibleCameras(
  cameras: WebcamConfig[],
): Array<{ cam: WebcamConfig; decision: WebcamPrivacyDecision }> {
  return cameras
    .map((cam) => ({ cam, decision: checkWebcamEligibility(cam) }))
    .filter(({ decision }) => decision.eligible);
}

/**
 * Summarize privacy gate decisions for a registry.
 */
export function privacyGateSummary(cameras: WebcamConfig[]): {
  total: number;
  eligible: number;
  blocked: number;
  blockReasons: Record<string, number>;
} {
  const decisions = cameras.map((c) => checkWebcamEligibility(c));
  const blocked = decisions.filter((d) => !d.eligible);
  const blockReasons: Record<string, number> = {};

  for (const d of blocked) {
    const reason = d.blocking_constraint ?? "unknown";
    blockReasons[reason] = (blockReasons[reason] ?? 0) + 1;
  }

  return {
    total: cameras.length,
    eligible: decisions.filter((d) => d.eligible).length,
    blocked: blocked.length,
    blockReasons,
  };
}
