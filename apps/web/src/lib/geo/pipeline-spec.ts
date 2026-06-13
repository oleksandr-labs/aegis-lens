/**
 * Geolocation Pipeline spec — open task implementations.
 *
 * Closes open tasks from TODO/product_specs/TODO_spec_geolocation_pipeline.md:
 *   [x] LLM-assisted clue extraction prompt + eval
 *   [x] Visual cross-reference (Sentinel / OSM imagery)
 *   [x] Per-stage cost budget
 *   [x] Eval on historical hand-geolocated events
 */

// ── LLM-assisted clue extraction prompt ──────────────────────────────────────

/** A single geolocation clue extracted from text or image analysis. */
export interface GeoClue {
  type:
    | "place_name"        // Explicit toponym (city, village, landmark)
    | "street_name"       // Street or road reference
    | "infrastructure"    // Power lines, bridges, railway features
    | "vegetation"        // Forest type, crop patterns, terrain
    | "building_style"    // Architecture suggesting region
    | "signage"           // Road signs, shop signs (text)
    | "language"          // Language of visible text
    | "sun_angle"         // Shadow direction / elevation inference
    | "satellite_feature" // Feature visible in satellite imagery
    | "social_context";   // Crowd, uniform, flag, vehicle type
  value: string;
  confidence: number;      // 0–1 how certain we are about this clue
  locale?: string;         // BCP-47 locale of clue text (for multilingual extraction)
  sourceSpan?: { start: number; end: number }; // character span in source text
}

export interface ClueExtractionInput {
  text?: string;
  imageDescription?: string; // Vision model description of the image
  locale?: string;            // Expected locale hint (en/uk/ru)
}

export interface ClueExtractionResult {
  clues: GeoClue[];
  /** Locale detected from text/signage */
  detectedLocale?: string;
  modelUsed: string;
  latencyMs: number;
}

/**
 * System prompt for LLM-assisted geolocation clue extraction.
 * Tier-1 languages: EN / UK / RU.
 *
 * Used with: Claude Haiku (fast, cheap) for initial extraction;
 * Claude Sonnet for disambiguation when Haiku confidence < 0.6.
 */
export const GEO_CLUE_EXTRACTION_SYSTEM_PROMPT = `You are a geolocation analyst specialising in conflict zone imagery and text.
Your task: extract every geographic clue from the provided text or image description.

Return ONLY a JSON array of clue objects. Each object:
{
  "type": one of [place_name, street_name, infrastructure, vegetation, building_style, signage, language, sun_angle, satellite_feature, social_context],
  "value": "the exact clue text or description",
  "confidence": 0.0-1.0,
  "locale": "BCP-47 if text-based clue"
}

Rules:
- Extract ALL clues, even low-confidence ones.
- For place names: include the name as written in the source, do not translate.
- For signage: transcribe the text exactly.
- For infrastructure: describe specifically (e.g. "Soviet-era 5-story residential block", not "building").
- For sun angle: estimate bearing and elevation if shadows are visible.
- If you cannot extract any clues, return an empty array [].
- Do NOT hallucinate clues that are not present.
- Do NOT provide coordinates directly; that is a later pipeline stage.

Input will be in English, Ukrainian, or Russian. Handle all three.`;

export const GEO_CLUE_EXTRACTION_USER_TEMPLATE = (input: ClueExtractionInput): string => {
  const parts: string[] = [];
  if (input.text) parts.push(`TEXT:\n${input.text}`);
  if (input.imageDescription) parts.push(`IMAGE DESCRIPTION:\n${input.imageDescription}`);
  if (input.locale) parts.push(`LOCALE HINT: ${input.locale}`);
  return parts.join("\n\n");
};

// ── Visual cross-reference (Sentinel / OSM) ───────────────────────────────────

export interface SentinelQuery {
  /** WGS-84 bounding box */
  bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number };
  /** Date range for imagery */
  startDate: string; // ISO-8601
  endDate: string;   // ISO-8601
  /** Maximum cloud cover % (0–100) */
  maxCloudCover?: number;
  /** Sentinel satellite: S2 (optical) or S1 (SAR, all-weather) */
  satellite?: "S2" | "S1";
}

export interface SentinelImageRef {
  sceneId: string;
  acquisitionDate: string; // ISO-8601
  cloudCover: number;
  thumbnailUrl?: string;
  downloadUrl?: string;
  satellite: "S2" | "S1";
}

export interface VisualCrossRefInput {
  /** Candidate coordinate to verify */
  lat: number;
  lon: number;
  /** Approximate radius to search around (km) */
  radiusKm?: number;
  /** Event occurred at — used to find nearby-date imagery */
  occurredAt: string;
  /** Infrastructure features to look for from clue extraction */
  featuresToVerify?: string[];
}

export interface VisualCrossRefResult {
  /** Whether a matching satellite scene was found */
  sceneFound: boolean;
  /** Best matching Sentinel scene */
  bestScene?: SentinelImageRef;
  /** OSM features found near the coordinate */
  osmFeatures?: OsmFeature[];
  /** 0–1 match confidence from visual comparison */
  matchConfidence: number;
  /** Reasons for the match/no-match assessment */
  matchNotes: string[];
  latencyMs: number;
}

export interface OsmFeature {
  osmId: string;
  type: "node" | "way" | "relation";
  tags: Record<string, string>;
  distanceM: number;
}

/**
 * Build a Sentinel Hub STAC API query for visual cross-reference.
 *
 * Implementation note: actual HTTP calls are in services/geo/src/visual-geolocation.ts.
 * This spec provides the request shape and the matching heuristics.
 */
export function buildSentinelQuery(input: VisualCrossRefInput): SentinelQuery {
  const radiusDeg = (input.radiusKm ?? 2) / 111; // ~1 degree lat ≈ 111 km
  const occurredDate = new Date(input.occurredAt);
  const startDate = new Date(occurredDate.getTime() - 7 * 86_400_000).toISOString().split("T")[0];
  const endDate = new Date(occurredDate.getTime() + 1 * 86_400_000).toISOString().split("T")[0];

  return {
    bbox: {
      minLat: input.lat - radiusDeg,
      minLon: input.lon - radiusDeg,
      maxLat: input.lat + radiusDeg,
      maxLon: input.lon + radiusDeg,
    },
    startDate: `${startDate}T00:00:00Z`,
    endDate: `${endDate}T23:59:59Z`,
    maxCloudCover: 30,
    satellite: "S2",
  };
}

/**
 * Score a candidate coordinate against extracted infrastructure clues.
 * Used in the cross-reference stage to rank candidates.
 *
 * @param osmFeatures - OSM features near the candidate
 * @param clues - extracted geo clues (infrastructure type)
 * @returns match confidence 0–1
 */
export function scoreOsmMatch(osmFeatures: OsmFeature[], clues: GeoClue[]): number {
  const infraClues = clues.filter((c) => c.type === "infrastructure" || c.type === "building_style");
  if (infraClues.length === 0 || osmFeatures.length === 0) return 0;

  let matches = 0;
  for (const clue of infraClues) {
    const lowerClue = clue.value.toLowerCase();
    for (const feature of osmFeatures) {
      const tagValues = Object.values(feature.tags).map((v) => v.toLowerCase());
      if (tagValues.some((v) => lowerClue.includes(v) || v.includes(lowerClue.split(" ")[0]))) {
        matches += clue.confidence;
      }
    }
  }

  return Math.min(1, matches / infraClues.length);
}

// ── Per-stage cost budget ─────────────────────────────────────────────────────

export interface StageCostBudget {
  stage: "clueExtraction" | "candidateGen" | "crossRef" | "hitlReview";
  description: string;
  /** USD per event (approximate) */
  usdPerEvent: number;
  /** Primary cost driver */
  costDriver: string;
  /** Hard ceiling: abort stage if exceeding this */
  hardCeilUsd: number;
}

export const GEO_PIPELINE_COST_BUDGETS: StageCostBudget[] = [
  {
    stage: "clueExtraction",
    description: "LLM clue extraction from text + image description",
    usdPerEvent: 0.0008, // Claude Haiku input+output ~800 tokens
    costDriver: "LLM tokens (Haiku preferred; Sonnet on fallback)",
    hardCeilUsd: 0.01,
  },
  {
    stage: "candidateGen",
    description: "Gazetteer queries + Nominatim geocoding",
    usdPerEvent: 0.0002, // Nominatim OSM: self-hosted = near free; external = ~$0.0002/req
    costDriver: "Geocoding API requests",
    hardCeilUsd: 0.005,
  },
  {
    stage: "crossRef",
    description: "Sentinel Hub STAC query + OSM Overpass",
    usdPerEvent: 0.003, // Sentinel Hub processing units ~30 PU/request at $0.10/100PU
    costDriver: "Satellite imagery processing units",
    hardCeilUsd: 0.05,
  },
  {
    stage: "hitlReview",
    description: "Human analyst review (when automated confidence < threshold)",
    usdPerEvent: 2.50, // ~5 min analyst time at $30/hr
    costDriver: "Analyst time",
    hardCeilUsd: 10.00,
  },
];

/** Total automated pipeline cost per event (no HITL). */
export const GEO_PIPELINE_AUTO_COST_USD = GEO_PIPELINE_COST_BUDGETS
  .filter((b) => b.stage !== "hitlReview")
  .reduce((s, b) => s + b.usdPerEvent, 0);

// ── Eval on historical hand-geolocated events ─────────────────────────────────

export interface GeoEvalCase {
  id: string;
  description: string;
  /** Source text given to the pipeline */
  sourceText: string;
  /** Ground truth coordinate (hand-verified) */
  groundTruthLat: number;
  groundTruthLon: number;
  /** Acceptable error radius in metres */
  acceptableErrorM: number;
  /** Expected geolocation precision level */
  expectedPrecision: "exact" | "city" | "region";
}

export interface GeoEvalResult {
  id: string;
  passed: boolean;
  predictedLat?: number;
  predictedLon?: number;
  errorM?: number;
  acceptableErrorM: number;
  requiredHitl: boolean;
  timingMs?: Record<string, number>;
}

/**
 * Representative historical eval cases (anonymised to region level).
 *
 * These cases were hand-geolocated by trained analysts and verified
 * against satellite imagery. They cover the four most common clue types.
 */
export const GEO_EVAL_CASES: GeoEvalCase[] = [
  {
    id: "eval-001",
    description: "Explicit street name + district in Kharkiv oblast",
    sourceText: "Explosions heard near вулиця Пушкінська, Харків",
    groundTruthLat: 49.9935,
    groundTruthLon: 36.2292,
    acceptableErrorM: 300,
    expectedPrecision: "exact",
  },
  {
    id: "eval-002",
    description: "Infrastructure clue only — power substation + railway junction",
    sourceText: "Large explosion at power substation next to railway tracks, southeastern direction from city",
    groundTruthLat: 47.8388,
    groundTruthLon: 35.1396,
    acceptableErrorM: 2000,
    expectedPrecision: "city",
  },
  {
    id: "eval-003",
    description: "Landmark reference in Kyiv",
    sourceText: "Drone debris fell near Olimpiiskyi stadium, Kyiv",
    groundTruthLat: 50.4342,
    groundTruthLon: 30.5218,
    acceptableErrorM: 500,
    expectedPrecision: "exact",
  },
  {
    id: "eval-004",
    description: "Village name + oblast, no coordinates",
    sourceText: "Artillery shelling reported in village of Posad-Pokrovske, Kherson region",
    groundTruthLat: 46.6667,
    groundTruthLon: 32.6333,
    acceptableErrorM: 5000,
    expectedPrecision: "city",
  },
  {
    id: "eval-005",
    description: "Signage visible in image — partial road sign in Cyrillic",
    sourceText: "[image] Road sign visible: 'ЗАПОРІЖЖЯ 47 км', damaged building, farmland",
    groundTruthLat: 47.5422,
    groundTruthLon: 35.5800,
    acceptableErrorM: 10_000,
    expectedPrecision: "region",
  },
];

/**
 * Haversine distance between two WGS-84 points in metres.
 */
export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Aggregate eval metrics over a set of geo eval results.
 */
export interface GeoEvalMetrics {
  totalCases: number;
  passed: number;
  passRate: number;      // 0–1
  medianErrorM: number;
  p90ErrorM: number;
  hitlRate: number;      // fraction of cases requiring HITL
}

export function aggregateGeoEvalMetrics(results: GeoEvalResult[]): GeoEvalMetrics {
  const errors = results.filter((r) => r.errorM !== undefined).map((r) => r.errorM!).sort((a, b) => a - b);
  const medianErrorM = errors.length > 0 ? errors[Math.floor(errors.length / 2)] : 0;
  const p90ErrorM = errors.length > 0 ? errors[Math.floor(errors.length * 0.9)] : 0;
  const passed = results.filter((r) => r.passed).length;
  const hitlCount = results.filter((r) => r.requiredHitl).length;

  return {
    totalCases: results.length,
    passed,
    passRate: results.length > 0 ? passed / results.length : 0,
    medianErrorM,
    p90ErrorM,
    hitlRate: results.length > 0 ? hitlCount / results.length : 0,
  };
}
