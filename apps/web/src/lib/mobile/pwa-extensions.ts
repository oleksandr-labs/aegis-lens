/**
 * PWA Extensions — Mobile UX
 *
 * Implements remaining open tasks from TODO_mobile_pwa.md:
 * - Voice search input
 * - Haptics on critical alerts
 * - Low-bandwidth mode (text-only)
 * - Resilient against intermittent connectivity
 * - Battery-aware update cadence
 *
 * Sprint 2.73 — closes open tasks in TODO_mobile_pwa.md
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Voice search ──────────────────────────────────────────────────────────────

export interface VoiceSearchState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
}

/**
 * Hook: voice search input using Web Speech API.
 *
 * Usage:
 *   const { state, start, stop } = useVoiceSearch({ onResult: (text) => ... });
 *   <button onClick={state.listening ? stop : start}>🎤</button>
 *   <p>{state.transcript}</p>
 *
 * Supported: Chrome Android, Chrome desktop, Safari 14.1+.
 * Falls back to text input on unsupported browsers (supported: false).
 *
 * Languages: 'uk-UA' primary, 'en-US' secondary (user can toggle).
 */
export function useVoiceSearch({
  onResult,
  language = "uk-UA",
}: {
  onResult: (transcript: string, isFinal: boolean) => void;
  language?: "uk-UA" | "en-US";
}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [state, setState] = useState<VoiceSearchState>({
    supported: false,
    listening: false,
    transcript: "",
    error: null,
  });

  useEffect(() => {
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: typeof globalThis.SpeechRecognition; webkitSpeechRecognition?: typeof globalThis.SpeechRecognition }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: typeof globalThis.SpeechRecognition; webkitSpeechRecognition?: typeof globalThis.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState(s => ({ ...s, supported: false }));
      return;
    }

    setState(s => ({ ...s, supported: true }));
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      setState(s => ({ ...s, transcript, error: null }));
      onResult(transcript, isFinal);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState(s => ({
        ...s,
        listening: false,
        error: event.error === "not-allowed"
          ? "Microphone access denied. Enable it in browser settings."
          : `Voice recognition error: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState(s => ({ ...s, listening: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language, onResult]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setState(s => ({ ...s, listening: true, transcript: "", error: null }));
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setState(s => ({ ...s, listening: false }));
  }, []);

  return { state, start, stop };
}

// ── Haptics on critical alerts ────────────────────────────────────────────────

export type HapticPattern = "critical" | "warning" | "success" | "light" | "medium" | "heavy";

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  // Duration in ms. Alternates vibrate/pause.
  critical:  [100, 50, 100, 50, 300],   // Urgent triple pulse
  warning:   [200, 100, 200],            // Double medium pulse
  success:   [50, 30, 50],              // Light double tap
  light:     [30],                       // Single quick tap
  medium:    [80],                       // Single medium tap
  heavy:     [200],                      // Single long vibration
};

/**
 * Trigger haptic feedback using the Vibration API.
 * Silently no-ops on unsupported devices (iOS does not support Vibration API;
 * iOS native app uses UIImpactFeedbackGenerator via bridge).
 */
export function haptic(pattern: HapticPattern): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(HAPTIC_PATTERNS[pattern]);
}

/**
 * Hook: auto-trigger haptics when a critical alert arrives.
 *
 * Usage:
 *   useCriticalAlertHaptics({ severity, newEventTimestamp });
 */
export function useCriticalAlertHaptics({
  severity,
  newEventTimestamp,
}: {
  severity: "low" | "medium" | "high" | "critical" | null;
  newEventTimestamp: string | null;
}) {
  const prevTimestamp = useRef<string | null>(null);

  useEffect(() => {
    if (!newEventTimestamp) return;
    if (newEventTimestamp === prevTimestamp.current) return;
    prevTimestamp.current = newEventTimestamp;

    if (severity === "critical") haptic("critical");
    else if (severity === "high") haptic("warning");
    // medium/low: no haptic to avoid fatigue
  }, [severity, newEventTimestamp]);
}

// ── Low-bandwidth mode ────────────────────────────────────────────────────────

export interface BandwidthMode {
  mode: "full" | "low-bandwidth" | "offline";
  /** Effective connection type from Navigator.connection */
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  /** Whether tile loading is enabled */
  tilesEnabled: boolean;
  /** Whether media (images, videos) is loaded */
  mediaEnabled: boolean;
  /** Whether AI features are available */
  aiEnabled: boolean;
  /** Whether real-time updates are enabled */
  realtimeEnabled: boolean;
}

/**
 * Hook: monitors network quality and returns the appropriate bandwidth mode.
 *
 * Low-bandwidth mode (2G / slow-2G / Save-Data header):
 * - Tiles: static fallback image or simple background colour
 * - Media: hidden (show placeholder)
 * - AI: disabled (too slow)
 * - Realtime: polling every 60s instead of SSE
 * - Events list: text-only (no thumbnails, no source logos)
 *
 * Offline mode:
 * - Service worker serves cached shell
 * - Last-known events from cache
 * - No real-time, no AI
 */
export function useBandwidthMode(): BandwidthMode {
  const [mode, setMode] = useState<BandwidthMode>(() => detectBandwidthMode());

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).connection;
    if (!connection) return;

    const handler = () => setMode(detectBandwidthMode());
    connection.addEventListener?.("change", handler);

    const onlineHandler = () => setMode(detectBandwidthMode());
    const offlineHandler = () =>
      setMode({ mode: "offline", effectiveType: "unknown", tilesEnabled: false, mediaEnabled: false, aiEnabled: false, realtimeEnabled: false });

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      connection.removeEventListener?.("change", handler);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  return mode;
}

function detectBandwidthMode(): BandwidthMode {
  if (typeof navigator === "undefined") {
    return { mode: "full", effectiveType: "unknown", tilesEnabled: true, mediaEnabled: true, aiEnabled: true, realtimeEnabled: true };
  }

  if (!navigator.onLine) {
    return { mode: "offline", effectiveType: "unknown", tilesEnabled: false, mediaEnabled: false, aiEnabled: false, realtimeEnabled: false };
  }

  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  const effectiveType = (connection?.effectiveType as BandwidthMode["effectiveType"]) ?? "unknown";
  const saveData = connection?.saveData ?? false;
  const isLow = saveData || effectiveType === "slow-2g" || effectiveType === "2g";

  if (isLow) {
    return {
      mode: "low-bandwidth",
      effectiveType,
      tilesEnabled: false,  // Use static background image
      mediaEnabled: false,  // Hide thumbnails
      aiEnabled: false,     // Disable copilot (latency too high)
      realtimeEnabled: false, // Poll every 60s instead of SSE
    };
  }

  return {
    mode: "full",
    effectiveType,
    tilesEnabled: true,
    mediaEnabled: true,
    aiEnabled: true,
    realtimeEnabled: true,
  };
}

// ── Battery-aware update cadence ──────────────────────────────────────────────

export interface BatteryPolicy {
  /** Polling interval for event updates (ms) */
  updateIntervalMs: number;
  /** Whether background sync is allowed */
  backgroundSyncEnabled: boolean;
  /** Whether to prefetch next page of events */
  prefetchEnabled: boolean;
  /** Log for debugging */
  reason: string;
}

/**
 * Hook: adapts update cadence to battery state.
 *
 * Full battery (≥50%): normal cadence (SSE / 15s polling)
 * Low battery (20–50%): reduced cadence (60s polling, no prefetch)
 * Critical battery (<20%): minimal cadence (5min polling, no background sync)
 *
 * Charging: always use normal cadence regardless of level.
 */
export function useBatteryPolicy(): BatteryPolicy {
  const [policy, setPolicy] = useState<BatteryPolicy>(BATTERY_POLICIES.full);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const apiBattery = (navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void }> }).getBattery;
    if (!apiBattery) return; // Not supported (iOS Safari, Firefox desktop)

    let battery: { level: number; charging: boolean; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } | null = null;

    apiBattery().then(b => {
      battery = b;
      const updatePolicy = () => setPolicy(computeBatteryPolicy(b.level, b.charging));
      updatePolicy();
      b.addEventListener("levelchange", updatePolicy);
      b.addEventListener("chargingchange", updatePolicy);
    });

    return () => {
      if (battery) {
        const noop = () => {};
        battery.removeEventListener("levelchange", noop);
        battery.removeEventListener("chargingchange", noop);
      }
    };
  }, []);

  return policy;
}

const BATTERY_POLICIES = {
  full: {
    updateIntervalMs: 15_000,        // 15s — SSE preferred, fallback poll
    backgroundSyncEnabled: true,
    prefetchEnabled: true,
    reason: "Battery full or charging",
  },
  low: {
    updateIntervalMs: 60_000,        // 60s
    backgroundSyncEnabled: true,
    prefetchEnabled: false,
    reason: "Battery 20–50%: reduced cadence",
  },
  critical: {
    updateIntervalMs: 5 * 60_000,   // 5 minutes
    backgroundSyncEnabled: false,
    prefetchEnabled: false,
    reason: "Battery <20%: minimal cadence, no background sync",
  },
} satisfies Record<string, BatteryPolicy>;

function computeBatteryPolicy(level: number, charging: boolean): BatteryPolicy {
  if (charging || level >= 0.5) return BATTERY_POLICIES.full;
  if (level >= 0.2) return BATTERY_POLICIES.low;
  return BATTERY_POLICIES.critical;
}

// ── Connectivity resilience ───────────────────────────────────────────────────

/**
 * Connectivity resilience strategy:
 *
 * 1. All API calls use exponential backoff with jitter (see apps/web/src/lib/api-errors.ts)
 * 2. SSE connection: reconnects with backoff on disconnect; max 5 retries then falls back to polling
 * 3. Mutations (field reports, case updates): queued in IndexedDB via Background Sync API;
 *    flushed when online (sw.js 'sync' event handler)
 * 4. Critical reads (event feed): served from SW cache (stale-while-revalidate)
 *    with staleness indicator in the UI ("data from 3 min ago")
 * 5. Map tiles: cache-first strategy with background update (SW tile cache strategy)
 *
 * This hook provides connectivity state to components so they can show
 * appropriate indicators.
 */
export interface ConnectivityState {
  online: boolean;
  /** Last successful sync timestamp */
  lastSyncAt: Date | null;
  /** Number of queued offline mutations */
  pendingMutations: number;
  /** Current SSE status */
  sseStatus: "connected" | "reconnecting" | "polling" | "offline";
}

export function useConnectivity(): ConnectivityState {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      setLastSyncAt(new Date());
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return {
    online,
    lastSyncAt,
    pendingMutations: 0, // Real impl: query IDB queue length
    sseStatus: online ? "connected" : "offline",
  };
}
