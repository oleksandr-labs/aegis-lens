/**
 * Core types for the Recommendation Engine.
 *
 * Used by cold-start, scoring, explainability, editorial-overrides,
 * opt-out, and per-surface-metrics modules.
 */

// ── Persona ───────────────────────────────────────────────────────────────────

export type PersonaTag =
  | "journalist"
  | "researcher"
  | "ngo"
  | "government"
  | "military"
  | "investor"
  | "developer"
  | "general";

// ── Surface / context ─────────────────────────────────────────────────────────

export type RecommendationContext =
  | "home_feed"
  | "event_inspector"
  | "dashboard"
  | "sidebar"
  | "email";

// ── Model type ────────────────────────────────────────────────────────────────

export type RecommendationModelType =
  | "cold_start"
  | "collaborative"
  | "embedding_similarity"
  | "hybrid";

// ── Item ──────────────────────────────────────────────────────────────────────

export interface RecommendableItem {
  id: string;
  type: "event" | "tool" | "company" | "report" | "person" | "region" | "layer";
  title: { en: string; uk?: string };
  tags: string[];
  regions: string[];
  topics: string[];
  publishedAt?: string;
  relevanceScore?: number;
}

// ── User feature store ────────────────────────────────────────────────────────

export interface UserFeatureStore {
  userId: string;
  recentFilters: string[];
  watchlists: string[];
  persona: PersonaTag;
  regionAffinity: string[];
  topicAffinity: string[];
  recentItemIds: string[];
  lastActiveAt: string;
}

// ── Request / result ──────────────────────────────────────────────────────────

export interface RecommendationRequest {
  userId?: string;
  persona: PersonaTag;
  context: RecommendationContext;
  locale: string;
  limit?: number;
  excludeIds?: string[];
}

export interface RecommendationExplanation {
  reason_en: string;
  reason_uk: string;
  signals: string[];
}

export interface ScoredItem {
  item: RecommendableItem;
  score: number;
  explanation: RecommendationExplanation;
}

export interface RecommendationResult {
  items: ScoredItem[];
  model: RecommendationModelType;
  generatedAt: string;
}
