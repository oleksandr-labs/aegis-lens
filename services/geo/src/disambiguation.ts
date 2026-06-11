/**
 * Toponym disambiguation — resolve ambiguous place names to a single candidate
 * using context signals: surrounding place names, region mentions, event class.
 *
 * Example:
 *   "Lyman" alone → ambiguous (several places named Lyman)
 *   "Lyman" + "Donetsk Oblast" context → resolves to the Donetsk-oblast entry
 */

import type { GazetteerEntry } from "./gazetteer";

export interface DisambiguationContext {
  /** Region (oblast) codes mentioned in the same document, e.g. ["UA-14"] */
  mentionedRegionCodes?: string[];
  /** Country code hint (ISO 3166-1 alpha-2) */
  country?: string;
  /** Other place names in the same document */
  coOccurringPlaces?: string[];
  /** Event class (e.g. "missile" → more likely a frontline area) */
  eventClass?: string;
  /** Previously resolved location in the same document */
  previousLocation?: { lat: number; lng: number };
}

export interface DisambiguatedResult {
  entry: GazetteerEntry;
  confidence: number;
  reason: string;
}

/** The oblast code an entry belongs to: itself if it's an oblast, else its parent. */
function regionCodeOf(entry: GazetteerEntry): string | undefined {
  if (entry.level === 1) return entry.id;
  return entry.parent_id;
}

/**
 * Score a candidate entry given the disambiguation context.
 * Higher score = more likely the intended referent.
 */
export function scoreCandidate(
  entry: GazetteerEntry,
  context: DisambiguationContext,
): number {
  let score = 0;

  // Direct region match: strongest signal
  const rc = regionCodeOf(entry);
  if (rc && context.mentionedRegionCodes?.includes(rc)) {
    score += 50;
  }

  // Country match
  if (context.country && entry.country === context.country) {
    score += 10;
  }

  // Proximity to previous resolved location in same document
  if (context.previousLocation) {
    const distKm = haversineKm(
      context.previousLocation.lat,
      context.previousLocation.lng,
      entry.centroid.lat,
      entry.centroid.lng,
    );
    if (distKm < 50) score += 20;
    else if (distKm < 200) score += 10;
    else if (distKm < 500) score += 5;
  }

  // Event class hints: frontline events → eastern / southern oblasts
  if (context.eventClass && ["missile", "drone", "artillery", "ground_combat"].includes(context.eventClass)) {
    const frontlineRegions = ["UA-14", "UA-09", "UA-23", "UA-65", "UA-63", "UA-59"];
    if (frontlineRegions.includes(rc ?? "")) score += 15;
  }

  // Admin level: prefer higher-specificity matches (city/level-2+ over oblast)
  score += entry.level * 2;

  return score;
}

/**
 * Disambiguate a set of candidate entries, returning the best match + confidence.
 */
export function disambiguate(
  candidates: GazetteerEntry[],
  context: DisambiguationContext,
): DisambiguatedResult | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) {
    return { entry: candidates[0], confidence: 0.9, reason: "single_candidate" };
  }

  const scored = candidates
    .map((entry) => ({ entry, score: scoreCandidate(entry, context) }))
    .sort((a, b) => b.score - a.score);

  const margin = scored[0].score - scored[1].score;

  let confidence: number;
  let reason: string;
  if (margin >= 40) {
    confidence = 0.92;
    reason = "strong_context_match";
  } else if (margin >= 20) {
    confidence = 0.75;
    reason = "moderate_context_match";
  } else if (margin >= 10) {
    confidence = 0.6;
    reason = "weak_context_match";
  } else {
    confidence = 0.45;
    reason = "ambiguous_no_decisive_signal";
  }

  return { entry: scored[0].entry, confidence, reason };
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
