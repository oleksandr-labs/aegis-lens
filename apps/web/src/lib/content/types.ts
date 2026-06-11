/**
 * Content Strategy — shared types
 * Ukrainian MAP / Aegis Lens
 */

export type ContentType =
  | "pillar"
  | "cluster"
  | "brief"
  | "editorial"
  | "methodology"
  | "reaction"
  | "yearinreview";

export type ContentLocale = "en" | "uk" | "pl" | "de";

export type ContentStatus = "draft" | "review" | "published" | "archived";

export type ContentClusterId =
  | "verification"
  | "geolocation"
  | "equipment_id"
  | "country_region"
  | "methodology";

export interface PillarPage {
  id: string;
  title: { en: string; uk?: string };
  slug: string;
  wordCountTarget: number;
  cluster: ContentClusterId;
  status: ContentStatus;
  primaryKeyword: string;
  lastReviewedAt?: string;
}

export interface ClusterPost {
  id: string;
  pillarId: string;
  title: string;
  slug: string;
  type: "cluster";
  publishedAt?: string;
  locale: ContentLocale;
  internalLinks: string[];
  status: ContentStatus;
}

export interface EditorialCalendarItem {
  id: string;
  title: string;
  type: ContentType;
  scheduledFor: string;
  locale: ContentLocale;
  assignedTo?: string;
  status: ContentStatus;
  pillarId?: string;
}
