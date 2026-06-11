/** Vision service types — image/video understanding for OSINT verification. */

export type MediaType = "image" | "video" | "frame";

export type VisionTaskType =
  | "object_detection"
  | "ocr"
  | "reverse_image_search"
  | "deepfake_detection"
  | "exif_extraction"
  | "sun_angle_analysis"
  | "burn_scar_detection"
  | "change_detection"
  | "aircraft_identification"
  | "vessel_classification"
  | "damage_assessment"
  | "vegetation_season"
  | "video_scene_segmentation"
  | "sar_processing"
  | "geolocation_ai";

/**
 * Risk tier for an output. `high_stakes` outputs (e.g. a geolocated strike on a
 * named target, a "manipulated" verdict on an image used as evidence) MUST be
 * gated behind human review before they leave the service / drive a public event.
 * See COMPLIANCE.md.
 */
export type RiskTier = "informational" | "advisory" | "high_stakes";

/** Bilingual label for user-facing detector output. */
export interface BilingualLabel {
  en: string;
  uk: string;
}

export type VisionJobStatus = "pending" | "processing" | "done" | "failed";

// ── Object Detection ──────────────────────────────────────────────────────────

export type DetectedObjectClass =
  | "drone_shahed"
  | "drone_fpv"
  | "drone_quadcopter"
  | "drone_orlan"
  | "missile"
  | "explosion"
  | "fire"
  | "smoke"
  | "military_vehicle"
  | "crater"
  | "damaged_building"
  | "military_personnel"
  | "weapon_system"
  | "unknown";

export interface BoundingBox {
  x: number;   // top-left x (normalized 0–1)
  y: number;   // top-left y (normalized 0–1)
  w: number;   // width (normalized)
  h: number;   // height (normalized)
}

export interface DetectedObject {
  class: DetectedObjectClass;
  confidence: number;
  boundingBox: BoundingBox;
  /** Model that produced this detection */
  modelId: string;
}

export interface ObjectDetectionResult {
  mediaId: string;
  objects: DetectedObject[];
  processingMs: number;
  modelVersion: string;
}

// ── OCR ───────────────────────────────────────────────────────────────────────

export type OcrScript = "latin" | "cyrillic" | "arabic" | "mixed";

export interface OcrBlock {
  text: string;
  script: OcrScript;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface OcrResult {
  mediaId: string;
  fullText: string;
  blocks: OcrBlock[];
  detectedLanguages: string[]; // BCP-47
  processingMs: number;
}

// ── EXIF ──────────────────────────────────────────────────────────────────────

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTimeOriginal?: string;
  gpsLat?: number;
  gpsLon?: number;
  gpsAlt?: number;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  /** Raw EXIF tags as key-value pairs */
  raw: Record<string, string | number>;
}

export interface ExifResult {
  mediaId: string;
  exif: ExifData;
  hasGps: boolean;
  hasTimestamp: boolean;
  strippedForPrivacy: boolean;
}

// ── Sun-angle / Shadow Analysis ───────────────────────────────────────────────

export interface SunAngleResult {
  mediaId: string;
  estimatedSunAzimuth?: number;   // degrees from north
  estimatedSunElevation?: number; // degrees above horizon
  /** Estimated local time range consistent with shadows */
  estimatedLocalTimeRange?: { from: string; to: string };
  /** Candidate locations consistent with date + sun angle (max 5) */
  candidateLocations?: Array<{ lat: number; lon: number; confidence: number }>;
  confidence: number;
  processingMs: number;
}

// ── Deepfake / Manipulation Detection ─────────────────────────────────────────

export type ManipulationType =
  | "face_swap"
  | "inpainting"
  | "copy_move"
  | "splicing"
  | "generative_ai"
  | "metadata_mismatch"
  | "none";

export interface ManipulationResult {
  mediaId: string;
  manipulationTypes: ManipulationType[];
  overallConfidence: number;   // confidence that manipulation exists
  isManipulated: boolean;
  regions?: Array<{ boundingBox: BoundingBox; type: ManipulationType; confidence: number }>;
  processingMs: number;
  modelVersion: string;
}

// ── Reverse Image Search ───────────────────────────────────────────────────────

export interface ReverseImageMatch {
  url: string;
  sourceTitle?: string;
  publishedAt?: string;
  similarity: number;  // cosine similarity 0–1
  isEarlierOccurrence: boolean;
}

export interface ReverseImageResult {
  mediaId: string;
  matches: ReverseImageMatch[];
  /** Earliest known occurrence found */
  earliestOccurrence?: ReverseImageMatch;
  processingMs: number;
}

// ── Change Detection (satellite) ───────────────────────────────────────────────

export type ChangeType =
  | "burn_scar"
  | "crater"
  | "building_damage"
  | "vegetation_loss"
  | "flooding"
  | "new_construction"
  | "road_damage";

export interface ChangeRegion {
  boundingBox: BoundingBox;
  changeType: ChangeType;
  confidence: number;
  areaHectares?: number;
}

export interface ChangeDetectionResult {
  mediaId: string;
  beforeImageId?: string;
  afterImageId?: string;
  changes: ChangeRegion[];
  totalChangedAreaHectares?: number;
  processingMs: number;
}

// ── Top-level Vision Job ───────────────────────────────────────────────────────

export interface VisionJob {
  jobId: string;
  mediaId: string;
  mediaType: MediaType;
  mediaUrl?: string;
  tasks: VisionTaskType[];
  status: VisionJobStatus;
  priority: "high" | "normal" | "low";
  orgId?: string;
  queuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

export interface VisionResult {
  jobId: string;
  mediaId: string;
  objectDetection?: ObjectDetectionResult;
  ocr?: OcrResult;
  exif?: ExifResult;
  sunAngle?: SunAngleResult;
  manipulation?: ManipulationResult;
  reverseImageSearch?: ReverseImageResult;
  changeDetection?: ChangeDetectionResult;
  completedTasks: VisionTaskType[];
  failedTasks: VisionTaskType[];
  totalProcessingMs: number;
  aircraft?: AircraftIdResult;
  vessel?: VesselClassResult;
  damage?: DamageAssessmentResult;
  vegetation?: VegetationSeasonResult;
  videoScenes?: VideoSceneResult;
  sar?: SarProcessingResult;
  geolocation?: GeolocationAiResult;
}

// ── Calibrated Confidence ───────────────────────────────────────────────────────
//
// Raw model logits/softmax scores are NOT probabilities. Every detector in this
// service returns a *calibrated* confidence (Platt / temperature scaling, fitted
// per model on a labelled validation set — see `confidence.ts` and
// `model-registry.ts`). Until weights ship, calibrators are identity stubs and
// `calibrated === false` flags that the number is uncalibrated raw score.

export interface CalibratedConfidence {
  /** Raw model score (softmax / sigmoid output), 0–1. */
  raw: number;
  /** Calibrated probability after Platt/temperature scaling, 0–1. */
  calibrated: number;
  /** Whether a fitted calibrator was applied (false = identity stub, weights pending). */
  isCalibrated: boolean;
  /** Calibrator id from the model registry, if any. */
  calibratorId?: string;
}

// ── Aircraft / Drone Identification ─────────────────────────────────────────────

export type AircraftClass =
  | "shahed_136"
  | "shahed_131"
  | "lancet"
  | "orlan_10"
  | "fpv_drone"
  | "quadcopter_recon"
  | "su_34"
  | "su_35"
  | "ka_52_helicopter"
  | "mig_31"
  | "cruise_missile_airframe"
  | "fixed_wing_unknown"
  | "rotary_unknown"
  | "unknown";

export interface AircraftIdResult {
  mediaId: string;
  candidates: Array<{
    class: AircraftClass;
    label: BilingualLabel;
    confidence: CalibratedConfidence;
    /** Visual / acoustic / textual cues that drove the match. */
    cues: string[];
  }>;
  top?: AircraftClass;
  riskTier: RiskTier;
  requiresHumanReview: boolean;
  modelVersion: string;
  processingMs: number;
}

// ── Vessel Classification ───────────────────────────────────────────────────────

export type VesselClass =
  | "warship_surface_combatant"
  | "submarine"
  | "landing_ship"
  | "patrol_boat"
  | "missile_corvette"
  | "naval_drone_usv"
  | "cargo_civilian"
  | "tanker_civilian"
  | "fishing_civilian"
  | "unknown";

export interface VesselClassResult {
  mediaId: string;
  candidates: Array<{
    class: VesselClass;
    label: BilingualLabel;
    isMilitary: boolean;
    confidence: CalibratedConfidence;
    cues: string[];
  }>;
  top?: VesselClass;
  riskTier: RiskTier;
  requiresHumanReview: boolean;
  modelVersion: string;
  processingMs: number;
}

// ── Damage / Fire / Smoke Assessment ────────────────────────────────────────────

export type DamageClass =
  | "fire_active"
  | "smoke_plume"
  | "structural_collapse"
  | "facade_damage"
  | "crater"
  | "burnt_out"
  | "debris_field"
  | "intact"
  | "unknown";

export interface DamageAssessmentResult {
  mediaId: string;
  classes: Array<{
    class: DamageClass;
    label: BilingualLabel;
    confidence: CalibratedConfidence;
    boundingBox?: BoundingBox;
  }>;
  /** Coarse 0–4 severity estimate derived from detected classes. */
  severityEstimate: 0 | 1 | 2 | 3 | 4;
  riskTier: RiskTier;
  requiresHumanReview: boolean;
  modelVersion: string;
  processingMs: number;
}

// ── Vegetation / Season Classification (video forensics) ─────────────────────────

export type SeasonClass = "winter" | "early_spring" | "spring" | "summer" | "autumn" | "unknown";

export interface VegetationSeasonResult {
  mediaId: string;
  season: SeasonClass;
  seasonLabel: BilingualLabel;
  /** Whether deciduous trees show leaves (foliage present). */
  foliagePresent?: boolean;
  /** Whether snow/ice is visible. */
  snowPresent?: boolean;
  confidence: CalibratedConfidence;
  /** Months consistent with this observation (1–12), for chrono cross-check. */
  consistentMonths: number[];
  cues: string[];
  processingMs: number;
}

// ── Frame-level Video Analysis + Scene Segmentation ──────────────────────────────

export interface VideoFrameRef {
  /** Frame index within the decoded stream. */
  index: number;
  /** Presentation timestamp (seconds). */
  tsSec: number;
  /** Optional extracted frame media id (for downstream image tasks). */
  frameMediaId?: string;
}

export interface VideoScene {
  startSec: number;
  endSec: number;
  /** Representative keyframe for the scene. */
  keyframe: VideoFrameRef;
  /** Coarse scene label (best-effort). */
  label?: BilingualLabel;
  confidence: CalibratedConfidence;
}

export interface VideoSceneResult {
  mediaId: string;
  durationSec: number;
  /** Sampling rate used for frame extraction (frames per second). */
  sampledFps: number;
  frames: VideoFrameRef[];
  scenes: VideoScene[];
  /** Hard-cut boundaries (seconds) detected between scenes. */
  cutPointsSec: number[];
  processingMs: number;
}

// ── Sentinel-1 SAR Processing ────────────────────────────────────────────────────

export type SarProduct = "GRD" | "SLC";
export type SarPolarization = "VV" | "VH" | "HH" | "HV";

export interface SarProcessingResult {
  mediaId: string;
  product: SarProduct;
  polarizations: SarPolarization[];
  /** Bright returns consistent with metal / hard targets (vehicles, ships). */
  brightTargets: Array<{ boundingBox: BoundingBox; backscatterDb: number; confidence: CalibratedConfidence }>;
  /** Coherence-loss regions (change between two passes). */
  coherenceLossRegions?: ChangeRegion[];
  /** All-weather / night capability note. */
  notes: string;
  processingMs: number;
}

// ── Geolocation AI (multimodal, LLM-assisted) ────────────────────────────────────

export type GeolocClue =
  | "road_sign"
  | "license_plate_region"
  | "building_architecture"
  | "terrain"
  | "vegetation"
  | "shadow_sun_angle"
  | "landmark"
  | "language_on_signage"
  | "utility_pole_style"
  | "vehicle_markings"
  | "exif_gps"
  | "other";

export interface GeolocationCandidate {
  lat: number;
  lon: number;
  /** Uncertainty radius (meters, 1-sigma). */
  uncertaintyM: number;
  confidence: CalibratedConfidence;
  /** Human-readable place name (en/uk where known). */
  place?: BilingualLabel;
  /** Clues that support this candidate. */
  supportingClues: GeolocClue[];
  /** How this candidate was derived. */
  method: "exif" | "shadow" | "landmark_match" | "llm_reasoning" | "reverse_image" | "fusion";
}

export interface GeolocationAiResult {
  mediaId: string;
  /** Extracted clues (multimodal: from OCR, signage, terrain, etc). */
  clues: Array<{ type: GeolocClue; detail: string; confidence: CalibratedConfidence }>;
  /** Ranked candidate locations (best first, max 5). */
  candidates: GeolocationCandidate[];
  best?: GeolocationCandidate;
  /** Always high_stakes — geolocation drives targeting-adjacent claims. */
  riskTier: RiskTier;
  /** ALWAYS true: AI geolocation never auto-publishes (see COMPLIANCE.md). */
  requiresHumanReview: true;
  /** The LLM model id used for reasoning (house default = latest Claude). */
  reasoningModelId: string;
  processingMs: number;
}
