/**
 * Heatmap Embed — event-density heatmap iframe snippet builder.
 *
 * Renders an intensity heatmap filtered by event type and time period.
 * Відображає теплову карту щільності подій за типом і часовим проміжком.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Route served by the embed renderer. Маршрут рендерера теплової карти. */
const HEATMAP_EMBED_ROUTE = '/embeds/heatmap';

/** Default iframe dimensions. Розміри iframe за замовчуванням. */
const HEATMAP_DEFAULT_WIDTH = '100%';
const HEATMAP_DEFAULT_HEIGHT = '460px';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Event types that can be visualised. Типи подій для теплової карти. */
export type HeatmapEventType =
  | 'all'
  | 'kinetic'
  | 'displacement'
  | 'infrastructure'
  | 'humanitarian'
  | 'political';

/**
 * Predefined time-period buckets.
 *
 * Часові інтервали для теплової карти.
 */
export type HeatmapPeriod = '24h' | '7d' | '30d' | '90d' | 'all';

/** Theme for the heatmap embed. Тема теплової карти. */
export type HeatmapTheme = 'light' | 'dark' | 'tactical' | 'neutral';

/**
 * Configuration for a heatmap embed.
 *
 * Конфігурація вбудованої теплової карти.
 */
export interface HeatmapEmbedConfig {
  /** ISO 3166-2 region code or 'all'. Код регіону або 'all'. */
  region: string;
  /** Event type filter. Тип подій. */
  eventType?: HeatmapEventType;
  /** Time period. Часовий інтервал. */
  period?: HeatmapPeriod;
  /** Visual theme. Тема. */
  theme?: HeatmapTheme;
  /** UI locale. Локаль. */
  locale?: string;
  /** iframe width (CSS string). Ширина iframe. */
  width?: string;
  /** iframe height (CSS string). Висота iframe. */
  height?: string;
}

// ── Snippet builder ───────────────────────────────────────────────────────────

/**
 * Generate an iframe snippet for the event heatmap.
 *
 * Генерує iframe-сніпет теплової карти подій.
 */
export function buildHeatmapEmbedSnippet(config: HeatmapEmbedConfig): string {
  const {
    region,
    eventType = 'all',
    period = '30d',
    theme = 'dark',
    locale = 'en',
    width = HEATMAP_DEFAULT_WIDTH,
    height = HEATMAP_DEFAULT_HEIGHT,
  } = config;

  const params = new URLSearchParams({
    region,
    type: eventType,
    period,
    theme,
    locale,
  });

  const src = `https://aegislens.uk${HEATMAP_EMBED_ROUTE}?${params.toString()}`;

  return [
    `<!-- Aegis Lens — Heatmap Embed | aegislens.uk -->`,
    `<iframe`,
    `  src="${src}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    `  style="border:0;border-radius:4px;"`,
    `  loading="lazy"`,
    `  referrerpolicy="origin"`,
    `  title="Aegis Lens heatmap — ${region} / ${eventType} / ${period}"`,
    `></iframe>`,
  ].join('\n');
}
