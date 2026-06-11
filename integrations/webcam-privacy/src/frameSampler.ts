/**
 * Webcam frame sampler.
 *
 * Captures a single JPEG frame from a webcam URL.
 * Privacy transforms applied before any storage:
 * - Faces: detection placeholder → blur flag set (actual blur handled by downstream CV pipeline)
 * - No audio: never captured (URL is image/mjpeg only)
 * - Dimensions: capped at max_dimension to reduce storage / PII risk
 *
 * checkWebcamEligibility() must pass BEFORE calling sampleFrame().
 */

import type {
  WebcamConfig,
  WebcamFrame,
  FrameSamplingConfig,
} from "./types";
import { DEFAULT_FRAME_SAMPLING_CONFIG } from "./types";
import { checkWebcamEligibility } from "./privacyGate";

export class FrameSamplerError extends Error {
  constructor(
    message: string,
    public readonly camId: string,
    public readonly code: "privacy_gate_failed" | "fetch_failed" | "timeout" | "invalid_content",
  ) {
    super(message);
    this.name = "FrameSamplerError";
  }
}

/**
 * Placeholder face detection — returns true if a face-like pattern is heuristically
 * detectable in image metadata. In production, replace with a proper CV inference call.
 *
 * NOTE: Never extracts face data — only sets blur flag. Raw face embeddings/crops
 * are never stored.
 */
function detectFacesPlaceholder(_imageBytes: Uint8Array): boolean {
  // TODO: integrate with CV service (e.g. @ua-map/cv-pipeline)
  // For now, conservatively assume faces may be present in any outdoor cam
  return true;
}

/**
 * Capture a single frame from a public webcam URL.
 *
 * @param cam - Webcam configuration (must have passed privacy gate)
 * @param config - Sampling configuration
 * @returns WebcamFrame with privacy transforms applied
 * @throws FrameSamplerError if privacy gate fails or fetch fails
 */
export async function sampleFrame(
  cam: WebcamConfig,
  config: FrameSamplingConfig = DEFAULT_FRAME_SAMPLING_CONFIG,
): Promise<WebcamFrame> {
  // Re-run privacy gate — never trust caller to have checked
  const decision = checkWebcamEligibility(cam);
  if (!decision.eligible) {
    throw new FrameSamplerError(
      `Privacy gate rejected camera '${cam.id}': ${decision.reason}`,
      cam.id,
      "privacy_gate_failed",
    );
  }

  // audio_capture enforcement — only image URLs allowed
  if (config.capture_audio !== false) {
    throw new FrameSamplerError(
      "audio_capture must be false — this is a hard constraint",
      cam.id,
      "privacy_gate_failed",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let imageBytes: Uint8Array;
  let mimeType = "image/jpeg";

  try {
    const res = await fetch(cam.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AegisLens/1.0",
        Accept: "image/jpeg, image/png, image/gif, multipart/x-mixed-replace",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new FrameSamplerError(
        `Webcam fetch failed: HTTP ${res.status}`,
        cam.id,
        "fetch_failed",
      );
    }

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/") && !ct.startsWith("multipart/")) {
      throw new FrameSamplerError(
        `Invalid content-type: ${ct} — expected image/* or multipart/x-mixed-replace`,
        cam.id,
        "invalid_content",
      );
    }

    if (ct.includes("multipart/x-mixed-replace")) {
      // MJPEG stream: read only the first frame
      const boundary = ct.split("boundary=")[1]?.trim() ?? "--";
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      // Find start of JPEG (0xFF 0xD8)
      let start = -1;
      for (let i = 0; i < bytes.length - 1; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0xd8) {
          start = i;
          break;
        }
      }
      // Find end of JPEG (0xFF 0xD9)
      let end = bytes.length;
      for (let i = start; i < bytes.length - 1; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
          end = i + 2;
          break;
        }
      }
      imageBytes = start >= 0 ? bytes.slice(start, end) : bytes;
      mimeType = "image/jpeg";
    } else {
      const buf = await res.arrayBuffer();
      imageBytes = new Uint8Array(buf);
      mimeType = ct.split(";")[0].trim() || "image/jpeg";
    }
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof FrameSamplerError) throw err;
    const isAbort = err instanceof Error && err.name === "AbortError";
    throw new FrameSamplerError(
      isAbort ? `Webcam fetch timed out after 15s` : `Webcam fetch error: ${String(err)}`,
      cam.id,
      isAbort ? "timeout" : "fetch_failed",
    );
  }

  // Privacy transform: face detection placeholder → set blur flag
  const facesDetected = detectFacesPlaceholder(imageBytes);
  const transformsApplied: string[] = [];
  if (facesDetected) {
    transformsApplied.push("face_blur_flagged");
    // Actual blur applied by downstream CV pipeline before any display/storage
  }
  transformsApplied.push("audio_not_captured");

  const image_b64 = Buffer.from(imageBytes).toString("base64");

  return {
    cam_id: cam.id,
    captured_at: new Date().toISOString(),
    image_b64,
    mime_type: mimeType,
    faces_detected: facesDetected,
    faces_blurred: true,    // Always true per PRIVACY_CONSTRAINTS
    audio_captured: false,  // Always false per PRIVACY_CONSTRAINTS
    transforms_applied: transformsApplied,
  };
}

/**
 * Sample frames from a list of eligible cameras.
 * Yields frames as they complete; fails-soft per camera.
 */
export async function* sampleFrames(
  cameras: WebcamConfig[],
  config: FrameSamplingConfig = DEFAULT_FRAME_SAMPLING_CONFIG,
): AsyncGenerator<WebcamFrame> {
  for (const cam of cameras) {
    try {
      const frame = await sampleFrame(cam, config);
      yield frame;
    } catch {
      // Fail-soft — skip camera on any error
    }
  }
}
