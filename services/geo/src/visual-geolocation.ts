/**
 * Visual geolocation pipeline.
 *
 * Stages: clue extraction → candidate generation → cross-reference → confidence.
 *
 * This module orchestrates; the heavy lifting (CV clue extraction, satellite
 * cross-reference) is delegated to the vision service. Here we define the
 * pipeline contract and a deterministic fusion stage.
 */

import type { GazetteerEntry } from "./gazetteer";

// ── Clue types ──────────────────────────────────────────────────────────────

export type VisualClueType =
  | "text_sign"        // OCR'd text on a sign/building
  | "license_plate"    // vehicle plate region prefix
  | "landmark"         // recognizable structure
  | "road_marking"     // road number / signage
  | "vegetation"       // biome / terrain type
  | "sun_shadow"       // sun-angle constraint (from vision service)
  | "architecture"     // building style suggesting region
  | "flag_insignia";   // unit / org markers

export interface VisualClue {
  type: VisualClueType;
  /** Raw extracted value (OCR text, plate prefix, etc.) */
  value: string;
  /** Confidence of the extraction itself (0–1) */
  confidence: number;
  /** Bounding box in the source image (normalized) */
  bbox?: { x: number; y: number; w: number; h: number };
}

// ── Candidate ────────────────────────────────────────────────────────────────

export interface GeoCandidate {
  lat: number;
  lng: number;
  /** Uncertainty radius in metres */
  radiusM: number;
  /** Which clues support this candidate */
  supportingClues: VisualClueType[];
  /** 0–1 */
  score: number;
  /** Gazetteer entry if matched to a known place */
  gazetteerEntry?: GazetteerEntry;
}

export interface VisualGeolocationResult {
  candidates: GeoCandidate[];
  /** Best candidate (highest score), if any clear winner */
  best?: GeoCandidate;
  /** Whether human review is required */
  requiresReview: boolean;
  /** Clues that were used */
  clues: VisualClue[];
  /** Per-stage timing for SLO monitoring */
  timingMs: { clueExtraction: number; candidateGen: number; crossRef: number; total: number };
}

// ── UA vehicle plate region prefixes (first letter pair → oblast) ────────────

const PLATE_REGION_PREFIXES: Record<string, string> = {
  AA: "UA-30", AB: "UA-05", AC: "UA-09", AE: "UA-12", AH: "UA-23",
  AI: "UA-26", AK: "UA-43", AM: "UA-46", AO: "UA-48", AP: "UA-51",
  AT: "UA-53", AX: "UA-63", BA: "UA-21", BB: "UA-59", BC: "UA-56",
  BE: "UA-61", BH: "UA-71", BI: "UA-73", BK: "UA-77", BM: "UA-07",
  BO: "UA-18", BT: "UA-32", CA: "UA-74", CB: "UA-65", CE: "UA-14",
  CH: "UA-68", II: "UA-35", KA: "UA-09",
};

/** Extract the oblast code from a Ukrainian plate prefix (first 2 letters). */
export function plateToRegion(plate: string): string | undefined {
  const prefix = plate.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
  return PLATE_REGION_PREFIXES[prefix];
}

// ── Candidate generation from clues ──────────────────────────────────────────

export interface ClueResolver {
  /** Resolve text/landmark clues to gazetteer entries */
  resolveText(text: string): GazetteerEntry[];
  /** Look up an oblast entry by region code */
  getRegion(regionCode: string): GazetteerEntry | undefined;
}

export function generateCandidates(
  clues: VisualClue[],
  resolver: ClueResolver,
): GeoCandidate[] {
  const candidates: GeoCandidate[] = [];

  for (const clue of clues) {
    if (clue.type === "text_sign" || clue.type === "landmark" || clue.type === "road_marking") {
      const matches = resolver.resolveText(clue.value);
      for (const entry of matches) {
        candidates.push({
          lat: entry.centroid.lat,
          lng: entry.centroid.lng,
          radiusM: entry.precision_m,
          supportingClues: [clue.type],
          score: clue.confidence * (entry.level >= 2 ? 0.9 : 0.6),
          gazetteerEntry: entry,
        });
      }
    } else if (clue.type === "license_plate") {
      const regionCode = plateToRegion(clue.value);
      if (regionCode) {
        const entry = resolver.getRegion(regionCode);
        if (entry) {
          candidates.push({
            lat: entry.centroid.lat,
            lng: entry.centroid.lng,
            radiusM: entry.precision_m,
            supportingClues: [clue.type],
            score: clue.confidence * 0.5, // plate only narrows to oblast
            gazetteerEntry: entry,
          });
        }
      }
    }
    // sun_shadow candidates come pre-formed from the vision service and are
    // merged in via mergeSunAngleCandidates() below.
  }

  return candidates;
}

/**
 * Merge candidates that are geographically close, combining their supporting
 * clues and boosting the score (multiple independent clues → higher confidence).
 */
export function fuseCandidates(candidates: GeoCandidate[], clusterRadiusKm = 25): GeoCandidate[] {
  const fused: GeoCandidate[] = [];

  for (const cand of candidates) {
    const existing = fused.find(
      (f) => haversineKm(f.lat, f.lng, cand.lat, cand.lng) <= clusterRadiusKm,
    );
    if (existing) {
      // Merge: union supporting clues, boost score
      const allClues = new Set([...existing.supportingClues, ...cand.supportingClues]);
      existing.supportingClues = [...allClues];
      // Independent corroboration boost (capped at 0.98)
      existing.score = Math.min(0.98, existing.score + cand.score * 0.4);
      // Tighten radius to the smaller of the two
      existing.radiusM = Math.min(existing.radiusM, cand.radiusM);
    } else {
      fused.push({ ...cand });
    }
  }

  return fused.sort((a, b) => b.score - a.score);
}

/**
 * Run the full pipeline. `extractClues` is injected (delegates to vision service).
 */
export async function geolocateFromImage(
  imageRef: string,
  extractClues: (imageRef: string) => Promise<VisualClue[]>,
  resolver: ClueResolver,
): Promise<VisualGeolocationResult> {
  const t0 = Date.now();
  const clues = await extractClues(imageRef);
  const t1 = Date.now();

  const rawCandidates = generateCandidates(clues, resolver);
  const t2 = Date.now();

  const fused = fuseCandidates(rawCandidates);
  const t3 = Date.now();

  const best = fused[0];
  // Require review if the best score is weak, or top-2 are too close
  const requiresReview =
    !best ||
    best.score < 0.7 ||
    (fused.length >= 2 && best.score - fused[1].score < 0.15);

  return {
    candidates: fused.slice(0, 5),
    best: requiresReview ? undefined : best,
    requiresReview,
    clues,
    timingMs: {
      clueExtraction: t1 - t0,
      candidateGen: t2 - t1,
      crossRef: t3 - t2,
      total: t3 - t0,
    },
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
