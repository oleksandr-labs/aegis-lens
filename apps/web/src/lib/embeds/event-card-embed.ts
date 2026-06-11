/**
 * Event Card Embed — single-event card iframe snippet builder.
 *
 * Renders a compact event card suitable for embedding in news sites,
 * blogs, and social aggregators.
 * Генерує картку конкретної події для вставки на зовнішній сайт.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Route served by the embed renderer. Маршрут рендерера карток подій. */
export const EVENT_CARD_EMBED_ROUTE = '/embeds/event-card';

/** Default card dimensions. Розміри картки за замовчуванням. */
const EVENT_CARD_DEFAULT_WIDTH = '480px';
const EVENT_CARD_DEFAULT_HEIGHT = '240px';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Visual theme for the event card. Тема картки події. */
export type EventCardTheme = 'light' | 'dark' | 'tactical' | 'neutral';

/**
 * Configuration for an event card embed.
 *
 * Конфігурація вбудованої картки події.
 */
export interface EventCardEmbedConfig {
  /** Unique event identifier. Унікальний ідентифікатор події. */
  eventId: string;
  /** Visual theme. Візуальна тема. */
  theme?: EventCardTheme;
  /** UI locale. Локаль інтерфейсу. */
  locale?: string;
  /** Whether to show the confidence score badge. Показувати значок довіри? */
  showConfidence?: boolean;
  /** Whether to list source links. Показувати джерела? */
  showSources?: boolean;
  /** iframe width (CSS string). Ширина iframe. */
  width?: string;
  /** iframe height (CSS string). Висота iframe. */
  height?: string;
}

// ── Snippet builder ───────────────────────────────────────────────────────────

/**
 * Generate an iframe snippet for a single event card.
 *
 * Генерує iframe-сніпет для картки конкретної події.
 */
export function buildEventCardSnippet(config: EventCardEmbedConfig): string {
  const {
    eventId,
    theme = 'dark',
    locale = 'en',
    showConfidence = true,
    showSources = false,
    width = EVENT_CARD_DEFAULT_WIDTH,
    height = EVENT_CARD_DEFAULT_HEIGHT,
  } = config;

  const params = new URLSearchParams({
    id: eventId,
    theme,
    locale,
    confidence: showConfidence ? '1' : '0',
    sources: showSources ? '1' : '0',
  });

  const src = `https://aegislens.uk${EVENT_CARD_EMBED_ROUTE}?${params.toString()}`;

  return [
    `<!-- Aegis Lens — Event Card Embed | aegislens.uk -->`,
    `<iframe`,
    `  src="${src}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    `  style="border:0;border-radius:4px;"`,
    `  loading="lazy"`,
    `  referrerpolicy="origin"`,
    `  title="Aegis Lens event ${eventId}"`,
    `></iframe>`,
  ].join('\n');
}
