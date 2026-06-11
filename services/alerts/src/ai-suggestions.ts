'use server';
/**
 * AI-suggested alert rules based on anomaly signals and user watchlists.
 * Produces AlertRule candidates that users can review, accept, or dismiss.
 *
 * AI-запропоновані правила сповіщень на основі сигналів аномалій та переліків спостереження користувача.
 * Генерує кандидатів AlertRule, які користувач може переглянути, прийняти або відхилити.
 */

import type { AlertRule } from "./types";

// ── Watchlist reference ───────────────────────────────────────────────────────

export interface WatchlistRef {
  /** Unique watchlist identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Entity IDs being watched (actors, units, facilities) */
  entityIds: string[];
  /** ISO 3166-1 alpha-2 region codes being watched */
  regionCodes: string[];
}

// ── Anomaly signal ────────────────────────────────────────────────────────────

export interface AnomalySignal {
  signalId: string;
  /** Event class that spiked */
  event_class: string;
  /** Affected region codes */
  regionCodes: string[];
  /** Affected entity IDs */
  entityIds: string[];
  /** Signal strength 0–1 */
  strength: number;
  /** ISO timestamp when signal was detected */
  detectedAt: string;
  /** "anomaly" = statistical outlier; "spike" = volume surge; "silence" = source went quiet */
  signalType: "anomaly" | "spike" | "silence";
}

// ── AI suggestion rule (extends AlertRule concept) ────────────────────────────

export type AISuggestionType =
  | "anomaly"
  | "watchlist_relevance"
  | "topic_spike";

export interface AISuggestionRule {
  /** Proposed AlertRule candidate */
  rule: Omit<AlertRule, "created_at" | "updated_at">;
  /** How this suggestion was generated */
  suggestion_type: AISuggestionType;
  /** Confidence 0–1 that this rule is relevant to the user */
  confidence: number;
  /** Which watchlist triggered this suggestion (if any) */
  watchlistId: string | undefined;
  /** Human-readable rationale for the suggestion */
  rationale_en: string;
  rationale_uk: string;
  /** ISO timestamp — when the AI generated this suggestion */
  generatedAt: string;
  /** Has the user dismissed this suggestion */
  dismissed: boolean;
}

// ── Confidence threshold ──────────────────────────────────────────────────────

/** Minimum model confidence required before an AI suggestion is surfaced to the user */
export const SUGGESTION_CONFIDENCE_THRESHOLD = 0.75;

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Build an AlertRule candidate from a watchlist and an anomaly signal.
 * The resulting rule is scoped to the intersection of watchlist entities/regions
 * and the anomaly's affected scope.
 *
 * Будує кандидат AlertRule з переліку спостереження та сигналу аномалії.
 */
export function buildAISuggestedRule(
  watchlist: WatchlistRef,
  signal: AnomalySignal,
  userId: string,
  orgId?: string,
): AISuggestionRule {
  // Determine suggestion type
  const suggestion_type: AISuggestionType =
    signal.signalType === "spike"
      ? "topic_spike"
      : signal.entityIds.some((id) => watchlist.entityIds.includes(id)) ||
        signal.regionCodes.some((r) => watchlist.regionCodes.includes(r))
      ? "watchlist_relevance"
      : "anomaly";

  const confidence = Math.min(0.99, signal.strength * 1.1);

  const ruleId = `ai-suggested-${Date.now()}-${signal.signalId}`;

  const rule: Omit<AlertRule, "created_at" | "updated_at"> = {
    rule_id: ruleId,
    user_id: userId,
    org_id: orgId,
    name: `AI: ${signal.event_class} in ${watchlist.name}`,
    condition: {
      event_class: signal.event_class,
      ...(signal.regionCodes.length > 0 && {
        geo_filter: {
          type: "bbox",
        },
      }),
      min_confidence: 0.6,
    },
    channels: ["in_app", "email"],
    priority: signal.strength >= 0.9 ? "critical" : signal.strength >= 0.7 ? "high" : "medium",
    schedule: {
      quiet_hours: undefined,
      critical_override: true,
      digest_mode: "immediate",
    },
    dedup_window_s: 300,
    max_per_hour: 20,
    enabled: false, // user must explicitly enable AI-suggested rules
  };

  const rationale_en =
    `Anomaly detected in "${watchlist.name}": ${signal.event_class} ` +
    `activity ${signal.signalType === "spike" ? "spike" : "anomaly"} ` +
    `(strength ${Math.round(signal.strength * 100)}%) on ${signal.detectedAt.slice(0, 10)}.`;

  const rationale_uk =
    `Виявлено аномалію у "${watchlist.name}": ` +
    `${signal.signalType === "spike" ? "сплеск" : "аномалія"} активності ${signal.event_class} ` +
    `(сила ${Math.round(signal.strength * 100)}%) від ${signal.detectedAt.slice(0, 10)}.`;

  return {
    rule,
    suggestion_type,
    confidence,
    watchlistId: watchlist.id,
    rationale_en,
    rationale_uk,
    generatedAt: new Date().toISOString(),
    dismissed: false,
  };
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const AI_SUGGESTION_NOTES_EN = [
  "AI-suggested rules are gated behind your watchlists — only topics/regions you actively monitor are considered.",
  "Suggestions are generated by a statistical anomaly model; they reflect signal strength, not certainty.",
  "You can dismiss any suggestion permanently — dismissed rules will not reappear for the same signal.",
  "AI suggestions are rate-limited: at most 5 new suggestions per user per 24 hours to prevent alert fatigue.",
  "No personally identifiable information is shared with the suggestion model; only event metadata and watchlist scope are used.",
];

export const AI_SUGGESTION_NOTES_UK = [
  "AI-запропоновані правила прив'язані до ваших переліків спостереження — розглядаються лише теми/регіони, які ви активно відстежуєте.",
  "Пропозиції генеруються статистичною моделлю аномалій; вони відображають силу сигналу, а не впевненість.",
  "Ви можете назавжди відхилити будь-яку пропозицію — відхилені правила не з'являться знову для того самого сигналу.",
  "AI-пропозиції мають обмеження частоти: не більше 5 нових пропозицій на користувача за 24 години для запобігання перевантаженню сповіщеннями.",
  "Жодна особиста ідентифікаційна інформація не передається моделі пропозицій; використовуються лише метадані подій та область переліку спостереження.",
];

// ── Engine ────────────────────────────────────────────────────────────────────

/**
 * Generates AI-suggested alert rule candidates for a user.
 * Filters suggestions below SUGGESTION_CONFIDENCE_THRESHOLD.
 *
 * Генерує кандидатів на AI-запропоновані правила для користувача.
 */
export class AISuggestionEngine {
  /** suggestionId → AISuggestionRule */
  private readonly store = new Map<string, AISuggestionRule>();
  /** userId → Set of dismissed rule_ids */
  private readonly dismissed = new Map<string, Set<string>>();

  /**
   * Generate suggestions for a user based on their watchlists and recent anomalies.
   * Returns only suggestions above the confidence threshold and not previously dismissed.
   */
  suggest(
    userId: string,
    watchlists: WatchlistRef[],
    recentAnomalies: AnomalySignal[],
    orgId?: string,
  ): AISuggestionRule[] {
    const userDismissed = this.dismissed.get(userId) ?? new Set<string>();
    const suggestions: AISuggestionRule[] = [];

    for (const signal of recentAnomalies) {
      for (const watchlist of watchlists) {
        // Check overlap between signal and watchlist scope
        const regionOverlap = signal.regionCodes.some((r) =>
          watchlist.regionCodes.includes(r),
        );
        const entityOverlap = signal.entityIds.some((e) =>
          watchlist.entityIds.includes(e),
        );

        if (!regionOverlap && !entityOverlap) continue;

        const candidate = buildAISuggestedRule(watchlist, signal, userId, orgId);

        if (candidate.confidence < SUGGESTION_CONFIDENCE_THRESHOLD) continue;
        if (userDismissed.has(candidate.rule.rule_id)) continue;

        this.store.set(candidate.rule.rule_id, candidate);
        suggestions.push(candidate);
      }
    }

    // Rate-limit: return at most 5 per call
    return suggestions.slice(0, 5);
  }

  /** Dismiss a suggestion for a user — it will not be shown again */
  dismiss(userId: string, ruleId: string): void {
    const set = this.dismissed.get(userId) ?? new Set<string>();
    set.add(ruleId);
    this.dismissed.set(userId, set);

    const suggestion = this.store.get(ruleId);
    if (suggestion) {
      suggestion.dismissed = true;
      this.store.set(ruleId, suggestion);
    }
  }

  /** Get all active (non-dismissed) suggestions for a user */
  getSuggestionsForUser(userId: string): AISuggestionRule[] {
    return [...this.store.values()].filter(
      (s) => s.rule.user_id === userId && !s.dismissed,
    );
  }
}

/** Singleton AI suggestion engine */
export const aiSuggestionEngine = new AISuggestionEngine();
