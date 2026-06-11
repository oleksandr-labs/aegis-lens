/**
 * Cold-start recommendations: persona-based defaults.
 *
 * Used when a user has no history (new account, anonymous session) or
 * when their feature store is empty.
 */

import type {
  PersonaTag,
  RecommendableItem,
  RecommendationModelType,
  RecommendationResult,
  ScoredItem,
  UserFeatureStore,
} from "./types";

// ── Persona defaults ──────────────────────────────────────────────────────────

export const PERSONA_DEFAULTS: Record<
  PersonaTag,
  { topTopics: string[]; topRegions: string[]; defaultLayers: string[] }
> = {
  journalist: {
    topTopics: ["conflict", "humanitarian", "politics", "media", "misinformation"],
    topRegions: ["UA-14", "UA-63", "UA-40", "UA-32"],
    defaultLayers: ["events", "reports", "press"],
  },
  researcher: {
    topTopics: ["analysis", "data", "history", "economics", "security"],
    topRegions: ["UA-14", "UA-63", "UA-26", "UA-71"],
    defaultLayers: ["datasets", "reports", "entities"],
  },
  ngo: {
    topTopics: ["humanitarian", "human-rights", "displacement", "aid", "healthcare"],
    topRegions: ["UA-14", "UA-63", "UA-05", "UA-46"],
    defaultLayers: ["events", "companies", "reports"],
  },
  government: {
    topTopics: ["policy", "security", "infrastructure", "sanctions", "diplomacy"],
    topRegions: ["UA-32", "UA-40", "UA-14", "UA-63"],
    defaultLayers: ["entities", "reports", "events"],
  },
  military: {
    topTopics: ["conflict", "logistics", "equipment", "movement", "threat"],
    topRegions: ["UA-14", "UA-63", "UA-09", "UA-23"],
    defaultLayers: ["events", "heatmap", "layers"],
  },
  investor: {
    topTopics: ["economics", "reconstruction", "sanctions", "supply-chain", "energy"],
    topRegions: ["UA-32", "UA-40", "UA-26", "UA-65"],
    defaultLayers: ["companies", "datasets", "trends"],
  },
  developer: {
    topTopics: ["api", "data", "tools", "integrations", "open-source"],
    topRegions: ["UA-32", "UA-40"],
    defaultLayers: ["tools", "datasets", "layers"],
  },
  general: {
    topTopics: ["conflict", "humanitarian", "politics", "news", "maps"],
    topRegions: ["UA-14", "UA-63", "UA-32", "UA-40"],
    defaultLayers: ["events", "reports", "layers"],
  },
};

// ── New-user detection ────────────────────────────────────────────────────────

/**
 * Returns true when the user has no meaningful activity history.
 * Cold-start recommendations should be used in this case.
 */
export function isNewUser(featureStore: UserFeatureStore | null): boolean {
  if (!featureStore) return true;
  return featureStore.recentFilters.length === 0 && featureStore.watchlists.length === 0;
}

// ── Cold-start recommendation builder ────────────────────────────────────────

/**
 * Build a synthetic item catalogue for cold-start based on persona defaults.
 * In production these would be fetched from the content index filtered by
 * the persona's preferred topics / regions + sorted by publishedAt.
 *
 * For now we produce well-typed placeholder items so the interface contract
 * is satisfied and callers can integrate with real data sources.
 */
function buildDefaultItems(
  persona: PersonaTag,
  locale: string,
  limit: number,
): RecommendableItem[] {
  const defaults = PERSONA_DEFAULTS[persona];
  const items: RecommendableItem[] = [];

  // Synthetic editorial items — one per top topic, capped at limit.
  for (let i = 0; i < Math.min(defaults.topTopics.length, limit); i++) {
    const topic = defaults.topTopics[i];
    const region = defaults.topRegions[i % defaults.topRegions.length];
    items.push({
      id: `cold-start:${persona}:${topic}:${i}`,
      type: "report",
      title: {
        en: `Editorial pick: ${topic}`,
        uk: locale === "uk" ? `Редакційний вибір: ${topic}` : undefined,
      },
      tags: [topic, persona],
      regions: [region],
      topics: [topic],
      publishedAt: new Date().toISOString(),
      relevanceScore: 1 - i * 0.05,
    });
  }

  return items;
}

/**
 * Generate cold-start recommendations for a persona.
 *
 * Applies a recency boost proportional to persona-topic priority (index 0
 * = highest) to produce a deterministic but sensible ordering for new users.
 */
export function getColdStartRecommendations(
  persona: PersonaTag,
  locale: string,
  limit: number,
): RecommendationResult {
  const effectiveLimit = Math.max(1, limit);
  const defaultItems = buildDefaultItems(persona, locale, effectiveLimit);
  const model: RecommendationModelType = "cold_start";

  const scoredItems: ScoredItem[] = defaultItems.map((item, index) => {
    // Decay score by rank position — top topic = highest score
    const positionScore = 1 - index / Math.max(defaultItems.length, 1);
    // Synthetic recency boost: newest item is always "just published"
    const recencyBoost = 0.3;
    const score = Math.min(1, positionScore + recencyBoost * (1 - index / Math.max(defaultItems.length, 1)));

    return {
      item,
      score,
      explanation: {
        reason_en: `Recommended for ${persona} based on your persona defaults`,
        reason_uk: `Рекомендовано для ${persona} на основі типових налаштувань вашого профілю`,
        signals: ["cold_start", `persona:${persona}`, `topic:${item.topics[0] ?? ""}`],
      },
    };
  });

  return {
    items: scoredItems.slice(0, effectiveLimit),
    model,
    generatedAt: new Date().toISOString(),
  };
}
