/**
 * Storage Layer Configuration — Aegis Lens / Ukrainian MAP
 *
 * Right tool per data shape: relational + geo + search + vector + blob + cold archive.
 * Single source of truth: Postgres. Everything else is a derived index.
 *
 * Конфігурація рівнів сховища: реляційний, гео, пошук, вектор, BLOB, холодний архів.
 * Єдине джерело правди — Postgres. Усе інше — похідні індекси.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Stable identifier for each storage layer. */
export type StorageLayerId =
  | "postgres-postgis"
  | "timescaledb"
  | "elasticsearch"
  | "qdrant"
  | "redis"
  | "s3-object"
  | "cdn"
  | "parquet-archive"
  | "glacier-deep"
  | "duckdb-trino"
  | "schema-registry"
  | "data-catalog";

/**
 * Functional role a storage layer fills in the architecture.
 *
 * Функціональна роль рівня сховища в архітектурі.
 */
export type StorageRole =
  | "primary"
  | "search"
  | "vector"
  | "cache"
  | "object"
  | "archive"
  | "analytics"
  | "catalog";

/**
 * Full configuration record for a single storage layer.
 *
 * Повний запис конфігурації одного рівня сховища.
 */
export interface StorageLayerConfig {
  /** Stable layer identifier. */
  id: StorageLayerId;
  /** Functional role of this layer. */
  role: StorageRole;
  /** Underlying technology / product. */
  technology: string;
  /** Layer name in English. */
  name_en: string;
  /** Layer name in Ukrainian. */
  name_uk: string;
  /** Purpose description in English. */
  purpose_en: string;
  /** Purpose description in Ukrainian. */
  purpose_uk: string;
  /** Scaling note in English. */
  scalingNote_en: string;
  /** Scaling note in Ukrainian. */
  scalingNote_uk: string;
  /** Dev alternative technology in English (e.g. MinIO for S3 in dev). */
  devAlternative_en: string;
  /** Dev alternative technology in Ukrainian. */
  devAlternative_uk: string;
  /** Production deployment note in English. */
  productionNote_en: string;
  /** Production deployment note in Ukrainian. */
  productionNote_uk: string;
  /** Additional notes in English. */
  notes_en: string;
  /** Additional notes in Ukrainian. */
  notes_uk: string;
}

// ── Storage layer catalog ──────────────────────────────────────────────────────

/**
 * All 12 storage layers used in the Aegis Lens platform.
 *
 * Усі 12 рівнів сховища платформи Aegis Lens.
 */
export const STORAGE_LAYER_CONFIGS: StorageLayerConfig[] = [
  {
    id: "postgres-postgis",
    role: "primary",
    technology: "PostgreSQL 16 + PostGIS",
    name_en: "PostgreSQL + PostGIS (Primary Relational + Geo)",
    name_uk: "PostgreSQL + PostGIS (основний реляційний + гео)",
    purpose_en:
      "Primary relational store for events, regions, and users. PostGIS extension provides full geospatial query support: bounding-box filters, radius searches, geometry intersections.",
    purpose_uk:
      "Основне реляційне сховище для подій, регіонів і користувачів. Розширення PostGIS забезпечує повну підтримку геопросторових запитів: фільтри за bbox, пошук у радіусі, перетини геометрій.",
    scalingNote_en:
      "Read replicas for query offload; connection pooling via PgBouncer. Partition large event tables by month.",
    scalingNote_uk:
      "Репліки читання для розвантаження запитів; пул з'єднань через PgBouncer. Партиціювання великих таблиць подій по місяцях.",
    devAlternative_en: "Same stack locally via Docker Compose.",
    devAlternative_uk: "Той самий стек локально через Docker Compose.",
    productionNote_en:
      "Managed on Hetzner dedicated + manual daily backups to S3. WAL archiving enabled.",
    productionNote_uk:
      "Розгорнуто на Hetzner Dedicated + ручні щоденні бекапи на S3. Архівування WAL увімкнено.",
    notes_en:
      "Single source of truth. All other layers are derived indexes built from Postgres data.",
    notes_uk:
      "Єдине джерело правди. Усі інші рівні — похідні індекси, побудовані з даних Postgres.",
  },
  {
    id: "timescaledb",
    role: "primary",
    technology: "TimescaleDB extension",
    name_en: "TimescaleDB (Time-Series Aggregates)",
    name_uk: "TimescaleDB (агрегати часових рядів)",
    purpose_en:
      "TimescaleDB extension on top of PostgreSQL for efficient time-series aggregates over events: hourly/daily rollups, continuous aggregates, retention policies.",
    purpose_uk:
      "Розширення TimescaleDB поверх PostgreSQL для ефективних агрегатів часових рядів подій: погодинні/денні зведення, безперервні агрегати, політики утримання.",
    scalingNote_en:
      "Continuous aggregates pre-compute rollups; chunk auto-compression after 7 days.",
    scalingNote_uk:
      "Безперервні агрегати попередньо обчислюють зведення; автоматичне стиснення чанків після 7 днів.",
    devAlternative_en: "TimescaleDB Community Edition via Docker — identical API.",
    devAlternative_uk:
      "TimescaleDB Community Edition через Docker — ідентичний API.",
    productionNote_en: "Runs as an extension in the same Postgres 16 instance.",
    productionNote_uk:
      "Запускається як розширення в тому ж примірнику Postgres 16.",
    notes_en:
      "Avoids a separate time-series DB; keeps the single-Postgres principle intact.",
    notes_uk:
      "Уникає окремої TSDB; зберігає принцип єдиного Postgres у силі.",
  },
  {
    id: "elasticsearch",
    role: "search",
    technology: "Elasticsearch / OpenSearch",
    name_en: "Elasticsearch / OpenSearch (Full-Text Search)",
    name_uk: "Elasticsearch / OpenSearch (повнотекстовий пошук)",
    purpose_en:
      "Full-text search across event descriptions, source texts, and entity names. OpenSearch is a fully compatible drop-in alternative for self-hosted deployments.",
    purpose_uk:
      "Повнотекстовий пошук по описах подій, вихідних текстах і назвах сутностей. OpenSearch — повністю сумісна альтернатива для self-hosted розгортань.",
    scalingNote_en:
      "Sharded by index month; search replicas for read throughput. Curator manages index lifecycle.",
    scalingNote_uk:
      "Шардування по місячних індексах; пошукові репліки для пропускної здатності читання. Curator керує життєвим циклом індексів.",
    devAlternative_en:
      "OpenSearch single-node via Docker Compose; identical query DSL.",
    devAlternative_uk:
      "OpenSearch single-node через Docker Compose; ідентичний DSL запитів.",
    productionNote_en:
      "Elastic Cloud or self-hosted OpenSearch cluster on Hetzner. Re-indexed nightly from Postgres.",
    productionNote_uk:
      "Elastic Cloud або self-hosted OpenSearch кластер на Hetzner. Переіндексується щоночі з Postgres.",
    notes_en:
      "Per-locale analyzers for Ukrainian, Russian, and English. Index built from Postgres; not primary store.",
    notes_uk:
      "Аналізатори для кожної локалі: українська, російська, англійська. Індекс будується з Postgres; не первинне сховище.",
  },
  {
    id: "qdrant",
    role: "vector",
    technology: "Qdrant",
    name_en: "Qdrant (Vector Embeddings)",
    name_uk: "Qdrant (векторні вбудовування)",
    purpose_en:
      "Vector database for multilingual and multimodal embeddings: semantic search over event descriptions, cross-language similarity, image-to-event retrieval.",
    purpose_uk:
      "Векторна база даних для багатомовних і мультимодальних вбудовувань: семантичний пошук по описах подій, міжмовна схожість, пошук зображень за подіями.",
    scalingNote_en:
      "Collections sharded by embedding model version; HNSW index with ef=128 for recall/latency balance.",
    scalingNote_uk:
      "Колекції шардовані за версією моделі вбудовувань; HNSW-індекс з ef=128 для балансу recall/latency.",
    devAlternative_en: "Qdrant Docker image — identical gRPC/HTTP API.",
    devAlternative_uk: "Docker-образ Qdrant — ідентичний gRPC/HTTP API.",
    productionNote_en:
      "Qdrant Cloud or self-hosted on Hetzner. Vectors populated by embedding workers.",
    productionNote_uk:
      "Qdrant Cloud або self-hosted на Hetzner. Вектори заповнюються воркерами вбудовувань.",
    notes_en:
      "Stores embeddings only; canonical records live in Postgres. Supports filtered ANN search.",
    notes_uk:
      "Зберігає лише вбудовування; канонічні записи — у Postgres. Підтримує фільтрований ANN-пошук.",
  },
  {
    id: "redis",
    role: "cache",
    technology: "Redis 7",
    name_en: "Redis (Cache + Ephemeral State)",
    name_uk: "Redis (кеш + ефемерний стан)",
    purpose_en:
      "In-memory cache for API responses, rate-limit counters, session tokens, pub/sub for live map updates, and ephemeral dedup sets for pipeline ingestion.",
    purpose_uk:
      "In-memory кеш для відповідей API, лічильників rate-limit, сесійних токенів, pub/sub для live-оновлень карти та ефемерних множин дедупліяції для пайплайну інгестії.",
    scalingNote_en:
      "Redis Cluster for horizontal scale; Sentinel for HA. TTLs enforced on all keys.",
    scalingNote_uk:
      "Redis Cluster для горизонтального масштабування; Sentinel для HA. TTL встановлено на всіх ключах.",
    devAlternative_en: "Redis 7 via Docker — no config changes needed.",
    devAlternative_uk: "Redis 7 через Docker — жодних змін конфігурації.",
    productionNote_en:
      "Upstash Redis (serverless) or self-hosted Redis 7 on Hetzner. No persistent data stored here.",
    productionNote_uk:
      "Upstash Redis (serverless) або self-hosted Redis 7 на Hetzner. Постійні дані тут не зберігаються.",
    notes_en:
      "Ephemeral only. Loss of Redis state is recoverable from Postgres within seconds.",
    notes_uk:
      "Лише ефемерний стан. Втрата стану Redis відновлюється з Postgres за секунди.",
  },
  {
    id: "s3-object",
    role: "object",
    technology: "S3 / MinIO",
    name_en: "S3 Object Storage (Images, Video, Satellite, Exports)",
    name_uk: "S3-об'єктне сховище (зображення, відео, супутники, експорти)",
    purpose_en:
      "Durable object storage for binary assets: ingested images, video clips, satellite scenes, raw payload archives, and user export downloads.",
    purpose_uk:
      "Довготривале об'єктне сховище для бінарних активів: зображення, відеокліпи, супутникові сцени, архіви сирих payload та завантаження експортів користувачів.",
    scalingNote_en:
      "Versioning enabled on all buckets. Lifecycle rules: move to Glacier after 2 years.",
    scalingNote_uk:
      "Версіонування увімкнено на всіх бакетах. Правила lifecycle: перенесення в Glacier після 2 років.",
    devAlternative_en:
      "MinIO running via Docker Compose — S3-compatible API, no code changes.",
    devAlternative_uk:
      "MinIO через Docker Compose — S3-сумісний API, без змін коду.",
    productionNote_en:
      "Hetzner Object Storage (S3-compatible) or AWS S3. Buckets: raw-archive, media-assets, exports, parquet.",
    productionNote_uk:
      "Hetzner Object Storage (S3-сумісний) або AWS S3. Бакети: raw-archive, media-assets, exports, parquet.",
    notes_en:
      "Presigned URLs for direct client downloads. CDN layer sits in front for public media.",
    notes_uk:
      "Presigned URLs для прямих завантажень клієнтом. CDN-шар стоїть перед сховищем для публічних медіа.",
  },
  {
    id: "cdn",
    role: "object",
    technology: "CloudFront / Bunny CDN",
    name_en: "CDN (Edge Delivery)",
    name_uk: "CDN (edge-доставка)",
    purpose_en:
      "Edge delivery layer in front of S3 for public media assets and tile exports. Reduces S3 egress costs and improves global latency.",
    purpose_uk:
      "Edge-шар доставки перед S3 для публічних медіа-активів і тайлових експортів. Знижує витрати на egress S3 і покращує глобальну затримку.",
    scalingNote_en:
      "Global PoPs; cache TTLs aligned with S3 object versioning. Signed URLs for private assets.",
    scalingNote_uk:
      "Глобальні PoP; TTL кешу узгоджений з версіонуванням об'єктів S3. Підписані URL для приватних активів.",
    devAlternative_en:
      "No CDN needed in dev — direct MinIO URLs used locally.",
    devAlternative_uk:
      "CDN не потрібен у dev — локально використовуються прямі URL MinIO.",
    productionNote_en:
      "CloudFront in front of S3 buckets, or Bunny CDN for cost-optimised European delivery.",
    productionNote_uk:
      "CloudFront перед S3-бакетами або Bunny CDN для оптимізованої за вартістю доставки в Європі.",
    notes_en:
      "CDN origin is S3; cache invalidation triggered on new object uploads via Lambda/webhook.",
    notes_uk:
      "Origin CDN — S3; інвалідація кешу запускається при завантаженні нових об'єктів через Lambda/webhook.",
  },
  {
    id: "parquet-archive",
    role: "archive",
    technology: "Parquet on S3",
    name_en: "Parquet Archive (Cheap Historical Queries)",
    name_uk: "Parquet-архів (дешеві історичні запити)",
    purpose_en:
      "Columnar Parquet files on S3, partitioned by dt=YYYY-MM-DD/source=... for efficient predicate pushdown. Enables cheap analytics over years of history without touching Postgres.",
    purpose_uk:
      "Колоночні Parquet-файли на S3, партиційовані за dt=YYYY-MM-DD/source=... для ефективного predicate pushdown. Забезпечує дешеву аналітику за роки історії без звернення до Postgres.",
    scalingNote_en:
      "Partition pruning cuts scan cost dramatically. Files compressed with Zstandard (level 3).",
    scalingNote_uk:
      "Відсікання партицій різко знижує вартість сканування. Файли стиснуті Zstandard (рівень 3).",
    devAlternative_en:
      "Local Parquet files queried via DuckDB — no S3 needed in dev.",
    devAlternative_uk:
      "Локальні Parquet-файли, запити через DuckDB — S3 не потрібен у dev.",
    productionNote_en:
      "Written nightly by Airflow/Temporal jobs exporting from Postgres. Read by DuckDB or Trino.",
    productionNote_uk:
      "Записується щоночі завданнями Airflow/Temporal, що експортують з Postgres. Читається DuckDB або Trino.",
    notes_en:
      "Partition scheme: s3://bucket/parquet/dt=2024-01-15/source=telegram/part-00000.parquet",
    notes_uk:
      "Схема партиціювання: s3://bucket/parquet/dt=2024-01-15/source=telegram/part-00000.parquet",
  },
  {
    id: "glacier-deep",
    role: "archive",
    technology: "Glacier / Deep Archive",
    name_en: "Glacier Deep Archive (Cold Archive >2 years)",
    name_uk: "Glacier Deep Archive (холодний архів >2 роки)",
    purpose_en:
      "Ultra-cheap cold storage for data older than 2 years. Retrieval takes hours but cost is ~$1/TB/month. Required for legal hold and long-term provenance.",
    purpose_uk:
      "Надешеве холодне сховище для даних старших 2 років. Відновлення займає години, але вартість ~$1/ТБ/місяць. Потрібно для legal hold та довгострокової провенієнції.",
    scalingNote_en:
      "S3 Lifecycle rules auto-transition objects from S3 Standard → Glacier after 730 days.",
    scalingNote_uk:
      "Правила S3 Lifecycle автоматично переносять об'єкти зі S3 Standard → Glacier після 730 днів.",
    devAlternative_en: "Not needed in dev — dev datasets are small and recent.",
    devAlternative_uk:
      "Не потрібно у dev — dev-набори даних невеликі й актуальні.",
    productionNote_en:
      "AWS Glacier Deep Archive or Hetzner Backup Space for EU data residency.",
    productionNote_uk:
      "AWS Glacier Deep Archive або Hetzner Backup Space для зберігання даних в ЄС.",
    notes_en:
      "Retrieval SLA: Bulk 12 h, Standard 3–5 h. Acceptable for forensics and audit requests.",
    notes_uk:
      "SLA відновлення: Bulk 12 год, Standard 3–5 год. Прийнятно для форензики та аудиторських запитів.",
  },
  {
    id: "duckdb-trino",
    role: "analytics",
    technology: "DuckDB (local) / Trino (cluster)",
    name_en: "DuckDB / Trino (Ad-Hoc Analytics over Parquet)",
    name_uk: "DuckDB / Trino (ad-hoc аналітика по Parquet)",
    purpose_en:
      "Query engine layer over Parquet files on S3. DuckDB for single-analyst ad-hoc queries; Trino for cluster-scale federated analytics across multiple data sources.",
    purpose_uk:
      "Шар рушіїв запитів поверх Parquet-файлів на S3. DuckDB для ad-hoc запитів одного аналітика; Trino для кластерної федеративної аналітики по кількох джерелах даних.",
    scalingNote_en:
      "DuckDB scales to ~100 GB on a single node; Trino for multi-TB or multi-source joins.",
    scalingNote_uk:
      "DuckDB масштабується до ~100 ГБ на одному вузлі; Trino — для мульти-ТБ або об'єднань кількох джерел.",
    devAlternative_en:
      "DuckDB CLI or Python SDK — runs entirely locally, reads local Parquet files.",
    devAlternative_uk:
      "DuckDB CLI або Python SDK — працює повністю локально, читає локальні Parquet-файли.",
    productionNote_en:
      "Trino cluster on Kubernetes for internal analytics team; DuckDB for lightweight API-served queries.",
    productionNote_uk:
      "Trino-кластер на Kubernetes для внутрішньої аналітичної команди; DuckDB для легких запитів через API.",
    notes_en:
      "No ETL needed — both engines read Parquet natively. Push-down filters reduce S3 scan cost.",
    notes_uk:
      "ETL не потрібен — обидва рушії читають Parquet нативно. Фільтри push-down знижують вартість сканування S3.",
  },
  {
    id: "schema-registry",
    role: "catalog",
    technology: "Apicurio / Confluent Schema Registry",
    name_en: "Schema Registry (Events, Layers, Sources)",
    name_uk: "Schema Registry (події, шари, джерела)",
    purpose_en:
      "Central schema registry for events, map layers, and source definitions. Enforces backward-compatibility checks; breaking changes are blocked at publish time.",
    purpose_uk:
      "Центральний реєстр схем для подій, шарів карти та визначень джерел. Забезпечує перевірки зворотної сумісності; порушуючі зміни блокуються на момент публікації.",
    scalingNote_en:
      "Schema versioning is lightweight — single replicated service. No horizontal scale needed at current volumes.",
    scalingNote_uk:
      "Версіонування схем легковагове — одиничний реплікований сервіс. Горизонтальне масштабування не потрібне при поточних обсягах.",
    devAlternative_en:
      "Apicurio Registry Community Edition via Docker — REST API identical to Confluent.",
    devAlternative_uk:
      "Apicurio Registry Community Edition через Docker — REST API ідентичний Confluent.",
    productionNote_en:
      "Apicurio self-hosted or Confluent Cloud Schema Registry. Integrated with Kafka producers.",
    productionNote_uk:
      "Apicurio self-hosted або Confluent Cloud Schema Registry. Інтегровано з Kafka-продюсерами.",
    notes_en:
      "Avro and Protobuf supported. All Kafka topics reference a registered schema ID in message headers.",
    notes_uk:
      "Підтримка Avro та Protobuf. Усі Kafka-топіки посилаються на зареєстрований ID схеми в заголовках повідомлень.",
  },
  {
    id: "data-catalog",
    role: "catalog",
    technology: "DataHub / OpenMetadata",
    name_en: "Data Catalog (Enterprise Metadata)",
    name_uk: "Data Catalog (корпоративні метадані)",
    purpose_en:
      "Enterprise metadata catalog for dataset discovery, lineage tracking, data quality documentation, and compliance auditing. Targeted at enterprise customers with data governance requirements.",
    purpose_uk:
      "Корпоративний каталог метаданих для виявлення наборів даних, відстеження родоводу, документування якості даних та аудиту відповідності. Орієнтований на корпоративних клієнтів з вимогами до управління даними.",
    scalingNote_en:
      "DataHub / OpenMetadata scale independently of the data they catalog — metadata load is small.",
    scalingNote_uk:
      "DataHub / OpenMetadata масштабуються незалежно від даних, які вони каталогізують — навантаження метаданих мале.",
    devAlternative_en:
      "DataHub Quickstart Docker Compose — full feature set available locally.",
    devAlternative_uk:
      "DataHub Quickstart Docker Compose — повний набір функцій доступний локально.",
    productionNote_en:
      "DataHub Cloud or OpenMetadata self-hosted. Lineage populated by Airflow operators and dbt.",
    productionNote_uk:
      "DataHub Cloud або OpenMetadata self-hosted. Родовід заповнюється операторами Airflow та dbt.",
    notes_en:
      "Optional for standard tiers; included in Enterprise plan. Exposes REST API consumed by the Aegis Lens platform UI.",
    notes_uk:
      "Необов'язковий для стандартних тарифів; включений до Enterprise-плану. Відкриває REST API, який споживає UI платформи Aegis Lens.",
  },
];

// ── Principles & notes ────────────────────────────────────────────────────────

/**
 * Single source of truth principle — English.
 * Postgres is the authoritative record; all other stores are derived indexes
 * and can be rebuilt from Postgres at any time.
 */
export const STORAGE_PRINCIPLE_EN =
  "Single source of truth: Postgres. Everything else is a derived index that can be rebuilt from the canonical relational store at any time.";

/**
 * Single source of truth principle — Ukrainian.
 * Postgres — авторитетний запис; усі інші сховища — похідні індекси,
 * які можна відновити з Postgres у будь-який момент.
 */
export const STORAGE_PRINCIPLE_UK =
  "Єдине джерело правди: Postgres. Усе інше — похідний індекс, який можна відновити з канонічного реляційного сховища в будь-який момент.";

/**
 * i18n storage note — English.
 * How multilingual content is handled across the storage stack.
 */
export const STORAGE_I18N_NOTE_EN =
  "Multilingual text columns stored in Postgres per locale; per-locale full-text indexes maintained in Elasticsearch/OpenSearch with language-specific analyzers for Ukrainian, Russian, and English.";

/**
 * i18n storage note — Ukrainian.
 * Як багатомовний контент обробляється у стеку сховища.
 */
export const STORAGE_I18N_NOTE_UK =
  "Багатомовні текстові колонки зберігаються в Postgres для кожної локалі; повнотекстові індекси для кожної локалі підтримуються в Elasticsearch/OpenSearch з мовно-специфічними аналізаторами для української, російської та англійської мов.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Look up a storage layer by its stable identifier.
 * Пошук рівня сховища за стабільним ідентифікатором.
 */
export function getStorageLayer(
  id: StorageLayerId,
): StorageLayerConfig | undefined {
  return STORAGE_LAYER_CONFIGS.find((layer) => layer.id === id);
}
