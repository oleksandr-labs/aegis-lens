/**
 * Task 8 — Per-activation linked event (→ canonical Event v1).
 *
 * Normalizes an EMS activation (+ its converted outputs / cross-reference) into
 * the canonical Aegis Lens Event (packages/event-schema/src/v1.ts AegisEventV1).
 *
 * Mapping decisions:
 *   - hazard "flood"      → class "fire"? no → class "other" + subclass "flood"
 *     (the schema has no `flood` class; we use the closest fit per hazard, see
 *      HAZARD_TO_CLASS below — flood→"infrastructure_damage" is wrong, so floods
 *      map to class "other" subclass "flood"; fire→"fire"; conflict→
 *      "infrastructure_damage"). This keeps us additive to the canonical enum.
 *   - source type         → "satellite_imagery" (EMS is satellite-derived).
 *   - confidence: EMS is an official, authoritative source → high baseline (0.85),
 *     optionally boosted by Sentinel cross-reference corroboration.
 *   - verificationState    → "verified" (official EU product).
 *
 * A field-name mirror of the canonical shape is kept local (avoid cross-package
 * build coupling); field names match AegisEventV1.
 */

import type { EmsActivation, EmsHazardType } from "./types";
import type { CrisisSummary } from "./to-layers";
import { HAZARD_LABELS } from "./types";

// Local mirror of the canonical event (names match packages/event-schema v1).
export interface CanonicalEvent {
  eventId: string;
  schemaVersion: "1.0.0";
  class:
    | "fire"
    | "infrastructure_damage"
    | "humanitarian"
    | "other";
  subclass?: string;
  location?: { lat: number; lon: number; uncertaintyM?: number };
  country: string;
  regionCode?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  verificationState: "verified" | "unverified" | "in_review";
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  title: { en?: string; uk?: string };
  summary?: { en?: string; uk?: string };
  citations: Array<{
    sourceId: string;
    sourceType: "satellite_imagery";
    url?: string;
    capturedAt?: string;
  }>;
  links?: Array<{ eventId: string; linkType: "corroborates" | "same_incident" | "caused" }>;
  orgId: string;
  isPublic: boolean;
  isRetracted: boolean;
}

const DEFAULT_ORG = "aegis-public";

/** EMS hazard → canonical event class (additive to the canonical enum). */
const HAZARD_TO_CLASS: Record<EmsHazardType, CanonicalEvent["class"]> = {
  fire: "fire",
  conflict: "infrastructure_damage",
  industrial: "infrastructure_damage",
  flood: "other",
  storm: "other",
  earthquake: "other",
  landslide: "other",
  volcanic: "other",
  other: "other",
};

/** Severity from affected area + worst damage grade. */
function severityFor(summary?: CrisisSummary): 1 | 2 | 3 | 4 | 5 {
  if (!summary) return 3;
  if (summary.gradeCounts.destroyed && summary.gradeCounts.destroyed > 0) return 5;
  if (summary.gradeCounts.damaged && summary.gradeCounts.damaged > 0) return 4;
  const km2 = summary.affectedAreaM2 / 1_000_000;
  if (km2 >= 50) return 5;
  if (km2 >= 10) return 4;
  if (km2 >= 1) return 3;
  if (km2 > 0) return 2;
  return 3;
}

export interface ActivationEventOptions {
  orgId?: string;
  isPublic?: boolean;
  summary?: CrisisSummary;
  /** Optional confidence boost from Sentinel cross-reference (sentinel-xref). */
  confidenceBoost?: number;
  /** Optional linked Sentinel-derived event id (corroboration). */
  linkedSentinelEventId?: string;
}

/**
 * Map an EMS activation → a canonical Event. The event's id is deterministic per
 * activation so repeated pulls update (not duplicate) the same event.
 */
export function activationToEvent(
  a: EmsActivation,
  opts: ActivationEventOptions = {},
): CanonicalEvent {
  const now = new Date().toISOString();
  const hz = HAZARD_LABELS[a.hazard];
  const baseConfidence = 0.85; // official EU authoritative source
  const confidence = Math.max(
    0,
    Math.min(1, Math.round((baseConfidence + (opts.confidenceBoost ?? 0)) * 100) / 100),
  );
  const loc = a.centroid
    ? { lon: a.centroid[0], lat: a.centroid[1], uncertaintyM: 5000 }
    : undefined;

  const ev: CanonicalEvent = {
    eventId: `copernicus-ems:${a.code}`,
    schemaVersion: "1.0.0",
    class: HAZARD_TO_CLASS[a.hazard],
    subclass: a.hazard,
    location: loc ? { lat: loc.lat, lon: loc.lon, uncertaintyM: loc.uncertaintyM } : undefined,
    country: a.countries[0] ?? "UA",
    severity: severityFor(opts.summary),
    confidence,
    verificationState: "verified",
    occurredAt: a.activatedAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `Copernicus EMS ${a.code}: ${hz.en} — ${a.title}`,
      uk: `Copernicus EMS ${a.code}: ${hz.uk} — ${a.title}`,
    },
    summary: {
      en: `EU Emergency Management Service activation ${a.code} (${hz.en}). ${
        opts.summary
          ? `${opts.summary.featureCount} mapped features, ~${Math.round(opts.summary.affectedAreaM2 / 1_000_000)} km² affected.`
          : "Authoritative crisis mapping in progress."
      }`,
      uk: `Активація Служби управління надзвичайними ситуаціями ЄС ${a.code} (${hz.uk}). ${
        opts.summary
          ? `${opts.summary.featureCount} картографованих об'єктів, ~${Math.round(opts.summary.affectedAreaM2 / 1_000_000)} км² ураження.`
          : "Триває офіційне кризове картографування."
      }`,
    },
    citations: [
      {
        sourceId: `Copernicus EMS ${a.code}`,
        sourceType: "satellite_imagery",
        url: a.url,
        capturedAt: now,
      },
    ],
    orgId: opts.orgId ?? DEFAULT_ORG,
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
  };

  if (opts.linkedSentinelEventId) {
    ev.links = [{ eventId: opts.linkedSentinelEventId, linkType: "corroborates" }];
  }
  return ev;
}

/** Build events for a set of activations. */
export function activationsToEvents(
  activations: EmsActivation[],
  opts: ActivationEventOptions = {},
): CanonicalEvent[] {
  return activations.map((a) => activationToEvent(a, opts));
}
