/**
 * API Documentation configuration — auto-generated from OpenAPI, hand-curated for narrative.
 * Конфігурація документації API — автогенерація з OpenAPI, ручне доповнення наративом.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** All sections of the API documentation. */
export type ApiDocsSection =
  | "getting-started"
  | "authentication"
  | "rate-limits"
  | "endpoints-reference"
  | "webhooks"
  | "sdks"
  | "changelog"
  | "deprecation-policy";

/** Full configuration for a single API docs section. */
export interface ApiDocsConfig {
  id: ApiDocsSection;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ── Section Configs ───────────────────────────────────────────────────────────

export const API_DOCS_SECTIONS: ApiDocsConfig[] = [
  {
    id: "getting-started",
    name_en: "Getting Started",
    name_uk: "Початок роботи",
    description_en:
      "First API call in under 5 minutes: create an API key, make a request, read the response.",
    description_uk:
      "Перший API-виклик менш ніж за 5 хвилин: створіть API-ключ, виконайте запит, прочитайте відповідь.",
    notes_en:
      "Include runnable curl and SDK snippets for TS, Python, and Go. Link to the interactive API explorer for try-it-now experience.",
    notes_uk:
      "Включіть запускаємі фрагменти curl та SDK для TS, Python та Go. Посилайтесь на інтерактивний API-провідник для миттєвого тестування.",
  },
  {
    id: "authentication",
    name_en: "Authentication",
    name_uk: "Автентифікація",
    description_en:
      "API key authentication (Bearer token); org-scoped tokens with per-key rate limits.",
    description_uk:
      "Автентифікація за API-ключем (Bearer токен); токени з областю дії організації з обмеженнями частоти запитів для кожного ключа.",
    notes_en:
      "Auth scheme: Authorization: Bearer <api_key>. Keys are org-scoped; create per-integration keys for auditability. Rotate keys without downtime via key overlap window (24h). OAuth 2.0 planned for v2.",
    notes_uk:
      "Схема автентифікації: Authorization: Bearer <api_key>. Ключі прив'язані до організації; створюйте окремі ключі для кожної інтеграції для можливості аудиту. Ротація ключів без простою через вікно перекриття ключів (24г). OAuth 2.0 запланований для v2.",
  },
  {
    id: "rate-limits",
    name_en: "Rate Limits & Quotas",
    name_uk: "Обмеження частоти запитів та квоти",
    description_en:
      "Per-key rate limits, quota tiers, and headers for observability.",
    description_uk:
      "Обмеження частоти запитів для кожного ключа, рівні квот та заголовки для спостережуваності.",
    notes_en:
      "Default: 60 req/min per key. Copilot: 10 req/min. Export: 10 req/min. Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. 429 on breach with Retry-After.",
    notes_uk:
      "За замовчуванням: 60 запит/хв на ключ. Copilot: 10 запит/хв. Експорт: 10 запит/хв. Заголовки: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. 429 при перевищенні з Retry-After.",
  },
  {
    id: "endpoints-reference",
    name_en: "Endpoints Reference",
    name_uk: "Довідник ендпоінтів",
    description_en:
      "Full REST API reference: every endpoint, parameter, request/response schema, and error codes.",
    description_uk:
      "Повний довідник REST API: кожен ендпоінт, параметр, схема запиту/відповіді та коди помилок.",
    notes_en:
      "Auto-generated from OpenAPI 3.1 spec at /openapi.json. Per-endpoint examples (request, response, errors) are hand-curated. Pagination, cursor conventions, and field selection documented inline.",
    notes_uk:
      "Автогенерується з OpenAPI 3.1 специфікації за адресою /openapi.json. Приклади для кожного ендпоінту (запит, відповідь, помилки) підготовлені вручну. Пагінація, конвенції курсорів та вибір полів задокументовані вбудовано.",
  },
  {
    id: "webhooks",
    name_en: "Webhooks",
    name_uk: "Вебхуки",
    description_en:
      "Real-time event push via webhooks: sign, verify, retry, and replay.",
    description_uk:
      "Відправка подій у реальному часі через вебхуки: підписання, верифікація, повторна спроба та відтворення.",
    notes_en:
      "HMAC-SHA256 signature on X-Aegis-Signature header. Retry with exponential back-off (up to 72h). Event catalog includes: alert.created, incident.updated, report.published, aoi.triggered, source.status_changed.",
    notes_uk:
      "Підпис HMAC-SHA256 в заголовку X-Aegis-Signature. Повторні спроби з експоненційним відступом (до 72г). Каталог подій включає: alert.created, incident.updated, report.published, aoi.triggered, source.status_changed.",
  },
  {
    id: "sdks",
    name_en: "SDKs",
    name_uk: "SDK",
    description_en:
      "Official SDKs in TypeScript, Python, and Go — auto-generated from OpenAPI spec.",
    description_uk:
      "Офіційні SDK для TypeScript, Python та Go — автогенеровані з OpenAPI специфікації.",
    notes_en:
      "TypeScript SDK: published to npm as @aegislens/sdk. Python SDK: published to PyPI as aegislens. Go SDK: published as github.com/aegislens/go-sdk. All SDK releases are version-locked to the API version they target.",
    notes_uk:
      "TypeScript SDK: опубліковано в npm як @aegislens/sdk. Python SDK: опубліковано в PyPI як aegislens. Go SDK: опубліковано як github.com/aegislens/go-sdk. Всі релізи SDK версіоновані відповідно до версії API, на яку вони орієнтовані.",
  },
  {
    id: "changelog",
    name_en: "Changelog",
    name_uk: "Журнал змін",
    description_en:
      "API change history: new endpoints, modified schemas, and deprecation notices.",
    description_uk:
      "Історія змін API: нові ендпоінти, змінені схеми та повідомлення про застарілість.",
    notes_en:
      "Breaking changes announced 60 days in advance via email to all API key holders + changelog banner on /docs. Non-breaking additive changes announced in the changelog only. Each entry includes migration guidance.",
    notes_uk:
      "Критичні зміни оголошуються за 60 днів через електронну пошту всім власникам API-ключів + банер журналу змін на /docs. Неруйнівні додаткові зміни оголошуються лише в журналі змін. Кожен запис включає інструкції з міграції.",
  },
  {
    id: "deprecation-policy",
    name_en: "Deprecation Policy",
    name_uk: "Політика застарілості",
    description_en:
      "How and when API endpoints and features are deprecated and sunset.",
    description_uk:
      "Як і коли ендпоінти та функції API визнаються застарілими та відключаються.",
    notes_en:
      "v1 maintained for 18 months after v2 GA. Deprecation notice: minimum 60 days before removal. Deprecated endpoints return Deprecation and Sunset HTTP headers. Emergency removal possible in <30 days only for security vulnerabilities.",
    notes_uk:
      "v1 підтримується протягом 18 місяців після GA v2. Повідомлення про застарілість: мінімум 60 днів до видалення. Застарілі ендпоінти повертають HTTP-заголовки Deprecation та Sunset. Аварійне видалення можливе менш ніж за 30 днів лише при вразливостях безпеки.",
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const API_DOCS_OPENAPI_NOTE_EN =
  "OpenAPI 3.1 spec auto-generated from Next.js route handlers and Zod schemas. " +
  "Hosted at /openapi.json (always current) and versioned snapshots at /openapi/v1.json. " +
  "Single source of truth for SDKs, interactive explorer, and documentation generation.";

export const API_DOCS_OPENAPI_NOTE_UK =
  "OpenAPI 3.1 специфікація автогенерується з обробників маршрутів Next.js та Zod схем. " +
  "Розміщена за адресою /openapi.json (завжди актуальна) та версіоновані знімки за /openapi/v1.json. " +
  "Єдине джерело правди для SDK, інтерактивного провідника та генерації документації.";

export const API_DOCS_INTERACTIVE_NOTE_EN =
  "Interactive API explorer powered by Scalar (primary) or Redoc (fallback) at /docs/api. " +
  "Sign-in required to make live requests using your own API key. " +
  "Every endpoint has a 'Try it' panel with pre-filled example parameters.";

export const API_DOCS_INTERACTIVE_NOTE_UK =
  "Інтерактивний API-провідник на базі Scalar (основний) або Redoc (запасний) за адресою /docs/api. " +
  "Для виконання реальних запитів з власним API-ключем необхідна авторизація. " +
  "Кожен ендпоінт має панель «Спробувати» з попередньо заповненими прикладами параметрів.";

export const API_DOCS_AUTH_NOTE_EN =
  "API key authentication: Authorization: Bearer <api_key>. " +
  "Tokens are org-scoped; per-integration keys recommended for auditability. " +
  "Per-key rate limits configurable by org admins. " +
  "OAuth 2.0 (Authorization Code + PKCE) planned for v2.";

export const API_DOCS_AUTH_NOTE_UK =
  "Автентифікація за API-ключем: Authorization: Bearer <api_key>. " +
  "Токени прив'язані до організації; рекомендуються окремі ключі для кожної інтеграції для аудиту. " +
  "Обмеження частоти запитів для кожного ключа налаштовуються адміністраторами організації. " +
  "OAuth 2.0 (Authorization Code + PKCE) запланований для v2.";

export const API_DOCS_VERSIONING_NOTE_EN =
  "API versioned at URL path level: /api/v1/, /api/v2/. " +
  "v1 maintained for 18 months after v2 GA. " +
  "Breaking changes require a new major version; additive changes (new fields, new optional params) are non-breaking and ship in the current version. " +
  "Clients should pin to a major version and subscribe to the changelog.";

export const API_DOCS_VERSIONING_NOTE_UK =
  "API версіонується на рівні URL-шляху: /api/v1/, /api/v2/. " +
  "v1 підтримується протягом 18 місяців після GA v2. " +
  "Критичні зміни вимагають нової major-версії; адитивні зміни (нові поля, нові необов'язкові параметри) не є руйнівними та включаються в поточну версію. " +
  "Клієнти повинні фіксувати major-версію та підписатись на журнал змін.";

export const API_DOCS_SDK_NOTE_EN =
  "Official SDKs: TypeScript (@aegislens/sdk on npm), Python (aegislens on PyPI), Go (github.com/aegislens/go-sdk). " +
  "All SDKs are auto-generated from the OpenAPI spec using openapi-typescript and openapi-generator. " +
  "SDK versions are tagged to match API versions (e.g. SDK v1.x targets API v1).";

export const API_DOCS_SDK_NOTE_UK =
  "Офіційні SDK: TypeScript (@aegislens/sdk на npm), Python (aegislens на PyPI), Go (github.com/aegislens/go-sdk). " +
  "Всі SDK автоматично генеруються з OpenAPI специфікації за допомогою openapi-typescript та openapi-generator. " +
  "Версії SDK відповідають версіям API (наприклад, SDK v1.x орієнтований на API v1).";

export const API_DOCS_CHANGELOG_NOTE_EN =
  "Breaking changes announced 60 days in advance via email to all API key holders and a changelog banner on the docs site. " +
  "Non-breaking changes announced in the changelog only (no email). " +
  "Changelog entries include: change description, affected endpoints, migration guide, and effective date.";

export const API_DOCS_CHANGELOG_NOTE_UK =
  "Критичні зміни оголошуються за 60 днів через електронну пошту всім власникам API-ключів та банер журналу змін на сайті документації. " +
  "Неруйнівні зміни оголошуються лише в журналі змін (без електронної пошти). " +
  "Записи журналу змін включають: опис зміни, зачеплені ендпоінти, інструкції з міграції та дату набуття чинності.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the ApiDocsConfig for the given section id, or undefined if not found.
 * Повертає ApiDocsConfig для вказаного id розділу, або undefined якщо не знайдено.
 */
export function getApiDocsSection(
  id: ApiDocsSection,
): ApiDocsConfig | undefined {
  return API_DOCS_SECTIONS.find((s) => s.id === id);
}
