/**
 * dbt Transformation Layer — model registry and documentation notes.
 * Шар трансформацій dbt — реєстр моделей та нотатки документації.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * dbt model layer in the medallion architecture.
 * Рівень моделі dbt в медальйонній архітектурі.
 */
export type DbtLayerId = "staging" | "intermediate" | "mart" | "exposure";

/** Metadata for a single dbt model. */
export interface DbtModelConfig {
  /** Unique model identifier (matches dbt model file name). */
  id: string;
  /** Architecture layer this model belongs to. */
  layer: DbtLayerId;
  /** Human-readable model name — English. */
  name_en: string;
  /** Human-readable model name — Ukrainian. */
  name_uk: string;
  /** Source table(s) this model reads from — English. */
  sourceTable_en: string;
  /** Source table(s) this model reads from — Ukrainian. */
  sourceTable_uk: string;
  /** Output table produced by this model — English. */
  outputTable_en: string;
  /** Output table produced by this model — Ukrainian. */
  outputTable_uk: string;
  /** What this model does — English. */
  description_en: string;
  /** What this model does — Ukrainian. */
  description_uk: string;
  /** Refresh cadence — English. */
  frequency_en: string;
  /** Refresh cadence — Ukrainian. */
  frequency_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Model registry
// ---------------------------------------------------------------------------

/** Registered dbt models for the Aegis Lens data warehouse. */
export const DBT_MODELS: DbtModelConfig[] = [
  {
    id: "stg_events",
    layer: "staging",
    name_en: "Staged Events",
    name_uk: "Стейджинг подій",
    sourceTable_en: "raw.ingest_events",
    sourceTable_uk: "raw.ingest_events (сирі події)",
    outputTable_en: "staging.stg_events",
    outputTable_uk: "staging.stg_events",
    description_en:
      "Cleans and types raw ingest events: parses timestamps to UTC, casts confidence to float, " +
      "strips HTML from summaries, and coalesces missing locale fields.",
    description_uk:
      "Очищає та типізує сирі події вхідного потоку: парсить часові мітки до UTC, " +
      "перетворює достовірність на float, видаляє HTML з резюме та консолідує відсутні поля локалі.",
    frequency_en: "Hourly",
    frequency_uk: "Щогодини",
    notes_en: "Foundation for all downstream models. Failing tests here block the entire pipeline.",
    notes_uk: "Фундамент для всіх моделей нижнього потоку. Провал тестів тут блокує весь конвеєр.",
  },
  {
    id: "stg_entities",
    layer: "staging",
    name_en: "Staged Entities",
    name_uk: "Стейджинг сутностей",
    sourceTable_en: "raw.kg_entities",
    sourceTable_uk: "raw.kg_entities (сирі сутності)",
    outputTable_en: "staging.stg_entities",
    outputTable_uk: "staging.stg_entities",
    description_en:
      "Normalises raw KG entity records: deduplicates by canonical ID, applies locale label resolution, " +
      "and flags retracted entities.",
    description_uk:
      "Нормалізує сирі записи сутностей БЗ: дедублює за канонічним ID, застосовує вирішення міток за локаллю " +
      "та позначає відкликані сутності.",
    frequency_en: "Daily",
    frequency_uk: "Щодня",
    notes_en: "Retracted entities are included with a `is_retracted` flag, never hard-deleted.",
    notes_uk: "Відкликані сутності включені з прапорцем `is_retracted`, жорстке видалення не застосовується.",
  },
  {
    id: "int_events_enriched",
    layer: "intermediate",
    name_en: "Enriched Events",
    name_uk: "Збагачені події",
    sourceTable_en: "staging.stg_events, staging.stg_entities",
    sourceTable_uk: "staging.stg_events, staging.stg_entities",
    outputTable_en: "intermediate.int_events_enriched",
    outputTable_uk: "intermediate.int_events_enriched",
    description_en:
      "Joins staged events with their referenced entities to produce a denormalised enriched record " +
      "including entity type, canonical label, and sameAs links.",
    description_uk:
      "Об'єднує стейджингові події з їхніми сутностями для отримання денормалізованого збагаченого запису, " +
      "що включає тип сутності, канонічну мітку та посилання sameAs.",
    frequency_en: "Hourly",
    frequency_uk: "Щогодини",
    notes_en: "Output feeds mart_daily_activity and the API exposure view.",
    notes_uk: "Вихід живить mart_daily_activity та виставлення API.",
  },
  {
    id: "mart_daily_activity",
    layer: "mart",
    name_en: "Daily Activity Mart",
    name_uk: "Мarт щоденної активності",
    sourceTable_en: "intermediate.int_events_enriched",
    sourceTable_uk: "intermediate.int_events_enriched",
    outputTable_en: "marts_events.mart_daily_activity",
    outputTable_uk: "marts_events.mart_daily_activity",
    description_en:
      "Aggregates enriched events into daily event counts per oblast, source, and entity type. " +
      "Powers the regional heatmap and trend charts.",
    description_uk:
      "Агрегує збагачені події в щоденну кількість подій по областях, джерелах та типах сутностей. " +
      "Живить регіональну теплову карту та графіки трендів.",
    frequency_en: "Daily (incremental, late-arriving events handled with 48h watermark)",
    frequency_uk: "Щодня (інкрементально, із 48-годинним водяним знаком для запізнілих подій)",
    notes_en: "Owner: data-eng. Primary mart for executive dashboard.",
    notes_uk: "Власник: data-eng. Основний mart для виконавчого дашборду.",
  },
  {
    id: "mart_source_quality",
    layer: "mart",
    name_en: "Source Quality Mart",
    name_uk: "Март якості джерел",
    sourceTable_en: "staging.stg_events, raw.slo_checks",
    sourceTable_uk: "staging.stg_events, raw.slo_checks",
    outputTable_en: "marts_intelligence.mart_source_quality",
    outputTable_uk: "marts_intelligence.mart_source_quality",
    description_en:
      "Per-source daily freshness, completeness, schema-conformance, and uniqueness metrics. " +
      "Used to generate the weekly data-quality report and public source-health page.",
    description_uk:
      "Щоденні метрики свіжості, повноти, відповідності схемі та унікальності по кожному джерелу. " +
      "Використовується для генерації щотижневого звіту про якість даних та публічної сторінки стану джерел.",
    frequency_en: "Daily",
    frequency_uk: "Щодня",
    notes_en: "Owner: data-eng. SLO breach triggers automated Jira ticket creation.",
    notes_uk: "Власник: data-eng. Порушення SLO ініціює автоматичне створення тікета Jira.",
  },
  {
    id: "exposure_api",
    layer: "exposure",
    name_en: "API Exposure View",
    name_uk: "Виставлення для API",
    sourceTable_en: "intermediate.int_events_enriched, marts_events.mart_daily_activity",
    sourceTable_uk: "intermediate.int_events_enriched, marts_events.mart_daily_activity",
    outputTable_en: "exposure.exposure_api",
    outputTable_uk: "exposure.exposure_api",
    description_en:
      "Materialised view pre-joined and pre-filtered for low-latency API queries. " +
      "Includes only publicly releasable fields; PII and draft-state records excluded.",
    description_uk:
      "Матеріалізований вигляд із попереднім об'єднанням та фільтрацією для низько-латентних API-запитів. " +
      "Включає лише поля, дозволені до публічного поширення; персональні дані та чернеткові записи виключені.",
    frequency_en: "Hourly",
    frequency_uk: "Щогодини",
    notes_en: "Owner: platform. Query p99 < 50ms SLO enforced by index on (event_date, region_id).",
    notes_uk: "Власник: platform. SLO p99 < 50мс забезпечується індексом по (event_date, region_id).",
  },
];

// ---------------------------------------------------------------------------
// Testing & docs notes
// ---------------------------------------------------------------------------

export const DBT_TESTING_NOTE_EN =
  "All dbt models have test coverage for: not-null on primary keys, " +
  "unique constraints on deduplication keys, referential integrity on all FK columns (using dbt_utils.relationship), " +
  "and accepted_values on enum fields. " +
  "Custom expression tests enforce confidence ∈ [0,1] and severity ∈ [1,5].";

export const DBT_TESTING_NOTE_UK =
  "Усі моделі dbt охоплені тестами: not-null для первинних ключів, " +
  "унікальність для ключів дедуплікації, цілісність посилань для всіх FK-стовпців (dbt_utils.relationship), " +
  "та accepted_values для enum-полів. " +
  "Кастомні expression-тести забезпечують confidence ∈ [0,1] та severity ∈ [1,5].";

export const DBT_DOCS_NOTE_EN =
  "dbt docs are generated on every merge to main and hosted at `docs.<domain>/dbt`. " +
  "The lineage DAG, model descriptions, and column-level documentation are visible to the whole team. " +
  "Catalog entries are synced to DataHub for cross-tool discoverability.";

export const DBT_DOCS_NOTE_UK =
  "Документація dbt генерується при кожному злитті в main та розміщується за адресою `docs.<domain>/dbt`. " +
  "DAG залежностей, описи моделей та документація на рівні стовпців доступні всій команді. " +
  "Записи каталогу синхронізуються з DataHub для виявлення між інструментами.";
