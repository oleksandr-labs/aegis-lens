/**
 * MarineTraffic / VesselFinder cross-reference.
 *
 * AISStream gives us live positions but thin static data. Commercial providers
 * (MarineTraffic, VesselFinder) hold richer vessel particulars — name, IMO,
 * flag, type, dimensions, photos. Their data is licensed; we cannot redistribute
 * it. So this module defines the typed cross-ref CONTRACT plus a deterministic
 * merge that any licensed adapter can feed, with provenance kept per field.
 */

import type { ShipType, VesselPosition } from "./types";

export type CrossRefProvider = "marinetraffic" | "vesselfinder" | "equasis" | "internal";

/** A vessel particulars record returned by an external provider. */
export interface ExternalVesselRef {
  provider: CrossRefProvider;
  mmsi: string;
  imo: string | null;
  ship_name: string | null;
  callsign: string | null;
  ship_type: ShipType | null;
  flag: string | null;
  length_m: number | null;
  width_m: number | null;
  gross_tonnage: number | null;
  year_built: number | null;
  /** Provider-stated photo / detail page (NOT redistributed imagery) */
  detail_url: string | null;
  /** When the provider record was fetched */
  fetched_at: string;
  /** Provider trust weight 0..1 (used to break ties on merge) */
  weight: number;
}

/** A field value tagged with the provider it came from. */
export interface Provenanced<T> {
  value: T;
  provider: CrossRefProvider;
  weight: number;
}

/** A merged vessel view assembled from AIS + one or more providers. */
export interface CrossReferencedVessel {
  mmsi: string;
  imo: Provenanced<string> | null;
  ship_name: Provenanced<string> | null;
  ship_type: Provenanced<ShipType> | null;
  flag: Provenanced<string> | null;
  length_m: Provenanced<number> | null;
  gross_tonnage: Provenanced<number> | null;
  year_built: Provenanced<number> | null;
  /** Detail pages from each contributing provider */
  references: { provider: CrossRefProvider; url: string }[];
  /** Providers whose records disagreed on a field (name/flag/type) */
  conflicts: string[];
  /** How many distinct providers (incl. AIS) contributed */
  sourceCount: number;
}

const PROVIDER_WEIGHT: Record<CrossRefProvider, number> = {
  equasis: 0.95, // IMO-authoritative registry mirror
  marinetraffic: 0.85,
  vesselfinder: 0.8,
  internal: 0.7,
};

/**
 * Merge a live AIS position with a set of external references.
 * For each field we keep the highest-weight non-null value and flag conflicts
 * when two providers disagree on a meaningful field.
 */
export function mergeVesselRefs(
  ais: VesselPosition,
  refs: ExternalVesselRef[],
): CrossReferencedVessel {
  const all: ExternalVesselRef[] = [
    {
      provider: "internal",
      mmsi: ais.mmsi,
      imo: ais.imo,
      ship_name: ais.ship_name,
      callsign: ais.callsign,
      ship_type: ais.ship_type,
      flag: ais.flag,
      length_m: null,
      width_m: null,
      gross_tonnage: null,
      year_built: null,
      detail_url: null,
      fetched_at: ais.timestamp,
      weight: PROVIDER_WEIGHT.internal,
    },
    ...refs.map((r) => ({ ...r, weight: r.weight || PROVIDER_WEIGHT[r.provider] })),
  ];

  const conflicts: string[] = [];

  const pick = <K extends keyof ExternalVesselRef>(
    field: K,
    detectConflict: boolean,
  ): Provenanced<NonNullable<ExternalVesselRef[K]>> | null => {
    const candidates = all
      .filter((r) => r[field] !== null && r[field] !== undefined && r[field] !== "")
      .sort((a, b) => b.weight - a.weight);
    if (candidates.length === 0) return null;
    if (detectConflict) {
      const distinct = new Set(candidates.map((c) => String(c[field]).toLowerCase()));
      if (distinct.size > 1) conflicts.push(String(field));
    }
    const top = candidates[0];
    return {
      value: top[field] as NonNullable<ExternalVesselRef[K]>,
      provider: top.provider,
      weight: top.weight,
    };
  };

  const references = all
    .filter((r) => r.detail_url)
    .map((r) => ({ provider: r.provider, url: r.detail_url as string }));

  return {
    mmsi: ais.mmsi,
    imo: pick("imo", true) as Provenanced<string> | null,
    ship_name: pick("ship_name", true) as Provenanced<string> | null,
    ship_type: pick("ship_type", true) as Provenanced<ShipType> | null,
    flag: pick("flag", true) as Provenanced<string> | null,
    length_m: pick("length_m", false) as Provenanced<number> | null,
    gross_tonnage: pick("gross_tonnage", false) as Provenanced<number> | null,
    year_built: pick("year_built", false) as Provenanced<number> | null,
    references,
    conflicts: Array.from(new Set(conflicts)),
    sourceCount: new Set(all.map((r) => r.provider)).size,
  };
}
