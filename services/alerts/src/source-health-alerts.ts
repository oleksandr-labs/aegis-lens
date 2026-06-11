'use server';
/**
 * Source-health alerts: detect when a watched intelligence source goes silent,
 * degrades, or resumes. Emits SourceHealthEvent entries consumed by the alert router.
 *
 * Сповіщення про стан джерел: виявлення, коли спостережуване джерело розвідданих
 * замовкає, деградує або відновлює роботу.
 */

// ── Status ────────────────────────────────────────────────────────────────────

export type SourceHealthStatus = "active" | "degraded" | "silent" | "resumed";

// ── Event ─────────────────────────────────────────────────────────────────────

export interface SourceHealthEvent {
  /** Unique source identifier */
  sourceId: string;
  /** Human-readable source name */
  sourceName: string;
  /** Current health status */
  status: SourceHealthStatus;
  /** ISO timestamp of the most recent article/signal from this source */
  lastSeenAt: string;
  /** How long the source has been silent (minutes); 0 if still active */
  silenceDurationMin: number;
  /** User IDs who have this source on their watchlists */
  watchedByUserIds: string[];
}

// ── Silence thresholds ────────────────────────────────────────────────────────

/**
 * Silence duration thresholds (minutes) before an alert is triggered.
 *
 * Порогові значення тривалості мовчання (хвилини) перед спрацюванням сповіщення.
 */
export const SOURCE_SILENCE_THRESHOLDS: Record<"warning" | "critical", number> = {
  /** Warn when a source has been silent for ≥ 1 hour */
  warning: 60,
  /** Critical when silent for ≥ 4 hours */
  critical: 240,
};

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const SOURCE_HEALTH_NOTES_EN = [
  "Source-health alerts fire only for sources that appear on at least one user's watchlist.",
  `Warning threshold: ${SOURCE_SILENCE_THRESHOLDS.warning} min silence; critical threshold: ${SOURCE_SILENCE_THRESHOLDS.critical} min silence.`,
  "A 'resumed' event is emitted when a previously silent source publishes a new signal — suppresses further silence alerts.",
  "Silence is measured from the most recent ingested event timestamp, not wall-clock (accounts for ingestion lag up to 15 min).",
];

export const SOURCE_HEALTH_NOTES_UK = [
  "Сповіщення про стан джерел спрацьовують лише для джерел, що є хоча б в одному переліку спостереження.",
  `Порогове значення попередження: ${SOURCE_SILENCE_THRESHOLDS.warning} хв мовчання; критичне: ${SOURCE_SILENCE_THRESHOLDS.critical} хв мовчання.`,
  "Подія 'resumed' надсилається, коли раніше мовчазне джерело публікує новий сигнал — пригнічує подальші сповіщення про мовчання.",
  "Мовчання вимірюється від позначки часу останньої зібраної події, а не від системних годинника (враховується затримка збору до 15 хв).",
];

// ── Internal tracking entry ───────────────────────────────────────────────────

interface SourceTrackEntry {
  sourceName: string;
  lastSeenAt: string;
  watchedByUserIds: string[];
  /** Last emitted status so we can detect transitions */
  lastStatus: SourceHealthStatus;
}

// ── Monitor class ─────────────────────────────────────────────────────────────

/**
 * Tracks last-seen timestamps for sources and emits health events when
 * silence thresholds are crossed.
 *
 * Відстежує позначки часу останнього сигналу від джерел і надсилає події
 * про стан здоров'я при перевищенні порогів мовчання.
 */
export class SourceHealthMonitor {
  /** sourceId → tracking entry */
  private readonly sources = new Map<string, SourceTrackEntry>();

  /**
   * Update (or register) a source's last-seen timestamp.
   * Call this each time a new event is ingested from the source.
   */
  track(
    sourceId: string,
    lastSeenAt: string,
    opts?: { sourceName?: string; watchedByUserIds?: string[] },
  ): void {
    const existing = this.sources.get(sourceId);
    this.sources.set(sourceId, {
      sourceName: opts?.sourceName ?? existing?.sourceName ?? sourceId,
      lastSeenAt,
      watchedByUserIds:
        opts?.watchedByUserIds ?? existing?.watchedByUserIds ?? [],
      // If the source was silent/degraded and we just got a new signal, mark as resumed
      lastStatus:
        existing?.lastStatus === "silent" || existing?.lastStatus === "degraded"
          ? "resumed"
          : "active",
    });
  }

  /**
   * Update which users are watching a source (called when watchlists change).
   */
  setWatchers(sourceId: string, userIds: string[]): void {
    const existing = this.sources.get(sourceId);
    if (existing) {
      existing.watchedByUserIds = userIds;
    }
  }

  /**
   * Check all tracked sources and return health events for any that have
   * crossed a silence threshold or just resumed.
   * Call this on a schedule (e.g., every 5 minutes).
   *
   * Перевіряє всі відстежувані джерела та повертає події стану здоров'я.
   */
  checkAll(nowUtc?: string): SourceHealthEvent[] {
    const now = nowUtc ? new Date(nowUtc) : new Date();
    const events: SourceHealthEvent[] = [];

    for (const [sourceId, entry] of this.sources) {
      const lastSeen = new Date(entry.lastSeenAt);
      const silenceDurationMin = Math.floor(
        (now.getTime() - lastSeen.getTime()) / 60_000,
      );

      let status: SourceHealthStatus;
      if (entry.lastStatus === "resumed") {
        status = "resumed";
        entry.lastStatus = "active"; // reset after emitting once
      } else if (silenceDurationMin >= SOURCE_SILENCE_THRESHOLDS.critical) {
        status = "silent";
      } else if (silenceDurationMin >= SOURCE_SILENCE_THRESHOLDS.warning) {
        status = "degraded";
      } else {
        status = "active";
      }

      // Only emit events for non-active statuses, or status transitions
      if (status === "active" && entry.lastStatus === "active") continue;

      // Avoid re-emitting the same status repeatedly (only emit on transitions)
      if (status === entry.lastStatus && status !== "resumed") continue;

      entry.lastStatus = status;

      // Only emit for watched sources
      if (entry.watchedByUserIds.length === 0) continue;

      events.push({
        sourceId,
        sourceName: entry.sourceName,
        status,
        lastSeenAt: entry.lastSeenAt,
        silenceDurationMin,
        watchedByUserIds: [...entry.watchedByUserIds],
      });
    }

    return events;
  }

  /** List all registered sources and their current status */
  listSources(): Array<SourceTrackEntry & { sourceId: string }> {
    return [...this.sources.entries()].map(([sourceId, entry]) => ({
      sourceId,
      ...entry,
    }));
  }
}

/** Singleton source health monitor */
export const sourceHealthMonitor = new SourceHealthMonitor();
