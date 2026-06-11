/**
 * Shared adapter: NormalisedDatasetEvent → canonical Aegis Event v1.
 *
 * The canonical schema lives in `@aegis/event-schema` (packages/event-schema/src/v1.ts).
 * As with `integrations/missiles`, we mirror the relevant shape locally (no
 * cross-package path resolution is wired for integration packages) and produce
 * objects that conform field-for-field to `AegisEventV1`.
 *
 * Per-dataset adapters (acled-adapter, gdelt-extract, ucdp-import) emit
 * `NormalisedDatasetEvent`; this module performs the final canonical mapping,
 * preserving source/evidence URLs and forwarding the confidence input.
 */

import type { DatasetId, EventClass, NormalisedDatasetEvent } from "./types";

// ── Local mirror of the canonical Event v1 shape (the subset we emit) ─────────

export interface CanonicalGeoPoint {
  lat: number;
  lon: number;
  uncertaintyM?: number;
}

export interface CanonicalSourceCitation {
  sourceId: string;
  sourceType: "api";
  url?: string;
  capturedAt?: string;
  archiveUrl?: string;
}

export interface CanonicalEventV1 {
  eventId: string;
  schemaVersion: "1.0.0";
  class: EventClass;
  subclass?: string;
  location?: CanonicalGeoPoint;
  country: string;
  regionCode?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  verificationState: "unverified" | "in_review" | "verified" | "disputed" | "retracted";
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  title: { en?: string; uk?: string } & Record<string, string | undefined>;
  summary?: { en?: string; uk?: string } & Record<string, string | undefined>;
  originalText?: string;
  citations: CanonicalSourceCitation[];
  orgId: string;
  isPublic: boolean;
  isRetracted: boolean;
  rawPayload?: unknown;
}

/** Per-dataset metadata used when building canonical citations. */
const DATASET_SOURCE_ID: Record<DatasetId, string> = {
  acled: "acled.api",
  gdelt: "gdelt.bigquery",
  ucdp: "ucdp.ged",
};

/**
 * Academic datasets are post-hoc, vetted aggregations rather than live OSINT;
 * we mark them `verified` (research-grade) but `isPublic` is gated downstream
 * by license (ACLED raw rows are never public — see COMPLIANCE.md / isPublic).
 */
export interface ToCanonicalOptions {
  orgId: string;
  /** Whether the resulting event may be exposed publicly (license-dependent). */
  isPublic: boolean;
  /** Keep the raw source row on the canonical event (ingest-only). */
  keepRawPayload?: boolean;
}

export function toCanonicalEvent(
  ev: NormalisedDatasetEvent,
  opts: ToCanonicalOptions,
): CanonicalEventV1 {
  const now = new Date().toISOString();
  const citation: CanonicalSourceCitation = {
    sourceId: DATASET_SOURCE_ID[ev.dataset],
    sourceType: "api",
    url: ev.sourceUrl,
    capturedAt: now,
  };

  return {
    eventId: ev.sourceEventId,
    schemaVersion: "1.0.0",
    class: ev.eventClass,
    subclass: ev.subclass,
    location:
      ev.lat != null && ev.lon != null
        ? { lat: ev.lat, lon: ev.lon, uncertaintyM: ev.uncertaintyM }
        : undefined,
    country: ev.country,
    regionCode: undefined,
    severity: ev.severity,
    confidence: ev.confidence,
    verificationState: "verified",
    occurredAt: ev.occurredAt,
    ingestedAt: now,
    updatedAt: now,
    title: { en: ev.titleEn, uk: ev.titleUk },
    summary: ev.summaryEn ? { en: ev.summaryEn } : undefined,
    citations: [citation],
    orgId: opts.orgId,
    isPublic: opts.isPublic,
    isRetracted: false,
    rawPayload: opts.keepRawPayload ? ev.rawPayload : undefined,
  };
}

/** Batch helper. */
export function toCanonicalEvents(
  events: NormalisedDatasetEvent[],
  opts: ToCanonicalOptions,
): CanonicalEventV1[] {
  return events.map((e) => toCanonicalEvent(e, opts));
}

/** Derive a 1–5 severity from a fatality count (shared heuristic). */
export function severityFromFatalities(fatalities: number): 1 | 2 | 3 | 4 | 5 {
  if (fatalities >= 25) return 5;
  if (fatalities >= 10) return 4;
  if (fatalities >= 3) return 3;
  if (fatalities >= 1) return 2;
  return 1;
}
