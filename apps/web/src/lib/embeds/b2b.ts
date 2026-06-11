/**
 * Embeds-as-a-Product (B2B) — canonical registry of embeddable widgets for publishers.
 * Sells iframe/JS embed SKUs to media, publishers, blogs, and educators as a distinct product line.
 *
 * Реєстр вбудовуваних віджетів (B2B) — окрема лінійка SKU для медіа, видавців та освітян.
 * Iframe/JS-embed рішення для зовнішніх сайтів під власним контекстом, але на нашій платформі.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * The category of embeddable product.
 * Категорія вбудовуваного продукту.
 */
export type EmbedProductType =
  | "live-map-widget"
  | "alert-ticker"
  | "data-chart"
  | "risk-score-badge"
  | "event-feed"
  | "custom-branded-embed";

/**
 * Distribution channel where the embed is placed.
 * Канал розповсюдження, де розміщується віджет.
 */
export type EmbedDistributionChannel =
  | "website"
  | "app"
  | "digital-signage"
  | "newsroom-cms"
  | "government-portal";

/**
 * Pricing model used to bill for the embed product.
 * Модель ціноутворення для оплати вбудованого продукту.
 */
export type EmbedPricingModel =
  | "per-impression"
  | "monthly-flat"
  | "enterprise-unlimited"
  | "revenue-share";

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * Describes a single embeddable product SKU.
 * Описує один SKU вбудованого продукту.
 */
export interface EmbedProduct {
  /** Unique slug identifier. / Унікальний ідентифікатор. */
  id: string;
  /** Embed product category. / Категорія вбудованого продукту. */
  type: EmbedProductType;
  /** Product name in English. / Назва продукту англійською. */
  name_en: string;
  /** Product name in Ukrainian. / Назва продукту українською. */
  name_uk: string;
  /** Supported distribution channels. / Підтримувані канали розповсюдження. */
  channels: EmbedDistributionChannel[];
  /** Pricing model. / Модель ціноутворення. */
  pricingModel: EmbedPricingModel;
  /** Price range description in English. / Опис діапазону цін англійською. */
  priceRange_en: string;
  /** Price range description in Ukrainian. / Опис діапазону цін українською. */
  priceRange_uk: string;
  /** Key features in English. / Ключові можливості англійською. */
  features_en: string[];
  /** Key features in Ukrainian. / Ключові можливості українською. */
  features_uk: string[];
  /** Usage restrictions in English. / Обмеження використання англійською. */
  restrictions_en: string;
  /** Usage restrictions in Ukrainian. / Обмеження використання українською. */
  restrictions_uk: string;
  /** Additional notes in English. / Додаткові нотатки англійською. */
  notes_en: string;
  /** Additional notes in Ukrainian. / Додаткові нотатки українською. */
  notes_uk: string;
}

// ── Catalog ───────────────────────────────────────────────────────────────────

/**
 * Canonical registry of all embeddable B2B products.
 * Каталог усіх вбудовуваних B2B-продуктів.
 */
export const EMBED_PRODUCTS: EmbedProduct[] = [
  {
    id: "live-map-widget",
    type: "live-map-widget",
    name_en: "Live Conflict Map Widget",
    name_uk: "Живий віджет карти конфлікту",
    channels: ["website", "newsroom-cms", "government-portal"],
    pricingModel: "monthly-flat",
    priceRange_en: "$199–$999 / month depending on impression volume and region scope.",
    priceRange_uk: "$199–$999 / місяць залежно від кількості переглядів та охопленого регіону.",
    features_en: [
      "iframe and JS embed options",
      "Live event markers updated every 60 seconds",
      "Region-restricted scope (configurable AOI)",
      "Responsive, dark/light theme support",
      "WCAG 2.1 AA compliant",
      "Source attribution watermark included",
    ],
    features_uk: [
      "Вбудовування через iframe та JS",
      "Живі маркери подій, що оновлюються кожні 60 секунд",
      "Обмеження регіону (налаштовувана AOI)",
      "Адаптивний дизайн, теми dark/light",
      "Відповідність WCAG 2.1 AA",
      "Водяний знак із посиланням на джерело",
    ],
    restrictions_en:
      "Embed domain must be whitelisted in publisher dashboard. May not be used on paywalled pages without attribution.",
    restrictions_uk:
      "Домен вбудовування має бути внесено у білий список у дашборді видавця. Не допускається використання на платних сторінках без атрибуції.",
    notes_en:
      "Best for newsrooms and media sites seeking to give readers a live operational picture. Drives consistent brand-impression traffic back to Aegis Lens.",
    notes_uk:
      "Підходить для редакцій і медіасайтів, які бажають надати читачам живу оперативну картину. Генерує постійний трафік brand-impression на Aegis Lens.",
  },

  {
    id: "alert-ticker",
    type: "alert-ticker",
    name_en: "Real-Time Alert Ticker",
    name_uk: "Стрічка сповіщень у реальному часі",
    channels: ["website", "newsroom-cms", "digital-signage"],
    pricingModel: "monthly-flat",
    priceRange_en: "$99 / month flat, or per-impression billing from $0.0005 / impression.",
    priceRange_uk: "$99 / місяць фіксовано або оплата за покази від $0,0005 за показ.",
    features_en: [
      "Horizontally scrolling breaking-news ticker",
      "Configurable by topic, region, or keyword filter",
      "Custom colour, font-size, and speed settings",
      "Feeds from verified Aegis Lens event stream",
      "Screen-reader-friendly ARIA markup",
    ],
    features_uk: [
      "Горизонтальна прокрутка термінових новин",
      "Налаштування за темою, регіоном або ключовим словом",
      "Кастомні кольори, розмір шрифту та швидкість",
      "Дані з верифікованого потоку подій Aegis Lens",
      "ARIA-розмітка для екранних зчитувачів",
    ],
    restrictions_en:
      "Attribution link to Aegis Lens must remain intact. Not available for embedding in apps with >25 % sanctioned-entity ownership.",
    restrictions_uk:
      "Посилання-атрибуція на Aegis Lens має залишатися. Заборонено для додатків, де >25 % власності пов'язано з санкційними суб'єктами.",
    notes_en:
      "Popular for digital-signage screens in command centres and newsrooms. Low-cost entry point for publishers testing embeds.",
    notes_uk:
      "Популярно для екранів цифрових вивісок у командних центрах і редакціях. Доступна точка входу для видавців, що тестують вбудовування.",
  },

  {
    id: "data-chart",
    type: "data-chart",
    name_en: "Embeddable Data Visualization Chart",
    name_uk: "Вбудована діаграма візуалізації даних",
    channels: ["website", "newsroom-cms", "app"],
    pricingModel: "monthly-flat",
    priceRange_en: "$49–$299 / month depending on chart type complexity and refresh frequency.",
    priceRange_uk: "$49–$299 / місяць залежно від типу діаграми та частоти оновлення.",
    features_en: [
      "Interactive chart types: bar, line, heatmap, timeline",
      "Configurable data series and date range",
      "SVG-based, scales on any screen",
      "Exportable via PNG/CSV link in embed footer",
      "Up to 5-minute data refresh cadence",
    ],
    features_uk: [
      "Інтерактивні типи: стовпчикові, лінійні, теплові карти, таймлайни",
      "Налаштовувані серії даних та діапазон дат",
      "SVG-основа, масштабування на будь-якому екрані",
      "Експорт PNG/CSV через посилання у нижньому колонтитулі",
      "Оновлення даних кожні 5 хвилин",
    ],
    restrictions_en:
      "Data may not be re-published or resold without a data-distribution licence. Attribution must remain visible in chart footer.",
    restrictions_uk:
      "Дані не можна повторно публікувати або перепродавати без ліцензії на розповсюдження. Атрибуція має бути видима в підписі діаграми.",
    notes_en:
      "Suitable for media data desks and research organisations wanting cited, up-to-date charts without building their own data pipeline.",
    notes_uk:
      "Підходить для дата-редакцій і дослідницьких організацій, яким потрібні актуальні цитовані діаграми без власного конвеєра даних.",
  },

  {
    id: "risk-score-badge",
    type: "risk-score-badge",
    name_en: "Dynamic Risk Score Badge (AOI)",
    name_uk: "Динамічний значок оцінки ризику (AOI)",
    channels: ["website", "app"],
    pricingModel: "per-impression",
    priceRange_en: "Per-impression billing at $0.001 / render. Minimum $25 / month.",
    priceRange_uk: "Оплата за показ: $0,001 за рендер. Мінімум $25 / місяць.",
    features_en: [
      "Compact badge showing current risk level (1–10 scale)",
      "Colour-coded: green / amber / red / critical",
      "Links to full AOI risk report on click",
      "Refreshes on page load; optional polling interval",
      "JSON endpoint also available for headless use",
    ],
    features_uk: [
      "Компактний значок із поточним рівнем ризику (шкала 1–10)",
      "Колірне кодування: зелений / жовтий / червоний / критичний",
      "Перехід до повного звіту ризику AOI при кліці",
      "Оновлення при завантаженні сторінки; опційний інтервал опитування",
      "Також доступний JSON-ендпоінт для headless-використання",
    ],
    restrictions_en:
      "Permitted for insurance, fintech, and risk-advisory contexts only. Must not imply Aegis Lens endorses any specific financial product.",
    restrictions_uk:
      "Дозволено лише для страхових, фінтех та ризик-консультаційних контекстів. Не може означати, що Aegis Lens схвалює певний фінансовий продукт.",
    notes_en:
      "High-margin per-impression product popular with insurance underwriters and fintech risk dashboards embedding AOI scores.",
    notes_uk:
      "Продукт з високою маржою за показ; популярний у страховиків і фінтех-дашбордів із оцінками ризику AOI.",
  },

  {
    id: "event-feed",
    type: "event-feed",
    name_en: "Verified Event Feed (JSON / RSS)",
    name_uk: "Верифікований фід подій (JSON / RSS)",
    channels: ["app", "newsroom-cms", "government-portal"],
    pricingModel: "monthly-flat",
    priceRange_en: "$499 / month for verified structured event feed. Volume tiers available.",
    priceRange_uk: "$499 / місяць за верифікований структурований фід подій. Доступні обсягові тарифи.",
    features_en: [
      "Machine-readable JSON feed with full event schema",
      "RSS 2.0 compatible for aggregators",
      "Filter by region, event type, confidence threshold",
      "Deduplicated, timestamped, source-attributed",
      "Webhook push available as upgrade option",
    ],
    features_uk: [
      "Machine-readable JSON фід із повною схемою подій",
      "Сумісність із RSS 2.0 для агрегаторів",
      "Фільтрація за регіоном, типом події та порогом достовірності",
      "Дедублікований, з мітками часу та атрибуцією джерела",
      "Вебхук-push доступний як опція оновлення",
    ],
    restrictions_en:
      "Feed data may not be redistributed or resold to third parties. Permitted for internal apps and own-platform consumption only.",
    restrictions_uk:
      "Дані фіду не можна поширювати або перепродавати третім особам. Дозволено лише для внутрішніх додатків і власних платформ.",
    notes_en:
      "Primary integration point for news apps, government portals, and enterprise platforms that need structured event data in their own systems.",
    notes_uk:
      "Основна точка інтеграції для новинних додатків, державних порталів і корпоративних платформ, яким потрібні структуровані дані подій у власних системах.",
  },

  {
    id: "custom-branded-embed",
    type: "custom-branded-embed",
    name_en: "Custom Branded Embed (White-Label JS SDK)",
    name_uk: "Кастомне вбудовування з брендуванням (White-Label JS SDK)",
    channels: ["website", "app", "newsroom-cms", "government-portal"],
    pricingModel: "enterprise-unlimited",
    priceRange_en:
      "Enterprise contract pricing. Typically $2,500–$10,000 / month. Negotiated per deal.",
    priceRange_uk:
      "Корпоративне договірне ціноутворення. Зазвичай $2 500–$10 000 / місяць. Обговорюється індивідуально.",
    features_en: [
      "Full white-label: custom domain, logo, colour palette",
      "JS SDK with direct API access for custom UI builds",
      "No Aegis Lens watermark or visible attribution (custom footer text)",
      "Dedicated CDN endpoint and SLA",
      "CSS theming API, multiple embed instances per licence",
      "Access to raw data callbacks and event webhooks",
    ],
    features_uk: [
      "Повний white-label: власний домен, логотип, палітра кольорів",
      "JS SDK із прямим API для кастомних UI",
      "Без водяного знака Aegis Lens (власний текст підвалу)",
      "Виділений CDN-ендпоінт та SLA",
      "CSS theming API, кілька примірників у межах однієї ліцензії",
      "Доступ до raw-data callbacks та вебхуків подій",
    ],
    restrictions_en:
      "Source crediting in terms of service required. Retraction notices may not be suppressed. Prohibited for propaganda or coordinated-inauthentic-behaviour use.",
    restrictions_uk:
      "Вимагається посилання на джерело в умовах використання. Заборонено приховувати повідомлення про спростування. Заборонено для пропаганди та скоординованої неавтентичної поведінки.",
    notes_en:
      "Flagship B2B embed product for large publishers, national broadcasters, and government portals requiring full brand integration.",
    notes_uk:
      "Флагманський B2B-embed для великих видавців, національних мовників і державних порталів, яким потрібна повна інтеграція бренду.",
  },
];

// ── Editorial & Compliance Notes ─────────────────────────────────────────────

/**
 * Editorial firewall rule — English.
 * Source attribution must remain visible in all embeds at all times.
 * Retraction notices and confidence-score corrections may never be removed or hidden by the publisher.
 */
export const EMBED_EDITORIAL_FIREWALL_EN =
  "Source attribution to Aegis Lens must remain visible in all embed instances at all times. " +
  "Retraction notices, confidence-score corrections, and editorial updates issued by Aegis Lens " +
  "may not be removed, hidden, or delayed by the embedding publisher. " +
  "Violation terminates the embed licence immediately without refund.";

/**
 * Editorial firewall rule — Ukrainian.
 * Атрибуція джерела має залишатися видимою у всіх вбудовуваннях.
 * Повідомлення про спростування та виправлення не можна прибирати.
 */
export const EMBED_EDITORIAL_FIREWALL_UK =
  "Атрибуція джерела Aegis Lens має залишатися видимою у всіх примірниках вбудовування. " +
  "Повідомлення про спростування, виправлення оцінок достовірності та редакційні оновлення, " +
  "видані Aegis Lens, не можуть бути видалені, приховані або затримані видавцем-вбудовувачем. " +
  "Порушення негайно припиняє дію ліцензії без відшкодування.";

/**
 * Prohibited embedding contexts — English.
 * Lists contexts where embed products must not be deployed.
 */
export const EMBED_PROHIBITED_CONTEXTS_EN =
  "Embeds are strictly prohibited on: (1) disinformation or propaganda websites; " +
  "(2) sites operated by or for sanctioned entities or individuals; " +
  "(3) market-manipulation contexts (coordinated price/share pumping, short-and-distort campaigns); " +
  "(4) adult content platforms; " +
  "(5) sites with coordinated inauthentic behaviour (CIB) designations from major platforms. " +
  "Publisher must certify compliance at sign-up and on each annual renewal.";

/**
 * Prohibited embedding contexts — Ukrainian.
 * Контексти, де вбудовування заборонено.
 */
export const EMBED_PROHIBITED_CONTEXTS_UK =
  "Вбудовування суворо заборонено на: (1) дезінформаційних або пропагандистських вебсайтах; " +
  "(2) сайтах, що управляються або обслуговують санкціонованих суб'єктів чи осіб; " +
  "(3) у контекстах маніпуляцій ринком (координоване накачування цін, short-and-distort кампанії); " +
  "(4) на платформах для дорослих; " +
  "(5) на сайтах, позначених як такі, що ведуть скоординовану неавтентичну поведінку (CIB) великими платформами. " +
  "Видавець повинен підтвердити відповідність при реєстрації та під час щорічного поновлення.";

/**
 * Technical implementation notes for embed integrators — English.
 */
export const EMBED_TECHNICAL_NOTES_EN =
  "All Aegis Lens embeds are CSP-compatible: scripts served from a single trusted origin with integrity hashes. " +
  "Embeds lazy-load by default using Intersection Observer; no content is fetched until the widget enters the viewport. " +
  "The embed bundle contains zero third-party trackers, analytics pixels, or session-recording scripts. " +
  "Publishers may audit the bundle at embed.aegislens.com/bundle-manifest.json.";

/**
 * Technical implementation notes for embed integrators — Ukrainian.
 * Технічні нотатки для інтеграторів вбудовувань.
 */
export const EMBED_TECHNICAL_NOTES_UK =
  "Усі вбудовування Aegis Lens є CSP-сумісними: скрипти подаються з єдиного довіреного джерела з хешами цілісності. " +
  "Вбудовування за замовчуванням завантажуються ліниво через Intersection Observer: контент не завантажується до появи у viewport. " +
  "Пакет вбудовування не містить жодних сторонніх трекерів, піксельної аналітики або скриптів запису сесій. " +
  "Видавці можуть перевірити пакет на embed.aegislens.com/bundle-manifest.json.";

/**
 * Revenue-share option for newsroom partners — English.
 */
export const EMBED_REVENUE_SHARE_NOTE_EN =
  "Newsroom partners may opt into a revenue-share model in lieu of a flat monthly fee: " +
  "Aegis Lens receives 10 % of advertising revenue generated on pages that feature an active embed. " +
  "Revenue-share is verified via a monthly report submitted by the publisher's ad server. " +
  "Minimum guarantee of $50 / month applies. Available on the Live Map Widget and Alert Ticker products.";

/**
 * Revenue-share option for newsroom partners — Ukrainian.
 * Опція розподілу доходів для редакційних партнерів.
 */
export const EMBED_REVENUE_SHARE_NOTE_UK =
  "Редакційні партнери можуть обрати модель розподілу доходів замість фіксованої місячної плати: " +
  "Aegis Lens отримує 10 % від рекламних доходів, зароблених на сторінках з активним вбудовуванням. " +
  "Розподіл доходів перевіряється через щомісячний звіт від рекламного сервера видавця. " +
  "Застосовується мінімальна гарантія $50 / місяць. Доступно для продуктів Live Map Widget та Alert Ticker.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Builds an HTML snippet string for embedding a given product.
 * Generates a <script>-based loader embed with optional width/height overrides.
 *
 * Генерує HTML-фрагмент для вбудовування вказаного продукту.
 *
 * @param embedId  - The EmbedProduct id (e.g. "live-map-widget")
 * @param options  - Optional width and height CSS values (e.g. { width: "100%", height: "400px" })
 * @returns        HTML string ready to paste into a publisher's page
 */
export function buildEmbedSnippet(
  embedId: string,
  options: { width?: string; height?: string } = {}
): string {
  const width = options.width ?? "100%";
  const height = options.height ?? "500px";
  const origin = "https://embed.aegislens.com";

  return [
    `<!-- Aegis Lens Embed: ${embedId} -->`,
    `<div`,
    `  data-aegis-embed="${embedId}"`,
    `  style="width:${width};height:${height};overflow:hidden;"`,
    `>`,
    `  <script`,
    `    src="${origin}/v1/loader.js"`,
    `    data-embed-id="${embedId}"`,
    `    data-width="${width}"`,
    `    data-height="${height}"`,
    `    async`,
    `    defer`,
    `    crossorigin="anonymous"`,
    `  ></script>`,
    `  <noscript>`,
    `    <a href="https://aegislens.com" rel="noopener noreferrer">`,
    `      View live intelligence map on Aegis Lens`,
    `    </a>`,
    `  </noscript>`,
    `</div>`,
    `<!-- End Aegis Lens Embed -->`,
  ].join("\n");
}
