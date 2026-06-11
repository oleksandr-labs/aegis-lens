/**
 * Developer Docs configuration — first-class DX for partners, security teams, and academic users.
 * Конфігурація документації для розробників — DX першого класу для партнерів, команд безпеки та академічних користувачів.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** All sections of the developer documentation. */
export type DevDocsSection =
  | "quickstart"
  | "api-reference"
  | "sdk"
  | "webhooks"
  | "mcp-integration"
  | "self-hosted"
  | "contributing";

/** Full configuration for a single developer docs section. */
export interface DevDocsSectionConfig {
  id: DevDocsSection;
  name_en: string;
  name_uk: string;
  difficulty_en: string;
  difficulty_uk: string;
  description_en: string;
  description_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ── Section Configs ───────────────────────────────────────────────────────────

export const DEV_DOCS_SECTIONS: DevDocsSectionConfig[] = [
  {
    id: "quickstart",
    name_en: "Quickstart",
    name_uk: "Швидкий старт",
    difficulty_en: "Beginner",
    difficulty_uk: "Початковий",
    description_en:
      "Get from zero to a working API call in under 5 minutes using TypeScript, Python, or Go.",
    description_uk:
      "Від нуля до робочого API-виклику менш ніж за 5 хвилин за допомогою TypeScript, Python або Go.",
    notes_en:
      "Each SDK has its own quickstart path. Covers: install SDK, authenticate, fetch events, handle pagination. Runnable code snippets for all three languages. Links to interactive playground.",
    notes_uk:
      "Кожен SDK має власний шлях швидкого старту. Охоплює: встановлення SDK, автентифікація, отримання подій, обробка пагінації. Виконувані фрагменти коду для всіх трьох мов. Посилання на інтерактивний майданчик.",
  },
  {
    id: "api-reference",
    name_en: "API Reference",
    name_uk: "Довідник API",
    difficulty_en: "Intermediate",
    difficulty_uk: "Середній",
    description_en:
      "Complete REST API reference auto-generated from OpenAPI 3.1 spec with hand-curated examples.",
    description_uk:
      "Повний довідник REST API, автогенерований з OpenAPI 3.1 специфікації з вручну підготовленими прикладами.",
    notes_en:
      "Covers all v1 endpoints. Per-endpoint: method, path, parameters, request body schema, response schema, error codes, and example request/response pairs in curl, TS, Python, and Go. Pagination and cursor conventions documented inline.",
    notes_uk:
      "Охоплює всі ендпоінти v1. Для кожного ендпоінту: метод, шлях, параметри, схема тіла запиту, схема відповіді, коди помилок та приклади пар запит/відповідь в curl, TS, Python та Go. Конвенції пагінації та курсорів задокументовані вбудовано.",
  },
  {
    id: "sdk",
    name_en: "SDK Reference",
    name_uk: "Довідник SDK",
    difficulty_en: "Beginner",
    difficulty_uk: "Початковий",
    description_en:
      "Official TypeScript, Python, and Go SDKs — installation, configuration, and method reference.",
    description_uk:
      "Офіційні SDK для TypeScript, Python та Go — встановлення, конфігурація та довідник методів.",
    notes_en:
      "TypeScript: npm install @aegislens/sdk. Python: pip install aegislens. Go: go get github.com/aegislens/go-sdk. All SDKs are auto-generated from OpenAPI and publish typed client wrappers, retry logic, and rate-limit back-off built in.",
    notes_uk:
      "TypeScript: npm install @aegislens/sdk. Python: pip install aegislens. Go: go get github.com/aegislens/go-sdk. Всі SDK автогенеровані з OpenAPI та публікують типізовані клієнтські обгортки з вбудованою логікою повторних спроб та відступом при обмеженні частоти запитів.",
  },
  {
    id: "webhooks",
    name_en: "Webhooks",
    name_uk: "Вебхуки",
    difficulty_en: "Intermediate",
    difficulty_uk: "Середній",
    description_en:
      "Real-time event push: how to register endpoints, verify signatures, handle retries, and replay missed events.",
    description_uk:
      "Відправка подій у реальному часі: реєстрація ендпоінтів, верифікація підписів, обробка повторних спроб та відтворення пропущених подій.",
    notes_en:
      "HMAC-SHA256 verification on X-Aegis-Signature-256 header. Retry policy: exponential back-off up to 72h, then dead-letter queue. Event replay available for last 72h via /webhooks/replay. Full event catalog with schema per event type.",
    notes_uk:
      "Верифікація HMAC-SHA256 в заголовку X-Aegis-Signature-256. Політика повторних спроб: експоненційний відступ до 72г, потім черга мертвих листів. Відтворення подій доступне за останні 72г через /webhooks/replay. Повний каталог подій зі схемою для кожного типу події.",
  },
  {
    id: "mcp-integration",
    name_en: "MCP Integration",
    name_uk: "Інтеграція MCP",
    difficulty_en: "Advanced",
    difficulty_uk: "Просунутий",
    description_en:
      "Model Context Protocol integration: expose Aegis Lens data as MCP tools to AI agents and copilots.",
    description_uk:
      "Інтеграція Model Context Protocol: надання даних Aegis Lens як MCP-інструментів для AI-агентів та копілотів.",
    notes_en:
      "MCP server available at @aegislens/mcp-server (npm). Exposes tools: search_events, get_region_summary, get_travel_risk, query_aoi. Compatible with Claude Desktop, Continue, and any MCP-compliant host. Auth via API key passed as MCP env var.",
    notes_uk:
      "MCP-сервер доступний як @aegislens/mcp-server (npm). Надає інструменти: search_events, get_region_summary, get_travel_risk, query_aoi. Сумісний з Claude Desktop, Continue та будь-яким MCP-сумісним хостом. Автентифікація через API-ключ, переданий як змінна середовища MCP.",
  },
  {
    id: "self-hosted",
    name_en: "Self-Hosted Deployment",
    name_uk: "Самостійне розгортання",
    difficulty_en: "Advanced",
    difficulty_uk: "Просунутий",
    description_en:
      "Deploy Aegis Lens on your own infrastructure: Docker Compose for dev, Kubernetes for production.",
    description_uk:
      "Розгорніть Aegis Lens на власній інфраструктурі: Docker Compose для розробки, Kubernetes для виробничого середовища.",
    notes_en:
      "Covers: prerequisites, Docker Compose quickstart, Kubernetes Helm chart, environment variable reference, database migrations, first-run seed, and upgrade procedure. Air-gapped deployment guide for government customers.",
    notes_uk:
      "Охоплює: передумови, Docker Compose швидкий старт, Kubernetes Helm чарт, довідник змінних середовища, міграції бази даних, початкове заповнення та процедуру оновлення. Посібник з розгортання без доступу до інтернету для державних замовників.",
  },
  {
    id: "contributing",
    name_en: "Contributing",
    name_uk: "Участь у розробці",
    difficulty_en: "Intermediate",
    difficulty_uk: "Середній",
    description_en:
      "How to contribute examples, corrections, and integrations to the Aegis Lens ecosystem.",
    description_uk:
      "Як робити внески у вигляді прикладів, виправлень та інтеграцій в екосистему Aegis Lens.",
    notes_en:
      "Community PRs welcome for: code examples, typo fixes, and integration guides. Docs source on GitHub (aegislens/docs). PR template includes doc-type label, affected section, and testing checklist. Significant contributions credited in changelog.",
    notes_uk:
      "Прийняються PR від спільноти з: прикладами коду, виправленнями помилок та посібниками з інтеграцій. Джерело документації на GitHub (aegislens/docs). Шаблон PR включає мітку типу документа, зачеплений розділ та чеклист тестування. Значні внески згадуються в журналі змін.",
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const DEV_DOCS_INTERACTIVE_NOTE_EN =
  "Interactive code playground (Monaco editor) embedded in the docs at /docs/playground. " +
  "Allows authenticated developers to run API calls directly from the browser. " +
  "Pre-loaded templates for common use-cases: event search, AOI query, alert subscription setup.";

export const DEV_DOCS_INTERACTIVE_NOTE_UK =
  "Інтерактивний майданчик коду (редактор Monaco) вбудований в документацію за адресою /docs/playground. " +
  "Дозволяє авторизованим розробникам запускати API-виклики безпосередньо з браузера. " +
  "Попередньо завантажені шаблони для поширених випадків використання: пошук подій, запит AOI, налаштування підписки на сповіщення.";

export const DEV_DOCS_OPENAPI_NOTE_EN =
  "OpenAPI 3.1 spec always available at /openapi.json (latest) and /openapi/v1.json (versioned). " +
  "Import into Postman, Bruno, Insomnia, or any OpenAPI-compatible tool. " +
  "SDKs auto-generated from this spec — spec is the single source of truth.";

export const DEV_DOCS_OPENAPI_NOTE_UK =
  "OpenAPI 3.1 специфікація завжди доступна за адресою /openapi.json (остання) та /openapi/v1.json (версіонована). " +
  "Імпортуйте в Postman, Bruno, Insomnia або будь-який OpenAPI-сумісний інструмент. " +
  "SDK автогенеруються з цієї специфікації — специфікація є єдиним джерелом правди.";

export const DEV_DOCS_GITHUB_NOTE_EN =
  "Developer docs source lives on GitHub at github.com/aegislens/docs. " +
  "Community PRs welcome for examples, typo corrections, and additional integration guides. " +
  "File an issue for doc bugs; tag with 'documentation' label for triage. " +
  "Significant contributors are credited in the changelog and the docs footer.";

export const DEV_DOCS_GITHUB_NOTE_UK =
  "Джерело документації для розробників знаходиться на GitHub: github.com/aegislens/docs. " +
  "Прийняються PR від спільноти з прикладами, виправленнями помилок та додатковими посібниками з інтеграцій. " +
  "Повідомляйте про помилки в документації через issues; позначайте міткою 'documentation' для сортування. " +
  "Значні учасники згадуються в журналі змін та нижньому колонтитулі документації.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the DevDocsSectionConfig for the given section id, or undefined if not found.
 * Повертає DevDocsSectionConfig для вказаного id розділу, або undefined якщо не знайдено.
 */
export function getDevDocsSection(
  id: DevDocsSection,
): DevDocsSectionConfig | undefined {
  return DEV_DOCS_SECTIONS.find((s) => s.id === id);
}
