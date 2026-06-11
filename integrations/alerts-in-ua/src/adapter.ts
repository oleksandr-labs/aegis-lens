/**
 * Adapter: normalize alerts.in.ua records → canonical AegisEventV1.
 *
 * Maps an AlertRecord (or a cross-validated QuorumResult) onto the platform's
 * single source of truth — `packages/event-schema/src/v1.ts`. Preserves the
 * source/evidence URL as a SourceCitation and forwards the quorum confidence.
 *
 * EventClass mapping: air_raid/artillery/info → "other" is too lossy, so we map
 * to the closest canonical class the schema offers:
 *   air_raid   → "other"        (an air-raid *alert* is a warning, not a strike)
 *   artillery  → "artillery"
 *   urban_*    → "ground_combat"
 *   chemical   → "chemical"
 *   nuclear/rad→ "radiation"
 * subclass carries the precise alert_type so nothing is lost.
 */

import {
  EVENT_SCHEMA_VERSION,
  type AegisEventV1,
  type EventClass,
  type SourceCitation,
} from "../../../packages/event-schema/src/v1";
import type { AlertRecord, AlertType } from "./types";
import { OBLASTS } from "./types";
import { ALERT_TYPE_TAXONOMY, buildAlertText } from "./alert-types";
import { resolveAdminPath } from "./admin-hierarchy";
import type { QuorumResult } from "./cross-validate";

const CLASS_MAP: Record<AlertType, EventClass> = {
  air_raid: "other",
  artillery: "artillery",
  urban_fighting: "ground_combat",
  chemical: "chemical",
  nuclear: "radiation",
  radiological: "radiation",
  info: "other",
};

const SOURCE_TYPE_MAP: Record<AlertRecord["source"], SourceCitation["sourceType"]> = {
  alerts_in_ua_api: "api",
  air_alert_ua_bot: "telegram_channel",
  ova_telegram: "telegram_channel",
  demo: "api",
};

export interface AdapterOptions {
  orgId?: string;
  isPublic?: boolean;
  /** Override confidence (e.g. from cross-validate quorum). Default per source. */
  confidence?: number;
}

const DEFAULT_SOURCE_CONFIDENCE: Record<AlertRecord["source"], number> = {
  alerts_in_ua_api: 0.92,
  air_alert_ua_bot: 0.85,
  ova_telegram: 0.8,
  demo: 0.5,
};

/** Normalize a single AlertRecord into a canonical event. */
export function toAegisEvent(record: AlertRecord, opts: AdapterOptions = {}): AegisEventV1 {
  const path = resolveAdminPath(record.location);
  const tax = ALERT_TYPE_TAXONOMY[record.type] ?? ALERT_TYPE_TAXONOMY.info;
  const now = new Date().toISOString();
  const place = {
    uk: path.oblastNameUk,
    en: path.oblastNameEn,
    ru: OBLASTS[record.location.oblastCode]?.nameUk,
  };
  const kind = record.status === "active" ? "raise" : "clear";
  const confidence =
    opts.confidence ?? DEFAULT_SOURCE_CONFIDENCE[record.source] ?? 0.5;

  const citation: SourceCitation = {
    sourceId: record.source,
    sourceType: SOURCE_TYPE_MAP[record.source],
    url: record.evidenceUrl,
    capturedAt: record.observedAt,
  };

  return {
    eventId: `aiu-${record.alertId}-${Date.parse(record.startedAt) || Date.now()}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: CLASS_MAP[record.type],
    subclass: `alert:${record.type}:${record.status}`,
    location: path.center ? { lat: path.center[1], lon: path.center[0], uncertaintyM: 60_000 } : undefined,
    country: "UA",
    regionCode: record.location.oblastCode,
    severity: kind === "clear" ? 1 : tax.severity,
    confidence,
    verificationState: record.source === "alerts_in_ua_api" ? "verified" : "in_review",
    occurredAt: record.startedAt,
    ingestedAt: now,
    updatedAt: record.observedAt,
    title: {
      uk: buildAlertText(record.type, place, kind, "uk"),
      en: buildAlertText(record.type, place, kind, "en"),
      ru: buildAlertText(record.type, place, kind, "ru"),
    },
    originalText: record.text?.uk,
    citations: [citation],
    orgId: opts.orgId ?? "aegis",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
  };
}

/** Normalize a cross-validated quorum decision into a canonical event. */
export function quorumToAegisEvent(q: QuorumResult, opts: AdapterOptions = {}): AegisEventV1 {
  const info = OBLASTS[q.oblastCode];
  const tax = ALERT_TYPE_TAXONOMY[q.type] ?? ALERT_TYPE_TAXONOMY.info;
  const now = new Date().toISOString();
  const place = { uk: info?.nameUk ?? q.oblastCode, en: info?.nameEn ?? q.oblastCode, ru: info?.nameUk };
  const kind = q.status === "active" ? "raise" : "clear";

  const citations: SourceCitation[] = q.votes.map((v) => ({
    sourceId: v.source,
    sourceType: SOURCE_TYPE_MAP[v.source],
  }));

  return {
    eventId: `aiu-quorum-${q.oblastCode}-${q.type}-${Date.parse(q.startedAt ?? now) || Date.now()}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: CLASS_MAP[q.type],
    subclass: `alert:${q.type}:${q.status}`,
    location: info?.center ? { lat: info.center[1], lon: info.center[0], uncertaintyM: 60_000 } : undefined,
    country: "UA",
    regionCode: q.oblastCode,
    severity: kind === "clear" ? 1 : tax.severity,
    confidence: opts.confidence ?? q.confidence,
    verificationState: q.conflict ? "disputed" : q.confidence >= 0.9 ? "verified" : "in_review",
    occurredAt: q.startedAt ?? now,
    ingestedAt: now,
    updatedAt: now,
    title: {
      uk: buildAlertText(q.type, place, kind, "uk"),
      en: buildAlertText(q.type, place, kind, "en"),
      ru: buildAlertText(q.type, place, kind, "ru"),
    },
    citations,
    orgId: opts.orgId ?? "aegis",
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
  };
}
