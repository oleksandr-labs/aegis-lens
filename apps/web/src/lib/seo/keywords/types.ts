/**
 * SEO keyword tracking types — Sprint keyword cluster module.
 *
 * Defines typed vocabulary for keyword research, intent classification,
 * and keyword-to-page mapping used across the Aegis Lens SEO pipeline.
 */

/** Top-level thematic grouping for keyword clusters. */
export type KeywordCluster =
  | "osint_platform"
  | "ukraine_war_map"
  | "ai_intelligence"
  | "satellite_monitoring"
  | "geopolitical_analytics"
  | "verification"
  | "geolocation_longtail"
  | "comparison_queries"
  | "region_longtail";

/** Search intent classification following standard SEO taxonomy. */
export type SearchIntent =
  | "informational"
  | "navigational"
  | "commercial"
  | "transactional";

/** A single tracked keyword with full metadata. */
export interface KeywordEntry {
  /** The exact keyword or phrase to track. */
  keyword: string;
  /** Locale this keyword is targeted at. */
  locale: "en" | "uk" | "pl" | "de";
  /** Thematic cluster this keyword belongs to. */
  cluster: KeywordCluster;
  /** User intent behind this query. */
  intent: SearchIntent;
  /** Site path this keyword should rank for (e.g. "/", "/blog/how-to-verify-osint"). */
  targetPagePath: string;
  /** Rough search volume bucket (absent = unknown / not yet researched). */
  estimatedVolume?: "low" | "medium" | "high" | "very_high";
  /** Importance rank: 1 = primary, 2 = secondary, 3 = supporting long-tail. */
  priority: 1 | 2 | 3;
}

/** Page-level keyword assignment: one primary + a list of secondary keywords. */
export interface KeywordPageMapping {
  /** URL path pattern this mapping applies to (exact or glob). */
  pagePattern: string;
  /** The single most important keyword for this page. */
  primaryKeyword: KeywordEntry;
  /** Additional keywords to incorporate into on-page copy and meta. */
  secondaryKeywords: KeywordEntry[];
  /** Structural role of this page in the content architecture. */
  pageType: "pillar" | "cluster" | "comparison" | "region" | "tool";
}
