/**
 * Report versioning + diff.
 *
 * Stores a history of draft→approved→published states.
 * Never deletes; retractions are additions of a "retracted" state.
 */

import type { Report, ReportStatus } from "./types";

export interface ReportVersion {
  version: number;
  status: ReportStatus;
  snapshot: Report;
  changedBy: string;
  changedAt: string;
  changeNote?: string;
}

export interface ReportDiff {
  field: string;
  before: string;
  after: string;
}

/** Flat-diff two report snapshots for human-readable change summary */
export function diffReports(before: Report, after: Report): ReportDiff[] {
  const diffs: ReportDiff[] = [];

  if (before.status !== after.status) {
    diffs.push({ field: "status", before: before.status, after: after.status });
  }
  if (JSON.stringify(before.title) !== JSON.stringify(after.title)) {
    diffs.push({
      field: "title",
      before: before.title.en ?? "",
      after: after.title.en ?? "",
    });
  }
  if (before.sections.length !== after.sections.length) {
    diffs.push({
      field: "sections.count",
      before: String(before.sections.length),
      after: String(after.sections.length),
    });
  }

  for (let i = 0; i < Math.min(before.sections.length, after.sections.length); i++) {
    const bSec = before.sections[i];
    const aSec = after.sections[i];
    if (bSec && aSec && JSON.stringify(bSec.body) !== JSON.stringify(aSec.body)) {
      diffs.push({
        field: `section[${i}].body`,
        before: bSec.body.en?.slice(0, 80) ?? "",
        after: aSec.body.en?.slice(0, 80) ?? "",
      });
    }
  }

  return diffs;
}

// ── In-memory version store ───────────────────────────────────────────────────

export class InMemoryReportVersionStore {
  private readonly history = new Map<string, ReportVersion[]>();

  save(report: Report, changedBy: string, changeNote?: string): ReportVersion {
    const existing = this.history.get(report.report_id) ?? [];
    const version: ReportVersion = {
      version: existing.length + 1,
      status: report.status,
      snapshot: JSON.parse(JSON.stringify(report)) as Report,
      changedBy,
      changedAt: new Date().toISOString(),
      changeNote,
    };
    this.history.set(report.report_id, [...existing, version]);
    return version;
  }

  getHistory(report_id: string): ReportVersion[] {
    return this.history.get(report_id) ?? [];
  }

  getVersion(report_id: string, version: number): ReportVersion | null {
    return this.history.get(report_id)?.find((v) => v.version === version) ?? null;
  }

  latestVersion(report_id: string): ReportVersion | null {
    const hist = this.history.get(report_id);
    return hist?.[hist.length - 1] ?? null;
  }
}
