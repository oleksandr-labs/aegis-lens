/**
 * Bot directory — SEO-surfaced pages for each platform integration.
 * Each entry maps to a /bots/<platform> page with schema.org SoftwareApplication markup.
 *
 * Директорія ботів — SEO-сторінки для кожної платформної інтеграції.
 * Кожен запис відповідає сторінці /bots/<platform> з розміткою schema.org SoftwareApplication.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BotPlatform = "telegram" | "slack" | "discord";

export interface BotDirectoryEntry {
  platform: BotPlatform;
  botName: string;
  botHandle: string;
  description: string;
  descriptionUk: string;
  features: string[];
  featuresUk: string[];
  installUrl: string;
  seoSlug: string;
  monthlyActiveUsers?: number;
}

// ---------------------------------------------------------------------------
// Directory
// ---------------------------------------------------------------------------

export const BOT_DIRECTORY: BotDirectoryEntry[] = [
  {
    platform:      "telegram",
    botName:       "AegisLens Bot",
    botHandle:     "@AegisLensBot",
    description:
      "Get verified conflict-intelligence alerts, event searches, and AI copilot answers directly in Telegram. Free to use; pro features require account linking.",
    descriptionUk:
      "Отримуйте верифіковані сповіщення про конфліктні події, пошук подій та відповіді AI-копілота безпосередньо в Telegram. Базові функції безкоштовні; pro-функції потребують прив'язки акаунту.",
    features: [
      "Event search (/search)",
      "AI copilot (/ask)",
      "Region briefs (/region)",
      "Alert subscriptions (/subscribe)",
      "Private pro-tier commands via /link",
    ],
    featuresUk: [
      "Пошук подій (/search)",
      "AI-копілот (/ask)",
      "Зведення по регіону (/region)",
      "Підписки на сповіщення (/subscribe)",
      "Приватні pro-команди через /link",
    ],
    installUrl:        "https://t.me/AegisLensBot",
    seoSlug:           "telegram",
    monthlyActiveUsers: 4_200,
  },
  {
    platform:      "slack",
    botName:       "AegisLens for Slack",
    botHandle:     "AegisLens",
    description:
      "Bring Ukraine conflict intelligence into your Slack workspace. Slash commands, scheduled daily briefs, and per-channel alert routing for newsrooms and NGOs.",
    descriptionUk:
      "Привнесіть розвідку конфлікту в Україні до вашого Slack-простору. Slash-команди, щоденні зведення за розкладом і маршрутизація сповіщень по каналах для редакцій та НГО.",
    features: [
      "/aegis-search — event search",
      "/aegis-ask — AI copilot",
      "/aegis-region — region brief",
      "/aegis-subscribe — channel alerts",
      "Scheduled daily intelligence briefs",
    ],
    featuresUk: [
      "/aegis-search — пошук подій",
      "/aegis-ask — AI-копілот",
      "/aegis-region — зведення по регіону",
      "/aegis-subscribe — сповіщення каналу",
      "Щоденні розвідувальні зведення за розкладом",
    ],
    installUrl: "https://slack.com/oauth/v2/authorize?client_id=AEGISLENS_SLACK_CLIENT_ID",
    seoSlug:    "slack",
    monthlyActiveUsers: 1_800,
  },
  {
    platform:      "discord",
    botName:       "AegisLens Discord Bot",
    botHandle:     "AegisLens#0001",
    description:
      "Open-source intelligence for Discord communities. Slash commands for event lookup, region summaries, and AI answers — plus bounty leaderboards for OSINT contributors.",
    descriptionUk:
      "Розвідка відкритих джерел для Discord-спільнот. Slash-команди для пошуку подій, зведень по регіонах та AI-відповідей — і таблиці лідерів бонусів для контриб'юторів OSINT.",
    features: [
      "/search — event search",
      "/ask — AI copilot",
      "/region — region brief",
      "/subscribe — channel alerts",
      "Bounty leaderboard integration",
    ],
    featuresUk: [
      "/search — пошук подій",
      "/ask — AI-копілот",
      "/region — зведення по регіону",
      "/subscribe — сповіщення каналу",
      "Інтеграція таблиці лідерів бонусів",
    ],
    installUrl: "https://discord.com/api/oauth2/authorize?client_id=AEGISLENS_DISCORD_CLIENT_ID&scope=bot+applications.commands",
    seoSlug:    "discord",
    monthlyActiveUsers: 2_900,
  },
];

// ---------------------------------------------------------------------------
// Schema builder
// ---------------------------------------------------------------------------

/**
 * Returns a schema.org SoftwareApplication JSON-LD object for a bot directory entry.
 * Повертає об'єкт JSON-LD schema.org SoftwareApplication для запису директорії ботів.
 */
export function buildBotPageSchema(bot: BotDirectoryEntry): Record<string, unknown> {
  return {
    "@context":          "https://schema.org",
    "@type":             "SoftwareApplication",
    "name":              bot.botName,
    "applicationCategory": "CommunicationApplication",
    "operatingSystem":   bot.platform.charAt(0).toUpperCase() + bot.platform.slice(1),
    "description":       bot.description,
    "url":               bot.installUrl,
    "offers": {
      "@type":    "Offer",
      "price":    "0",
      "priceCurrency": "USD",
    },
    "featureList": bot.features.join(", "),
  };
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const BOT_DIRECTORY_NOTES_EN: string[] = [
  "SEO-surface-/bots/<platform>: each BotDirectoryEntry.seoSlug maps to a static page at /bots/<slug> (e.g. /bots/telegram); pages are pre-rendered at build time with generateStaticParams over BOT_DIRECTORY.",
  "schema-SoftwareApplication: each /bots/<platform> page injects the JSON-LD from buildBotPageSchema() in a <script type='application/ld+json'> tag to maximise rich-result eligibility for 'telegram bot conflict intelligence' queries.",
];

export const BOT_DIRECTORY_NOTES_UK: string[] = [
  "SEO-surface-/bots/<platform>: кожен BotDirectoryEntry.seoSlug відповідає статичній сторінці /bots/<slug> (напр. /bots/telegram); сторінки пре-рендеряться під час збірки через generateStaticParams по BOT_DIRECTORY.",
  "schema-SoftwareApplication: кожна сторінка /bots/<platform> вставляє JSON-LD з buildBotPageSchema() у тег <script type='application/ld+json'> для максимальної відповідності вимогам розширених результатів за запитами 'telegram bot conflict intelligence'.",
];
