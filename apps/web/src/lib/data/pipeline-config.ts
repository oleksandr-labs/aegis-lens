/**
 * Pipeline & ETL Configuration — Aegis Lens / Ukrainian MAP
 *
 * Streaming-first, replayable pipelines: raw source → normalize → enrich
 * → verify → index → serve. Replayability > realtime perfection.
 *
 * Стримінг-first, відтворювані пайплайни: сире джерело → нормалізація →
 * збагачення → верифікація → індексація → подача. Відтворюваність важливіша за
 * досконалість у реальному часі.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Kafka topic identifiers used in the pipeline.
 *
 * Ідентифікатори Kafka-топіків, які використовуються в пайплайні.
 */
export type KafkaTopic =
  | "raw"
  | "events-normalized"
  | "events-enriched"
  | "events-verified"
  | "events-indexed"
  | "dlq"
  | "schema-changes";

/**
 * Stable identifier for each pipeline stage.
 *
 * Стабільний ідентифікатор кожного етапу пайплайну.
 */
export type PipelineStageId =
  | "ingest"
  | "normalize"
  | "enrich"
  | "verify"
  | "index"
  | "serve";

/**
 * Orchestration engine driving a pipeline stage.
 *
 * Рушій оркестрації, що керує етапом пайплайну.
 */
export type OrchestrationEngine = "kafka" | "temporal" | "airflow" | "direct";

/**
 * Full configuration record for a single pipeline stage.
 *
 * Повний запис конфігурації одного етапу пайплайну.
 */
export interface PipelineStage {
  /** Stable stage identifier. */
  id: PipelineStageId;
  /** Stage name in English. */
  name_en: string;
  /** Stage name in Ukrainian. */
  name_uk: string;
  /** Kafka topic consumed as input for this stage. */
  inputTopic: KafkaTopic;
  /**
   * Kafka topic this stage publishes to.
   * null for the final serve stage (output goes to Postgres/API directly).
   */
  outputTopic: KafkaTopic | null;
  /** Primary orchestration engine for this stage. */
  orchestration: OrchestrationEngine;
  /** Stage description in English. */
  description_en: string;
  /** Stage description in Ukrainian. */
  description_uk: string;
  /** Additional implementation notes in English. */
  notes_en: string;
  /** Additional implementation notes in Ukrainian. */
  notes_uk: string;
}

// ── Pipeline stage catalog ────────────────────────────────────────────────────

/**
 * All 6 pipeline stages from raw ingestion to serving.
 *
 * Усі 6 етапів пайплайну від сирої інгестії до подачі.
 */
export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "ingest",
    name_en: "Ingest (Raw → raw.<source>)",
    name_uk: "Інгестія (сирий → raw.<source>)",
    inputTopic: "raw",
    outputTopic: "raw",
    orchestration: "kafka",
    description_en:
      "Ingests raw payloads from all sources (Telegram, Twitter/X, news scrapers, satellite feeds, RSS) and writes them immutably to a per-source Kafka topic (e.g. raw.telegram, raw.twitter). No transformation — the raw payload is archived as-is before any processing.",
    description_uk:
      "Інгестія сирих payload з усіх джерел (Telegram, Twitter/X, новинні скрапери, супутникові фіди, RSS) та запис їх незмінно до per-source Kafka-топіку (наприклад raw.telegram, raw.twitter). Жодних трансформацій — сирий payload архівується як є до будь-якої обробки.",
    notes_en:
      "PII redaction applied before writing to Kafka. Each message carries source, source_id, and SHA-256 content hash for downstream dedup. Raw archive written to S3 in parallel.",
    notes_uk:
      "PII-редакція застосовується перед записом у Kafka. Кожне повідомлення містить source, source_id та SHA-256 хеш вмісту для дедупліяції на наступних етапах. Сирий архів паралельно записується на S3.",
  },
  {
    id: "normalize",
    name_en: "Normalize (raw.<source> → events.normalized)",
    name_uk: "Нормалізація (raw.<source> → events.normalized)",
    inputTopic: "raw",
    outputTopic: "events-normalized",
    orchestration: "kafka",
    description_en:
      "Consumes per-source raw topics and transforms them into a canonical event schema: normalised timestamps (UTC ISO 8601), structured location fields (lat/lon or region reference), event type classification, and language detection.",
    description_uk:
      "Споживає per-source сирі топіки та трансформує їх у канонічну схему подій: нормалізовані мітки часу (UTC ISO 8601), структуровані поля локації (lat/lon або посилання на регіон), класифікацію типу події та визначення мови.",
    notes_en:
      "Idempotent: dedup by (source, source_id, hash) prevents duplicate normalized events. Schema validated against schema registry before publish.",
    notes_uk:
      "Ідемпотентний: дедупліяція за (source, source_id, hash) запобігає дублюванню нормалізованих подій. Схема перевіряється в реєстрі схем перед публікацією.",
  },
  {
    id: "enrich",
    name_en: "Enrich (events.normalized → events.enriched)",
    name_uk: "Збагачення (events.normalized → events.enriched)",
    inputTopic: "events-normalized",
    outputTopic: "events-enriched",
    orchestration: "kafka",
    description_en:
      "Applies NLP (named-entity recognition, sentiment, event sub-type), computer vision (object detection, geolocation matching from imagery), and geo enrichment (reverse geocoding, region assignment, spatial context). Adds translated fields alongside original language text.",
    description_uk:
      "Застосовує NLP (розпізнавання іменованих сутностей, сентимент, підтип події), комп'ютерний зір (виявлення об'єктів, збіг геолокації із зображень) та гео-збагачення (зворотне геокодування, призначення регіону, просторовий контекст). Додає перекладені поля поруч з оригінальним мовним текстом.",
    notes_en:
      "Original language text preserved and never overwritten. Enriched fields appended with _en/_uk suffixes. Heavy CV jobs dispatched to GPU worker pool via Temporal.",
    notes_uk:
      "Оригінальний мовний текст зберігається і ніколи не перезаписується. Збагачені поля додаються з суфіксами _en/_uk. Важкі CV-завдання відправляються до GPU-пул воркерів через Temporal.",
  },
  {
    id: "verify",
    name_en: "Verify (events.enriched → events.verified)",
    name_uk: "Верифікація (events.enriched → events.verified)",
    inputTopic: "events-enriched",
    outputTopic: "events-verified",
    orchestration: "kafka",
    description_en:
      "Cross-source corroboration: checks whether the event appears in at least N independent sources, computes a confidence score (0–1), flags conflicting reports, and applies human-review routing for low-confidence or high-impact events.",
    description_uk:
      "Крос-джерелова перевірка: перевіряє, чи з'являється подія принаймні в N незалежних джерелах, обчислює оцінку впевненості (0–1), позначає суперечливі репортажі та застосовує маршрутизацію для ручного перегляду низько-впевнених або високовпливових подій.",
    notes_en:
      "Dead-letter queue (DLQ) receives events that fail verification schema checks. Replay from DLQ after fix is supported.",
    notes_uk:
      "Dead-letter queue (DLQ) отримує події, що не пройшли перевірку схеми верифікації. Підтримується replay з DLQ після виправлення.",
  },
  {
    id: "index",
    name_en: "Index (events.verified → Postgres + Elastic + Qdrant)",
    name_uk: "Індексація (events.verified → Postgres + Elastic + Qdrant)",
    inputTopic: "events-verified",
    outputTopic: "events-indexed",
    orchestration: "kafka",
    description_en:
      "Persists verified events to all destination stores in parallel: Postgres/PostGIS (canonical record), Elasticsearch (full-text index), and Qdrant (vector embeddings). Publishes events-indexed confirmation topic after all writes succeed.",
    description_uk:
      "Зберігає верифіковані події у всі цільові сховища паралельно: Postgres/PostGIS (канонічний запис), Elasticsearch (повнотекстовий індекс) та Qdrant (векторні вбудовування). Публікує топік підтвердження events-indexed після успішного запису до всіх сховищ.",
    notes_en:
      "Transactional write to Postgres; Elastic and Qdrant writes are eventually consistent. On Elastic/Qdrant failure, events are re-queued for indexing retry.",
    notes_uk:
      "Транзакційний запис до Postgres; записи в Elastic та Qdrant є зрештою узгодженими. При збої Elastic/Qdrant події ставляться в чергу для повторної індексації.",
  },
  {
    id: "serve",
    name_en: "Serve (events.verified → API / WebSocket / Tiles)",
    name_uk: "Подача (events.verified → API / WebSocket / тайли)",
    inputTopic: "events-verified",
    outputTopic: null,
    orchestration: "direct",
    description_en:
      "Delivers verified events to consumers in real time: REST API responses (served from Postgres), WebSocket push (via Redis pub/sub), and vector tile generation (map layers). No separate Kafka consumer — reads directly from Postgres for REST; subscribes to Redis channels for WebSocket.",
    description_uk:
      "Доставляє верифіковані події споживачам у реальному часі: відповіді REST API (з Postgres), WebSocket push (через Redis pub/sub) та генерація векторних тайлів (шари карти). Окремого Kafka-споживача немає — читає безпосередньо з Postgres для REST; підписується на Redis-канали для WebSocket.",
    notes_en:
      "Tile generation can be pre-warmed for popular zoom levels. WebSocket fan-out capped per connection to prevent overload.",
    notes_uk:
      "Генерація тайлів може бути попередньо підготовлена для популярних рівнів зуму. Розгалуження WebSocket обмежено на з'єднання для запобігання перевантаженню.",
  },
];

// ── Principles & notes ────────────────────────────────────────────────────────

/**
 * Temporal workflows note — English.
 * Temporal handles non-streaming, long-running orchestration jobs.
 */
export const TEMPORAL_WORKFLOWS_NOTE_EN =
  "Temporal is used for non-streaming jobs that require durable orchestration: satellite area-of-interest (AOI) processing, batch computer-vision pipelines, and periodic export generation. These jobs cannot be modelled as stateless Kafka consumers.";

/**
 * Temporal workflows note — Ukrainian.
 * Temporal керує несинхронними тривалими завданнями оркестрації.
 */
export const TEMPORAL_WORKFLOWS_NOTE_UK =
  "Temporal використовується для не-стримінгових завдань, що потребують стійкої оркестрації: обробка зон інтересу (AOI) супутників, пакетні пайплайни комп'ютерного зору та генерація планових експортів. Ці завдання не можна змоделювати як stateless Kafka-споживачів.";

/**
 * Backfill and replay note — English.
 * Any topic can be replayed for any time range.
 */
export const BACKFILL_REPLAY_NOTE_EN =
  "Full backfill and replay capability: any Kafka topic can be replayed for any time range by resetting consumer group offsets. Critical for data recovery, re-enrichment after model upgrades, and populating new storage layers without re-ingesting from source.";

/**
 * Backfill and replay note — Ukrainian.
 * Будь-який топік можна відтворити для будь-якого часового діапазону.
 */
export const BACKFILL_REPLAY_NOTE_UK =
  "Повна можливість бекфілу та replay: будь-який Kafka-топік можна відтворити для будь-якого часового діапазону, скинувши зміщення consumer group. Критично для відновлення даних, повторного збагачення після оновлень моделей і наповнення нових рівнів сховища без повторної інгестії з джерела.";

/**
 * Schema registry note — English.
 * All Kafka topics use registered Avro/Protobuf schemas with compatibility checks.
 */
export const SCHEMA_REGISTRY_NOTE_EN =
  "All Kafka topics use Avro or Protobuf schemas registered in the schema registry. Backward-compatibility checks are enforced at publish time: breaking changes (field removal, type change) are blocked until a migration path is approved and all consumers updated.";

/**
 * Schema registry note — Ukrainian.
 * Усі Kafka-топіки використовують зареєстровані схеми з перевірками сумісності.
 */
export const SCHEMA_REGISTRY_NOTE_UK =
  "Усі Kafka-топіки використовують схеми Avro або Protobuf, зареєстровані в реєстрі схем. Перевірки зворотної сумісності застосовуються при публікації: порушуючі зміни (видалення поля, зміна типу) блокуються до затвердження шляху міграції та оновлення всіх споживачів.";

/**
 * Per-source SLO note — English.
 * Each data source has defined freshness, completeness, and schema conformance SLOs.
 */
export const PER_SOURCE_SLO_NOTE_EN =
  "Per-source data-quality SLOs: freshness ≤5 minutes (p95 lag from source publish to events.verified), completeness ≥99% (no silent drops), schema conformance ≥99.9% (messages passing schema validation). SLO breaches trigger PagerDuty alerts.";

/**
 * Per-source SLO note — Ukrainian.
 * Кожне джерело даних має визначені SLO свіжості, повноти та відповідності схемі.
 */
export const PER_SOURCE_SLO_NOTE_UK =
  "SLO якості даних на джерело: свіжість ≤5 хвилин (p95 затримка від публікації джерела до events.verified), повнота ≥99% (жодних тихих втрат), відповідність схемі ≥99,9% (повідомлення, що проходять валідацію схеми). Порушення SLO запускають сповіщення PagerDuty.";

/**
 * Replayability principle — English.
 * The core design axiom of the pipeline.
 */
export const REPLAYABILITY_PRINCIPLE_EN =
  "Replayability > realtime perfection. We must be able to rebuild any derived view — Postgres tables, Elastic indexes, Qdrant collections, Parquet archives — from raw Kafka topics alone. No derived state is irreplaceable.";

/**
 * Replayability principle — Ukrainian.
 * Основна проєктна аксіома пайплайну.
 */
export const REPLAYABILITY_PRINCIPLE_UK =
  "Відтворюваність важливіша за досконалість у реальному часі. Ми повинні мати можливість відновити будь-який похідний вигляд — таблиці Postgres, індекси Elastic, колекції Qdrant, Parquet-архіви — лише з сирих Kafka-топіків. Жоден похідний стан не є незамінним.";

/**
 * i18n pipeline note — English.
 * How multilingual content flows through the pipeline without data loss.
 */
export const I18N_PIPELINE_NOTE_EN =
  "Original language is preserved alongside translated fields at every stage. The enrich stage adds translated fields (e.g. title_en, title_uk) without modifying the original field (e.g. title_original). Overwriting original text is a data integrity violation.";

/**
 * i18n pipeline note — Ukrainian.
 * Як багатомовний контент проходить пайплайн без втрати даних.
 */
export const I18N_PIPELINE_NOTE_UK =
  "Оригінальна мова зберігається поруч з перекладеними полями на кожному етапі. Етап збагачення додає перекладені поля (наприклад title_en, title_uk) без модифікації оригінального поля (наприклад title_original). Перезапис оригінального тексту є порушенням цілісності даних.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a Kafka topic name for a given stage and source.
 * Побудова назви Kafka-топіку для заданого етапу та джерела.
 *
 * @example
 * buildPipelineTopicName("ingest", "telegram")   // → "raw.telegram"
 * buildPipelineTopicName("normalize", "twitter")  // → "events.normalized.twitter"
 */
export function buildPipelineTopicName(
  stage: PipelineStageId,
  source: string,
): string {
  const sanitized = source.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  switch (stage) {
    case "ingest":
      return `raw.${sanitized}`;
    case "normalize":
      return `events.normalized.${sanitized}`;
    case "enrich":
      return `events.enriched.${sanitized}`;
    case "verify":
      return `events.verified.${sanitized}`;
    case "index":
      return `events.indexed.${sanitized}`;
    case "serve":
      return `serve.${sanitized}`;
    default:
      return `pipeline.${stage}.${sanitized}`;
  }
}

/**
 * Look up a pipeline stage by its stable identifier.
 * Пошук етапу пайплайну за стабільним ідентифікатором.
 */
export function getPipelineStage(
  id: PipelineStageId,
): PipelineStage | undefined {
  return PIPELINE_STAGES.find((stage) => stage.id === id);
}
