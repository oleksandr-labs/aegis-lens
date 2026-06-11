/**
 * Civilian-alert auto-fanout for missile impact areas.
 *
 * Given a confirmed impact point (or bbox) we compute the affected oblast(s)
 * inside a blast/effect radius and emit localized civilian-alert payloads, one
 * per affected oblast. This is the contract the alerting service consumes; it
 * does NOT itself send notifications (no transport coupling here).
 *
 * Oblast resolution uses a static centroid table + radius test. A production
 * system would point-in-polygon against admin boundaries; the centroid heuristic
 * is the codeable baseline.
 */

import { MissileEvent } from "./types";

export interface OblastCentroid {
  /** ISO 3166-2 code, e.g. "UA-30". */
  code: string;
  nameEn: string;
  nameUk: string;
  lat: number;
  lon: number;
  /** Approx radius (km) used for the coarse affected-area test. */
  approxRadiusKm: number;
}

/** Coarse oblast centroid table (subset; extend as boundaries are wired in). */
export const OBLAST_CENTROIDS: OblastCentroid[] = [
  { code: "UA-30", nameEn: "Kyiv City", nameUk: "м. Київ", lat: 50.45, lon: 30.52, approxRadiusKm: 30 },
  { code: "UA-32", nameEn: "Kyiv Oblast", nameUk: "Київська область", lat: 50.05, lon: 30.4, approxRadiusKm: 110 },
  { code: "UA-63", nameEn: "Kharkiv Oblast", nameUk: "Харківська область", lat: 49.7, lon: 36.6, approxRadiusKm: 130 },
  { code: "UA-46", nameEn: "Lviv Oblast", nameUk: "Львівська область", lat: 49.6, lon: 24.0, approxRadiusKm: 120 },
  { code: "UA-23", nameEn: "Zaporizhzhia Oblast", nameUk: "Запорізька область", lat: 47.4, lon: 35.3, approxRadiusKm: 130 },
  { code: "UA-14", nameEn: "Donetsk Oblast", nameUk: "Донецька область", lat: 48.3, lon: 37.8, approxRadiusKm: 150 },
  { code: "UA-12", nameEn: "Dnipropetrovsk Oblast", nameUk: "Дніпропетровська область", lat: 48.4, lon: 35.0, approxRadiusKm: 150 },
  { code: "UA-51", nameEn: "Odesa Oblast", nameUk: "Одеська область", lat: 46.5, lon: 30.7, approxRadiusKm: 160 },
];

export interface CivilianAlertPayload {
  alertId: string;
  oblastCode: string;
  severity: 1 | 2 | 3 | 4 | 5;
  /** Localized headline + body for civilian-tier locales. */
  titleEn: string;
  titleUk: string;
  bodyEn: string;
  bodyUk: string;
  /** Source impact event. */
  sourceEventId: string;
  /** ISO timestamp the alert was generated. */
  issuedAt: string;
  /** Affected centre + effect radius for client geofencing. */
  centerLat: number;
  centerLon: number;
  effectRadiusKm: number;
}

const EARTH_R_KM = 6371;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Default effect radius (km) by missile subtype — coarse hazard footprint. */
export function effectRadiusKm(event: MissileEvent): number {
  switch (event.subtype) {
    case "ballistic":
    case "hypersonic":
      return 25;
    case "cruise":
      return 20;
    case "mlrs":
      return 15;
    default:
      return 12;
  }
}

/** Resolve which oblasts intersect the impact's effect radius. */
export function affectedOblasts(lat: number, lon: number, radiusKm: number): OblastCentroid[] {
  return OBLAST_CENTROIDS.filter(
    (o) => haversineKm(lat, lon, o.lat, o.lon) <= radiusKm + o.approxRadiusKm,
  );
}

/**
 * Build civilian-alert payloads for a confirmed impact event.
 * Returns [] for non-impact events (no fanout on launch/in-flight/intercept).
 */
export function buildImpactAlerts(event: MissileEvent): CivilianAlertPayload[] {
  if (event.substatus !== "impact") return [];
  if (event.lat == null || event.lon == null) return [];

  const radiusKm = effectRadiusKm(event);
  const oblasts = affectedOblasts(event.lat, event.lon, radiusKm);
  const issuedAt = new Date().toISOString();

  return oblasts.map((o) => ({
    alertId: `alert_${event.eventId}_${o.code}`,
    oblastCode: o.code,
    severity: event.severity,
    titleEn: `Missile impact alert — ${o.nameEn}`,
    titleUk: `Тривога: ракетний удар — ${o.nameUk}`,
    bodyEn: `A ${event.subtype} missile impact has been confirmed near ${o.nameEn}. Seek shelter and follow official guidance.`,
    bodyUk: `Підтверджено ракетний удар (${event.subtype}) поблизу ${o.nameUk}. Пройдіть в укриття та дотримуйтесь офіційних рекомендацій.`,
    sourceEventId: event.eventId,
    issuedAt,
    centerLat: event.lat!,
    centerLon: event.lon!,
    effectRadiusKm: radiusKm,
  }));
}
