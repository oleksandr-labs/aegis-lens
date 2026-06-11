/**
 * Object detection and claim cross-check.
 *
 * Runs a YOLOv8 / Detectron2 object detector on an image and checks
 * whether the detected objects are consistent with the textual claim
 * (e.g. a claim about "tanks" should produce vehicle/military detections).
 *
 * NOTES:
 * 1. YOLOv8 (EN): YOLOv8 or Detectron2 backend — REST endpoint returning bounding boxes + labels.
 *    YOLOv8 (UK): YOLOv8 або Detectron2 — REST-ендпоінт, що повертає bounding-box + мітки.
 * 2. Claim cross-check (EN): keyword-match between claim tokens and detected object labels.
 *    Claim cross-check (UK): зіставлення ключових слів заявки з мітками виявлених об'єктів.
 * 3. Military hardware (EN): models trained on military hardware require an export-control licence.
 *    Military hardware (UK): моделі для військової техніки потребують ліцензії експортного контролю.
 */

export interface DetectedObject {
  label: string;
  labelUk: string;
  /** 0–1 */
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number };
}

export interface ObjectDetectionResult {
  imageUrl: string;
  objects: DetectedObject[];
  /** The original event claim text that was checked against detections */
  crossCheckClaim?: string;
  /** True if at least one detected object is consistent with the claim */
  crossCheckMatches: boolean;
  /** 0–1 — overall consistency between detected objects and claim */
  consistencyScore: number;
  analyzedAt: string;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const OBJECT_DETECTION_NOTES_EN = [
  "YOLOv8 / Detectron2: REST endpoint returns bounding boxes with label + confidence per detected object.",
  "Claim cross-check: claim tokens (tokenised, lowercased) are matched against detected labels and their synonyms.",
  "Military hardware labels: detectors trained on military hardware (tanks, APCs, etc.) require an export-control licence review.",
] as const;

export const OBJECT_DETECTION_NOTES_UK = [
  "YOLOv8 / Detectron2: REST-ендпоінт повертає bounding-box із міткою та впевненістю для кожного об'єкта.",
  "Перехресна перевірка заявки: токени заявки зіставляються з мітками виявлених об'єктів та їх синонімами.",
  "Мітки військової техніки: детектори для танків, БТР тощо потребують перевірки ліцензії експортного контролю.",
] as const;

// ── Claim cross-check logic ───────────────────────────────────────────────────

/** Simple synonym map for common conflict-related terms. */
const CLAIM_SYNONYMS: Record<string, string[]> = {
  tank: ["tank", "armour", "armor", "vehicle", "mbt"],
  explosion: ["explosion", "fire", "smoke", "blast", "detonation"],
  aircraft: ["aircraft", "plane", "jet", "helicopter", "drone", "uav"],
  missile: ["missile", "rocket", "projectile"],
  building: ["building", "structure", "house", "ruins", "rubble"],
  soldier: ["soldier", "person", "human", "military", "troops"],
};

/**
 * Returns true if any detected object label is consistent with the claim text.
 * Lowercased keyword matching with synonym expansion.
 */
export function crossCheckClaimVsObjects(
  claim: string,
  objects: DetectedObject[],
): boolean {
  const claimLower = claim.toLowerCase();
  const detectedLabels = objects.map((o) => o.label.toLowerCase());

  for (const [key, synonyms] of Object.entries(CLAIM_SYNONYMS)) {
    const claimMentionsKey = synonyms.some((s) => claimLower.includes(s));
    if (!claimMentionsKey) continue;
    const detected = detectedLabels.some((label) => synonyms.some((s) => label.includes(s)));
    if (detected) return true;
  }

  // Fallback: direct token overlap between claim words and detected labels
  const claimTokens = claimLower.split(/\W+/).filter(Boolean);
  return detectedLabels.some((label) =>
    claimTokens.some((token) => label.includes(token) || token.includes(label)),
  );
}

// ── Stub detector ─────────────────────────────────────────────────────────────

class ObjectDetector {
  /**
   * Stub: returns no detections. Replace with HTTP call to inference service.
   */
  async detect(imageUrl: string, claim?: string): Promise<ObjectDetectionResult> {
    const objects: DetectedObject[] = [];
    const crossCheckMatches = claim ? crossCheckClaimVsObjects(claim, objects) : false;
    return {
      imageUrl,
      objects,
      crossCheckClaim: claim,
      crossCheckMatches,
      consistencyScore: 0,
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const objectDetector = new ObjectDetector();
