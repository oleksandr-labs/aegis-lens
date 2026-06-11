'use server';
/**
 * Per-user alert channel preferences.
 * Controls which channels are active, minimum priority filter, and quiet-hour overrides.
 *
 * Налаштування каналів сповіщень для кожного користувача.
 * Керує тим, які канали активні, мінімальним фільтром пріоритету та перевизначеннями тихих годин.
 */

import type { AlertChannel, AlertPriority } from "./types";

// ── Channel preference ────────────────────────────────────────────────────────

export interface ChannelPreference {
  /** The delivery channel this preference applies to */
  channel: AlertChannel;
  /** Whether this channel is enabled for the user */
  enabled: boolean;
  /**
   * Minimum priority required to deliver via this channel.
   * e.g. minPriority='high' means only 'high' and 'critical' alerts are sent.
   */
  minPriority: AlertPriority;
}

// ── User channel preferences ──────────────────────────────────────────────────

export interface UserChannelPreferences {
  userId: string;
  preferences: ChannelPreference[];
  /**
   * Override quiet hours for the user across all channels.
   * Format: "HH:MM-HH:MM" in UTC, e.g. "22:00-07:00".
   * When set, this overrides any per-rule quiet_hours setting.
   */
  quietHoursOverride?: string;
  /** ISO-8601 timestamp of last update */
  updatedAt: string;
}

// ── Priority ordering ─────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<AlertPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ── Defaults ──────────────────────────────────────────────────────────────────

/** All channels enabled, minimum priority = 'medium' */
export const DEFAULT_PREFERENCES: ChannelPreference[] = [
  { channel: "in_app",   enabled: true, minPriority: "low" },
  { channel: "web_push", enabled: true, minPriority: "medium" },
  { channel: "email",    enabled: true, minPriority: "medium" },
  { channel: "telegram", enabled: true, minPriority: "medium" },
  { channel: "slack",    enabled: true, minPriority: "medium" },
  { channel: "webhook",  enabled: true, minPriority: "medium" },
  { channel: "sms",      enabled: true, minPriority: "high" },
];

// ── Filter helper ─────────────────────────────────────────────────────────────

/**
 * Given a list of target channels, a user's preferences, and the current alert priority,
 * returns only the channels that are enabled and meet the minimum priority filter.
 *
 * Повертає лише ті канали, які увімкнено та відповідають мінімальному фільтру пріоритету.
 */
export function filterChannelsByPreferences(
  channels: AlertChannel[],
  prefs: UserChannelPreferences,
  priority: AlertPriority,
): AlertChannel[] {
  const prefMap = new Map<AlertChannel, ChannelPreference>(
    prefs.preferences.map((p) => [p.channel, p]),
  );

  return channels.filter((ch) => {
    const pref = prefMap.get(ch);
    if (!pref) {
      // No preference set — use default
      const defaultPref = DEFAULT_PREFERENCES.find((d) => d.channel === ch);
      if (!defaultPref || !defaultPref.enabled) return false;
      return PRIORITY_ORDER[priority] >= PRIORITY_ORDER[defaultPref.minPriority];
    }
    if (!pref.enabled) return false;
    return PRIORITY_ORDER[priority] >= PRIORITY_ORDER[pref.minPriority];
  });
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory preferences store keyed by userId.
 * In production: persist to database.
 *
 * Сховище налаштувань у пам'яті, індексоване за userId.
 * У продакшені: зберігати в базі даних.
 */
export class PreferencesStore {
  private readonly store = new Map<string, UserChannelPreferences>();

  /** Get preferences for a user; returns defaults if not set */
  get(userId: string): UserChannelPreferences {
    return (
      this.store.get(userId) ?? {
        userId,
        preferences: [...DEFAULT_PREFERENCES],
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /** Set or replace preferences for a user */
  set(prefs: UserChannelPreferences): void {
    this.store.set(prefs.userId, {
      ...prefs,
      updatedAt: new Date().toISOString(),
    });
  }

  /** Update individual channel preferences (merge, not replace) */
  updateChannel(
    userId: string,
    channelUpdate: Partial<ChannelPreference> & { channel: AlertChannel },
  ): UserChannelPreferences {
    const current = this.get(userId);
    const idx = current.preferences.findIndex(
      (p) => p.channel === channelUpdate.channel,
    );
    if (idx >= 0) {
      current.preferences[idx] = { ...current.preferences[idx], ...channelUpdate };
    } else {
      const defaultPref = DEFAULT_PREFERENCES.find(
        (d) => d.channel === channelUpdate.channel,
      );
      current.preferences.push({
        ...(defaultPref ?? { channel: channelUpdate.channel, enabled: true, minPriority: "medium" }),
        ...channelUpdate,
      });
    }
    current.updatedAt = new Date().toISOString();
    this.store.set(userId, current);
    return current;
  }

  /** Delete stored preferences (resets to defaults) */
  delete(userId: string): void {
    this.store.delete(userId);
  }

  /** List all users with stored preferences */
  listUserIds(): string[] {
    return [...this.store.keys()];
  }
}

/** Singleton preferences store */
export const preferencesStore = new PreferencesStore();
