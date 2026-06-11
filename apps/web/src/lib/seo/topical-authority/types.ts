/**
 * Topical Authority Strategy — shared types
 * Ukrainian MAP / Aegis Lens
 */

import type { ContentClusterId } from "../../content/types";

export interface ClusterKpi {
  clusterId: ContentClusterId;
  /** 0–1 fraction of total organic search clicks in this cluster's topic area */
  organicShareOfVoice: number;
  /** Total published posts in this cluster */
  postCount: number;
  /** Average number of keywords ranked across all posts in the cluster */
  avgRankedKeywords: number;
  /** Sub-topic slugs/titles already covered by published content */
  coveredSubtopics: string[];
  /** Sub-topic slugs/titles identified but not yet covered */
  missingSubtopics: string[];
  /** ISO 8601 date of the last coverage audit */
  lastAuditedAt: string;
}

export interface AuthorEeat {
  authorId: string;
  name: string;
  /** Clusters this author is the designated topical authority for */
  clusters: ContentClusterId[];
  /** Credentials establishing expertise (degrees, certifications, roles) */
  credentials: string[];
  /** URLs of published bylines demonstrating expertise */
  bylines: string[];
  linkedIn?: string;
}

export interface ClusterRefreshPolicy {
  clusterId: ContentClusterId;
  /** How often to schedule a full cluster review (days) */
  reviewIntervalDays: number;
  /** Age in days after which a post is flagged as potentially stale */
  staleThresholdDays: number;
  /** Whether to automatically surface stale posts in the content queue */
  autoFlagStale: boolean;
}
