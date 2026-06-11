/**
 * Region Brief Embed — auto-updating region summary widget.
 *
 * Renders a compact region situation brief that refreshes at a
 * configurable interval, suitable for news dashboards and sidebars.
 * Автооновлюваний блок ситуаційного огляду регіону.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Route served by the embed renderer. Маршрут рендерера регіональних брифів. */
const REGION_BRIEF_EMBED_ROUTE = '/embeds/region-brief';

/**
 * Default polling interval in minutes.
 *
 * Типовий інтервал оновлення (хвилини).
 */
export const REGION_BRIEF_DEFAULT_REFRESH_MINUTES = 60;

/** Minimum allowed refresh interval (minutes). Мінімальний інтервал оновлення. */
const REGION_BRIEF_MIN_REFRESH_MINUTES = 5;

/** Default iframe dimensions. Розміри iframe за замовчуванням. */
const REGION_BRIEF_DEFAULT_WIDTH = '340px';
const REGION_BRIEF_DEFAULT_HEIGHT = '320px';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Theme for the region brief widget. Тема блоку. */
export type RegionBriefTheme = 'light' | 'dark' | 'tactical' | 'neutral';

/**
 * Configuration for a region brief embed.
 *
 * Конфігурація вбудованого регіонального брифу.
 */
export interface RegionBriefEmbedConfig {
  /** ISO 3166-2 region code. Код регіону. */
  region: string;
  /** UI locale. Локаль. */
  locale?: string;
  /** Auto-refresh interval in minutes. Інтервал оновлення (хв). */
  refreshIntervalMinutes?: number;
  /** Visual theme. Тема. */
  theme?: RegionBriefTheme;
  /** iframe width (CSS string). Ширина. */
  width?: string;
  /** iframe height (CSS string). Висота. */
  height?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Clamp refresh interval to the allowed minimum.
 *
 * Обмежує інтервал оновлення знизу.
 */
function resolveRefreshInterval(minutes?: number): number {
  const value = minutes ?? REGION_BRIEF_DEFAULT_REFRESH_MINUTES;
  return Math.max(REGION_BRIEF_MIN_REFRESH_MINUTES, Math.round(value));
}

// ── Snippet builder ───────────────────────────────────────────────────────────

/**
 * Generate an iframe snippet for an auto-updating region brief.
 *
 * Генерує iframe-сніпет для авто-оновлюваного регіонального брифу.
 */
export function buildRegionBriefSnippet(config: RegionBriefEmbedConfig): string {
  const {
    region,
    locale = 'en',
    refreshIntervalMinutes,
    theme = 'dark',
    width = REGION_BRIEF_DEFAULT_WIDTH,
    height = REGION_BRIEF_DEFAULT_HEIGHT,
  } = config;

  const refresh = resolveRefreshInterval(refreshIntervalMinutes);

  const params = new URLSearchParams({
    region,
    locale,
    theme,
    refresh: String(refresh),
  });

  const src = `https://aegislens.uk${REGION_BRIEF_EMBED_ROUTE}?${params.toString()}`;

  return [
    `<!-- Aegis Lens — Region Brief Embed | aegislens.uk -->`,
    `<iframe`,
    `  src="${src}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    `  style="border:0;border-radius:4px;"`,
    `  loading="lazy"`,
    `  referrerpolicy="origin"`,
    `  title="Aegis Lens region brief — ${region}"`,
    `></iframe>`,
  ].join('\n');
}
