/**
 * Sound preferences store — localStorage-backed, SSR-safe.
 * Used to persist per-user audio preferences across sessions.
 */

import type { UserSoundPreferences } from "./sound-design";
import { SOUND_DEFAULTS } from "./sound-design";

const STORAGE_KEY_PREFIX = "aegis:sound:";

function defaultPreferences(): UserSoundPreferences {
  return {
    masterEnabled: SOUND_DEFAULTS.masterEnabled,
    masterVolume: SOUND_DEFAULTS.masterVolume,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    perEventOverrides: { ...SOUND_DEFAULTS.perEventEnabled },
  };
}

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export class SoundPreferencesStore {
  get(userId: string): UserSoundPreferences {
    if (typeof window === "undefined") {
      return defaultPreferences();
    }
    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      if (!raw) return defaultPreferences();
      const parsed = JSON.parse(raw) as Partial<UserSoundPreferences>;
      return { ...defaultPreferences(), ...parsed };
    } catch {
      return defaultPreferences();
    }
  }

  set(userId: string, prefs: Partial<UserSoundPreferences>): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.get(userId);
      const merged: UserSoundPreferences = {
        ...current,
        ...prefs,
        perEventOverrides: {
          ...current.perEventOverrides,
          ...(prefs.perEventOverrides ?? {}),
        },
      };
      window.localStorage.setItem(storageKey(userId), JSON.stringify(merged));
    } catch {
      // Silently fail — storage quota or private mode
    }
  }

  reset(userId: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey(userId));
    } catch {
      // Silently fail
    }
  }
}

export const soundPreferencesStore = new SoundPreferencesStore();

/**
 * Returns true if the current local time falls within the user's quiet hours window.
 * Handles overnight windows (e.g. 22:00 → 08:00).
 */
export function isQuietHours(prefs: UserSoundPreferences): boolean {
  if (!prefs.quietHoursEnabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = prefs.quietHoursStart.split(":").map(Number);
  const [endH, endM] = prefs.quietHoursEnd.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Same-day window (e.g. 09:00 → 17:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight window (e.g. 22:00 → 08:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}
