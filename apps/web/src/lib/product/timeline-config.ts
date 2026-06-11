/**
 * Timeline Config — time window presets for the event feed and map.
 *
 * Defines the 24h default and extended presets used by the timeline slider
 * and event query filters.
 *
 * Конфігурація таймлайну: вікна часу для стрічки подій та карти.
 */

'use server';

// ── Timeline preset ───────────────────────────────────────────────────────────

export interface TimelinePreset {
  /** Preset identifier — Ідентифікатор пресету */
  id: string;
  /** Human label — Мітка */
  label: string;
  /** Window in hours (null = custom range) — Вікно в годинах */
  windowHours: number | null;
  /** Default bucket granularity in minutes — Гранулярність бакету (хв) */
  bucketMinutes: number;
  /** Tier required to access — Необхідний tier */
  requiredTier: string;
}

// ── Presets ───────────────────────────────────────────────────────────────────

/**
 * Available timeline window presets.
 *
 * Доступні пресети вікна таймлайну.
 */
export const TIMELINE_PRESETS: TimelinePreset[] = [
  {
    id: '24h',
    label: 'Last 24 hours',
    windowHours: 24,
    bucketMinutes: 60,
    requiredTier: 'free',
  },
  {
    id: '7d',
    label: 'Last 7 days',
    windowHours: 168,
    bucketMinutes: 360,
    requiredTier: 'free',
  },
  {
    id: '30d',
    label: 'Last 30 days',
    windowHours: 720,
    bucketMinutes: 1_440,
    requiredTier: 'observer',
  },
  {
    id: 'custom',
    label: 'Custom range',
    windowHours: null,
    bucketMinutes: 60,
    requiredTier: 'pro',
  },
];

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_TIMELINE_WINDOW = '24h' as const;

/** Maximum lookback in days for pro+ tier — Макс. глибина для pro+ */
export const MAX_LOOKBACK_DAYS_PRO = 365;

/** Maximum lookback in days for enterprise tier — Макс. глибина для enterprise */
export const MAX_LOOKBACK_DAYS_ENTERPRISE = 1_825; // 5 years

// ── Timeline config ───────────────────────────────────────────────────────────

export interface TimelineConfig {
  defaultWindow: typeof DEFAULT_TIMELINE_WINDOW;
  presets: TimelinePreset[];
  maxLookbackDaysPro: number;
  maxLookbackDaysEnterprise: number;
  /** Auto-refresh interval in seconds for live mode — Інтервал оновлення (сек) */
  liveRefreshIntervalSeconds: number;
}

export const TIMELINE_CONFIG: TimelineConfig = {
  defaultWindow: DEFAULT_TIMELINE_WINDOW,
  presets: TIMELINE_PRESETS,
  maxLookbackDaysPro: MAX_LOOKBACK_DAYS_PRO,
  maxLookbackDaysEnterprise: MAX_LOOKBACK_DAYS_ENTERPRISE,
  liveRefreshIntervalSeconds: 30,
};
