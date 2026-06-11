/**
 * Spatial clustering of events using DBSCAN.
 *
 * Groups nearby events to detect spatial concentration anomalies.
 * Uses haversine distance; no external dependencies.
 */

export interface SpatialPoint {
  id: string;
  lat: number;
  lon: number;
  timestampMs: number;
  eventClass: string;
}

export interface SpatialCluster {
  clusterId: number;
  points: SpatialPoint[];
  centroid: { lat: number; lon: number };
  radiusKm: number;
  dominantClass: string;
  spanMs: number;
}

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

function centroid(pts: SpatialPoint[]): { lat: number; lon: number } {
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lon = pts.reduce((s, p) => s + p.lon, 0) / pts.length;
  return { lat, lon };
}

function maxRadius(pts: SpatialPoint[], center: { lat: number; lon: number }): number {
  return Math.max(...pts.map((p) => haversineKm(center.lat, center.lon, p.lat, p.lon)));
}

function dominantClass(pts: SpatialPoint[]): string {
  const counts = new Map<string, number>();
  for (const p of pts) counts.set(p.eventClass, (counts.get(p.eventClass) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
}

/**
 * DBSCAN spatial clustering.
 *
 * @param points     Input points
 * @param epsKm      Neighbourhood radius in km (default 15 km)
 * @param minPts     Minimum cluster size (default 3)
 */
export function dbscan(
  points: SpatialPoint[],
  epsKm = 15,
  minPts = 3,
): { clusters: SpatialCluster[]; noise: SpatialPoint[] } {
  const labels = new Array<number | null>(points.length).fill(null);
  // -1 = noise, 0+ = cluster id
  let clusterId = 0;

  function rangeQuery(idx: number): number[] {
    const p = points[idx];
    return points
      .map((q, i) => ({ i, dist: haversineKm(p.lat, p.lon, q.lat, q.lon) }))
      .filter((x) => x.dist <= epsKm)
      .map((x) => x.i);
  }

  for (let i = 0; i < points.length; i++) {
    if (labels[i] !== null) continue;
    const neighbors = rangeQuery(i);
    if (neighbors.length < minPts) {
      labels[i] = -1; // noise
      continue;
    }
    labels[i] = clusterId;
    const seed = new Set(neighbors);
    seed.delete(i);

    for (const j of seed) {
      if (labels[j] === -1) labels[j] = clusterId;
      if (labels[j] !== null) continue;
      labels[j] = clusterId;
      const jNeighbors = rangeQuery(j);
      if (jNeighbors.length >= minPts) {
        for (const k of jNeighbors) seed.add(k);
      }
    }
    clusterId++;
  }

  const clusterMap = new Map<number, SpatialPoint[]>();
  const noise: SpatialPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    const label = labels[i];
    if (label === null || label === -1) {
      noise.push(points[i]);
    } else {
      if (!clusterMap.has(label)) clusterMap.set(label, []);
      clusterMap.get(label)!.push(points[i]);
    }
  }

  const clusters: SpatialCluster[] = [];
  for (const [id, pts] of clusterMap) {
    const c = centroid(pts);
    const tMin = Math.min(...pts.map((p) => p.timestampMs));
    const tMax = Math.max(...pts.map((p) => p.timestampMs));
    clusters.push({
      clusterId: id,
      points: pts,
      centroid: c,
      radiusKm: maxRadius(pts, c),
      dominantClass: dominantClass(pts),
      spanMs: tMax - tMin,
    });
  }

  return { clusters, noise };
}

// ── Anomaly signals from clusters ─────────────────────────────────────────────

export interface ClusterAnomaly {
  clusterId: number;
  centroid: { lat: number; lon: number };
  eventCount: number;
  radiusKm: number;
  dominantClass: string;
  /** true if cluster formed within a short time window → surge */
  isSurge: boolean;
  /** Surge window in ms */
  surgeWindowMs: number;
}

/** Flag clusters that formed rapidly (events concentrated in time + space) */
export function detectSurges(
  clusters: SpatialCluster[],
  surgeWindowMs = 3_600_000, // 1 hour
): ClusterAnomaly[] {
  return clusters
    .filter((c) => c.spanMs <= surgeWindowMs)
    .map((c) => ({
      clusterId: c.clusterId,
      centroid: c.centroid,
      eventCount: c.points.length,
      radiusKm: c.radiusKm,
      dominantClass: c.dominantClass,
      isSurge: true,
      surgeWindowMs: c.spanMs,
    }));
}
