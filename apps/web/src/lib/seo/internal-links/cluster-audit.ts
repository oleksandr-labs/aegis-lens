/**
 * Per-cluster traversal audit.
 *
 * For every (locale, cluster) it verifies the hub-spoke crawl-shape contract:
 *  - the cluster has a designated hub,
 *  - the hub links to all spokes,
 *  - every spoke links back to the hub and to ≥ minSiblings siblings,
 *  - every spoke is reachable from the hub via intra-cluster edges.
 *
 * Combines `hub-spoke` validation + a reachability BFS confined to the cluster.
 * Pure; consumes a built `LinkGraph`. Per locale (edges never cross locales).
 */

import { type LinkGraph, outgoing } from "./link-graph";
import { checkHubSpoke, type HubSpokeHealth } from "./hub-spoke";

export interface ClusterAudit {
  cluster: string;
  locale: string;
  hubUrl: string | null;
  spokeCount: number;
  hubSpoke: HubSpokeHealth | null;
  /** Spokes not reachable from the hub through intra-cluster edges. */
  unreachableFromHub: string[];
  healthy: boolean;
  /** Human-readable issues for a monitoring panel. */
  issues: string[];
}

export function auditClusters(graph: LinkGraph, minSiblings = 3): ClusterAudit[] {
  // Group by (locale, cluster).
  const groups = new Map<
    string,
    { locale: string; cluster: string; urls: string[]; hub: string | null }
  >();
  for (const n of graph.nodes.values()) {
    const key = `${n.locale} ${n.cluster}`;
    const g =
      groups.get(key) ??
      groups.set(key, { locale: n.locale, cluster: n.cluster, urls: [], hub: null }).get(key)!;
    g.urls.push(n.url);
    if (n.isHub) g.hub = n.url;
  }

  const audits: ClusterAudit[] = [];
  for (const g of groups.values()) {
    const issues: string[] = [];
    const spokes = g.urls.filter((u) => u !== g.hub);

    let hubSpoke: HubSpokeHealth | null = null;
    let unreachable: string[] = [];

    if (!g.hub) {
      issues.push("no hub designated");
    } else {
      const edges = g.urls.flatMap((u) => outgoing(graph, u));
      hubSpoke = checkHubSpoke(edges, g.hub, spokes, minSiblings);
      if (hubSpoke.unlinkedSpokes.length) issues.push(`hub misses ${hubSpoke.unlinkedSpokes.length} spoke(s)`);
      if (hubSpoke.spokesMissingHubLink.length) issues.push(`${hubSpoke.spokesMissingHubLink.length} spoke(s) miss hub backlink`);
      if (hubSpoke.spokesUnderSiblings.length) issues.push(`${hubSpoke.spokesUnderSiblings.length} spoke(s) under sibling quota`);

      // Reachability BFS confined to the cluster.
      const inCluster = new Set(g.urls);
      const seen = new Set<string>([g.hub]);
      let frontier = [g.hub];
      while (frontier.length) {
        const next: string[] = [];
        for (const u of frontier) {
          for (const e of outgoing(graph, u)) {
            if (inCluster.has(e.to) && !seen.has(e.to)) {
              seen.add(e.to);
              next.push(e.to);
            }
          }
        }
        frontier = next;
      }
      unreachable = spokes.filter((s) => !seen.has(s)).sort();
      if (unreachable.length) issues.push(`${unreachable.length} spoke(s) unreachable from hub`);
    }

    audits.push({
      cluster: g.cluster,
      locale: g.locale,
      hubUrl: g.hub,
      spokeCount: spokes.length,
      hubSpoke,
      unreachableFromHub: unreachable,
      healthy: issues.length === 0,
      issues,
    });
  }

  audits.sort((a, b) => a.locale.localeCompare(b.locale) || a.cluster.localeCompare(b.cluster));
  return audits;
}
