/**
 * Add-ons & Data Modules — canonical registry.
 *
 * All 23 add-ons: 12 data feed add-ons + 11 capability add-ons.
 * Each add-on is a Stripe Product with one or more Prices.
 * Attach / detach independently from the base subscription.
 *
 * Реєстр усіх надбудов: 12 дата-фідів + 11 можливостей.
 */

import type { AddOn, AddOnId } from "./types";

// ── Canonical add-on registry ─────────────────────────────────────────────────

export const ADDONS: AddOn[] = [
  // ── Data add-ons ──────────────────────────────────────────────────────────

  {
    id: "commercial-satellite",
    name_en: "Commercial Satellite Imagery",
    name_uk: "Комерційні супутникові знімки",
    description_en:
      "Access Planet, Maxar, and Capella SAR imagery. Task specific AOIs or purchase per-scene credits. Sub-meter optical and SAR for damage assessment, change detection, and target monitoring.",
    description_uk:
      "Доступ до знімків Planet, Maxar і Capella SAR. Замовлення знімків для конкретних AOI або покупка кредитів на сцену. Субметрова оптика і SAR для оцінки збитків та моніторингу.",
    costDriver: "Vendor passthrough (Planet/Maxar/Capella) + markup",
    pricingModel: "credits",
    creditsPerUnit: 10,
    minTierId: "pro-plus",
    category: "data",
  },

  {
    id: "sentinel-hub-paid",
    name_en: "Sentinel Hub Paid Feed",
    name_uk: "Sentinel Hub — платний фід",
    description_en:
      "Full Sentinel Hub API access: Sentinel-1 SAR, Sentinel-2 optical, Landsat, and custom scripts. Higher rate limits, priority processing, and batch exports.",
    description_uk:
      "Повний доступ до Sentinel Hub API: SAR Sentinel-1, оптика Sentinel-2, Landsat, кастомні скрипти. Вищі ліміти запитів та пакетний експорт.",
    costDriver: "Sentinel Hub API subscription passthrough",
    pricingModel: "flat-monthly",
    priceUsd: 149,
    minTierId: "pro",
    category: "data",
  },

  {
    id: "adsb-pro",
    name_en: "ADS-B Pro (Full Historical + Military Mode-S)",
    name_uk: "ADS-B Pro (Повна історія + Військовий Mode-S)",
    description_en:
      "Complete ADS-B feed with full historical playback, military Mode-S transponder data, and mil-air-traffic dashboards. ICAO 24-bit address filtering and NOTAM correlation included.",
    description_uk:
      "Повний фід ADS-B з відтворенням всієї історії, даними військового транспондера Mode-S та дашбордами військової авіації. Фільтрація за ICAO 24-бітовою адресою та кореляція NOTAM.",
    costDriver: "ADS-B vendor license + aircraft database",
    pricingModel: "flat-monthly",
    priceUsd: 199,
    minTierId: "pro",
    category: "data",
  },

  {
    id: "ais-pro",
    name_en: "AIS Pro (Terrestrial + Satellite, Full Ship Detail)",
    name_uk: "AIS Pro (Наземний + Супутниковий, Повні дані суден)",
    description_en:
      "Terrestrial and satellite AIS coverage globally. Full vessel details, dark-vessel gap analysis, cargo manifest links, GPS-spoofing detection, and port-disruption alerts.",
    description_uk:
      "Наземне і супутникове покриття AIS по всьому світу. Повні дані суден, аналіз пропусків «темних суден», GPS-спуфінг детекція та сповіщення про збої в портах.",
    costDriver: "AIS vendor (terrestrial + satellite) passthrough",
    pricingModel: "flat-monthly",
    priceUsd: 249,
    minTierId: "pro",
    category: "data",
  },

  {
    id: "thermal-hi-res",
    name_en: "Thermal Hi-Res (VIIRS Hourly + Commercial Thermal)",
    name_uk: "Теплові знімки Hi-Res (VIIRS погодинно + комерційна термографія)",
    description_en:
      "VIIRS hourly fire/heat anomaly detection with commercial thermal overlay. Track active fire fronts, industrial thermal signatures, power plant output, and refinery activity.",
    description_uk:
      "Погодинна детекція пожеж і теплових аномалій VIIRS з комерційним тепловим оверлеєм. Моніторинг фронтів пожеж, промислових теплових сигнатур і активності НПЗ.",
    costDriver: "Commercial thermal vendor + VIIRS processing infra",
    pricingModel: "flat-monthly",
    priceUsd: 179,
    minTierId: "pro-plus",
    category: "data",
  },

  {
    id: "social-firehose",
    name_en: "Social Firehose (X / Telegram / Reddit / VK Full)",
    name_uk: "Соціальний файрхос (X / Telegram / Reddit / VK повний)",
    description_en:
      "Full-volume social media firehose across X, Telegram public channels, Reddit, and VK. Real-time ingestion, geo-tagging, narrative clustering, and sentiment analysis.",
    description_uk:
      "Повний обʼємний потік соцмереж: X, публічні канали Telegram, Reddit і VK. Реальний час, геотегування, кластеризація наративів та аналіз тональності.",
    costDriver: "API volume costs (X Academic/Enterprise, custom crawlers) + infra",
    pricingModel: "subscription",
    priceUsd: 399,
    minTierId: "pro-plus",
    category: "social",
  },

  {
    id: "dark-channels",
    name_en: "Dark / Encrypted Channels (Curated, Ethics-Reviewed)",
    name_uk: "Темні / Зашифровані канали (Curated, перевірені етично)",
    description_en:
      "Curated intelligence from dark web forums, encrypted channels, and restricted-access communities. All sources ethics-reviewed and legally cleared. Bespoke delivery via secure endpoint.",
    description_uk:
      "Підібрана розвідка з форумів darknet, зашифрованих каналів і закритих спільнот. Усі джерела перевірені етично та юридично. Доставка через захищений ендпоінт.",
    costDriver: "Curation team cost + secure infra",
    pricingModel: "subscription",
    priceUsd: 899,
    minTierId: "business",
    category: "social",
  },

  {
    id: "telegram-osint-bots",
    name_en: "Underground / Telegram OSINT Bots Feed",
    name_uk: "Підпільні / Telegram OSINT боти — фід",
    description_en:
      "Curated feed from Telegram OSINT monitoring bots covering conflict zones, military channels, and grey-zone information spaces. Structured, deduplicated, and timestamped.",
    description_uk:
      "Підібраний фід від Telegram OSINT ботів: зони конфліктів, військові канали, сіра зона інформпростору. Структурований, дедублікований і з мітками часу.",
    costDriver: "Curation cost + Telegram API quota",
    pricingModel: "flat-monthly",
    priceUsd: 129,
    minTierId: "pro-plus",
    category: "social",
  },

  {
    id: "maritime-cargo",
    name_en: "Maritime Cargo Manifests",
    name_uk: "Морські вантажні маніфести",
    description_en:
      "Access to global cargo manifest data: vessel-cargo-port linkages, Bill of Lading records, shipper/consignee chains, and sanctions cross-referencing. Powered by commercial data vendors.",
    description_uk:
      "Доступ до глобальних вантажних маніфестів: звʼязки судно-вантаж-порт, коносаменти, ланцюги відправник/отримувач, крос-перевірка санкцій.",
    costDriver: "Cargo manifest vendor passthrough",
    pricingModel: "flat-monthly",
    priceUsd: 349,
    minTierId: "business",
    category: "data",
  },

  {
    id: "power-grid-telemetry",
    name_en: "Power Grid Telemetry Partners",
    name_uk: "Телеметрія електромереж (партнерські дані)",
    description_en:
      "Real-time and near-real-time power grid status data from partner utilities and open-source grid sensors. Outage maps, load shedding indicators, substation status, and generation forecasts.",
    description_uk:
      "Дані про стан електромереж в режимі реального часу від партнерів та відкритих датчиків. Карти відключень, індикатори обмеження навантаження, стан підстанцій і прогнози генерації.",
    costDriver: "Partner data licensing + infra",
    pricingModel: "flat-monthly",
    priceUsd: 299,
    minTierId: "business",
    category: "data",
  },

  {
    id: "weather-pro",
    name_en: "Weather Pro (Numerical Models, Hi-Res)",
    name_uk: "Погода Pro (Чисельні моделі, висока роздільність)",
    description_en:
      "High-resolution numerical weather prediction (NWP) models: ECMWF-derived forecasts, wind/precip overlays, severe-weather alerts, and seasonal climate signals for operational planning.",
    description_uk:
      "Чисельні моделі прогнозу погоди високої роздільності: похідні прогнози ECMWF, вітер/опади, попередження про небезпечні явища та кліматичні сигнали для операційного планування.",
    costDriver: "Commercial NWP vendor + processing",
    pricingModel: "flat-monthly",
    priceUsd: 119,
    minTierId: "pro-plus",
    category: "data",
  },

  {
    id: "historical-archive",
    name_en: "Historical Archive Bulk Access (Full Back-Catalog)",
    name_uk: "Архівний доступ в пакеті (Повний каталог)",
    description_en:
      "Unlimited access to the full historical back-catalog: all event feeds, satellite mosaic tiles, and social snapshots. Includes bulk export and S3 push. Ideal for retrospective analysis and model training.",
    description_uk:
      "Необмежений доступ до повного архіву: всі події, супутникові мозаїки та соціальні знімки. Пакетний експорт і S3 push. Ідеально для ретроспективного аналізу та навчання моделей.",
    costDriver: "Storage + egress costs",
    pricingModel: "flat-monthly",
    priceUsd: 199,
    minTierId: "pro-plus",
    category: "data",
  },

  // ── Capability add-ons ────────────────────────────────────────────────────

  {
    id: "custom-aoi-tasking",
    name_en: "Custom AOI Monitoring (Satellite Tasking)",
    name_uk: "Моніторинг AOI на замовлення (Супутникове тезування)",
    description_en:
      "Set persistent monitoring AOIs that auto-task commercial satellites on schedule. Receive new imagery when clouds clear or at defined cadence. Per-AOI-month + per-scene billing.",
    description_uk:
      "Постійні AOI для автоматичного тезування комерційних супутників за розкладом. Нові знімки надходять при розʼясненні хмар або з потрібною частотою. Оплата за AOI/місяць + за сцену.",
    costDriver: "Satellite tasking vendor + scheduling infra",
    pricingModel: "per-usage",
    minTierId: "pro-plus",
    category: "capability",
  },

  {
    id: "kg-graph-pro",
    name_en: "KG-Graph Pro (Full Entity Graph Traversal + Export)",
    name_uk: "KG-Graph Pro (Повний обхід графу сутностей + Експорт)",
    description_en:
      "Full knowledge-graph traversal: multi-hop entity relationships, graph export to Neo4j/GraphML, timeline animations, and custom edge types. Enables deep network analysis.",
    description_uk:
      "Повний обхід графу знань: багатоскачкові звʼязки між сутностями, експорт у Neo4j/GraphML, анімація таймлайну та кастомні типи звʼязків. Глибокий мережевий аналіз.",
    costDriver: "Graph DB compute + storage",
    pricingModel: "flat-monthly",
    priceUsd: 89,
    minTierId: "pro-plus",
    category: "ai",
  },

  {
    id: "ai-copilot-pro",
    name_en: "AI Copilot Pro (Larger Context, Agentic Tools)",
    name_uk: "AI Copilot Pro (Великий контекст, агентні інструменти)",
    description_en:
      "Unlock agentic Copilot mode: multi-step task execution, large-context window analysis, autonomous alert drafting, and access to premium AI tools (web search, code execution, structured extraction).",
    description_uk:
      "Агентний режим Copilot: багатокрокове виконання завдань, великий контекстний вікно, автономне складання сповіщень та доступ до преміум інструментів AI.",
    costDriver: "LLM inference costs (larger model / more tokens)",
    pricingModel: "flat-monthly",
    priceUsd: 69,
    minTierId: "pro",
    category: "ai",
  },

  {
    id: "ai-rule-builder-pro",
    name_en: "AI Rule Builder Pro (Regex + Agentic + Ensemble Alerts)",
    name_uk: "AI Rule Builder Pro (Regex + Агентні + Ансамблеві сповіщення)",
    description_en:
      "Advanced alert rule engine: regex + semantic + ML ensemble rules, multi-source correlation, agentic verification steps, and scheduled digest reports. Build complex OSINT workflows with no code.",
    description_uk:
      "Просунутий рушій правил сповіщень: regex + семантичні + ML ансамблеві правила, кореляція з кількох джерел, агентна верифікація та дайджести за розкладом.",
    costDriver: "Inference + rule evaluation compute",
    pricingModel: "flat-monthly",
    priceUsd: 79,
    minTierId: "pro-plus",
    category: "ai",
  },

  {
    id: "verification-queue-priority",
    name_en: "Verification Queue Priority",
    name_uk: "Пріоритет черги верифікації",
    description_en:
      "Jump the human-in-the-loop verification queue. Submitted claims are reviewed within 2 hours by the Aegis Lens verification team. Includes per-item status tracking and confidence scoring.",
    description_uk:
      "Пріоритет у черзі верифікації з участю людини. Подані матеріали перевіряються командою Aegis Lens протягом 2 годин. Відстеження статусу та оцінка достовірності.",
    costDriver: "Verification analyst team cost",
    pricingModel: "per-usage",
    minTierId: "pro-plus",
    category: "capability",
  },

  {
    id: "travel-risk-module",
    name_en: "Travel Risk Module (Per-Trip / Per-Employee Briefs)",
    name_uk: "Модуль туристичних ризиків (Брифи на поїздку / на співробітника)",
    description_en:
      "Automated travel risk briefs: pre-trip country/city assessment, itinerary-aware alerts, real-time incident push, and post-incident reports. Per-employee-seat pricing.",
    description_uk:
      "Автоматичні брифи туристичних ризиків: оцінка країни/міста перед виїздом, сповіщення за маршрутом, push-сповіщення в реальному часі та звіти після інцидентів. Ціна за місце.",
    costDriver: "Per-seat data processing + brief generation",
    pricingModel: "per-usage",
    minTierId: "team",
    category: "capability",
  },

  {
    id: "embeds-pro",
    name_en: "Embeds Pro (White-Label Widgets, No Watermark)",
    name_uk: "Embeds Pro (Віджети White-Label без водяного знака)",
    description_en:
      "Embed Aegis Lens map views, event feeds, and dashboards into external sites with full white-labelling: custom domain, CSS theming, no watermark, and usage analytics.",
    description_uk:
      "Вбудовування карт, фідів подій і дашбордів на зовнішні сайти з повним white-label: власний домен, CSS-тематика, без водяного знака та аналітика використання.",
    costDriver: "CDN + iframe bandwidth + support",
    pricingModel: "flat-monthly",
    priceUsd: 299,
    minTierId: "business",
    category: "embed",
  },

  {
    id: "bots-pro",
    name_en: "Bots Pro (Private Telegram / Slack / Discord, Branded)",
    name_uk: "Bots Pro (Приватні Telegram / Slack / Discord, Брендовані)",
    description_en:
      "Deploy private branded alert bots on Telegram, Slack, or Discord for your organisation. Custom bot name/avatar, role-based access, rich media cards, and analytics dashboard.",
    description_uk:
      "Розгортання приватних брендованих ботів сповіщень у Telegram, Slack або Discord для організації. Власна назва/аватар, рольовий доступ, медіа-картки та аналітика.",
    costDriver: "Bot infra + dedicated instance",
    pricingModel: "flat-monthly",
    priceUsd: 149,
    minTierId: "team",
    category: "embed",
  },

  {
    id: "notebooks-pro",
    name_en: "Notebooks Pro (Jupyter-Style Env with SDK Pre-installed)",
    name_uk: "Notebooks Pro (Jupyter-середовище з передвстановленим SDK)",
    description_en:
      "Managed Jupyter-compatible notebook environment with Aegis Lens SDK pre-installed. Full API access, Python/JS kernels, persistent storage, and scheduled notebook runs.",
    description_uk:
      "Кероване Jupyter-сумісне середовище ноутбуків із передвстановленим SDK Aegis Lens. Повний API доступ, Python/JS ядра, постійне сховище і заплановані запуски.",
    costDriver: "Notebook VM compute + storage",
    pricingModel: "flat-monthly",
    priceUsd: 99,
    minTierId: "pro-plus",
    category: "capability",
  },

  {
    id: "browser-extension-pro",
    name_en: "Browser Extension Pro (Bulk Page Extraction, Claim Verification)",
    name_uk: "Розширення браузера Pro (Масове вилучення, Верифікація тверджень)",
    description_en:
      "Chrome/Firefox extension that extracts entities, images, and claims from any webpage and sends to Aegis Lens for verification and enrichment. Bulk processing of URLs and PDF documents.",
    description_uk:
      "Розширення Chrome/Firefox для вилучення сутностей, зображень і тверджень з будь-якої сторінки та надсилання до Aegis Lens для верифікації. Пакетна обробка URL і PDF.",
    costDriver: "Extraction infra + verification pipeline",
    pricingModel: "flat-monthly",
    priceUsd: 39,
    minTierId: "pro",
    category: "capability",
  },

  {
    id: "workspace-presets-marketplace",
    name_en: "Workspace Presets Marketplace",
    name_uk: "Маркетплейс пресетів робочого простору",
    description_en:
      "Browse, install, and share curated dashboard presets from the community and Aegis Lens analysts. Pre-configured layer stacks, alert rules, and report templates for specific use cases.",
    description_uk:
      "Перегляд, встановлення та обмін пресетами дашбордів від спільноти та аналітиків Aegis Lens. Попередньо налаштовані стеки шарів, правила сповіщень і шаблони звітів.",
    costDriver: "Marketplace infra + curation",
    pricingModel: "flat-monthly",
    priceUsd: 29,
    minTierId: "pro",
    category: "capability",
  },
];

// ── Bundle discount thresholds ─────────────────────────────────────────────────

/**
 * Discount applied when a user attaches multiple add-ons simultaneously.
 * Applied at checkout via Stripe coupon / discount object.
 *
 * Знижка при одночасному підключенні кількох надбудов.
 */
export const BUNDLE_THRESHOLDS: { count: number; discountPct: number }[] = [
  { count: 3, discountPct: 0.15 },
  { count: 5, discountPct: 0.25 },
];

// ── Tier ordering for eligibility checks ─────────────────────────────────────

/**
 * Ordered list of tier IDs from lowest to highest.
 * Used internally to check if a given tier meets the minimum requirement.
 * Matches TIER_ORDER from pricing/tier-config.ts (mission tiers treated as 'pro' equivalent).
 */
const TIER_ORDER: string[] = [
  "free",
  "observer",
  "pro",
  "pro-plus",
  "team",
  "business",
  "enterprise",
  "gov-defense",
  // Mission tiers treated as pro-equivalent for add-on eligibility
  "ngo-journalist",
  "academic",
];

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Look up an add-on by its ID.
 *
 * Пошук надбудови за ідентифікатором.
 */
export function getAddOnById(id: AddOnId): AddOn | undefined {
  return ADDONS.find((a) => a.id === id);
}

/**
 * Filter add-ons by category.
 *
 * Фільтрація надбудов за категорією.
 */
export function getAddOnsByCategory(category: AddOn["category"]): AddOn[] {
  return ADDONS.filter((a) => a.category === category);
}

/**
 * Returns all add-ons available at the given tier or above.
 * Mission tiers (ngo-journalist, academic) are treated as 'pro' equivalents.
 *
 * Повертає всі надбудови, доступні на вказаному рівні або вище.
 */
export function getAddOnsForTier(tierId: string): AddOn[] {
  // Mission tiers map to 'pro' for add-on eligibility
  const effectiveTier =
    tierId === "ngo-journalist" || tierId === "academic" ? "pro" : tierId;

  const tierIndex = TIER_ORDER.indexOf(effectiveTier);
  if (tierIndex === -1) return [];

  return ADDONS.filter((addon) => {
    const minIndex = TIER_ORDER.indexOf(addon.minTierId);
    // If minTierId is unknown, exclude the add-on
    if (minIndex === -1) return false;
    return tierIndex >= minIndex;
  });
}

/**
 * Returns the applicable bundle discount fraction for a given number of add-ons.
 * Returns 0 if no threshold is met.
 *
 * Повертає відсоток знижки на bundle для вказаної кількості надбудов.
 */
export function getBundleDiscount(addOnCount: number): number {
  // Sort descending so we get the highest applicable discount
  const sorted = [...BUNDLE_THRESHOLDS].sort((a, b) => b.count - a.count);
  const match = sorted.find((t) => addOnCount >= t.count);
  return match ? match.discountPct : 0;
}
