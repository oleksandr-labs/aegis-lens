/**
 * Marketplace — Analytics for plugin developers.
 *
 * Tracks install, uninstall, error, and usage events per plugin so developers
 * can understand adoption and diagnose issues via the developer dashboard.
 * All event types are strictly typed; PII is never stored in event payloads.
 *
 * Аналітика для розробників плагінів: встановлення, видалення, помилки, використання.
 * PII не зберігається в payload подій.
 */

// ── DevAnalyticsEvent ─────────────────────────────────────────────────────────

/**
 * Discriminated union of all trackable developer analytics event types.
 *
 * Дискримінований union усіх типів подій аналітики для розробників.
 */
export type DevAnalyticsEvent =
  | {
      type: "install";
      pluginId: string;
      /** Anonymised org identifier (hashed) — no raw org name */
      orgIdHash: string;
      installedAt: string;
    }
  | {
      type: "uninstall";
      pluginId: string;
      orgIdHash: string;
      uninstalledAt: string;
      /** Optional category of reason (user-facing enum, not free text) */
      reason?: "unused" | "replaced" | "error" | "other";
    }
  | {
      type: "error";
      pluginId: string;
      orgIdHash: string;
      errorCode: string;
      /** Sanitised error message — no user data, stack traces trimmed */
      errorMessage: string;
      occurredAt: string;
    }
  | {
      type: "usage";
      pluginId: string;
      orgIdHash: string;
      /** Feature or entry point exercised */
      featureKey: string;
      usedAt: string;
    };

// ── DevStats ──────────────────────────────────────────────────────────────────

/**
 * Aggregate statistics for a plugin, scoped to the requesting developer.
 *
 * Агрегована статистика плагіну для розробника.
 */
export interface DevStats {
  pluginId: string;
  /** Total active installs across all orgs */
  activeInstalls: number;
  /** Cumulative installs (including since-uninstalled) */
  totalInstalls: number;
  /** Cumulative uninstalls */
  totalUninstalls: number;
  /** Distinct orgs that have used this plugin in the last 30 days */
  activeOrgsLast30d: number;
  /** Total error events recorded */
  totalErrors: number;
  /**
   * Top 5 most-used feature keys with their counts.
   *
   * Топ-5 функцій за кількістю використань.
   */
  topFeatures: Array<{ featureKey: string; count: number }>;
  /** ISO 8601 timestamp of the last event received */
  lastEventAt: string | null;
}

// ── DeveloperAnalyticsStore ───────────────────────────────────────────────────

/**
 * In-memory store for developer analytics events.
 * In production, stream events to a time-series backend (ClickHouse, Tinybird, etc.)
 *
 * Сховище подій аналітики в пам'яті.
 * У проді — стримінг у time-series бекенд (ClickHouse, Tinybird тощо).
 */
export class DeveloperAnalyticsStore {
  /** pluginId → list of events */
  private readonly events = new Map<string, DevAnalyticsEvent[]>();
  /** pluginId → developerId (for authorization checks) */
  private readonly pluginOwners = new Map<string, string>();

  // ── Registration ───────────────────────────────────────────────────────────

  /** Register plugin ownership so getPluginStats can enforce access. */
  registerPlugin(pluginId: string, developerId: string): void {
    this.pluginOwners.set(pluginId, developerId);
  }

  // ── Ingestion ──────────────────────────────────────────────────────────────

  /**
   * Record an analytics event for a plugin.
   *
   * Записує подію аналітики для плагіну.
   */
  record(event: DevAnalyticsEvent): void {
    const list = this.events.get(event.pluginId) ?? [];
    list.push(event);
    this.events.set(event.pluginId, list);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  /**
   * Compute aggregate DevStats for a plugin.
   * Throws if developerId does not own pluginId.
   *
   * Обчислює DevStats для плагіну. Кидає помилку, якщо developerId не є власником.
   */
  getPluginStats(pluginId: string, developerId: string): DevStats {
    const owner = this.pluginOwners.get(pluginId);
    if (owner && owner !== developerId) {
      throw new Error(
        `[dev-analytics] Developer "${developerId}" does not own plugin "${pluginId}".`,
      );
    }

    const list = this.events.get(pluginId) ?? [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let totalInstalls = 0;
    let totalUninstalls = 0;
    let totalErrors = 0;
    const installedOrgs = new Set<string>();
    const uninstalledOrgs = new Set<string>();
    const recentOrgs = new Set<string>();
    const featureCounts = new Map<string, number>();
    let lastEventAt: string | null = null;

    for (const evt of list) {
      // Track last event timestamp
      const ts =
        evt.type === "install"
          ? evt.installedAt
          : evt.type === "uninstall"
          ? evt.uninstalledAt
          : evt.type === "error"
          ? evt.occurredAt
          : evt.usedAt;

      if (!lastEventAt || ts > lastEventAt) lastEventAt = ts;

      switch (evt.type) {
        case "install":
          totalInstalls++;
          installedOrgs.add(evt.orgIdHash);
          if (ts >= thirtyDaysAgo) recentOrgs.add(evt.orgIdHash);
          break;
        case "uninstall":
          totalUninstalls++;
          uninstalledOrgs.add(evt.orgIdHash);
          break;
        case "error":
          totalErrors++;
          break;
        case "usage":
          featureCounts.set(evt.featureKey, (featureCounts.get(evt.featureKey) ?? 0) + 1);
          if (ts >= thirtyDaysAgo) recentOrgs.add(evt.orgIdHash);
          break;
      }
    }

    const activeInstalls = installedOrgs.size - uninstalledOrgs.size;

    const topFeatures = Array.from(featureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([featureKey, count]) => ({ featureKey, count }));

    return {
      pluginId,
      activeInstalls: Math.max(0, activeInstalls),
      totalInstalls,
      totalUninstalls,
      activeOrgsLast30d: recentOrgs.size,
      totalErrors,
      topFeatures,
      lastEventAt,
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const developerAnalyticsStore = new DeveloperAnalyticsStore();
