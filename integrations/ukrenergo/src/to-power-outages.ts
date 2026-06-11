/**
 * Map this package's parsed/classified grid data → OutageSignal[] for the
 * existing integrations/power-outages fusion layer (fuseSignals()).
 *
 * No new map layer is introduced: Ukrenergo/oblenergo data enters the platform
 * through the established `power_outages` layer. This module is the bridge.
 *
 * The emitted OutageSignal is structurally identical to power-outages' own
 * type, so the output can be passed directly into fuseSignals().
 */

import type {
  RegionSchedule,
  OutageSignal,
  OutageSignalSource,
} from "./types";
import { classifyOutage, type OutageClassification } from "./classify-outage";
import { blockAt, parseHHMM } from "./schedule-parser";

const KYIV_OFFSET_HOURS = 3;

function localMinutesNow(now: Date): number {
  const d = new Date(now.getTime() + KYIV_OFFSET_HOURS * 3600_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/**
 * Estimate the fraction of a region currently without power from a parsed
 * schedule: share of groups whose current block is OFF. Emergencies without a
 * grid fall back to a coverage heuristic by kind.
 */
function coverageFromSchedule(schedule: RegionSchedule, now: Date): number {
  if (schedule.groups.length === 0) {
    return schedule.kind === "emergency" ? 0.5 : schedule.kind === "stabilization" ? 0.35 : 0.25;
  }
  const nowMin = localMinutesNow(now);
  let off = 0;
  for (const g of schedule.groups) {
    const b = blockAt(g, nowMin);
    if (b?.off) off++;
  }
  return schedule.groups.length ? off / schedule.groups.length : 0;
}

/** Pick the OutageSignal source channel for a schedule's provider/kind. */
function signalSource(schedule: RegionSchedule): OutageSignalSource {
  if (schedule.kind === "scheduled" || schedule.kind === "stabilization") return "scheduled_blackout";
  // Emergency + operator-published prose enters as a monitored-channel signal.
  return "telegram_channel";
}

/**
 * Convert a single parsed RegionSchedule into an OutageSignal (or null if the
 * region currently has no active outage — e.g. restored, or no group OFF now).
 */
export function scheduleToSignal(
  schedule: RegionSchedule,
  opts: { now?: Date; extraText?: string } = {},
): OutageSignal | null {
  const now = opts.now ?? new Date();
  const cls: OutageClassification = classifyOutage(schedule, opts.extraText ?? "");

  if (cls.kind === "restored") return null;

  const coverage = coverageFromSchedule(schedule, now);
  // If a grid exists but no group is currently OFF, there is no active outage.
  if (schedule.groups.length > 0 && coverage === 0) return null;

  return {
    source: signalSource(schedule),
    regionCode: schedule.regionCode,
    confidence: cls.confidence,
    detectedAt: schedule.publishedAt,
    cause: cls.cause,
    estimatedCoverage: parseFloat(coverage.toFixed(2)),
    rawData: {
      feed: "ukrenergo",
      provider: schedule.provider,
      kind: cls.kind,
      predictable: cls.predictable,
      groups: schedule.groups.length,
      sourceUrl: schedule.sourceUrl,
    },
  };
}

/** Convert many parsed schedules into OutageSignals (drops nulls). */
export function schedulesToSignals(
  schedules: RegionSchedule[],
  opts: { now?: Date } = {},
): OutageSignal[] {
  const out: OutageSignal[] = [];
  for (const s of schedules) {
    const sig = scheduleToSignal(s, { now: opts.now });
    if (sig) out.push(sig);
  }
  return out;
}

/**
 * For a given consumer group, is that group OFF right now per the schedule?
 * Used by my-area.ts; exported here as the schedule→state helper.
 */
export function groupIsOff(schedule: RegionSchedule, group: string, now: Date = new Date()): boolean {
  const g = schedule.groups.find((x) => x.group === group);
  if (!g) return false;
  const b = blockAt(g, localMinutesNow(now));
  return Boolean(b?.off);
}

/** Minutes until a group's current OFF block ends (or null if not OFF). */
export function minutesUntilOn(schedule: RegionSchedule, group: string, now: Date = new Date()): number | null {
  const g = schedule.groups.find((x) => x.group === group);
  if (!g) return null;
  const nowMin = localMinutesNow(now);
  const b = blockAt(g, nowMin);
  if (!b?.off) return null;
  const to = parseHHMM(b.to) ?? 1440;
  return Math.max(0, to - nowMin);
}
