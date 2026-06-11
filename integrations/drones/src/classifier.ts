import { DroneModel, DroneOperator, FieldConfidence, DroneSubtype } from "./types";

/** Keyword → model mapping for text-based classification. */
const MODEL_KEYWORDS: Array<{ keywords: string[]; model: DroneModel; confidence: number }> = [
  { keywords: ["shahed-136", "shahed136", "шахед-136", "герань-2", "geran-2"], model: "shahed_136", confidence: 0.9 },
  { keywords: ["shahed-131", "shahed131", "шахед-131", "герань-1", "geran-1"], model: "shahed_131", confidence: 0.9 },
  { keywords: ["lancet-3", "lancet3", "ланцет-3", "lancet 3"], model: "lancet_3", confidence: 0.88 },
  { keywords: ["lancet-1", "lancet1", "ланцет-1", "lancet 1"], model: "lancet_1", confidence: 0.85 },
  { keywords: ["orlan-10", "орлан-10", "orlan 10"], model: "orlan_10", confidence: 0.87 },
  { keywords: ["orlan-30", "орлан-30", "orlan 30"], model: "orlan_30", confidence: 0.87 },
  { keywords: ["bayraktar", "байрактар", "tb-2", "tb2"], model: "bayraktar_tb2", confidence: 0.92 },
  { keywords: ["fpv", "фпв", "kamikaze drone", "дрон-камікадзе"], model: "fpv_kamikaze", confidence: 0.75 },
  { keywords: ["mavic", "мавік", "quadcopter", "квадрокоптер"], model: "mavic", confidence: 0.7 },
  { keywords: ["forpost", "форпост", "rb-341"], model: "rb_341_forpost", confidence: 0.88 },
  { keywords: ["zala", "зала"], model: "zala", confidence: 0.85 },
  { keywords: ["mugin", "мугін"], model: "mugin_5", confidence: 0.8 },
  { keywords: ["eleron", "елерон"], model: "eleron_3", confidence: 0.82 },
];

const OPERATOR_KEYWORDS: Array<{ keywords: string[]; operator: DroneOperator; confidence: number }> = [
  { keywords: ["russian", "рф", "росія", "вкс рф", "збройні сили рф"], operator: "ru_armed_forces", confidence: 0.8 },
  { keywords: ["ukrainian", "зсу", "ukraine", "ukrainian armed forces", "збройні сили україни"], operator: "ua_armed_forces", confidence: 0.8 },
  { keywords: ["volunteer", "волонтер", "добровольці"], operator: "ua_volunteer", confidence: 0.7 },
];

const SUBTYPE_KEYWORDS: Array<{ keywords: string[]; subtype: DroneSubtype }> = [
  { keywords: ["launched", "запущено", "launch", "взліт"], subtype: "launch" },
  { keywords: ["spotted", "sighted", "помічено", "зафіксовано", "в небі"], subtype: "sighting" },
  { keywords: ["shot down", "збито", "intercepted", "перехоплено", "знищено дрон"], subtype: "intercept" },
  { keywords: ["debris", "wreckage", "уламки", "залишки дрона"], subtype: "debris" },
  { keywords: ["swarm", "wave", "хвиля", "群", "multiple drones", "кілька дронів"], subtype: "swarm" },
  { keywords: ["reconnaissance", "recon", "розвідка", "surveillance", "спостереження"], subtype: "recon" },
];

/** Classify a drone model from free text. */
export function classifyModel(text: string): FieldConfidence | undefined {
  const lower = text.toLowerCase();
  for (const { keywords, model, confidence } of MODEL_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { value: model, confidence, sourceCount: 1 };
    }
  }
  return undefined;
}

/** Classify operator from free text. */
export function classifyOperator(text: string): FieldConfidence | undefined {
  const lower = text.toLowerCase();
  for (const { keywords, operator, confidence } of OPERATOR_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { value: operator, confidence, sourceCount: 1 };
    }
  }
  return undefined;
}

/** Classify event subtype from free text. */
export function classifySubtype(text: string): DroneSubtype {
  const lower = text.toLowerCase();
  for (const { keywords, subtype } of SUBTYPE_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return subtype;
    }
  }
  return "sighting"; // default
}

/** Determine severity based on subtype and model. */
export function deriveSeverity(subtype: DroneSubtype, model?: string): 1 | 2 | 3 | 4 | 5 {
  if (subtype === "swarm") return 5;
  if (subtype === "launch") {
    if (model === "shahed_136" || model === "shahed_131") return 5;
    if (model === "lancet_3" || model === "lancet_1") return 4;
    return 3;
  }
  if (subtype === "intercept") return 2;
  if (subtype === "debris") return 1;
  if (subtype === "recon") return 2;
  return 3; // sighting
}

// ── Visual silhouette classification (model contract + heuristic baseline) ────
//
// A production system fine-tunes a CV model on UAV silhouettes (Shahed, Lancet,
// Orlan, Bayraktar, FPV). We cannot train that here, so we define the *contract*
// a visual classifier must satisfy (`VisualDroneClassifier`) plus a heuristic
// baseline (`classifyModelFromSilhouette`) that scores extracted silhouette
// features against per-model templates. Mirrors the keyword-heuristic above and
// the missiles-classifier style: typed input → confidence schema out.

/** Coarse silhouette features extractable from a detected drone bounding box. */
export interface DroneSilhouetteFeatures {
  /** Bounding-box width / height. */
  aspectRatio: number;
  /** Wingspan estimate in metres (from range + angular size), if available. */
  wingspanM?: number;
  /** Planform shape cue. */
  planform?: "delta" | "straight_wing" | "x_quad" | "twin_boom" | "cruciform";
  /** Whether a tail/pusher-prop signature is visible. */
  hasTailProp?: boolean;
}

/** Per-model silhouette template for the heuristic baseline. */
interface SilhouetteTemplate {
  model: DroneModel;
  aspectRange: [number, number];
  wingspanRangeM?: [number, number];
  planform?: DroneSilhouetteFeatures["planform"];
  baseConfidence: number;
}

const SILHOUETTE_TEMPLATES: SilhouetteTemplate[] = [
  { model: "shahed_136", aspectRange: [1.6, 2.6], wingspanRangeM: [2.2, 2.8], planform: "delta", baseConfidence: 0.78 },
  { model: "shahed_131", aspectRange: [1.5, 2.4], wingspanRangeM: [2.0, 2.6], planform: "delta", baseConfidence: 0.74 },
  { model: "lancet_3", aspectRange: [1.0, 1.6], wingspanRangeM: [1.2, 1.8], planform: "cruciform", baseConfidence: 0.7 },
  { model: "orlan_10", aspectRange: [1.2, 2.0], wingspanRangeM: [2.8, 3.4], planform: "straight_wing", baseConfidence: 0.72 },
  { model: "bayraktar_tb2", aspectRange: [1.4, 2.2], wingspanRangeM: [11, 13], planform: "twin_boom", baseConfidence: 0.8 },
  { model: "fpv_kamikaze", aspectRange: [0.8, 1.2], wingspanRangeM: [0.2, 0.6], planform: "x_quad", baseConfidence: 0.6 },
];

/**
 * Contract that any visual drone classifier (heuristic or ML) must implement.
 * The confidence schema is identical to `FieldConfidence` so downstream fusion
 * (`mergeConfidence`) works regardless of which classifier produced the result.
 */
export interface VisualDroneClassifier {
  readonly id: string;
  readonly version: string;
  /** Models this classifier can distinguish. */
  readonly supportedModels: DroneModel[];
  classify(features: DroneSilhouetteFeatures): FieldConfidence | undefined;
}

/** Heuristic baseline: score silhouette features against per-model templates. */
export function classifyModelFromSilhouette(
  features: DroneSilhouetteFeatures,
): FieldConfidence | undefined {
  let best: { model: DroneModel; score: number } | undefined;

  for (const tpl of SILHOUETTE_TEMPLATES) {
    let score = 0;
    const [aLo, aHi] = tpl.aspectRange;
    if (features.aspectRatio >= aLo && features.aspectRatio <= aHi) score += 0.4;

    if (tpl.wingspanRangeM && features.wingspanM != null) {
      const [wLo, wHi] = tpl.wingspanRangeM;
      if (features.wingspanM >= wLo && features.wingspanM <= wHi) score += 0.4;
    }
    if (tpl.planform && features.planform && tpl.planform === features.planform) score += 0.2;

    if (score > 0 && (!best || score > best.score)) best = { model: tpl.model, score };
  }

  if (!best) return undefined;
  const tpl = SILHOUETTE_TEMPLATES.find((t) => t.model === best!.model)!;
  return {
    value: best.model,
    confidence: parseFloat((tpl.baseConfidence * best.score).toFixed(3)),
    sourceCount: 1,
  };
}

/** Reference implementation of the visual-classifier contract. */
export const heuristicSilhouetteClassifier: VisualDroneClassifier = {
  id: "silhouette_heuristic",
  version: "0.1.0",
  supportedModels: SILHOUETTE_TEMPLATES.map((t) => t.model),
  classify: classifyModelFromSilhouette,
};

/** Merge two FieldConfidence values (weighted by sourceCount). */
export function mergeConfidence(a: FieldConfidence, b: FieldConfidence): FieldConfidence {
  const total = a.sourceCount + b.sourceCount;
  const merged = (a.confidence * a.sourceCount + b.confidence * b.sourceCount) / total;
  // If both agree on value, use merged; if disagree, keep higher confidence
  const value = a.value === b.value ? a.value : a.confidence >= b.confidence ? a.value : b.value;
  return { value, confidence: merged, sourceCount: total };
}
