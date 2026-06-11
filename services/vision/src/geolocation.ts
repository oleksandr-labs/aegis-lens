/**
 * LLM-assisted multimodal geolocation (Geolocation AI cluster) — the project's
 * competitive moat (per TODO_vision.md "invest heavily").
 *
 * Pipeline contract:
 *   1. extractClues()  — gather geolocation clues from every available modality:
 *                        OCR text/signage, EXIF GPS, shadow/sun-angle output,
 *                        terrain/architecture cues, reverse-image landmark hits.
 *   2. proposeCandidates() — fuse clues into ranked, confidence-scored lat/lon
 *                        candidates with an uncertainty radius.
 *   3. geolocate()     — the orchestrator that assembles a GeolocationAiResult.
 *
 * The "LLM-assisted" reasoning step (cross-referencing extracted clues against
 * map/gazetteer knowledge, the way a human OSINT geolocator chains a road sign +
 * a building shape + the sun) is delivered as a typed PROMPT CONTRACT
 * (`buildGeolocationPrompt`) plus a deterministic fusion fallback. The actual model
 * call is made by the worker via the LLM provider abstraction.
 *
 * House default model: latest Claude (Opus 4.x for hard reasoning, Sonnet 4.x for
 * routine fusion) — NEVER hardcode an old model id; the worker resolves the live id.
 *
 * SAFETY: geolocation is targeting-adjacent. `requiresHumanReview` is ALWAYS true;
 * AI geolocation NEVER auto-publishes a coordinate to a public event. See COMPLIANCE.md.
 */

import {
  BilingualLabel,
  GeolocClue,
  GeolocationAiResult,
  GeolocationCandidate,
  OcrResult,
  ExifResult,
  SunAngleResult,
  CalibratedConfidence,
} from "./types";
import { calibrate } from "./confidence";

const GEO_MODEL_ID = "img-embed-v0"; // calibrator namespace for geo confidences

/** Inputs gathered from upstream vision tasks for one piece of media. */
export interface GeolocationInputs {
  mediaId: string;
  ocr?: OcrResult;
  exif?: ExifResult;
  sunAngle?: SunAngleResult;
  /** Reverse-image landmark matches with coordinates, if any. */
  landmarkMatches?: Array<{ lat: number; lon: number; place?: BilingualLabel; similarity: number }>;
  /** Free-text caption / channel context. */
  caption?: string;
}

// ── 1. Clue extraction ──────────────────────────────────────────────────────────

const SIGNAGE_HINTS: Array<{ rx: RegExp; clue: GeolocClue; detail: string }> = [
  { rx: /\b[АВЕКМНОРСТУХ]{2}\s?\d{4}\s?[АВЕКМНОРСТУХ]{2}\b/i, clue: "license_plate_region", detail: "Ukrainian-format plate" },
  { rx: /\b[ABEKMHOPCTYX]\d{3}[ABEKMHOPCTYX]{2}\d{2,3}\b/i, clue: "license_plate_region", detail: "RU-format plate (region code)" },
  { rx: /(вул\.|вулиця|street|просп\.|проспект|пл\.)/i, clue: "road_sign", detail: "street-name signage" },
  { rx: /(км|kilometre|шосе|highway|M\d{2}|Н\d{2}|Р\d{2})/, clue: "road_sign", detail: "road/route marker" },
];

const CYRILLIC_RX = /[Ѐ-ӿ]/;

/** Extract geolocation clues from all available modalities. */
export function extractClues(inputs: GeolocationInputs): GeolocationAiResult["clues"] {
  const clues: GeolocationAiResult["clues"] = [];
  const text = `${inputs.ocr?.fullText ?? ""} ${inputs.caption ?? ""}`.trim();

  if (inputs.exif?.exif.gpsLat != null && inputs.exif.exif.gpsLon != null) {
    clues.push({ type: "exif_gps", detail: `EXIF GPS ${inputs.exif.exif.gpsLat}, ${inputs.exif.exif.gpsLon}`, confidence: calibrate(0.85, GEO_MODEL_ID) });
  }
  for (const h of SIGNAGE_HINTS) {
    const m = text.match(h.rx);
    if (m) clues.push({ type: h.clue, detail: `${h.detail}: "${m[0]}"`, confidence: calibrate(0.5, GEO_MODEL_ID) });
  }
  if (text && CYRILLIC_RX.test(text)) {
    clues.push({ type: "language_on_signage", detail: "Cyrillic-script signage present", confidence: calibrate(0.4, GEO_MODEL_ID) });
  }
  if (inputs.sunAngle?.estimatedSunAzimuth != null) {
    clues.push({ type: "shadow_sun_angle", detail: `Sun azimuth ~${Math.round(inputs.sunAngle.estimatedSunAzimuth)}°, elevation ~${Math.round(inputs.sunAngle.estimatedSunElevation ?? 0)}°`, confidence: calibrate(inputs.sunAngle.confidence, GEO_MODEL_ID) });
  }
  for (const lm of inputs.landmarkMatches ?? []) {
    clues.push({ type: "landmark", detail: `Reverse-image landmark match @ ${lm.lat},${lm.lon}`, confidence: calibrate(lm.similarity, GEO_MODEL_ID) });
  }
  return clues;
}

// ── 2. Candidate fusion ──────────────────────────────────────────────────────────

/**
 * Deterministic fusion fallback (runs when the LLM reasoning step is unavailable).
 * Priority: EXIF GPS (tight) > landmark match (medium) > sun-angle candidates (loose).
 */
export function proposeCandidates(inputs: GeolocationInputs): GeolocationCandidate[] {
  const out: GeolocationCandidate[] = [];

  if (inputs.exif?.exif.gpsLat != null && inputs.exif.exif.gpsLon != null) {
    out.push({
      lat: inputs.exif.exif.gpsLat, lon: inputs.exif.exif.gpsLon,
      uncertaintyM: 50,
      confidence: calibrate(0.85, GEO_MODEL_ID),
      supportingClues: ["exif_gps"],
      method: "exif",
    });
  }
  for (const lm of inputs.landmarkMatches ?? []) {
    out.push({
      lat: lm.lat, lon: lm.lon,
      uncertaintyM: 500,
      confidence: calibrate(Math.min(0.8, lm.similarity), GEO_MODEL_ID),
      place: lm.place,
      supportingClues: ["landmark"],
      method: "landmark_match",
    });
  }
  for (const c of inputs.sunAngle?.candidateLocations ?? []) {
    out.push({
      lat: c.lat, lon: c.lon,
      uncertaintyM: 50_000, // sun-angle alone constrains a broad arc
      confidence: calibrate(c.confidence * 0.6, GEO_MODEL_ID),
      supportingClues: ["shadow_sun_angle"],
      method: "shadow",
    });
  }
  return out
    .sort((a, b) => b.confidence.calibrated - a.confidence.calibrated)
    .slice(0, 5);
}

// ── LLM reasoning prompt contract ─────────────────────────────────────────────────

export interface GeolocationPrompt {
  /** System instruction enforcing OSINT-geolocator discipline + safety. */
  system: string;
  /** User message with the extracted clues, asking for ranked coordinates + reasoning. */
  user: string;
  /** Strict JSON output contract the worker should request (response schema). */
  responseFormat: "json";
}

/**
 * Build the LLM prompt for the reasoning step. The worker sends this through the
 * LLM provider abstraction (default: latest Claude) and parses the JSON into
 * `GeolocationCandidate[]` with `method: "llm_reasoning"`.
 */
export function buildGeolocationPrompt(clues: GeolocationAiResult["clues"], caption?: string): GeolocationPrompt {
  const clueLines = clues.map((c) => `- [${c.type}] ${c.detail} (conf ${c.confidence.calibrated})`).join("\n");
  return {
    system:
      "You are an expert OSINT geolocation analyst working on the Russo-Ukrainian war. " +
      "Chain the supplied clues (signage, plates, terrain, sun angle, landmarks) into the most " +
      "likely location(s). Prefer named places in Ukraine and adjacent regions. NEVER fabricate a " +
      "precise coordinate from weak evidence — widen the uncertainty radius instead. Output STRICT JSON: " +
      '{"candidates":[{"lat":n,"lon":n,"uncertaintyM":n,"confidence":0-1,"placeEn":s,"placeUk":s,"reasoning":s}]}. ' +
      "This output is advisory and will be reviewed by a human before any publication.",
    user: `Clues:\n${clueLines}${caption ? `\n\nCaption/context: ${caption}` : ""}\n\nReturn up to 5 ranked candidates.`,
    responseFormat: "json",
  };
}

/** Parse an LLM JSON geolocation response into typed candidates (worker calls this). */
export function parseLlmGeolocation(json: unknown): GeolocationCandidate[] {
  const obj = json as { candidates?: Array<Record<string, unknown>> };
  const rows = Array.isArray(obj?.candidates) ? obj.candidates : [];
  const out: GeolocationCandidate[] = [];
  for (const r of rows) {
    const lat = Number(r.lat), lon = Number(r.lon);
    if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
    const conf = Math.min(1, Math.max(0, Number(r.confidence) || 0));
    out.push({
      lat, lon,
      uncertaintyM: Math.max(10, Number(r.uncertaintyM) || 5000),
      confidence: calibrate(conf, GEO_MODEL_ID),
      place: (r.placeEn || r.placeUk) ? { en: String(r.placeEn ?? ""), uk: String(r.placeUk ?? "") } : undefined,
      supportingClues: ["other"],
      method: "llm_reasoning",
    });
  }
  return out.sort((a, b) => b.confidence.calibrated - a.confidence.calibrated).slice(0, 5);
}

// ── 3. Orchestrator ────────────────────────────────────────────────────────────

/**
 * Assemble a GeolocationAiResult. Pass `llmCandidates` (from the worker's LLM call)
 * to fuse them with the deterministic candidates; omit to run fusion-only fallback.
 * `reasoningModelId` is the live model id the worker used (or "fusion-fallback").
 */
export function geolocate(
  inputs: GeolocationInputs,
  opts: { llmCandidates?: GeolocationCandidate[]; reasoningModelId?: string } = {},
): GeolocationAiResult {
  const start = Date.now();
  const clues = extractClues(inputs);
  const deterministic = proposeCandidates(inputs);
  const merged = mergeCandidates([...(opts.llmCandidates ?? []), ...deterministic]);
  return {
    mediaId: inputs.mediaId,
    clues,
    candidates: merged,
    best: merged[0],
    riskTier: "high_stakes",
    requiresHumanReview: true,
    reasoningModelId: opts.reasoningModelId ?? "fusion-fallback (LLM reasoning step pending — no model called)",
    processingMs: Date.now() - start,
  };
}

/** Merge near-duplicate candidates (within ~uncertainty), boosting confidence when methods agree. */
function mergeCandidates(cands: GeolocationCandidate[]): GeolocationCandidate[] {
  const merged: GeolocationCandidate[] = [];
  for (const c of cands) {
    const near = merged.find((m) => haversineM(m.lat, m.lon, c.lat, c.lon) < Math.max(m.uncertaintyM, c.uncertaintyM));
    if (near) {
      // Independent methods corroborate → bump calibrated confidence (noisy-OR), keep tighter radius.
      const boosted: CalibratedConfidence = {
        raw: Math.max(near.confidence.raw, c.confidence.raw),
        calibrated: parseFloat(Math.min(0.95, 1 - (1 - near.confidence.calibrated) * (1 - c.confidence.calibrated)).toFixed(4)),
        isCalibrated: near.confidence.isCalibrated && c.confidence.isCalibrated,
      };
      near.confidence = boosted;
      near.uncertaintyM = Math.min(near.uncertaintyM, c.uncertaintyM);
      if (!near.supportingClues.includes(c.supportingClues[0])) near.supportingClues.push(...c.supportingClues);
    } else {
      merged.push({ ...c, supportingClues: [...c.supportingClues] });
    }
  }
  return merged.sort((a, b) => b.confidence.calibrated - a.confidence.calibrated).slice(0, 5);
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
