/**
 * Auto-link infrastructure damage → power-outage layer.
 *
 * When an energy-category asset is damaged, there is usually a corresponding power
 * outage in the same oblast around the same time. This module correlates
 * `InfrastructureDamageEvent`s (category "power") with `OutageEvent`s from the
 * power-outages integration by region + temporal proximity, and back-fills
 * `linkedPowerOutageEventId` on the damage event.
 *
 * The `OutageEvent` shape is mirrored locally (structural typing) to avoid a hard
 * package dependency; it matches `@ua-map/integration-power-outages` `types.ts`.
 */

import { InfrastructureDamageEvent } from "./types";

/** Minimal structural view of a power-outages OutageEvent. */
export interface PowerOutageRef {
  outageId: string;
  regionCode: string;
  status: "active" | "partial" | "restored" | "scheduled";
  cause: "damage" | "scheduled" | "weather" | "unknown";
  startedAt: string;
  restoredAt: string | null;
  coverage: number; // 0–1
}

export interface PowerLinkOptions {
  /** Hours after the damage event within which an outage may be linked. */
  windowAfterHours?: number;
  /** Hours before the damage event (slack for outage detected slightly earlier). */
  windowBeforeHours?: number;
}

export interface PowerLink {
  damageEventId: string;
  outageId: string;
  regionCode: string;
  /** Hours between damage time and outage start (signed: +ve = outage after damage). */
  lagHours: number;
  /** Correlation confidence 0–1. */
  confidence: number;
}

function timeMs(iso: string): number {
  return new Date(iso).getTime();
}

/**
 * Find the best-correlated outage for a single energy-damage event.
 * Only events with `category === "power"` are eligible; others return undefined.
 */
export function matchOutageForDamage(
  event: InfrastructureDamageEvent,
  outages: PowerOutageRef[],
  opts: PowerLinkOptions = {},
): PowerLink | undefined {
  if (event.category !== "power" || !event.regionCode) return undefined;
  const after = (opts.windowAfterHours ?? 12) * 3600_000;
  const before = (opts.windowBeforeHours ?? 2) * 3600_000;
  const dMs = timeMs(event.occurredAt);

  let best: PowerLink | undefined;
  for (const o of outages) {
    if (o.regionCode !== event.regionCode) continue;
    const oMs = timeMs(o.startedAt);
    if (oMs < dMs - before || oMs > dMs + after) continue;

    const lagH = (oMs - dMs) / 3600_000;
    // Confidence: damage-caused active/partial outages with high coverage and a
    // short positive lag are the strongest signal.
    let confidence = 0.5;
    if (o.cause === "damage") confidence += 0.25;
    if (o.status === "active" || o.status === "partial") confidence += 0.1;
    confidence += 0.15 * Math.max(0, o.coverage);
    if (lagH >= 0) confidence += 0.05; // outage starts after damage = causally consistent
    confidence = Number(Math.min(1, confidence).toFixed(3));

    if (!best || confidence > best.confidence) {
      best = { damageEventId: event.eventId, outageId: o.outageId, regionCode: o.regionCode, lagHours: Number(lagH.toFixed(1)), confidence };
    }
  }
  return best;
}

/**
 * Annotate a batch of damage events with linked power outages.
 * Returns new event objects (with `linkedPowerOutageEventId`) plus the link audit list.
 */
export function linkPowerOutages(
  events: InfrastructureDamageEvent[],
  outages: PowerOutageRef[],
  opts?: PowerLinkOptions,
): { events: InfrastructureDamageEvent[]; links: PowerLink[] } {
  const links: PowerLink[] = [];
  const annotated = events.map((e) => {
    const link = matchOutageForDamage(e, outages, opts);
    if (!link) return e;
    links.push(link);
    return { ...e, linkedPowerOutageEventId: link.outageId };
  });
  return { events: annotated, links };
}
