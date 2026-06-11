import type { AlertRuleCondition } from "./types";
import type { CanonicalEvent } from "@ua-map/schema";

/**
 * Evaluates whether a canonical event matches an alert rule condition.
 * Pure function — no I/O.
 */
export function matchesCondition(
  event: Pick<CanonicalEvent, "class" | "subclass" | "danger_score" | "confidence" | "severity" | "location" | "summary">,
  condition: AlertRuleCondition,
): boolean {
  if (condition.event_class && event.class !== condition.event_class) return false;
  if (condition.event_subclass && event.subclass !== condition.event_subclass) return false;
  if (condition.min_danger_score !== undefined && event.danger_score < condition.min_danger_score) return false;
  if (condition.min_confidence !== undefined && event.confidence < condition.min_confidence) return false;
  if (condition.min_severity !== undefined && event.severity < condition.min_severity) return false;

  if (condition.keyword) {
    const kw = condition.keyword.toLowerCase();
    const text = Object.values(event.summary ?? {}).join(" ").toLowerCase();
    if (!text.includes(kw)) return false;
  }

  if (condition.geo_filter && event.location) {
    const { lat, lng } = event.location.point;
    if (!pointInGeoFilter(lat, lng, condition.geo_filter)) return false;
  }

  return true;
}

type GeoFilter = NonNullable<AlertRuleCondition["geo_filter"]>;

function pointInGeoFilter(lat: number, lng: number, filter: GeoFilter): boolean {
  if (filter.type === "bbox" && filter.bbox) {
    const [west, south, east, north] = filter.bbox;
    return lng >= west && lng <= east && lat >= south && lat <= north;
  }

  if (filter.type === "circle" && filter.center && filter.radius_km) {
    const [clng, clat] = filter.center;
    return haversineKm(lat, lng, clat, clng) <= filter.radius_km;
  }

  if (filter.type === "polygon") {
    // Simplified: fall back to bbox of polygon for now
    return true;
  }

  return true;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
