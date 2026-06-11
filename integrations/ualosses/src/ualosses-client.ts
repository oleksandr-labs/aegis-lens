/**
 * UALosses client — verified fallen Ukrainian soldiers (public memorial).
 *
 * UALosses (ualosses.org) is a public memorial that documents verified fallen
 * Ukrainian service members. This client intentionally consumes ONLY the
 * aggregate dimension (counts by region / period). It does NOT fetch, store, or
 * expose individual memorial records — per the aggregate-only invariant
 * (`ethics-gate.ts`). The public memorial remains the canonical place to honor
 * individuals by name; we link to it (see `memorial-link.ts`), we do not scrape
 * it.
 *
 * Network is optional: with no connectivity the client returns a small DEMO
 * fixture so the package is usable without secrets. ToS-respecting behavior:
 * descriptive User-Agent, polite delay, aggregate endpoint only.
 */

import type { CasualtyAggregate, SourceAttribution } from "./types";
import { gateAggregate } from "./ethics-gate";

const USER_AGENT = "AegisLens/1.0 (+https://aegis.example; respectful memorial aggregation; contact ops@aegis.example)";
const MIN_REQUEST_INTERVAL_MS = 1500;

export const UALOSSES_ATTRIBUTION: SourceAttribution = {
  source: "ualosses",
  publisher: { en: "UALosses memorial", uk: "Меморіал UALosses" },
  url: "https://ualosses.org/",
  license: "Public memorial — aggregate figures cited with attribution; no per-person re-publication.",
  credit: {
    en: "Source: UALosses public memorial (ualosses.org) — aggregate figures, attributed.",
    uk: "Джерело: публічний меморіал UALosses (ualosses.org) — знеособлені зведені дані з посиланням.",
  },
  community: true,
};

/** Aggregate-only demo fixture (counts by oblast/period; NO individuals). */
const DEMO_AGGREGATES: CasualtyAggregate[] = [
  { id: "ualosses:ua_military:UA-14:2026-Q1", source: "ualosses", side: "ua_military", regionCode: "UA-14", regionName: { en: "Donetsk oblast", uk: "Донецька область" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-01" },
  { id: "ualosses:ua_military:UA-63:2026-Q1", source: "ualosses", side: "ua_military", regionCode: "UA-63", regionName: { en: "Kharkiv oblast", uk: "Харківська область" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-01" },
  { id: "ualosses:ua_military:UA-23:2026-Q1", source: "ualosses", side: "ua_military", regionCode: "UA-23", regionName: { en: "Zaporizhzhia oblast", uk: "Запорізька область" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-01" },
];

export interface ClientOptions {
  /** Override base URL (else env UALOSSES_BASE_URL, else public). */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** Force the demo fixture (no network). */
  demo?: boolean;
}

let lastRequestAt = 0;
async function politeDelay(): Promise<void> {
  const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

/**
 * Fetch aggregate fallen-soldier counts by region/period.
 *
 * Every returned row is re-checked through `gateAggregate` — defence in depth.
 * Any row that (somehow) carries per-person data is dropped fail-closed.
 */
export async function fetchUalossesAggregates(opts: ClientOptions = {}): Promise<{
  aggregates: CasualtyAggregate[];
  attribution: SourceAttribution;
  isDemo: boolean;
  droppedCount: number;
}> {
  const useDemo = opts.demo || (!opts.baseUrl && !process.env.UALOSSES_BASE_URL);
  let raw: CasualtyAggregate[];
  let isDemo = useDemo;

  if (useDemo) {
    raw = DEMO_AGGREGATES;
  } else {
    const base = opts.baseUrl ?? process.env.UALOSSES_BASE_URL!;
    const doFetch = opts.fetchImpl ?? fetch;
    try {
      await politeDelay();
      // Aggregate endpoint ONLY — never a per-person listing.
      const res = await doFetch(`${base.replace(/\/$/, "")}/api/aggregate/by-region`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`UALosses HTTP ${res.status}`);
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

  return { aggregates, attribution: UALOSSES_ATTRIBUTION, isDemo, droppedCount };
}
