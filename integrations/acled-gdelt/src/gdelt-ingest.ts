/**
 * GDELT daily incremental ingest. (TODO task 6)
 *
 * GDELT 2.0 appends new events every 15 minutes; for trend/datasets purposes we
 * pull one calendar day at a time and track a high-water mark (last SQLDATE
 * ingested) so re-runs are idempotent and cheap (BigQuery is billed per byte
 * scanned, so we always bound by SQLDATE).
 *
 * The ingest is pure/stateless given a cursor: the host persists `IngestCursor`
 * (e.g. in KV/DB) between runs. No secrets here — the GdeltClient owns auth.
 */

import { GdeltClient } from "./gdelt-client";
import { normaliseGdeltEvent } from "./gdelt-extract";
import { toCanonicalEvents, type CanonicalEventV1 } from "./adapter";
import type { GdeltRawEvent, NormalisedDatasetEvent } from "./types";

export interface IngestCursor {
  /** Last fully-ingested day as YYYYMMDD int (exclusive lower bound next run). */
  lastSqlDate: number;
}

export interface DailyIngestOptions {
  client: GdeltClient;
  /** ISO2 country to ingest (mapped to FIPS internally by the caller's spec). */
  actionGeoCountry: string;
  /** Day to ingest as YYYYMMDD int. */
  day: number;
  orgId: string;
  /** Only conflict-class events (QuadClass 3 & 4) by default. */
  conflictOnly?: boolean;
}

export interface DailyIngestResult {
  day: number;
  rawCount: number;
  normalised: NormalisedDatasetEvent[];
  /** Canonical events (isPublic — GDELT is openly licensed, attribution kept). */
  canonical: CanonicalEventV1[];
  cursor: IngestCursor;
  isDemo: boolean;
}

/** Ingest a single day of GDELT events for one country. */
export async function ingestDay(opts: DailyIngestOptions): Promise<DailyIngestResult> {
  const rows: GdeltRawEvent[] = await opts.client.query({
    actionGeoCountry: opts.actionGeoCountry,
    sqlDateFrom: opts.day,
    sqlDateTo: opts.day,
    quadClasses: opts.conflictOnly === false ? undefined : [3, 4],
    limit: 100_000,
  });

  const normalised = rows.map(normaliseGdeltEvent);
  // GDELT is openly licensed → safe to expose publicly with attribution.
  const canonical = toCanonicalEvents(normalised, {
    orgId: opts.orgId,
    isPublic: true,
    keepRawPayload: false,
  });

  return {
    day: opts.day,
    rawCount: rows.length,
    normalised,
    canonical,
    cursor: { lastSqlDate: opts.day },
    isDemo: opts.client.isDemo,
  };
}

/** Next day to ingest given a cursor (UTC). Returns YYYYMMDD int. */
export function nextDay(cursor: IngestCursor | undefined): number {
  if (!cursor) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return ymd(d);
  }
  const s = String(cursor.lastSqlDate);
  const d = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
  d.setUTCDate(d.getUTCDate() + 1);
  return ymd(d);
}

/** Catch-up: list of YYYYMMDD ints from `cursor`+1 up to (and incl.) `untilDay`. */
export function pendingDays(cursor: IngestCursor | undefined, untilDay: number): number[] {
  const days: number[] = [];
  let cur = nextDay(cursor);
  let guard = 0;
  while (cur <= untilDay && guard < 400) {
    days.push(cur);
    cur = nextDay({ lastSqlDate: cur });
    guard += 1;
  }
  return days;
}

function ymd(d: Date): number {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
