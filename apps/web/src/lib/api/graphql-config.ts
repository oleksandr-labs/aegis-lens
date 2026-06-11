/**
 * GraphQL API configuration — schema types, resolver groups, notes, and endpoint constant.
 * Конфігурація GraphQL API — типи схеми, групи резолверів, нотатки та константа ендпоінта.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type GraphQLSchemaType =
  | "Event"
  | "Entity"
  | "Alert"
  | "Investigation"
  | "Report"
  | "Source"
  | "AlertRule"
  | "Case"
  | "Notebook"
  | "TravelRisk";

export interface GraphQLResolverGroup {
  type: GraphQLSchemaType;
  description: string;
  descriptionUk: string;
  resolvers: string[];
}

// ── Endpoint ──────────────────────────────────────────────────────────────────

export const GRAPHQL_ENDPOINT = "/api/graphql" as const;

// ── Schema groups ─────────────────────────────────────────────────────────────

export const GRAPHQL_SCHEMA_GROUPS: GraphQLResolverGroup[] = [
  {
    type: "Event",
    description: "OSINT events — conflict incidents, explosions, movements, and other field-observed activities.",
    descriptionUk: "OSINT-події — бойові інциденти, вибухи, переміщення та інші зафіксовані в полі активності.",
    resolvers: ["events", "event", "eventsByRegion", "eventStream"],
  },
  {
    type: "Entity",
    description: "Named entities — military units, organizations, persons, vehicles, and infrastructure.",
    descriptionUk: "Іменовані сутності — військові підрозділи, організації, особи, техніка та інфраструктура.",
    resolvers: ["entities", "entity", "entitiesByType", "entitySearch"],
  },
  {
    type: "Alert",
    description: "User and system alerts triggered by AOI crossings, keyword matches, or severity thresholds.",
    descriptionUk: "Сповіщення користувачів та системи, ініційовані перетином AOI, збігом ключових слів або порогами серйозності.",
    resolvers: ["alerts", "alert", "alertsByUser", "unreadAlerts"],
  },
  {
    type: "Investigation",
    description: "Analyst investigation workspaces linking events, entities, sources, and notes.",
    descriptionUk: "Робочі простори аналітичних розслідувань, що пов'язують події, сутності, джерела та нотатки.",
    resolvers: ["investigations", "investigation", "investigationsByUser", "investigationEvents"],
  },
  {
    type: "Report",
    description: "Structured intelligence reports with sourced claims, maps, and entity references.",
    descriptionUk: "Структуровані аналітичні звіти з підтвердженими твердженнями, картами та посиланнями на сутності.",
    resolvers: ["reports", "report", "publicReports", "reportBySlug"],
  },
  {
    type: "Source",
    description: "Primary and secondary sources: Telegram channels, news sites, social media accounts, official feeds.",
    descriptionUk: "Первинні та вторинні джерела: Telegram-канали, новинні сайти, облікові записи соцмереж, офіційні стрічки.",
    resolvers: ["sources", "source", "sourcesByRegion", "sourceReliabilityScore"],
  },
  {
    type: "AlertRule",
    description: "Alert rule definitions — condition sets that trigger alerts when matched.",
    descriptionUk: "Визначення правил сповіщень — набори умов, що запускають сповіщення при збігу.",
    resolvers: ["alertRules", "alertRule", "alertRulesByUser", "evaluateAlertRule"],
  },
  {
    type: "Case",
    description: "Structured cases grouping related events, entities, and findings for collaboration.",
    descriptionUk: "Структуровані кейси, що об'єднують пов'язані події, сутності та висновки для спільної роботи.",
    resolvers: ["cases", "case", "casesByOrg", "caseTimeline"],
  },
  {
    type: "Notebook",
    description: "Analyst notebooks with prose, query, map, chart, AI, and code cells.",
    descriptionUk: "Аналітичні блокноти з комірками тексту, запитів, карт, графіків, AI та коду.",
    resolvers: ["notebooks", "notebook", "publicNotebooks", "notebookBySlug"],
  },
  {
    type: "TravelRisk",
    description: "Travel risk assessments per region — safety scores, advisories, and live incident overlays.",
    descriptionUk: "Оцінки туристичних ризиків за регіонами — бали безпеки, рекомендації та накладки активних інцидентів.",
    resolvers: ["travelRisk", "travelRiskByIso2", "travelAdvisories", "travelRiskScore"],
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Apollo Server or Pothos — schema-first or code-first GraphQL implementation planned */
export const GRAPHQL_NOTE_SERVER_EN =
  "Apollo Server or Pothos — either schema-first (Apollo) or code-first (Pothos) GraphQL implementation is planned; the SDL in graphql-schema.ts serves as the typed contract until wiring is complete.";
export const GRAPHQL_NOTE_SERVER_UK =
  "Apollo Server або Pothos — заплановано впровадження GraphQL за принципом schema-first (Apollo) або code-first (Pothos); SDL у graphql-schema.ts слугує типізованим контрактом до завершення підключення.";

/** DataLoader for N+1 — all list resolvers will use DataLoader batching */
export const GRAPHQL_NOTE_DATALOADER_EN =
  "DataLoader for N+1 — all list resolvers will use DataLoader batching and caching to prevent N+1 query patterns; each request context gets a fresh DataLoader instance.";
export const GRAPHQL_NOTE_DATALOADER_UK =
  "DataLoader для N+1 — всі резолвери списків використовуватимуть пакетну обробку та кешування DataLoader для запобігання шаблонам запитів N+1; кожен контекст запиту отримує новий екземпляр DataLoader.";

/** Depth limit 5 — query depth is capped to prevent deeply nested abusive queries */
export const GRAPHQL_NOTE_DEPTH_EN =
  "Depth limit 5 — query depth is capped at 5 levels to prevent deeply nested abusive queries; complexity limits are also enforced (max 1000 cost units per query).";
export const GRAPHQL_NOTE_DEPTH_UK =
  "Обмеження глибини 5 — глибина запиту обмежена 5 рівнями для запобігання зловживанням через глибоко вкладені запити; також застосовуються обмеження складності (макс. 1000 одиниць вартості на запит).";

/** Persisted queries — APQ (Automatic Persisted Queries) will be supported for CDN caching */
export const GRAPHQL_NOTE_PERSISTED_EN =
  "Persisted queries — APQ (Automatic Persisted Queries) will be supported for CDN-level caching of frequent queries; clients send a hash first, falling back to full query on cache miss.";
export const GRAPHQL_NOTE_PERSISTED_UK =
  "Збережені запити — APQ (Automatic Persisted Queries) підтримуватимуться для кешування на рівні CDN частих запитів; клієнти спочатку надсилають хеш і повертаються до повного запиту при промаху кешу.";

export const GRAPHQL_NOTES_EN = [
  GRAPHQL_NOTE_SERVER_EN,
  GRAPHQL_NOTE_DATALOADER_EN,
  GRAPHQL_NOTE_DEPTH_EN,
  GRAPHQL_NOTE_PERSISTED_EN,
];
export const GRAPHQL_NOTES_UK = [
  GRAPHQL_NOTE_SERVER_UK,
  GRAPHQL_NOTE_DATALOADER_UK,
  GRAPHQL_NOTE_DEPTH_UK,
  GRAPHQL_NOTE_PERSISTED_UK,
];

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Build a one-line summary note listing all GraphQL schema types.
 * Побудова однорядкової зведеної нотатки з переліком усіх типів схеми GraphQL.
 */
export function buildGraphQLSchemaNote(): string {
  const types = GRAPHQL_SCHEMA_GROUPS.map((g) => g.type).join(", ");
  return `Aegis Lens GraphQL schema covers ${GRAPHQL_SCHEMA_GROUPS.length} root types: ${types}. Endpoint: ${GRAPHQL_ENDPOINT}.`;
}
