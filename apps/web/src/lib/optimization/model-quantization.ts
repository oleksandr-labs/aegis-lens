/**
 * Model quantization policy for Aegis Lens AI pipeline.
 *
 * Quantization reduces model size and inference latency at the cost of
 * marginal accuracy loss. Policies define the acceptable trade-off per model.
 *
 * Constraint mapping:
 *   'speed'   → lowest latency (most aggressive quantization)
 *   'memory'  → smallest RAM footprint (int4 where allowed)
 *   'quality' → highest accuracy (fp32 or fp16 only)
 */

export type QuantizationLevel = "fp32" | "fp16" | "int8" | "int4";

export interface QuantizationPolicy {
  /** Model identifier matching the inference service's model registry. */
  modelId: string;
  /** Default quantization level for production use. */
  defaultLevel: QuantizationLevel;
  /** Levels this model has been validated to support without unacceptable quality loss. */
  allowedLevels: QuantizationLevel[];
  /** Human-readable description of accuracy impact at default level. */
  qualityImpact: string;
  /** Approximate inference speedup relative to fp32 baseline at default level. */
  speedupFactor: number;
  /** Approximate memory saving factor relative to fp32 (e.g., 2.0 = half memory). */
  memorySavingFactor: number;
}

export const MODEL_QUANTIZATION_POLICIES: QuantizationPolicy[] = [
  {
    modelId: "yolov8n-military",
    defaultLevel: "int8",
    allowedLevels: ["fp32", "fp16", "int8"],
    qualityImpact: "~1.5% mAP drop vs fp32; acceptable for triage-level vehicle detection",
    speedupFactor: 2.5,
    memorySavingFactor: 4.0,
  },
  {
    modelId: "yolov8m-military",
    defaultLevel: "fp16",
    allowedLevels: ["fp32", "fp16", "int8"],
    qualityImpact: "Negligible mAP loss vs fp32 on modern GPUs with tensor cores",
    speedupFactor: 1.8,
    memorySavingFactor: 2.0,
  },
  {
    modelId: "whisper-medium",
    defaultLevel: "int8",
    allowedLevels: ["fp32", "fp16", "int8"],
    qualityImpact: "~0.3 WER increase; negligible for transcript extraction use case",
    speedupFactor: 3.0,
    memorySavingFactor: 4.0,
  },
  {
    modelId: "whisper-large-v3",
    defaultLevel: "fp16",
    allowedLevels: ["fp32", "fp16"],
    qualityImpact: "No measurable WER change; fp16 is the recommended production level",
    speedupFactor: 1.9,
    memorySavingFactor: 2.0,
  },
  {
    modelId: "tesseract-ua-ocr",
    defaultLevel: "int8",
    allowedLevels: ["fp32", "fp16", "int8"],
    qualityImpact: "~0.5% CER increase on Cyrillic text; acceptable for document triage",
    speedupFactor: 2.2,
    memorySavingFactor: 4.0,
  },
  {
    modelId: "clip-vit-l14",
    defaultLevel: "fp16",
    allowedLevels: ["fp32", "fp16", "int8"],
    qualityImpact: "~0.4% top-1 accuracy drop at int8; fp16 used as default for quality",
    speedupFactor: 1.7,
    memorySavingFactor: 2.0,
  },
  {
    modelId: "geo-classifier-resnet50",
    defaultLevel: "int8",
    allowedLevels: ["fp32", "fp16", "int8", "int4"],
    qualityImpact: "~2% accuracy drop at int8; int4 available for edge/low-memory deploy",
    speedupFactor: 3.5,
    memorySavingFactor: 4.0,
  },
];

/** Look up a policy by modelId. */
const POLICY_MAP = new Map<string, QuantizationPolicy>(
  MODEL_QUANTIZATION_POLICIES.map((p) => [p.modelId, p])
);

/** Priority order for each constraint. */
const CONSTRAINT_PRIORITY: Record<
  "speed" | "quality" | "memory",
  QuantizationLevel[]
> = {
  speed: ["int4", "int8", "fp16", "fp32"],
  memory: ["int4", "int8", "fp16", "fp32"],
  quality: ["fp32", "fp16", "int8", "int4"],
};

/**
 * Select the best quantization level for a model given a runtime constraint.
 *
 * Walks the priority list for the constraint and returns the first level
 * that is in the model's allowedLevels set.
 * Falls back to the model's defaultLevel if no allowed level satisfies.
 */
export function selectQuantizationLevel(
  modelId: string,
  constraint: "speed" | "quality" | "memory"
): QuantizationLevel {
  const policy = POLICY_MAP.get(modelId);
  if (!policy) return "fp16"; // safe default for unknown models

  const priority = CONSTRAINT_PRIORITY[constraint];
  for (const level of priority) {
    if (policy.allowedLevels.includes(level)) return level;
  }
  return policy.defaultLevel;
}

/**
 * Estimate inference latency in milliseconds for a given model and quantization level.
 *
 * Based on empirical benchmarks on an NVIDIA A10G (24 GB VRAM).
 * Actual timing depends heavily on hardware, batch size, and input dimensions.
 *
 * Formula: baseCostMs * (inputSizeBytes / referenceBytes) / speedupFactor(level)
 */
export function estimateInferenceMs(
  modelId: string,
  level: QuantizationLevel,
  inputSizeBytes: number
): number {
  const policy = POLICY_MAP.get(modelId);

  // Base latency at fp32 for a 1 MB input (empirical A10G baseline)
  const BASE_MS_PER_MB: Record<string, number> = {
    "yolov8n-military": 8,
    "yolov8m-military": 25,
    "whisper-medium": 40,
    "whisper-large-v3": 90,
    "tesseract-ua-ocr": 15,
    "clip-vit-l14": 30,
    "geo-classifier-resnet50": 18,
  };

  const levelSpeedup: Record<QuantizationLevel, number> = {
    fp32: 1.0,
    fp16: 1.8,
    int8: 2.8,
    int4: 4.5,
  };

  const baseMsPerMb = BASE_MS_PER_MB[modelId] ?? 20;
  const speedup =
    policy && level !== policy.defaultLevel
      ? levelSpeedup[level]
      : (policy?.speedupFactor ?? levelSpeedup[level]);

  const inputMb = inputSizeBytes / (1024 * 1024);
  return Math.max(1, Math.round((baseMsPerMb * inputMb) / speedup));
}
