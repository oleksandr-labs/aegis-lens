'use server';

/**
 * Per-user content preferences store (server-side, in-memory).
 *
 * Persists user choices about blur, warnings, and autoplay defaults.
 * Replace the in-memory Map with a DB-backed adapter when persistent
 * storage is required.
 */

import type { UserContentPreferences } from "./types";

// ── Default safe preferences ──────────────────────────────────────────────────

export const DEFAULT_USER_PREFERENCES: UserContentPreferences = {
  userId: "__default__",
  showWarnings: true,
  blurGraphicMedia: true,
  autoplayEnabled: false,
  autoSoundEnabled: false,
};

// ── Store class ───────────────────────────────────────────────────────────────

export class UserPreferencesStore {
  private readonly store = new Map<string, UserContentPreferences>();

  /**
   * Persist a partial preferences update for a user.
   * Fields not supplied fall back to the current stored value,
   * which in turn falls back to DEFAULT_USER_PREFERENCES.
   */
  setPreferences(userId: string, prefs: Partial<UserContentPreferences>): void {
    const current = this.getPreferences(userId);
    this.store.set(userId, {
      ...current,
      ...prefs,
      // Trauma-informed: autoplay and sound are always off — cannot be overridden.
      userId,
      autoplayEnabled: false,
      autoSoundEnabled: false,
    });
  }

  /**
   * Return stored preferences for a user, or safe defaults if none are set.
   */
  getPreferences(userId: string): UserContentPreferences {
    return this.store.get(userId) ?? { ...DEFAULT_USER_PREFERENCES, userId };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const userPreferencesStore = new UserPreferencesStore();
