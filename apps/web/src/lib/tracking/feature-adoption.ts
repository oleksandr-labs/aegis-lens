/**
 * Feature adoption tracking — per-feature usage events, adoption rates,
 * retention contribution, persona breakdown, and deprecation signals.
 *
 * Відстеження прийняття функцій — події використання, показники прийняття,
 * вплив на утримання, розбивка за персоною та сигнали для виведення з використання.
 *
 * Source: TODO/product_analytics/TODO_feature_adoption.md
 */

// ── Core interfaces ───────────────────────────────────────────────────────

export interface FeatureAdoptionEvent {
  featureId: string;
  userId: string;
  action: "first_use" | "return_use" | "churned";
  persona: string;
  locale: string;
  timestamp: string; // ISO 8601
}

export interface FeatureAdoptionMetrics {
  featureId: string;
  adoptionRatePct: number;
  mauUsing: number;
  retentionContribution: number;
  primaryPersona: string;
  deprecationCandidate: boolean;
  owner: string;
}

// ── Feature event taxonomy ────────────────────────────────────────────────

/**
 * Maps each featureId to the set of trackable actions for that feature.
 * Extend as new features ship.
 *
 * Відповідає кожному featureId набору відстежуваних дій.
 */
export const FEATURE_EVENT_TAXONOMY: Record<string, string[]> = {
  "map-workspace": [
    "workspace_opened",
    "layer_toggled",
    "viewport_saved",
    "workspace_shared",
  ],
  "ai-copilot": [
    "copilot_opened",
    "copilot_query_sent",
    "copilot_result_copied",
    "copilot_feedback_given",
  ],
  "advanced-filters": [
    "filter_panel_opened",
    "filter_applied",
    "filter_saved",
    "filter_shared",
  ],
  "export-pdf": [
    "export_initiated",
    "export_completed",
    "export_downloaded",
  ],
  "alert-rules": [
    "alert_rule_created",
    "alert_triggered",
    "alert_acknowledged",
    "alert_deleted",
  ],
  "case-files": [
    "case_created",
    "case_evidence_added",
    "case_shared",
    "case_exported",
  ],
  "api-access": [
    "api_key_created",
    "api_first_call",
    "api_quota_checked",
    "api_docs_viewed",
  ],
  "aoi-monitoring": [
    "aoi_drawn",
    "aoi_saved",
    "aoi_alert_configured",
    "aoi_deleted",
  ],
};

// ── Deprecation threshold ─────────────────────────────────────────────────

/**
 * If fewer than 5% of MAU are using a feature, flag it as a deprecation candidate.
 *
 * Якщо менше 5% MAU використовують функцію — позначити як кандидата на вивід.
 */
export const DEPRECATION_THRESHOLD_PCT = 5;

// ── Feature adoption ops & notes ──────────────────────────────────────────

export const FEATURE_ADOPTION_OPS = {
  perFeatureOwnerAccountability: true,
  perFeatureUsageDashboard: true,
  sunsettingRequiresBraveDecision: true,
} as const;

export const FEATURE_ADOPTION_NOTE_EN =
  "A feature nobody uses is technical debt. Sunset bravely.";

export const FEATURE_ADOPTION_NOTE_UK =
  "Фіча, якою ніхто не користується — технічний борг. Виводьте сміливо.";

// ── In-memory feature adoption store ─────────────────────────────────────

const MAX_TOTAL_EVENTS = 10000;

export class FeatureAdoptionStore {
  private readonly _events: Map<string, FeatureAdoptionEvent[]> = new Map();
  private _totalCount = 0;

  recordEvent(event: FeatureAdoptionEvent): void {
    if (this._totalCount >= MAX_TOTAL_EVENTS) {
      // Evict oldest entry from the first non-empty bucket
      for (const [key, bucket] of this._events) {
        if (bucket.length > 0) {
          bucket.shift();
          this._totalCount -= 1;
          if (bucket.length === 0) this._events.delete(key);
          break;
        }
      }
    }
    const bucket = this._events.get(event.featureId) ?? [];
    bucket.push(event);
    this._events.set(event.featureId, bucket);
    this._totalCount += 1;
  }

  /** Returns adoption rate (%) for a feature given total MAU count */
  getAdoptionRate(featureId: string, totalMau: number): number {
    if (totalMau <= 0) return 0;
    const bucket = this._events.get(featureId) ?? [];
    const uniqueUsers = new Set(bucket.map((e) => e.userId)).size;
    return Math.round((uniqueUsers / totalMau) * 100 * 100) / 100;
  }

  /** Returns true if adoption is below the deprecation threshold */
  isDeprecationCandidate(featureId: string, totalMau: number): boolean {
    return this.getAdoptionRate(featureId, totalMau) < DEPRECATION_THRESHOLD_PCT;
  }

  /** Returns all events for a feature filtered by persona */
  getByPersona(featureId: string, persona: string): FeatureAdoptionEvent[] {
    const bucket = this._events.get(featureId) ?? [];
    return bucket.filter((e) => e.persona === persona);
  }

  /** Exports summary metrics for all tracked features */
  exportDashboardData(totalMau: number): FeatureAdoptionMetrics[] {
    const results: FeatureAdoptionMetrics[] = [];
    for (const [featureId, bucket] of this._events) {
      const adoptionRatePct = this.getAdoptionRate(featureId, totalMau);
      const uniqueUsers = new Set(bucket.map((e) => e.userId)).size;

      // Derive primary persona by frequency
      const personaCounts: Record<string, number> = {};
      for (const e of bucket) {
        personaCounts[e.persona] = (personaCounts[e.persona] ?? 0) + 1;
      }
      const primaryPersona =
        Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";

      // Retention contribution: ratio of return_use events to all events
      const returnEvents = bucket.filter((e) => e.action === "return_use").length;
      const retentionContribution =
        bucket.length > 0 ? Math.round((returnEvents / bucket.length) * 100 * 100) / 100 : 0;

      results.push({
        featureId,
        adoptionRatePct,
        mauUsing: uniqueUsers,
        retentionContribution,
        primaryPersona,
        deprecationCandidate: adoptionRatePct < DEPRECATION_THRESHOLD_PCT,
        owner: "unassigned", // set via feature registry in production
      });
    }
    return results;
  }
}

/** Singleton instance for application-wide feature adoption tracking */
export const featureAdoptionStore = new FeatureAdoptionStore();
