export type SortField = "score" | "occurredAt" | "severity" | "distance";
export type SortOrder = "asc" | "desc";

export interface GeoFilter {
  lat: number;
  lon: number;
  radiusKm: number;
}

export interface DateRange {
  from?: string;
  to?: string;
}

export interface SearchQuery {
  /** Free-text query in any supported language */
  q: string;
  /** Detected or user-selected locale for analyzer selection */
  locale?: string;
  /** Access tier for result filtering */
  tier?: "public" | "registered" | "pro" | "enterprise";
  orgId?: string;

  // Facet filters
  classes?: string[];
  severities?: number[];
  sources?: string[];
  geo?: GeoFilter;
  dateRange?: DateRange;
  verifiedOnly?: boolean;

  // Retrieval settings
  limit?: number;
  cursor?: string;
  sort?: SortField;
  sortOrder?: SortOrder;

  // Hybrid weights (0–1)
  lexicalWeight?: number;
  semanticWeight?: number;
  geoWeight?: number;
}

export interface SearchHit {
  id: string;
  score: number;
  eventId: string;
  class: string;
  subclass?: string;
  severity: number;
  summary: { en?: string | null; uk?: string | null };
  location?: { lat: number; lon: number; precisionM: number } | null;
  occurredAt: string;
  sources: { url: string; language: string }[];
  /** Highlighted snippets: field → fragment with <em> tags */
  highlights: Record<string, string>;
  /** Distance in km from geo filter center (if geo filter applied) */
  distanceKm?: number;
}

export interface FacetBucket {
  key: string;
  count: number;
}

export interface SearchFacets {
  classes: FacetBucket[];
  severities: FacetBucket[];
  sources: FacetBucket[];
  dateHistogram: { date: string; count: number }[];
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  facets?: SearchFacets;
  nextCursor?: string;
  tookMs: number;
}

export interface SearchAnalytics {
  query: string;
  locale?: string;
  hitsReturned: number;
  totalHits: number;
  tookMs: number;
  isZeroResult: boolean;
  timestamp: string;
  orgId?: string;
}
