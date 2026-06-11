/**
 * Detection heuristic baselines (Detection cluster).
 *
 * Five detectors, all as the repo's codeable contract (see
 * integrations/missiles/src/classifier.ts): a typed input/output, a calibrated
 * confidence, and a HEURISTIC baseline that runs until the real model ships.
 *
 *   1. detectObjects        — military-equipment object detection (YOLOv8/RT-DETR target)
 *   2. identifyAircraft     — aircraft / drone identification
 *   3. classifyVessel       — naval vessel classification
 *   4. assessDamage         — damage / fire / smoke classifier
 *   5. classifyVegetation   — vegetation / season classifier (video forensics)
 *
 * === MODEL WEIGHTS PENDING (all five) ===
 * The vision networks are NOT trained. Each heuristic here scores from cheap,
 * available signals — caption/OCR text keywords, EXIF, simple colour/shape priors
 * passed in by the caller — using the SAME label vocabulary the trained model will
 * emit (defined in `model-registry.ts`). When weights ship, swap the heuristic body
 * for inference; the interface and the `CalibratedConfidence` contract stay.
 *
 * High-stakes detectors (military equipment, aircraft, vessels, damage that would
 * drive a strike-claim event) set `requiresHumanReview` — see `human-review.ts`
 * and COMPLIANCE.md. NONE of these detectors perform biometric identification of
 * people; person regions are only for privacy blurring (`privacy.ts`).
 */

import {
  AircraftClass,
  AircraftIdResult,
  BoundingBox,
  DamageAssessmentResult,
  DamageClass,
  DetectedObject,
  DetectedObjectClass,
  ObjectDetectionResult,
  RiskTier,
  SeasonClass,
  VegetationSeasonResult,
  VesselClass,
  VesselClassResult,
} from "./types";
import { calibrate } from "./confidence";

/** Optional cheap signals the caller can pass to bias the heuristic. */
export interface DetectorContext {
  /** Caption / channel text accompanying the media. */
  text?: string;
  /** OCR text already extracted from the image. */
  ocrText?: string;
  /** Capture month (1–12), e.g. from EXIF, for cross-checking season. */
  captureMonth?: number;
  /** Whether the caller's cheap colour analysis saw lots of green (foliage). */
  greenFraction?: number;
  /** Whether snow/white-ground was detected. */
  whiteGroundFraction?: number;
}

interface Pattern<T> {
  keywords: string[];
  value: T;
  raw: number;
  cues: string[];
}

function hay(ctx: DetectorContext): string {
  return `${ctx.text ?? ""} ${ctx.ocrText ?? ""}`.toLowerCase();
}

function matched<T>(text: string, patterns: Pattern<T>[]): Array<Pattern<T> & { hits: string[] }> {
  const out: Array<Pattern<T> & { hits: string[] }> = [];
  for (const p of patterns) {
    const hits = p.keywords.filter((k) => text.includes(k));
    if (hits.length) out.push({ ...p, hits });
  }
  return out.sort((a, b) => b.raw + b.hits.length * 0.01 - (a.raw + a.hits.length * 0.01));
}

// ── 1. Object detection (military equipment) ────────────────────────────────────

const OBJECT_PATTERNS: Pattern<DetectedObjectClass>[] = [
  { keywords: ["tank", "танк", "т-72", "т-80", "т-90"], value: "military_vehicle", raw: 0.62, cues: ["tracked-vehicle keyword"] },
  { keywords: ["bmp", "btr", "бмп", "бтр", "apc", "ifv"], value: "military_vehicle", raw: 0.6, cues: ["armoured-vehicle keyword"] },
  { keywords: ["shahed", "шахед", "geran", "герань"], value: "drone_shahed", raw: 0.68, cues: ["shahed keyword"] },
  { keywords: ["fpv", "фпв"], value: "drone_fpv", raw: 0.6, cues: ["fpv keyword"] },
  { keywords: ["orlan", "орлан"], value: "drone_orlan", raw: 0.62, cues: ["orlan keyword"] },
  { keywords: ["quadcopter", "mavic", "коптер", "квадрокоптер"], value: "drone_quadcopter", raw: 0.55, cues: ["quadcopter keyword"] },
  { keywords: ["missile", "ракета", "rocket"], value: "missile", raw: 0.55, cues: ["missile keyword"] },
  { keywords: ["explosion", "вибух", "blast"], value: "explosion", raw: 0.55, cues: ["explosion keyword"] },
  { keywords: ["fire", "пожежа", "вогонь", "горить"], value: "fire", raw: 0.55, cues: ["fire keyword"] },
  { keywords: ["smoke", "дим", "задимлення"], value: "smoke", raw: 0.5, cues: ["smoke keyword"] },
  { keywords: ["crater", "вирва", "воронка"], value: "crater", raw: 0.55, cues: ["crater keyword"] },
  { keywords: ["destroyed building", "зруйнован", "damaged building", "пошкоджен"], value: "damaged_building", raw: 0.5, cues: ["damaged-building keyword"] },
  { keywords: ["s-300", "buk", "бук", "pantsir", "панцир", "sam launcher"], value: "weapon_system", raw: 0.6, cues: ["air-defence keyword"] },
];

const WHOLE_FRAME: BoundingBox = { x: 0, y: 0, w: 1, h: 1 };
const HIGH_STAKES_OBJECTS: Set<DetectedObjectClass> = new Set([
  "military_vehicle", "weapon_system", "missile", "drone_shahed", "drone_orlan",
]);

const OBJ_MODEL_ID = "obj-det-mil-v0";

/**
 * Heuristic military-equipment object detection.
 * Returns whole-frame "weak" detections from text cues until the vision model ships.
 */
export function detectObjects(mediaId: string, ctx: DetectorContext = {}): ObjectDetectionResult {
  const start = Date.now();
  const text = hay(ctx);
  const found = matched(text, OBJECT_PATTERNS);
  const seen = new Set<DetectedObjectClass>();
  const objects: DetectedObject[] = [];
  for (const m of found) {
    if (seen.has(m.value)) continue;
    seen.add(m.value);
    objects.push({
      class: m.value,
      confidence: calibrate(m.raw, OBJ_MODEL_ID).calibrated,
      boundingBox: WHOLE_FRAME,
      modelId: OBJ_MODEL_ID,
    });
  }
  if (objects.length === 0) {
    objects.push({ class: "unknown", confidence: calibrate(0.2, OBJ_MODEL_ID).calibrated, boundingBox: WHOLE_FRAME, modelId: OBJ_MODEL_ID });
  }
  return {
    mediaId,
    objects,
    processingMs: Date.now() - start,
    modelVersion: `${OBJ_MODEL_ID} (heuristic stub — vision weights pending)`,
  };
}

/** Whether an object-detection result should be gated behind human review. */
export function objectDetectionRequiresReview(result: ObjectDetectionResult): boolean {
  return result.objects.some((o) => HIGH_STAKES_OBJECTS.has(o.class));
}

// ── 2. Aircraft / drone identification ──────────────────────────────────────────

const AIRCRAFT_PATTERNS: Array<Pattern<AircraftClass> & { label: { en: string; uk: string } }> = [
  { keywords: ["shahed-136", "shahed 136", "shahed", "шахед", "geran-2", "герань"], value: "shahed_136", raw: 0.66, cues: ["shahed delta-wing"], label: { en: "Shahed-136 / Geran-2", uk: "Шахед-136 / Герань-2" } },
  { keywords: ["shahed-131", "shahed 131"], value: "shahed_131", raw: 0.6, cues: ["shahed-131"], label: { en: "Shahed-131", uk: "Шахед-131" } },
  { keywords: ["lancet", "ланцет"], value: "lancet", raw: 0.62, cues: ["loitering munition"], label: { en: "Lancet loitering munition", uk: "Баражуючий боєприпас «Ланцет»" } },
  { keywords: ["orlan", "орлан", "orlan-10"], value: "orlan_10", raw: 0.62, cues: ["recon UAV"], label: { en: "Orlan-10 recon UAV", uk: "Розвідувальний БпЛА «Орлан-10»" } },
  { keywords: ["fpv", "фпв"], value: "fpv_drone", raw: 0.55, cues: ["fpv"], label: { en: "FPV drone", uk: "FPV-дрон" } },
  { keywords: ["mavic", "quadcopter", "квадрокоптер", "коптер"], value: "quadcopter_recon", raw: 0.5, cues: ["quadcopter"], label: { en: "Recon quadcopter", uk: "Розвідувальний квадрокоптер" } },
  { keywords: ["su-34", "су-34"], value: "su_34", raw: 0.62, cues: ["fighter-bomber"], label: { en: "Su-34 fighter-bomber", uk: "Винищувач-бомбардувальник Су-34" } },
  { keywords: ["su-35", "су-35"], value: "su_35", raw: 0.6, cues: ["fighter"], label: { en: "Su-35 fighter", uk: "Винищувач Су-35" } },
  { keywords: ["ka-52", "ка-52", "alligator", "алігатор"], value: "ka_52_helicopter", raw: 0.62, cues: ["attack helicopter"], label: { en: "Ka-52 attack helicopter", uk: "Ударний гелікоптер Ка-52" } },
  { keywords: ["mig-31", "міг-31", "mig31"], value: "mig_31", raw: 0.6, cues: ["interceptor / Kinzhal carrier"], label: { en: "MiG-31 (Kinzhal carrier)", uk: "МіГ-31 (носій «Кинджал»)" } },
  { keywords: ["cruise missile", "крилата ракета", "kalibr", "kh-101", "х-101"], value: "cruise_missile_airframe", raw: 0.55, cues: ["cruise-missile airframe"], label: { en: "Cruise-missile airframe", uk: "Корпус крилатої ракети" } },
];

const AIRCRAFT_MODEL_ID = "aircraft-id-v0";

export function identifyAircraft(mediaId: string, ctx: DetectorContext = {}): AircraftIdResult {
  const start = Date.now();
  const text = hay(ctx);
  const found = matched(text, AIRCRAFT_PATTERNS as Pattern<AircraftClass>[]) as Array<Pattern<AircraftClass> & { hits: string[]; label: { en: string; uk: string } }>;
  const candidates = found.slice(0, 5).map((m) => ({
    class: m.value,
    label: m.label,
    confidence: calibrate(m.raw, AIRCRAFT_MODEL_ID),
    cues: m.cues,
  }));
  if (candidates.length === 0) {
    candidates.push({
      class: "unknown",
      label: { en: "Unidentified airframe", uk: "Невстановлений літальний апарат" },
      confidence: calibrate(0.15, AIRCRAFT_MODEL_ID),
      cues: ["no recognizable cues"],
    });
  }
  const top = candidates[0].class;
  return {
    mediaId,
    candidates,
    top,
    riskTier: "high_stakes",
    requiresHumanReview: true, // airframe ID drives strike/threat claims
    modelVersion: `${AIRCRAFT_MODEL_ID} (heuristic stub — weights pending)`,
    processingMs: Date.now() - start,
  };
}

// ── 3. Vessel classification ─────────────────────────────────────────────────────

const VESSEL_PATTERNS: Array<Pattern<VesselClass> & { label: { en: string; uk: string }; military: boolean }> = [
  { keywords: ["frigate", "destroyer", "corvette", "warship", "корвет", "фрегат", "корабель"], value: "warship_surface_combatant", raw: 0.6, cues: ["surface combatant"], military: true, label: { en: "Surface combatant", uk: "Надводний бойовий корабель" } },
  { keywords: ["submarine", "підводний човен", "submarine kilo", "kilo-class"], value: "submarine", raw: 0.62, cues: ["submarine hull"], military: true, label: { en: "Submarine", uk: "Підводний човен" } },
  { keywords: ["landing ship", "ropucha", "великий десантний", "bdk", "бдк"], value: "landing_ship", raw: 0.6, cues: ["landing ship"], military: true, label: { en: "Landing ship", uk: "Десантний корабель" } },
  { keywords: ["patrol boat", "катер", "raptor", "раптор"], value: "patrol_boat", raw: 0.55, cues: ["patrol boat"], military: true, label: { en: "Patrol boat", uk: "Патрульний катер" } },
  { keywords: ["missile corvette", "buyan", "буян", "karakurt", "каракурт"], value: "missile_corvette", raw: 0.6, cues: ["missile corvette"], military: true, label: { en: "Missile corvette", uk: "Ракетний корвет" } },
  { keywords: ["usv", "naval drone", "морський дрон", "magura", "sea baby"], value: "naval_drone_usv", raw: 0.62, cues: ["uncrewed surface vessel"], military: true, label: { en: "Naval surface drone (USV)", uk: "Морський надводний дрон" } },
  { keywords: ["cargo", "container", "суховантаж", "bulk carrier"], value: "cargo_civilian", raw: 0.5, cues: ["merchant cargo"], military: false, label: { en: "Civilian cargo vessel", uk: "Цивільне вантажне судно" } },
  { keywords: ["tanker", "танкер", "oil tanker"], value: "tanker_civilian", raw: 0.5, cues: ["tanker"], military: false, label: { en: "Civilian tanker", uk: "Цивільний танкер" } },
  { keywords: ["fishing", "trawler", "риболов"], value: "fishing_civilian", raw: 0.45, cues: ["fishing vessel"], military: false, label: { en: "Fishing vessel", uk: "Рибальське судно" } },
];

const VESSEL_MODEL_ID = "vessel-class-v0";

export function classifyVessel(mediaId: string, ctx: DetectorContext = {}): VesselClassResult {
  const start = Date.now();
  const text = hay(ctx);
  const found = matched(text, VESSEL_PATTERNS as Pattern<VesselClass>[]) as Array<Pattern<VesselClass> & { hits: string[]; label: { en: string; uk: string }; military: boolean }>;
  const candidates = found.slice(0, 5).map((m) => ({
    class: m.value,
    label: m.label,
    isMilitary: m.military,
    confidence: calibrate(m.raw, VESSEL_MODEL_ID),
    cues: m.cues,
  }));
  if (candidates.length === 0) {
    candidates.push({
      class: "unknown",
      label: { en: "Unclassified vessel", uk: "Некласифіковане судно" },
      isMilitary: false,
      confidence: calibrate(0.15, VESSEL_MODEL_ID),
      cues: ["no recognizable cues"],
    });
  }
  const top = candidates[0].class;
  const military = candidates[0].isMilitary;
  return {
    mediaId,
    candidates,
    top,
    riskTier: military ? "high_stakes" : "advisory",
    requiresHumanReview: military,
    modelVersion: `${VESSEL_MODEL_ID} (heuristic stub — weights pending)`,
    processingMs: Date.now() - start,
  };
}

// ── 4. Damage / fire / smoke assessment ──────────────────────────────────────────

const DAMAGE_PATTERNS: Array<Pattern<DamageClass> & { label: { en: string; uk: string }; sev: number }> = [
  { keywords: ["fire", "пожежа", "вогонь", "горить", "blaze"], value: "fire_active", raw: 0.58, cues: ["active fire keyword"], sev: 3, label: { en: "Active fire", uk: "Активна пожежа" } },
  { keywords: ["smoke", "дим", "задимлення", "plume"], value: "smoke_plume", raw: 0.55, cues: ["smoke keyword"], sev: 2, label: { en: "Smoke plume", uk: "Стовп диму" } },
  { keywords: ["collapse", "обвал", "обвалилася", "rubble"], value: "structural_collapse", raw: 0.6, cues: ["collapse keyword"], sev: 4, label: { en: "Structural collapse", uk: "Обвалення конструкцій" } },
  { keywords: ["facade", "вікна вибиті", "blown out windows", "пошкоджений фасад"], value: "facade_damage", raw: 0.5, cues: ["facade keyword"], sev: 2, label: { en: "Facade damage", uk: "Пошкодження фасаду" } },
  { keywords: ["crater", "вирва", "воронка"], value: "crater", raw: 0.55, cues: ["crater keyword"], sev: 3, label: { en: "Crater", uk: "Вирва" } },
  { keywords: ["burnt", "burned out", "вигорів", "згорів"], value: "burnt_out", raw: 0.55, cues: ["burnt-out keyword"], sev: 3, label: { en: "Burnt-out structure", uk: "Вигоріла споруда" } },
  { keywords: ["debris", "уламки", "wreckage"], value: "debris_field", raw: 0.5, cues: ["debris keyword"], sev: 2, label: { en: "Debris field", uk: "Поле уламків" } },
];

const DAMAGE_MODEL_ID = "damage-assess-v0";

export function assessDamage(mediaId: string, ctx: DetectorContext = {}): DamageAssessmentResult {
  const start = Date.now();
  const text = hay(ctx);
  const found = matched(text, DAMAGE_PATTERNS as Pattern<DamageClass>[]) as Array<Pattern<DamageClass> & { hits: string[]; label: { en: string; uk: string }; sev: number }>;
  const seen = new Set<DamageClass>();
  const classes = found
    .filter((m) => (seen.has(m.value) ? false : (seen.add(m.value), true)))
    .map((m) => ({ class: m.value, label: m.label, confidence: calibrate(m.raw, DAMAGE_MODEL_ID) }));
  if (classes.length === 0) {
    classes.push({ class: "intact", label: { en: "No damage detected", uk: "Пошкоджень не виявлено" }, confidence: calibrate(0.3, DAMAGE_MODEL_ID) });
  }
  const severityEstimate = Math.min(4, Math.max(0, ...found.map((m) => m.sev), 0)) as 0 | 1 | 2 | 3 | 4;
  const riskTier: RiskTier = severityEstimate >= 3 ? "high_stakes" : "advisory";
  return {
    mediaId,
    classes,
    severityEstimate,
    riskTier,
    requiresHumanReview: severityEstimate >= 3,
    modelVersion: `${DAMAGE_MODEL_ID} (heuristic stub — segmentation weights pending)`,
    processingMs: Date.now() - start,
  };
}

// ── 5. Vegetation / season classifier (video forensics) ──────────────────────────

const VEG_MODEL_ID = "veg-season-v0";

const SEASON_LABELS: Record<SeasonClass, { en: string; uk: string }> = {
  winter: { en: "Winter", uk: "Зима" },
  early_spring: { en: "Early spring", uk: "Рання весна" },
  spring: { en: "Spring", uk: "Весна" },
  summer: { en: "Summer", uk: "Літо" },
  autumn: { en: "Autumn", uk: "Осінь" },
  unknown: { en: "Unknown season", uk: "Невідомий сезон" },
};

const SEASON_MONTHS: Record<SeasonClass, number[]> = {
  winter: [12, 1, 2],
  early_spring: [3, 4],
  spring: [4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
  unknown: [],
};

/**
 * Vegetation / season classifier. Used to catch recycled footage: a clip claimed
 * to be "today" but showing bare trees + snow when the claimed date is July is a
 * forensic red flag. Heuristic uses cheap colour fractions + text; the trained
 * model will read foliage density, snow cover, crop stage from pixels.
 */
export function classifyVegetation(mediaId: string, ctx: DetectorContext = {}): VegetationSeasonResult {
  const start = Date.now();
  const text = hay(ctx);
  const snow = (ctx.whiteGroundFraction ?? 0) > 0.3 || /snow|сніг|зима|winter/.test(text);
  const green = (ctx.greenFraction ?? 0) > 0.35 || /green|зелен|foliage|листя/.test(text);
  const autumnCue = /autumn|fall leaves|жовт.* лист|осінь/.test(text);

  let season: SeasonClass = "unknown";
  let raw = 0.35;
  const cues: string[] = [];
  if (snow) { season = "winter"; raw = 0.6; cues.push("snow / white ground"); }
  else if (autumnCue) { season = "autumn"; raw = 0.5; cues.push("autumn-foliage cue"); }
  else if (green) { season = "summer"; raw = 0.5; cues.push("dense green foliage"); }
  else { season = "early_spring"; raw = 0.4; cues.push("sparse/bare vegetation, no snow"); }

  const foliagePresent = green ? true : snow ? false : undefined;
  return {
    mediaId,
    season,
    seasonLabel: SEASON_LABELS[season],
    foliagePresent,
    snowPresent: snow || undefined,
    confidence: calibrate(raw, VEG_MODEL_ID),
    consistentMonths: SEASON_MONTHS[season],
    cues,
    processingMs: Date.now() - start,
  };
}

/**
 * Cross-check a detected season against a claimed capture month.
 * Returns a forensic flag when they are inconsistent (e.g. snow in a July clip).
 */
export function seasonInconsistencyFlag(
  result: VegetationSeasonResult,
  claimedMonth: number,
): { inconsistent: boolean; note: { en: string; uk: string } } | undefined {
  if (result.season === "unknown" || !result.consistentMonths.length) return undefined;
  const inconsistent = !result.consistentMonths.includes(claimedMonth);
  if (!inconsistent) return undefined;
  return {
    inconsistent: true,
    note: {
      en: `Visible season (${result.season}) is inconsistent with claimed month ${claimedMonth} — possible recycled/old footage.`,
      uk: `Видимий сезон (${result.season}) не відповідає заявленому місяцю ${claimedMonth} — можливо, перевикористане/старе відео.`,
    },
  };
}
