/**
 * Internal PageRank approximation — iterative power method over the link graph.
 *
 * Standard PageRank with damping `d`: rank converges via repeated
 *   r' = (1−d)/N + d · (Mᵀ r)
 * where M distributes a node's rank evenly across its outgoing links.
 * Dangling nodes (no out-links) redistribute their mass uniformly so total
 * rank is conserved. Computed PER LOCALE because edges never cross locales —
 * each locale's pages form their own component and should rank among peers.
 *
 * Pure + deterministic; no network. Used by monitoring to find the most
 * "authoritative" internal pages and to spot pages starved of link equity.
 */

import { type LinkGraph, outgoing, nodesForLocale } from "./link-graph";
import type { Locale } from "@aegis/i18n-config";

export interface PageRankResult {
  /** url -> rank in [0,1], summing to ~1 across the locale's pages. */
  ranks: Map<string, number>;
  iterations: number;
  /** Whether it converged within maxIterations under the tolerance. */
  converged: boolean;
}

export interface PageRankOptions {
  /** Damping factor (probability of following a link). */
  damping?: number;
  maxIterations?: number;
  /** L1 convergence tolerance. */
  tolerance?: number;
}

/**
 * Compute PageRank over a single locale's subgraph.
 */
export function internalPageRank(
  graph: LinkGraph,
  locale: Locale,
  opts: PageRankOptions = {},
): PageRankResult {
  const { damping = 0.85, maxIterations = 100, tolerance = 1e-6 } = opts;
  const nodes = nodesForLocale(graph, locale).map((n) => n.url);
  const N = nodes.length;
  const ranks = new Map<string, number>();
  if (N === 0) return { ranks, iterations: 0, converged: true };

  // Out-links restricted to the same locale's node set.
  const inLocale = new Set(nodes);
  const outNeighbours = new Map<string, string[]>();
  for (const u of nodes) {
    outNeighbours.set(
      u,
      outgoing(graph, u)
        .map((e) => e.to)
        .filter((t) => inLocale.has(t)),
    );
  }

  let r = new Map<string, number>(nodes.map((u) => [u, 1 / N]));
  const base = (1 - damping) / N;
  let iterations = 0;
  let converged = false;

  for (; iterations < maxIterations; iterations++) {
    const next = new Map<string, number>(nodes.map((u) => [u, base]));

    // Dangling mass: nodes with no out-links spread their rank uniformly.
    let dangling = 0;
    for (const u of nodes) {
      if ((outNeighbours.get(u) ?? []).length === 0) dangling += r.get(u)!;
    }
    const danglingShare = damping * (dangling / N);
    if (danglingShare > 0) {
      for (const u of nodes) next.set(u, next.get(u)! + danglingShare);
    }

    // Distribute each node's rank across its out-links.
    for (const u of nodes) {
      const outs = outNeighbours.get(u)!;
      if (outs.length === 0) continue;
      const share = (damping * r.get(u)!) / outs.length;
      for (const v of outs) next.set(v, next.get(v)! + share);
    }

    // Convergence (L1 delta).
    let delta = 0;
    for (const u of nodes) delta += Math.abs(next.get(u)! - r.get(u)!);
    r = next;
    if (delta < tolerance) {
      converged = true;
      iterations++;
      break;
    }
  }

  return { ranks: r, iterations, converged };
}

/** Top-N pages by PageRank for a locale (descending). */
export function topByPageRank(
  result: PageRankResult,
  limit = 20,
): { url: string; rank: number }[] {
  return [...result.ranks.entries()]
    .map(([url, rank]) => ({ url, rank }))
    .sort((a, b) => b.rank - a.rank || a.url.localeCompare(b.url))
    .slice(0, limit);
}
