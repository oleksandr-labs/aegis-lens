/**
 * Source record types for the alerts.in.ua air-raid alert feed.
 *
 * Primary source : alerts.in.ua API (https://api.alerts.in.ua/) — free + commercial tiers.
 * Fallback A     : official `air_alert_ua` Telegram bot (Bot API, read-only).
 * Fallback B     : regional OVA Telegram channels (one per oblast).
 *
 * This package COMPLEMENTS @ua-map/civilian-alerts (which wraps the UkraineAlarm
 * API). It deliberately REUSES the same oblast model — OblastCode / OblastInfo /
 * OBLASTS / AlertType / AlertStatus are re-exported from @ua-map/civilian-alerts
 * so the two feeds normalize to one shared oblast registry. We do NOT redefine
 * them here. alerts.in.ua adds finer granularity (raion / hromada) on top.
 */

// ── Reuse the shared oblast + alert model from civilian-alerts ─────────────────
// NOTE: kept as a relative path so the package builds without a workspace alias;
// civilian-alerts is a sibling integration package in this monorepo.
export type {
  OblastCode,
  OblastInfo,
  AlertType,
  AlertStatus,
} from "../../civilian-alerts/src/types";
export { OBLASTS } from "../../civilian-alerts/src/types";

import type {
  OblastCode,
  AlertType,
  AlertStatus,
} from "../../civilian-alerts/src/types";

// ── Source identity / tiering ──────────────────────────────────────────────────

/** Which upstream produced a given observation. */
export type AlertSource =
  | "alerts_in_ua_api" // primary
  | "air_alert_ua_bot" // Telegram bot fallback
  | "ova_telegram"     // regional OVA channel fallback
  | "demo";            // bundled fixture (no secrets)

/** alerts.in.ua exposes a free tier and paid commercial tiers. */
export type AlertsInUaTier = "free" | "commercial" | "enterprise";

/** Admin-hierarchy depth of a location node returned by alerts.in.ua. */
export type LocationKind = "oblast" | "raion" | "hromada" | "city";

// ── Admin hierarchy (oblast → raion → hromada) ─────────────────────────────────

/**
 * A single alert location as modelled by alerts.in.ua, mapped onto the UA admin
 * hierarchy. `oblastCode` always resolves to the shared OBLASTS registry; the
 * raion/hromada fields are present only for sub-oblast alerts (commercial tier).
 */
export interface AlertLocation {
  /** alerts.in.ua numeric/string location uid. */
  locationUid: string;
  kind: LocationKind;
  /** Resolved ISO-3166-2 oblast (always present). */
  oblastCode: OblastCode;
  /** KATOTTG raion code, if this is a raion/hromada-level alert. */
  raionCode?: string;
  /** KATOTTG hromada code, if hromada-level. */
  hromadaCode?: string;
  nameUk: string;
  nameEn?: string;
  nameRu?: string;
  /** Approximate centroid [lon, lat] when known. */
  center?: [number, number];
}

// ── Raw / normalized alert record ──────────────────────────────────────────────

/**
 * A single alert observation from ONE source. Multiple of these (from different
 * sources, same location) are reconciled by cross-validate.ts into a quorum.
 */
export interface AlertRecord {
  /** Stable id within this package: `${source}:${locationUid}:${type}`. */
  alertId: string;
  source: AlertSource;
  tier?: AlertsInUaTier;
  location: AlertLocation;
  type: AlertType;
  status: AlertStatus;
  /** ISO-8601 — when the alert began. */
  startedAt: string;
  /** ISO-8601 — when cleared (status !== "active"). */
  endedAt?: string;
  durationSec?: number;
  /** ISO-8601 — when THIS source last refreshed this record (freshness SLO). */
  observedAt: string;
  /** Human-readable text per locale. */
  text?: { uk?: string; en?: string; ru?: string };
  /** Source/evidence URL (API doc, bot deep-link, channel post). */
  evidenceUrl?: string;
}

/** A point-in-time snapshot of all active alerts from one or more sources. */
export interface AlertsSnapshot {
  fetchedAt: string;
  source: AlertSource;
  tier?: AlertsInUaTier;
  active: AlertRecord[];
  activeOblasts: OblastCode[];
  count: number;
}

// ── Re-exported convenience aliases (so downstream needn't reach into deps) ─────

export type { OblastCode as IsoOblastCode };
