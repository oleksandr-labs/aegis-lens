/**
 * Aegis Lens — Content Taxonomy Types
 * All 16 topic cluster slugs + interfaces for clusters and subcategories.
 */

export type TopicClusterId =
  | "osint-101"
  | "photo-video-verification"
  | "geolocation"
  | "ai-for-intelligence"
  | "satellite-analysis"
  | "maritime-intel"
  | "cyber-threat-intel"
  | "drone-intelligence"
  | "energy-grid-monitoring"
  | "election-integrity"
  | "disinformation"
  | "humanitarian-mapping"
  | "sanctions-tracking"
  | "conflict-monitoring"
  | "travel-risk"
  | "equipment-identification";

export interface TopicCluster {
  id: TopicClusterId;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  /** Pillar page slug this cluster belongs to */
  pillarSlug: string;
  /** Number of supporting child topic pages */
  childTopicCount: number;
  /** 1 = highest build priority, 3 = lowest */
  quarterlyBuildPriority: number;
  /** Glossary term slugs cross-linked from this cluster */
  glossaryCrossLinks: string[];
  /** Knowledge graph entity types relevant to this cluster */
  kgEntities: string[];
  /** Example child page slugs (hyphenated, descriptive) */
  exampleChildSlugs: string[];
}

export type SubcategoryId = string;

export interface Subcategory {
  id: SubcategoryId;
  parentDomain: string;
  name_en: string;
  name_uk: string;
  /** URL prefix for all hub pages in this subcategory */
  slugPrefix: string;
  isProgrammaticHub: boolean;
  /** Example child page slugs */
  exampleSlugs: string[];
}
