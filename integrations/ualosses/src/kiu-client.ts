/**
 * Killed in Ukraine client — community-verified casualty figures.
 *
 * "Killed in Ukraine" is a community-verification effort. Because it is
 * community-maintained, figures are framed with an explicit caveat (verification
 * is "community_verified", not authoritative). As with every source in this
 * package, only AGGREGATE counts (by region/period) are consumed; no per-person
 * record is fetched or emitted (`ethics-gate.ts`).
 */

import type { CasualtyAggregate, SourceAttribution } from "./types";
import { gateAggregate } from "./ethics-gate";
import type { ClientOptions } from "./ualosses-client";

const USER_AGENT = "AegisLens/1.0 (+https://aegis.example; respectful memorial aggregation; contact ops@aegis.example)";
const MIN_REQUEST_INTERVAL_MS = 1500;

export const KIU_ATTRIBUTION: SourceAttribution = {
  source: "killed_in_ukraine",
  publisher: { en: "Killed in Ukraine (community)", uk: "Killed in Ukraine (спільнота)" },
  url: "https://killedinukraine.com/",
  license: "Community-verified dataset — aggregate figures cited with attribution and community caveat.",
  credit: {
    en: "Source: Killed in Ukraine community verification — aggregate figures (community-verified; may be incomplete).",
    uk: "Джерело: спільнотна верифікація Killed in Ukraine — зведені дані (верифіковано спільнотою; можуть бути неповними).",
  },
  community: true,
};

/** Aggregate-only demo fixture (community-verified counts; NO individuals). */
const DEMO_AGGREGATES: CasualtyAggregate[] = [
  { id: "kiu:ua_civilian:UA-65:2026-Q1", source: "killed_in_ukraine", side: "ua_civilian", regionCode: "UA-65", regionName: { en: "Kherson oblast", uk: "Херсонська область" }, period: "2026-Q1", count: 0, verification: "community_verified", asOf: "2026-04-05" },
  { id: "kiu:ua_civilian:UA-63:2026-Q1", source: "killed_in_ukraine", side: "ua_civilian", regionCode: "UA-63", regionName: { en: "Kharkiv oblast", uk: "Харківська область" }, period: "2026-Q1", count: 0, verification: "community_verified", asOf: "2026-04-05" },
];

let lastRequestAt = 0;
async function politeDelay(): Promise<void> {
  const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function fetchKiuAggregates(opts: ClientOptions = {}): Promise<{
  aggregates: CasualtyAggregate[];
  attribution: SourceAttribution;
  isDemo: boolean;
  droppedCount: number;
}> {
  const useDemo = opts.demo || (!opts.baseUrl && !process.env.KIU_BASE_URL);
  let raw: CasualtyAggregate[];
  let isDemo = useDemo;

  if (useDemo) {
    raw = DEMO_AGGREGATES;
  } else {
    const base = opts.baseUrl ?? process.env.KIU_BASE_URL!;
    const doFetch = opts.fetchImpl ?? fetch;
    try {
      await politeDelay();
      const res = await doFetch(`${base.replace(/\/$/, "")}/api/aggregate/by-region`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`KIU HTTP ${res.status}`);
      raw = (await res.json()) as CasualtyAggregate[];
    } catch {
      raw = DEMO_AGGREGATES;
      isDemo = true;
    }
  }

  const aggregates: CasualtyAggregate[] = [];
  let droppedCount = 0;
  for (const row of raw) {
    const g = gateAggregate(row);
    if (g.ok && g.value) aggregates.push(g.value);
    else droppedCount++;
  }

  return { aggregates, attribution: KIU_ATTRIBUTION, isDemo, droppedCount };
}
