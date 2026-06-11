import type { SourceAdapter, RawPayload, NormaliseResult } from "@ua-map/ingest";
import { OpenSkyClient, type OpenSkyConfig } from "./opensky-client";
import type { AircraftDatabase } from "./aircraft-db";
import type { AircraftState } from "./types";
import crypto from "node:crypto";
import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

/** Ukraine + surrounding airspace bounding box */
const UA_BBOX = { lamin: 44.0, lomin: 22.0, lamax: 52.5, lomax: 40.5 } as const;

export interface ADSBAdapterConfig {
  openSky?: OpenSkyConfig;
  /** Override bounding box */
  bbox?: { lamin: number; lomin: number; lamax: number; lomax: number };
}

export class ADSBAdapter implements SourceAdapter {
  readonly source_id = "adsb_opensky";
  readonly display_name = "ADS-B (OpenSky Network)";

  private readonly client: OpenSkyClient;
  private readonly bbox: typeof UA_BBOX;

  constructor(
    config: ADSBAdapterConfig,
    private readonly aircraftDb: AircraftDatabase,
  ) {
    this.client = new OpenSkyClient(config.openSky ?? {});
    this.bbox = config.bbox ?? UA_BBOX;
  }

  async *fetchSince(_cursor: string | undefined): AsyncGenerator<RawPayload> {
    const states = await this.client.getStatesInBbox(
      this.bbox.lamin,
      this.bbox.lomin,
      this.bbox.lamax,
      this.bbox.lomax,
    );

    const now = new Date().toISOString();
    for (const state of states) {
      if (!state.latitude || !state.longitude) continue;

      const record = await this.aircraftDb.lookup(state.icao24);
      const payload = { state, aircraft: record };
      const content_hash = crypto
        .createHash("sha256")
        .update(`${state.icao24}:${state.time_position ?? state.last_contact}:${state.latitude}:${state.longitude}`)
        .digest("hex");

      yield {
        source_id: this.source_id,
        external_id: `${state.icao24}:${state.time_position ?? state.last_contact}`,
        fetched_at: now,
        payload,
        content_hash,
      };
    }
  }

  normalise(raw: RawPayload): NormaliseResult {
    const { state, aircraft } = raw.payload as { state: AircraftState; aircraft: ReturnType<AircraftDatabase["lookup"]> extends Promise<infer T> ? T : never };

    const isMil = aircraft?.is_military ?? false;

    return {
      raw,
      event: {
        event_id: ulid(),
        ingested_at: raw.fetched_at,
        occurred_at: state.time_position ? new Date(state.time_position * 1000).toISOString() : raw.fetched_at,
        location: {
          point: { lat: state.latitude!, lng: state.longitude! },
          precision_m: 100,
          geocoding_method: "coordinate_literal",
        },
        class: "aviation",
        subclass: isMil ? "military_flight" : "civilian_flight",
        severity: isMil ? 1 : 0,
        danger_score: isMil ? 15 : 0,
        confidence: 0.9,
        sources: [
          {
            source_id: this.source_id,
            url: `https://opensky-network.org/aircraft-profile?icao24=${state.icao24}`,
            fetched_at: raw.fetched_at,
            language: "en",
            original_text_hash: raw.content_hash,
            source_weight: 0.85,
          },
        ],
        summary: {
          en: `Aircraft ${state.callsign ?? state.icao24}${aircraft?.model ? ` (${aircraft.model})` : ""} at FL${Math.round((state.baro_altitude ?? 0) / 30.48)} ${state.on_ground ? "on ground" : "airborne"}. Operator: ${aircraft?.operator ?? "unknown"}.`,
          uk: `Літак ${state.callsign ?? state.icao24}${aircraft?.model ? ` (${aircraft.model})` : ""} на FL${Math.round((state.baro_altitude ?? 0) / 30.48)} ${state.on_ground ? "на землі" : "у повітрі"}. Оператор: ${aircraft?.operator ?? "невідомо"}.`,
        },
        verification_state: "ingested",
        schema_version: "1",
      },
    };
  }

  async healthCheck() {
    return { source_id: this.source_id, healthy: true };
  }
}
