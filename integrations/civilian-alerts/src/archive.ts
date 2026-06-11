/**
 * Historical alert archive — query model per oblast.
 *
 * Task: "Historical alert archive per region" (TODO_civilian_alerts.md).
 *
 * Wraps UkraineAlarmClient.getAlertHistory with a typed query/result model and
 * in-memory filtering (by type, time window, min duration). The underlying API
 * only exposes 1/3/7/30-day windows, so this module also exposes a paging-by-
 * day helper for longer spans the host may have persisted itself.
 */

import type { AlertType, CivilianAlert, OblastCode } from "./types";
import { OBLASTS } from "./types";
import { UkraineAlarmClient } from "./client";

/** Supported native lookback windows from the Ukraine Alarm API. */
export type ArchivePeriodDays = 1 | 3 | 7 | 30;

export interface ArchiveQuery {
  oblastCode: OblastCode;
  /** Native API window. Default 7. */
  periodDays?: ArchivePeriodDays;
  /** Restrict to specific alert types (empty/undefined = all). */
  types?: AlertType[];
  /** Only alerts that started at/after this ISO time. */
  since?: string;
  /** Only alerts that ended at/before this ISO time. */
  until?: string;
  /** Drop alerts shorter than this many seconds (noise filter). */
  minDurationSec?: number;
  /** Cap on returned rows (most recent first). */
  limit?: number;
}

export interface ArchiveResult {
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  periodDays: ArchivePeriodDays;
  fetchedAt: string;
  total: number;
  alerts: CivilianAlert[];
}

/** Map an OblastCode back to the Ukraine Alarm numeric region id. */
const OBLAST_TO_REGION: Partial<Record<OblastCode, string>> = {
  "UA-63": "3",
  "UA-14": "4",
  "UA-09": "5",
  "UA-23": "6",
  "UA-65": "7",
  "UA-51": "8",
  "UA-48": "9",
  "UA-71": "10",
  "UA-12": "11",
  "UA-35": "12",
  "UA-05": "13",
  "UA-68": "14",
  "UA-61": "15",
  "UA-46": "16",
  "UA-21": "17",
  "UA-26": "18",
  "UA-77": "19",
  "UA-56": "20",
  "UA-07": "21",
  "UA-59": "22",
  "UA-74": "23",
  "UA-32": "24",
  "UA-30": "25",
  "UA-53": "26",
  "UA-18": "27",
};

/** Apply in-memory filters that the API window cannot express. */
export function filterArchive(
  alerts: CivilianAlert[],
  query: ArchiveQuery,
): CivilianAlert[] {
  const typeSet = query.types && query.types.length ? new Set(query.types) : null;
  const sinceMs = query.since ? Date.parse(query.since) : undefined;
  const untilMs = query.until ? Date.parse(query.until) : undefined;

  let out = alerts.filter((a) => {
    if (typeSet && !typeSet.has(a.type)) return false;
    if (sinceMs !== undefined && Date.parse(a.startedAt) < sinceMs) return false;
    if (untilMs !== undefined) {
      const endMs = a.endedAt ? Date.parse(a.endedAt) : Date.parse(a.startedAt);
      if (endMs > untilMs) return false;
    }
    if (query.minDurationSec !== undefined && (a.durationSec ?? 0) < query.minDurationSec) {
      return false;
    }
    return true;
  });

  // Most recent first.
  out.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  if (query.limit !== undefined) out = out.slice(0, query.limit);
  return out;
}

/**
 * Fetch + filter the archive for one oblast using a live client.
 * Throws if the oblast has no known Ukraine Alarm region mapping.
 */
export async function queryArchive(
  client: UkraineAlarmClient,
  query: ArchiveQuery,
): Promise<ArchiveResult> {
  const regionId = OBLAST_TO_REGION[query.oblastCode];
  if (!regionId) {
    throw new Error(`No Ukraine Alarm region id for oblast ${query.oblastCode}`);
  }
  const periodDays = query.periodDays ?? 7;
  const raw = await client.getAlertHistory(regionId, periodDays);
  const alerts = filterArchive(raw, query);
  const info = OBLASTS[query.oblastCode];

  return {
    oblastCode: query.oblastCode,
    oblastNameUk: info?.nameUk ?? query.oblastCode,
    oblastNameEn: info?.nameEn ?? query.oblastCode,
    periodDays,
    fetchedAt: new Date().toISOString(),
    total: alerts.length,
    alerts,
  };
}

/** Filter an already-persisted archive (offline / host-stored history). */
export function queryArchiveFromStore(
  oblastCode: OblastCode,
  stored: CivilianAlert[],
  query: Omit<ArchiveQuery, "oblastCode">,
): ArchiveResult {
  const scoped = stored.filter((a) => a.oblastCode === oblastCode);
  const alerts = filterArchive(scoped, { ...query, oblastCode });
  const info = OBLASTS[oblastCode];
  return {
    oblastCode,
    oblastNameUk: info?.nameUk ?? oblastCode,
    oblastNameEn: info?.nameEn ?? oblastCode,
    periodDays: query.periodDays ?? 7,
    fetchedAt: new Date().toISOString(),
    total: alerts.length,
    alerts,
  };
}
