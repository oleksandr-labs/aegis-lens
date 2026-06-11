/**
 * Map event inspector — typed interface and placeholder builder.
 * Інспектор подій карти — типізований інтерфейс та побудовник-заповнювач.
 *
 * The full inspector (AI summary + sources + media) requires a DB-backed
 * events table. Until the DB is wired, buildInspectorPlaceholder() returns
 * a skeleton with placeholder strings so UI components can render without
 * blocking on data.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InspectorSource {
  url: string;
  title: string;
  /** archive.org or cachedpage.com snapshot URL, if available. */
  archivedUrl?: string;
}

export interface MapInspectorData {
  eventId: string;
  /** Short factual summary (EN). */
  summary: string;
  /** Short factual summary (UK). */
  summaryUk: string;
  /** AI-generated extended summary (streamed from /api/v1/ai/summarise). */
  aiSummary?: string;
  /** Primary and corroborating sources. */
  sources: InspectorSource[];
  /** URLs to images / video thumbnails. */
  mediaUrls?: string[];
  /** Aggregate danger score 0–100. */
  dangerScore: number;
  /** Confidence 0–1. */
  confidence: number;
  /** Human-readable verification verdict. */
  verificationVerdict: string;
  coordinates: { lat: number; lng: number };
}

// ── Placeholder builder ───────────────────────────────────────────────────────

/**
 * Return a skeleton MapInspectorData with placeholder strings.
 * Повернути скелет MapInspectorData з рядками-заповнювачами.
 *
 * Use while the real data is loading from the API.
 */
export function buildInspectorPlaceholder(eventId: string): MapInspectorData {
  return {
    eventId,
    summary: 'Loading event details…',
    summaryUk: 'Завантаження деталей події…',
    aiSummary: undefined,
    sources: [
      {
        url: '#',
        title: 'Loading sources…',
        archivedUrl: undefined,
      },
    ],
    mediaUrls: [],
    dangerScore: 0,
    confidence: 0,
    verificationVerdict: 'Pending verification',
    coordinates: { lat: 49.0, lng: 31.0 },
  };
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const INSPECTOR_NOTES_EN: Record<string, string> = {
  'AI-summary-streaming':
    'aiSummary is populated by streaming from GET /api/v1/ai/summarise?eventId=<id>. ' +
    'Use a ReadableStream consumer in the inspector panel to append tokens as they arrive. ' +
    'Show a spinner until the first token arrives.',
  'DB-backed-sources-media':
    'sources[] and mediaUrls[] are populated from the events_sources and events_media ' +
    'DB tables. Query via GET /api/v1/events/<eventId>/sources and .../media. ' +
    'Requires DB migration to be applied first.',
};

export const INSPECTOR_NOTES_UK: Record<string, string> = {
  'AI-summary-streaming':
    'aiSummary заповнюється стрімінгом з GET /api/v1/ai/summarise?eventId=<id>. ' +
    'Використовуйте споживач ReadableStream у панелі інспектора для додавання токенів по мірі надходження. ' +
    'Показуйте спінер до появи першого токена.',
  'DB-backed-sources-media':
    'sources[] та mediaUrls[] заповнюються з таблиць БД events_sources та events_media. ' +
    'Запитуйте через GET /api/v1/events/<eventId>/sources та .../media. ' +
    'Потребує попереднього застосування міграції БД.',
};
