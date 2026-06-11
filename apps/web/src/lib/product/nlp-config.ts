/**
 * NLP Config — translation, named-entity recognition, and Tier-1 event
 * classification models used in the normalization pipeline.
 *
 * Конфігурація NLP: переклад, NER та класифікація подій Tier-1.
 */

'use server';

// ── NlpTask enum ──────────────────────────────────────────────────────────────

export enum NlpTask {
  Translation       = 'translation',
  Ner               = 'ner',
  EventClassification = 'event-classification',
}

// ── Tier-1 event classes ──────────────────────────────────────────────────────

/**
 * Top-level event classification taxonomy for conflict intelligence.
 *
 * Таксономія подій верхнього рівня для конфліктної розвідки.
 */
export const TIER1_EVENT_CLASSES = [
  'airstrike',
  'artillery-shelling',
  'ground-assault',
  'explosion-unconfirmed',
  'missile-launch',
  'drone-activity',
  'naval-engagement',
  'civilian-casualty',
  'infrastructure-damage',
  'humanitarian-corridor',
  'troop-movement',
  'surrender-pow',
  'cyber-attack',
  'disinformation-campaign',
  'border-crossing',
] as const;

export type Tier1EventClass = typeof TIER1_EVENT_CLASSES[number];

export const TIER1_CLASS_COUNT = TIER1_EVENT_CLASSES.length; // 15

// ── NLP models ────────────────────────────────────────────────────────────────

/**
 * Model identifiers per NLP task. Replaceable via environment variable overrides.
 *
 * Ідентифікатори моделей NLP. Можна перевизначити через env-змінні.
 */
export const NLP_MODELS: Record<NlpTask, string> = {
  [NlpTask.Translation]:        'Helsinki-NLP/opus-mt-mul-en',
  [NlpTask.Ner]:                'Babelscape/wikineural-multilingual-ner',
  [NlpTask.EventClassification]: 'aegis/conflict-classifier-v1',
};

// ── Pipeline config ───────────────────────────────────────────────────────────

export interface NlpPipelineConfig {
  /** Source languages supported — Підтримувані мови джерел */
  sourceLanguages: string[];
  /** Target language for all translations — Цільова мова перекладу */
  targetLanguage: string;
  /** NER entity types to extract — Типи сутностей NER для вилучення */
  nerEntityTypes: string[];
  /** Min NER confidence to accept — Мін. довіра NER для прийняття */
  nerConfidenceThreshold: number;
  /** Min classifier confidence for Tier-1 label — Мін. довіра класифікатора */
  classifierConfidenceThreshold: number;
  /** Batch size for model inference — Розмір батчу для інференсу */
  batchSize: number;
  /** Max tokens per inference call — Макс. токенів за виклик */
  maxTokens: number;
  models: Record<NlpTask, string>;
  tier1Classes: ReadonlyArray<Tier1EventClass>;
}

export const NLP_PIPELINE_CONFIG: NlpPipelineConfig = {
  sourceLanguages: ['uk', 'ru', 'en', 'ar', 'he'],
  targetLanguage: 'en',
  nerEntityTypes: ['PER', 'ORG', 'LOC', 'GPE', 'WEAPON', 'UNIT'],
  nerConfidenceThreshold: 0.7,
  classifierConfidenceThreshold: 0.55,
  batchSize: 32,
  maxTokens: 512,
  models: NLP_MODELS,
  tier1Classes: TIER1_EVENT_CLASSES,
};
