/**
 * Social Ingest Config — Phase 2 social media ingestion connectors.
 *
 * Covers X/Twitter, Reddit, and YouTube. Each source has platform-specific
 * rate limits, auth requirements, and content filters.
 *
 * Конфігурація інгесту соцмереж фази 2: X/Twitter, Reddit, YouTube.
 */

'use server';

// ── SocialSource ──────────────────────────────────────────────────────────────

export type SocialSource = 'twitter' | 'reddit' | 'youtube';

export const SOCIAL_SOURCES: SocialSource[] = ['twitter', 'reddit', 'youtube'];

// ── Auth types ────────────────────────────────────────────────────────────────

export type SocialAuthType = 'oauth2' | 'api-key' | 'bearer';

// ── Config shape ──────────────────────────────────────────────────────────────

export interface SocialIngestConfig {
  source: SocialSource;
  /** Display name — Назва */
  name: string;
  /** Auth mechanism — Механізм авторизації */
  authType: SocialAuthType;
  /** API rate limit: requests per 15 minutes — Ліміт: запитів за 15 хв */
  rateLimitPer15Min: number;
  /** Max results per API call — Макс. результатів за виклик */
  maxResultsPerCall: number;
  /** Polling interval in seconds — Інтервал поллінгу (сек) */
  pollIntervalSeconds: number;
  /** Content filters applied — Фільтри контенту */
  contentFilters: string[];
  /** Whether full-text search is available — Чи доступний full-text пошук */
  fullTextSearch: boolean;
  /** Estimated events per day at baseline — Приблизно подій на день */
  baselineEventsPerDay: number;
}

// ── Source configs ────────────────────────────────────────────────────────────

export const SOCIAL_INGEST_CONFIGS: Record<SocialSource, SocialIngestConfig> = {
  twitter: {
    source: 'twitter',
    name: 'X / Twitter',
    authType: 'bearer',
    rateLimitPer15Min: 300,
    maxResultsPerCall: 100,
    pollIntervalSeconds: 30,
    contentFilters: ['lang:uk', 'lang:en', 'lang:ru', '-is:retweet', 'has:geo OR place_country:UA'],
    fullTextSearch: true,
    baselineEventsPerDay: 8_000,
  },
  reddit: {
    source: 'reddit',
    name: 'Reddit',
    authType: 'oauth2',
    rateLimitPer15Min: 600,
    maxResultsPerCall: 100,
    pollIntervalSeconds: 60,
    contentFilters: ['subreddit:UkraineWarVideoReport', 'subreddit:ukraine', 'subreddit:CombatFootage'],
    fullTextSearch: false,
    baselineEventsPerDay: 1_500,
  },
  youtube: {
    source: 'youtube',
    name: 'YouTube',
    authType: 'api-key',
    rateLimitPer15Min: 100,
    maxResultsPerCall: 50,
    pollIntervalSeconds: 300,
    contentFilters: ['relevanceLanguage=uk', 'type=video', 'videoDuration=short'],
    fullTextSearch: false,
    baselineEventsPerDay: 300,
  },
};
