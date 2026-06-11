/**
 * Equipment-model identification.
 *
 * Two cooperating identifiers, both resolving to the canonical EquipmentClass /
 * EquipmentModel taxonomy in `types.ts`:
 *
 *   1. `classifyEquipmentText` — a keyword heuristic baseline over the post text
 *      (be/ru/uk/en), mirroring the missiles-classifier style. Always available,
 *      offline, explainable.
 *   2. `VisionClassifier` — a typed interface for a real vision pipeline that
 *      classifies attached imagery (military trains on flatcars, aircraft on
 *      aprons, SAM TELs). The codeable contract: the interface + a heuristic
 *      `BaselineVisionClassifier` that returns "needs a real model" rather than
 *      fabricating a result, so wiring a CV model in later reshapes nothing.
 *
 * `identifyEquipment` fuses text + (optional) vision into one classification,
 * preferring the higher-confidence signal and unioning their matched cues.
 */

import type { EquipmentClass, EquipmentModel, EquipmentClassification } from "./types";

// ── Text heuristic baseline (missiles-classifier style) ───────────────────────

const CLASS_PATTERNS: Array<{ keywords: string[]; cls: EquipmentClass; confidence: number }> = [
  { keywords: ["эшалон", "эшелон", "ешелон", "echelon", "платформ", "flatcar", "flat car", "railcar"], cls: "rail_echelon", confidence: 0.75 },
  { keywords: ["танк", "tank", "т-72", "t-72", "т-80", "t-80", "т-90", "t-90", "бмп", "bmp", "бтр", "btr", "armor", "armour", "бронетэхніка", "бронетехника"], cls: "armor", confidence: 0.7 },
  { keywords: ["с-300", "s-300", "с-400", "s-400", "панцыр", "панцирь", "pantsir", "тор", "tor", "бук", "buk", "зенітн", "зенитн", "sam"], cls: "sam_system", confidence: 0.75 },
  { keywords: ["іскандэр", "искандер", "iskander", "tel", "ракетны комплекс", "ракетный комплекс", "ballistic"], cls: "missile_system", confidence: 0.8 },
  { keywords: ["су-34", "su-34", "су-35", "su-35", "су-25", "su-25", "су-24", "su-24", "міг-31", "миг-31", "mig-31", "ту-22", "tu-22", "ту-95", "tu-95", "самалёт", "самолет", "літак", "aircraft", "jet"], cls: "aircraft", confidence: 0.75 },
  { keywords: ["верталёт", "вертолет", "гелікоптер", "helicopter", "ка-52", "ka-52", "мі-24", "ми-24", "mi-24", "мі-8", "ми-8", "mi-8"], cls: "helicopter", confidence: 0.75 },
  { keywords: ["shahed", "шахед", "geran", "герань", "бпла", "uav", "drone", "дрон"], cls: "uav", confidence: 0.75 },
  { keywords: ["паліва", "топливо", "паливо", "fuel", "пол", "tanker", "цістэрн", "цистерн", "лагістык", "логистик", "логістик", "logistics", "supply"], cls: "fuel_logistics", confidence: 0.65 },
  { keywords: ["асабовы склад", "личный состав", "особовий склад", "personnel", "troops", "войск"], cls: "personnel", confidence: 0.6 },
];

const MODEL_PATTERNS: Array<{ keywords: string[]; model: EquipmentModel }> = [
  { keywords: ["т-72", "t-72", "t72"], model: "t72" },
  { keywords: ["т-80", "t-80", "t80"], model: "t80" },
  { keywords: ["т-90", "t-90", "t90"], model: "t90" },
  { keywords: ["бмп", "bmp"], model: "bmp" },
  { keywords: ["бтр", "btr"], model: "btr" },
  { keywords: ["с-300", "s-300", "s300"], model: "s300" },
  { keywords: ["с-400", "s-400", "s400"], model: "s400" },
  { keywords: ["панцыр", "панцирь", "pantsir"], model: "pantsir" },
  { keywords: ["тор-м", "tor-m", "тор "], model: "tor" },
  { keywords: ["бук", "buk"], model: "buk" },
  { keywords: ["іскандэр-м", "искандер-м", "iskander-m"], model: "iskander_m" },
  { keywords: ["іскандэр-к", "искандер-к", "iskander-k"], model: "iskander_k" },
  { keywords: ["су-24", "su-24"], model: "su24" },
  { keywords: ["су-25", "su-25"], model: "su25" },
  { keywords: ["су-34", "su-34"], model: "su34" },
  { keywords: ["су-35", "su-35"], model: "su35" },
  { keywords: ["міг-31", "миг-31", "mig-31"], model: "mig31" },
  { keywords: ["ту-22", "tu-22"], model: "tu22m3" },
  { keywords: ["ту-95", "tu-95"], model: "tu95" },
  { keywords: ["ту-160", "tu-160"], model: "tu160" },
  { keywords: ["ка-52", "ka-52"], model: "ka52" },
  { keywords: ["мі-24", "ми-24", "mi-24"], model: "mi24" },
  { keywords: ["мі-8", "ми-8", "mi-8"], model: "mi8" },
  { keywords: ["shahed", "шахед", "geran", "герань"], model: "shahed_geran" },
];

const COUNT_RE = /(\d{1,3})\s*(?:платформ|flatcar|flat car|railcar|танк|tank|единиц|одзінак|adzinak|units?)/iu;

/** Heuristic text classifier → EquipmentClassification. */
export function classifyEquipmentText(text: string): EquipmentClassification {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  let cls: EquipmentClass = "other";
  let confidence = 0.3;
  for (const p of CLASS_PATTERNS) {
    const hit = p.keywords.find((k) => lower.includes(k));
    if (hit) {
      cls = p.cls;
      confidence = p.confidence;
      matched.push(hit);
      break;
    }
  }

  let model: EquipmentModel | undefined;
  for (const p of MODEL_PATTERNS) {
    const hit = p.keywords.find((k) => lower.includes(k));
    if (hit) {
      model = p.model;
      matched.push(hit);
      break;
    }
  }

  const countMatch = COUNT_RE.exec(text);
  const count = countMatch ? parseInt(countMatch[1], 10) : undefined;

  return { class: cls, model, count, confidence, matched };
}

// ── Vision pipeline (typed contract + heuristic baseline) ─────────────────────

export interface VisionInput {
  /** Image URL or opaque reference the CV worker can fetch. */
  imageUrl: string;
  /** Optional accompanying caption text (used as a weak prior). */
  caption?: string;
}

export interface VisionResult {
  class: EquipmentClass;
  model?: EquipmentModel;
  count?: number;
  /** 0–1 model confidence. */
  confidence: number;
  /** Whether a REAL model produced this (false = baseline stub, needs a model). */
  fromModel: boolean;
  matched: string[];
}

/** Pluggable vision classifier. Swap the baseline for a real CV model. */
export interface VisionClassifier {
  classify(input: VisionInput): Promise<VisionResult>;
}

/**
 * Baseline: NO real CV. It will not fabricate a hull/airframe id from pixels;
 * it only leans on the caption (if any) via the text heuristic and honestly
 * marks `fromModel: false`. This is the codeable contract for "vision pipeline":
 * the seam is in place; a real classifier (e.g. an ONNX detector) drops in here.
 */
export class BaselineVisionClassifier implements VisionClassifier {
  async classify(input: VisionInput): Promise<VisionResult> {
    if (input.caption && input.caption.trim()) {
      const t = classifyEquipmentText(input.caption);
      return {
        class: t.class,
        model: t.model,
        count: t.count,
        confidence: Math.min(0.5, t.confidence), // capped: caption, not imagery
        fromModel: false,
        matched: ["caption:" + t.matched.join("+")],
      };
    }
    return { class: "other", confidence: 0, fromModel: false, matched: [] };
  }
}

export const defaultVisionClassifier: VisionClassifier = new BaselineVisionClassifier();

/**
 * Fuse text + optional vision into one classification. Prefers the higher-
 * confidence signal; if vision came from a real model it wins ties. Counts and
 * models are filled from whichever signal supplied them.
 */
export async function identifyEquipment(
  text: string,
  images: VisionInput[] = [],
  vision: VisionClassifier = defaultVisionClassifier,
): Promise<EquipmentClassification> {
  const textCls = classifyEquipmentText(text);

  let bestVision: VisionResult | undefined;
  for (const img of images) {
    const v = await vision.classify(img);
    if (!bestVision || v.confidence > bestVision.confidence) bestVision = v;
  }

  if (
    bestVision &&
    (bestVision.confidence > textCls.confidence ||
      (bestVision.fromModel && bestVision.confidence >= textCls.confidence))
  ) {
    return {
      class: bestVision.class !== "other" ? bestVision.class : textCls.class,
      model: bestVision.model ?? textCls.model,
      count: bestVision.count ?? textCls.count,
      confidence: Math.max(bestVision.confidence, textCls.confidence),
      matched: [...textCls.matched, ...bestVision.matched],
    };
  }

  return textCls;
}
