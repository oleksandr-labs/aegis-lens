/**
 * Webcam privacy adapter.
 * Normalizes eligible webcam frames to AegisEvent stream.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { WebcamIngestionClient } from "./client";
import type { WebcamFrame, WebcamConfig } from "./types";

export class WebcamAdapter implements SourceAdapter {
  constructor(private readonly client: WebcamIngestionClient) {}

  async *fetchSince(_since: Date): AsyncGenerator<RawPayload> {
    try {
      for await (const frame of this.client.ingest()) {
        yield {
          source_id: "webcam",
          external_id: `webcam:${frame.cam_id}:${frame.captured_at}`,
          collected_at: new Date().toISOString(),
          raw: frame,
        };
      }
    } catch {
      // Fail-soft
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const frame = payload.raw as WebcamFrame;

    return {
      event: {
        eventId: `webcam:${frame.cam_id}:${frame.captured_at}`,
        class: "environmental",
        subclass: "webcam_frame",
        severity: 0,
        summary: {
          en: `Webcam frame from ${frame.cam_id} at ${frame.captured_at}${frame.faces_detected ? " (faces blurred)" : ""}`,
          uk: null,
        },
        location: null, // Location enriched by caller using cam registry
        occurredAt: frame.captured_at,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: `cam://${frame.cam_id}`,
            archiveUrl: null,
            fetchedAt: frame.captured_at,
            language: "en",
            contentHash: payload.external_id,
          },
        ],
        media: [
          {
            type: "image" as const,
            url: `data:${frame.mime_type};base64,${frame.image_b64.slice(0, 64)}...`,
          },
        ],
        originalText: `Camera ${frame.cam_id}: frame captured ${frame.captured_at}`,
      },
      sourceWeight: 0.85,
      language: "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
