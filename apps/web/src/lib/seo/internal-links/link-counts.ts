/**
 * Monitoring: per-page incoming + outgoing internal-link counts.
 *
 * Data model + compute fn + thresholds — the codeable contract, not a UI.
 * A real metrics source (rendered-HTML crawl, or a DB link table) plugs in by
 * constructing the `LinkGraph`; this module just tallies it.
 */

import { type LinkGraph, incoming, outgoing } from "./link-graph";

export interface PageLinkCounts {
  url: string;
  inCount: number;
  outCount: number;
}

/** Thresholds that flag suspicious pages. */
export const LINK_COUNT_THRESHOLDS = {
  /** Below this many incoming links → weak (near-orphan) page. */
  minIncoming: 1,
  /** Above this many outgoing contextual links → possible link spam. */
  maxOutgoing: 100,
} as const;

export function pageLinkCounts(graph: LinkGraph): PageLinkCounts[] {
  const rows: PageLinkCounts[] = [];
  for (const url of graph.nodes.keys()) {
    rows.push({
      url,
      inCount: incoming(graph, url).length,
      outCount: outgoing(graph, url).length,
    });
  }
  rows.sort((a, b) => a.inCount - b.inCount || a.url.localeCompare(b.url));
  return rows;
}

export interface LinkCountSummary {
  pages: number;
  totalEdges: number;
  avgIncoming: number;
  avgOutgoing: number;
  /** Pages below minIncoming (near-orphans). */
  weakPages: string[];
  /** Pages above maxOutgoing (spam smell). */
  overlinkedPages: string[];
}

export function summarizeLinkCounts(graph: LinkGraph): LinkCountSummary {
  const rows = pageLinkCounts(graph);
  let edges = 0;
  for (const r of rows) edges += r.outCount;
  const n = rows.length || 1;
  const totalIn = rows.reduce((s, r) => s + r.inCount, 0);
  return {
    pages: rows.length,
    totalEdges: edges,
    avgIncoming: totalIn / n,
    avgOutgoing: edges / n,
    weakPages: rows
      .filter((r) => r.inCount < LINK_COUNT_THRESHOLDS.minIncoming)
      .map((r) => r.url),
    overlinkedPages: rows
      .filter((r) => r.outCount > LINK_COUNT_THRESHOLDS.maxOutgoing)
      .map((r) => r.url),
  };
}
