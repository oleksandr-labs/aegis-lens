export interface AircraftState {
  /** ICAO 24-bit hex address */
  icao24: string;
  callsign: string | null;
  /** Origin country inferred from ICAO prefix */
  origin_country: string | null;
  /** Unix timestamp of last position update */
  time_position: number | null;
  /** Unix timestamp of last any message */
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  /** Barometric altitude metres */
  baro_altitude: number | null;
  on_ground: boolean;
  /** Velocity m/s */
  velocity: number | null;
  /** True track degrees from north */
  true_track: number | null;
  /** Vertical rate m/s */
  vertical_rate: number | null;
  /** Geometric altitude metres */
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: 0 | 1 | 2 | 3; // ADS-B, ASTERIX, MLAT, FLARM
}

export type AircraftCategory =
  | "military"
  | "cargo"
  | "passenger"
  | "helicopter"
  | "private"
  | "drone"
  | "unknown";

export interface AircraftRecord {
  icao24: string;
  registration: string | null;
  manufacturer: string | null;
  model: string | null;
  type_code: string | null;
  operator: string | null;
  operator_callsign: string | null;
  operator_country: string | null;
  category: AircraftCategory;
  is_military: boolean;
  owner: string | null;
}

export interface FlightSnapshot {
  aircraft: AircraftRecord | null;
  state: AircraftState;
  captured_at: string; // ISO-8601
}
