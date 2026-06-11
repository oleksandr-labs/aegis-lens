/**
 * Orphan-page detection — every page must be reachable in ≤ 3 clicks from `/`.
 *
 * Runs a per-locale BFS from each locale's home page over outgoing edges and
 * reports: pages with NO incoming links (true orphans), and pages reachable
 * only at depth > maxClicks (too-deep). Locale-preserving: each locale's home
 * is the root for that locale's nodes; edges already never cross locales.
 */

import {
  type LinkGraph,
  type PageNode,
  incoming,
  outgoing,
  nodesForLocale,
} from "./link-graph";
import type { Locale } from "@aegis/i18n-config";

export interface OrphanReport {
  locale: Locale;
  /** Home url used as the BFS root (or null if none found). */
  root: string | null;
  /** url -> click depth from home (Infinity = unreachable). */
  depth: Map<string, number>;
  /** Pages with zero incoming internal links. */
  noIncoming: string[];
  /** Pages reachable but deeper than maxClicks. */
  tooDeep: string[];
  /** Pages not reachable from home at all. */
  unreachable: string[];
  /** True when every node is reachable within maxClicks. */
  healthy: boolean;
}

/** Heuristic: a node is "home" if it's the home template or url is the locale root. */
function findRoot(nodes: PageNode[], locale: Locale): PageNode | null {
  const byTemplate = nodes.find((n) => n.template === "home");
  if (byTemplate) return byTemplate;
  const rootUrl = locale === "en" ? "/" : `/${locale}`;
  return nodes.find((n) => n.url === rootUrl) ?? null;
}

export function detectOrphans(
  graph: LinkGraph,
  locale: Locale,
  opts: { maxClicks?: number } = {},
): OrphanReport {
  const { maxClicks = 3 } = opts;
  const nodes = nodesForLocale(graph, locale);
  const root = findRoot(nodes, locale);

  const depth = new Map<string, number>();
  for (const n of nodes) depth.set(n.url, Infinity);

  if (root) {
    depth.set(root.url, 0);
    let frontier = [root.url];
    while (frontier.length) {
      const next: string[] = [];
      for (const url of frontier) {
        const d = depth.get(url)!;
        for (const e of outgoing(graph, url)) {
          if ((depth.get(e.to) ?? Infinity) > d + 1) {
            depth.set(e.to, d + 1);
            next.push(e.to);
          }
        }
      }
      frontier = next;
    }
  }

  const noIncoming: string[] = [];
  const tooDeep: string[] = [];
  const unreachable: string[] = [];
  for (const n of nodes) {
    if (root && n.url === root.url) continue;
    if (incoming(graph, n.url).length === 0) noIncoming.push(n.url);
    const d = depth.get(n.url) ?? Infinity;
    if (!isFinite(d)) unreachable.push(n.url);
    else if (d > maxClicks) tooDeep.push(n.url);
  }

  noIncoming.sort();
  tooDeep.sort();
  unreachable.sort();

  return {
    locale,
    root: root?.url ?? null,
    depth,
    noIncoming,
    tooDeep,
    unreachable,
    healthy: !!root && tooDeep.length === 0 && unreachable.length === 0,
  };
}
