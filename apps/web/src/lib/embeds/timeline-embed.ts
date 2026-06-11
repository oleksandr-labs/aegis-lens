/**
 * Timeline Embed — animated event-timeline iframe snippet builder.
 *
 * Supports optional autoplay with configurable playback speed.
 * Підтримує автовідтворення хронології подій зі змінною швидкістю.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Route served by the embed renderer. Маршрут рендерера хронології. */
const TIMELINE_EMBED_ROUTE = '/embeds/timeline';

/**
 * Supported playback speed multipliers.
 *
 * Підтримувані множники швидкості відтворення.
 */
export const TIMELINE_EMBED_PLAYBACK_SPEEDS: ReadonlyArray<number> = [0.5, 1, 2, 4];

/** Default playback speed index (1× = index 1). Швидкість за замовчуванням. */
const TIMELINE_DEFAULT_SPEED = 1;

/** Default iframe dimensions. Розміри iframe за замовчуванням. */
const TIMELINE_DEFAULT_WIDTH = '100%';
const TIMELINE_DEFAULT_HEIGHT = '420px';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Theme for the timeline embed. Тема хронології. */
export type TimelineTheme = 'light' | 'dark' | 'tactical' | 'neutral';

/**
 * Configuration for a timeline embed.
 *
 * Конфігурація вбудованої хронології.
 */
export interface TimelineEmbedConfig {
  /** ISO 3166-2 region code or 'all'. Код регіону або 'all'. */
  region: string;
  /** ISO 8601 start date (YYYY-MM-DD). Дата початку. */
  startDate?: string;
  /** ISO 8601 end date (YYYY-MM-DD). Дата кінця. */
  endDate?: string;
  /** Visual theme. Тема. */
  theme?: TimelineTheme;
  /** UI locale. Локаль. */
  locale?: string;
  /** Start playing automatically on load. Автовідтворення. */
  autoplay?: boolean;
  /** Playback speed multiplier from TIMELINE_EMBED_PLAYBACK_SPEEDS. Швидкість відтворення. */
  playbackSpeed?: number;
  /** iframe width (CSS string). Ширина iframe. */
  width?: string;
  /** iframe height (CSS string). Висота iframe. */
  height?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Clamp speed to the nearest supported value.
 *
 * Округлює швидкість до найближчого підтримуваного значення.
 */
function resolvePlaybackSpeed(speed?: number): number {
  if (!speed) return TIMELINE_DEFAULT_SPEED;
  const supported = TIMELINE_EMBED_PLAYBACK_SPEEDS as number[];
  return supported.includes(speed) ? speed : TIMELINE_DEFAULT_SPEED;
}

// ── Snippet builder ───────────────────────────────────────────────────────────

/**
 * Generate an iframe snippet for an event timeline.
 *
 * Генерує iframe-сніпет для хронології подій.
 */
export function buildTimelineEmbedSnippet(config: TimelineEmbedConfig): string {
  const {
    region,
    startDate,
    endDate,
    theme = 'dark',
    locale = 'en',
    autoplay = false,
    playbackSpeed,
    width = TIMELINE_DEFAULT_WIDTH,
    height = TIMELINE_DEFAULT_HEIGHT,
  } = config;

  const params = new URLSearchParams({
    region,
    theme,
    locale,
    autoplay: autoplay ? '1' : '0',
    speed: String(resolvePlaybackSpeed(playbackSpeed)),
  });

  if (startDate) params.set('from', startDate);
  if (endDate) params.set('to', endDate);

  const src = `https://aegislens.uk${TIMELINE_EMBED_ROUTE}?${params.toString()}`;

  return [
    `<!-- Aegis Lens — Timeline Embed | aegislens.uk -->`,
    `<iframe`,
    `  src="${src}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    `  style="border:0;border-radius:4px;"`,
    `  loading="lazy"`,
    `  referrerpolicy="origin"`,
    `  title="Aegis Lens timeline — ${region}"`,
    `></iframe>`,
  ].join('\n');
}
