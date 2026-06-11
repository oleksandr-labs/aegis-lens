/**
 * Historical alert archive (task 8): every alert, every duration.
 *
 * Records each completed alert (start → clear) per location with its full
 * duration, and exposes a typed query/aggregation model. Unlike the
 * civilian-alerts archive (which wraps the UkraineAlarm history API), this
 * archive is host-stored: the feed-adapter appends transitions here so we retain
 * EVERY alert and its exact duration, independent of any upstream retention.
 */

import type { AlertRecord, OblastCode, AlertType } from "./types";
import { OBLASTS } from "./types";

export interface ArchivedAlert {
  oblastCode: OblastCode;
  type: AlertType;
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  /** Sources that observed this alert (for provenance). */
  sources: string[];
}

export interface ArchiveQuery {
  oblastCode?: OblastCode;
  type?: AlertType;
  since?: string;
  until?: string;
  minDurationSec?: number;
  /** Only alerts that have ended (closed) — excludes still-active. */
  closedOnly?: boolean;
  limit?: number;
}

export interface ArchiveStats {
  count: number;
  totalDurationSec: number;
  avgDurationSec: number;
  longest?: ArchivedAlert;
}

export class AlertArchive {
  private rows: ArchivedAlert[] = [];
  /** Open alerts keyed by oblast:type, awaiting their clear. */
  private open = new Map<string, ArchivedAlert>();

  private key(o: OblastCode, t: AlertType): string {
    return `${o}:${t}`;
  }

  /** Record an alert start (idempotent per oblast:type). */
  recordStart(record: AlertRecord): void {
    const k = this.key(record.location.oblastCode, record.type);
    if (this.open.has(k)) {
      const existing = this.open.get(k)!;
      if (!existing.sources.includes(record.source)) existing.sources.push(record.source);
      return;
    }
    this.open.set(k, {
      oblastCode: record.location.oblastCode,
      type: record.type,
      startedAt: record.startedAt,
      sources: [record.source],
    });
  }

  /** Record a clear; finalizes the open alert with its full duration. */
  recordClear(oblastCode: OblastCode, type: AlertType, endedAt = new Date().toISOString()): ArchivedAlert | null {
    const k = this.key(oblastCode, type);
    const open = this.open.get(k);
    if (!open) return null;
    const durationSec = Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(open.startedAt)) / 1000));
    const finalized: ArchivedAlert = { ...open, endedAt, durationSec };
    this.rows.push(finalized);
    this.open.delete(k);
    return finalized;
  }

  /** Ingest a feed change directly. */
  ingest(record: AlertRecord): void {
    if (record.status === "active") this.recordStart(record);
    else this.recordClear(record.location.oblastCode, record.type, record.endedAt);
  }

  /** Query closed + (optionally) open alerts. */
  query(q: ArchiveQuery = {}): ArchivedAlert[] {
    const sinceMs = q.since ? Date.parse(q.since) : undefined;
    const untilMs = q.until ? Date.parse(q.until) : undefined;
    const all = q.closedOnly ? this.rows : this.rows.concat(Array.from(this.open.values()));

    let out = all.filter((a) => {
      if (q.oblastCode && a.oblastCode !== q.oblastCode) return false;
      if (q.type && a.type !== q.type) return false;
      if (sinceMs !== undefined && Date.parse(a.startedAt) < sinceMs) return false;
      if (untilMs !== undefined) {
        const end = a.endedAt ? Date.parse(a.endedAt) : Date.parse(a.startedAt);
        if (end > untilMs) return false;
      }
      if (q.minDurationSec !== undefined && (a.durationSec ?? 0) < q.minDurationSec) return false;
      return true;
    });

    out.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
    if (q.limit !== undefined) out = out.slice(0, q.limit);
    return out;
  }

  /** Aggregate stats for a query window. */
  stats(q: ArchiveQuery = {}): ArchiveStats {
    const rows = this.query({ ...q, closedOnly: true });
    const totalDurationSec = rows.reduce((s, r) => s + (r.durationSec ?? 0), 0);
    const longest = rows.reduce<ArchivedAlert | undefined>(
      (m, r) => (!m || (r.durationSec ?? 0) > (m.durationSec ?? 0) ? r : m),
      undefined,
    );
    return {
      count: rows.length,
      totalDurationSec,
      avgDurationSec: rows.length ? Math.round(totalDurationSec / rows.length) : 0,
      longest,
    };
  }

  /** Friendly oblast name for display. */
  static oblastName(code: OblastCode, locale: "uk" | "en" = "uk"): string {
    const info = OBLASTS[code];
    return locale === "en" ? info?.nameEn ?? code : info?.nameUk ?? code;
  }
}
