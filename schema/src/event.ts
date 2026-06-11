import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────

export const VerificationState = z.enum([
  "ingested",
  "enriched",
  "corroborated",
  "verified",
  "disputed",
  "retracted",
]);
export type VerificationState = z.infer<typeof VerificationState>;

export const Severity = z.number().int().min(0).max(5);
export type Severity = z.infer<typeof Severity>;

export const MediaType = z.enum(["image", "video", "audio", "document"]);
export type MediaType = z.infer<typeof MediaType>;

export const MediaVerificationStatus = z.enum([
  "unverified",
  "authentic",
  "manipulated",
  "synthetic",
  "recycled",
]);
export type MediaVerificationStatus = z.infer<typeof MediaVerificationStatus>;

export const GeocodingMethod = z.enum([
  "nominatim",
  "mapbox",
  "manual",
  "image_geolocation",
  "coordinate_literal",
  "region_centroid",
]);
export type GeocodingMethod = z.infer<typeof GeocodingMethod>;

export const EntityType = z.enum([
  "region",
  "unit",
  "equipment",
  "public_figure",
  "organization",
  "infrastructure",
]);
export type EntityType = z.infer<typeof EntityType>;

// ── Sub-objects ───────────────────────────────────────────────────────────────

export const GeoPoint = z.object({
  /** WGS-84 longitude */
  lng: z.number().min(-180).max(180),
  /** WGS-84 latitude */
  lat: z.number().min(-90).max(90),
});
export type GeoPoint = z.infer<typeof GeoPoint>;

export const EventLocation = z.object({
  point: GeoPoint,
  /** Uncertainty radius in metres */
  precision_m: z.number().nonnegative().optional(),
  geocoding_method: GeocodingMethod,
  /** ISO 3166-1 alpha-2, always "UA" for in-country events */
  country_code: z.string().length(2).optional(),
  /** UA admin-level-1 oblast ISO code, e.g. "UA-63" */
  oblast_code: z.string().optional(),
  /** Human-readable place name, keyed by BCP-47 locale */
  place_name: z.record(z.string()).optional(),
});
export type EventLocation = z.infer<typeof EventLocation>;

export const SourceRef = z.object({
  source_id: z.string(),
  /** Canonical URL of the post / article */
  url: z.string().url(),
  /** Perma-link / archive.org snapshot */
  archive_url: z.string().url().optional(),
  fetched_at: z.string().datetime(),
  /** BCP-47 language of the original text */
  language: z.string(),
  /** SHA-256 of original_text in UTF-8 */
  original_text_hash: z.string().length(64),
  original_text: z.string().optional(),
  /** 0-1 reliability weight assigned to this source */
  source_weight: z.number().min(0).max(1).optional(),
});
export type SourceRef = z.infer<typeof SourceRef>;

export const MediaRef = z.object({
  media_id: z.string(),
  type: MediaType,
  /** S3 / object-store URL of archived copy */
  storage_url: z.string(),
  original_url: z.string().url().optional(),
  width_px: z.number().int().positive().optional(),
  height_px: z.number().int().positive().optional(),
  duration_s: z.number().nonnegative().optional(),
  size_bytes: z.number().int().nonnegative().optional(),
  verification_status: MediaVerificationStatus,
  /** phash for near-duplicate detection */
  perceptual_hash: z.string().optional(),
  /** SHA-256 of raw bytes */
  content_hash: z.string().length(64).optional(),
  /** Inferred geo point from image metadata / visual geolocation */
  inferred_location: GeoPoint.optional(),
});
export type MediaRef = z.infer<typeof MediaRef>;

export const EntityRef = z.object({
  entity_id: z.string(),
  type: EntityType,
  name: z.record(z.string()),
  /** Wikidata QID, e.g. "Q12345" */
  wikidata_id: z.string().optional(),
});
export type EntityRef = z.infer<typeof EntityRef>;

// ── Canonical Event ───────────────────────────────────────────────────────────

export const CanonicalEvent = z.object({
  /** ULID — lexicographically sortable, globally unique */
  event_id: z.string().regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/),

  // Timestamps (ISO-8601 UTC)
  occurred_at: z.string().datetime().optional(),
  reported_at: z.string().datetime().optional(),
  ingested_at: z.string().datetime(),

  location: EventLocation.optional(),

  // Classification
  class: z.string(),
  subclass: z.string().optional(),

  // Scoring
  severity: Severity,
  danger_score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),

  // Provenance
  sources: z.array(SourceRef).min(1),
  media: z.array(MediaRef).optional(),
  entities: z.array(EntityRef).optional(),

  // Text
  /** Map of locale -> translated summary */
  summary: z.record(z.string()),

  // State
  verification_state: VerificationState,

  /** Qdrant vector DB point ID for semantic search */
  embeddings_ref: z.string().optional(),

  // Schema versioning
  schema_version: z.literal("1").default("1"),
});
export type CanonicalEvent = z.infer<typeof CanonicalEvent>;

// ── Partial for partial updates / streaming ingest ────────────────────────────
export const PartialEvent = CanonicalEvent.partial().required({
  event_id: true,
  ingested_at: true,
  sources: true,
  verification_state: true,
  schema_version: true,
});
export type PartialEvent = z.infer<typeof PartialEvent>;
