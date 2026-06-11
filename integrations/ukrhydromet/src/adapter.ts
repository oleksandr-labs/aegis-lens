/**
 * Adapter — normalize Ukrhydromet records into the canonical Aegis event model
 * (packages/event-schema `AegisEventV1`).
 *
 * We map the two operationally-significant product surfaces to events:
 *   - SevereWarning  → class "other", subclass "severe_weather"
 *   - RiverGauge (adverse/danger) → class "other", subclass "flood"
 * Normal forecasts are NOT emitted as events — they feed the overlay directly
 * (see source-preference.ts / the API route), mirroring the open-meteo adapter
 * which only yields actionable signals.
 */

import {
  EVENT_SCHEMA_VERSION,
  type AegisEventV1,
} from "@aegis/event-schema";
import type { SevereWarning, RiverGauge } from "./types";
import { OBLAST_GEO, WARNING_LEVEL_SEVERITY, FLOOD_RISK_LABELS, PHENOMENON_LABELS } from "./types";

const SOURCE_URL = "https://www.meteo.gov.ua/";

interface AdapterOptions {
  orgId?: string;
  isPublic?: boolean;
}

/** Map a severe-weather warning to a canonical event. */
export function severeWarningToEvent(w: SevereWarning, opts: AdapterOptions = {}): AegisEventV1 {
  const geo = OBLAST_GEO[w.oblast];
  const now = new Date().toISOString();
  const ph = PHENOMENON_LABELS[w.phenomenon];
  return {
    eventId: `ukrhydromet:warning:${w.warningId}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "other",
    subclass: "severe_weather",
    location: { lat: geo.center[1], lon: geo.center[0], uncertaintyM: 60_000 },
    country: "UA",
    regionCode: w.oblast,
    severity: WARNING_LEVEL_SEVERITY[w.level],
    confidence: 0.95, // national authority
    verificationState: "verified",
    occurredAt: w.onsetAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `${ph.en} warning (${w.level}) — ${geo.nameEn} Oblast`,
      uk: `Попередження: ${ph.uk} (${w.level}) — ${geo.nameUk} область`,
    },
    summary: { en: w.headline.en, uk: w.headline.uk },
    originalText: w.headline.uk,
    citations: [{ sourceId: "ukrhydromet", sourceType: "official_statement", url: SOURCE_URL, capturedAt: w.issuedAt }],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    rawPayload: w,
  };
}

/** Map a flood-risk gauge reading to a canonical event (adverse/danger only). */
export function gaugeToEvent(g: RiverGauge, opts: AdapterOptions = {}): AegisEventV1 {
  const now = new Date().toISOString();
  const band = FLOOD_RISK_LABELS[g.risk];
  return {
    eventId: `ukrhydromet:flood:${g.gaugeId}:${g.measuredAt}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "other",
    subclass: "flood",
    location: { lat: g.lat, lon: g.lon, uncertaintyM: 2_000 },
    country: "UA",
    regionCode: g.oblast,
    severity: band.severity,
    confidence: 0.95,
    verificationState: "verified",
    occurredAt: g.measuredAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `${band.en}: ${g.riverEn} at ${g.stationEn}`,
      uk: `${band.uk}: р. ${g.riverUk}, ${g.stationUk}`,
    },
    summary: {
      en: `${g.riverEn} at ${g.stationEn}: ${g.levelCm} cm (${g.changeCm24h >= 0 ? "+" : ""}${g.changeCm24h} cm/24h). Adverse mark ${g.adverseMarkCm} cm, danger mark ${g.dangerMarkCm} cm.`,
      uk: `р. ${g.riverUk}, ${g.stationUk}: ${g.levelCm} см (${g.changeCm24h >= 0 ? "+" : ""}${g.changeCm24h} см/добу). Несприятлива позначка ${g.adverseMarkCm} см, небезпечна ${g.dangerMarkCm} см.`,
    },
    citations: [{ sourceId: "ukrhydromet", sourceType: "official_statement", url: SOURCE_URL, capturedAt: g.measuredAt }],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    rawPayload: g,
  };
}
