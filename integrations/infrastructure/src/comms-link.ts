/**
 * Auto-link infrastructure damage → communications-outage layer.
 *
 * Damage to telecom-category assets (cell towers, fiber nodes, ISP infrastructure)
 * commonly coincides with internet / cellular outages detected by Cloudflare Radar
 * and NetBlocks. This module correlates telecom-category `InfrastructureDamageEvent`s
 * with communications-outage records by region + temporal proximity and back-fills
 * `linkedCommsOutageEventId`.
 *
 * Comms-outage shape is mirrored structurally to avoid a hard package dependency.
 */

import { InfrastructureDamageEvent } from "./types";

/** Minimal structural view of a communications-outage record. */
export interface CommsOutageRef {
  outageId: string;
  regionCode: string;
  /** Network layer affected. */
  kind: "internet" | "cellular" | "both";
  status: "active" | "partial" | "restored";
  startedAt: string;
  restoredAt: string | null;
  /** Connectivity drop magnitude 0–1 (1 = full blackout). */
  severity: number;
  source?: "cloudflare_radar" | "netblocks" | "community_report";
}

export interface CommsLinkOptions {
  windowAfterHours?: number;
  windowBeforeHours?: number;
}

export interface CommsLink {
  damageEventId: string;
  outageId: string;
  regionCode: string;
  lagHours: number;
  confidence: number;
}

function timeMs(iso: string): number {
  return new Date(iso).getTime();
}

/**
 * Find the best-correlated comms outage for a single telecom-damage event.
 * Only events with `category === "telecom"` are eligible.
 */
export function matchCommsForDamage(
  event: InfrastructureDamageEvent,
  outages: CommsOutageRef[],
  opts: CommsLinkOptions = {},
): CommsLink | undefined {
  if (event.category !== "telecom" || !event.regionCode) return undefined;
  const after = (opts.windowAfterHours ?? 12) * 3600_000;
  const before = (opts.windowBeforeHours ?? 2) * 3600_000;
  const dMs = timeMs(event.occurredAt);

  let best: CommsLink | undefined;
  for (const o of outages) {
    if (o.regionCode !== event.regionCode) continue;
    const oMs = timeMs(o.startedAt);
    if (oMs < dMs - before || oMs > dMs + after) continue;

    const lagH = (oMs - dMs) / 3600_000;
    let confidence = 0.5;
    if (o.status === "active" || o.status === "partial") confidence += 0.1;
    confidence += 0.25 * Math.max(0, Math.min(1, o.severity));
    if (o.source === "cloudflare_radar" || o.source === "netblocks") confidence += 0.1;
    if (lagH >= 0) confidence += 0.05;
    confidence = Number(Math.min(1, confidence).toFixed(3));

    if (!best || confidence > best.confidence) {
      best = { damageEventId: event.eventId, outageId: o.outageId, regionCode: o.regionCode, lagHours: Number(lagH.toFixed(1)), confidence };
    }
  }
  return best;
}

/**
 * Annotate a batch of damage events with linked comms outages.
 * Returns new event objects (with `linkedCommsOutageEventId`) plus the link audit list.
 */
export function linkCommsOutages(
  events: InfrastructureDamageEvent[],
  outages: CommsOutageRef[],
  opts?: CommsLinkOptions,
): { events: InfrastructureDamageEvent[]; links: CommsLink[] } {
  const links: CommsLink[] = [];
  const annotated = events.map((e) => {
    const link = matchCommsForDamage(e, outages, opts);
    if (!link) return e;
    links.push(link);
    return { ...e, linkedCommsOutageEventId: link.outageId };
  });
  return { events: annotated, links };
}
