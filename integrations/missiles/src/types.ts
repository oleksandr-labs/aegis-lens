/** Missile / ballistic / cruise weapon types for Aegis Lens. */

export type MissileSubtype =
  | "ballistic"       // Iskander-M, KN series
  | "cruise"          // Kalibr, Kh-101/55/22
  | "hypersonic"      // Kinzhal
  | "air_launched"    // Kh-series air-launched
  | "atgm"            // Anti-tank guided missile
  | "mlrs"            // Multiple-launch rocket system
  | "anti_radiation"; // Kh-31P, HARM

export type MissileModel =
  | "iskander_m"
  | "iskander_k"
  | "kalibr"
  | "kh_101"
  | "kh_55"
  | "kh_22"
  | "kh_47_kinzhal"
  | "kh_31p"
  | "tochka_u"
  | "s_300_surface"
  | "himars_m31"
  | "himars_atacms"
  | "storm_shadow"
  | "scalp_eg"
  | "aim_120_amraam"
  | "harm_agm88"
  | "unknown";

export type MissileLaunchPlatform =
  | "ground_mobile"    // MZKT launcher
  | "ship_based"       // Caspian / Black Sea fleet
  | "submarine"
  | "air_bomber"       // Tu-95, Tu-160
  | "air_tactical"     // Su-24, Su-34, MiG-31
  | "unknown";

export type TargetType =
  | "energy_infrastructure"
  | "military_base"
  | "industrial"
  | "residential"
  | "transport_hub"
  | "command_control"
  | "air_defense"
  | "unknown";

export type MissileEventSubstatus =
  | "launched"        // confirmed launch
  | "in_flight"       // tracked in transit
  | "intercepted"     // shot down
  | "impact"          // confirmed strike
  | "unconfirmed";    // reported but not yet verified

export interface MissileEvent {
  eventId: string;
  subtype: MissileSubtype;
  substatus: MissileEventSubstatus;

  model?: { value: MissileModel; confidence: number; sourceCount: number };
  launchPlatform?: { value: MissileLaunchPlatform; confidence: number };

  /** Estimated launch point (may be null if unknown) */
  launchLat?: number;
  launchLon?: number;

  /** Impact / intercept point */
  lat?: number;
  lon?: number;
  locationUncertaintyM?: number;

  targetType?: { value: TargetType; confidence: number };

  /** Intercept data */
  intercepted?: boolean;
  interceptSystem?: string;

  /** Estimated warhead yield class */
  warheadClass?: "conventional" | "cluster" | "thermobaric" | "unknown";

  occurredAt: string;
  ingestedAt: string;

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

  /** Links this strike to an infrastructure damage event */
  linkedInfrastructureEventId?: string;
  /** The salvo this missile belongs to */
  salvoId?: string;

  sourceId: string;
  rawPayload?: unknown;

  verificationState: "unverified" | "in_review" | "verified" | "disputed" | "retracted";
  isPublic: boolean;
}

/** A coordinated missile salvo (multiple missiles, single attack wave). */
export interface MissileSalvo {
  salvoId: string;
  eventIds: string[];
  estimatedLaunchedAt: string;
  estimatedMissileCount: number;
  confirmedMissileCount: number;
  interceptedCount: number;
  impactCount: number;
  targetRegions: string[];
  primarySubtype: MissileSubtype;
}
