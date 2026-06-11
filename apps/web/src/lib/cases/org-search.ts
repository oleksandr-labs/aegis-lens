/**
 * Org-wide full-text search across cases.
 * Повнотекстовий пошук по всіх справах організації.
 *
 * Backed by Elasticsearch in production; this module is the typed interface stub.
 * All queries are scoped to `orgId` and filtered by the caller's RBAC permissions.
 *
 * У продакшені підкріплено Elasticsearch; цей модуль — типізований інтерфейс-заглушка.
 * Усі запити обмежені `orgId` та фільтруються за RBAC-дозволами.
 */

// ── Query & result types ──────────────────────────────────────────────────────

export interface CaseSearchQuery {
  /** Organisation scope — callers must pass their own orgId; never cross-org. */
  orgId: string;
  /** Free-text query string */
  q: string;
  /** Optional tag filter (AND semantics — all tags must match) */
  tags?: string[];
  /** Filter by case status values (e.g. ['active', 'archived']) */
  status?: string[];
  /** ISO date lower bound (inclusive) on updatedAt */
  dateFrom?: string;
  /** ISO date upper bound (inclusive) on updatedAt */
  dateTo?: string;
  /** Page size; default 20, max 100 */
  limit?: number;
  /** Cursor token from a previous response for keyset pagination */
  cursor?: string;
}

export interface CaseSearchResult {
  caseId: string;
  title: string;
  /** Highlighted excerpt with matched terms in context */
  snippet: string;
  tags: string[];
  status: string;
  /** BM25 / vector relevance score (0–1) */
  matchScore: number;
  /** ISO timestamp of last update */
  updatedAt: string;
}

export interface CaseSearchResponse {
  results: CaseSearchResult[];
  /** Total matching documents (before pagination) */
  total: number;
  /** Opaque cursor; undefined when no more pages */
  nextCursor?: string;
}

// ── Search function ───────────────────────────────────────────────────────────

/**
 * Search cases within an organisation.
 *
 * STUB — returns empty results until Elasticsearch is wired.
 * Wire by replacing the body with an ES `multi_match` + `bool` query
 * against the `aegis_cases` index, filtered by `orgId` and the caller's
 * allowed `caseId` set (derived from RBAC).
 *
 * ЗАГЛУШКА — повертає порожні результати до підключення Elasticsearch.
 * Для підключення замінити тіло на ES `multi_match` + `bool` запит
 * до індексу `aegis_cases` з фільтром за `orgId` та RBAC-дозволами.
 */
export function searchCases(query: CaseSearchQuery): CaseSearchResponse {
  void query; // TODO: wire to Elasticsearch / OpenSearch aegis_cases index
  return {
    results: [],
    total: 0,
    nextCursor: undefined,
  };
}

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Elasticsearch-backed:
 * Production implementation indexes case title, description, notes content,
 * and event summaries into an `aegis_cases` Elasticsearch index with
 * Ukrainian + English analysers. BM25 scoring is supplemented with a
 * vector similarity field for semantic search.
 *
 * [1] На основі Elasticsearch:
 * Продакшен-реалізація індексує заголовок, опис, нотатки та зведення подій
 * до індексу `aegis_cases` з аналізаторами для української та англійської мов.
 */
export const NOTE_ELASTICSEARCH_EN =
  "Elasticsearch-backed: wire searchCases() to an aegis_cases ES index. " +
  "Use Ukrainian (uk) and English (en) analysers. " +
  "BM25 + dense-vector field for hybrid keyword + semantic search.";

export const NOTE_ELASTICSEARCH_UK =
  "На основі Elasticsearch: підключити searchCases() до індексу aegis_cases. " +
  "Використовувати аналізатори для uk та en. " +
  "BM25 + dense-vector поле для гібридного ключового та семантичного пошуку.";

/**
 * [2] Org-scoped:
 * Every ES query MUST include a `term` filter on `orgId`.
 * Cross-org queries are rejected at the API layer before reaching this function.
 * Org isolation is enforced at both the application and index-alias levels.
 *
 * [2] Обмеження організацією:
 * Кожен ES-запит МАЄ містити `term` фільтр за `orgId`.
 * Міжорганізаційні запити відхиляються на рівні API до виклику цієї функції.
 */
export const NOTE_ORG_SCOPED_EN =
  "Org-scoped: every search query includes a mandatory orgId filter. " +
  "Cross-org isolation is enforced at the API layer and at the ES index-alias level.";

export const NOTE_ORG_SCOPED_UK =
  "Обмеження організацією: кожен пошуковий запит містить обов'язковий фільтр orgId. " +
  "Ізоляція між організаціями забезпечується на рівні API та псевдонімів ES-індексів.";

/**
 * [3] RBAC-filtered:
 * Results are post-filtered against the caller's case-level permissions.
 * Cases where the caller holds no viewer/editor/admin role are excluded
 * from both `results` and `total`.
 *
 * [3] Фільтрація за RBAC:
 * Результати пост-фільтруються за рівнем дозволів справи для запитувача.
 * Справи, де запитувач не має ролі viewer/editor/admin, виключаються з результатів.
 */
export const NOTE_RBAC_FILTERED_EN =
  "RBAC-filtered: search results exclude cases where the requesting user has no " +
  "viewer, editor, or admin role. Implement as a post-filter step or an ES " +
  "terms-set query on the caller's allowed caseId set.";

export const NOTE_RBAC_FILTERED_UK =
  "Фільтрація за RBAC: пошукові результати виключають справи, до яких запитувач " +
  "не має ролі viewer, editor або admin. Реалізувати як постфільтр або ES terms-set " +
  "запит по дозволеному набору caseId.";
