/**
 * Mediazona casualty-database client — Russian-side confirmed losses.
 *
 * Mediazona (with the BBC Russian Service) maintains a database of confirmed
 * Russian military deaths in the war. Where applicable, the platform may show
 * the RU-side aggregate alongside UA-side figures for context. Same invariant:
 * AGGREGATE counts only, attributed, no per-person re-publication
 * (`ethics-gate.ts`). Dignity applies to all the dead, regardless of side.
 */

import type { CasualtyAggregate, SourceAttribution } from "./types";
import { gateAggregate } from "./ethics-gate";
import type { ClientOptions } from "./ualosses-client";

const USER_AGENT = "AegisLens/1.0 (+https://aegis.example; respectful casualty aggregation; contact ops@aegis.example)";
const MIN_REQUEST_INTERVAL_MS = 1500;

export const MEDIAZONA_ATTRIBUTION: SourceAttribution = {
  source: "mediazona",
  publisher: { en: "Mediazona / BBC Russian Service", uk: "Mediazona / Російська служба BBC" },
  url: "https://en.zona.media/article/2022/05/11/casualties_eng",
  license: "Editorial database — aggregate confirmed-death figures cited with attribution; no per-person re-publication.",
  credit: {
    en: "Source: Mediazona & BBC Russian Service confirmed-casualties database — aggregate figures, attributed.",
    uk: "Джерело: база підтверджених втрат Mediazona та Російської служби BBC — зведені дані з посиланням.",
  },
  community: false,
};

/** Aggregate-only demo fixture (confirmed RU deaths by period; NO individuals). */
const DEMO_AGGREGATES: CasualtyAggregate[] = [
  { id: "mediazona:ru_military:all:2026-Q1", source: "mediazona", side: "ru_military", regionCode: undefined, regionName: { en: "All theatres (confirmed)", uk: "Усі напрямки (підтверджено)" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-03" },
  { id: "mediazona:ru_military:all:cumulative", source: "mediazona", side: "ru_military", regionCode: undefined, regionName: { en: "Cumulative (confirmed)", uk: "Сукупно (підтверджено)" }, period: "2022-02..2026-03", count: 0, verification: "source_verified", asOf: "2026-04-03" },
];

let lastRequestAt = 0;
async function politeDelay(): Promise<void> {
  const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function fetchMediazonaAggregates(opts: ClientOptions = {}): Promise<{
  aggregates: CasualtyAggregate[];
  attribution: SourceAttribution;
  isDemo: boolean;
  droppedCount: number;
}> {
  const useDemo = opts.demo || (!opts.baseUrl && !process.env.MEDIAZONA_BASE_URL);
  let raw: CasualtyAggregate[];
  let isDemo = useDemo;

  if (useDemo) {
    raw = DEMO_AGGREGATES;
  } else {
    const base = opts.baseUrl ?? process.env.MEDIAZONA_BASE_URL!;
    const doFetch = opts.fetchImpl ?? fetch;
    try {
      await politeDelay();
      const res = await doFetch(`${base.replace(/\/$/, "")}/api/casualties/aggregate`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Mediazona HTTP ${res.status}`);
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

  return { aggregates, attribution: MEDIAZONA_ATTRIBUTION, isDemo, droppedCount };
}
