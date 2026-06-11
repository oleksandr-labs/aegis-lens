/**
 * Per-event "verify cues" panel model.
 *
 * The UI shows analysts (and, for verified events, the public) WHY a drone event
 * is classified as it is: the visual, audio, and sensor cues that support it. This
 * module defines the typed cue model surfaced to that panel and a builder that
 * assembles cues from a DroneEvent plus optional visual/audio classifier outputs.
 */

import { DroneEvent, FieldConfidence } from "./types";

export type CueChannel = "visual" | "audio" | "sensor" | "osint";

export interface VerifyCue {
  channel: CueChannel;
  /** Short machine key, e.g. "silhouette_match", "engine_buzz". */
  key: string;
  labelEn: string;
  labelUk: string;
  /** 0–1 strength of this individual cue. */
  strength: number;
  /** Optional supporting detail (model name, sensor id, source url). */
  detail?: string;
}

export interface VerifyCuesPanel {
  eventId: string;
  cues: VerifyCue[];
  /** Aggregate 0–1 corroboration across channels present. */
  aggregateStrength: number;
  /** Distinct channels that contributed at least one cue. */
  channelsPresent: CueChannel[];
}

export interface VerifyCuesInput {
  event: DroneEvent;
  /** Visual silhouette classifier output, if run. */
  visual?: FieldConfidence;
  /** Audio classifier output, if run. */
  audio?: FieldConfidence;
  /** Sensor corroboration (e.g. ADS-B anomaly, acoustic array hit). */
  sensorHits?: Array<{ sensorId: string; confidence: number; kind: string }>;
}

/** Assemble the verify-cues panel for an event. */
export function buildVerifyCues(input: VerifyCuesInput): VerifyCuesPanel {
  const cues: VerifyCue[] = [];
  const { event } = input;

  if (input.visual) {
    cues.push({
      channel: "visual",
      key: "silhouette_match",
      labelEn: "Visual silhouette match",
      labelUk: "Збіг за візуальним силуетом",
      strength: input.visual.confidence,
      detail: input.visual.value,
    });
  }

  if (input.audio) {
    cues.push({
      channel: "audio",
      key: "engine_signature",
      labelEn: "Acoustic engine signature",
      labelUk: "Акустичний сигнал двигуна",
      strength: input.audio.confidence,
      detail: input.audio.value,
    });
  }

  for (const hit of input.sensorHits ?? []) {
    cues.push({
      channel: "sensor",
      key: hit.kind,
      labelEn: `Sensor corroboration (${hit.kind})`,
      labelUk: `Підтвердження сенсора (${hit.kind})`,
      strength: hit.confidence,
      detail: hit.sensorId,
    });
  }

  // OSINT cue: independent sources backing the event's model identification.
  if (event.model && event.model.sourceCount > 1) {
    cues.push({
      channel: "osint",
      key: "multi_source",
      labelEn: `${event.model.sourceCount} independent OSINT sources`,
      labelUk: `${event.model.sourceCount} незалежних OSINT-джерел`,
      strength: Math.min(1, event.model.sourceCount / 3),
      detail: event.model.value,
    });
  }

  const channelsPresent = [...new Set(cues.map((c) => c.channel))];
  const aggregateStrength =
    cues.length === 0
      ? 0
      : parseFloat((cues.reduce((s, c) => s + c.strength, 0) / cues.length).toFixed(3));

  return { eventId: event.eventId, cues, aggregateStrength, channelsPresent };
}
