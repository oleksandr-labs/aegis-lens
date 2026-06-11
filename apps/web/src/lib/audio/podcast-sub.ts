/**
 * Audio / Podcast Subscriptions — canonical product registry.
 * Paid private podcast feeds and audio briefings for analysts who consume on-the-go.
 * Aligns with the daily-brief subscription tier but delivered as audio.
 *
 * Реєстр продуктів аудіо/подкастів — платні приватні RSS-фіди та аудіо-брифінги
 * для аналітиків, які споживають контент у дорозі.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Category of audio content produced.
 * Категорія виробленого аудіоконтенту.
 */
export type AudioContentType =
  | "daily-brief-audio"
  | "weekly-analysis-podcast"
  | "analyst-interview"
  | "event-narration"
  | "multilingual-summary";

/**
 * Subscription tier that gates access to the audio product.
 * Рівень підписки, що визначає доступ до аудіопродукту.
 */
export type AudioSubscriptionTier =
  | "free-preview"
  | "subscriber"
  | "premium"
  | "enterprise-feed";

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * Describes a single audio subscription product.
 * Описує один продукт аудіопідписки.
 */
export interface AudioProduct {
  /** Unique slug identifier. / Унікальний ідентифікатор. */
  id: string;
  /** Audio content category. / Категорія аудіоконтенту. */
  type: AudioContentType;
  /** Product name in English. / Назва продукту англійською. */
  name_en: string;
  /** Product name in Ukrainian. / Назва продукту українською. */
  name_uk: string;
  /** Access tier required. / Необхідний рівень доступу. */
  tier: AudioSubscriptionTier;
  /** Publication frequency in English. / Частота публікацій англійською. */
  frequency_en: string;
  /** Publication frequency in Ukrainian. / Частота публікацій українською. */
  frequency_uk: string;
  /**
   * Monthly price in USD. Use 0 for free products.
   * Місячна ціна в доларах США. 0 для безплатних продуктів.
   */
  priceUsd: number;
  /** Typical episode duration in English. / Тривалість епізоду англійською. */
  duration_en: string;
  /** Typical episode duration in Ukrainian. / Тривалість епізоду українською. */
  duration_uk: string;
  /** Additional notes in English. / Додаткові нотатки англійською. */
  notes_en: string;
  /** Additional notes in Ukrainian. / Додаткові нотатки українською. */
  notes_uk: string;
}

// ── Catalog ───────────────────────────────────────────────────────────────────

/**
 * Canonical registry of all audio subscription products.
 * Каталог усіх продуктів аудіопідписки.
 */
export const AUDIO_PRODUCTS: AudioProduct[] = [
  {
    id: "daily-brief-audio",
    type: "daily-brief-audio",
    name_en: "Daily Intelligence Brief — Audio Edition",
    name_uk: "Щоденний розвідувальний брифінг — Аудіо",
    tier: "subscriber",
    frequency_en:
      "Daily (Mon–Fri). Free-preview subscribers receive 3 episodes per week; full subscribers receive every weekday edition.",
    frequency_uk:
      "Щодня (пн–пт). Передплатники безплатного перегляду отримують 3 епізоди на тиждень; повні передплатники — кожен буднній випуск.",
    priceUsd: 9,
    duration_en: "Approximately 5 minutes per episode.",
    duration_uk: "Приблизно 5 хвилин на епізод.",
    notes_en:
      "AI-narrated (TTS) with analyst-edited script. Delivered via private RSS feed compatible with Apple Podcasts, Spotify, Pocket Casts, and Overcast. " +
      "Each episode includes a transcript PDF in the show notes for accessibility. " +
      "Free-preview tier receives Monday, Wednesday, and Friday editions at no cost.",
    notes_uk:
      "AI-озвучення (TTS) з редагованим аналітиком скриптом. Доставляється через приватний RSS-фід, сумісний із Apple Podcasts, Spotify, Pocket Casts і Overcast. " +
      "Кожен епізод включає PDF-транскрипт у нотатках для доступності. " +
      "Безплатний рівень перегляду отримує випуски понеділка, середи та п'ятниці безкоштовно.",
  },

  {
    id: "weekly-analysis-podcast",
    type: "weekly-analysis-podcast",
    name_en: "Weekly Deep-Dive Analysis Podcast",
    name_uk: "Щотижневий подкаст поглибленого аналізу",
    tier: "subscriber",
    frequency_en: "Weekly, released every Friday.",
    frequency_uk: "Щотижня, виходить кожної п'ятниці.",
    priceUsd: 19,
    duration_en: "Approximately 30 minutes per episode.",
    duration_uk: "Приблизно 30 хвилин на епізод.",
    notes_en:
      "Human-narrated by a senior Aegis Lens analyst. Covers one major conflict-intelligence theme per week: " +
      "logistics patterns, infrastructure damage assessment, disinformation campaign tracking, or geopolitical analysis. " +
      "Includes chapter markers for easy navigation and a linked evidence dossier in show notes.",
    notes_uk:
      "Озвучує старший аналітик Aegis Lens. Охоплює одну велику тему конфліктної розвідки на тиждень: " +
      "логістичні патерни, оцінку збитків інфраструктури, відстеження дезінформаційних кампаній або геополітичний аналіз. " +
      "Включає маркери глав для зручної навігації та пов'язане досьє доказів у нотатках.",
  },

  {
    id: "analyst-interview",
    type: "analyst-interview",
    name_en: "Analyst Interview Series",
    name_uk: "Серія інтерв'ю з аналітиками",
    tier: "premium",
    frequency_en: "Bi-weekly (every other Wednesday).",
    frequency_uk: "Раз на два тижні (кожна друга середа).",
    priceUsd: 29,
    duration_en: "40–60 minutes per interview.",
    duration_uk: "40–60 хвилин на інтерв'ю.",
    notes_en:
      "Exclusive long-form interviews with OSINT analysts, investigative journalists, and subject-matter experts. " +
      "Topics include OSINT methodology, satellite imagery interpretation, sanctions tracking, and field reporting. " +
      "Human-produced audio with professional editing. Premium tier required; not available on lower tiers.",
    notes_uk:
      "Ексклюзивні розширені інтерв'ю з OSINT-аналітиками, журналістами-розслідувачами та профільними експертами. " +
      "Теми: методологія OSINT, інтерпретація супутникових знімків, відстеження санкцій і польові репортажі. " +
      "Аудіо, вироблене людьми, з професійним монтажем. Потрібен рівень premium; недоступно на нижчих рівнях.",
  },

  {
    id: "enterprise-feed",
    type: "daily-brief-audio",
    name_en: "Enterprise Private Audio Feed",
    name_uk: "Корпоративний приватний аудіо-фід",
    tier: "enterprise-feed",
    frequency_en: "Daily, including weekends for breaking-situation coverage.",
    frequency_uk: "Щодня, включаючи вихідні для покриття термінових ситуацій.",
    priceUsd: 299,
    duration_en: "5–15 minutes per brief, depending on situation activity level.",
    duration_uk: "5–15 хвилин на брифінг залежно від рівня активності ситуації.",
    notes_en:
      "Private token-authenticated RSS feed with a custom brief tailored to the organisation's regions of interest and topic focus. " +
      "AI-narrated (TTS) core brief plus optional human-narrated executive summary add-on. " +
      "Feed URL is unique per organisation; sharing or redistribution terminates the subscription. " +
      "Includes white-label show metadata (custom podcast name, logo, description). " +
      "Delivered at 06:00 UTC with ad-hoc breaking updates pushed within 30 minutes of a significant event.",
    notes_uk:
      "Приватний RSS-фід з автентифікацією за токеном і брифінгом, адаптованим під регіони та теми організації. " +
      "Основний брифінг з AI-озвученням (TTS) плюс опційний виконавчий резюме з озвученням людиною. " +
      "URL фіду унікальний для кожної організації; розповсюдження або перерозподіл припиняє підписку. " +
      "Включає white-label метадані подкасту (назва, логотип, опис). " +
      "Доставляється о 06:00 UTC із позаплановими оновленнями при значних подіях протягом 30 хвилин.",
  },
];

// ── Notes & Policies ──────────────────────────────────────────────────────────

/**
 * TTS and narration approach note — English.
 * AI (TTS) narration is used for the daily brief; human narration for weekly analysis and all interviews.
 */
export const AUDIO_TTS_NOTE_EN =
  "The Daily Intelligence Brief — Audio Edition uses AI text-to-speech (TTS) narration with analyst-reviewed and edited scripts. " +
  "The Weekly Deep-Dive Analysis Podcast and Analyst Interview Series use human narration by senior Aegis Lens staff. " +
  "All AI-narrated episodes are clearly labelled as 'AI-narrated' in the episode title and show notes.";

/**
 * TTS and narration approach note — Ukrainian.
 * AI (TTS) озвучення для щоденного брифінгу; людське — для тижневого аналізу та інтерв'ю.
 */
export const AUDIO_TTS_NOTE_UK =
  "Щоденний розвідувальний брифінг — Аудіо використовує AI text-to-speech (TTS) озвучення зі скриптами, переглянутими та відредагованими аналітиком. " +
  "Щотижневий подкаст поглибленого аналізу та серія інтерв'ю з аналітиками використовують озвучення людиною — старшими співробітниками Aegis Lens. " +
  "Усі епізоди з AI-озвученням чітко позначені «AI-narrated» у назві та нотатках.";

/**
 * Audio licensing policy — English.
 * Audio content is licensed to subscribers only; no redistribution without written agreement.
 */
export const AUDIO_LICENSE_NOTE_EN =
  "All audio content produced by Aegis Lens is licensed exclusively to individual subscribers or the subscribing organisation. " +
  "Redistribution, re-broadcast, re-uploading, or public sharing of any episode is strictly prohibited without a separate written redistribution agreement. " +
  "Media organisations may request a press/broadcast licence at licensing@aegislens.com.";

/**
 * Audio licensing policy — Ukrainian.
 * Аудіоконтент ліцензується лише передплатникам; перерозподіл без угоди заборонено.
 */
export const AUDIO_LICENSE_NOTE_UK =
  "Увесь аудіоконтент, вироблений Aegis Lens, ліцензується виключно індивідуальним передплатникам або організації-передплатнику. " +
  "Перерозподіл, ретрансляція, повторне завантаження або публічне розповсюдження будь-якого епізоду суворо заборонені без окремої письмової угоди про перерозподіл. " +
  "Медіаорганізації можуть запросити пресову/мовну ліцензію на licensing@aegislens.com.";

/**
 * Enterprise RSS feed privacy policy — English.
 * Feed is private, token-authenticated, and must not be shared publicly.
 */
export const AUDIO_RSS_NOTE_EN =
  "The Enterprise Private Audio Feed is delivered via a unique, private RSS URL containing a per-organisation authentication token. " +
  "This URL must not be shared publicly, posted on websites, or forwarded to non-subscribers. " +
  "Each access of the feed URL is logged; anomalous sharing patterns will trigger automatic feed rotation and may result in subscription termination. " +
  "Tokens can be rotated on demand from the organisation's admin dashboard.";

/**
 * Enterprise RSS feed privacy policy — Ukrainian.
 * Корпоративний RSS-фід є приватним із автентифікацією за токеном; публічне розповсюдження заборонено.
 */
export const AUDIO_RSS_NOTE_UK =
  "Корпоративний приватний аудіо-фід доставляється через унікальний приватний RSS-URL з токеном автентифікації для кожної організації. " +
  "Цю URL-адресу не можна публічно ділитися, публікувати на вебсайтах або пересилати не-передплатникам. " +
  "Кожен доступ до URL фіду логується; аномальні патерни розповсюдження спричинять автоматичну ротацію фіду і можуть призвести до припинення підписки. " +
  "Токени можна змінювати на вимогу з адміністративної панелі організації.";

/**
 * Multilingual narration roadmap note — English.
 * English and Ukrainian narration are live; German and Polish are planned for Phase 3.
 */
export const AUDIO_MULTILINGUAL_NOTE_EN =
  "Audio products are currently narrated in English and Ukrainian. " +
  "German and Polish narration are planned for Phase 3 (estimated Q3 2026). " +
  "Multilingual TTS is powered by the Aegis Lens NLP pipeline; human narration languages are expanded as editorial team capacity grows. " +
  "Enterprise subscribers may request a priority language addition via their account manager.";

/**
 * Multilingual narration roadmap note — Ukrainian.
 * Англійське та українське озвучення доступні; німецьке та польське заплановані на Фазу 3.
 */
export const AUDIO_MULTILINGUAL_NOTE_UK =
  "Аудіопродукти наразі озвучуються англійською та українською мовами. " +
  "Озвучення німецькою та польською заплановано на Фазу 3 (орієнтовно Q3 2026). " +
  "Багатомовний TTS забезпечується NLP-конвеєром Aegis Lens; мови озвучення людиною розширюються зі зростанням потужності редакційної команди. " +
  "Корпоративні передплатники можуть запросити пріоритетне додавання мови через менеджера облікового запису.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Builds a placeholder private RSS feed URL for an enterprise subscriber organisation.
 * In production, replace the path template with a signed token generated by the auth service.
 *
 * Генерує URL-заглушку приватного RSS-фіду для корпоративної організації-передплатника.
 * У продакшені замінити шаблон шляху підписаним токеном від сервісу автентифікації.
 *
 * @param orgId  - The organisation's unique ID (e.g. "org_acme_corp")
 * @returns      Private RSS feed URL string (placeholder)
 */
export function buildAudioRssFeedUrl(orgId: string): string {
  return `https://audio.aegislens.com/v1/feeds/${encodeURIComponent(orgId)}/enterprise.rss`;
}
