/**
 * Mapbox ↔ MapLibre provider swap.
 * Перемикання провайдера Mapbox ↔ MapLibre.
 *
 * When NEXT_PUBLIC_MAPBOX_TOKEN is set at runtime the app uses Mapbox GL JS;
 * otherwise it falls back to MapLibre with an OSM raster style.
 * Both providers expose the same Map API surface so component code does not
 * need to branch on the provider.
 *
 * NOTE: do NOT import this file from map-style.ts — it is a sibling module.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type MapProvider = 'maplibre' | 'mapbox';

export interface MapProviderConfig {
  provider: MapProvider;
  /** Env var name that activates this provider (Mapbox only). */
  tokenEnvVar?: string;
  /** Primary style URL for this provider. */
  styleUrl: string;
  /** Fallback style URL when primary is unavailable (always OSM raster). */
  fallbackStyleUrl: string;
}

// ── Provider configs ──────────────────────────────────────────────────────────

/** MapLibre config — open-source, no token required. */
export const MAPLIBRE_CONFIG: MapProviderConfig = {
  provider: 'maplibre',
  styleUrl: '/map-style.json',
  fallbackStyleUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
};

/** Mapbox config — requires NEXT_PUBLIC_MAPBOX_TOKEN in environment. */
export const MAPBOX_CONFIG: MapProviderConfig = {
  provider: 'mapbox',
  tokenEnvVar: 'NEXT_PUBLIC_MAPBOX_TOKEN',
  styleUrl: 'mapbox://styles/mapbox/dark-v11',
  fallbackStyleUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
};

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Returns MAPBOX_CONFIG when the env var is present and non-empty,
 * otherwise MAPLIBRE_CONFIG.
 * Повертає MAPBOX_CONFIG, якщо змінна середовища задана, інакше MAPLIBRE_CONFIG.
 */
export function getActiveMapProvider(): MapProviderConfig {
  if (isMapboxActive()) return MAPBOX_CONFIG;
  return MAPLIBRE_CONFIG;
}

/**
 * True when NEXT_PUBLIC_MAPBOX_TOKEN is a non-empty string.
 * True, коли NEXT_PUBLIC_MAPBOX_TOKEN є непорожнім рядком.
 */
export function isMapboxActive(): boolean {
  return Boolean(
    process.env['NEXT_PUBLIC_MAPBOX_TOKEN'] &&
      process.env['NEXT_PUBLIC_MAPBOX_TOKEN'].trim().length > 0,
  );
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const MAPBOX_SWAP_NOTES_EN: Record<string, string> = {
  'env-var-swap':
    'Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local (or GitHub secret NEXT_PUBLIC_MAPBOX_TOKEN) ' +
    'to switch from MapLibre to Mapbox GL JS. No code changes required — getActiveMapProvider() ' +
    'detects the token at runtime.',
  'same-API-surface':
    'Mapbox GL JS and MapLibre GL JS share the same public Map API surface. ' +
    'All layer configs, paint specs, and event handlers work unchanged across both providers.',
};

export const MAPBOX_SWAP_NOTES_UK: Record<string, string> = {
  'env-var-swap':
    'Встановіть NEXT_PUBLIC_MAPBOX_TOKEN у .env.local (або секрет GitHub NEXT_PUBLIC_MAPBOX_TOKEN) ' +
    'для переходу з MapLibre на Mapbox GL JS. Зміни коду не потрібні — ' +
    'getActiveMapProvider() виявляє токен під час виконання.',
  'same-API-surface':
    'Mapbox GL JS і MapLibre GL JS мають однакову публічну поверхню Map API. ' +
    'Усі конфіги шарів, paint-специфікації та обробники подій працюють без змін для обох провайдерів.',
};
