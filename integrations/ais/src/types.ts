export type NavigationStatus =
  | "under_way_engine"
  | "at_anchor"
  | "not_under_command"
  | "restricted_maneuverability"
  | "constrained_by_draught"
  | "moored"
  | "aground"
  | "engaged_fishing"
  | "under_way_sailing"
  | "unknown";

export type ShipType =
  | "cargo"
  | "tanker"
  | "passenger"
  | "military"
  | "sailing"
  | "pleasure"
  | "fishing"
  | "tugboat"
  | "pilot"
  | "sar"
  | "other"
  | "unknown";

export interface VesselPosition {
  /** Maritime Mobile Service Identity (9 digits) */
  mmsi: string;
  /** IMO number */
  imo: string | null;
  callsign: string | null;
  ship_name: string | null;
  ship_type: ShipType;
  latitude: number;
  longitude: number;
  /** Speed over ground, knots */
  speed_knots: number | null;
  /** Course over ground, degrees */
  course_deg: number | null;
  /** True heading, degrees */
  heading_deg: number | null;
  nav_status: NavigationStatus;
  /** UTC timestamp */
  timestamp: string;
  /** AIS message type (1-27) */
  msg_type: number;
  destination: string | null;
  draught_m: number | null;
  /** Flag state (ISO 3166-1 alpha-2 inferred from MMSI prefix) */
  flag: string | null;
}

export interface VesselRecord {
  mmsi: string;
  imo: string | null;
  ship_name: string | null;
  ship_type: ShipType;
  flag: string | null;
  /** Gross tonnage */
  gross_tonnage: number | null;
  length_m: number | null;
  /** OFAC / EU sanctions list membership */
  is_sanctioned: boolean;
  sanctions_lists: string[];
  /** Typical AIS transmission pattern; gaps indicate possible dark vessel */
  expected_interval_s: number | null;
}

// ── Vessel registry (type + flag + operator) ───────────────────────────────────

/** Confidence-scored attribute, mirrors the missiles classifier shape. */
export interface Scored<T> {
  value: T;
  confidence: number;
  sourceCount?: number;
}

/** Cargo class inferred where lawful. */
export type CargoClass =
  | "crude_oil"
  | "refined_products"
  | "lng"
  | "lpg"
  | "chemicals"
  | "dry_bulk"
  | "grain"
  | "containers"
  | "general_cargo"
  | "ro_ro"
  | "passengers"
  | "unknown";

/** Operator / beneficial-owner record. */
export interface VesselOperator {
  name: string;
  /** ISO 3166-1 alpha-2 country of the operating company */
  country: string | null;
  /** Registered / ISM manager, where different from beneficial owner */
  manager?: string | null;
  /** True when ownership is obscured behind shell companies */
  opaque_ownership: boolean;
}

/** Extended registry record: type + flag + operator + dimensions. */
export interface VesselRegistryEntry {
  mmsi: string;
  imo: string | null;
  ship_name: string | null;
  /** Localized + transliterated display names */
  name_en: string | null;
  name_uk: string | null;
  ship_type: ShipType;
  /** Detailed cargo/class inference (where lawful) */
  cargo_class: Scored<CargoClass> | null;
  /** ISO 3166-1 alpha-2 flag state */
  flag: string | null;
  flag_name_en: string | null;
  flag_name_uk: string | null;
  /** True when the flag is a known flag-of-convenience register */
  flag_of_convenience: boolean;
  operator: VesselOperator | null;
  gross_tonnage: number | null;
  length_m: number | null;
  year_built: number | null;
}

// ── Status enums shared by API + UI ─────────────────────────────────────────────

/** Whether a vessel is actively transmitting AIS. */
export type AisStatus = "transmitting" | "intermittent" | "dark";

/** Sanctions screening outcome for filter facets. */
export type SanctionsStatus = "clear" | "ofac" | "eu" | "ofac_eu" | "uk" | "flagged";
