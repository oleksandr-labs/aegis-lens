/**
 * Adapter: DSNS raw report → DsnsEmergencyEvent → canonical AegisEventV1.
 *
 * Pipeline per report:
 *   classify (event-extractor) → geocode (geocode) → build typed emergency
 *   event → map to packages/event-schema v1.
 *
 * Source / evidence URLs are preserved as citations. Confidence flows from the
 * classifier into the canonical `confidence` field.
 */

import type { AegisEventV1, EventClass } from "@ua-map/event-schema";
import { EVENT_SCHEMA_VERSION } from "@ua-map/event-schema";
import type { DsnsRawReport, DsnsEmergencyEvent, EmergencyType } from "./types";
import { EMERGENCY_TYPE_META } from "./types";
import { extractEmergency } from "./event-extractor";
import { OBLASTS } from "./oblast-branches";
import { defaultGeocoder, type Geocoder } from "./geocode";
import { detectEvacuationOrder } from "./civilian-guidance";

/** Build a typed DSNS emergency event from a raw report. */
export async function toEmergencyEvent(
  report: DsnsRawReport,
  geocoder: Geocoder = defaultGeocoder,
): Promise<DsnsEmergencyEvent> {
  const { classification, severity } = extractEmergency(report);
  const meta = EMERGENCY_TYPE_META[classification.type];

  const oblast = report.oblast;
  const oblastInfo = oblast ? OBLASTS[oblast] : undefined;

  const geo = await geocoder.geocode(
    `${report.titleUk ?? ""}. ${report.text}`,
    oblast,
  );

  const evac = detectEvacuationOrder(report.text);
  const placeNameUk = geo?.granularity === "settlement" ? geo.resolvedNameUk : undefined;

  const where =
    placeNameUk ?? oblastInfo?.nameUk ?? "Україна";
  const whereEn = oblastInfo?.nameEn ?? "Ukraine";

  const title = {
    uk: `${meta.labelUk}: ${where}`,
    en: `${meta.labelEn}: ${whereEn}`,
  };
  const summary = {
    uk: report.titleUk ?? report.text.slice(0, 200),
    en: `DSNS report — ${meta.labelEn.toLowerCase()} in ${whereEn}${evac.ordered ? " (evacuation ordered)" : ""}.`,
  };

  return {
    eventId: dsnsEventId(report),
    type: classification.type,
    scope: report.scope,
    oblast,
    oblastNameUk: oblastInfo?.nameUk,
    oblastNameEn: oblastInfo?.nameEn,
    placeNameUk,
    location: geo ? { lat: geo.lat, lon: geo.lon, uncertaintyM: geo.uncertaintyM } : undefined,
    occurredAt: report.publishedAt,
    severity,
    confidence: geo ? (classification.confidence + geo.confidence) / 2 : classification.confidence,
    title,
    summary,
    originalText: report.text,
    sourceUrl: report.url,
    sourceChannelId: report.channelId,
    mediaUrls: report.mediaUrls,
    evacuationOrdered: evac.ordered || undefined,
  };
}

/** Map an emergency type to a canonical EventClass. */
export function toEventClass(type: EmergencyType): EventClass {
  switch (type) {
    case "fire":
      return "fire";
    case "explosion":
      return "explosion";
    case "collapse":
      return "infrastructure_damage";
    case "hazmat":
      return "chemical";
    case "evacuation":
      return "displacement";
    case "demining":
    case "rescue":
    case "flood":
    default:
      return "humanitarian";
  }
}

/** Stable, deterministic event id from the source report. */
export function dsnsEventId(report: DsnsRawReport): string {
  return `dsns-${report.id}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Map a DSNS emergency event → canonical AegisEventV1. */
export function toAegisEvent(
  ev: DsnsEmergencyEvent,
  opts: { orgId?: string; isPublic?: boolean } = {},
): AegisEventV1 {
  const now = new Date().toISOString();
  return {
    eventId: ev.eventId,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: toEventClass(ev.type),
    subclass: ev.type,
    location: ev.location
      ? { lat: ev.location.lat, lon: ev.location.lon, uncertaintyM: ev.location.uncertaintyM }
      : undefined,
    country: "UA",
    regionCode: ev.oblast,
    severity: ev.severity,
    confidence: ev.confidence,
    verificationState: "in_review",
    occurredAt: ev.occurredAt,
    ingestedAt: now,
    updatedAt: now,
    title: ev.title,
    summary: ev.summary,
    originalText: ev.originalText,
    mediaUrls: ev.mediaUrls,
    citations: [
      {
        sourceId: ev.sourceChannelId,
        sourceType: "official_statement",
        url: ev.sourceUrl,
        capturedAt: now,
      },
    ],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
  };
}

/** End-to-end: raw report → canonical AegisEventV1. */
export async function adaptReport(
  report: DsnsRawReport,
  geocoder: Geocoder = defaultGeocoder,
  opts: { orgId?: string; isPublic?: boolean } = {},
): Promise<{ emergency: DsnsEmergencyEvent; canonical: AegisEventV1 }> {
  const emergency = await toEmergencyEvent(report, geocoder);
  return { emergency, canonical: toAegisEvent(emergency, opts) };
}
