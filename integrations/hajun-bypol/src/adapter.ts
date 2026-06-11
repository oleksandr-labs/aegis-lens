/**
 * Adapter: Hajun/BYPOL raw report → HajunSighting → canonical AegisEventV1.
 *
 * Pipeline per report:
 *   identify equipment (equipment-id) → geocode to BY POI (geocode) → blend
 *   confidence with contributor trust → build typed sighting → map to
 *   packages/event-schema v1.
 *
 * Source / evidence URLs are preserved as citations. We map all Belarus
 * sightings to `country: "BY"` with EventClass derived from the equipment kind.
 * Locations are intentionally LOW precision (POI centroid) — see geocode.ts.
 */

import type { AegisEventV1, EventClass } from "@ua-map/event-schema";
import { EVENT_SCHEMA_VERSION } from "@ua-map/event-schema";
import type { HajunRawReport, HajunSighting, EquipmentClass } from "./types";
import { EQUIPMENT_CLASS_META } from "./types";
import { identifyEquipment, type VisionClassifier, type VisionInput } from "./equipment-id";
import { defaultGeocoder, type Geocoder } from "./geocode";

export interface AdaptOptions {
  geocoder?: Geocoder;
  vision?: VisionClassifier;
  /** Trust score (0–1) of the attributed contributor, if known. */
  contributorTrust?: number;
  orgId?: string;
  isPublic?: boolean;
}

/** Map a coarse equipment class to a canonical EventClass. */
export function toEventClass(cls: EquipmentClass): EventClass {
  switch (cls) {
    case "missile_system":
      return "missile";
    case "uav":
      return "drone";
    case "aircraft":
    case "helicopter":
      return "airstrike";
    case "rail_echelon":
    case "armor":
    case "sam_system":
    case "fuel_logistics":
    case "personnel":
    default:
      return "ground_combat";
  }
}

/** Stable, deterministic event id from the source report. */
export function hajunEventId(report: HajunRawReport): string {
  return `hajun-${report.id}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Build a typed Hajun sighting from a raw report. */
export async function toSighting(
  report: HajunRawReport,
  opts: AdaptOptions = {},
): Promise<HajunSighting> {
  const geocoder = opts.geocoder ?? defaultGeocoder;

  const images: VisionInput[] = (report.mediaUrls ?? []).map((u) => ({
    imageUrl: u,
    caption: report.text,
  }));
  const equipment = await identifyEquipment(report.text, images, opts.vision);
  const meta = EQUIPMENT_CLASS_META[equipment.class];

  const geo = await geocoder.geocode(report.text);

  const whereEn = geo?.resolvedNameEn ?? "Belarus";
  const whereUk = geo?.resolvedNameUk ?? "Білорусь";

  // Confidence blends classification + geocode + contributor trust (when known).
  const parts = [equipment.confidence];
  if (geo) parts.push(geo.confidence);
  if (typeof opts.contributorTrust === "number") parts.push(opts.contributorTrust);
  const confidence =
    Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) / 100;

  const countStr = equipment.count ? ` ×${equipment.count}` : "";

  return {
    eventId: hajunEventId(report),
    org: report.org,
    equipment,
    poiId: geo?.poiId,
    poiNameEn: geo?.resolvedNameEn,
    poiNameUk: geo?.resolvedNameUk,
    location: geo ? { lat: geo.lat, lon: geo.lon, uncertaintyM: geo.uncertaintyM } : undefined,
    occurredAt: report.publishedAt,
    severity: meta.baseSeverity,
    confidence,
    title: {
      en: `${meta.labelEn}${countStr}: ${whereEn}`,
      uk: `${meta.labelUk}${countStr}: ${whereUk}`,
      be: `${meta.labelBe}${countStr}: ${geo?.resolvedNameEn ?? "Беларусь"}`,
    },
    summary: {
      en: `Belarus sighting — ${meta.labelEn.toLowerCase()} near ${whereEn} (north flank).`,
      uk: `Спостереження в Білорусі — ${meta.labelUk.toLowerCase()} поблизу ${whereUk} (північний фланг).`,
      be: `Назіранне ў Беларусі — ${meta.labelBe.toLowerCase()} каля ${geo?.resolvedNameEn ?? "Беларусі"}.`,
    },
    originalText: report.text,
    sourceUrl: report.url,
    sourceChannelId: report.channelId,
    mediaUrls: report.mediaUrls,
  };
}

/** Map a Hajun sighting → canonical AegisEventV1. */
export function toAegisEvent(
  s: HajunSighting,
  opts: { orgId?: string; isPublic?: boolean } = {},
): AegisEventV1 {
  const now = new Date().toISOString();
  return {
    eventId: s.eventId,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: toEventClass(s.equipment.class),
    subclass: s.equipment.model ?? s.equipment.class,
    location: s.location
      ? { lat: s.location.lat, lon: s.location.lon, uncertaintyM: s.location.uncertaintyM }
      : undefined,
    country: "BY",
    severity: s.severity,
    confidence: s.confidence,
    // Belarus sightings start unverified; SAR xref can promote to in_review.
    verificationState: s.sarXrefIds && s.sarXrefIds.length ? "in_review" : "unverified",
    occurredAt: s.occurredAt,
    ingestedAt: now,
    updatedAt: now,
    title: { en: s.title.en, uk: s.title.uk, be: s.title.be },
    summary: { en: s.summary.en, uk: s.summary.uk, be: s.summary.be },
    originalText: s.originalText,
    mediaUrls: s.mediaUrls,
    citations: [
      {
        sourceId: s.sourceChannelId,
        sourceType: "telegram_channel",
        url: s.sourceUrl,
        capturedAt: now,
      },
    ],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
  };
}

/** End-to-end: raw report → { sighting, canonical }. */
export async function adaptReport(
  report: HajunRawReport,
  opts: AdaptOptions = {},
): Promise<{ sighting: HajunSighting; canonical: AegisEventV1 }> {
  const sighting = await toSighting(report, opts);
  return {
    sighting,
    canonical: toAegisEvent(sighting, { orgId: opts.orgId, isPublic: opts.isPublic }),
  };
}
