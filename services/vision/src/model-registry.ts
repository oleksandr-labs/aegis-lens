/**
 * Model registry — the single place that maps a logical detector to a concrete
 * model artifact (weights file, framework, calibrator, label set, input shape).
 *
 * Detectors look up their model here instead of hardcoding paths/versions, so
 * weights can be rolled forward/back without touching detector code. The web
 * service can also report "which models are live" for transparency.
 *
 * === MODEL WEIGHTS PENDING ===
 * Every entry below has `status: "stub"` and `weightsUri: undefined`. These are
 * CONTRACTS describing the model we intend to ship (classes, input size, license),
 * NOT trained networks. The heuristic baselines in the detector modules run when
 * the registry reports a stub. Once weights are trained:
 *   1. upload the artifact, set `weightsUri` + `status: "live"`,
 *   2. register a fitted calibrator (see `confidence.ts` / `registerCalibrator`),
 *   3. flip the detector to run inference instead of the heuristic.
 */

export type ModelTask =
  | "object_detection"
  | "aircraft_id"
  | "vessel_class"
  | "damage_assessment"
  | "vegetation_season"
  | "ocr"
  | "manipulation_detection"
  | "image_embedding"
  | "scene_segmentation"
  | "satellite_change"
  | "sar_target";

export type ModelFramework = "onnx" | "torchscript" | "tensorrt" | "tfjs" | "heuristic";
export type ModelStatus = "stub" | "training" | "candidate" | "live" | "deprecated";

export interface ModelEntry {
  /** Stable logical id, e.g. "obj-det-mil-v0". */
  id: string;
  task: ModelTask;
  /** Architecture, e.g. "YOLOv8-m", "RT-DETR", "EVA-CLIP", "TransNetV2". */
  arch: string;
  framework: ModelFramework;
  status: ModelStatus;
  /** Input resolution (square) the model expects, px. */
  inputSize?: number;
  /** Ordered class labels this model emits (index → label). */
  classes?: string[];
  /** URI to the weights artifact (S3/registry). Undefined while stub. */
  weightsUri?: string;
  /** SHA-256 of the weights for integrity, once shipped. */
  weightsSha256?: string;
  /** Calibrator id (see confidence.ts) once fitted. */
  calibratorId?: string;
  /** Training-data licensing / provenance note (kept for COMPLIANCE). */
  trainingDataNote?: string;
  /** Human-readable version note. */
  notes?: string;
}

/**
 * The default registry. All stubs until training pipelines deliver weights.
 * `arch` and `classes` are the agreed target spec, used by heuristic baselines
 * to emit the SAME label vocabulary the real model will use.
 */
const REGISTRY = new Map<string, ModelEntry>([
  ["obj-det-mil-v0", {
    id: "obj-det-mil-v0", task: "object_detection", arch: "YOLOv8-m (target) / RT-DETR-l (eval)",
    framework: "heuristic", status: "stub", inputSize: 1280,
    trainingDataNote: "Fine-tune target: military-equipment classes; source datasets must be license-cleared (see COMPLIANCE.md). No civilian-face training.",
    notes: "Heuristic text/metadata baseline live; vision weights pending.",
  }],
  ["aircraft-id-v0", {
    id: "aircraft-id-v0", task: "aircraft_id", arch: "EfficientNetV2 + acoustic head (target)",
    framework: "heuristic", status: "stub", inputSize: 384,
    notes: "Drone/aircraft airframe + engine-acoustic classifier; weights pending.",
  }],
  ["vessel-class-v0", {
    id: "vessel-class-v0", task: "vessel_class", arch: "ConvNeXt-tiny (target)",
    framework: "heuristic", status: "stub", inputSize: 384,
    notes: "Naval vessel classifier; weights pending.",
  }],
  ["damage-assess-v0", {
    id: "damage-assess-v0", task: "damage_assessment", arch: "SegFormer-b2 (target)",
    framework: "heuristic", status: "stub", inputSize: 512,
    notes: "Fire/smoke/structural-damage segmentation; weights pending.",
  }],
  ["veg-season-v0", {
    id: "veg-season-v0", task: "vegetation_season", arch: "ResNet-50 (target)",
    framework: "heuristic", status: "stub", inputSize: 256,
    notes: "Vegetation/season classifier for video forensics; weights pending.",
  }],
  ["manip-detect-v0", {
    id: "manip-detect-v0", task: "manipulation_detection", arch: "EfficientNet-B4 + DCT/noise-residual (target)",
    framework: "heuristic", status: "stub", inputSize: 380,
    notes: "Deepfake/manipulation detector; weights pending. Output is advisory, never sole basis for a 'fake' verdict.",
  }],
  ["img-embed-v0", {
    id: "img-embed-v0", task: "image_embedding", arch: "EVA-CLIP / DINOv2 (target)",
    framework: "heuristic", status: "stub", inputSize: 224,
    notes: "Embedding model backing the custom reverse-image index; weights pending. Heuristic uses perceptual hash (pHash) fallback.",
  }],
  ["scene-seg-v0", {
    id: "scene-seg-v0", task: "scene_segmentation", arch: "TransNetV2 (target)",
    framework: "heuristic", status: "stub",
    notes: "Shot-boundary / scene segmentation for video; weights pending. Heuristic uses frame-difference cut detection.",
  }],
  ["sat-change-v0", {
    id: "sat-change-v0", task: "satellite_change", arch: "Siamese U-Net (target)",
    framework: "heuristic", status: "stub",
    notes: "Sentinel-2 bi-temporal change detection; weights pending. Heuristic uses spectral-index deltas (NBR/NDVI).",
  }],
  ["sar-target-v0", {
    id: "sar-target-v0", task: "sar_target", arch: "CFAR + CNN (target)",
    framework: "heuristic", status: "stub",
    notes: "Sentinel-1 SAR bright-target / coherence-change; weights pending. Heuristic uses backscatter thresholding.",
  }],
]);

export function getModel(id: string): ModelEntry | undefined {
  return REGISTRY.get(id);
}

export function listModels(task?: ModelTask): ModelEntry[] {
  const all = [...REGISTRY.values()];
  return task ? all.filter((m) => m.task === task) : all;
}

/** Register or replace a model entry (e.g. when live weights are uploaded). */
export function registerModel(entry: ModelEntry): void {
  REGISTRY.set(entry.id, entry);
}

/** True when a real (non-heuristic) model is serving for this id. */
export function isLive(id: string): boolean {
  const m = REGISTRY.get(id);
  return !!m && m.status === "live" && !!m.weightsUri;
}
