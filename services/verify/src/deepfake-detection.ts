/**
 * Deepfake and image manipulation detection.
 *
 * Combines Error Level Analysis (ELA), DCT spectrum anomaly detection, and
 * temporal flicker analysis (for video frames) to surface likely manipulated media.
 *
 * NOTES:
 * 1. ELA (EN): Error Level Analysis — re-compression artifacts expose spliced regions.
 *    ELA (UK): Error Level Analysis — артефакти перекомпресії виявляють накладені ділянки.
 * 2. DCT (EN): DCT spectrum analysis — double-compression leaves statistical fingerprints.
 *    DCT (UK): Аналіз спектра ДКП — подвійна компресія залишає статистичні відбитки.
 * 3. FaceForensics++ (EN): Use the FaceForensics++ model for face-swap detection in production.
 *    FaceForensics++ (UK): Використовуйте модель FaceForensics++ для виявлення face-swap у production.
 * 4. HITL (EN): Human-in-the-loop is required before any "manipulated" verdict is published.
 *    HITL (UK): Перед публікацією вердикту «маніпуляція» обов'язково потрібен огляд людини.
 */

export type DeepfakeSignal =
  | "face_inconsistency"    // lighting/geometry mismatch on face region
  | "temporal_flicker"      // inter-frame inconsistency in video
  | "frequency_artifact"    // anomaly in DCT/FFT frequency domain
  | "compression_artifact"  // double-JPEG / ELA mismatch
  | "dct_anomaly"           // statistical outlier in DCT coefficient distribution
  | "ela_anomaly";          // ELA map shows high-error spliced regions

export interface DeepfakeDetectionResult {
  imageUrl?: string;
  videoUrl?: string;
  signals: DeepfakeSignal[];
  /** 0–1 — confidence that media IS manipulated */
  confidence: number;
  isLikelyManipulated: boolean;
  /** Identifier of the detection model/version used */
  modelVersion: string;
  analyzedAt: string;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const DEEPFAKE_DETECTION_NOTES_EN = [
  "ELA (Error Level Analysis): re-saves image at known quality; spliced regions show higher error levels than authentic regions.",
  "DCT spectrum analysis: double-JPEG compression leaves statistical fingerprints in the frequency domain.",
  "FaceForensics++ model: production face-swap detector trained on manipulated video pairs; requires GPU inference service.",
  "Human-in-the-loop: automated signals raise a flag — a trained analyst must sign off before a 'manipulated' verdict is published.",
] as const;

export const DEEPFAKE_DETECTION_NOTES_UK = [
  "ELA (Error Level Analysis): перезберігає зображення із відомою якістю; накладені ділянки мають вищий рівень помилок.",
  "Аналіз спектра ДКП: подвійна JPEG-компресія залишає статистичні відбитки у частотному домені.",
  "Модель FaceForensics++: детектор face-swap для production, навчений на маніпульованих відеопарах; потребує GPU-сервісу.",
  "HITL: автоматичні сигнали піднімають прапорець — аналітик повинен затвердити рішення до публікації вердикту.",
] as const;

// ── Request builder ───────────────────────────────────────────────────────────

/**
 * Build the request parameters to send to an external ML inference service.
 */
export function buildDeepfakeAnalysisRequest(
  mediaUrl: string,
): Record<string, string> {
  return {
    mediaUrl,
    checks: ["ela", "dct", "face_forensics"].join(","),
    modelVersion: "ff++_v2",
    requestedAt: new Date().toISOString(),
  };
}

// ── Stub detector ─────────────────────────────────────────────────────────────

class DeepfakeDetector {
  private readonly modelVersion: string;

  constructor(modelVersion = "ff++_v2") {
    this.modelVersion = modelVersion;
  }

  /**
   * Stub: returns a clean result with no signals.
   * Replace with HTTP call to GPU inference service in production.
   */
  async analyze(mediaUrl: string, isVideo = false): Promise<DeepfakeDetectionResult> {
    return {
      ...(isVideo ? { videoUrl: mediaUrl } : { imageUrl: mediaUrl }),
      signals: [],
      confidence: 0,
      isLikelyManipulated: false,
      modelVersion: this.modelVersion,
      analyzedAt: new Date().toISOString(),
    };
  }

  /** Compute a manipulation verdict from a set of signals. */
  scoreSignals(signals: DeepfakeSignal[]): { confidence: number; isLikelyManipulated: boolean } {
    const weights: Record<DeepfakeSignal, number> = {
      face_inconsistency: 0.30,
      temporal_flicker: 0.20,
      frequency_artifact: 0.15,
      compression_artifact: 0.15,
      dct_anomaly: 0.15,
      ela_anomaly: 0.20,
    };
    const confidence = Math.min(
      1,
      signals.reduce((sum, s) => sum + weights[s], 0),
    );
    return { confidence, isLikelyManipulated: confidence >= 0.5 };
  }
}

export const deepfakeDetector = new DeepfakeDetector();
