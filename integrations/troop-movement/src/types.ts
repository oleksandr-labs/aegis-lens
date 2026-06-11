/**
 * Troop / unit movement types for Aegis Lens — the most ethically loaded layer.
 *
 * HARD POLICY (encoded throughout this package, NOT just documented):
 *   - NEVER targeting-grade. NEVER live / near-real-time. NEVER exact coordinates.
 *   - Only POST-EVENT, PUBLICLY-ATTRIBUTED reports are ever ingested.
 *   - Public view is DELAYED and FUZZED by default (fail-closed).
 *   - The layer is gated to vetted ("pro") accounts; default not visible.
 *
 * Movement positions are deliberately reduced to fuzzed centroids + low-precision
 * bearing buckets. There is no field on these types capable of carrying a precise
 * position by design.
 */

/** Belligerent side. */
export type Side = "ua" | "ru";

/** Service branch (military arm). */
export type Branch =
  | "ground"        // mechanised / motor-rifle / infantry
  | "armor"         // tank
  | "artillery"     // tube + rocket artillery
  | "air"           // aviation
  | "air_defense"
  | "naval"
  | "airborne"      // VDV / air-assault
  | "marines"
  | "logistics"
  | "unknown";

/**
 * "Era" facet — the operational period a report belongs to. This is an editorial
 * bucket (e.g. for historical vs current-war reporting), never a live timestamp.
 */
export type Era =
  | "current"       // ongoing full-scale invasion (2022→)
  | "donbas_2014"   // 2014–2021 Donbas phase
  | "historical";   // pre-2014 / archival

/**
 * Low-precision compass buckets. We DO NOT store exact bearings or vectors.
 * 8-point compass only — enough to show a general direction, never a track.
 */
export type BearingBucket = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

/** Coarse confidence band for movement direction (no exact heading). */
export type MovementConfidence = "low" | "medium" | "high";

/** Editorial publish state — publish is gated behind explicit approval. */
export type PublishState =
  | "draft"          // ingested, not reviewed
  | "in_review"      // queued for an editor
  | "approved"       // editor approved — eligible for (delayed) publish
  | "rejected"       // editor rejected
  | "retracted";     // pulled after publish

/** Bilingual user-facing string (this is a Ukrainian product). */
export interface I18nString {
  en: string;
  uk: string;
}

/**
 * Order-of-battle (OOB) unit — PUBLICLY ATTRIBUTED ONLY.
 * If `publiclyAttributed` is not true, the unit is never surfaced (fail-closed).
 */
export interface OobUnit {
  unitId: string;
  side: Side;
  branch: Branch;
  /** Unit name with EN transliteration + native UK. */
  name: I18nString;
  /** Designation / number as publicly reported (e.g. "47th Mechanised Brigade"). */
  designation?: I18nString;
  /** MUST be true for the unit to ever be used. Public OOB attribution only. */
  publiclyAttributed: boolean;
  /** Public sources that attribute this unit (URLs). At least one required. */
  attributionSourceUrls: string[];
  /** Equipment-layer references cross-linked to this unit. */
  equipmentRefs?: string[];
}

/**
 * A verified, post-event troop movement report.
 *
 * NOTE: there is intentionally NO precise lat/lon field. Position is only ever a
 * fuzzed centroid (`fuzzedLat`/`fuzzedLon`) plus a low-precision bearing bucket.
 */
export interface TroopMovementReport {
  reportId: string;
  side: Side;
  branch: Branch;
  era: Era;

  /** The publicly-attributed unit this report concerns. */
  unitId: string;

  /**
   * Fuzzed centroid only — snapped to a coarse grid, never a precise position.
   * `fuzzRadiusM` documents the obfuscation radius applied at ingestion.
   */
  fuzzedLat: number;
  fuzzedLon: number;
  fuzzRadiusM: number;

  /** Low-precision direction of movement (8-point compass), if reported. */
  bearing?: { bucket: BearingBucket; confidence: MovementConfidence };

  /** ISO-8601 — when the movement reportedly occurred (always in the PAST). */
  occurredAt: string;
  /** ISO-8601 — when ingested. */
  ingestedAt: string;
  /**
   * Earliest ISO-8601 instant this report may become public, after delay policy.
   * Public consumers MUST NOT receive it before this time.
   */
  publishableAt: string;

  country: string;
  regionCode?: string;

  /** Independent corroborating source URLs (≥2 required to verify). */
  sourceUrls: string[];
  /** Media corroboration URLs (photo / video / satellite). */
  mediaUrls?: string[];

  titleEn?: string;
  titleUk?: string;
  summaryEn?: string;
  summaryUk?: string;

  /** Cross-links into the equipment layer. */
  equipmentRefs?: string[];

  /** Editorial publish gate. Default fail-closed = "draft". */
  publishState: PublishState;
  /** Whether this record may be served to the PUBLIC (delayed + fuzzed) audience. */
  isPublic: boolean;

  sourceId: string;
  rawPayload?: unknown;
}
