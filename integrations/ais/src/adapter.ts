import type { SourceAdapter, RawPayload, NormaliseResult } from "@ua-map/ingest";
import type { VesselPosition } from "./types";
import type { SanctionsStore } from "./sanctions";
import { screenVessel } from "./sanctions";
import crypto from "node:crypto";
import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

/**
 * AIS adapter that wraps a queue of vessel positions emitted by AISStreamClient.
 * The WebSocket client pushes to the queue; the pipeline drains it.
 */
export class AISAdapter implements SourceAdapter {
  readonly source_id = "ais_aisstream";
  readonly display_name = "AIS Maritime Tracking (AISStream)";

  private readonly queue: VesselPosition[] = [];

  constructor(private readonly sanctions: SanctionsStore) {}

  /** Called by AISStreamClient.onMessage */
  enqueue(position: VesselPosition): void {
    this.queue.push(position);
  }

  async *fetchSince(_cursor: string | undefined): AsyncGenerator<RawPayload> {
    // Drain current queue snapshot
    const batch = this.queue.splice(0, this.queue.length);
    const now = new Date().toISOString();

    for (const pos of batch) {
      const payload = JSON.stringify(pos);
      const content_hash = crypto
        .createHash("sha256")
        .update(`${pos.mmsi}:${pos.timestamp}:${pos.latitude}:${pos.longitude}`)
        .digest("hex");

      yield {
        source_id: this.source_id,
        external_id: `${pos.mmsi}:${pos.timestamp}`,
        fetched_at: now,
        payload: pos,
        content_hash,
      };
    }
  }

  normalise(raw: RawPayload): NormaliseResult {
    const pos = raw.payload as VesselPosition;

    return {
      raw,
      event: {
        event_id: ulid(),
        ingested_at: raw.fetched_at,
        occurred_at: pos.timestamp,
        location: {
          point: { lat: pos.latitude, lng: pos.longitude },
          precision_m: 50,
          geocoding_method: "coordinate_literal",
        },
        class: "maritime",
        subclass: pos.ship_type === "military" ? "naval_action" : "vessel_movement",
        severity: pos.ship_type === "military" ? 1 : 0,
        danger_score: pos.ship_type === "military" ? 20 : 0,
        confidence: 0.85,
        sources: [
          {
            source_id: this.source_id,
            url: `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${pos.mmsi}`,
            fetched_at: raw.fetched_at,
            language: "en",
            original_text_hash: raw.content_hash,
            source_weight: 0.8,
          },
        ],
        summary: {
          en: `${pos.ship_type.toUpperCase()} vessel ${pos.ship_name ?? pos.mmsi} (${pos.flag ?? "unknown flag"}) at ${pos.speed_knots?.toFixed(1) ?? "?"}kn heading ${pos.course_deg?.toFixed(0) ?? "?"}°.${pos.destination ? ` Destination: ${pos.destination}.` : ""}`,
          uk: `Судно типу ${pos.ship_type} ${pos.ship_name ?? pos.mmsi} (прапор: ${pos.flag ?? "невідомо"}) на швидкості ${pos.speed_knots?.toFixed(1) ?? "?"}вузлів, курс ${pos.course_deg?.toFixed(0) ?? "?"}°.`,
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
