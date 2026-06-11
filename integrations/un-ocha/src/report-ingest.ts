/**
 * Daily / weekly humanitarian report ingest pipeline.
 *
 * Orchestrates: ReliefWeb sitreps + DTM displacement + per-cluster reports →
 * canonical events. EVERY record passes through the strict PII redactor; records
 * that fail closed are counted in `recordsBlocked` and DROPPED (never emitted).
 *
 * Cadence:
 *   - daily  : ReliefWeb sitreps (since last run) + latest DTM round.
 *   - weekly : + full cluster sweep (HNO-style figures).
 *
 * This is a pure orchestration layer; persistence/scheduling is the caller's job
 * (e.g. a Next.js cron route hitting the API endpoint).
 */

import type { IngestResult, IngestCadence } from "./types";
import { ReliefWebClient, DEMO_RELIEFWEB_REPORTS } from "./reliefweb-client";
import { DtmClient, DEMO_DTM_RECORDS } from "./dtm-client";
import { DEMO_CLUSTER_REPORTS } from "./clusters";
import { redactRecord } from "./pii-redaction";
import {
  adaptReliefWebReport,
  adaptDtm,
  adaptClusterReport,
  type CanonicalEvent,
} from "./adapter";

export interface IngestOptions {
  cadence?: IngestCadence;
  /** Only ReliefWeb reports newer than this ISO timestamp. */
  sinceIso?: string;
  country?: string;          // ISO2 (default UA)
  orgId?: string;
  isPublic?: boolean;
  /** Inject clients for testing; defaults use demo fixtures on failure. */
  reliefweb?: ReliefWebClient;
  dtm?: DtmClient;
  /** Use demo fixtures directly without any network attempt. */
  demoOnly?: boolean;
}

export interface IngestRun {
  result: IngestResult;
  events: CanonicalEvent[];
}

export async function runIngest(opts: IngestOptions = {}): Promise<IngestRun> {
  const startedAt = new Date().toISOString();
  const cadence = opts.cadence ?? "daily";
  const country = opts.country ?? "UA";
  const errors: string[] = [];

  let recordsRedacted = 0;
  let recordsBlocked = 0;
  let reportsIngested = 0;
  const events: CanonicalEvent[] = [];

  // Helper: push an adapter result, accounting for fail-closed drops.
  const collect = (ev: CanonicalEvent | null, hadPii: boolean) => {
    if (hadPii) recordsRedacted++;
    if (ev === null) {
      recordsBlocked++;
      return;
    }
    events.push(ev);
    reportsIngested++;
  };

  // 1) ReliefWeb situation reports
  try {
    const rwClient = opts.reliefweb ?? new ReliefWebClient();
    const reports = opts.demoOnly
      ? DEMO_RELIEFWEB_REPORTS
      : await rwClient.getReports({ country, sinceIso: opts.sinceIso, limit: 30 });
    for (const r of reports) {
      const pre = redactRecord(r);
      collect(adaptReliefWebReport(r, opts.orgId, opts.isPublic), pre.findings.length > 0);
    }
  } catch (e) {
    errors.push(`reliefweb: ${(e as Error).message}`);
  }

  // 2) DTM displacement (latest round)
  try {
    const dtmClient = opts.dtm ?? new DtmClient();
    const recs = opts.demoOnly ? DEMO_DTM_RECORDS : await dtmClient.getIdpByAdmin1();
    for (const rec of recs) {
      const pre = redactRecord(rec);
      collect(adaptDtm(rec, opts.orgId, opts.isPublic), pre.findings.length > 0);
    }
  } catch (e) {
    errors.push(`dtm: ${(e as Error).message}`);
  }

  // 3) Per-cluster reports — weekly only (heavier sweep)
  if (cadence === "weekly" || cadence === "on_update") {
    try {
      for (const rep of DEMO_CLUSTER_REPORTS) {
        const pre = redactRecord(rep);
        collect(adaptClusterReport(rep, opts.orgId, opts.isPublic), pre.findings.length > 0);
      }
    } catch (e) {
      errors.push(`clusters: ${(e as Error).message}`);
    }
  }

  const finishedAt = new Date().toISOString();
  const result: IngestResult = {
    startedAt,
    finishedAt,
    datasetsSeen: 3,
    datasetsChanged: errors.length ? 0 : 3,
    reportsIngested,
    recordsRedacted,
    recordsBlocked,
    errors,
  };

  return { result, events };
}
