/**
 * Aegis Lens GraphQL schema (SDL).
 *
 * This module defines the typed contract for all GraphQL operations.
 * It mirrors the existing REST API resources (/events, /regions, /copilot).
 *
 * NOTE: GraphQL execution is not yet wired — schema serves as the typed
 * contract for future resolver implementation. The SDL is exposed at
 * GET /api/graphql/schema for tooling introspection.
 *
 * Resources mirrored:
 *   REST /api/events          → Query.events
 *   REST /api/regions/:iso2   → Query.regions
 *   REST /api/copilot         → Query.copilot
 */

// ── SDL ───────────────────────────────────────────────────────────────────────

export const AEGIS_GRAPHQL_SCHEMA = /* GraphQL */ `
  """
  Aegis Lens OSINT Platform — GraphQL API
  Mirrors the REST API surface. Resolver wiring: future sprint.
  """
  schema {
    query: Query
  }

  # ── Root query ───────────────────────────────────────────────────────────────

  type Query {
    """
    Paginated list of OSINT events.
    Equivalent to GET /api/events?country=&class=&hours=&limit=&cursor=
    """
    events(
      filter: EventFilter
      cursor: String
      limit: Int
    ): EventConnection!

    """
    One or more region objects by ISO 3166-1 alpha-2 code.
    Pass iso2 to get a single region; omit for all regions.
    Equivalent to GET /api/regions/:iso2
    """
    regions(iso2: String): [Region!]!

    """
    AI copilot conversational endpoint.
    Equivalent to POST /api/copilot
    """
    copilot(
      "The user message / query"
      message: String!
      "BCP-47 locale code (en | uk | …). Defaults to en."
      locale: String
    ): CopilotResponse!
  }

  # ── Event ────────────────────────────────────────────────────────────────────

  """Filter inputs for the events query."""
  input EventFilter {
    "ISO 3166-1 alpha-2 country codes (multi-value)"
    countries: [String!]
    "Event classification class (e.g. military_action, infrastructure)"
    classes: [String!]
    "ISO 3166-1 alpha-2 region code"
    regionIso2: String
    "Only include events in the last N hours"
    hours: Int
    "ISO 8601 start of time range"
    fromDate: String
    "ISO 8601 end of time range"
    toDate: String
    "Minimum confidence score (0.0 – 1.0)"
    minConfidence: Float
  }

  """A single confirmed or unconfirmed OSINT event."""
  type Event {
    id: ID!
    "Human-readable event class (military_action, infrastructure, humanitarian, …)"
    class: String!
    subclass: String
    "ISO 3166-1 alpha-2 country code"
    country: String!
    "WGS-84 latitude"
    lat: Float!
    "WGS-84 longitude"
    lon: Float!
    "ISO 8601 occurrence timestamp"
    occurredAt: String!
    "Event summary in English"
    summaryEn: String!
    "Event summary in Ukrainian (may be absent)"
    summaryUk: String
    "Source confidence 0.0 – 1.0"
    confidence: Float!
    "URL to primary source"
    sourceUrl: String
    "ISO 3166-1 alpha-2 region code"
    regionIso2: String
    region: Region
    createdAt: String!
    updatedAt: String!
  }

  """Paginated events result with cursor."""
  type EventConnection {
    data: [Event!]!
    pageInfo: PageInfo!
  }

  """Cursor-based pagination metadata."""
  type PageInfo {
    "Opaque cursor for the next page; null if no more results."
    nextCursor: String
    "Whether there are more results beyond this page."
    hasMore: Boolean!
    "Number of items in this page."
    count: Int!
    "Page size used for this request."
    limit: Int!
  }

  # ── Region ───────────────────────────────────────────────────────────────────

  """Geographical region (country-level or sub-national)."""
  type Region {
    "ISO 3166-1 alpha-2 code"
    iso2: String!
    "Human-readable English name"
    nameEn: String!
    "Human-readable Ukrainian name"
    nameUk: String
    "GeoJSON geometry (stringified FeatureCollection)"
    geojson: String
    "Alert level: none | low | medium | high | critical"
    alertLevel: String
    "ISO 8601 timestamp of last update"
    updatedAt: String!
  }

  # ── Copilot ──────────────────────────────────────────────────────────────────

  """Response from the AI copilot."""
  type CopilotResponse {
    "Model-generated answer in the requested locale"
    answer: String!
    "Locale of the response (BCP-47)"
    locale: String!
    "Event IDs cited in the answer"
    citedEventIds: [String!]!
    "Whether a guardrail was triggered (answer will be empty / redacted)"
    guardrailTriggered: Boolean!
    "Opaque conversation session ID for follow-up turns"
    sessionId: String
  }
`;

// ── Public accessor ───────────────────────────────────────────────────────────

/**
 * Returns the Aegis Lens GraphQL SDL string.
 *
 * This is the authoritative typed contract. Wire resolvers against these
 * types in the future GraphQL execution layer (graphql-js / Pothos / etc.).
 */
export function getGraphqlSchema(): string {
  return AEGIS_GRAPHQL_SCHEMA;
}
