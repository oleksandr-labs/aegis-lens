/**
 * Semantic hub-and-spoke linking that mirrors the entity graph — Sprint 2.73.
 *
 * Closes TODO/seo/TODO_semantic_seo.md:
 *  "Hub-and-spoke linking that mirrors the entity graph — depends on live content graph"
 *
 * Strategy:
 *  - The entity graph is built from EntityMention records extracted per page.
 *  - Hub pages are entities with the most inbound mentions (high centrality).
 *  - Spoke pages are pages that mention a hub entity ≥1 time.
 *  - We generate the semantic link set: hub → spokes + spokes → hub,
 *    using the entity's canonical URL and its sameAs links as semantic anchors.
 *
 * This is the semantic SEO complement to the crawl-graph hub-spoke
 * in `internal-links/hub-spoke.ts`. Whereas that module works from URL
 * topology, this module works from the entity knowledge graph — producing
 * semantically meaningful links driven by what entities each page is *about*.
 *
 * Pure — no network. Feed in the entity mention index from content analysis.
 */

import type { EntityMention } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────────

/** A node in the entity hub graph. */
export interface EntityGraphNode {
  /** Stable entity ID (same as EntityMention.entityId). */
  entityId: string;
  /** Canonical URL for this entity's page (e.g. /glossary/shahed-136). */
  entityPageUrl: string;
  /** Human-readable name for anchor text generation. */
  name: string;
  /** Schema.org @type. */
  entityType: string;
  /** External sameAs URLs (used to strengthen semantic signal). */
  sameAs: string[];
}

/** A page in the content graph, with its entity mention set. */
export interface ContentPage {
  url: string;
  locale: string;
  title: string;
  /** Entities this page mentions (extracted by defined-term-linker / entity-schema). */
  mentions: EntityMention[];
  /** Entities this page is primarily *about* (higher weight than mentions). */
  about?: EntityMention[];
}

/** A directed semantic link edge between two pages. */
export interface SemanticLinkEdge {
  from: string;
  to: string;
  /** Anchor text — derived from the entity name. */
  anchor: string;
  /** The entity that makes this link semantically justified. */
  entityId: string;
  relation: "entity-hub-to-spoke" | "entity-spoke-to-hub" | "entity-sibling";
}

/** Entity centrality score derived from inbound mention frequency. */
export interface EntityCentrality {
  entityId: string;
  entityPageUrl: string;
  name: string;
  /** Number of content pages that mention this entity. */
  mentionCount: number;
  /** Number of pages where this entity is primary (about). */
  primaryCount: number;
  /**
   * Composite centrality score (0..1) — higher = better hub candidate.
   * Formula: (primaryCount × 2 + mentionCount) / max, normalised.
   */
  centralityScore: number;
}

// ── Entity centrality computation ──────────────────────────────────────────────

/**
 * Compute centrality scores for all entities mentioned across the content corpus.
 *
 * High-centrality entities are the best hub candidates — they appear on many
 * pages and are strongly associated with the site's authority topic clusters.
 */
export function computeEntityCentrality(
  pages: ContentPage[],
  entityRegistry: Map<string, EntityGraphNode>,
): EntityCentrality[] {
  const mentionCounts = new Map<string, number>();
  const primaryCounts = new Map<string, number>();

  for (const page of pages) {
    const seenOnPage = new Set<string>();

    for (const mention of page.mentions) {
      if (!seenOnPage.has(mention.entityId)) {
        seenOnPage.add(mention.entityId);
        mentionCounts.set(mention.entityId, (mentionCounts.get(mention.entityId) ?? 0) + 1);
      }
    }

    for (const about of page.about ?? []) {
      primaryCounts.set(about.entityId, (primaryCounts.get(about.entityId) ?? 0) + 1);
      if (!seenOnPage.has(about.entityId)) {
        seenOnPage.add(about.entityId);
        mentionCounts.set(about.entityId, (mentionCounts.get(about.entityId) ?? 0) + 1);
      }
    }
  }

  // Compute composite scores
  const rawScores = new Map<string, number>();
  let maxRaw = 0;
  for (const [entityId, mc] of mentionCounts) {
    const pc = primaryCounts.get(entityId) ?? 0;
    const raw = pc * 2 + mc;
    rawScores.set(entityId, raw);
    if (raw > maxRaw) maxRaw = raw;
  }

  const results: EntityCentrality[] = [];
  for (const [entityId, raw] of rawScores) {
    const node = entityRegistry.get(entityId);
    if (!node) continue;
    results.push({
      entityId,
      entityPageUrl: node.entityPageUrl,
      name: node.name,
      mentionCount: mentionCounts.get(entityId) ?? 0,
      primaryCount: primaryCounts.get(entityId) ?? 0,
      centralityScore: maxRaw > 0 ? Math.round((raw / maxRaw) * 1000) / 1000 : 0,
    });
  }

  return results.sort((a, b) => b.centralityScore - a.centralityScore);
}

// ── Hub-spoke edge builder ─────────────────────────────────────────────────────

export interface EntityHubSpokeOptions {
  /**
   * Top N entities by centrality that become hubs.
   * Other entities generate spoke-to-hub links pointing to these hubs.
   */
  topHubCount?: number;
  /**
   * Minimum centrality score for an entity to be considered a hub.
   * Avoids creating hub pages for obscure entities. 0..1.
   */
  minHubCentrality?: number;
  /** Include sibling edges (spoke→spoke) for entities sharing the same hub. */
  includeSiblings?: boolean;
  /** Max sibling links per spoke page (ring topology). */
  maxSiblingsPerSpoke?: number;
  /** Only build edges for this locale (locale-preserving). */
  locale?: string;
}

/**
 * Build semantic hub-and-spoke link edges from the entity graph.
 *
 * Output edges are ready to merge with the crawl-graph edges from
 * `internal-links/hub-spoke.ts` via the link assembler.
 *
 * @param pages          All content pages with entity mention metadata.
 * @param entityRegistry Map of entityId → EntityGraphNode (canonical URL + name).
 * @param centrality     Pre-computed centrality scores (from computeEntityCentrality).
 * @param opts           Tuning parameters.
 */
export function buildEntityHubSpokeEdges(
  pages: ContentPage[],
  entityRegistry: Map<string, EntityGraphNode>,
  centrality: EntityCentrality[],
  opts: EntityHubSpokeOptions = {},
): SemanticLinkEdge[] {
  const {
    topHubCount = 20,
    minHubCentrality = 0.1,
    includeSiblings = true,
    maxSiblingsPerSpoke = 2,
    locale,
  } = opts;

  // Select top hubs
  const hubs = centrality
    .filter((e) => e.centralityScore >= minHubCentrality)
    .slice(0, topHubCount);

  const hubEntityIds = new Set(hubs.map((h) => h.entityId));

  // Filter pages by locale if specified
  const filteredPages = locale
    ? pages.filter((p) => p.locale === locale)
    : pages;

  const edges: SemanticLinkEdge[] = [];

  for (const hub of hubs) {
    const hubNode = entityRegistry.get(hub.entityId);
    if (!hubNode) continue;

    // Find spoke pages: pages that mention this hub entity
    const spokePages = filteredPages.filter(
      (p) =>
        p.url !== hubNode.entityPageUrl &&
        (p.mentions.some((m) => m.entityId === hub.entityId) ||
          p.about?.some((a) => a.entityId === hub.entityId)),
    );

    // Hub entity page → each spoke (hub-to-spoke)
    for (const spoke of spokePages) {
      edges.push({
        from: hubNode.entityPageUrl,
        to: spoke.url,
        anchor: spoke.title,
        entityId: hub.entityId,
        relation: "entity-hub-to-spoke",
      });

      // Spoke → hub entity page (spoke-to-hub)
      edges.push({
        from: spoke.url,
        to: hubNode.entityPageUrl,
        anchor: hubNode.name,
        entityId: hub.entityId,
        relation: "entity-spoke-to-hub",
      });
    }

    // Sibling links (ring topology among spokes)
    if (includeSiblings && spokePages.length > 1) {
      const n = spokePages.length;
      for (let i = 0; i < n; i++) {
        const fromPage = spokePages[i]!;
        for (let k = 1; k <= Math.min(maxSiblingsPerSpoke, n - 1); k++) {
          const toPage = spokePages[(i + k) % n]!;
          if (toPage.url === fromPage.url) continue;
          edges.push({
            from: fromPage.url,
            to: toPage.url,
            anchor: toPage.title,
            entityId: hub.entityId,
            relation: "entity-sibling",
          });
        }
      }
    }
  }

  // Deduplicate edges (same from/to/relation — keep first)
  const seen = new Set<string>();
  return edges.filter((e) => {
    const key = `${e.from}::${e.to}::${e.relation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Schema audit schedule ──────────────────────────────────────────────────────

/**
 * Quarterly schema audit config.
 *
 * Closes semantic SEO TODO: "Audit quarterly for schema completeness — process task".
 *
 * The audit runs via CI on the schedule below. It uses `auditPageForSchemaCoverage`
 * from schema-validation.ts against a sample of live pages per template.
 *
 * Manual + automated steps:
 *  1. Run `pnpm seo:schema-audit` (triggers schema-validation.ts on rendered HTML)
 *  2. Check Google Rich Results Test on 1 page per template family
 *  3. Review Search Console → Enhancements tab for structured data errors
 *  4. Update REQUIRED_FIELDS if Google adds new required properties
 *  5. Log results + action items in audit history below
 */
export const SCHEMA_AUDIT_SCHEDULE = {
  /** Cron expression: first Monday of each quarter at 09:00 UTC. */
  cronExpression: "0 9 1-7 1,4,7,10 1",
  /** Team member responsible for reviewing results. */
  owner: "seo-lead",
  /** Pages to sample per template (full audit is too slow for CI). */
  sampleSizePerTemplate: 5,
  /** Coverage threshold below which a Slack alert fires. */
  alertBelowCoverage: 0.8,
  /** History of past audits. */
  auditHistory: [] as Array<{
    date: string;
    coverage: number;
    missingTypes: string[];
    actionItems: string[];
  }>,
  /** Next scheduled run date (ISO). Update after each audit. */
  nextAuditDate: "2024-10-07",
} as const;

// ── Utility: build entity registry from flat entity list ──────────────────────

/**
 * Build an entity registry (Map<entityId, EntityGraphNode>) from a flat list.
 * Convenience for tests and fixture construction.
 */
export function buildEntityRegistry(
  nodes: EntityGraphNode[],
): Map<string, EntityGraphNode> {
  const map = new Map<string, EntityGraphNode>();
  for (const node of nodes) {
    map.set(node.entityId, node);
  }
  return map;
}
