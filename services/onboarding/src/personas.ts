/**
 * Persona definitions and per-persona onboarding configuration.
 * Source of truth for the persona system — referenced by onboarding API,
 * copilot system prompts, and alert seed defaults.
 */

export type PersonaId = "civilian" | "journalist" | "analyst" | "ngo" | "government" | "security" | "researcher" | "trader" | "humanitarian";

export interface Persona {
  id: PersonaId;
  name: string;
  nameUk: string;
  description: string;
  defaultTier: string;
  /** Primary question this persona wants answered */
  primaryQuestion: string;
  primaryQuestionUk: string;
  /** Map center for first run [lon, lat, zoom] */
  defaultMapView: [number, number, number];
  defaultActiveLayers: string[];
  /** Pre-seeded alert filters */
  defaultAlertFilters: Record<string, unknown>;
  /** Onboarding checklist steps (max 5) */
  onboardingSteps: OnboardingStep[];
  /** Sample copilot prompt shown on first run */
  copilotPrompt: string;
  copilotPromptUk: string;
  /** Pre-seeded saved searches */
  savedSearches: SavedSearch[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  titleUk: string;
  description: string;
  descriptionUk: string;
  /** Tracks as complete when user takes this action */
  completionEvent: string;
  cta: string;
  ctaUk: string;
}

export interface SavedSearch {
  name: string;
  nameUk: string;
  query: string;
  filters: Record<string, unknown>;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  civilian: {
    id: "civilian",
    name: "Civilian",
    nameUk: "Цивільний",
    description: "Informed public — safety near family, air alerts, local events.",
    defaultTier: "free",
    primaryQuestion: "Is it safe near me or my family?",
    primaryQuestionUk: "Чи безпечно поруч з моїми близькими?",
    defaultMapView: [31.0, 49.0, 6],
    defaultActiveLayers: ["civilian_alerts", "power_outages", "air_raid"],
    defaultAlertFilters: { class: ["civilian_alert", "air_raid"], severity: [3, 4, 5] },
    onboardingSteps: [
      { id: "set-region", title: "Set your region", titleUk: "Вкажіть ваш регіон", description: "Pin the oblast or city you want to monitor.", descriptionUk: "Обeri регіон для моніторингу.", completionEvent: "aoi.created", cta: "Add region", ctaUk: "Додати регіон" },
      { id: "enable-alerts", title: "Enable air raid alerts", titleUk: "Увімкнути повітряну тривогу", description: "Get push notifications when alerts fire in your region.", descriptionUk: "Отримуйте сповіщення про тривоги.", completionEvent: "alert.created", cta: "Enable alerts", ctaUk: "Увімкнути" },
      { id: "add-push", title: "Enable push notifications", titleUk: "Дозвольте push-сповіщення", description: "Allow browser push so alerts reach you even when the tab is closed.", descriptionUk: "Дозвольте сповіщення браузера.", completionEvent: "push.subscribed", cta: "Allow notifications", ctaUk: "Дозволити" },
      { id: "explore-map", title: "Explore the map", titleUk: "Перегляньте карту", description: "Zoom in to your area and tap an event to see details.", descriptionUk: "Наблизьте карту та натисніть на подію.", completionEvent: "map.event_opened", cta: "Open map", ctaUk: "Відкрити карту" },
      { id: "share", title: "Share with family", titleUk: "Поділитися з рідними", description: "Send a saved-view link to family members so they can check your region.", descriptionUk: "Надішліть посилання рідним.", completionEvent: "preset.shared", cta: "Share view", ctaUk: "Поділитися" },
    ],
    copilotPrompt: "Ask me what's happening in your region today.",
    copilotPromptUk: "Запитайте мене, що відбувається у вашому регіоні сьогодні.",
    savedSearches: [
      { name: "Air raids today", nameUk: "Повітряні тривоги сьогодні", query: "air raid", filters: { class: ["air_raid"], hours: 24 } },
      { name: "Civilian safety events", nameUk: "Цивільна безпека", query: "civilian", filters: { class: ["civilian_alert", "evacuation"], hours: 48 } },
    ],
  },

  journalist: {
    id: "journalist",
    name: "Journalist / Newsroom",
    nameUk: "Журналіст / Редакція",
    description: "Verified, citable, fast — for breaking news and investigative work.",
    defaultTier: "pro",
    primaryQuestion: "What just happened and can it be verified?",
    primaryQuestionUk: "Що сталося і чи можна це підтвердити?",
    defaultMapView: [32.0, 48.5, 6],
    defaultActiveLayers: ["military_action", "civilian_alerts", "infrastructure"],
    defaultAlertFilters: { class: ["military_action", "civilian_alert"], severity: [4, 5], minConfidence: 0.7 },
    onboardingSteps: [
      { id: "verify-event", title: "Verify an event", titleUk: "Верифікуйте подію", description: "Open any event and check its verification status and source chain.", descriptionUk: "Відкрийте подію та перевірте її верифікацію.", completionEvent: "event.opened", cta: "Open event", ctaUk: "Відкрити подію" },
      { id: "create-case", title: "Open a case", titleUk: "Відкрийте справу", description: "Group related events and notes into a case for your investigation.", descriptionUk: "Групуйте події та нотатки у справу.", completionEvent: "case.created", cta: "Create case", ctaUk: "Створити справу" },
      { id: "export-data", title: "Export data", titleUk: "Експортуйте дані", description: "Download events as CSV or GeoJSON for your story.", descriptionUk: "Завантажте події у форматі CSV або GeoJSON.", completionEvent: "export.created", cta: "Export events", ctaUk: "Експорт" },
      { id: "set-alert", title: "Set a breaking-news alert", titleUk: "Налаштуйте сповіщення", description: "Get notified immediately when high-severity events hit your beat.", descriptionUk: "Отримуйте сповіщення про важливі події.", completionEvent: "alert.created", cta: "Set alert", ctaUk: "Налаштувати" },
      { id: "embed", title: "Embed the map", titleUk: "Вбудуйте карту", description: "Add an interactive map to your article with one line of code.", descriptionUk: "Додайте інтерактивну карту до статті.", completionEvent: "embed.copied", cta: "Get embed code", ctaUk: "Отримати код" },
    ],
    copilotPrompt: "Ask me to summarize the last 6 hours of verified events for a specific region.",
    copilotPromptUk: "Попросіть мене підготувати зведення верифікованих подій за останні 6 годин.",
    savedSearches: [
      { name: "High severity last 6h", nameUk: "Серйозні події за 6 годин", query: "severity:5", filters: { severity: [4, 5], hours: 6 } },
      { name: "Infrastructure damage", nameUk: "Пошкодження інфраструктури", query: "infrastructure damage", filters: { class: ["infrastructure_damage"] } },
    ],
  },

  analyst: {
    id: "analyst",
    name: "OSINT Analyst",
    nameUk: "OSINT аналітик",
    description: "Deep tools, raw access, exports — for professional open-source intelligence work.",
    defaultTier: "pro",
    primaryQuestion: "What patterns can I find in the data?",
    primaryQuestionUk: "Які закономірності є в даних?",
    defaultMapView: [35.0, 48.5, 5],
    defaultActiveLayers: ["military_action", "troop_movement", "infrastructure", "civilian_alerts", "power_outages"],
    defaultAlertFilters: { minConfidence: 0.6 },
    onboardingSteps: [
      { id: "api-key", title: "Get your API key", titleUk: "Отримайте API-ключ", description: "Access raw event data programmatically via REST or Python SDK.", descriptionUk: "Доступ до даних через REST або Python SDK.", completionEvent: "api_key.created", cta: "Create API key", ctaUk: "Створити ключ" },
      { id: "build-rule", title: "Build an alert rule", titleUk: "Створіть правило сповіщення", description: "Describe your monitoring need in natural language — the AI will build the rule.", descriptionUk: "Опишіть умову природною мовою.", completionEvent: "alert.created", cta: "Build rule", ctaUk: "Створити правило" },
      { id: "notebook", title: "Open a notebook", titleUk: "Відкрийте ноутбук", description: "Combine queries, maps, and AI cells for reproducible analysis.", descriptionUk: "Поєднуйте запити, карти та AI для аналізу.", completionEvent: "notebook.created", cta: "New notebook", ctaUk: "Новий ноутбук" },
      { id: "export", title: "Export a dataset", titleUk: "Експортуйте датасет", description: "Download bulk event data as GeoJSON, CSV, or via API.", descriptionUk: "Завантажте дані у GeoJSON, CSV або через API.", completionEvent: "export.created", cta: "Export data", ctaUk: "Експортувати" },
      { id: "aoi", title: "Create an AOI", titleUk: "Створіть зону інтересу", description: "Draw a polygon or set a radius around a key location to monitor.", descriptionUk: "Намалюйте полігон або вкажіть радіус.", completionEvent: "aoi.created", cta: "Create AOI", ctaUk: "Створити AOI" },
    ],
    copilotPrompt: "Ask me to analyze event patterns or summarize a region's last 30 days.",
    copilotPromptUk: "Попросіть мене проаналізувати патерни або підготувати зведення за регіоном.",
    savedSearches: [
      { name: "All events 30d", nameUk: "Всі події за 30 днів", query: "*", filters: { hours: 720 } },
      { name: "High confidence only", nameUk: "Лише підтверджені", query: "confidence:high", filters: { minConfidence: 0.8 } },
    ],
  },

  ngo: {
    id: "ngo",
    name: "NGO / Humanitarian",
    nameUk: "НКО / Гуманітарна організація",
    description: "Humanitarian targeting, civilian protection, evacuation corridor safety.",
    defaultTier: "pro",
    primaryQuestion: "Where do civilians need help and can we get there safely?",
    primaryQuestionUk: "Де потрібна допомога цивільним і чи можна безпечно туди дістатися?",
    defaultMapView: [32.0, 48.5, 6],
    defaultActiveLayers: ["civilian_alerts", "power_outages", "infrastructure", "travel_risk"],
    defaultAlertFilters: { class: ["civilian_alert", "displacement", "infrastructure_damage"] },
    onboardingSteps: [
      { id: "route-check", title: "Check a route", titleUk: "Перевірте маршрут", description: "Assess risk for a field team route before deployment.", descriptionUk: "Оцініть ризик маршруту для польової команди.", completionEvent: "travel_risk.checked", cta: "Check route", ctaUk: "Перевірити маршрут" },
      { id: "aoi", title: "Monitor an area of operation", titleUk: "Моніторинг зони операцій", description: "Set an AOI around your operational area for automatic updates.", descriptionUk: "Налаштуйте AOI для автоматичних оновлень.", completionEvent: "aoi.created", cta: "Create AOI", ctaUk: "Створити AOI" },
      { id: "alert", title: "Set a civilian-impact alert", titleUk: "Налаштуйте сповіщення", description: "Get notified of any civilian-impact events in your AO.", descriptionUk: "Сповіщення про будь-які події у вашій зоні.", completionEvent: "alert.created", cta: "Set alert", ctaUk: "Налаштувати" },
      { id: "report", title: "Generate a situation report", titleUk: "Сформуйте ситуаційний звіт", description: "Export a PDF sitrep for your coordination meeting.", descriptionUk: "Завантажте PDF-звіт для координаційної наради.", completionEvent: "report.created", cta: "Generate sitrep", ctaUk: "Сформувати звіт" },
      { id: "team", title: "Invite team members", titleUk: "Запросіть членів команди", description: "Add colleagues so they share the same operational picture.", descriptionUk: "Додайте колег до спільного погляду.", completionEvent: "member.invited", cta: "Invite team", ctaUk: "Запросити" },
    ],
    copilotPrompt: "Ask me which areas have the highest civilian displacement risk today.",
    copilotPromptUk: "Запитайте мене, де сьогодні найвищий ризик переміщення цивільних.",
    savedSearches: [
      { name: "Civilian impact events", nameUk: "Події з впливом на цивільних", query: "civilian impact", filters: { class: ["civilian_alert", "displacement"] } },
      { name: "Infrastructure damage", nameUk: "Пошкодження інфраструктури", query: "infrastructure", filters: { class: ["infrastructure_damage"] } },
    ],
  },

  government: {
    id: "government",
    name: "Government / Defense",
    nameUk: "Уряд / Оборона",
    description: "Sovereignty, audit trails, custom layers, compliance.",
    defaultTier: "enterprise",
    primaryQuestion: "What is the operational picture and what are we missing?",
    primaryQuestionUk: "Яка оперативна картина і що нам невідомо?",
    defaultMapView: [32.0, 49.0, 6],
    defaultActiveLayers: ["military_action", "infrastructure", "civilian_alerts", "power_outages", "troop_movement"],
    defaultAlertFilters: { severity: [3, 4, 5] },
    onboardingSteps: [
      { id: "configure-sso", title: "Configure SSO", titleUk: "Налаштуйте SSO", description: "Connect your identity provider for secure org-wide access.", descriptionUk: "Підключіть провайдера ідентифікації.", completionEvent: "sso.configured", cta: "Set up SSO", ctaUk: "Налаштувати SSO" },
      { id: "create-team", title: "Create teams", titleUk: "Створіть команди", description: "Segment access by department, classification level, or role.", descriptionUk: "Розподіліть доступ за підрозділами.", completionEvent: "team.created", cta: "Create team", ctaUk: "Створити команду" },
      { id: "webhook", title: "Connect your SIEM", titleUk: "Підключіть SIEM", description: "Forward all alerts to your security operations center via webhook.", descriptionUk: "Перенаправляйте сповіщення до вашого SOC.", completionEvent: "webhook.created", cta: "Set up webhook", ctaUk: "Налаштувати webhook" },
      { id: "custom-layer", title: "Add a custom layer", titleUk: "Додайте власний шар", description: "Overlay your classified data on top of our intelligence layers.", descriptionUk: "Накладіть власні дані на нашу карту.", completionEvent: "layer.custom_added", cta: "Add layer", ctaUk: "Додати шар" },
      { id: "audit", title: "Review the audit log", titleUk: "Перегляньте журнал аудиту", description: "See every user action for compliance and accountability.", descriptionUk: "Перегляньте всі дії користувачів.", completionEvent: "audit_log.opened", cta: "Open audit log", ctaUk: "Відкрити журнал" },
    ],
    copilotPrompt: "Ask me for a strategic assessment of the current situation across all fronts.",
    copilotPromptUk: "Попросіть мене провести стратегічний аналіз поточної ситуації.",
    savedSearches: [
      { name: "All fronts last 24h", nameUk: "Всі фронти за 24 год", query: "fronts", filters: { hours: 24 } },
    ],
  },

  security: {
    id: "security",
    name: "Security / Private Intel",
    nameUk: "Безпека / Приватна розвідка",
    description: "API-first, white-label, SLA-backed — for professional intelligence firms.",
    defaultTier: "enterprise",
    primaryQuestion: "What data can we pipe into our own platform?",
    primaryQuestionUk: "Які дані можна підключити до нашої платформи?",
    defaultMapView: [32.0, 49.0, 6],
    defaultActiveLayers: ["military_action", "infrastructure", "troop_movement"],
    defaultAlertFilters: { minConfidence: 0.7 },
    onboardingSteps: [
      { id: "api-key", title: "Create an API key", titleUk: "Створіть API-ключ", description: "Generate a high-rate-limit key for production integration.", descriptionUk: "Генеруйте ключ для продакшн-інтеграції.", completionEvent: "api_key.created", cta: "Create API key", ctaUk: "Створити ключ" },
      { id: "webhook", title: "Set up event webhooks", titleUk: "Налаштуйте вебхуки", description: "Receive real-time event pushes to your platform endpoint.", descriptionUk: "Отримуйте події в реальному часі.", completionEvent: "webhook.created", cta: "Create webhook", ctaUk: "Створити вебхук" },
      { id: "explore-api", title: "Explore the API", titleUk: "Перегляньте API", description: "Browse the OpenAPI spec and try live endpoints.", descriptionUk: "Перегляньте специфікацію та протестуйте.", completionEvent: "api.explored", cta: "Open API docs", ctaUk: "Відкрити документацію" },
      { id: "bulk-export", title: "Run a bulk export", titleUk: "Виконайте масовий експорт", description: "Download the full historical dataset for backtesting.", descriptionUk: "Завантажте повний архів для аналізу.", completionEvent: "export.created", cta: "Bulk export", ctaUk: "Масовий експорт" },
      { id: "sla", title: "Review your SLA", titleUk: "Ознайомтесь з SLA", description: "Confirm uptime guarantees and support escalation paths.", descriptionUk: "Перевірте гарантії доступності та підтримку.", completionEvent: "sla.reviewed", cta: "View SLA", ctaUk: "Переглянути SLA" },
    ],
    copilotPrompt: "Ask me to generate a structured intelligence brief for the last 48 hours.",
    copilotPromptUk: "Попросіть мене підготувати структурований розвідувальний звіт за 48 годин.",
    savedSearches: [
      { name: "All high-confidence", nameUk: "Всі підтверджені події", query: "*", filters: { minConfidence: 0.8 } },
    ],
  },

  researcher: {
    id: "researcher",
    name: "Researcher / Academic",
    nameUk: "Дослідник / Академік",
    description: "Historical archive access, dataset releases, reproducible analysis.",
    defaultTier: "pro",
    primaryQuestion: "Can I get the full historical dataset for my research?",
    primaryQuestionUk: "Чи можна отримати повний архів даних для дослідження?",
    defaultMapView: [32.0, 49.0, 5],
    defaultActiveLayers: ["military_action", "infrastructure", "civilian_alerts"],
    defaultAlertFilters: {},
    onboardingSteps: [
      { id: "dataset", title: "Download a dataset", titleUk: "Завантажте датасет", description: "Access the full historical event archive in GeoJSON or CSV.", descriptionUk: "Повний архів подій у GeoJSON або CSV.", completionEvent: "export.created", cta: "Download dataset", ctaUk: "Завантажити" },
      { id: "methodology", title: "Read the methodology", titleUk: "Прочитайте методологію", description: "Understand how events are verified, classified, and scored.", descriptionUk: "Як події верифікуються та класифікуються.", completionEvent: "methodology.read", cta: "Read methodology", ctaUk: "Методологія" },
      { id: "notebook", title: "Open a notebook", titleUk: "Відкрийте ноутбук", description: "Run reproducible analysis directly on live data.", descriptionUk: "Відтворюваний аналіз на живих даних.", completionEvent: "notebook.created", cta: "New notebook", ctaUk: "Новий ноутбук" },
      { id: "cite", title: "Get citation info", titleUk: "Інформація для цитування", description: "Copy the BibTeX citation for this platform in your paper.", descriptionUk: "Скопіюйте BibTeX для статті.", completionEvent: "citation.copied", cta: "Get citation", ctaUk: "Отримати" },
      { id: "api-key", title: "Create an API key", titleUk: "Створіть API-ключ", description: "Query data programmatically in Python or R.", descriptionUk: "Запитуйте дані з Python або R.", completionEvent: "api_key.created", cta: "Create API key", ctaUk: "Створити ключ" },
    ],
    copilotPrompt: "Ask me to summarize long-term trends in a specific conflict zone.",
    copilotPromptUk: "Попросіть мене узагальнити довгострокові тенденції у конкретній зоні конфлікту.",
    savedSearches: [
      { name: "All time", nameUk: "За весь час", query: "*", filters: {} },
    ],
  },

  trader: {
    id: "trader",
    name: "Trader / Finance",
    nameUk: "Трейдер / Фінанси",
    description: "Geopolitical alpha, commodity impact alerts, escalation index.",
    defaultTier: "pro",
    primaryQuestion: "How is this affecting commodities and which direction is escalation heading?",
    primaryQuestionUk: "Як це впливає на сировинні ринки і куди рухається ескалація?",
    defaultMapView: [32.0, 49.0, 6],
    defaultActiveLayers: ["military_action", "infrastructure", "power_outages"],
    defaultAlertFilters: { class: ["military_action", "infrastructure_damage"], severity: [4, 5] },
    onboardingSteps: [
      { id: "alert-grain", title: "Set a commodity alert", titleUk: "Встановіть сповіщення", description: "Get notified of events near key grain, energy, or port infrastructure.", descriptionUk: "Сповіщення про події біля ключової інфраструктури.", completionEvent: "alert.created", cta: "Set alert", ctaUk: "Налаштувати" },
      { id: "explore-escalation", title: "Check the escalation index", titleUk: "Перевірте індекс ескалації", description: "See the AI-computed conflict-escalation index per region.", descriptionUk: "AI-індекс ескалації конфлікту по регіонах.", completionEvent: "layer.ai_predictions_opened", cta: "Open index", ctaUk: "Відкрити" },
      { id: "webhook", title: "Connect your trading system", titleUk: "Підключіть торгову систему", description: "Push high-severity events to your risk system in real time.", descriptionUk: "Передавайте події до ризик-системи.", completionEvent: "webhook.created", cta: "Set up webhook", ctaUk: "Налаштувати" },
      { id: "export", title: "Export for analysis", titleUk: "Експортуйте для аналізу", description: "Download event data for quantitative backtesting.", descriptionUk: "Завантажте дані для кількісного аналізу.", completionEvent: "export.created", cta: "Export data", ctaUk: "Експорт" },
      { id: "daily-digest", title: "Subscribe to daily digest", titleUk: "Підпишіться на щоденний дайджест", description: "Morning briefing covering geopolitical risk for your portfolio.", descriptionUk: "Ранковий огляд геополітичних ризиків.", completionEvent: "digest.subscribed", cta: "Subscribe", ctaUk: "Підписатися" },
    ],
    copilotPrompt: "Ask me how recent events might affect energy or agricultural commodity markets.",
    copilotPromptUk: "Запитайте мене, як останні події можуть вплинути на ринки сировини.",
    savedSearches: [
      { name: "Energy infrastructure", nameUk: "Енергетична інфраструктура", query: "energy infrastructure", filters: { class: ["infrastructure_damage"] } },
    ],
  },

  humanitarian: {
    id: "humanitarian",
    name: "Humanitarian (UN/ICRC)",
    nameUk: "Гуманітарна організація (ООН/МКЧХ)",
    description: "Crisis monitoring, coordination, IHL compliance tracking.",
    defaultTier: "pro",
    primaryQuestion: "Where are civilians at imminent risk and can we coordinate a response?",
    primaryQuestionUk: "Де цивільні в безпосередній небезпеці і як скоординувати відповідь?",
    defaultMapView: [32.0, 48.5, 6],
    defaultActiveLayers: ["civilian_alerts", "power_outages", "infrastructure", "travel_risk"],
    defaultAlertFilters: { class: ["civilian_alert", "displacement", "infrastructure_damage"], severity: [3, 4, 5] },
    onboardingSteps: [
      { id: "ihl-filter", title: "Filter for IHL-relevant events", titleUk: "Фільтр подій МГП", description: "Focus on events with potential IHL implications.", descriptionUk: "Зосередьтесь на подіях з наслідками для МГП.", completionEvent: "filter.ihl_applied", cta: "Apply IHL filter", ctaUk: "Застосувати фільтр" },
      { id: "route-check", title: "Check aid corridor safety", titleUk: "Перевірте безпеку коридору", description: "Verify the safety of planned aid delivery routes.", descriptionUk: "Перевірте безпеку запланованих маршрутів.", completionEvent: "travel_risk.checked", cta: "Check route", ctaUk: "Перевірити маршрут" },
      { id: "case", title: "Open an incident case", titleUk: "Відкрийте справу про інцидент", description: "Document a civilian harm incident for advocacy and reporting.", descriptionUk: "Задокументуйте інцидент для адвокації.", completionEvent: "case.created", cta: "Open case", ctaUk: "Відкрити справу" },
      { id: "report", title: "Generate a humanitarian report", titleUk: "Сформуйте гуманітарний звіт", description: "Export a situation report for coordination partners.", descriptionUk: "Ситуаційний звіт для партнерів по координації.", completionEvent: "report.created", cta: "Generate report", ctaUk: "Сформувати звіт" },
      { id: "team", title: "Invite field coordinators", titleUk: "Запросіть координаторів", description: "Share the operational picture with field teams.", descriptionUk: "Поділіться оперативним зображенням з польовими командами.", completionEvent: "member.invited", cta: "Invite team", ctaUk: "Запросити" },
    ],
    copilotPrompt: "Ask me about the humanitarian situation and civilian displacement in a specific region.",
    copilotPromptUk: "Запитайте мене про гуманітарну ситуацію та переміщення цивільних у конкретному регіоні.",
    savedSearches: [
      { name: "Civilian displacement", nameUk: "Переміщення цивільних", query: "displacement", filters: { class: ["displacement", "civilian_alert"] } },
      { name: "Healthcare infrastructure", nameUk: "Медична інфраструктура", query: "hospital healthcare", filters: { class: ["infrastructure_damage"] } },
    ],
  },
};

export function getPersona(id: PersonaId): Persona | undefined {
  return PERSONAS[id];
}

export function listPersonas(): Persona[] {
  return Object.values(PERSONAS);
}
