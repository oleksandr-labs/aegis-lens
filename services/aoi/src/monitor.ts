import type { AOI, AOIEventMatch } from "./types";
import { pointInAOI, aoiBoundingBox } from "./geo-utils";
import type { CanonicalEvent } from "@ua-map/schema";

export interface AOIStore {
  getAllActive(): Promise<AOI[]>;
  recordMatch(match: AOIEventMatch): Promise<void>;
  getMatchesForAOI(aoiId: string, since?: string): Promise<AOIEventMatch[]>;
}

/**
 * For each incoming event, check all active AOIs and record matches.
 * Returns the list of AOI IDs that matched.
 *
 * In production this should be a PostGIS ST_Within query, not a JS loop.
 * This implementation is correct for small AOI counts (<1000) or pre-filtered sets.
 */
export async function matchEventToAOIs(
  event: Pick<CanonicalEvent, "event_id" | "ingested_at" | "location">,
  store: AOIStore,
): Promise<string[]> {
  if (!event.location) return [];

  const { lat, lng } = event.location.point;
  const aois = await store.getAllActive();

  const matched: string[] = [];

  for (const aoi of aois) {
    // Fast bbox pre-filter
    const [west, south, east, north] = aoiBoundingBox(aoi.geometry);
    if (lng < west || lng > east || lat < south || lat > north) continue;

    // Precise check
    if (!pointInAOI(lat, lng, aoi.geometry)) continue;

    matched.push(aoi.aoi_id);
    await store.recordMatch({
      aoi_id: aoi.aoi_id,
      event_id: event.event_id,
      matched_at: new Date().toISOString(),
    });
  }

  return matched;
}

/** In-memory AOI store for tests */
export class InMemoryAOIStore implements AOIStore {
  private readonly aois = new Map<string, AOI>();
  private readonly matches: AOIEventMatch[] = [];

  upsert(aoi: AOI): void {
    this.aois.set(aoi.aoi_id, aoi);
  }

  async getAllActive(): Promise<AOI[]> {
    return [...this.aois.values()];
  }

  async recordMatch(match: AOIEventMatch): Promise<void> {
    this.matches.push(match);
  }

  async getMatchesForAOI(aoiId: string, since?: string): Promise<AOIEventMatch[]> {
    return this.matches.filter(
      (m) => m.aoi_id === aoiId && (!since || m.matched_at >= since),
    );
  }
}
