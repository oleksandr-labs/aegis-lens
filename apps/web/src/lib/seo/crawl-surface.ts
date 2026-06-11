/**
 * Internal-link surface recommender.
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - Internal-link surface from high-PageRank pages to deep programmatic
 *
 * Deep programmatic pages (entity×country, topic×year, equipment×operator, …)
 * are far from the home page in click-depth and accrue little internal PageRank,
 * so crawlers discover them late and rank them poorly. This module models the
 * internal-link graph and recommends *which* high-authority hub should link to
 * *which* orphaned/deep page, to flatten depth and pass equity.
 *
 * Pure + typed. A caller supplies the current page graph (from route enumeration
 * + rendered-link extraction); this returns link-injection recommendations a
 * hub component can consume.
 */

export type PageNode = {
  /** Canonical locale-prefixed path. */
  path: string;
  /**
   * Authority hint 0..1 — typically derived from sitemap priority, depth, or a
   * computed PageRank. Hubs (home, section indexes) sit near 1.0.
   */
  authority: number;
  /** Click-depth from the home page (0 = home). */
  depth: number;
  /** Template/segment id, e.g. "entity", "topic-country", "home", "section-index". */
  segment: string;
  /** Paths this page already links to internally. */
  outlinks: string[];
};

export type LinkRecommendation = {
  /** High-authority page that should gain a link. */
  from: string;
  /** Deep/orphaned target that needs the equity. */
  to: string;
  /** Why — for editorial review / logging. */
  reason: string;
  /** Priority 0..1 (higher = more impactful). */
  score: number;
};

export type SurfaceOptions = {
  /** A page is "deep" at/above this click-depth. */
  deepDepth?: number;
  /** A hub is a page at/above this authority. */
  hubAuthority?: number;
  /** Max recommendations to emit per hub (avoid bloating any one page). */
  maxPerHub?: number;
  /**
   * Prefer hubs in the same segment family as the target (e.g. the topic index
   * links to topic×country pages). Map target.segment → preferred hub segment.
   */
  segmentAffinity?: Record<string, string>;
};

const DEFAULTS: Required<Omit<SurfaceOptions, "segmentAffinity">> = {
  deepDepth: 3,
  hubAuthority: 0.7,
  maxPerHub: 25,
};

/**
 * Recommend internal links from high-authority hubs to deep/orphaned programmatic
 * pages that currently receive few internal links.
 */
export function recommendLinkSurface(
  graph: PageNode[],
  opts: SurfaceOptions = {},
): LinkRecommendation[] {
  const cfg = { ...DEFAULTS, ...opts };
  const affinity = opts.segmentAffinity ?? {};

  // Count inbound internal links per path.
  const inbound = new Map<string, number>();
  for (const n of graph) inbound.set(n.path, 0);
  for (const n of graph) {
    for (const o of n.outlinks) {
      if (inbound.has(o)) inbound.set(o, (inbound.get(o) ?? 0) + 1);
    }
  }

  const hubs = graph
    .filter((n) => n.authority >= cfg.hubAuthority)
    .sort((a, b) => b.authority - a.authority);

  // Targets: deep or under-linked pages, neediest first.
  const targets = graph
    .filter((n) => n.depth >= cfg.deepDepth || (inbound.get(n.path) ?? 0) <= 1)
    .sort((a, b) => {
      const ai = inbound.get(a.path) ?? 0;
      const bi = inbound.get(b.path) ?? 0;
      if (ai !== bi) return ai - bi; // fewest inbound first
      return b.depth - a.depth; // deepest first
    });

  const perHubCount = new Map<string, number>();
  const recs: LinkRecommendation[] = [];

  for (const t of targets) {
    const preferredSeg = affinity[t.segment];
    const hub =
      hubs.find(
        (h) =>
          h.path !== t.path &&
          !h.outlinks.includes(t.path) &&
          (perHubCount.get(h.path) ?? 0) < cfg.maxPerHub &&
          (preferredSeg ? h.segment === preferredSeg : true),
      ) ??
      hubs.find(
        (h) =>
          h.path !== t.path &&
          !h.outlinks.includes(t.path) &&
          (perHubCount.get(h.path) ?? 0) < cfg.maxPerHub,
      );
    if (!hub) continue;

    perHubCount.set(hub.path, (perHubCount.get(hub.path) ?? 0) + 1);
    const inboundNow = inbound.get(t.path) ?? 0;
    const depthPenalty = Math.min(t.depth, 6) / 6;
    const orphanBonus = inboundNow === 0 ? 0.3 : 0;
    const score = round3(
      Math.min(1, hub.authority * 0.5 + depthPenalty * 0.4 + orphanBonus),
    );
    recs.push({
      from: hub.path,
      to: t.path,
      score,
      reason:
        inboundNow === 0
          ? `orphan (${t.segment}, depth ${t.depth}) — needs first internal link from authority hub`
          : `deep ${t.segment} (depth ${t.depth}, ${inboundNow} inbound) — flatten via hub`,
    });
  }

  return recs.sort((a, b) => b.score - a.score);
}

/** Convenience: group recommendations by source hub for per-page rendering. */
export function groupByHub(
  recs: LinkRecommendation[],
): Record<string, LinkRecommendation[]> {
  const out: Record<string, LinkRecommendation[]> = {};
  for (const r of recs) (out[r.from] ??= []).push(r);
  return out;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
