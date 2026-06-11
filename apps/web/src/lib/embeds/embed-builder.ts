/**
 * Embed Builder — multi-step UI state machine and final snippet assembler.
 *
 * Drives the 6-step wizard: pick type → configure → theme → locale → preview → copy.
 * Керує 6-кроковим майстром налаштування embed-сніпету.
 */

import { buildMapEmbedSnippet, MapEmbedConfig } from './map-embed';
import { buildEventCardSnippet, EventCardEmbedConfig } from './event-card-embed';
import { buildTimelineEmbedSnippet, TimelineEmbedConfig } from './timeline-embed';
import { buildHeatmapEmbedSnippet, HeatmapEmbedConfig } from './heatmap-embed';
import { buildRegionBriefSnippet, RegionBriefEmbedConfig } from './region-brief-embed';

// ── Step definitions ──────────────────────────────────────────────────────────

/**
 * Ordered wizard steps.
 *
 * Кроки майстра налаштування.
 */
export type EmbedBuilderStep =
  | 'pick-type'
  | 'configure'
  | 'theme'
  | 'locale'
  | 'preview'
  | 'copy';

/** Ordered list of all steps. Упорядкований список кроків. */
export const EMBED_BUILDER_STEPS: ReadonlyArray<EmbedBuilderStep> = [
  'pick-type',
  'configure',
  'theme',
  'locale',
  'preview',
  'copy',
];

// ── Embed types ───────────────────────────────────────────────────────────────

/** Supported embed type identifiers. Ідентифікатори типів embed. */
export type EmbedType = 'map' | 'event-card' | 'timeline' | 'heatmap' | 'region-brief';

/** Metadata for a single embed type displayed in the picker. Метадані типу embed. */
export interface EmbedTypeMeta {
  id: EmbedType;
  /** Human-readable label (English). Назва типу (англ.). */
  label: string;
  /** Human-readable label (Ukrainian). Назва типу (укр.). */
  labelUk: string;
  /** Lucide or custom icon name. Назва іконки. */
  icon: string;
  /** Short description. Короткий опис. */
  description: string;
}

/**
 * Catalogue of all available embed types.
 *
 * Каталог усіх доступних типів embed.
 */
export const EMBED_TYPES: ReadonlyArray<EmbedTypeMeta> = [
  {
    id: 'map',
    label: 'Live Map',
    labelUk: 'Жива карта',
    icon: 'map',
    description: 'Real-time event map with layer controls.',
  },
  {
    id: 'event-card',
    label: 'Event Card',
    labelUk: 'Картка події',
    icon: 'file-text',
    description: 'Compact card for a single verified event.',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    labelUk: 'Хронологія',
    icon: 'clock',
    description: 'Animated event timeline with playback controls.',
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    labelUk: 'Теплова карта',
    icon: 'flame',
    description: 'Event-density heatmap by type and period.',
  },
  {
    id: 'region-brief',
    label: 'Region Brief',
    labelUk: 'Регіональний бриф',
    icon: 'layout-list',
    description: 'Auto-updating situational summary for a region.',
  },
];

// ── Builder state ─────────────────────────────────────────────────────────────

/**
 * Transient UI state for the embed builder wizard.
 *
 * Стан майстра налаштування (зберігається у UI-шарі).
 */
export interface EmbedBuilderState {
  /** Current wizard step. Поточний крок. */
  step: EmbedBuilderStep;
  /** Chosen embed type (null until step 1 is complete). Обраний тип embed. */
  embedType: EmbedType | null;
  /** Type-specific configuration payload. Конфігурація залежно від типу. */
  config: Partial<
    MapEmbedConfig &
      EventCardEmbedConfig &
      TimelineEmbedConfig &
      HeatmapEmbedConfig &
      RegionBriefEmbedConfig
  >;
  /** Generated snippet (populated on preview step). Згенерований сніпет. */
  snippet: string;
}

/** Initial empty builder state. Початковий стан майстра. */
export const EMBED_BUILDER_INITIAL_STATE: EmbedBuilderState = {
  step: 'pick-type',
  embedType: null,
  config: {},
  snippet: '',
};

// ── Snippet assembler ─────────────────────────────────────────────────────────

/**
 * Assemble the final embed snippet from the completed builder state.
 * Returns an empty string if embedType is null.
 *
 * Збирає фінальний сніпет із заповненого стану майстра.
 */
export function buildFinalSnippet(state: EmbedBuilderState): string {
  if (!state.embedType) return '';

  const cfg = state.config as Record<string, unknown>;

  switch (state.embedType) {
    case 'map':
      return buildMapEmbedSnippet(cfg as MapEmbedConfig);
    case 'event-card':
      return buildEventCardSnippet(cfg as EventCardEmbedConfig);
    case 'timeline':
      return buildTimelineEmbedSnippet(cfg as TimelineEmbedConfig);
    case 'heatmap':
      return buildHeatmapEmbedSnippet(cfg as HeatmapEmbedConfig);
    case 'region-brief':
      return buildRegionBriefSnippet(cfg as RegionBriefEmbedConfig);
    default:
      return '';
  }
}

// ── Step navigation helpers ───────────────────────────────────────────────────

/**
 * Advance to the next wizard step.
 *
 * Перехід до наступного кроку.
 */
export function nextStep(current: EmbedBuilderStep): EmbedBuilderStep {
  const idx = EMBED_BUILDER_STEPS.indexOf(current);
  return EMBED_BUILDER_STEPS[Math.min(idx + 1, EMBED_BUILDER_STEPS.length - 1)];
}

/**
 * Go back to the previous wizard step.
 *
 * Повернення до попереднього кроку.
 */
export function prevStep(current: EmbedBuilderStep): EmbedBuilderStep {
  const idx = EMBED_BUILDER_STEPS.indexOf(current);
  return EMBED_BUILDER_STEPS[Math.max(idx - 1, 0)];
}
