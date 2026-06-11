/**
 * Map Oryx entries → canonical Aegis Event v1 (`@aegis/event-schema`).
 *
 * Each visually-confirmed loss becomes one canonical event of type
 * "equipment_loss". The canonical `EventClass` union does not (yet) carry an
 * `equipment_loss` member, so to stay schema-valid we set `class: "ground_combat"`
 * (the closest existing member for kinetic equipment attrition) and stamp the
 * intended taxonomy type via:
 *   - `subclass` = the equipment model slug, and
 *   - a stable `ORYX_EVENT_TYPE` marker forwarded in `rawPayload.eventType`.
 *
 * Oryx evidence URLs are preserved as `SourceCitation`s (Task 6).
 */

import {
  EVENT_SCHEMA_VERSION,
  getDangerBand,
  type AegisEventV1,
  type SourceCitation,
} from "@aegis/event-schema";
import type { OryxEntry, OryxLossStatus } from "./types";
import { ORYX_SIDE_LABELS, ORYX_STATUS_LABELS } from "./types";

/** Canonical event-type marker for the equipment-loss taxonomy. */
export const ORYX_EVENT_TYPE = "equipment_loss" as const;

const ORYX_SOURCE_ID = "oryx";
const DEFAULT_ORG_ID = "aegis-public";

/** Severity per loss status (destruction is the most significant attrition). */
const STATUS_SEVERITY: Record<OryxLossStatus, AegisEventV1["severity"]> = {
  destroyed: 3,
  captured: 3,
  damaged: 2,
  abandoned: 2,
};

export interface OryxEventMapOptions {
  orgId?: string;
  isPublic?: boolean;
}

/** Map one Oryx entry to a canonical Aegis event. */
export function mapEntryToEvent(entry: OryxEntry, opts: OryxEventMapOptions = {}): AegisEventV1 {
  const sideLabel = ORYX_SIDE_LABELS[entry.side];
  const statusLabel = ORYX_STATUS_LABELS[entry.status];
  const occurredAt = entry.date
    ? new Date(`${entry.date}T00:00:00Z`).toISOString()
    : entry.ingestedAt;

  // Oryx is a strict visual-verification project — treat as verified, with
  // confidence reduced when the date is only approximate.
  const confidence = entry.dateApproximate ? 0.85 : 0.95;
  const severity = STATUS_SEVERITY[entry.status];

  const citations: SourceCitation[] = [
    {
      sourceId: ORYX_SOURCE_ID,
      sourceType: "scraper",
      url: entry.oryxPostUrl,
      capturedAt: entry.ingestedAt,
    },
  ];
  // Evidence URL is the visual confirmation — keep it as a distinct citation.
  if (entry.evidenceUrl) {
    citations.push({
      sourceId: `${ORYX_SOURCE_ID}-evidence`,
      sourceType: "scraper",
      url: entry.evidenceUrl,
      capturedAt: entry.ingestedAt,
    });
  }

  const dangerBand = getDangerBand((severity / 5) * 40 + confidence * 30);

  return {
    eventId: `oryx-${entry.entryId}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "ground_combat",
    subclass: entry.modelSlug,
    country: "UA",
    regionCode: entry.regionCode,
    severity,
    confidence,
    dangerBand,
    verificationState: "verified",
    occurredAt,
    ingestedAt: entry.ingestedAt,
    updatedAt: entry.ingestedAt,
    title: {
      en: `${entry.model.en} ${statusLabel.en.toLowerCase()} (${sideLabel.en})`,
      uk: `${entry.model.uk} — ${statusLabel.uk.toLowerCase()} (${sideLabel.uk})`,
    },
    summary: {
      en: `Visually-confirmed equipment loss: ${entry.model.en} ${statusLabel.en.toLowerCase()}${
        entry.locationText ? `, ${entry.locationText.en}` : ""
      }. Verified by Oryx.`,
      uk: `Візуально підтверджена втрата техніки: ${entry.model.uk} — ${statusLabel.uk.toLowerCase()}${
        entry.locationText ? `, ${entry.locationText.uk}` : ""
      }. Перевірено Oryx.`,
    },
    mediaUrls: entry.evidenceUrl ? [entry.evidenceUrl] : undefined,
    citations,
    orgId: opts.orgId ?? DEFAULT_ORG_ID,
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    rawPayload: { eventType: ORYX_EVENT_TYPE, oryx: entry },
  };
}

/** Map a batch of Oryx entries to canonical events. */
export function mapEntriesToEvents(entries: OryxEntry[], opts?: OryxEventMapOptions): AegisEventV1[] {
  return entries.map((e) => mapEntryToEvent(e, opts));
}
