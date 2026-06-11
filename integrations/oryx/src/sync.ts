/**
 * Daily Oryx sync.
 *
 * Oryx updates roughly daily and is volunteer-run, so we sync at most once per
 * 24h. This module computes a diff between the previous snapshot and the
 * freshly-fetched one (new / resurfaced / unchanged entries) so downstream
 * consumers (KG upserts, event emission) only process deltas.
 */

import type { OryxEntry, OryxSnapshot } from "./types";
import { OryxClient, type OryxClientConfig } from "./client";

export interface OryxSyncDiff {
  syncedAt: string;
  /** Entries present now but not in the previous snapshot. */
  added: OryxEntry[];
  /** Entries whose status changed (e.g. damaged → destroyed). */
  statusChanged: Array<{ entryId: string; from: string; to: string; entry: OryxEntry }>;
  /** Entries unchanged since last sync. */
  unchanged: number;
  /** Total entries in the new snapshot. */
  total: number;
  isDemo: boolean;
}

/** Compute the delta between two Oryx snapshots. */
export function diffSnapshots(prev: OryxSnapshot | undefined, next: OryxSnapshot): OryxSyncDiff {
  const prevById = new Map<string, OryxEntry>((prev?.entries ?? []).map((e) => [e.entryId, e]));
  const added: OryxEntry[] = [];
  const statusChanged: OryxSyncDiff["statusChanged"] = [];
  let unchanged = 0;

  for (const entry of next.entries) {
    const before = prevById.get(entry.entryId);
    if (!before) {
      added.push(entry);
    } else if (before.status !== entry.status) {
      statusChanged.push({ entryId: entry.entryId, from: before.status, to: entry.status, entry });
    } else {
      unchanged++;
    }
  }

  return {
    syncedAt: new Date().toISOString(),
    added,
    statusChanged,
    unchanged,
    total: next.entries.length,
    isDemo: next.isDemo,
  };
}

/**
 * Run a single daily sync cycle. Stateless: callers pass the previously-stored
 * snapshot and persist the returned `snapshot` for the next run.
 */
export async function runDailySync(
  prevSnapshot: OryxSnapshot | undefined,
  config: OryxClientConfig = {},
): Promise<{ snapshot: OryxSnapshot; diff: OryxSyncDiff }> {
  const client = new OryxClient(config);
  const snapshot = await client.getSnapshot();
  const diff = diffSnapshots(prevSnapshot, snapshot);
  return { snapshot, diff };
}

/** Cron cadence label (en/uk) for display in admin/ops surfaces. */
export const ORYX_SYNC_CADENCE = {
  cron: "0 6 * * *", // 06:00 UTC daily
  label: { en: "Daily (06:00 UTC)", uk: "Щоденно (06:00 UTC)" },
};
