/**
 * EXIF metadata analysis for image verification.
 *
 * Extracts camera metadata, GPS coordinates, and editing history.
 * Anomalies (stripped metadata, editing software, GPS mismatch) raise
 * the suspicion score and feed into the overall image verification pipeline.
 *
 * NOTES:
 * 1. exifr (EN): Use the exifr npm library for in-browser + Node EXIF extraction.
 *    exifr (UK): Використовуйте npm-бібліотеку exifr для розбору EXIF у браузері та Node.
 * 2. GPS cross-check (EN): Compare extracted GPS against the claimed event location.
 *    GPS cross-check (UK): Порівнюйте GPS із заявленим місцем події.
 * 3. Stripped metadata (EN): Absent EXIF is suspicious — platforms that strip it are noted.
 *    Stripped metadata (UK): Відсутній EXIF підозрілий — платформи, що видаляють його, фіксуються.
 */

export interface ExifData {
  make?: string;
  model?: string;
  /** ISO-8601 original capture timestamp */
  dateTimeOriginal?: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsAlt?: number;
  /** Camera/firmware software string */
  software?: string;
  /** e.g. "Adobe Photoshop", "GIMP", "Lightroom" */
  editingSoftware?: string;
  hasMetadata: boolean;
  /** True when metadata fields are all absent / were stripped */
  metadataStripped: boolean;
}

export type ExifWarning =
  | "gps_mismatch"            // GPS coords differ significantly from claimed location
  | "timestamp_anomaly"       // timestamp is implausible (future, or far from event date)
  | "editing_software_detected" // image was processed in photo-editing software
  | "metadata_stripped"       // EXIF block absent or wiped
  | "future_timestamp";       // dateTimeOriginal is in the future

export interface ExifAnalysisResult {
  imageUrl: string;
  exif: ExifData;
  warnings: ExifWarning[];
  /** 0–1; higher = more suspicious */
  suspicionScore: number;
  analyzedAt: string;
}

// ── Warning weights for suspicion scoring ─────────────────────────────────────

const WARNING_WEIGHTS: Record<ExifWarning, number> = {
  gps_mismatch: 0.35,
  timestamp_anomaly: 0.25,
  editing_software_detected: 0.20,
  metadata_stripped: 0.15,
  future_timestamp: 0.30,
};

/** Haversine distance in km between two lat/lng pairs. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Detect which ExifWarning flags apply given exif + optional claimed location. */
export function detectExifWarnings(
  exif: ExifData,
  claimedLocation?: { lat: number; lng: number },
): ExifWarning[] {
  const warnings: ExifWarning[] = [];

  if (exif.metadataStripped) {
    warnings.push("metadata_stripped");
    return warnings; // nothing further to check
  }

  if (exif.editingSoftware) {
    warnings.push("editing_software_detected");
  }

  if (exif.dateTimeOriginal) {
    const captured = new Date(exif.dateTimeOriginal).getTime();
    const now = Date.now();
    if (captured > now) {
      warnings.push("future_timestamp");
    } else if (now - captured > 365 * 5 * 24 * 60 * 60 * 1000) {
      // Timestamp more than 5 years old — may be legitimate archive but flag it
      warnings.push("timestamp_anomaly");
    }
  }

  if (
    claimedLocation !== undefined &&
    exif.gpsLat !== undefined &&
    exif.gpsLng !== undefined
  ) {
    const distKm = haversineKm(
      exif.gpsLat,
      exif.gpsLng,
      claimedLocation.lat,
      claimedLocation.lng,
    );
    // More than 50 km from claimed location is flagged
    if (distKm > 50) {
      warnings.push("gps_mismatch");
    }
  }

  return warnings;
}

/**
 * Compute a 0–1 suspicion score from the set of active warnings.
 * Capped at 1.0 to allow overlapping signals without overflow.
 */
export function computeExifSuspicionScore(warnings: ExifWarning[]): number {
  const total = warnings.reduce((sum, w) => sum + WARNING_WEIGHTS[w], 0);
  return Math.min(1, total);
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const EXIF_ANALYSIS_NOTES_EN = [
  "exifr npm library: fast EXIF parser that works in both Node.js and the browser.",
  "GPS cross-check: extracted latitude/longitude is compared against the claimed event location (>50 km flags a mismatch).",
  "Stripped metadata: absent EXIF block is a common manipulation indicator; many platforms strip metadata on upload.",
] as const;

export const EXIF_ANALYSIS_NOTES_UK = [
  "Бібліотека exifr: швидкий EXIF-парсер для Node.js і браузера.",
  "GPS-перехресна перевірка: витягнуті координати порівнюються із заявленим місцем події (>50 км — попередження).",
  "Видалений метадані: відсутній EXIF є поширеним індикатором маніпуляції; багато платформ видаляють метадані при завантаженні.",
] as const;
