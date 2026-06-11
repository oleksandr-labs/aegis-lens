/**
 * Air Force missile/drone alert correlation with the civilian_alerts layer
 * (task 8).
 *
 * The Air Force Command publishes operational THREAT posts ("Ракетна небезпека
 * для Харківської області", "БпЛА курсом на…"). The civilian air-raid layer
 * (air_raid_alerts) carries the corresponding regional alert state from the
 * alerts API. This module:
 *   1. Classifies each Air Force threat post into a typed ThreatAlert
 *      (vector + affected oblasts).
 *   2. Correlates it with the active civilian alert snapshot, reporting
 *      agreement (both fired for an oblast), an official-only lead (threat
 *      posted, alert not yet active — a useful "early warning" signal), or an
 *      alert-only state (civilian alert with no matching official post).
 *
 * NEUTRALITY: this presents the relationship between two official signals; it
 * does not assert one is right and the other wrong.
 *
 * The civilian-alert snapshot is passed in via a minimal structural type so this
 * package does not hard-depend on @ua-map/civilian-alerts (loose coupling); the
 * shape mirrors `AlertFeedSnapshot` from that package.
 */

import type { OblastCode, RawOfficialPost, ThreatAlert, ThreatVector } from "./types";
import { OBLASTS, resolveOblasts } from "./sources";

/** Minimal mirror of civilian-alerts AlertFeedSnapshot (loose coupling). */
export interface CivilianAlertSnapshotLike {
  fetchedAt: string;
  activeOblastCodes: string[];
}

/** Classify the threat vector from the post wording. */
export function classifyVector(text: string): ThreatVector {
  if (/балістичн/iu.test(text)) return "ballistic";
  if (/крилат[аиоі]+\s+ракет|калібр/iu.test(text)) return "cruise_missile";
  if (/shahed|шахед|бпла|герань|дрон/iu.test(text)) return "shahed_uav";
  if (/стратегічн[аоі]+\s+авіаці|зліт.*авіаці|літак/iu.test(text)) return "aircraft";
  if (/носі.*ракет|чорн[оо]му?\s+мор|калібр.*мор/iu.test(text)) return "naval";
  return "unknown";
}

/** Build a typed ThreatAlert from an Air Force / Navy threat post. */
export function toThreatAlert(post: RawOfficialPost): ThreatAlert {
  const text = `${post.titleUk ?? ""} ${post.text}`;
  return {
    id: post.id,
    branch: post.branch,
    vector: classifyVector(text),
    oblasts: resolveOblasts(text) as OblastCode[],
    noteUk: post.titleUk,
    issuedAt: post.publishedAt,
    url: post.url,
    sourceChannelId: post.channelId,
    text: post.text,
  };
}

export type CorrelationStatus =
  | "agreement"      // official threat + active civilian alert for the oblast
  | "official_lead"  // official threat posted, civilian alert not (yet) active
  | "alert_only";    // civilian alert active, no matching official post

export interface OblastCorrelation {
  oblast: OblastCode;
  oblastName: { uk: string; en: string };
  status: CorrelationStatus;
  /** Threat vectors named by the Air Force/Navy for this oblast. */
  vectors: ThreatVector[];
  /** Source threat-alert ids that named this oblast. */
  threatIds: string[];
  /** True if a civilian air-raid alert is active for this oblast. */
  civilianAlertActive: boolean;
}

export interface AirAlertCorrelationResult {
  generatedAt: string;
  /** Per-oblast correlation rows. */
  oblasts: OblastCorrelation[];
  counts: Record<CorrelationStatus, number>;
  /** Layer this informs (read-only consumer, no new layer). */
  layer: "air_raid_alerts";
}

/**
 * Correlate a set of official threat posts with the active civilian-alert
 * snapshot. Considers only threats within `windowMin` of the snapshot time
 * (default 90 min) so stale posts don't create phantom correlations.
 */
export function correlateAirAlerts(
  threatPosts: RawOfficialPost[],
  snapshot: CivilianAlertSnapshotLike,
  opts: { windowMin?: number; now?: number } = {},
): AirAlertCorrelationResult {
  const now = opts.now ?? Date.now();
  const windowMs = (opts.windowMin ?? 90) * 60_000;
  const active = new Set<string>(snapshot.activeOblastCodes);

  const fresh = threatPosts
    .filter((p) => p.commKind === "threat_alert")
    .filter((p) => now - Date.parse(p.publishedAt) <= windowMs)
    .map(toThreatAlert);

  // Build per-oblast aggregation across all fresh threats + active alerts.
  const rows = new Map<OblastCode, OblastCorrelation>();
  const ensure = (code: OblastCode): OblastCorrelation => {
    let r = rows.get(code);
    if (!r) {
      r = {
        oblast: code,
        oblastName: { uk: OBLASTS[code].nameUk, en: OBLASTS[code].nameEn },
        status: "alert_only",
        vectors: [],
        threatIds: [],
        civilianAlertActive: active.has(code),
      };
      rows.set(code, r);
    }
    return r;
  };

  for (const t of fresh) {
    for (const code of t.oblasts) {
      const r = ensure(code);
      r.threatIds.push(t.id);
      if (!r.vectors.includes(t.vector)) r.vectors.push(t.vector);
    }
  }
  // Also create rows for civilian alerts with no official post.
  for (const code of active) {
    if (OBLASTS[code as OblastCode]) ensure(code as OblastCode);
  }

  for (const r of rows.values()) {
    const hasThreat = r.threatIds.length > 0;
    if (hasThreat && r.civilianAlertActive) r.status = "agreement";
    else if (hasThreat && !r.civilianAlertActive) r.status = "official_lead";
    else r.status = "alert_only";
  }

  const oblasts = [...rows.values()].sort((a, b) => a.oblast.localeCompare(b.oblast));
  const counts: Record<CorrelationStatus, number> = { agreement: 0, official_lead: 0, alert_only: 0 };
  for (const r of oblasts) counts[r.status]++;

  return {
    generatedAt: new Date(now).toISOString(),
    oblasts,
    counts,
    layer: "air_raid_alerts",
  };
}
