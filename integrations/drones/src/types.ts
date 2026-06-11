/** Drone / UAV event types for the Aegis Lens platform. */

export type DroneSubtype =
  | "launch"       // UAV departed from a known/estimated point
  | "sighting"     // visual/audio/radar report of UAV in flight
  | "intercept"    // UAV shot down / jammed / netted
  | "debris"       // wreckage found after intercept / crash
  | "swarm"        // coordinated multi-UAV wave
  | "recon";       // reconnaissance pass, no known kinetic outcome

/** Known UAV model families. */
export type DroneModel =
  | "shahed_136"   // Iranian loitering munition
  | "shahed_131"
  | "lancet_3"     // Russian loitering munition
  | "lancet_1"
  | "orlan_10"     // Russian recon UAV
  | "orlan_30"
  | "zala"         // Russian recon
  | "bayraktar_tb2"// Ukrainian / NATO-supplied UCAV
  | "mugin_5"      // commercial frame repurposed
  | "fpv_kamikaze" // first-person-view one-way attack drone
  | "mavic"        // commercial quadcopter (recon)
  | "rb_341_forpost"
  | "eleron_3"
  | "unknown";

export type DroneOperator =
  | "ru_armed_forces"
  | "ua_armed_forces"
  | "ua_volunteer"
  | "unknown";

export type InterceptSystem =
  | "gepard_spaa"
  | "iris_t"
  | "hawk"
  | "patriot"
  | "zu_23_2"
  | "small_arms"
  | "ew_jamming"
  | "unknown";

/** Confidence level for a specific field's identification. */
export interface FieldConfidence {
  value: string;
  confidence: number; // 0–1
  sourceCount: number;
}

/** A single UAV event from any source. */
export interface DroneEvent {
  eventId: string;
  subtype: DroneSubtype;

  /** Best-effort location; may be null for intercept/debris if only area known */
  lat?: number;
  lon?: number;
  /** Radius of uncertainty in meters */
  locationUncertaintyM?: number;

  /** UTC time of the event */
  occurredAt: string;
  ingestedAt: string;

  /** UAV model identification */
  model?: FieldConfidence;
  operator?: FieldConfidence;

  /** Intercept events */
  interceptSystem?: FieldConfidence;
  interceptSuccessful?: boolean;

  /** For swarms: estimated unit count */
  swarmSize?: number;

  /** Mission linkage: group events from the same wave */
  missionId?: string;

  country: string;
  regionCode?: string;

  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;

  titleEn?: string;
  titleUk?: string;
  summaryEn?: string;
  summaryUk?: string;
  mediaUrls?: string[];
  sourceUrls?: string[];

  sourceId: string;
  rawPayload?: unknown;

  /** Must be true before this event is visible to public tier */
  verificationState: "unverified" | "in_review" | "verified" | "disputed" | "retracted";
  isPublic: boolean;
}

/** Aggregated view of a multi-event drone mission / wave. */
export interface DroneMission {
  missionId: string;
  /** All event IDs contributing to this mission */
  eventIds: string[];
  estimatedLaunchAt?: string;
  estimatedModel?: FieldConfidence;
  estimatedOperator?: FieldConfidence;
  /** Waypoints ordered by time */
  trajectory: Array<{ lat: number; lon: number; ts: string }>;
  intercepted: boolean;
  interceptedAt?: string;
  impactLat?: number;
  impactLon?: number;
  affectedRegions: string[];
}

/** GeoJSON feature for map rendering. */
export interface DroneFeatureProperties {
  eventId: string;
  subtype: DroneSubtype;
  model?: string;
  operator?: string;
  severity: number;
  confidence: number;
  occurredAt: string;
  titleEn?: string;
  titleUk?: string;
  missionId?: string;
  interceptSuccessful?: boolean;
}
