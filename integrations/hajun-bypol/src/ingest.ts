/**
 * Daily ingest of Hajun/BYPOL sightings + analysis.
 *
 * Orchestrates: client.fetchAll() → per-report adapt (equipment-id + geocode +
 * contributor-trust blend) → dedupe → canonical AegisEventV1[]. Designed to run
 * once per day (these feeds are not high-frequency) under the client's crawler
 * discipline. Offline/demo-safe: with no secrets it runs entirely off the
 * fixture and never throws.
 *
 * Contributor attribution: a report MAY carry a pseudonym (never PII). When the
 * registry knows it, its trust score is folded into the sighting confidence —
 * but the pseudonym itself is NOT written into the public canonical event, only
 * used as a confidence input. Source protection by construction.
 */

import type { AegisEventV1 } from "@ua-map/event-schema";
import type { HajunRawReport, HajunSighting } from "./types";
import { HajunClient } from "./client";
import { adaptReport } from "./adapter";
import { ContributorRegistry } from "./contributors";
import type { Geocoder } from "./geocode";
import type { VisionClassifier } from "./equipment-id";

export interface IngestOptions {
  client?: HajunClient;
  geocoder?: Geocoder;
  vision?: VisionClassifier;
  /** Optional vetted-contributor registry for trust-weighted confidence. */
  contributors?: ContributorRegistry;
  /**
   * Optional map of rawReport.id → contributor pseudonym (attribution). Kept
   * OUTSIDE the report so pseudonyms never travel with public payloads.
   */
  attribution?: Record<string, string>;
  orgId?: string;
  isPublic?: boolean;
}

export interface IngestResult {
  sightings: HajunSighting[];
  events: AegisEventV1[];
  meta: {
    fetched: number;
    deduped: number;
    isDemo: boolean;
    generatedAt: string;
    byClass: Record<string, number>;
  };
}

/** Run one ingest cycle over all configured channels. */
export async function runDailyIngest(opts: IngestOptions = {}): Promise<IngestResult> {
  const client = opts.client ?? new HajunClient();
  const raw = await client.fetchAll();
  return ingestReports(raw, { ...opts, client });
}

/** Ingest an explicit batch of raw reports (testable, deterministic). */
export async function ingestReports(
  raw: HajunRawReport[],
  opts: IngestOptions = {},
): Promise<IngestResult> {
  const client = opts.client ?? new HajunClient();

  // Dedupe by stable report id.
  const seen = new Set<string>();
  const deduped = raw.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));

  const sightings: HajunSighting[] = [];
  const events: AegisEventV1[] = [];

  for (const report of deduped) {
    const pseudonym = opts.attribution?.[report.id];
    const contributorTrust =
      pseudonym && opts.contributors ? opts.contributors.trustOf(pseudonym) : undefined;

    const { sighting, canonical } = await adaptReport(report, {
      geocoder: opts.geocoder,
      vision: opts.vision,
      contributorTrust,
      orgId: opts.orgId,
      isPublic: opts.isPublic,
    });
    sightings.push(sighting);
    events.push(canonical);
  }

  const byClass: Record<string, number> = {};
  for (const s of sightings) {
    byClass[s.equipment.class] = (byClass[s.equipment.class] ?? 0) + 1;
  }

  return {
    sightings,
    events,
    meta: {
      fetched: raw.length,
      deduped: deduped.length,
      isDemo: client.isDemo,
      generatedAt: new Date().toISOString(),
      byClass,
    },
  };
}
