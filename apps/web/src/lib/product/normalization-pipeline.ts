/**
 * Normalization Pipeline — Kafka-backed multi-worker event normalization.
 *
 * Raw events from all ingest connectors land on the raw topic. Workers
 * consume, validate, geo-enrich, classify and output to the normalized topic.
 *
 * Нормалізаційний конвеєр на базі Kafka. Воркери валідують, збагачують
 * і класифікують події перед публікацією в нормалізований топік.
 */

'use server';

// ── Kafka topics ──────────────────────────────────────────────────────────────

export const NORMALIZATION_KAFKA_TOPIC = 'raw-events' as const;
export const NORMALIZATION_OUTPUT_TOPIC = 'normalized-events' as const;

// ── Pipeline stages ───────────────────────────────────────────────────────────

/**
 * Ordered stages executed by each normalization worker.
 *
 * Упорядковані стадії, що виконуються кожним воркером нормалізації.
 */
export interface PipelineStage {
  /** Stage identifier — Ідентифікатор стадії */
  id: string;
  /** Human description — Опис */
  description: string;
  /** Whether failure halts the pipeline — Чи зупиняє конвеєр при помилці */
  haltOnFailure: boolean;
  /** Target execution budget in ms — Цільовий бюджет виконання (мс) */
  budgetMs: number;
}

export const NORMALIZATION_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'schema-validate',    description: 'Validate required fields against EventSchemaV1',     haltOnFailure: true,  budgetMs: 5   },
  { id: 'dedup',              description: 'Deduplicate by source + source_id hash',              haltOnFailure: true,  budgetMs: 10  },
  { id: 'language-detect',   description: 'Detect language (langdetect)',                         haltOnFailure: false, budgetMs: 20  },
  { id: 'geo-enrich',         description: 'Reverse-geocode location to oblast/raion',            haltOnFailure: false, budgetMs: 50  },
  { id: 'nlp',                description: 'Translation + NER + Tier-1 event classification',    haltOnFailure: false, budgetMs: 200 },
  { id: 'scoring',            description: 'Compute confidence + danger scores v1',               haltOnFailure: false, budgetMs: 30  },
  { id: 'entity-link',        description: 'Link extracted entities to knowledge-graph nodes',    haltOnFailure: false, budgetMs: 40  },
  { id: 'media-extract',      description: 'Extract and store media URLs for CV verification',    haltOnFailure: false, budgetMs: 15  },
];

// ── Worker config ─────────────────────────────────────────────────────────────

export interface NormalizationWorkerConfig {
  /** Consumer group id — Ідентифікатор групи споживачів */
  consumerGroupId: string;
  /** Number of worker replicas — Кількість реплік воркера */
  replicas: number;
  /** Max records fetched per poll — Макс. записів за один poll */
  maxPollRecords: number;
  /** Commit interval in ms — Інтервал коміту (мс) */
  commitIntervalMs: number;
  /** Dead-letter topic for failed records — Топік для неопрацьованих записів */
  dlqTopic: string;
  /** Pipeline stages to execute — Стадії конвеєра */
  stages: PipelineStage[];
}

export const NORMALIZATION_WORKER_CONFIG: NormalizationWorkerConfig = {
  consumerGroupId: 'normalization-workers',
  replicas: 4,
  maxPollRecords: 50,
  commitIntervalMs: 1_000,
  dlqTopic: 'raw-events-dlq',
  stages: NORMALIZATION_PIPELINE_STAGES,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const NORMALIZATION_NOTE_EN =
  'All ingest connectors publish to raw-events. Workers are stateless and horizontally scalable. ' +
  'DLQ records are retried with exponential back-off (max 5 attempts) then moved to dead-letter storage.';

export const NORMALIZATION_NOTE_UK =
  'Всі коннектори публікують у raw-events. Воркери — stateless, горизонтально масштабовані. ' +
  'Записи DLQ повторюються з експоненційним відкатом (макс. 5 спроб), потім архівуються.';
