/**
 * HDX dataset subscription manager.
 *
 * A subscription is a standing query over HDX (dataset slugs, tags, org, country
 * + cadence). On each poll we resolve matching datasets, compare each dataset's
 * `lastModified` against the per-subscription cursor, and emit only datasets that
 * changed since we last ingested them. The orchestrator (report-ingest) then
 * pulls the changed resources.
 *
 * Republication gating: we DO NOT advance the cursor / mark a dataset ingestible
 * if its license is non-redistributable — we surface it as `gated` so the caller
 * can show "available on HDX" without re-hosting.
 */

import type { HdxDataset, HdxSubscription } from "./types";
import { HdxClient, isRedistributable } from "./hdx-client";

export interface SubscriptionPollResult {
  subscriptionId: string;
  polledAt: string;
  /** Datasets that changed since the cursor AND are redistributable. */
  changed: HdxDataset[];
  /** Datasets that changed but are license-gated (link only, do not re-host). */
  gated: HdxDataset[];
  /** Updated cursor to persist for the next run. */
  nextCursor: Record<string, string>;
  total: number;
}

/** A convenient default subscription for the Ukraine humanitarian operation. */
export const UKRAINE_DEFAULT_SUBSCRIPTION: HdxSubscription = {
  id: "ua-humanitarian-core",
  tags: ["displacement", "humanitarian needs", "humanitarian access"],
  countries: ["UA"],
  cadence: "daily",
  formats: ["CSV", "XLSX", "GEOJSON", "JSON"],
  cursor: {},
  enabled: true,
};

export class HdxSubscriptionManager {
  constructor(private readonly client: HdxClient = new HdxClient()) {}

  /** Resolve datasets matching a subscription (union of slug + tag + org queries). */
  async resolve(sub: HdxSubscription): Promise<HdxDataset[]> {
    const seen = new Map<string, HdxDataset>();

    const add = (ds: HdxDataset[]) => {
      for (const d of ds) {
        if (sub.countries?.length && !d.countries.some((c) => sub.countries!.includes(c))) continue;
        seen.set(d.name, d);
      }
    };

    if (sub.datasetNames?.length) {
      for (const slug of sub.datasetNames) {
        const d = await this.client.getDataset(slug);
        if (d) add([d]);
      }
    }
    if (sub.tags?.length) {
      add(await this.client.searchDatasets({ tags: sub.tags, country: sub.countries?.[0], rows: 50 }));
    }
    if (sub.organization) {
      add(await this.client.searchDatasets({ organization: sub.organization, country: sub.countries?.[0], rows: 50 }));
    }
    if (!sub.datasetNames?.length && !sub.tags?.length && !sub.organization) {
      add(await this.client.searchDatasets({ country: sub.countries?.[0], rows: 50 }));
    }

    return [...seen.values()];
  }

  /** Poll once: return changed (redistributable) + gated datasets and a new cursor. */
  async poll(sub: HdxSubscription): Promise<SubscriptionPollResult> {
    const datasets = await this.resolve(sub);
    const cursor = { ...(sub.cursor ?? {}) };
    const nextCursor = { ...cursor };
    const changed: HdxDataset[] = [];
    const gated: HdxDataset[] = [];

    for (const d of datasets) {
      const stamp = d.lastModified ?? "";
      const prev = cursor[d.name];
      const isNew = !prev || (stamp && stamp > prev);
      if (!isNew) continue;

      // Filter resources by requested formats (metadata only — no download here).
      const wantFormats = sub.formats?.map((f) => f.toUpperCase());
      const hasWanted = !wantFormats?.length || d.resources.some((r) => wantFormats.includes(r.format));
      if (!hasWanted) continue;

      if (isRedistributable(d.license)) {
        changed.push(d);
        nextCursor[d.name] = stamp || new Date().toISOString();
      } else {
        gated.push(d);
        // Do NOT advance cursor for gated datasets we cannot re-host; we still
        // record we've seen them so we don't re-surface every poll.
        nextCursor[d.name] = stamp || new Date().toISOString();
      }
    }

    return {
      subscriptionId: sub.id,
      polledAt: new Date().toISOString(),
      changed,
      gated,
      nextCursor,
      total: datasets.length,
    };
  }
}
