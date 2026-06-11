/**
 * Request / response shapes for the Aegis Lens Knowledge Graph read-only API.
 *
 * These types are used by:
 *   - API route handlers (apps/web/src/app/api/kg/*)
 *   - Client-side SDK / fetch wrappers
 *   - OpenAPI / JSON Schema generation
 */

import type {
  Entity,
  EntityId,
  EntityType,
  Locale,
  Relation,
  RelationPredicate,
} from "./types";

// ── Search ────────────────────────────────────────────────────────────────

/**
 * Query parameters for the KG full-text / semantic search endpoint.
 */
export interface KgSearchParams {
  /** Free-text query string. */
  query: string;
  /** Filter results to specific entity types. */
  types?: EntityType[];
  /** Preferred locale for name matching and response labels. */
  locale?: Locale;
  /** Maximum number of results to return (default: 20, max: 100). */
  limit?: number;
  /** Opaque pagination cursor from the previous response. */
  cursor?: string;
}

/**
 * A single entity result, enriched with its direct relations and a
 * relevance score from the search backend.
 */
export interface KgEntityResponse {
  entity: Entity;
  /** Direct relations where this entity is the subject or object. */
  relations: Relation[];
  /** Search relevance score [0–1]; omitted for direct lookups. */
  score?: number;
}

/**
 * Paginated search response.
 */
export interface KgSearchResponse {
  results: KgEntityResponse[];
  /** Total number of matching entities (before pagination). */
  total: number;
  /** Cursor to fetch the next page; absent when on the last page. */
  nextCursor?: string;
}

// ── Subgraph ──────────────────────────────────────────────────────────────

/**
 * Parameters for fetching a subgraph rooted at a given entity.
 * The API performs a BFS / DFS expansion up to `depth` hops.
 */
export interface KgSubgraphParams {
  rootEntityId: EntityId;
  /** Number of hops to expand (1 = direct neighbours only). */
  depth: number;
  /** Restrict expansion to specific relation predicates. */
  predicates?: RelationPredicate[];
  /**
   * Maximum total entities to return (prevents runaway expansion on
   * highly connected nodes). Default: 200.
   */
  limit?: number;
}

/**
 * Subgraph response: a self-contained set of entities and the relations
 * connecting them. `truncated` signals that the limit was hit before the
 * full depth was explored.
 */
export interface KgSubgraphResponse {
  entities: Entity[];
  relations: Relation[];
  /** True if the result was cut short by the `limit` parameter. */
  truncated: boolean;
}
