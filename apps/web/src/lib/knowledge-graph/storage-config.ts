/**
 * Knowledge Graph — Storage Configuration & Architecture Notes.
 * База знань — конфігурація сховища та архітектурні нотатки.
 */

// ---------------------------------------------------------------------------
// Storage backends
// ---------------------------------------------------------------------------

/** Primary storage backend for the Knowledge Graph. */
export type KgStorageBackend = "postgres" | "neo4j" | "terminusdb";

/** Full storage configuration for the KG stack. */
export interface KgStorageConfig {
  /** Primary graph store — relational or native-graph. */
  primary: KgStorageBackend;
  /** Vector embedding store for semantic similarity. */
  embeddingStore: "qdrant";
  /** Full-text search engine. */
  fullTextSearch: "elasticsearch";
  notes_en: string;
  notes_uk: string;
}

/** Canonical KG storage configuration for Aegis Lens. */
export const KG_STORAGE_CONFIG: KgStorageConfig = {
  primary: "postgres",
  embeddingStore: "qdrant",
  fullTextSearch: "elasticsearch",
  notes_en:
    "Primary store: Postgres with `entities` and `relations` tables. " +
    "Migrate to Neo4j or TerminusDB if graph traversal becomes the bottleneck. " +
    "Qdrant holds per-entity 1536-dim embeddings; Elasticsearch powers full-text and faceted search.",
  notes_uk:
    "Основне сховище: Postgres з таблицями `entities` та `relations`. " +
    "Перехід на Neo4j або TerminusDB — якщо граф-траверс стане вузьким місцем. " +
    "Qdrant зберігає 1536-вимірні ембединги; Elasticsearch — повнотекстовий пошук і фасети.",
};

// ---------------------------------------------------------------------------
// Wikidata bulk-load
// ---------------------------------------------------------------------------

export const KG_WIKIDATA_LOAD_NOTE_EN =
  "Bulk-load canonical entity anchors from Wikidata (SPARQL + Wikidata Toolkit). " +
  "Each imported entity receives a `sameAs` link to its Wikidata QID for global deduplication. " +
  "Incremental updates via Wikidata change-stream (SSE endpoint) keep anchors fresh.";

export const KG_WIKIDATA_LOAD_NOTE_UK =
  "Масове завантаження канонічних якорів сутностей із Wikidata (SPARQL + Wikidata Toolkit). " +
  "Кожна імпортована сутність отримує посилання `sameAs` на QID Wikidata для глобальної дедуплікації. " +
  "Інкрементальні оновлення через потік змін Wikidata (SSE) підтримують якорі актуальними.";

// ---------------------------------------------------------------------------
// NLP auto-population
// ---------------------------------------------------------------------------

export const KG_NLP_POPULATION_NOTE_EN =
  "Auto-populate the KG from the NLP entity-extraction pipeline (NER + relation extraction). " +
  "Extracted candidates enter `EntityProposal` with status `pending` and require HITL review before publishing. " +
  "Confidence threshold ≥ 0.85 required to surface for review; below that, silently discarded.";

export const KG_NLP_POPULATION_NOTE_UK =
  "Автоматичне наповнення БЗ з конвеєра NLP-вилучення сутностей (NER + вилучення відношень). " +
  "Витягнуті кандидати потрапляють до `EntityProposal` зі статусом `pending` і вимагають HITL-рецензування перед публікацією. " +
  "Мінімальний поріг достовірності для подання на рецензію — 0.85; нижче — відхиляється мовчки.";

// ---------------------------------------------------------------------------
// Embeddings (Qdrant)
// ---------------------------------------------------------------------------

export const KG_EMBEDDING_NOTE_EN =
  "Each entity is represented by a 1536-dimensional embedding (text-embedding-3-large) stored in Qdrant. " +
  "Embeddings encode canonical label + aliases + short description. " +
  "Used for semantic similarity search, copilot retrieval, and near-duplicate detection.";

export const KG_EMBEDDING_NOTE_UK =
  "Кожна сутність представлена 1536-вимірним ембедингом (text-embedding-3-large), збереженим у Qdrant. " +
  "Ембединги кодують канонічну мітку + псевдоніми + короткий опис. " +
  "Використовуються для семантичного пошуку схожості, пошуку копілота та виявлення майже-дублікатів.";

// ---------------------------------------------------------------------------
// Entity pages
// ---------------------------------------------------------------------------

export const KG_ENTITY_PAGE_NOTE_EN =
  "Each entity has a canonical page at `/entities/<id>/<slug>` generated via programmatic template. " +
  "Pages include: type badge, aliases, attributes, relation graph, linked events, and audit trail. " +
  "See `TODO_template_entity.md` for full rendering spec.";

export const KG_ENTITY_PAGE_NOTE_UK =
  "Кожна сутність має канонічну сторінку за адресою `/entities/<id>/<slug>`, сформовану програматичним шаблоном. " +
  "Сторінки містять: значок типу, псевдоніми, атрибути, граф відношень, пов'язані події та журнал аудиту. " +
  "Повна специфікація рендерингу — у `TODO_template_entity.md`.";

// ---------------------------------------------------------------------------
// Copilot retrieval
// ---------------------------------------------------------------------------

export const KG_COPILOT_RETRIEVAL_NOTE_EN =
  "Copilot retrieves entity context using a three-stage hybrid: " +
  "1) lexical BM25 over entity labels and aliases; " +
  "2) semantic ANN search in Qdrant; " +
  "3) graph-traversal to pull 1-hop neighbours. " +
  "All retrieved entities are cited in the copilot response with confidence scores.";

export const KG_COPILOT_RETRIEVAL_NOTE_UK =
  "Копілот отримує контекст сутностей через трирівневий гібридний підхід: " +
  "1) лексичний BM25 по мітках та псевдонімах сутностей; " +
  "2) семантичний ANN-пошук у Qdrant; " +
  "3) граф-траверс для отримання 1-hop сусідів. " +
  "Усі знайдені сутності цитуються у відповіді копілота з оцінками достовірності.";

// ---------------------------------------------------------------------------
// Public KG export
// ---------------------------------------------------------------------------

export const KG_PUBLIC_EXPORT_NOTE_EN =
  "Public read-only KG export released under CC-BY 4.0 for academic and civil-society use. " +
  "Quarterly Parquet dump uploaded to S3 with a permanent versioned URL. " +
  "Retracted entities excluded; audit log of retractions published separately.";

export const KG_PUBLIC_EXPORT_NOTE_UK =
  "Публічний експорт БЗ тільки для читання під ліцензією CC-BY 4.0 для академічного та громадянського використання. " +
  "Щоквартальний дамп у форматі Parquet завантажується на S3 із постійним версійованим URL. " +
  "Відкликані сутності виключено; журнал відкликань публікується окремо.";

// ---------------------------------------------------------------------------
// Per-locale label resolution
// ---------------------------------------------------------------------------

export const KG_LOCALE_RESOLUTION_NOTE_EN =
  "Per-locale label resolution order: en → uk → transliteration fallback. " +
  "If no label exists in the requested locale, the system falls back to the next locale in the chain. " +
  "Transliteration is applied as a last resort using standard Ukrainian-to-Latin rules (KMU 2010).";

export const KG_LOCALE_RESOLUTION_NOTE_UK =
  "Порядок вирішення мітки за локаллю: en → uk → транслітерація (запасний варіант). " +
  "Якщо мітки у запитуваній локалі немає, система переходить до наступної в ланцюжку. " +
  "Транслітерація застосовується в крайньому випадку за стандартними правилами украї нської-до-латиниці (КМУ 2010).";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the canonical URL for an entity page.
 * Формує канонічний URL сторінки сутності.
 *
 * @param entityId  - unique entity identifier
 * @param slug      - human-readable slug derived from canonical label
 * @returns `/entities/<entityId>/<slug>`
 */
export function buildEntityPageUrl(entityId: string, slug: string): string {
  return `/entities/${entityId}/${slug}`;
}

/**
 * Build the Wikidata entity URL for a sameAs reference.
 * Формує URL сутності Wikidata для посилання sameAs.
 *
 * @param wikidataId - Wikidata QID (e.g. "Q350")
 * @returns full Wikidata entity URL
 */
export function buildWikidataSameAsUrl(wikidataId: string): string {
  return `https://www.wikidata.org/entity/${wikidataId}`;
}
