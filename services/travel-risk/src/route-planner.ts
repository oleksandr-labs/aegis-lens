/**
 * Route planner with risk-based segment avoidance.
 *
 * Accepts an origin + destination (+ optional waypoints) and returns a route
 * plan with per-segment risk scores.  Segments above the avoidHighRiskThreshold
 * are flagged as not recommended.
 *
 * Production: integrate OSRM or Valhalla for road-network routing, then
 * overlay risk scores from the event store.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN implementation notes */
export const ROUTE_PLANNER_NOTES_EN = [
  "OSRM-or-Valhalla-routing-engine: integrate OSRM (http://router.project-osrm.org/) or Valhalla for real road segments; replace straight-line interpolation",
  "risk-overlay-from-events: pull active RiskSignal[] from the event store and run scoreAtPoint() on each road vertex for a live risk overlay",
  "avoid-threshold-configurable: avoidHighRiskThreshold (0-100) is per-request; expose in UI as a slider; default 60 (= 'high' level boundary)",
] as const;

/** UA нотатки щодо реалізації */
export const ROUTE_PLANNER_NOTES_UK = [
  "OSRM-or-Valhalla-routing-engine: інтегруйте OSRM (http://router.project-osrm.org/) або Valhalla для реальних дорожніх сегментів; замініть лінійну інтерполяцію",
  "risk-overlay-from-events: завантажте активні RiskSignal[] із сховища подій і виконайте scoreAtPoint() на кожній вершині дороги для живого ризик-оверлею",
  "avoid-threshold-configurable: avoidHighRiskThreshold (0-100) задається на запит; відображайте в UI як слайдер; за замовчуванням 60 (межа рівня 'high')",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single stop on a planned route */
export interface RoutePlannerWaypoint {
  lat: number;
  lng: number;
  name: string;
  nameUk: string;
  /** Optional pre-computed risk score for this location (0-100) */
  riskScore?: number;
}

/** Input to the route planner */
export interface RoutePlanRequest {
  origin: RoutePlannerWaypoint;
  destination: RoutePlannerWaypoint;
  waypoints?: RoutePlannerWaypoint[];
  /** Segments with a risk score at or above this threshold are flagged as not recommended (0-100) */
  avoidHighRiskThreshold: number;
}

/** A single route segment between two waypoints */
export interface RoutePlanSegment {
  from: RoutePlannerWaypoint;
  to: RoutePlannerWaypoint;
  riskScore: number;
  /** False if riskScore >= avoidHighRiskThreshold */
  recommended: boolean;
}

/** Full route plan result */
export interface RoutePlanResult {
  requestId: string;
  segments: RoutePlanSegment[];
  overallRiskScore: number;
  warnings?: string[];
  warningsUk?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Stub risk scorer for a segment midpoint.
 *
 * Returns the average of the two endpoint riskScores if available, else 0.
 * Replace with a real signal-based scoreAtPoint() call in production.
 */
function stubSegmentRisk(from: RoutePlannerWaypoint, to: RoutePlannerWaypoint): number {
  const a = from.riskScore ?? 0;
  const b = to.riskScore ?? 0;
  return Math.round((a + b) / 2);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Plan a route and annotate each segment with a risk score.
 *
 * This is a stub implementation that builds straight-line segments and uses
 * any pre-computed riskScore on the waypoints.  Production should replace
 * segment building with a routing-engine call (see ROUTE_PLANNER_NOTES_EN[0])
 * and scoring with a live RiskSignal overlay.
 */
export function planRoute(request: RoutePlanRequest): RoutePlanResult {
  const stops: RoutePlannerWaypoint[] = [
    request.origin,
    ...(request.waypoints ?? []),
    request.destination,
  ];

  const segments: RoutePlanSegment[] = [];
  const warnings: string[] = [];
  const warningsUk: string[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i]!;
    const to = stops[i + 1]!;
    const distKm = haversineKm(from.lat, from.lng, to.lat, to.lng);
    const riskScore = stubSegmentRisk(from, to);
    const recommended = riskScore < request.avoidHighRiskThreshold;

    if (!recommended) {
      warnings.push(
        `Segment ${from.name} → ${to.name} (${Math.round(distKm)} km) has risk score ${riskScore} — above threshold ${request.avoidHighRiskThreshold}. Consider an alternate route.`,
      );
      warningsUk.push(
        `Сегмент ${from.nameUk} → ${to.nameUk} (${Math.round(distKm)} км) має оцінку ризику ${riskScore} — вище порогу ${request.avoidHighRiskThreshold}. Розгляньте альтернативний маршрут.`,
      );
    }

    segments.push({ from, to, riskScore, recommended });
  }

  const overallRiskScore = segments.length > 0
    ? Math.max(...segments.map((s) => s.riskScore))
    : 0;

  return {
    requestId: `rp_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    segments,
    overallRiskScore,
    warnings: warnings.length > 0 ? warnings : undefined,
    warningsUk: warningsUk.length > 0 ? warningsUk : undefined,
  };
}
