/**
 * Per-region restoration ETAs.
 *
 * Three bases, in priority order:
 *   1. provider_declared  — operator states an explicit restoration time.
 *   2. schedule_inferred  — for scheduled rotations, the next ON-block boundary
 *                           for the consumer's group is the restoration time.
 *   3. historical_median  — fallback to a per-region median emergency-outage
 *                           duration (from stats / configurable).
 * Emergency outages with no provider ETA fall to historical_median with low
 * confidence; if no basis exists, estimatedAt is null.
 */

import type {
  RegionSchedule,
  RestorationEta,
  OutageKind,
  LocalizedText,
} from "./types";
import { parseHHMM, blockAt } from "./schedule-parser";

/** Local Kyiv offset hours (UTC+2 winter / +3 summer). Approximate as +3. */
const KYIV_OFFSET_HOURS = 3;

/** Default per-region historical median emergency-outage duration (hours). */
export const DEFAULT_EMERGENCY_MEDIAN_HOURS = 6;

function localMinutesNow(now: Date): number {
  const kyivMs = now.getTime() + KYIV_OFFSET_HOURS * 3600_000;
  const d = new Date(kyivMs);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Build a UTC ISO timestamp for a Kyiv-local HH:MM later today/tomorrow. */
function kyivLocalToUtcIso(now: Date, localMinutes: number, tomorrow = false): string {
  const base = new Date(now.getTime() + KYIV_OFFSET_HOURS * 3600_000);
  const day = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  if (tomorrow) day.setUTCDate(day.getUTCDate() + 1);
  const local = day.getTime() + localMinutes * 60_000;
  return new Date(local - KYIV_OFFSET_HOURS * 3600_000).toISOString();
}

function note(kind: OutageKind, basis: RestorationEta["basis"]): LocalizedText {
  if (basis === "provider_declared")
    return {
      uk: "Час відновлення оголошений оператором.",
      ru: "Время восстановления объявлено оператором.",
      en: "Restoration time declared by the operator.",
    };
  if (basis === "schedule_inferred")
    return {
      uk: "Розраховано за графіком черг (кінець поточного блоку відключення).",
      ru: "Рассчитано по графику очередей (конец текущего блока отключения).",
      en: "Inferred from the queue schedule (end of the current OFF block).",
    };
  if (basis === "historical_median")
    return {
      uk: "Орієнтовно за історичною медіаною тривалості аварійних відключень.",
      ru: "Ориентировочно по исторической медиане длительности аварийных отключений.",
      en: "Approximate, from the historical median emergency-outage duration.",
    };
  return {
    uk: "Час відновлення невизначений.",
    ru: "Время восстановления не определено.",
    en: "Restoration time is indeterminate.",
  };
}

export interface EtaOptions {
  /** Consumer's rotation group (e.g. "3.1") for schedule-inferred ETA. */
  group?: string;
  /** Provider-declared restoration time (ISO 8601), if any. */
  providerDeclaredAt?: string;
  /** Per-region median emergency duration override (hours). */
  emergencyMedianHours?: number;
  now?: Date;
}

/**
 * Compute a restoration ETA for a region/group given its current classified
 * outage kind and (optionally) its schedule.
 */
export function estimateRestoration(
  regionCode: string,
  kind: OutageKind,
  schedule: RegionSchedule | null,
  opts: EtaOptions = {},
): RestorationEta {
  const now = opts.now ?? new Date();

  if (kind === "restored") {
    return { regionCode, estimatedAt: now.toISOString(), confidence: 0.9, basis: "provider_declared", note: note("restored", "provider_declared") };
  }

  // 1. Provider-declared wins.
  if (opts.providerDeclaredAt) {
    return {
      regionCode,
      estimatedAt: opts.providerDeclaredAt,
      confidence: 0.85,
      basis: "provider_declared",
      note: note(kind, "provider_declared"),
    };
  }

  // 2. Schedule-inferred for predictable rotations.
  if ((kind === "scheduled" || kind === "stabilization") && schedule && opts.group) {
    const group = schedule.groups.find((g) => g.group === opts.group);
    if (group) {
      const nowMin = localMinutesNow(now);
      const current = blockAt(group, nowMin);
      if (current?.off) {
        const endMin = parseHHMM(current.to) ?? 1440;
        const tomorrow = endMin >= 1440;
        const estimatedAt = kyivLocalToUtcIso(now, endMin % 1440, tomorrow);
        return {
          regionCode,
          estimatedAt,
          confidence: 0.8,
          basis: "schedule_inferred",
          note: note(kind, "schedule_inferred"),
        };
      }
      // Not currently in an OFF block → power is on; no outage ETA needed.
      return { regionCode, estimatedAt: now.toISOString(), confidence: 0.6, basis: "schedule_inferred", note: note(kind, "schedule_inferred") };
    }
  }

  // 3. Historical-median fallback (mainly emergencies).
  if (kind === "emergency" || kind === "scheduled" || kind === "stabilization") {
    const hrs = opts.emergencyMedianHours ?? DEFAULT_EMERGENCY_MEDIAN_HOURS;
    return {
      regionCode,
      estimatedAt: new Date(now.getTime() + hrs * 3600_000).toISOString(),
      confidence: kind === "emergency" ? 0.35 : 0.45,
      basis: "historical_median",
      note: note(kind, "historical_median"),
    };
  }

  return { regionCode, estimatedAt: null, confidence: 0.2, basis: "none", note: note(kind, "none") };
}
