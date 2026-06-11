export type MisinfoFlag =
  | "recycled_media"
  | "location_contradiction"
  | "temporal_contradiction"
  | "narrative_cluster"
  | "coordinated_behavior"
  | "low_source_reputation";

export interface MisinfoSignal {
  flag: MisinfoFlag;
  confidence: number;
  explanation: string;
  sourceIds?: string[];
}

export interface DisputedBadge {
  eventId: string;
  signals: MisinfoSignal[];
  /** Aggregate suspicion score 0–1 */
  suspicionScore: number;
  /** Human-readable caveat shown to users */
  caveatText: { en: string; uk?: string };
  requiresHumanReview: boolean;
  humanReviewStatus?: "pending" | "cleared" | "confirmed_misinfo";
  createdAt: string;
}

export interface NarrativeCluster {
  id: string;
  label: string;
  /** Embedding centroid of cluster members */
  centroid: number[];
  memberIds: string[];
  firstSeenAt: string;
  lastActiveAt: string;
  sourceCounts: Record<string, number>;
  /** Propagation velocity: new members per hour */
  velocity: number;
}

export interface SourceReputation {
  sourceId: string;
  score: number;
  totalEvents: number;
  verifiedEvents: number;
  retractedEvents: number;
  disputedEvents: number;
  verificationYield: number;
  lastUpdatedAt: string;
}
