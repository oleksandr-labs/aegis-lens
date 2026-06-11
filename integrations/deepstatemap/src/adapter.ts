/**
 * SourceAdapter: normalize DeepStateMAP frontline changes → canonical AegisEventV1.
 *
 * The frontline itself is a *state* (polygons), not a stream of events; but meaningful
 * CHANGES (a sector flips to liberated, a boundary advance, daily commentary) map well
 * onto the canonical event model. This adapter emits one `ground_combat` event per
 * significant control change in a SnapshotDiff, plus optional `other`-class events for
 * daily Telegram commentary. Source/evidence URLs and confidence are preserved.
 *
 * Maps to packages/event-schema/src/v1.ts (same relative-import pattern as integrations/isw).
 */

import type { AegisEventV1, SourceCitation } from "../../../packages/event-schema/src/v1";
import { EVENT_SCHEMA_VERSION } from "../../../packages/event-schema/src/v1";
import type {
  FrontlineCommentary,
  PolygonChange,
  SnapshotDiff,
} from "./types";
import { DEEPSTATE_SOURCE_URL, DEEPSTATE_TELEGRAM_URL } from "./attribution";

const ORG_ID = "aegis";

/** Severity by change type/status — liberations and new occupations are significant. */
function severityFor(change: PolygonChange): 1 | 2 | 3 | 4 | 5 {
  if (change.type === "status_changed") return 4;
  if (change.type === "added") return change.newStatus === "controlled" ? 4 : 3;
  if (change.type === "removed") return 3;
  return 2; // geometry shift
}

/** Confidence from the change's status; contested is inherently lower. */
function confidenceFor(change: PolygonChange): number {
  const s = change.newStatus ?? change.previousStatus;
  if (s === "controlled") return 0.85;
  if (s === "liberated") return 0.75;
  if (s === "contested") return 0.5;
  return 0.7;
}

function changeTitle(change: PolygonChange): { en: string; uk: string } {
  const lblEn = change.label?.en ?? change.label?.uk ?? change.polygonId;
  const lblUk = change.label?.uk ?? change.label?.en ?? change.polygonId;
  switch (change.type) {
    case "status_changed":
      return {
        en: `Frontline control change: ${change.previousStatus} → ${change.newStatus} (${lblEn})`,
        uk: `Зміна контролю на фронті: ${change.previousStatus} → ${change.newStatus} (${lblUk})`,
      };
    case "added":
      return {
        en: `New ${change.newStatus} area mapped (${lblEn})`,
        uk: `Картографовано нову зону (${change.newStatus}) (${lblUk})`,
      };
    case "removed":
      return {
        en: `Area no longer ${change.previousStatus} (${lblEn})`,
        uk: `Зона більше не ${change.previousStatus} (${lblUk})`,
      };
    default:
      return {
        en: `Frontline boundary shift (${lblEn})`,
        uk: `Зміна меж лінії фронту (${lblUk})`,
      };
  }
}

export class DeepStateMapAdapter {
  /** Map a SnapshotDiff into canonical events (one per significant change). */
  toEvents(diff: SnapshotDiff): AegisEventV1[] {
    const now = new Date().toISOString();
    const occurredAt = `${diff.toDate}T00:00:00.000Z`;

    const citation: SourceCitation = {
      sourceId: `deepstatemap:${diff.toDate}`,
      sourceType: "api",
      url: DEEPSTATE_SOURCE_URL,
      capturedAt: now,
    };

    return diff.changes.map((change, i) => {
      const title = changeTitle(change);
      const confidence = confidenceFor(change);
      return {
        eventId: `deepstate-${diff.toDate}-${change.polygonId}-${i}`,
        schemaVersion: EVENT_SCHEMA_VERSION,
        class: "ground_combat",
        subclass: `control_${change.type}`,
        country: "UA",
        severity: severityFor(change),
        confidence,
        verificationState: change.newStatus === "contested" ? "in_review" : "verified",
        occurredAt,
        ingestedAt: now,
        updatedAt: now,
        title,
        summary: title,
        citations: [citation],
        orgId: ORG_ID,
        isPublic: true,
        isRetracted: false,
        rawPayload: change,
      } satisfies AegisEventV1;
    });
  }

  /** Map daily Telegram commentary into low-severity `other` context events. */
  commentaryToEvents(commentary: FrontlineCommentary[]): AegisEventV1[] {
    const now = new Date().toISOString();
    return commentary.map((c) => {
      const citation: SourceCitation = {
        sourceId: `deepstate-tg:${c.messageId}`,
        sourceType: "telegram_channel",
        url: c.url,
        capturedAt: now,
      };
      return {
        eventId: `deepstate-commentary-${c.messageId}`,
        schemaVersion: EVENT_SCHEMA_VERSION,
        class: "other",
        subclass: "frontline_commentary",
        country: "UA",
        severity: 1,
        confidence: 0.5,
        verificationState: "unverified",
        occurredAt: c.postedAt,
        ingestedAt: now,
        updatedAt: now,
        title: { en: "DeepStateMAP daily commentary", uk: "Щоденний коментар DeepStateMAP" },
        summary: c.summary,
        originalText: c.originalText,
        citations: [citation, { sourceId: "deepstate-tg-channel", sourceType: "telegram_channel", url: DEEPSTATE_TELEGRAM_URL }],
        orgId: ORG_ID,
        isPublic: true,
        isRetracted: false,
        rawPayload: c,
      } satisfies AegisEventV1;
    });
  }
}
