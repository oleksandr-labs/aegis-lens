/**
 * Explainability layer — "why am I seeing this?"
 *
 * Generates human-readable explanations in English and Ukrainian for each
 * recommendation signal type.
 */

import type {
  RecommendableItem,
  RecommendationExplanation,
  UserFeatureStore,
} from "./types";

// ── Signal types ──────────────────────────────────────────────────────────────

export type SignalType =
  | "region_match"
  | "topic_match"
  | "recent_activity"
  | "popular_in_cohort"
  | "editorial_boost";

// ── Templates ─────────────────────────────────────────────────────────────────

/**
 * Explanation templates per signal type.
 *
 * Templates may include placeholder tokens:
 *   {region}  — matched region name / code
 *   {topic}   — matched topic label
 *   {persona} — user persona
 */
export const EXPLANATION_TEMPLATES: Record<
  SignalType,
  { en: string; uk: string }
> = {
  region_match: {
    en: "Recommended because you watch {region}",
    uk: "Рекомендовано, бо ви стежите за {region}",
  },
  topic_match: {
    en: "Recommended because you follow the topic: {topic}",
    uk: "Рекомендовано, бо ви стежите за темою: {topic}",
  },
  recent_activity: {
    en: "Based on your recent activity",
    uk: "На основі вашої нещодавньої активності",
  },
  popular_in_cohort: {
    en: "Popular among {persona} users right now",
    uk: "Популярно серед користувачів типу «{persona}» прямо зараз",
  },
  editorial_boost: {
    en: "Highlighted by our editorial team",
    uk: "Виділено редакційною командою",
  },
};

// ── Template rendering ────────────────────────────────────────────────────────

function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

// ── Explanation builder ───────────────────────────────────────────────────────

/**
 * Build a human-readable explanation for a scored recommendation.
 *
 * Priority:
 *   1. region_match  — if user watches a region that overlaps the item
 *   2. topic_match   — if user follows a topic that overlaps the item
 *   3. recent_activity — if user recently interacted with similar items
 *   4. popular_in_cohort — fallback with persona
 *   5. editorial_boost — if "editorial_boost" is in signals
 */
export function buildExplanation(
  item: RecommendableItem,
  featureStore: UserFeatureStore | null,
  signals: string[],
): RecommendationExplanation {
  const vars: Record<string, string> = {
    persona: featureStore?.persona ?? "general",
  };

  // Determine dominant signal type
  let dominantSignal: SignalType = "popular_in_cohort";

  if (signals.includes("editorial_boost")) {
    dominantSignal = "editorial_boost";
  } else if (featureStore) {
    // region_match: find first overlapping region
    const matchedRegion = item.regions.find((r) =>
      featureStore.regionAffinity.includes(r) || featureStore.watchlists.includes(r),
    );
    if (matchedRegion) {
      dominantSignal = "region_match";
      vars.region = matchedRegion;
    } else {
      // topic_match: find first overlapping topic
      const matchedTopic = item.topics.find((t) =>
        featureStore.topicAffinity.includes(t) ||
        featureStore.recentFilters.some((f) => f.includes(t)),
      );
      if (matchedTopic) {
        dominantSignal = "topic_match";
        vars.topic = matchedTopic;
      } else if (featureStore.recentItemIds.length > 0) {
        dominantSignal = "recent_activity";
      }
    }
  }

  const template = EXPLANATION_TEMPLATES[dominantSignal];

  // Collect all active signals for transparency
  const allSignals: string[] = [dominantSignal, ...signals.filter((s) => s !== dominantSignal)];

  return {
    reason_en: renderTemplate(template.en, vars),
    reason_uk: renderTemplate(template.uk, vars),
    signals: allSignals,
  };
}
