/**
 * Sound policy — distinct, opt-in alert audio with a hard no-autoplay invariant.
 *
 * Task: "Sound: distinct + opt-in (no auto-play)" (TODO_civilian_alerts.md).
 *
 * HIGHEST-STAKES invariant (see brief): the platform NEVER auto-plays sound.
 * Audio only ever fires after an explicit, persisted user opt-in captured during
 * a user gesture (browsers also block autoplay until a gesture — this policy
 * makes that a product rule, not an accident of the browser). This module is
 * the single source of truth for "may we play a sound for this alert?".
 */

import type { AlertType } from "./types";

/** Severity buckets we map distinct sounds to. */
export type SoundSeverity = "info" | "warning" | "critical";

/** Per-alert-type severity bucket. */
const TYPE_TO_SOUND_SEVERITY: Record<AlertType, SoundSeverity> = {
  air_raid: "critical",
  artillery: "critical",
  urban_fighting: "critical",
  chemical: "critical",
  nuclear: "critical",
  radiological: "critical",
  info: "info",
};

/** Distinct audio asset per severity — distinct so users can tell them apart. */
export const SOUND_ASSETS: Record<SoundSeverity, string> = {
  info: "/sounds/alert-info.mp3",
  warning: "/sounds/alert-warning.mp3",
  critical: "/sounds/alert-air-raid.mp3",
};

/**
 * User opt-in configuration. Defaults are deliberately SILENT — nothing plays
 * until the user turns it on. `enabled: false` is the safe default.
 */
export interface SoundPreferences {
  /** Master switch. MUST default to false. */
  enabled: boolean;
  /** Per-severity gate — lets a user enable critical only, etc. */
  severities: Record<SoundSeverity, boolean>;
  /** 0..1 volume. */
  volume: number;
  /** Quiet hours [startHour, endHour) in local time, e.g. [23, 7]. */
  quietHours?: [number, number];
  /**
   * Proof the user opted in during a real gesture. Without this we refuse to
   * play even if `enabled` is true — guards against programmatic enabling.
   */
  consentGestureAt?: string;
}

/** The safe default: completely silent, nothing pre-enabled. */
export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  enabled: false,
  severities: { info: false, warning: false, critical: false },
  volume: 0.8,
  quietHours: undefined,
  consentGestureAt: undefined,
};

/**
 * INVARIANT helper — there is no codepath that returns a sound without an
 * explicit opt-in. This constant documents that auto-play is never permitted.
 */
export const NEVER_AUTOPLAY = true as const;

export interface SoundDecision {
  /** Whether the client is permitted to play a sound for this alert. */
  play: boolean;
  /** Asset to play (only meaningful when play === true). */
  asset?: string;
  volume?: number;
  /** Why a sound was suppressed (for debugging / UX copy). */
  reason?:
    | "no_consent"
    | "disabled"
    | "severity_off"
    | "quiet_hours"
    | "ok";
}

function inQuietHours(now: Date, quiet?: [number, number]): boolean {
  if (!quiet) return false;
  const [start, end] = quiet;
  const h = now.getHours();
  // Handle overnight ranges (e.g. 23..7).
  return start <= end ? h >= start && h < end : h >= start || h < end;
}

/**
 * Decide whether a sound may play for an alert. Returns `play: false` unless
 * EVERY gate passes: explicit consent gesture, master enabled, this severity
 * enabled, and not in quiet hours. Auto-play is structurally impossible here.
 */
export function decideSound(
  alertType: AlertType,
  prefs: SoundPreferences,
  now: Date = new Date(),
): SoundDecision {
  // Gate 1: hard consent requirement — no gesture, no sound, ever.
  if (!prefs.consentGestureAt) {
    return { play: false, reason: "no_consent" };
  }
  // Gate 2: master switch.
  if (!prefs.enabled) {
    return { play: false, reason: "disabled" };
  }
  const severity = TYPE_TO_SOUND_SEVERITY[alertType];
  // Gate 3: per-severity opt-in.
  if (!prefs.severities[severity]) {
    return { play: false, reason: "severity_off" };
  }
  // Gate 4: quiet hours.
  if (inQuietHours(now, prefs.quietHours)) {
    return { play: false, reason: "quiet_hours" };
  }
  return {
    play: true,
    asset: SOUND_ASSETS[severity],
    volume: prefs.volume,
    reason: "ok",
  };
}

/** Map an alert type to its severity bucket (for UI labelling). */
export function soundSeverityFor(alertType: AlertType): SoundSeverity {
  return TYPE_TO_SOUND_SEVERITY[alertType];
}
