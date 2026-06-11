/**
 * User Docs (Help Center) configuration — self-service mastery from civilian basics to analyst workflows.
 * Конфігурація документації для користувачів (Центр допомоги) — самообслуговування від базового до рівня аналітика.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Categories in the user-facing help center. */
export type UserDocsCategory =
  | "getting-started"
  | "map-workspace"
  | "alerts"
  | "reports"
  | "collaboration"
  | "account-billing"
  | "troubleshooting"
  | "glossary";

/** Full configuration for a single user docs section. */
export interface UserDocsSection {
  id: UserDocsCategory;
  name_en: string;
  name_uk: string;
  icon_en: string;
  description_en: string;
  description_uk: string;
  articleCount_en: string;
  articleCount_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ── Section Configs ───────────────────────────────────────────────────────────

export const USER_DOCS_SECTIONS: UserDocsSection[] = [
  {
    id: "getting-started",
    name_en: "Getting Started",
    name_uk: "Початок роботи",
    icon_en: "rocket",
    description_en:
      "Account setup, first map view, personas, and key concepts for new users.",
    description_uk:
      "Налаштування облікового запису, перший перегляд карти, персони та ключові концепції для нових користувачів.",
    articleCount_en: "12 articles",
    articleCount_uk: "12 статей",
    notes_en:
      "Covers: account creation, plan selection, first login, interface overview, persona-specific getting-started paths (civilian, journalist, analyst, enterprise).",
    notes_uk:
      "Охоплює: створення облікового запису, вибір тарифного плану, перший вхід, огляд інтерфейсу, персона-специфічні шляхи початку роботи (цивільний, журналіст, аналітик, корпоративний).",
  },
  {
    id: "map-workspace",
    name_en: "Map Workspace",
    name_uk: "Картографічний робочий простір",
    icon_en: "map",
    description_en:
      "Layer controls, area-of-interest drawing, filters, time scrubber, and workspace presets.",
    description_uk:
      "Керування шарами, малювання зон інтересу, фільтри, часовий скрубер та пресети робочого простору.",
    articleCount_en: "18 articles",
    articleCount_uk: "18 статей",
    notes_en:
      "Covers: layer on/off, layer opacity, AOI draw tool, saved searches (filter cookbook), time range selection, heatmap mode, satellite imagery toggle, and workspace preset save/restore.",
    notes_uk:
      "Охоплює: увімкнення/вимкнення шарів, прозорість шарів, інструмент малювання AOI, збережені пошуки (книга рецептів фільтрів), вибір діапазону часу, режим теплової карти, перемикання супутникових знімків та збереження/відновлення пресетів робочого простору.",
  },
  {
    id: "alerts",
    name_en: "Alerts & Notifications",
    name_uk: "Сповіщення та повідомлення",
    icon_en: "bell",
    description_en:
      "Creating alert rules, alert recipes, notification channels, and alert history.",
    description_uk:
      "Створення правил сповіщень, рецепти сповіщень, канали повідомлень та історія сповіщень.",
    articleCount_en: "14 articles",
    articleCount_uk: "14 статей",
    notes_en:
      "Covers: alert creation wizard, AOI-based triggers, event-type filters, severity thresholds, notification channels (email, Telegram, webhook, SMS), alert deduplication, and escalation rules.",
    notes_uk:
      "Охоплює: майстер створення сповіщень, тригери на основі AOI, фільтри типів подій, порогові значення серйозності, канали повідомлень (електронна пошта, Telegram, вебхук, SMS), дедублікацію сповіщень та правила ескалації.",
  },
  {
    id: "reports",
    name_en: "Reports",
    name_uk: "Звіти",
    icon_en: "file-text",
    description_en:
      "Browsing, downloading, and generating custom intelligence reports.",
    description_uk:
      "Перегляд, завантаження та генерація власних аналітичних звітів.",
    articleCount_en: "10 articles",
    articleCount_uk: "10 статей",
    notes_en:
      "Covers: report library browser, report download (PDF/CSV), custom report builder, scheduled report delivery, and sharing reports with team members.",
    notes_uk:
      "Охоплює: браузер бібліотеки звітів, завантаження звітів (PDF/CSV), конструктор звітів, заплановану доставку звітів та поширення звітів з членами команди.",
  },
  {
    id: "collaboration",
    name_en: "Collaboration & Case Files",
    name_uk: "Співпраця та справи",
    icon_en: "users",
    description_en:
      "Team workspaces, case file creation, shared annotations, and assignment workflows.",
    description_uk:
      "Командні робочі простори, створення справ, спільні анотації та робочі процеси призначення.",
    articleCount_en: "9 articles",
    articleCount_uk: "9 статей",
    notes_en:
      "Covers: team invite, role assignments (viewer/analyst/editor/admin), case file creation, evidence attachment, case status workflow, shared annotations on map, and case export.",
    notes_uk:
      "Охоплює: запрошення в команду, призначення ролей (переглядач/аналітик/редактор/адміністратор), створення справ, прикріплення доказів, робочий процес статусу справи, спільні анотації на карті та експорт справ.",
  },
  {
    id: "account-billing",
    name_en: "Account & Billing",
    name_uk: "Обліковий запис та оплата",
    icon_en: "credit-card",
    description_en:
      "Subscription management, plan upgrades, invoices, and payment methods.",
    description_uk:
      "Управління підпискою, підвищення тарифного плану, рахунки-фактури та способи оплати.",
    articleCount_en: "11 articles",
    articleCount_uk: "11 статей",
    notes_en:
      "Covers: plan comparison, upgrade/downgrade flow, payment method management, invoice download, VAT settings, usage quota dashboard, and account deletion.",
    notes_uk:
      "Охоплює: порівняння планів, процес підвищення/зниження тарифу, управління способами оплати, завантаження рахунків-фактур, налаштування ПДВ, панель квот використання та видалення облікового запису.",
  },
  {
    id: "troubleshooting",
    name_en: "Troubleshooting",
    name_uk: "Усунення неполадок",
    icon_en: "wrench",
    description_en:
      "Common issues, error messages, browser compatibility, and how to contact support.",
    description_uk:
      "Поширені проблеми, повідомлення про помилки, сумісність браузерів та як зв'язатися з підтримкою.",
    articleCount_en: "16 articles",
    articleCount_uk: "16 статей",
    notes_en:
      "Covers: map not loading, alerts not firing, export errors, login issues, browser compatibility matrix, performance tips, and how to submit a support ticket with diagnostic info.",
    notes_uk:
      "Охоплює: карта не завантажується, сповіщення не спрацьовують, помилки експорту, проблеми входу, матриця сумісності браузерів, поради щодо продуктивності та як подати тікет підтримки з діагностичною інформацією.",
  },
  {
    id: "glossary",
    name_en: "Glossary",
    name_uk: "Глосарій",
    icon_en: "book-open",
    description_en:
      "Definitions for OSINT, military, legal, and platform-specific terms used across the platform.",
    description_uk:
      "Визначення термінів OSINT, військових, юридичних та специфічних для платформи термінів, що використовуються на платформі.",
    articleCount_en: "279 terms",
    articleCount_uk: "279 термінів",
    notes_en:
      "Cross-linked to relevant help articles and in-app tooltips. Available in EN and UK. Terms tagged by domain: osint / military / legal / platform. See lib/glossary-data.ts for the canonical data source.",
    notes_uk:
      "Перехресні посилання на відповідні статті допомоги та підказки в застосунку. Доступний в EN та UK. Терміни позначені за доменом: osint / military / legal / platform. Канонічне джерело даних — lib/glossary-data.ts.",
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const USER_DOCS_SEARCH_NOTE_EN =
  "Search across all user docs articles. " +
  "Autocomplete enabled with suggested queries after 2 characters. " +
  "'Did you mean?' correction for common typos and misspellings. " +
  "Results ranked by relevance + recency; filter by category available.";

export const USER_DOCS_SEARCH_NOTE_UK =
  "Пошук по всіх статтях документації для користувачів. " +
  "Автодоповнення з пропонованими запитами після 2 символів. " +
  "Функція «Чи мали ви на увазі?» для виправлення поширених друкарських помилок. " +
  "Результати ранжуються за релевантністю та свіжістю; доступний фільтр за категорією.";

export const USER_DOCS_VIDEO_NOTE_EN =
  "Video walkthroughs available for key user flows: " +
  "(1) Map workspace setup and layer management — 4 min. " +
  "(2) Creating your first alert — 3 min. " +
  "(3) Generating a custom report — 5 min. " +
  "(4) Inviting your team and setting roles — 2 min. " +
  "Videos hosted on a privacy-respecting CDN; no third-party tracker cookies.";

export const USER_DOCS_VIDEO_NOTE_UK =
  "Відеоінструкції доступні для ключових потоків користувача: " +
  "(1) Налаштування картографічного робочого простору та управління шарами — 4 хв. " +
  "(2) Створення першого сповіщення — 3 хв. " +
  "(3) Генерація звіту — 5 хв. " +
  "(4) Запрошення команди та налаштування ролей — 2 хв. " +
  "Відео розміщені на CDN з дотриманням конфіденційності; без сторонніх трекерів.";

export const USER_DOCS_TOOLTIP_NOTE_EN =
  "Contextual tooltips in the app UI link to the most relevant help article for every feature. " +
  "? icons in the interface open a contextual help panel without leaving the current page. " +
  "Tooltip links are maintained in the help-kb.ts source file with doc section anchors.";

export const USER_DOCS_TOOLTIP_NOTE_UK =
  "Контекстні підказки в інтерфейсі застосунку посилаються на найрелевантнішу статтю допомоги для кожної функції. " +
  "Іконки ? в інтерфейсі відкривають панель контекстної допомоги без виходу з поточної сторінки. " +
  "Посилання підказок підтримуються у файлі-джерелі help-kb.ts з прив'язками до розділів документації.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the UserDocsSection for the given category id, or undefined if not found.
 * Повертає UserDocsSection для вказаного id категорії, або undefined якщо не знайдено.
 */
export function getUserDocsSection(
  id: UserDocsCategory,
): UserDocsSection | undefined {
  return USER_DOCS_SECTIONS.find((s) => s.id === id);
}
