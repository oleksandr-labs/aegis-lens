/**
 * CDC & Cold Archive — Change Data Capture configuration and archive tier definitions.
 * CDC та холодний архів — конфігурація захоплення змін даних та визначення рівнів архіву.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Postgres tables opted-in to CDC via Debezium.
 * Таблиці Postgres, підключені до CDC через Debezium.
 */
export type CdcSourceTable =
  | "events"
  | "entities"
  | "relations"
  | "users"
  | "audit_log"
  | "sources";

/**
 * S3 archive temperature tier.
 * Рівень температури архіву S3.
 */
export type ArchiveTier = "warm" | "cold" | "deep-frozen";

/**
 * CDC configuration for one source table.
 * Конфігурація CDC для однієї вихідної таблиці.
 */
export interface CdcConfig {
  /** Source table being captured. */
  table: CdcSourceTable;
  /** Kafka topic name — English label. */
  kafkaTopic_en: string;
  /** Kafka topic name — Ukrainian label. */
  kafkaTopic_uk: string;
  /** CDC mechanism used. */
  cdcTool: "debezium" | "pgoutput";
  /** How many days Kafka retains the change stream for this table. */
  retentionDays: number;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// CDC configs
// ---------------------------------------------------------------------------

/** CDC configurations for the key platform tables. */
export const CDC_CONFIGS: CdcConfig[] = [
  {
    table: "events",
    kafkaTopic_en: "aegis.events.cdc",
    kafkaTopic_uk: "Тема Kafka: зміни таблиці подій",
    cdcTool: "debezium",
    retentionDays: 365,
    notes_en:
      "High-volume table; all INSERT/UPDATE/DELETE captured. " +
      "Sensitive fields (raw_payload, summary_en, summary_uk) excluded from CDC stream.",
    notes_uk:
      "Таблиця з великим обсягом; фіксуються всі INSERT/UPDATE/DELETE. " +
      "Чутливі поля (raw_payload, summary_en, summary_uk) виключені з потоку CDC.",
  },
  {
    table: "entities",
    kafkaTopic_en: "aegis.entities.cdc",
    kafkaTopic_uk: "Тема Kafka: зміни таблиці сутностей",
    cdcTool: "debezium",
    retentionDays: 365,
    notes_en:
      "Entities change infrequently; CDC enables KG state replay and embedding refresh triggers.",
    notes_uk:
      "Сутності змінюються рідко; CDC уможливлює відтворення стану БЗ та тригери оновлення ембедингів.",
  },
  {
    table: "relations",
    kafkaTopic_en: "aegis.relations.cdc",
    kafkaTopic_uk: "Тема Kafka: зміни таблиці відношень",
    cdcTool: "debezium",
    retentionDays: 365,
    notes_en:
      "Relation mutations must propagate to the subgraph cache and copilot context store.",
    notes_uk:
      "Мутації відношень повинні розповсюджуватися до кешу підграфів та сховища контексту копілота.",
  },
  {
    table: "users",
    kafkaTopic_en: "aegis.users.cdc",
    kafkaTopic_uk: "Тема Kafka: зміни таблиці користувачів",
    cdcTool: "debezium",
    retentionDays: 180,
    notes_en:
      "PII-sensitive; CDC stream is encrypted at rest and in transit. " +
      "Used for billing and quota sync only.",
    notes_uk:
      "Містить персональні дані; потік CDC шифрується в спокої та в русі. " +
      "Використовується лише для синхронізації білінгу та квот.",
  },
  {
    table: "audit_log",
    kafkaTopic_en: "aegis.audit_log.cdc",
    kafkaTopic_uk: "Тема Kafka: зміни журналу аудиту",
    cdcTool: "debezium",
    retentionDays: 365,
    notes_en:
      "Audit log is append-only; CDC stream feeds the immutable compliance archive.",
    notes_uk:
      "Журнал аудиту є лише для додавання; потік CDC живить незмінний архів відповідності.",
  },
  {
    table: "sources",
    kafkaTopic_en: "aegis.sources.cdc",
    kafkaTopic_uk: "Тема Kafka: зміни таблиці джерел",
    cdcTool: "debezium",
    retentionDays: 365,
    notes_en:
      "Source metadata changes trigger freshness-SLO recalculation and dashboard updates.",
    notes_uk:
      "Зміни метаданих джерела запускають перерахунок SLO свіжості та оновлення дашборду.",
  },
];

// ---------------------------------------------------------------------------
// Archive tiers
// ---------------------------------------------------------------------------

export const ARCHIVE_TIERS_EN =
  "Three archive tiers manage cost vs. query latency: " +
  "(1) Warm — S3 Standard Parquet, partitioned by dt + source; queryable via DuckDB/Trino; 0–3 months. " +
  "(2) Cold — S3 Infrequent Access; restored within hours; 3 months–2 years. " +
  "(3) Deep-frozen — S3 Glacier Deep Archive; 12–48h restore SLA; 2+ years (7-year legal hold minimum).";

export const ARCHIVE_TIERS_UK =
  "Три рівні архіву балансують вартість та затримку запитів: " +
  "(1) Warm — S3 Standard Parquet, розбитий за dt + source; запити через DuckDB/Trino; 0–3 місяці. " +
  "(2) Cold — S3 Infrequent Access; відновлення протягом годин; 3 місяці–2 роки. " +
  "(3) Deep-frozen — S3 Glacier Deep Archive; SLA відновлення 12–48 год; 2+ роки (мінімум 7-річне юридичне утримання).";

// ---------------------------------------------------------------------------
// CDC principle
// ---------------------------------------------------------------------------

export const CDC_PRINCIPLE_EN =
  "CDC enables point-in-time replay of any table state, which is essential for: " +
  "auditing, incident post-mortems, feature backfilling, and model retraining on historical data. " +
  "Debezium reads the Postgres WAL via the pgoutput logical replication plugin and publishes change events to Kafka. " +
  "The Kafka Connect Parquet sink materialises the stream to S3 with time-based partitioning.";

export const CDC_PRINCIPLE_UK =
  "CDC уможливлює відтворення стану будь-якої таблиці на певний момент часу, що є критичним для: " +
  "аудиту, post-mortem інцидентів, дозаповнення ознак та перенавчання моделей на історичних даних. " +
  "Debezium читає WAL Postgres через плагін логічної реплікації pgoutput і публікує події змін у Kafka. " +
  "Parquet-сінк Kafka Connect матеріалізує потік у S3 із часовою партиціонізацією.";
