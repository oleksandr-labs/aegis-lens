/**
 * Vector tile source and layer configuration for PostGIS-backed tile servers.
 * Конфігурація джерел векторних тайлів та шарів для тайл-серверів на базі PostGIS.
 *
 * Supports both Martin (recommended) and pg_tileserv as tile backends.
 * Both expose MVT endpoints compatible with Mapbox GL JS / MapLibre source type "vector".
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VectorTileSource {
  /** Mapbox GL / MapLibre source ID. */
  sourceId: string;
  type: 'vector';
  /** Tile URL template, e.g. '/tiles/events/{z}/{x}/{y}'. */
  tilesUrl: string;
  minZoom: number;
  maxZoom: number;
  /** Optional attribution string. */
  attribution?: string;
}

export interface VectorTileLayer {
  /** Mapbox GL / MapLibre layer ID. */
  layerId: string;
  /** Must match a sourceId from VectorTileSource. */
  sourceId: string;
  /** Source layer name inside the MVT tile (matches PostGIS table/function name). */
  sourceLayer: string;
  type: 'fill' | 'line' | 'circle' | 'symbol';
  paint: Record<string, unknown>;
  filter?: unknown[];
}

// ── Pre-defined tile sources ──────────────────────────────────────────────────

/**
 * Default vector tile source definitions for the three primary PostGIS tables.
 * Визначення джерел векторних тайлів за замовчуванням для трьох основних таблиць PostGIS.
 */
export const VECTOR_TILE_SOURCES: Record<string, VectorTileSource> = {
  'events-tiles': {
    sourceId: 'events-tiles',
    type: 'vector',
    tilesUrl: '/tiles/events/{z}/{x}/{y}',
    minZoom: 0,
    maxZoom: 16,
    attribution: '© Aegis Lens — Conflict Events',
  },
  'entities-tiles': {
    sourceId: 'entities-tiles',
    type: 'vector',
    tilesUrl: '/tiles/entities/{z}/{x}/{y}',
    minZoom: 0,
    maxZoom: 18,
    attribution: '© Aegis Lens — Entities',
  },
  'aoi-tiles': {
    sourceId: 'aoi-tiles',
    type: 'vector',
    tilesUrl: '/tiles/aoi/{z}/{x}/{y}',
    minZoom: 0,
    maxZoom: 14,
    attribution: '© Aegis Lens — Areas of Interest',
  },
};

// ── URL builder functions ─────────────────────────────────────────────────────

/**
 * Build a Martin tile server URL for the given PostGIS table/function.
 * Побудова URL тайл-сервера Martin для вказаної таблиці/функції PostGIS.
 *
 * Martin endpoint convention: /tiles/<table_name>/{z}/{x}/{y}
 *
 * @param tableName  PostGIS table or function name
 * @param baseUrl    Martin base URL (default '/tiles')
 */
export function buildMartinTileUrl(tableName: string, baseUrl = '/tiles'): string {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/${tableName}/{z}/{x}/{y}`;
}

/**
 * Build a pg_tileserv tile URL for the given PostGIS table or function.
 * Побудова URL pg_tileserv для вказаної таблиці або функції PostGIS.
 *
 * pg_tileserv endpoint convention: /public.<table_name>/{z}/{x}/{y}.pbf
 *
 * @param tableName  PostGIS table name (schema prefix optional; default 'public')
 * @param baseUrl    pg_tileserv base URL (default '/tiles')
 */
export function buildPgTileServUrl(tableName: string, baseUrl = '/tiles'): string {
  const base = baseUrl.replace(/\/$/, '');
  const fqn = tableName.includes('.') ? tableName : `public.${tableName}`;
  return `${base}/${fqn}/{z}/{x}/{y}.pbf`;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const VECTOR_TILE_NOTES_EN: Record<string, string> = {
  'Martin-recommended':
    'Martin (https://martin.maplibre.org) is the recommended tile server. ' +
    'It auto-discovers PostGIS tables and functions and serves MVT via a single binary. ' +
    'Run alongside the API container: martin --config martin.yaml',
  'pg_tileserv-alternative':
    'pg_tileserv (https://github.com/CrunchyData/pg_tileserv) is an alternative. ' +
    'Use it when you need SQL function layers with complex parameterization. ' +
    'Endpoint pattern differs: /public.<table>/{z}/{x}/{y}.pbf',
  'PostGIS-ST_AsMVT-backend':
    'Both Martin and pg_tileserv use PostGIS ST_AsMVT() under the hood. ' +
    'Ensure your PostGIS version >= 2.5.0 and that spatial columns have GIST indices.',
};

export const VECTOR_TILE_NOTES_UK: Record<string, string> = {
  'Martin-recommended':
    'Martin (https://martin.maplibre.org) є рекомендованим тайл-сервером. ' +
    'Він автоматично виявляє таблиці та функції PostGIS і роздає MVT через один бінарник. ' +
    'Запускайте поряд із контейнером API: martin --config martin.yaml',
  'pg_tileserv-alternative':
    'pg_tileserv (https://github.com/CrunchyData/pg_tileserv) є альтернативою. ' +
    'Використовуйте, коли потрібні шари SQL-функцій із складною параметризацією. ' +
    'Шаблон ендпоїнту відрізняється: /public.<table>/{z}/{x}/{y}.pbf',
  'PostGIS-ST_AsMVT-backend':
    'І Martin, і pg_tileserv використовують PostGIS ST_AsMVT() під капотом. ' +
    'Переконайтеся, що версія PostGIS >= 2.5.0 і що просторові колонки мають GIST-індекси.',
};
