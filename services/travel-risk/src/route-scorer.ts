/**
 * Route risk scoring for multi-leg journeys.
 *
 * Strategy:
 *   1. Interpolate intermediate waypoints along each segment (every ~20km)
 *   2. Evaluate risk at each waypoint using the city-level scorer
 *   3. Aggregate: overall = max segment risk (worst leg dominates)
 *   4. Emit high-risk-area annotations along the route
 *
 * This is purely signal-based (no routing engine). For production, integrate
 * a routing API (OSRM / Mapbox Directions) for actual road segments.
 */

import type {
  RouteRisk,
  RouteSegment,
  RiskScore,
  RiskSignal,
  RiskLevel,
} from "./types";

const LEVEL_ORDER: Record<RiskLevel, number> = {
  extreme: 5,
  high: 4,
  medium: 3,
  low: 2,
  minimal: 1,
};

function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "extreme";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "minimal";
}

/** Haversine distance in km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/** Interpolate N waypoints between two coordinates */
function interpolate(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  count: number,
): Array<{ lat: number; lon: number }> {
  const points: Array<{ lat: number; lon: number }> = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    points.push({
      lat: from.lat + t * (to.lat - from.lat),
      lon: from.lon + t * (to.lon - from.lon),
    });
  }
  return points;
}

/** Compute signal-based risk at a point */
function scoreAtPoint(
  lat: number,
  lon: number,
  signals: RiskSignal[],
  radiusKm = 30,
): number {
  let maxContrib = 0;
  for (const sig of signals) {
    const dist = haversineKm(lat, lon, sig.lat, sig.lon);
    if (dist > radiusKm + sig.radiusKm) continue;

    const normalizedDist = Math.max(0, dist - sig.radiusKm) / radiusKm;
    const decayWeight = 1 - normalizedDist * normalizedDist;
    const contrib = sig.severity * 20 * decayWeight;
    maxContrib = Math.max(maxContrib, contrib);
  }
  return Math.min(100, maxContrib);
}

export interface RouteInput {
  origin: { name: string; lat: number; lon: number };
  destination: { name: string; lat: number; lon: number };
  /** Intermediate stops (optional) */
  waypoints?: Array<{ name: string; lat: number; lon: number }>;
  /** Average speed in km/h for duration estimate */
  avgSpeedKmh?: number;
}

export class RouteRiskScorer {
  constructor(private readonly signals: RiskSignal[]) {}

  score(input: RouteInput): RouteRisk {
    const stops = [
      input.origin,
      ...(input.waypoints ?? []),
      input.destination,
    ];

    const avgSpeed = input.avgSpeedKmh ?? 60;
    const segments: RouteSegment[] = [];
    let totalDistanceKm = 0;
    let worstScore = 0;
    let worstLevel: RiskLevel = "minimal";

    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i]!;
      const to = stops[i + 1]!;
      const distKm = haversineKm(from.lat, from.lon, to.lat, to.lon);
      totalDistanceKm += distKm;

      // Sample waypoints every ~20km
      const sampleCount = Math.max(1, Math.round(distKm / 20));
      const waypoints = interpolate(from, to, sampleCount);

      let segMaxScore = 0;
      const highRiskAreas: RouteSegment["highRiskAreas"] = [];

      for (const wp of waypoints) {
        const s = scoreAtPoint(wp.lat, wp.lon, this.signals);
        if (s > segMaxScore) segMaxScore = s;

        if (s >= 60) {
          highRiskAreas.push({
            name: `High-risk zone near (${wp.lat.toFixed(2)}, ${wp.lon.toFixed(2)})`,
            lat: wp.lat,
            lon: wp.lon,
            radiusKm: 20,
          });
        }
      }

      const segLevel = scoreToLevel(segMaxScore);
      if (LEVEL_ORDER[segLevel] > LEVEL_ORDER[worstLevel]) {
        worstLevel = segLevel;
        worstScore = segMaxScore;
      }

      const segRisk: RiskScore = {
        score: Math.round(segMaxScore),
        level: segLevel,
        confidence: 0.6,
        caveats: segMaxScore >= 60 ? ["High threat density on segment"] : [],
      };

      segments.push({
        from,
        to,
        distanceKm: Math.round(distKm),
        risk: segRisk,
        highRiskAreas,
      });
    }

    const overallRisk: RiskScore = {
      score: Math.round(worstScore),
      level: worstLevel,
      confidence: 0.6,
      caveats: this.buildRouteCaveats(worstLevel, segments),
    };

    const recommendations = this.buildRecommendations(worstLevel, segments);

    return {
      origin: input.origin,
      destination: input.destination,
      segments,
      overallRisk,
      estimatedDurationHours: Math.round((totalDistanceKm / avgSpeed) * 10) / 10,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildRouteCaveats(level: RiskLevel, segments: RouteSegment[]): string[] {
    const caveats: string[] = [];
    if (level === "extreme") caveats.push("Route passes through active conflict zone — do not travel.");
    if (level === "high") caveats.push("Route has high-risk segments — travel only if mission-critical.");
    const highRiskCount = segments.filter((s) => LEVEL_ORDER[s.risk.level] >= LEVEL_ORDER.high).length;
    if (highRiskCount > 1) caveats.push(`${highRiskCount} high-risk segments detected.`);
    return caveats;
  }

  private buildRecommendations(level: RiskLevel, segments: RouteSegment[]): string[] {
    const recs: string[] = [];
    if (LEVEL_ORDER[level] >= LEVEL_ORDER.high) {
      recs.push("Consult your security officer before travel.");
      recs.push("Register your travel with your embassy/consulate.");
      recs.push("Plan primary and alternate routes.");
    }
    if (LEVEL_ORDER[level] >= LEVEL_ORDER.medium) {
      recs.push("Monitor local advisories every 2 hours.");
      recs.push("Carry emergency contacts and offline maps.");
    }
    const highRiskSegments = segments.filter((s) => LEVEL_ORDER[s.risk.level] >= LEVEL_ORDER.high);
    for (const seg of highRiskSegments) {
      recs.push(`Segment ${seg.from.name} → ${seg.to.name}: consider alternate routing.`);
    }
    if (recs.length === 0) {
      recs.push("Standard travel precautions apply. Stay aware of local conditions.");
    }
    return recs;
  }
}
