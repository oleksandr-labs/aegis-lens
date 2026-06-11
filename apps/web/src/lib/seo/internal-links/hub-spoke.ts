/**
 * Crawl-shape: hub→spokes + spoke→hub+siblings.
 *
 * Given a hub page and its spokes within a cluster (same locale), generate the
 * canonical crawl-shape edges:
 *  - hub → every spoke (hub-to-spoke)
 *  - each spoke → hub (spoke-to-hub)
 *  - each spoke → N sibling spokes (sibling) — default 3 per the link rules
 *
 * Sibling selection is deterministic (ring topology over the spoke order) so
 * every spoke gets exactly `siblingCount` distinct, reciprocal-ish neighbours
 * without quadratic blow-up. Anchors come from a caller-supplied resolver so
 * anchor-variety stays decoupled.
 */

import type { LinkEdge } from "./link-graph";

export interface HubSpokeInput {
  hubUrl: string;
  /** Spoke urls in a stable order (same locale as the hub). */
  spokeUrls: string[];
  /** How many sibling links each spoke emits (TODO target: 3+). */
  siblingCount?: number;
  /** Resolve an anchor for a link from `from` to `to`. */
  anchorFor: (from: string, to: string) => string;
}

/**
 * Build the full hub-spoke edge set. Sibling neighbours for spoke i are the
 * next `siblingCount` spokes in ring order (wrapping), guaranteeing each spoke
 * links to distinct siblings even in small clusters.
 */
export function buildHubSpokeEdges(input: HubSpokeInput): LinkEdge[] {
  const { hubUrl, spokeUrls, anchorFor } = input;
  const siblingCount = input.siblingCount ?? 3;
  const edges: LinkEdge[] = [];
  const n = spokeUrls.length;

  for (let i = 0; i < n; i++) {
    const spoke = spokeUrls[i];

    edges.push({ from: hubUrl, to: spoke, anchor: anchorFor(hubUrl, spoke), relation: "hub-to-spoke" });
    edges.push({ from: spoke, to: hubUrl, anchor: anchorFor(spoke, hubUrl), relation: "spoke-to-hub" });

    const maxSiblings = Math.min(siblingCount, n - 1);
    for (let k = 1; k <= maxSiblings; k++) {
      const sib = spokeUrls[(i + k) % n];
      if (sib === spoke) continue;
      edges.push({ from: spoke, to: sib, anchor: anchorFor(spoke, sib), relation: "sibling" });
    }
  }

  return edges;
}

export interface HubSpokeHealth {
  hubUrl: string;
  spokeCount: number;
  /** Spokes the hub fails to link to. */
  unlinkedSpokes: string[];
  /** Spokes that don't link back to the hub. */
  spokesMissingHubLink: string[];
  /** Spokes with fewer than `minSiblings` sibling links. */
  spokesUnderSiblings: string[];
  healthy: boolean;
}

/** Validate an edge set against the hub-spoke contract (used by cluster audit). */
export function checkHubSpoke(
  edges: LinkEdge[],
  hubUrl: string,
  spokeUrls: string[],
  minSiblings = 3,
): HubSpokeHealth {
  const spokeSet = new Set(spokeUrls);
  const hubOutTo = new Set(edges.filter((e) => e.from === hubUrl).map((e) => e.to));
  const linksToHub = new Set(edges.filter((e) => e.to === hubUrl).map((e) => e.from));
  const siblingCount = new Map<string, number>();
  for (const e of edges) {
    if (e.relation === "sibling" && spokeSet.has(e.from) && spokeSet.has(e.to)) {
      siblingCount.set(e.from, (siblingCount.get(e.from) ?? 0) + 1);
    }
  }

  const cap = Math.min(minSiblings, Math.max(0, spokeUrls.length - 1));
  const unlinkedSpokes = spokeUrls.filter((s) => !hubOutTo.has(s));
  const spokesMissingHubLink = spokeUrls.filter((s) => !linksToHub.has(s));
  const spokesUnderSiblings = spokeUrls.filter((s) => (siblingCount.get(s) ?? 0) < cap);

  return {
    hubUrl,
    spokeCount: spokeUrls.length,
    unlinkedSpokes,
    spokesMissingHubLink,
    spokesUnderSiblings,
    healthy:
      unlinkedSpokes.length === 0 &&
      spokesMissingHubLink.length === 0 &&
      spokesUnderSiblings.length === 0,
  };
}
