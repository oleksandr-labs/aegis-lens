/**
 * Aviation domain model for the Aegis Lens `aviation` map layer.
 *
 * This extends the low-level ADS-B state types in `./types.ts` with a
 * presentation-oriented Aircraft / Flight model carrying bilingual (en/uk)
 * user-facing labels, as required by the UA product.
 *
 * Strictly public ADS-B / OpenSky data only. Military attributes here are
 * *estimates* (see `./mil-estimation.ts`) and clearly flagged as such.
 */

import type { AircraftCategory, AircraftState, AircraftRecord } from "./types";

/** Bilingual user-facing label. */
export interface I18nLabel {
  en: string;
  uk: string;
}

/** Localized aircraft category labels. */
export const AIRCRAFT_CATEGORY_LABELS: Record<AircraftCategory, I18nLabel> = {
  military: { en: "Military (estimated)", uk: "Військове (оцінка)" },
  cargo: { en: "Cargo", uk: "Вантажне" },
  passenger: { en: "Passenger", uk: "Пасажирське" },
  helicopter: { en: "Helicopter", uk: "Гелікоптер" },
  private: { en: "Private", uk: "Приватне" },
  drone: { en: "Drone / UAV", uk: "Безпілотник" },
  unknown: { en: "Unknown", uk: "Невідомо" },
};

/** Confidence-scored value, mirroring `integrations/missiles` classifier shape. */
export interface Scored<T> {
  value: T;
  confidence: number;
}

/**
 * A presentation-ready aircraft track for the aviation layer.
 * Combines a live ADS-B state with resolved registry metadata and
 * derived (estimated) attributes.
 */
export interface AviationTrack {
  /** ICAO 24-bit hex address (lowercase). */
  icao24: string;
  callsign: string | null;

  position: {
    lat: number;
    lon: number;
    /** Barometric altitude in metres (null if on ground / unknown). */
    baroAltitudeM: number | null;
    /** Flight level (hundreds of feet), derived from baro altitude. */
    flightLevel: number | null;
    /** True track heading, degrees from north (0–359). */
    headingDeg: number | null;
    /** Ground speed in m/s. */
    velocityMs: number | null;
    verticalRateMs: number | null;
    onGround: boolean;
  };

  category: AircraftCategory;
  categoryLabel: I18nLabel;

  /** Resolved registry metadata (may be null if unknown). */
  registration: string | null;
  typeCode: string | null;
  model: string | null;
  operator: string | null;
  operatorCountry: string | null;

  /** ISO country-of-registration inferred from the ICAO hex block. */
  countryOfRegistration: string | null;

  /** Estimated-military flag + confidence (see mil-estimation.ts). */
  militaryEstimate?: Scored<boolean>;

  /** Special-purpose indicator / squawk-derived emergency flag. */
  squawk: string | null;
  emergency?: "hijack" | "radio_failure" | "general" | null;

  /** True when the track has been redacted for privacy (see privacy.ts). */
  redacted: boolean;

  title: I18nLabel;
  capturedAt: string; // ISO-8601
  sourceId: string;
}

/** Aircraft type reference entry. */
export interface AircraftTypeInfo {
  typeCode: string;
  manufacturer: string;
  model: string;
  category: AircraftCategory;
  /** Approx. wake / size class for icon scaling. */
  sizeClass: "light" | "medium" | "heavy" | "rotor";
}

/** Helper: derive flight level (hundreds of feet) from baro altitude in metres. */
export function toFlightLevel(baroAltitudeM: number | null): number | null {
  if (baroAltitudeM == null) return null;
  return Math.round((baroAltitudeM / 0.3048) / 100);
}

/** Convenience: build a base AviationTrack from a raw state + (optional) record. */
export function baseTrackFromState(
  state: AircraftState,
  record: AircraftRecord | null,
  sourceId: string,
): AviationTrack | null {
  if (state.latitude == null || state.longitude == null) return null;
  const category: AircraftCategory = record?.category ?? "unknown";
  const callsign = state.callsign?.trim() || null;
  return {
    icao24: state.icao24.toLowerCase(),
    callsign,
    position: {
      lat: state.latitude,
      lon: state.longitude,
      baroAltitudeM: state.baro_altitude,
      flightLevel: toFlightLevel(state.baro_altitude),
      headingDeg: state.true_track,
      velocityMs: state.velocity,
      verticalRateMs: state.vertical_rate,
      onGround: state.on_ground,
    },
    category,
    categoryLabel: AIRCRAFT_CATEGORY_LABELS[category],
    registration: record?.registration ?? null,
    typeCode: record?.type_code ?? null,
    model: record?.model ?? null,
    operator: record?.operator ?? null,
    operatorCountry: record?.operator_country ?? null,
    countryOfRegistration: state.origin_country ?? record?.operator_country ?? null,
    squawk: state.squawk,
    redacted: false,
    title: {
      en: `${callsign ?? state.icao24}${record?.model ? ` (${record.model})` : ""}`,
      uk: `${callsign ?? state.icao24}${record?.model ? ` (${record.model})` : ""}`,
    },
    capturedAt: new Date((state.time_position ?? state.last_contact) * 1000).toISOString(),
    sourceId,
  };
}
