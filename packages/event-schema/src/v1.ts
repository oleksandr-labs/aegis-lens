/**
 * Canonical Aegis Lens Event Schema v1
 *
 * This is the single source of truth for event representation across
 * all services, APIs, exports, and the event database.
 *
 * BACKWARD COMPATIBILITY GUARANTEE:
 * - Fields MUST NOT be removed from v1 without a 6-month deprecation.
 * - New required fields require a major version bump (v2).
 * - Optional fields may be added at any time.
 */

export const EVENT_SCHEMA_VERSION = "1.0.0" as const;

// ── Enumerations ──────────────────────────────────────────────────────────────

export type EventClass =
  | "drone"
  | "missile"
  | "airstrike"
  | "artillery"
  | "ground_combat"
  | "explosion"
  | "fire"
  | "infrastructure_damage"
  | "power_outage"
  | "comms_outage"
  | "humanitarian"
  | "displacement"
  | "protest"
  | "cyberattack"
  | "chemical"
  | "radiation"
  | "other";

export type VerificationState =
  | "unverified"
  | "in_review"
  | "verified"
  | "disputed"
  | "retracted";

export type EventSource =
  | "telegram_channel"
  | "twitter"
  | "youtube"
  | "reddit"
  | "community_report"
  | "official_statement"
  | "satellite_imagery"
  | "adsb"
  | "ais"
  | "sensor"
  | "api"
  | "scraper";

// ── Danger Score Bands ────────────────────────────────────────────────────────

export type DangerBand = "calm" | "elevated" | "active" | "high" | "critical";

export const DANGER_BANDS: Record<DangerBand, { min: number; max: number; labelEn: string; labelUk: string }> = {
  calm:     { min: 0,  max: 19,  labelEn: "Calm",     labelUk: "Спокійно" },
  elevated: { min: 20, max: 39,  labelEn: "Elevated", labelUk: "Підвищений" },
  active:   { min: 40, max: 59,  labelEn: "Active",   labelUk: "Активний" },
  high:     { min: 60, max: 79,  labelEn: "High",     labelUk: "Високий" },
  critical: { min: 80, max: 100, labelEn: "Critical", labelUk: "Критичний" },
};

export function getDangerBand(score: number): DangerBand {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "active";
  if (score >= 20) return "elevated";
  return "calm";
}

// ── Confidence Labels ─────────────────────────────────────────────────────────

export type ConfidenceLabel = "low" | "medium" | "high" | "verified";

export const CONFIDENCE_THRESHOLDS: Record<ConfidenceLabel, { min: number; labelUk: string }> = {
  low:      { min: 0,   labelUk: "Низька" },
  medium:   { min: 0.4, labelUk: "Середня" },
  high:     { min: 0.7, labelUk: "Висока" },
  verified: { min: 0.9, labelUk: "Підтверджено" },
};

export function getConfidenceLabel(confidence: number): ConfidenceLabel {
  if (confidence >= 0.9) return "verified";
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}

// ── Core Event Schema ─────────────────────────────────────────────────────────

/** Multilingual text field: keyed by BCP-47 locale. */
export type LocalizedText = Partial<Record<string, string>> & {
  en?: string;
  uk?: string;
};

/** Geographic point in WGS-84. */
export interface GeoPoint {
  lat: number;
  lon: number;
  /** Uncertainty radius in meters (1-sigma) */
  uncertaintyM?: number;
}

/** Reference to another event (e.g. missile → infrastructure damage). */
export interface EventLink {
  eventId: string;
  linkType: "caused_by" | "caused" | "same_incident" | "corroborates" | "contradicts" | "supersedes";
}

/** Source citation with provenance. */
export interface SourceCitation {
  sourceId: string;
  sourceType: EventSource;
  url?: string;
  capturedAt?: string; // ISO-8601
  archiveUrl?: string; // e.g. web.archive.org
}

/** The canonical Aegis Lens event. */
export interface AegisEventV1 {
  /** Globally unique event ID (UUIDv7 preferred for time-ordering). */
  eventId: string;

  /** Schema version for forward-compatibility. */
  schemaVersion: typeof EVENT_SCHEMA_VERSION;

  /** Broad event category. */
  class: EventClass;
  /** Domain-specific subclass (e.g. "shahed_136" for drones). */
  subclass?: string;

  // ── Location ────────────────────────────────────────────────────────────────
  /** Primary location of the event. */
  location?: GeoPoint;
  country: string;           // ISO 3166-1 alpha-2
  regionCode?: string;       // ISO 3166-2

  // ── Scoring ─────────────────────────────────────────────────────────────────
  /** Severity 1–5 (input to danger_score). */
  severity: 1 | 2 | 3 | 4 | 5;
  /** Weighted source confidence 0–1. */
  confidence: number;
  /**
   * Composite danger score 0–100.
   * = (severity/5)*40 + confidence*30 + recency*30
   * Generated server-side; not set by ingest.
   */
  dangerScore?: number;
  dangerBand?: DangerBand;

  // ── Verification ─────────────────────────────────────────────────────────────
  verificationState: VerificationState;
  /** IDs of reviewers who verified this event. */
  reviewerIds?: string[];

  // ── Timestamps ──────────────────────────────────────────────────────────────
  occurredAt: string;   // ISO-8601 UTC
  ingestedAt: string;   // ISO-8601 UTC
  updatedAt: string;    // ISO-8601 UTC

  // ── Content ──────────────────────────────────────────────────────────────────
  title: LocalizedText;
  summary?: LocalizedText;
  /** Original text as ingested (not translated). */
  originalText?: string;
  mediaUrls?: string[];

  // ── Citations ────────────────────────────────────────────────────────────────
  citations: SourceCitation[];

  // ── Cross-references ─────────────────────────────────────────────────────────
  links?: EventLink[];

  // ── Multi-tenancy ─────────────────────────────────────────────────────────────
  orgId: string;
  isPublic: boolean;

  // ── Retraction ───────────────────────────────────────────────────────────────
  isRetracted: boolean;
  retractedAt?: string;
  retractionReason?: string;

  // ── Raw payload (ingest-only, stripped before public API) ────────────────────
  rawPayload?: unknown;
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEventV1(event: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!event || typeof event !== "object") {
    return [{ field: "root", message: "Event must be an object" }];
  }
  const e = event as Record<string, unknown>;

  if (!e.eventId || typeof e.eventId !== "string") errors.push({ field: "eventId", message: "Required string" });
  if (!e.class) errors.push({ field: "class", message: "Required" });
  if (typeof e.severity !== "number" || e.severity < 1 || e.severity > 5) errors.push({ field: "severity", message: "Must be 1–5" });
  if (typeof e.confidence !== "number" || e.confidence < 0 || e.confidence > 1) errors.push({ field: "confidence", message: "Must be 0–1" });
  if (!e.occurredAt) errors.push({ field: "occurredAt", message: "Required ISO-8601 string" });
  if (!e.ingestedAt) errors.push({ field: "ingestedAt", message: "Required ISO-8601 string" });
  if (!e.country || typeof e.country !== "string") errors.push({ field: "country", message: "Required ISO 3166-1 alpha-2" });
  if (!e.orgId || typeof e.orgId !== "string") errors.push({ field: "orgId", message: "Required" });
  if (typeof e.isPublic !== "boolean") errors.push({ field: "isPublic", message: "Required boolean" });
  if (typeof e.isRetracted !== "boolean") errors.push({ field: "isRetracted", message: "Required boolean" });
  if (!Array.isArray(e.citations)) errors.push({ field: "citations", message: "Required array" });

  if (e.location && typeof e.location === "object") {
    const loc = e.location as Record<string, unknown>;
    if (typeof loc.lat !== "number" || loc.lat < -90 || loc.lat > 90)
      errors.push({ field: "location.lat", message: "Must be -90 to 90" });
    if (typeof loc.lon !== "number" || loc.lon < -180 || loc.lon > 180)
      errors.push({ field: "location.lon", message: "Must be -180 to 180" });
  }

  return errors;
}

export function isValidEvent(event: unknown): event is AegisEventV1 {
  return validateEventV1(event).length === 0;
}
