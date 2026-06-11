import { ExifData, ExifResult } from "./types";

/** Privacy-sensitive EXIF tags to strip before returning to clients. */
const STRIP_TAGS = new Set([
  "GPSLatitude", "GPSLongitude", "GPSAltitude",
  "GPSLatitudeRef", "GPSLongitudeRef", "GPSAltitudeRef",
  "GPSDateStamp", "GPSTimeStamp",
  "MakerNote", "UserComment",
  "CameraOwnerName", "BodySerialNumber", "LensSerialNumber",
]);

/** Parse raw EXIF tag map into a structured ExifData. */
export function parseExif(raw: Record<string, string | number>, stripPrivacy = false): ExifData {
  const filtered: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!stripPrivacy || !STRIP_TAGS.has(k)) filtered[k] = v;
  }

  const lat = parseGps(raw.GPSLatitude as string, raw.GPSLatitudeRef as string);
  const lon = parseGps(raw.GPSLongitude as string, raw.GPSLongitudeRef as string);
  const alt = typeof raw.GPSAltitude === "number" ? raw.GPSAltitude : parseFloat(String(raw.GPSAltitude ?? "")) || undefined;

  return {
    make: raw.Make as string | undefined,
    model: raw.Model as string | undefined,
    software: raw.Software as string | undefined,
    dateTimeOriginal: raw.DateTimeOriginal as string | undefined,
    gpsLat: stripPrivacy ? undefined : lat,
    gpsLon: stripPrivacy ? undefined : lon,
    gpsAlt: stripPrivacy ? undefined : alt,
    exposureTime: typeof raw.ExposureTime === "number" ? raw.ExposureTime : undefined,
    fNumber: typeof raw.FNumber === "number" ? raw.FNumber : undefined,
    iso: typeof raw.ISOSpeedRatings === "number" ? raw.ISOSpeedRatings : undefined,
    focalLength: typeof raw.FocalLength === "number" ? raw.FocalLength : undefined,
    raw: filtered,
  };
}

function parseGps(value: string, ref: string): number | undefined {
  if (!value) return undefined;
  // Format: "DD/1,MM/1,SS/100" (rational triplet)
  const parts = value.split(",").map((p) => {
    const [n, d] = p.trim().split("/").map(Number);
    return d ? n / d : n;
  });
  if (parts.length < 3) return undefined;
  const decimal = parts[0] + parts[1] / 60 + parts[2] / 3600;
  return ref === "S" || ref === "W" ? -decimal : decimal;
}

/** Build an ExifResult from a media ID and raw tag map. */
export function buildExifResult(mediaId: string, raw: Record<string, string | number>, stripPrivacy = false): ExifResult {
  const exif = parseExif(raw, stripPrivacy);
  return {
    mediaId,
    exif,
    hasGps: exif.gpsLat != null && exif.gpsLon != null,
    hasTimestamp: !!exif.dateTimeOriginal,
    strippedForPrivacy: stripPrivacy,
  };
}

/** Check whether EXIF metadata is consistent with claimed location + date. */
export function validateExifConsistency(
  exif: ExifData,
  claimedLat: number,
  claimedLon: number,
  claimedDate: string,
  toleranceKm = 20,
  toleranceHours = 48,
): { locationConsistent: boolean; dateConsistent: boolean; flags: string[] } {
  const flags: string[] = [];
  let locationConsistent = true;
  let dateConsistent = true;

  if (exif.gpsLat != null && exif.gpsLon != null) {
    const distKm = haversineKm(exif.gpsLat, exif.gpsLon, claimedLat, claimedLon);
    if (distKm > toleranceKm) {
      locationConsistent = false;
      flags.push(`EXIF GPS is ${Math.round(distKm)} km from claimed location`);
    }
  } else {
    flags.push("No GPS in EXIF — location cannot be verified from metadata");
  }

  if (exif.dateTimeOriginal) {
    const exifMs = new Date(exif.dateTimeOriginal.replace(":", "-").replace(":", "-")).getTime();
    const claimedMs = new Date(claimedDate).getTime();
    const diffHours = Math.abs(exifMs - claimedMs) / 3_600_000;
    if (diffHours > toleranceHours) {
      dateConsistent = false;
      flags.push(`EXIF timestamp differs from claimed date by ${Math.round(diffHours)} hours`);
    }
  } else {
    flags.push("No timestamp in EXIF — date cannot be verified from metadata");
  }

  return { locationConsistent, dateConsistent, flags };
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
