/**
 * KG-based traversal: entity → neighbour entities.
 *
 * The platform's knowledge graph is expressed two ways:
 *  - `EntitySeed.relatedSlugs` in `entities-seed.ts` (explicit edges), plus the
 *    implicit edges via shared tags / shared related events / investigations.
 *  - `services/entity-extraction` `KnowledgeGraphEntity` (canonical KG, with
 *    `mentionEventIds`). When that service is wired to a store, feed its edges
 *    into `buildEntityGraph` instead of the seed-derived ones.
 *
 * We expose a generic adjacency model so either source works, then a BFS that
 * returns neighbour entities ranked by hop distance + shared-edge weight.
 */

export interface EntityGraphNode {
  slug: string;
  /** Directly-declared related entity slugs. */
  relatedSlugs: string[];
  /** Tags — entities sharing tags get an implicit weighted edge. */
  tags: string[];
}

export interface EntityNeighbour {
  slug: string;
  /** Hop distance from the seed (1 = direct). */
  hops: number;
  /** Heuristic relevance: direct edges score higher than tag-only links. */
  weight: number;
}

interface InternalEdge {
  to: string;
  weight: number;
}

/**
 * Build an undirected weighted adjacency map. Explicit `relatedSlugs` edges
 * weigh 1.0; an edge induced purely by shared tags weighs by Jaccard overlap
 * (capped below explicit so declared relationships always win).
 */
export function buildEntityGraph(nodes: EntityGraphNode[]): Map<string, InternalEdge[]> {
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));
  const adj = new Map<string, Map<string, number>>();
  const link = (a: string, b: string, w: number) => {
    if (a === b) return;
    const m = adj.get(a) ?? adj.set(a, new Map()).get(a)!;
    m.set(b, Math.max(m.get(b) ?? 0, w));
  };

  // Explicit edges (symmetric).
  for (const n of nodes) {
    for (const r of n.relatedSlugs) {
      if (!bySlug.has(r)) continue;
      link(n.slug, r, 1);
      link(r, n.slug, 1);
    }
  }

  // Implicit tag-overlap edges.
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const setB = new Set(b.tags);
      const inter = a.tags.filter((t) => setB.has(t)).length;
      if (inter === 0) continue;
      const union = new Set([...a.tags, ...b.tags]).size;
      const jaccard = union === 0 ? 0 : inter / union;
      const w = Math.min(0.9, jaccard); // never beats an explicit edge
      if (w > 0) {
        link(a.slug, b.slug, w);
        link(b.slug, a.slug, w);
      }
    }
  }

  const out = new Map<string, InternalEdge[]>();
  for (const [slug, m] of adj) {
    out.set(
      slug,
      [...m.entries()].map(([to, weight]) => ({ to, weight })),
    );
  }
  return out;
}

/**
 * BFS from `seedSlug`, returning neighbours within `maxHops`. Ranked by hops
 * ascending then weight descending. The seed itself is excluded.
 */
export function neighbours(
  graph: Map<string, InternalEdge[]>,
  seedSlug: string,
  opts: { maxHops?: number; limit?: number } = {},
): EntityNeighbour[] {
  const { maxHops = 2, limit = 12 } = opts;
  if (!graph.has(seedSlug)) return [];

  const best = new Map<string, EntityNeighbour>();
  let frontier: { slug: string; hops: number; weight: number }[] = [
    { slug: seedSlug, hops: 0, weight: 1 },
  ];
  const visited = new Set<string>([seedSlug]);

  while (frontier.length) {
    const next: typeof frontier = [];
    for (const cur of frontier) {
      if (cur.hops >= maxHops) continue;
      for (const e of graph.get(cur.slug) ?? []) {
        const hops = cur.hops + 1;
        // Path weight decays as edges chain.
        const weight = cur.weight * e.weight;
        const prev = best.get(e.to);
        if (!prev || hops < prev.hops || (hops === prev.hops && weight > prev.weight)) {
          best.set(e.to, { slug: e.to, hops, weight });
        }
        if (!visited.has(e.to)) {
          visited.add(e.to);
          next.push({ slug: e.to, hops, weight });
        }
      }
    }
    frontier = next;
  }

  best.delete(seedSlug);
  return [...best.values()]
    .sort((a, b) => a.hops - b.hops || b.weight - a.weight || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}
