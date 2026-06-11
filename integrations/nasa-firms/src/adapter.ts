import type { SourceAdapter, RawPayload, NormaliseResult } from "@ua-map/ingest";
import { FIRMSClient, type FIRMSFirePointNormalized, type FIRMSConfig } from "./client";
import { monotonicFactory } from "ulid";
import crypto from "node:crypto";

const ulid = monotonicFactory();

export class NASAFIRMSAdapter implements SourceAdapter {
  readonly source_id = "nasa_firms";
  readonly display_name = "NASA FIRMS (Active Fires)";

  private readonly client: FIRMSClient;

  constructor(config: FIRMSConfig) {
    this.client = new FIRMSClient(config);
  }

  async *fetchSince(_cursor: string | undefined): AsyncGenerator<RawPayload> {
    const points = await this.client.fetchActive();
    for (const point of points) {
      const payload = JSON.stringify(point);
      const content_hash = crypto.createHash("sha256").update(payload).digest("hex");
      yield {
        source_id: this.source_id,
        external_id: `${point.latitude}_${point.longitude}_${point.acquired_at}`,
        fetched_at: new Date().toISOString(),
        payload: point,
        content_hash,
      };
    }
  }

  normalise(raw: RawPayload): NormaliseResult {
    const point = raw.payload as FIRMSFirePointNormalized;
    const event_id = ulid();

    return {
      raw,
      event: {
        event_id,
        ingested_at: raw.fetched_at,
        occurred_at: point.acquired_at,
        reported_at: point.acquired_at,
        location: {
          point: { lat: point.latitude, lng: point.longitude },
          precision_m: 375, // VIIRS pixel resolution
          geocoding_method: "coordinate_literal",
        },
        class: "environmental",
        subclass: "wildfire",
        severity: point.frp_mw > 100 ? 3 : point.frp_mw > 30 ? 2 : 1,
        danger_score: Math.round(Math.min((point.frp_mw / 500) * 100, 100)),
        confidence: point.confidence,
        sources: [
          {
            source_id: this.source_id,
            url: "https://firms.modaps.eosdis.nasa.gov/",
            fetched_at: raw.fetched_at,
            language: "en",
            original_text_hash: raw.content_hash,
          },
        ],
        summary: {
          en: `Active fire detected by ${point.instrument} (${point.satellite}). FRP: ${point.frp_mw.toFixed(1)} MW. Data is ~3h delayed (NRT).`,
          uk: `Активне вогнище виявлено ${point.instrument} (${point.satellite}). FRP: ${point.frp_mw.toFixed(1)} МВт. Затримка даних ~3 год (NRT).`,
        },
        verification_state: "ingested",
        schema_version: "1",
      },
    };
  }

  async healthCheck() {
    return {
      source_id: this.source_id,
      healthy: true,
    };
  }
}
