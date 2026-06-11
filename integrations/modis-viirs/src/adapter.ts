/**
 * MODIS NRT + VIIRS I-Band 375m adapter.
 * Normalizes fire/thermal records to AegisEvent stream.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { NasaFirmsExtendedClient } from "./client";
import type { ModisNrtRecord, ViirsNrtRecord } from "./types";

type RecordType = "modis" | "viirs";

interface NrtPayload {
  type: RecordType;
  record: ModisNrtRecord | ViirsNrtRecord;
}

function inferSeverityFromFrp(frp: number, confidence: number | string): 0 | 1 | 2 | 3 {
  const confNum =
    typeof confidence === "number"
      ? confidence / 100
      : confidence === "high"
      ? 0.9
      : confidence === "nominal"
      ? 0.7
      : 0.4;

  const weighted = frp * confNum;
  if (weighted > 500) return 3;
  if (weighted > 100) return 2;
  if (weighted > 10) return 1;
  return 0;
}

export class ModisViirsAdapter implements SourceAdapter {
  constructor(private readonly client: NasaFirmsExtendedClient) {}

  async *fetchSince(_since: Date): AsyncGenerator<RawPayload> {
    try {
      const { modis, viirs } = await this.client.fetchAll();

      for (const rec of modis) {
        yield {
          source_id: "modis-nrt",
          external_id: `modis:${rec.latitude}:${rec.longitude}:${rec.acquired_at}`,
          collected_at: new Date().toISOString(),
          raw: { type: "modis", record: rec } satisfies NrtPayload,
        };
      }

      for (const rec of viirs) {
        yield {
          source_id: "viirs-nrt",
          external_id: `viirs:${rec.latitude}:${rec.longitude}:${rec.acquired_at}`,
          collected_at: new Date().toISOString(),
          raw: { type: "viirs", record: rec } satisfies NrtPayload,
        };
      }
    } catch {
      // Fail-soft
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const { type, record } = payload.raw as NrtPayload;

    const isModis = type === "modis";
    const modis = record as ModisNrtRecord;
    const viirs = record as ViirsNrtRecord;

    const frp = record.frp;
    const confidence = isModis ? modis.confidence : viirs.confidence;
    const satellite = record.satellite;
    const instrument = record.instrument;
    const precisionM = isModis ? 1_000 : 375;

    const summaryEn = `${instrument} thermal anomaly at (${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}), FRP=${frp} MW, satellite=${satellite}`;

    return {
      event: {
        eventId: `${type}:${payload.external_id}`,
        class: "environmental",
        subclass: "thermal_anomaly",
        severity: inferSeverityFromFrp(frp, confidence),
        summary: { en: summaryEn, uk: null },
        location: {
          lat: record.latitude,
          lon: record.longitude,
          precisionM,
        },
        occurredAt: record.acquired_at,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: "https://firms.modaps.eosdis.nasa.gov/",
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: "en",
            contentHash: payload.external_id,
          },
        ],
        media: [],
        originalText: summaryEn,
      },
      sourceWeight: 0.92,
      language: "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
