/**
 * Missile trajectory reconstruction with uncertainty cones.
 *
 * Given a (possibly estimated) launch point and an impact/intercept point, we
 * reconstruct the great-circle path the missile most plausibly travelled and a
 * growing uncertainty cone around it. The cone is narrow near the well-known
 * impact point and widens toward the launch point, reflecting that launch
 * geolocation is typically far less certain than the impact site.
 *
 * Output is GeoJSON-ready (a LineString path + a Polygon cone) so the map layer
 * can render it directly with the `missiles` arc paint spec.
 */

export interface LatLon {
  lat: number;
  lon: number;
}

export interface TrajectoryInput {
  eventId: string;
  launch: LatLon;
  impact: LatLon;
  /** Uncertainty radius (m) at the launch end of the path. */
  launchUncertaintyM: number;
  /** Uncertainty radius (m) at the impact end of the path. */
  impactUncertaintyM: number;
  /** Number of samples along the path (default 24). */
  samples?: number;
}

export interface ReconstructedTrajectory {
  eventId: string;
  /** Ordered great-circle path samples, launch → impact. */
  path: LatLon[];
  /** Closed polygon ring (lon/lat pairs) of the uncertainty cone. */
  conePolygon: Array<[number, number]>;
  totalDistanceKm: number;
  /** GeoJSON Feature for the centre path line. */
  pathFeature: GeoJsonLineFeature;
  /** GeoJSON Feature for the uncertainty cone. */
  coneFeature: GeoJsonPolygonFeature;
}

export interface GeoJsonLineFeature {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: Array<[number, number]> };
  properties: { eventId: string; kind: "missile_path" };
}

export interface GeoJsonPolygonFeature {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: Array<Array<[number, number]>> };
  properties: { eventId: string; kind: "missile_uncertainty_cone" };
}

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const EARTH_R_KM = 6371;

/** Great-circle interpolation (slerp) between two lat/lon points, fraction f∈[0,1]. */
export function interpolateGreatCircle(a: LatLon, b: LatLon, f: number): LatLon {
  const φ1 = a.lat * DEG, λ1 = a.lon * DEG;
  const φ2 = b.lat * DEG, λ2 = b.lon * DEG;
  const Δφ = φ2 - φ1, Δλ = λ2 - λ1;
  const hav =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const δ = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
  if (δ === 0) return { lat: a.lat, lon: a.lon };
  const A = Math.sin((1 - f) * δ) / Math.sin(δ);
  const B = Math.sin(f * δ) / Math.sin(δ);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  const φi = Math.atan2(z, Math.sqrt(x * x + y * y));
  const λi = Math.atan2(y, x);
  return { lat: φi * RAD, lon: λi * RAD };
}

/** Initial bearing (radians) from a → b. */
function bearingRad(a: LatLon, b: LatLon): number {
  const φ1 = a.lat * DEG, φ2 = b.lat * DEG;
  const Δλ = (b.lon - a.lon) * DEG;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return Math.atan2(y, x);
}

/** Offset a point by distance (m) along a bearing (radians). */
function offset(p: LatLon, distanceM: number, bearing: number): LatLon {
  const δ = distanceM / 1000 / EARTH_R_KM;
  const φ1 = p.lat * DEG, λ1 = p.lon * DEG;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(bearing));
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return { lat: φ2 * RAD, lon: λ2 * RAD };
}

export function haversineKm(a: LatLon, b: LatLon): number {
  const Δφ = (b.lat - a.lat) * DEG;
  const Δλ = (b.lon - a.lon) * DEG;
  const h =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(Δλ / 2) ** 2;
  return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Reconstruct the centre path and a growing uncertainty cone.
 * The cone is built from per-sample perpendicular offsets whose half-width is
 * linearly interpolated between the impact and launch uncertainty radii.
 */
export function reconstructTrajectory(input: TrajectoryInput): ReconstructedTrajectory {
  const samples = Math.max(2, input.samples ?? 24);
  const { launch, impact } = input;

  const path: LatLon[] = [];
  const leftEdge: LatLon[] = [];
  const rightEdge: LatLon[] = [];

  for (let i = 0; i < samples; i++) {
    const f = i / (samples - 1);
    const centre = interpolateGreatCircle(launch, impact, f);
    path.push(centre);

    // Half-width grows from impact (f=1) toward launch (f=0).
    const halfWidthM =
      input.impactUncertaintyM + (input.launchUncertaintyM - input.impactUncertaintyM) * (1 - f);

    const next = interpolateGreatCircle(launch, impact, Math.min(1, f + 1e-3));
    const along = bearingRad(centre, next);
    leftEdge.push(offset(centre, halfWidthM, along - Math.PI / 2));
    rightEdge.push(offset(centre, halfWidthM, along + Math.PI / 2));
  }

  // Ring: left edge launch→impact, then right edge impact→launch, closed.
  const ring: Array<[number, number]> = [
    ...leftEdge.map((p) => [p.lon, p.lat] as [number, number]),
    ...rightEdge.reverse().map((p) => [p.lon, p.lat] as [number, number]),
  ];
  ring.push(ring[0]);

  const pathCoords = path.map((p) => [p.lon, p.lat] as [number, number]);

  return {
    eventId: input.eventId,
    path,
    conePolygon: ring,
    totalDistanceKm: haversineKm(launch, impact),
    pathFeature: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: pathCoords },
      properties: { eventId: input.eventId, kind: "missile_path" },
    },
    coneFeature: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [ring] },
      properties: { eventId: input.eventId, kind: "missile_uncertainty_cone" },
    },
  };
}
