/**
 * Live Map Embed — iframe + JS API config and snippet builder.
 *
 * Generates embeddable iframe snippets for the live event map.
 * Підтримує регіон, зум, шари, тему та локаль.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Base path for map embed iframes. Базовий шлях для iframe карти. */
const MAP_EMBED_BASE_PATH = '/embeds/map';

/** Default maximum events rendered in the embed. Максимум подій в embed за замовчуванням. */
const MAP_EMBED_DEFAULT_MAX_EVENTS = 200;

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Supported overlay layers for the map embed. Підтримувані шари карти. */
export type MapEmbedLayer = 'events' | 'heatmap' | 'regions' | 'frontline' | 'annotations';

/** Theme for the embed. Тема відображення. */
export type MapEmbedTheme = 'light' | 'dark' | 'tactical' | 'neutral';

/**
 * Configuration for a live map embed.
 *
 * Конфігурація вбудованої живої карти.
 */
export interface MapEmbedConfig {
  /** ISO 3166-2 region code or 'all'. Код регіону або 'all'. */
  region: string;
  /** Map zoom level (1–18). Рівень масштабування. */
  zoom?: number;
  /** Overlay layers to enable. Увімкнені шари. */
  layers?: MapEmbedLayer[];
  /** Visual theme. Візуальна тема. */
  theme?: MapEmbedTheme;
  /** UI locale. Локаль інтерфейсу. */
  locale?: string;
  /** Maximum events to render. Максимум подій для відображення. */
  maxEvents?: number;
  /** iframe width (CSS string). Ширина iframe. */
  width?: string;
  /** iframe height (CSS string). Висота iframe. */
  height?: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

/**
 * Default configuration for the map embed.
 *
 * Типова конфігурація вбудованої карти.
 */
export const MAP_EMBED_DEFAULT_CONFIG: Required<MapEmbedConfig> = {
  region: 'all',
  zoom: 6,
  layers: ['events', 'regions'],
  theme: 'dark',
  locale: 'en',
  maxEvents: MAP_EMBED_DEFAULT_MAX_EVENTS,
  width: '100%',
  height: '500px',
};

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build the embed URL from config. Does not include the host — host is
 * injected at runtime so the snippet works on any deployment.
 *
 * Будує URL для iframe (без хосту — підставляється під час виконання).
 */
export function buildMapEmbedUrl(config: MapEmbedConfig): string {
  const cfg = { ...MAP_EMBED_DEFAULT_CONFIG, ...config };
  const params = new URLSearchParams({
    region: cfg.region,
    zoom: String(cfg.zoom),
    layers: cfg.layers.join(','),
    theme: cfg.theme,
    locale: cfg.locale,
    maxEvents: String(cfg.maxEvents),
  });
  return `${MAP_EMBED_BASE_PATH}?${params.toString()}`;
}

// ── Snippet builder ───────────────────────────────────────────────────────────

/**
 * Generate the full iframe HTML snippet ready to copy-paste.
 *
 * Генерує HTML-сніпет для вставки на сторонній сайт.
 */
export function buildMapEmbedSnippet(config: MapEmbedConfig): string {
  const cfg = { ...MAP_EMBED_DEFAULT_CONFIG, ...config };
  const url = buildMapEmbedUrl(cfg);

  // Attribution is required — embed will render a footer link regardless.
  // Атрибуція обов'язкова — embed відображає посилання внизу.
  return [
    `<!-- Aegis Lens — Live Map Embed | aegislens.uk -->`,
    `<iframe`,
    `  src="https://aegislens.uk${url}"`,
    `  width="${cfg.width}"`,
    `  height="${cfg.height}"`,
    `  style="border:0;border-radius:4px;"`,
    `  loading="lazy"`,
    `  referrerpolicy="origin"`,
    `  allowfullscreen`,
    `  title="Aegis Lens live map — ${cfg.region}"`,
    `></iframe>`,
  ].join('\n');
}
