/**
 * SAR Integration — Sentinel-1 Synthetic Aperture Radar + change detection.
 *
 * Sentinel-1 provides all-weather, day/night radar imagery. Change detection
 * highlights structural damage, new earthworks, and troop buildups between
 * consecutive passes.
 *
 * SAR-інтеграція: Sentinel-1 + виявлення змін. Всепогодне/нічне знімання.
 */

'use server';

// ── Provider ──────────────────────────────────────────────────────────────────

export const SAR_PROVIDER = 'sentinel-1' as const;

// ── Cadence ───────────────────────────────────────────────────────────────────

/** Target change-detection run cadence in hours — Інтервал виявлення змін (год) */
export const CHANGE_DETECTION_INTERVAL_HOURS = 24;

/** Sentinel-1 repeat cycle in days — Цикл повторного знімання Sentinel-1 (дні) */
export const SAR_REPEAT_CYCLE_DAYS = 6;

// ── SAR config ────────────────────────────────────────────────────────────────

export interface SarIntegrationConfig {
  provider: typeof SAR_PROVIDER;
  /** ESA Copernicus API endpoint — Endpoint API Copernicus */
  apiEndpoint: string;
  /** Collection name — Назва колекції */
  collection: string;
  /** Polarisation modes — Режими поляризації */
  polarisations: string[];
  /** Change detection algorithm — Алгоритм виявлення змін */
  changeDetectionAlgorithm: string;
  /** Minimum change score to flag (0–1) — Мін. оцінка зміни для позначення */
  changeScoreThreshold: number;
  changeDetectionIntervalHours: number;
  repeatCycleDays: number;
  /** Cloud storage bucket for SAR tiles — Бакет для тайлів SAR */
  storageBucket: string;
  /** Tile format — Формат тайлу */
  tileFormat: 'GeoTIFF' | 'COG';
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

export const SAR_INTEGRATION_CONFIG: SarIntegrationConfig = {
  provider: SAR_PROVIDER,
  apiEndpoint: 'https://scihub.copernicus.eu/dhus/search',
  collection: 'SENTINEL-1',
  polarisations: ['VV', 'VH'],
  changeDetectionAlgorithm: 'coherence-change-detection',
  changeScoreThreshold: 0.25,
  changeDetectionIntervalHours: CHANGE_DETECTION_INTERVAL_HOURS,
  repeatCycleDays: SAR_REPEAT_CYCLE_DAYS,
  storageBucket: 'aegis-sar-tiles',
  tileFormat: 'COG',
  requiredTier: 'enterprise',
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SAR_NOTE_EN =
  'Sentinel-1 imagery is freely available via ESA Copernicus. Change detection ' +
  'runs on consecutive pass pairs within the same AOI. Results are overlaid on ' +
  'the satellite layer as a change-probability heatmap.';

export const SAR_NOTE_UK =
  'Знімки Sentinel-1 безкоштовно доступні через ESA Copernicus. Виявлення змін ' +
  'запускається на парах послідовних прольотів в межах одного AOI. Результати ' +
  'відображаються як теплова карта ймовірності зміни на супутниковому шарі.';
