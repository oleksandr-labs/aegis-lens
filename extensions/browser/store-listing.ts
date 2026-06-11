/**
 * Browser Extension — Chrome Web Store listing metadata.
 *
 * Contains English and Ukrainian listing copy, screenshot count, and policy
 * notes. Used by the publish script to populate the Chrome Web Store Developer
 * Dashboard programmatically via the Chrome Web Store Publish API.
 *
 * Метадані лістингу в Chrome Web Store: EN і UK копія, кількість скріншотів,
 * нотатки. Використовуються скриптом публікації через Chrome Web Store Publish API.
 */

// ── Store listing types ───────────────────────────────────────────────────────

export interface StoreListing {
  /** Extension title (max 45 chars in Chrome Web Store) */
  title: string;
  /**
   * Short description shown in search results (max 132 chars).
   *
   * Короткий опис у результатах пошуку (макс. 132 символи).
   */
  shortDescription: string;
  /**
   * Full description (max 16 000 chars; Markdown not rendered by CWS but
   * formatted plain text is supported).
   *
   * Повний опис (макс. 16 000 символів).
   */
  fullDescription: string;
  /** Comma-separated keyword list for CWS internal search boost */
  keywords: string[];
  /** Chrome Web Store category slug */
  category: string;
}

// ── English listing ───────────────────────────────────────────────────────────

/**
 * English Chrome Web Store listing.
 *
 * Лістинг Chrome Web Store — англійська мова.
 */
export const STORE_LISTING_EN: StoreListing = {
  title: "Aegis Lens — OSINT Companion",
  shortDescription:
    "One-click capture of images, URLs & text directly into the Aegis Lens platform. For journalists and analysts.",
  fullDescription: `Aegis Lens is the open-source OSINT intelligence platform for investigative journalists, researchers, and security analysts.

The Aegis Lens browser extension brings the platform directly into your daily browsing workflow:

FEATURES
• Right-click any image → instant reverse-image search in the Aegis Lens index
• Right-click any URL → archive and ingest as a candidate intelligence event
• Highlight text → translate, summarise, and create a structured event draft
• Auto-detect GPS coordinates on any page and open them on the Aegis Lens map
• In-page reputation badge for known tracked sources

SECURITY & PRIVACY
• No content is uploaded without an explicit user action (click or keyboard shortcut)
• Cross-origin authentication via OAuth 2.0 PKCE — credentials never stored in extension storage unencrypted
• Manifest v3, minimal permission footprint: activeTab, contextMenus, storage, identity

REQUIREMENTS
• Free Aegis Lens account — sign up at https://aegislens.com
• Observer tier or above for full OSINT capture features

KEYBOARD SHORTCUTS
• Ctrl+Shift+L (Cmd+Shift+L on Mac) — capture selected text as event draft
• Ctrl+Shift+M (Cmd+Shift+M on Mac) — open page location on map

Press tier users get additional features including verified credential indicators and newsroom-optimised workflows.`,
  keywords: [
    "OSINT",
    "open source intelligence",
    "investigative journalism",
    "fact checking",
    "geolocation",
    "reverse image search",
    "intelligence analysis",
    "Ukraine",
    "conflict monitoring",
    "news verification",
  ],
  category: "productivity",
};

// ── Ukrainian listing ─────────────────────────────────────────────────────────

/**
 * Ukrainian Chrome Web Store listing.
 *
 * Лістинг Chrome Web Store — українська мова.
 */
export const STORE_LISTING_UK: StoreListing = {
  title: "Aegis Lens — OSINT-помічник",
  shortDescription:
    "Одним кліком зберігайте зображення, URL і текст у платформу Aegis Lens. Для журналістів і аналітиків.",
  fullDescription: `Aegis Lens — відкрита OSINT-платформа для журналістів-розслідувачів, дослідників і аналітиків безпеки.

Розширення Aegis Lens для браузера інтегрує платформу у ваш щоденний робочий процес:

ФУНКЦІЇ
• Правий клік на зображенні → миттєвий зворотній пошук у індексі Aegis Lens
• Правий клік на URL → архівування та додавання як потенційної події розвідки
• Виділення тексту → переклад, резюме та створення структурованого чернетки події
• Автоматичне виявлення GPS-координат на будь-якій сторінці та відкриття на карті
• Значок репутації на сторінці для відомих відстежуваних джерел

БЕЗПЕКА ТА КОНФІДЕНЦІЙНІСТЬ
• Жоден вміст не надсилається без явної дії користувача (клік або скорочення клавіатури)
• Автентифікація через OAuth 2.0 PKCE — облікові дані не зберігаються у незашифрованому вигляді
• Manifest v3, мінімальні дозволи: activeTab, contextMenus, storage, identity

ВИМОГИ
• Безкоштовний акаунт Aegis Lens — реєстрація на https://aegislens.com
• Тариф Observer або вище для повного доступу до функцій OSINT-захоплення

ГАРЯЧІ КЛАВІШІ
• Ctrl+Shift+L (Cmd+Shift+L на Mac) — захопити виділений текст як чернетку події
• Ctrl+Shift+M (Cmd+Shift+M на Mac) — відкрити локацію сторінки на карті

Користувачі тарифу Press отримують додаткові функції: індикатори верифікованих облікових даних та оптимізований робочий процес для редакцій.`,
  keywords: [
    "OSINT",
    "розвідка з відкритих джерел",
    "журналістика розслідувань",
    "перевірка фактів",
    "геолокація",
    "зворотній пошук зображень",
    "аналіз розвідки",
    "Україна",
    "моніторинг конфліктів",
    "верифікація новин",
  ],
  category: "productivity",
};

// ── Screenshot count ──────────────────────────────────────────────────────────

/**
 * Number of screenshots to upload to the Chrome Web Store listing.
 * CWS requires 1–5 screenshots (1280×800 or 640×400 px).
 *
 * Кількість скріншотів для лістингу (1–5 шт., 1280×800 або 640×400 px).
 */
export const STORE_SCREENSHOTS_COUNT = 5 as const;

// ── Notes ─────────────────────────────────────────────────────────────────────

/**
 * Publishing note — English.
 * Listing copy must be updated in the CWS Developer Dashboard for each locale
 * separately. Screenshots are locale-independent unless CWS locale override is used.
 */
export const STORE_NOTE_EN =
  "Chrome Web Store listing: update EN + UK copy separately in the Developer Dashboard. " +
  "Screenshots (5) are shared across locales unless locale-specific overrides are uploaded." as const;

/**
 * Publishing note — Ukrainian.
 * Текст лістингу для кожної локалі оновлюється окремо в Developer Dashboard.
 * Скріншоти (5 шт.) спільні для всіх локалей, якщо не задані локально-специфічні.
 */
export const STORE_NOTE_UK =
  "Лістинг Chrome Web Store: текст EN та UK оновлюється окремо в Developer Dashboard. " +
  "Скріншоти (5 шт.) спільні для всіх локалей, якщо не завантажено локальні версії." as const;
