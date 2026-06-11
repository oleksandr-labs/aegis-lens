import type { Locale } from "@aegis/i18n-config";

/**
 * Sitemap-driven internal link graph.
 *
 * Builds a directed graph of the site's canonical routes from the same
 * `(pathFor, priority)` tuples that feed `app/sitemap.ts`, then derives
 * orphan / depth / hub signals that the internal-linking engine consumes.
 *
 * Loose coupling: this module does NOT import `app/sitemap.ts` (that file is a
 * Next.js route default-export and a shared-entry file). Instead the caller
 * passes in a flat list of routes. The engine cluster building
 * `lib/seo/internal-links/` can adapt its own representation to {@link GraphRoute}.
 *
 * Integration point: wire a thin adapter in `app/sitemap.ts` (or a future
 * `lib/seo/internal-links/route-registry.ts`) that maps each `addRoute(...)`
 * call into a {@link GraphRoute} and feeds {@link buildLinkGraph}.
 */

export type GraphRoute = {
  /** Locale-aware path builder, identical signature to sitemap's `pathFor`. */
  pathFor: (lc: Locale) => string;
  /** Sitemap priority (0..1); used as a hub-weight hint. */
  priority?: number;
  /**
   * Optional explicit outbound edges expressed as the EN path of the target.
   * When omitted, edges are inferred structurally (parent-segment links).
   */
  linksTo?: string[];
};

export type GraphNode = {
  /** EN canonical path — the node identity. */
  path: string;
  priority: number;
  /** Click-depth from `/` (number of path segments, root = 0). */
  depth: number;
  outDegree: number;
  inDegree: number;
};

export type LinkGraph = {
  nodes: Map<string, GraphNode>;
  /** path -> set of target paths. */
  edges: Map<string, Set<string>>;
};

function segments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** Parent path by dropping the last segment. `/a/b/c` -> `/a/b`, `/a` -> `/`. */
export function parentPath(path: string): string {
  const segs = segments(path);
  if (segs.length <= 1) return "/";
  return "/" + segs.slice(0, -1).join("/");
}

/**
 * Build the link graph from the EN canonical paths of every route.
 *
 * Structural edges (when a route declares no explicit `linksTo`):
 *   child -> parent (breadcrumb-style up-link), and
 *   parent -> child (hub down-link).
 * This mirrors the real breadcrumb + hub-page wiring already shipped, so the
 * derived depth/orphan metrics match the rendered site.
 */
export function buildLinkGraph(routes: GraphRoute[]): LinkGraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, Set<string>>();

  const enPath = (r: GraphRoute) => normalizePath(r.pathFor("en"));

  // Pass 1 — nodes.
  for (const r of routes) {
    const path = enPath(r);
    if (nodes.has(path)) continue;
    nodes.set(path, {
      path,
      priority: r.priority ?? 0.5,
      depth: segments(path).length,
      outDegree: 0,
      inDegree: 0,
    });
    edges.set(path, new Set());
  }

  const addEdge = (from: string, to: string) => {
    if (from === to) return;
    if (!nodes.has(from) || !nodes.has(to)) return;
    const set = edges.get(from)!;
    if (set.has(to)) return;
    set.add(to);
  };

  // Pass 2 — edges.
  for (const r of routes) {
    const path = enPath(r);
    if (r.linksTo && r.linksTo.length > 0) {
      for (const t of r.linksTo) addEdge(path, normalizePath(t));
      continue;
    }
    // Structural fallback: link to/from parent if the parent is a known node.
    const parent = parentPath(path);
    addEdge(path, parent);
    addEdge(parent, path);
  }

  // Degrees.
  for (const [from, set] of edges) {
    nodes.get(from)!.outDegree = set.size;
    for (const to of set) nodes.get(to)!.inDegree += 1;
  }

  return { nodes, edges };
}

/**
 * Orphan pages: reachable only at depth > maxClicks OR with zero inbound links
 * (excluding the home root). The TODO requires every post reachable in ≤ 3
 * clicks from `/`.
 */
export function findOrphans(graph: LinkGraph, maxClicks = 3): GraphNode[] {
  const depthFromRoot = bfsDepth(graph, "/");
  const out: GraphNode[] = [];
  for (const node of graph.nodes.values()) {
    if (node.path === "/") continue;
    const reach = depthFromRoot.get(node.path);
    const tooDeep = reach === undefined || reach > maxClicks;
    if (node.inDegree === 0 || tooDeep) out.push(node);
  }
  return out;
}

/** BFS click-depth from a start node along directed edges. */
export function bfsDepth(graph: LinkGraph, start: string): Map<string, number> {
  const dist = new Map<string, number>();
  if (!graph.nodes.has(start)) return dist;
  dist.set(start, 0);
  const queue: string[] = [start];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const d = dist.get(cur)!;
    for (const next of graph.edges.get(cur) ?? []) {
      if (dist.has(next)) continue;
      dist.set(next, d + 1);
      queue.push(next);
    }
  }
  return dist;
}

/** Hub nodes — highest inbound degree, weighted by priority. */
export function topHubs(graph: LinkGraph, limit = 10): GraphNode[] {
  return [...graph.nodes.values()]
    .sort(
      (a, b) =>
        b.inDegree * b.priority - a.inDegree * a.priority ||
        b.inDegree - a.inDegree,
    )
    .slice(0, limit);
}

function normalizePath(p: string): string {
  if (!p || p === "/") return "/";
  let out = p.startsWith("/") ? p : `/${p}`;
  if (out.length > 1 && out.endsWith("/")) out = out.slice(0, -1);
  return out;
}
