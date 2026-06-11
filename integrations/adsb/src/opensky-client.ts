import type { AircraftState } from "./types";

/**
 * OpenSky Network REST API client.
 * Free tier: 400 API credits/day, 10s minimum polling interval.
 * Research / commercial tiers have higher limits.
 * Docs: https://openskynetwork.github.io/opensky-api/
 */

export interface OpenSkyConfig {
  username?: string;
  password?: string;
  /** Polling interval ms. Min 10_000 for anonymous, 5_000 for authenticated. */
  pollIntervalMs?: number;
  baseUrl?: string;
}

interface OpenSkyStateVector {
  // [icao24, callsign, origin_country, time_position, last_contact,
  //  longitude, latitude, baro_altitude, on_ground, velocity,
  //  true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
  0: string;
  1: string | null;
  2: string;
  3: number | null;
  4: number;
  5: number | null;
  6: number | null;
  7: number | null;
  8: boolean;
  9: number | null;
  10: number | null;
  11: number | null;
  12: number[] | null;
  13: number | null;
  14: string | null;
  15: boolean;
  16: number;
}

interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

export class OpenSkyClient {
  private readonly base: string;
  private readonly auth: string | undefined;
  readonly pollIntervalMs: number;

  constructor(config: OpenSkyConfig = {}) {
    this.base = config.baseUrl ?? "https://opensky-network.org/api";
    this.pollIntervalMs = config.pollIntervalMs ?? 15_000;
    if (config.username && config.password) {
      this.auth = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    }
  }

  /**
   * Fetch all aircraft within a bounding box.
   * @param lamin Minimum latitude
   * @param lomin Minimum longitude
   * @param lamax Maximum latitude
   * @param lomax Maximum longitude
   */
  async getStatesInBbox(
    lamin: number,
    lomin: number,
    lamax: number,
    lomax: number,
  ): Promise<AircraftState[]> {
    const params = new URLSearchParams({
      lamin: String(lamin),
      lomin: String(lomin),
      lamax: String(lamax),
      lomax: String(lomax),
    });

    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.auth) headers.Authorization = this.auth;

    const res = await fetch(`${this.base}/states/all?${params}`, {
      headers,
      signal: AbortSignal.timeout(30_000),
    });

    if (res.status === 429) throw new Error("OpenSky rate limit hit");
    if (!res.ok) throw new Error(`OpenSky API error ${res.status}`);

    const data: OpenSkyResponse = await res.json();
    if (!data.states) return [];

    return data.states.map((s) => this.parseState(s));
  }

  /** Fetch single aircraft by ICAO24 hex */
  async getAircraft(icao24: string): Promise<AircraftState | null> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.auth) headers.Authorization = this.auth;

    const res = await fetch(`${this.base}/states/all?icao24=${icao24}`, { headers });
    if (!res.ok) return null;

    const data: OpenSkyResponse = await res.json();
    const state = data.states?.[0];
    return state ? this.parseState(state) : null;
  }

  private parseState(s: OpenSkyStateVector): AircraftState {
    return {
      icao24: s[0],
      callsign: s[1]?.trim() || null,
      origin_country: s[2] || null,
      time_position: s[3],
      last_contact: s[4],
      longitude: s[5],
      latitude: s[6],
      baro_altitude: s[7],
      on_ground: s[8],
      velocity: s[9],
      true_track: s[10],
      vertical_rate: s[11],
      geo_altitude: s[13],
      squawk: s[14],
      spi: s[15],
      position_source: s[16] as 0 | 1 | 2 | 3,
    };
  }
}
