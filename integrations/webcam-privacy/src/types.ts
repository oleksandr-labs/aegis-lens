/**
 * Webcam privacy gate + frame sampling types.
 *
 * Privacy constraints (enforced throughout):
 * - civilian_areas_excluded: true — cams covering civilian-only areas are blocked
 * - faces_blurred: true — face detection placeholder triggers blur flag; no face data stored
 * - audio_capture: false — audio is never captured or processed
 * - min_tos_review: true — per-camera ToS review required before ingestion
 */

/** Hard privacy constraints — never overridden */
export const PRIVACY_CONSTRAINTS = {
  civilian_areas_excluded: true,
  faces_blurred: true,
  audio_capture: false,
  min_tos_review: true,
} as const;

/** Area type classification */
export type AreaType =
  | "port"
  | "traffic"
  | "weather"
  | "industrial"
  | "airport"
  | "border_crossing"
  | "civilian_street"
  | "residential"
  | "school"
  | "hospital"
  | "mixed";

/** ToS review status */
export type TosReviewStatus = "approved" | "pending" | "rejected" | "not_reviewed";

/** Webcam configuration */
export interface WebcamConfig {
  /** Unique camera ID */
  id: string;
  /** Human label */
  label: string;
  /** Image/mjpeg URL */
  url: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Area classification */
  area_type: AreaType;
  /** ToS review status — must be 'approved' before ingestion */
  tos_review: TosReviewStatus;
  /** ToS source URL */
  tos_url?: string;
  /** Date of ToS review ISO-8601 */
  tos_review_date?: string;
  /** Reviewer name/ID */
  tos_reviewer?: string;
  /** Whether cam is in an active conflict zone */
  in_conflict_zone?: boolean;
  /** Notes */
  notes?: string;
}

/** Privacy gate decision */
export interface WebcamPrivacyDecision {
  /** Whether the cam is eligible for ingestion */
  eligible: boolean;
  /** Reason for ineligibility (if any) */
  reason?: string;
  /** Which constraint blocked the cam (if any) */
  blocking_constraint?: keyof typeof PRIVACY_CONSTRAINTS;
}

/** Captured frame (after privacy transforms) */
export interface WebcamFrame {
  /** Camera ID */
  cam_id: string;
  /** Capture timestamp ISO-8601 */
  captured_at: string;
  /** Frame image data as base64 string */
  image_b64: string;
  /** Image MIME type (e.g. image/jpeg) */
  mime_type: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Whether face detection was triggered (blur flag set) */
  faces_detected: boolean;
  /** Faces are blurred before storage — raw face data never stored */
  faces_blurred: true;
  /** No audio captured */
  audio_captured: false;
  /** Privacy transforms applied */
  transforms_applied: string[];
}

/** Frame sampling configuration */
export interface FrameSamplingConfig {
  /** Sample interval in seconds */
  interval_seconds: number;
  /** Maximum frames to keep per camera per day */
  max_frames_per_day: number;
  /** JPEG quality (0–100) */
  jpeg_quality: number;
  /** Maximum image dimension (pixels) */
  max_dimension: number;
  /** Whether to apply face blur (always true) */
  blur_faces: true;
  /** Whether to capture audio (always false) */
  capture_audio: false;
}

export const DEFAULT_FRAME_SAMPLING_CONFIG: FrameSamplingConfig = {
  interval_seconds: 300, // 5 minutes
  max_frames_per_day: 288, // 5-min interval × 24hr
  jpeg_quality: 70,
  max_dimension: 1280,
  blur_faces: true,
  capture_audio: false,
};
