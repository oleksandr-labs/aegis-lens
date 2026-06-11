/**
 * Privacy: face & plate blurring (CV ethics — see COMPLIANCE.md).
 *
 * Aegis Lens analyses conflict imagery that contains civilians, prisoners of war,
 * and casualties. To comply with our ethics policy (no biometric identification of
 * civilians; protect PoWs under the Geneva Conventions; minimise re-traumatisation):
 *
 *   - We DETECT face/person and license-plate REGIONS only to BLUR them. We never
 *     run face recognition / 1:1 or 1:N identity matching on civilians.
 *   - Public-facing media must be passed through `planRedactions()` and the worker
 *     must apply the returned blur regions before display/export.
 *
 * This module produces a redaction PLAN (regions + method); the pixel blur is done
 * by the worker's image library. It is intentionally a face *localiser* contract,
 * NOT a recognizer — there is no identity output anywhere in this file.
 *
 * === MODEL WEIGHTS PENDING ===
 * The face/person/plate localiser is a stub; the worker supplies detected regions
 * (from a privacy-only detector) and this module decides what to redact and how.
 */

import { BoundingBox } from "./types";

export type RedactionTargetType = "face" | "person_body" | "license_plate" | "document" | "insignia_civilian";
export type RedactionMethod = "gaussian_blur" | "pixelate" | "solid_box";

export interface DetectedRegion {
  type: RedactionTargetType;
  boundingBox: BoundingBox;
  /** Localiser confidence 0–1 (NOT an identity score). */
  confidence: number;
}

export interface RedactionInstruction {
  boundingBox: BoundingBox;
  method: RedactionMethod;
  /** Blur strength (px sigma) or pixelation block size — worker interprets. */
  strength: number;
  reason: { en: string; uk: string };
}

export interface RedactionPlan {
  mediaId: string;
  instructions: RedactionInstruction[];
  /** True if ANY region must be redacted before this media may be shown publicly. */
  mustRedactBeforePublic: boolean;
}

export interface RedactionPolicy {
  /** Blur all faces (default true). */
  blurFaces: boolean;
  /** Blur license plates (default true — vehicle owner privacy). */
  blurPlates: boolean;
  /** Blur identity documents (default true). */
  blurDocuments: boolean;
  /** Minimum localiser confidence to act on a region. Default 0.4 (blur generously). */
  minConfidence: number;
}

export const DEFAULT_REDACTION_POLICY: RedactionPolicy = {
  blurFaces: true,
  blurPlates: true,
  blurDocuments: true,
  minConfidence: 0.4,
};

const REASONS: Record<RedactionTargetType, { en: string; uk: string }> = {
  face: { en: "Face blurred — no civilian biometric identification", uk: "Обличчя розмито — без біометричної ідентифікації цивільних" },
  person_body: { en: "Person obscured for privacy", uk: "Особу приховано задля приватності" },
  license_plate: { en: "License plate blurred (owner privacy)", uk: "Номерний знак розмито (приватність власника)" },
  document: { en: "Identity document blurred", uk: "Документ, що посвідчує особу, розмито" },
  insignia_civilian: { en: "Identifying marking obscured", uk: "Ідентифікуюче маркування приховано" },
};

/**
 * Turn detected regions into a redaction plan per policy. Faces/documents get the
 * strongest treatment; plates a lighter blur. Conservative by default — when in
 * doubt, blur (false-negative on a face is a privacy harm; false-positive is harmless).
 */
export function planRedactions(
  mediaId: string,
  regions: DetectedRegion[],
  policy: RedactionPolicy = DEFAULT_REDACTION_POLICY,
): RedactionPlan {
  const instructions: RedactionInstruction[] = [];
  for (const r of regions) {
    if (r.confidence < policy.minConfidence) continue;
    if ((r.type === "face" || r.type === "person_body") && !policy.blurFaces) continue;
    if (r.type === "license_plate" && !policy.blurPlates) continue;
    if (r.type === "document" && !policy.blurDocuments) continue;

    const method: RedactionMethod = r.type === "face" || r.type === "document" ? "gaussian_blur" : "pixelate";
    const strength = r.type === "face" ? 35 : 20;
    instructions.push({ boundingBox: r.boundingBox, method, strength, reason: REASONS[r.type] });
  }
  return {
    mediaId,
    instructions,
    mustRedactBeforePublic: instructions.length > 0,
  };
}
