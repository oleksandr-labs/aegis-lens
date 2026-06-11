/**
 * Adapter: official records → canonical AegisEventV1 (packages/event-schema).
 *
 * Three entry points, one per record shape:
 *   - daily summary    → a single "humanitarian"/"other" digest event carrying
 *     the structured loss tallies + directions as rawPayload (NOT editorialised
 *     into the title; figures stay as structured data).
 *   - press release    → an "other" event with enriched entities in rawPayload.
 *   - threat alert      → a "missile"/"drone" event for the air-raid context.
 *
 * NEUTRALITY: verificationState is "in_review" — official source, not asserted
 * verified. Loss figures are carried as data (rawPayload), never baked into the
 * human-facing title/summary as fact-claims by us.
 */

import type { AegisEventV1, EventClass } from "@ua-map/event-schema";
import { EVENT_SCHEMA_VERSION } from "@ua-map/event-schema";
import type {
  EnrichedPressRelease,
  GenStaffDailySummary,
  RawOfficialPost,
  ThreatAlert,
} from "./types";
import { OBLASTS } from "./sources";
import { toSourceCitation } from "./provenance";
import { toThreatAlert } from "./airalert-correlation";

function stableId(prefix: string, raw: string): string {
  return `${prefix}-${raw}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

const REGION_FALLBACK = { country: "UA" as const };

/** Daily General-Staff summary → canonical digest event. */
export function summaryToAegisEvent(
  summary: GenStaffDailySummary,
  post: RawOfficialPost,
  opts: { orgId?: string; isPublic?: boolean } = {},
): AegisEventV1 {
  const now = new Date().toISOString();
  const primaryOblast = summary.regions[0];
  return {
    eventId: stableId("genstaff-daily", `${summary.date}-${summary.sourceChannelId}`),
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "other",
    subclass: "genstaff_daily_summary",
    location: primaryOblast
      ? { lat: OBLASTS[primaryOblast].center[1], lon: OBLASTS[primaryOblast].center[0], uncertaintyM: 150_000 }
      : undefined,
    ...REGION_FALLBACK,
    regionCode: primaryOblast,
    severity: 2,
    confidence: summary.partial ? 0.6 : 0.75,
    verificationState: "in_review",
    occurredAt: post.publishedAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      uk: `Зведення Генштабу ЗСУ за ${summary.date}`,
      en: `General Staff daily summary — ${summary.date}`,
    },
    summary: { uk: summary.summary.uk, en: summary.summary.en, de: summary.summary.de },
    originalText: post.text,
    citations: [toSourceCitation(post)],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    // Structured figures travel as data, not editorialised claims.
    rawPayload: {
      losses: summary.losses,
      directions: summary.directions,
      totalEngagements: summary.totalEngagements,
      regions: summary.regions,
      framing: "official_reported_figures",
    },
  };
}

/** Press release → canonical event. */
export function pressToAegisEvent(
  pr: EnrichedPressRelease,
  post: RawOfficialPost,
  opts: { orgId?: string; isPublic?: boolean } = {},
): AegisEventV1 {
  const now = new Date().toISOString();
  const primaryOblast = pr.regions[0];
  return {
    eventId: stableId("genstaff-press", pr.id),
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "other",
    subclass: `${post.branch}_press_release`,
    location: primaryOblast
      ? { lat: OBLASTS[primaryOblast].center[1], lon: OBLASTS[primaryOblast].center[0], uncertaintyM: 120_000 }
      : undefined,
    ...REGION_FALLBACK,
    regionCode: primaryOblast,
    severity: 1,
    confidence: 0.7,
    verificationState: "in_review",
    occurredAt: pr.publishedAt,
    ingestedAt: now,
    updatedAt: now,
    title: { uk: pr.titleUk ?? "Прес-реліз", en: pr.summary.en.slice(0, 120) },
    summary: { uk: pr.summary.uk, en: pr.summary.en, de: pr.summary.de },
    originalText: pr.text,
    citations: [toSourceCitation(post)],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    rawPayload: { entities: pr.entities, kgNodeIds: pr.kgNodeIds, regions: pr.regions },
  };
}

function vectorToClass(vector: ThreatAlert["vector"]): EventClass {
  switch (vector) {
    case "ballistic":
    case "cruise_missile":
    case "naval":
      return "missile";
    case "shahed_uav":
      return "drone";
    case "aircraft":
      return "airstrike";
    default:
      return "other";
  }
}

/** Air Force / Navy threat alert → canonical event. */
export function threatToAegisEvent(
  post: RawOfficialPost,
  opts: { orgId?: string; isPublic?: boolean } = {},
): AegisEventV1 {
  const now = new Date().toISOString();
  const threat: ThreatAlert = toThreatAlert(post);
  const primaryOblast = threat.oblasts[0];
  return {
    eventId: stableId("genstaff-threat", threat.id),
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: vectorToClass(threat.vector),
    subclass: threat.vector,
    location: primaryOblast
      ? { lat: OBLASTS[primaryOblast].center[1], lon: OBLASTS[primaryOblast].center[0], uncertaintyM: 100_000 }
      : undefined,
    ...REGION_FALLBACK,
    regionCode: primaryOblast,
    severity: threat.vector === "ballistic" ? 4 : 3,
    confidence: 0.8,
    verificationState: "in_review",
    occurredAt: threat.issuedAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      uk: threat.noteUk ?? "Повітряна загроза",
      en: `Air threat (${threat.vector.replace(/_/g, " ")})`,
    },
    summary: {
      uk: post.text.slice(0, 200),
      en: `Official air-threat alert for ${threat.oblasts.map((o) => OBLASTS[o].nameEn).join(", ") || "Ukraine"}.`,
      de: `Offizielle Luftbedrohungswarnung für ${threat.oblasts.map((o) => OBLASTS[o].nameEn).join(", ") || "Ukraine"}.`,
    },
    originalText: post.text,
    citations: [toSourceCitation(post)],
    orgId: opts.orgId ?? "public",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    rawPayload: { vector: threat.vector, oblasts: threat.oblasts },
  };
}
