/**
 * Spire Maritime API client (commercial — Phase 2).
 *
 * Spire provides satellite + terrestrial AIS with global ocean coverage,
 * including areas where terrestrial AIS (AISStream) goes blind. It is a paid,
 * contract-gated commercial source, so this is the codeable/documented contract:
 * a typed client + adapter to our canonical `VesselPosition`, gated behind a
 * Phase-2 flag and a real API token, with a small demo fixture so the shape is
 * exercisable without a contract. See `COMPLIANCE.md`.
 *
 * Spire vessels GraphQL API: https://documentation.spire.com/maritime-2-0/
 * No secrets in code — token comes from `process.env.SPIRE_API_TOKEN`.
 */

import type { VesselPosition, NavigationStatus, ShipType } from "./types";

export interface SpireConfig {
  /** Bearer token; falls back to process.env.SPIRE_API_TOKEN. */
  token?: string;
  /** GraphQL endpoint override. */
  endpoint?: string;
  /**
   * Phase gate. Spire is a Phase-2 commercial source; live calls are refused
   * unless this is true AND a token is present. Defaults from
   * process.env.AIS_PHASE2_ENABLED === "true".
   */
  phase2Enabled?: boolean;
  /** Polite request floor in ms. */
  minIntervalMs?: number;
}

/** Raw Spire vessel node (subset of the maritime 2.0 schema we consume). */
export interface SpireVesselNode {
  staticData: {
    mmsi: number;
    imo: number | null;
    name: string | null;
    callsign: string | null;
    flag: string | null; // ISO alpha-2
    shipType: string | null; // e.g. "Tanker", "Cargo"
  };
  lastPositionUpdate: {
    latitude: number;
    longitude: number;
    speed: number | null; // knots (SOG)
    course: number | null;
    heading: number | null;
    navigationalStatus: string | null;
    timestamp: string; // ISO-8601 UTC
    collectionType: "satellite" | "terrestrial" | "dynamic" | null;
  } | null;
  currentVoyage: {
    destination: string | null;
    draught: number | null;
  } | null;
}

interface SpireResponse {
  data?: { vessels?: { nodes?: SpireVesselNode[] } };
  errors?: { message: string }[];
}

const SHIP_TYPE_MAP: Record<string, ShipType> = {
  tanker: "tanker",
  cargo: "cargo",
  passenger: "passenger",
  military: "military",
  sailing: "sailing",
  pleasure: "pleasure",
  fishing: "fishing",
  tug: "tugboat",
  tugboat: "tugboat",
  pilot: "pilot",
  "search and rescue": "sar",
};

const NAV_STATUS_MAP: Record<string, NavigationStatus> = {
  under_way_using_engine: "under_way_engine",
  at_anchor: "at_anchor",
  not_under_command: "not_under_command",
  restricted_maneuverability: "restricted_maneuverability",
  constrained_by_draught: "constrained_by_draught",
  moored: "moored",
  aground: "aground",
  engaged_in_fishing: "engaged_fishing",
  under_way_sailing: "under_way_sailing",
};

function mapShipType(raw: string | null): ShipType {
  if (!raw) return "unknown";
  return SHIP_TYPE_MAP[raw.trim().toLowerCase()] ?? "other";
}

function mapNavStatus(raw: string | null): NavigationStatus {
  if (!raw) return "unknown";
  return NAV_STATUS_MAP[raw.trim().toLowerCase()] ?? "unknown";
}

/** Adapt one Spire vessel node → canonical VesselPosition (or null if no fix). */
export function adaptSpireVessel(node: SpireVesselNode): VesselPosition | null {
  const pos = node.lastPositionUpdate;
  if (!pos) return null;
  const s = node.staticData;
  return {
    mmsi: String(s.mmsi),
    imo: s.imo ? String(s.imo) : null,
    callsign: s.callsign?.trim() || null,
    ship_name: s.name?.trim() || null,
    ship_type: mapShipType(s.shipType),
    latitude: pos.latitude,
    longitude: pos.longitude,
    speed_knots: pos.speed ?? null,
    course_deg: pos.course ?? null,
    heading_deg: pos.heading ?? null,
    nav_status: mapNavStatus(pos.navigationalStatus),
    timestamp: pos.timestamp,
    msg_type: pos.collectionType === "satellite" ? 27 : 1,
    destination: node.currentVoyage?.destination?.trim() || null,
    draught_m: node.currentVoyage?.draught ?? null,
    flag: s.flag?.trim()?.toUpperCase() || null,
  };
}

const DEFAULT_ENDPOINT = "https://api.spire.com/graphql";

/** A small demo node so callers can exercise the shape without a contract. */
export const SPIRE_DEMO_NODE: SpireVesselNode = {
  staticData: {
    mmsi: 273123456,
    imo: 9123456,
    name: "DEMO TANKER",
    callsign: "DEMO1",
    flag: "RU",
    shipType: "Tanker",
  },
  lastPositionUpdate: {
    latitude: 44.61,
    longitude: 30.12,
    speed: 11.2,
    course: 187,
    heading: 188,
    navigationalStatus: "under_way_using_engine",
    timestamp: "2026-06-06T00:00:00Z",
    collectionType: "satellite",
  },
  currentVoyage: { destination: "STS", draught: 14.2 },
};

export class SpireMaritimeClient {
  private readonly token: string | undefined;
  private readonly endpoint: string;
  private readonly phase2Enabled: boolean;
  readonly minIntervalMs: number;

  constructor(config: SpireConfig = {}) {
    this.token = config.token ?? process.env.SPIRE_API_TOKEN;
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.phase2Enabled =
      config.phase2Enabled ?? process.env.AIS_PHASE2_ENABLED === "true";
    this.minIntervalMs = config.minIntervalMs ?? 1_000;
  }

  /** True only when Phase 2 is enabled AND a token is configured. */
  get enabled(): boolean {
    return this.phase2Enabled && Boolean(this.token);
  }

  /**
   * Query vessels inside a bounding box.
   * Refuses to make a live call unless Phase 2 is enabled and a token exists —
   * Spire is a commercial source that must not be hit without a contract.
   */
  async getVesselsInBbox(bbox: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  }): Promise<VesselPosition[]> {
    if (!this.enabled) {
      throw new Error(
        "Spire Maritime is a Phase-2 commercial source: set AIS_PHASE2_ENABLED=true and SPIRE_API_TOKEN (see COMPLIANCE.md).",
      );
    }

    const query = /* GraphQL */ `
      query VesselsInBbox($poly: [[[Float!]!]!]!) {
        vessels(boundingBox: $poly) {
          nodes {
            staticData { mmsi imo name callsign flag shipType }
            lastPositionUpdate {
              latitude longitude speed course heading
              navigationalStatus timestamp collectionType
            }
            currentVoyage { destination draught }
          }
        }
      }`;

    const poly = [[
      [bbox.minLon, bbox.minLat],
      [bbox.maxLon, bbox.minLat],
      [bbox.maxLon, bbox.maxLat],
      [bbox.minLon, bbox.maxLat],
      [bbox.minLon, bbox.minLat],
    ]];

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { poly } }),
      signal: AbortSignal.timeout(30_000),
    });

    if (res.status === 429) throw new Error("Spire rate limit hit");
    if (!res.ok) throw new Error(`Spire API error ${res.status}`);

    const json: SpireResponse = await res.json();
    if (json.errors?.length) {
      throw new Error(`Spire GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
    }

    const nodes = json.data?.vessels?.nodes ?? [];
    return nodes
      .map((n) => adaptSpireVessel(n))
      .filter((v): v is VesselPosition => v !== null);
  }

  /** Demo positions usable without a contract (uses the bundled fixture). */
  demo(): VesselPosition[] {
    const v = adaptSpireVessel(SPIRE_DEMO_NODE);
    return v ? [v] : [];
  }
}
