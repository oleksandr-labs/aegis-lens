/** Infrastructure damage layer types. */

export type InfrastructureCategory =
  | "power"          // generation, transmission, substations
  | "transport"      // roads, bridges, railway
  | "telecom"        // cell towers, fiber, ISP nodes
  | "water"          // waterworks, treatment plants
  | "healthcare"     // hospitals, clinics
  | "education"      // schools, universities
  | "residential"    // apartment blocks, housing
  | "industrial"     // factories, warehouses
  | "government"     // admin buildings
  | "cultural";      // heritage sites, museums

export type DamageSeverity =
  | "minor"      // partial damage, operational with reduced capacity
  | "major"      // significant damage, temporarily non-operational
  | "destroyed"; // complete destruction, requires full rebuild

export type InfrastructureStatus =
  | "damaged"
  | "under_repair"
  | "restored"
  | "destroyed";

export type InfrastructureOwner =
  | "state"
  | "municipal"
  | "private"
  | "military"
  | "unknown";

/** A tracked infrastructure asset. */
export interface InfrastructureAsset {
  assetId: string;
  name: string;
  nameUk?: string;
  category: InfrastructureCategory;
  /** OpenStreetMap way/node ID if cross-referenced */
  osmId?: string;
  lat: number;
  lon: number;
  country: string;
  regionCode?: string;
  owner?: InfrastructureOwner;
  /** Current operational status */
  currentStatus: InfrastructureStatus;
  /** Population affected estimate */
  populationAffected?: number;
  /** IDs of all damage events for this asset */
  damageEventIds: string[];
  firstDamagedAt?: string;
  lastUpdatedAt: string;
}

/** A single damage event on an asset. */
export interface InfrastructureDamageEvent {
  eventId: string;
  assetId?: string; // null if asset not yet catalogued
  category: InfrastructureCategory;
  severity: DamageSeverity;
  status: InfrastructureStatus;

  lat?: number;
  lon?: number;
  locationUncertaintyM?: number;

  occurredAt: string;
  ingestedAt: string;

  country: string;
  regionCode?: string;

  /** Cross-links */
  linkedMissileEventId?: string;
  linkedDroneEventId?: string;
  linkedPowerOutageEventId?: string;
  /** Linked communications-outage event (telecom-category damage correlation) */
  linkedCommsOutageEventId?: string;

  /** Sentinel-2 change detection confidence */
  changeDetectionConfidence?: number;

  titleEn?: string;
  titleUk?: string;
  summaryEn?: string;
  summaryUk?: string;
  mediaUrls?: string[];
  sourceUrls?: string[];

  sourceId: string;
  rawPayload?: unknown;

  verificationState: "unverified" | "in_review" | "verified" | "disputed" | "retracted";
  isPublic: boolean;

  /** Event severity mapped to the shared 1-5 scale */
  severityScore: 1 | 2 | 3 | 4 | 5;
  confidence: number;
}

/** Repair / restoration event for an asset. */
export interface InfrastructureRepairEvent {
  eventId: string;
  assetId: string;
  occurredAt: string;
  ingestedAt: string;
  previousStatus: InfrastructureStatus;
  newStatus: InfrastructureStatus;
  partialRestoration: boolean;
  restorationPercent?: number; // 0–100
  titleEn?: string;
  titleUk?: string;
  sourceId: string;
  sourceUrls?: string[];
}

/** Aggregated damage statistics per region for reports. */
export interface RegionDamageStats {
  regionCode: string;
  regionName: string;
  totalDamageEvents: number;
  byCategory: Record<InfrastructureCategory, number>;
  bySeverity: Record<DamageSeverity, number>;
  destroyedAssetCount: number;
  restoredAssetCount: number;
  populationAffectedTotal: number;
  lastUpdatedAt: string;
}
