/**
 * Tools directory — types, configs, and schema helpers for the OSINT tools catalog.
 *
 * Defines the ten tool categories, the full ToolProfile shape, programmatic-SEO
 * note strings, and schema.org SoftwareApplication builder used across
 * /tools/<slug>, /tools/<category>, and comparison pages.
 *
 * Каталог інструментів — типи, конфіги та помічники схем для каталогу OSINT-інструментів.
 * Визначає десять категорій, форму ToolProfile, рядки приміток для програматичного SEO
 * та побудовник schema.org SoftwareApplication для сторінок /tools/<slug>, /tools/<category>
 * та сторінок порівняння.
 */

// ── Category types ────────────────────────────────────────────────────────────

/**
 * All supported tool categories in the directory.
 * Усі підтримувані категорії інструментів у каталозі.
 */
export type ToolCategory =
  | "osint"
  | "satellite-imagery"
  | "social-media-monitoring"
  | "geolocation"
  | "verification"
  | "threat-intelligence"
  | "monitoring-alerting"
  | "ai-analyst"
  | "data-visualization"
  | "communications-intercept";

// ── Pricing model ─────────────────────────────────────────────────────────────

/**
 * Pricing model options for a tool listing.
 * Моделі ціноутворення для лістингу інструменту.
 */
export type ToolPricingModel =
  | "free"
  | "freemium"
  | "paid"
  | "open-source"
  | "enterprise-only"
  | "request-demo";

// ── Tool profile ──────────────────────────────────────────────────────────────

/**
 * Full profile for a single tool in the directory.
 * Повний профіль окремого інструменту в каталозі.
 */
export interface ToolProfile {
  /** Unique tool identifier (kebab-case). */
  id: string;

  /** URL slug for the tool's profile page. */
  slug: string;

  /** Tool brand/product name (not translated — trademarks retained). */
  name: string;

  /** Short tagline — English. */
  tagline_en: string;

  /** Short tagline — Ukrainian. */
  tagline_uk: string;

  /** Full description — English. */
  description_en: string;

  /** Full description — Ukrainian. */
  description_uk: string;

  /** Primary category for this tool. */
  category: ToolCategory;

  /** Pricing model. */
  pricingModel: ToolPricingModel;

  /** Human-readable price range — English (e.g. "Free / $49 per month"). */
  priceRange_en: string;

  /** Human-readable price range — Ukrainian. */
  priceRange_uk: string;

  /** Key capabilities list — English. */
  capabilities_en: string[];

  /** Key capabilities list — Ukrainian. */
  capabilities_uk: string[];

  /** Known integration IDs or partner tool names. */
  integrations: string[];

  /** Competing / alternative tool slugs. */
  alternatives: string[];

  /** Pros list — English. */
  prosEn: string[];

  /** Pros list — Ukrainian. */
  prosUk: string[];

  /** Cons list — English. */
  consEn: string[];

  /** Cons list — Ukrainian. */
  consUk: string[];

  /** Screenshot URLs (public CDN). */
  screenshots: string[];

  /** Whether the listing has been editorially verified by Aegis Lens. */
  verified: boolean;

  /** Whether the vendor has claimed and verified the listing. */
  verifiedByVendor: boolean;

  /** Whether an affiliate/referral agreement is in place. */
  affiliateAvailable: boolean;

  /** Average user rating (1–5), or null if no reviews yet. */
  ratingAvg: number | null;

  /** Total number of published user reviews. */
  reviewCount: number;

  /** Additional editorial notes — English. */
  notes_en: string;

  /** Additional editorial notes — Ukrainian. */
  notes_uk: string;
}

// ── Category config ───────────────────────────────────────────────────────────

/**
 * Configuration entry for a single tool category.
 * Конфігураційний запис для однієї категорії інструментів.
 */
export interface ToolCategoryConfig {
  id: ToolCategory;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
}

/**
 * Configuration for all ten tool categories.
 * Конфігурація для всіх десяти категорій інструментів.
 */
export const TOOL_CATEGORIES_CONFIG: ToolCategoryConfig[] = [
  {
    id: "osint",
    name_en: "OSINT",
    name_uk: "OSINT",
    description_en: "Open-source intelligence tools for collecting and analysing publicly available data.",
    description_uk: "Інструменти відкритої розвідки для збору та аналізу загальнодоступних даних.",
  },
  {
    id: "satellite-imagery",
    name_en: "Satellite Imagery",
    name_uk: "Супутникові знімки",
    description_en: "Platforms providing access to commercial and open satellite imagery for geospatial analysis.",
    description_uk: "Платформи, що надають доступ до комерційних і відкритих супутникових знімків для геопросторового аналізу.",
  },
  {
    id: "social-media-monitoring",
    name_en: "Social Media Monitoring",
    name_uk: "Моніторинг соціальних мереж",
    description_en: "Tools that track, archive, and analyse activity across social networks and online communities.",
    description_uk: "Інструменти для відстеження, архівування та аналізу активності в соціальних мережах і онлайн-спільнотах.",
  },
  {
    id: "geolocation",
    name_en: "Geolocation",
    name_uk: "Геолокація",
    description_en: "Tools for pinpointing the physical location of events, images, or entities using open-source signals.",
    description_uk: "Інструменти для визначення фізичного місця подій, зображень або суб'єктів за допомогою відкритих сигналів.",
  },
  {
    id: "verification",
    name_en: "Verification",
    name_uk: "Верифікація",
    description_en: "Fact-checking, image authentication, and provenance tools for confirming the integrity of information.",
    description_uk: "Інструменти перевірки фактів, автентифікації зображень та підтвердження походження інформації.",
  },
  {
    id: "threat-intelligence",
    name_en: "Threat Intelligence",
    name_uk: "Розвідка загроз",
    description_en: "Platforms aggregating cyber, physical, and geopolitical threat data for proactive risk management.",
    description_uk: "Платформи, що агрегують кіберзагрози, фізичні та геополітичні загрози для проактивного управління ризиками.",
  },
  {
    id: "monitoring-alerting",
    name_en: "Monitoring & Alerting",
    name_uk: "Моніторинг та оповіщення",
    description_en: "Continuous monitoring services that surface breaking signals and dispatch real-time alerts.",
    description_uk: "Сервіси безперервного моніторингу, що виявляють нові сигнали та надсилають сповіщення в реальному часі.",
  },
  {
    id: "ai-analyst",
    name_en: "AI Analyst",
    name_uk: "AI-аналітик",
    description_en: "AI-powered tools that automate analysis, summarisation, and insight generation from intelligence data.",
    description_uk: "Інструменти на основі ШІ, що автоматизують аналіз, узагальнення та генерацію висновків з розвідувальних даних.",
  },
  {
    id: "data-visualization",
    name_en: "Data Visualization",
    name_uk: "Візуалізація даних",
    description_en: "Tools for creating maps, timelines, network graphs, and dashboards from structured intelligence data.",
    description_uk: "Інструменти для створення карт, хронологій, мережевих графів і дашбордів зі структурованих розвідувальних даних.",
  },
  {
    id: "communications-intercept",
    name_en: "Communications Intercept",
    name_uk: "Перехоплення комунікацій",
    description_en: "Lawful-intercept and signals-intelligence tools for authorised monitoring of communications channels.",
    description_uk: "Інструменти законного перехоплення та радіоелектронної розвідки для авторизованого моніторингу каналів зв'язку.",
  },
];

// ── Programmatic-SEO note strings ─────────────────────────────────────────────

/**
 * Comparison tool note — English.
 * Supports up to 4 tools side-by-side on /compare.
 */
export const TOOL_COMPARISON_NOTE_EN =
  "The tool comparison feature supports up to 4 tools displayed side-by-side, " +
  "enabling analysts to evaluate capabilities, pricing, integrations, and " +
  "pros/cons at a glance. Comparison pages are SEO-indexed and auto-generated " +
  "for all combinations of curated tools.";

/**
 * Comparison tool note — Ukrainian.
 * Підтримує порівняння до 4 інструментів поруч на /compare.
 */
export const TOOL_COMPARISON_NOTE_UK =
  "Функція порівняння інструментів підтримує до 4 інструментів, відображених " +
  "поруч, що дозволяє аналітикам оцінити можливості, ціноутворення, інтеграції " +
  "та переваги/недоліки з першого погляду. Сторінки порівняння індексуються для " +
  "SEO та автоматично генеруються для всіх комбінацій відібраних інструментів.";

/**
 * Alternatives auto-pages note — English.
 */
export const TOOL_ALTERNATIVES_NOTE_EN =
  "\"Alternatives to X\" pages are auto-generated for every tool in the catalog, " +
  "surfacing competitors ranked by category relevance and user rating. These " +
  "pages capture high-intent bottom-of-funnel search queries from users " +
  "actively evaluating tool switches.";

/**
 * Alternatives auto-pages note — Ukrainian.
 */
export const TOOL_ALTERNATIVES_NOTE_UK =
  "Сторінки «Альтернативи до X» автоматично генеруються для кожного інструменту " +
  "в каталозі, відображаючи конкурентів, ранжованих за релевантністю категорії та " +
  "рейтингом користувачів. Ці сторінки захоплюють пошукові запити з високими " +
  "намірами від користувачів, що активно оцінюють зміну інструменту.";

/**
 * Best-tools listicle note — English.
 */
export const TOOL_BEST_FOR_NOTE_EN =
  "\"Best tools for X\" curated listicle pages are hand-edited collections " +
  "targeting specific use cases (e.g. \"best OSINT tools for journalists\", " +
  "\"best satellite imagery tools for NGOs\"). Each listicle includes " +
  "editorial rationale, pricing context, and ranked recommendations.";

/**
 * Best-tools listicle note — Ukrainian.
 */
export const TOOL_BEST_FOR_NOTE_UK =
  "Сторінки-лістиклі «Найкращі інструменти для X» — це вручну відредаговані " +
  "колекції, орієнтовані на конкретні випадки використання (наприклад, " +
  "«найкращі OSINT-інструменти для журналістів», «найкращі інструменти " +
  "супутникових знімків для НУО»). Кожен лістикль включає редакційне " +
  "обґрунтування, контекст ціноутворення та ранжовані рекомендації.";

/**
 * Affiliate links disclosure note — English.
 */
export const TOOL_AFFILIATE_NOTE_EN =
  "Affiliate or referral links are used where a partner agreement exists with " +
  "the tool vendor. All affiliate relationships are clearly disclosed on the " +
  "relevant tool profile and comparison pages. Editorial rankings and ratings " +
  "are independent of affiliate status.";

/**
 * Affiliate links disclosure note — Ukrainian.
 */
export const TOOL_AFFILIATE_NOTE_UK =
  "Афілійовані або реферальні посилання використовуються там, де існує " +
  "партнерська угода з постачальником інструменту. Всі афілійовані відносини " +
  "чітко розкриваються на відповідній сторінці профілю інструменту та сторінках " +
  "порівняння. Редакційні рейтинги та оцінки не залежать від афілійованого статусу.";

/**
 * Schema.org markup note — English.
 */
export const TOOL_SCHEMA_NOTE_EN =
  "Every tool profile page includes structured schema.org SoftwareApplication " +
  "markup covering name, description, applicationCategory, operatingSystem, " +
  "offers (pricing), and aggregateRating where reviews exist. This markup " +
  "improves eligibility for rich results in Google Search.";

/**
 * Schema.org markup note — Ukrainian.
 */
export const TOOL_SCHEMA_NOTE_UK =
  "Кожна сторінка профілю інструменту включає структурну розмітку " +
  "schema.org SoftwareApplication, що охоплює назву, опис, " +
  "applicationCategory, operatingSystem, пропозиції (ціноутворення) та " +
  "aggregateRating за наявності відгуків. Ця розмітка покращує кваліфікацію " +
  "для розширених результатів у Google Search.";

/**
 * Programmatic routing note — English.
 */
export const TOOL_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes are auto-generated for /tools/<category>, " +
  "/tools/<industry>, and /tools/<use-case> path segments. Each route " +
  "renders a filtered, ranked listing of tools relevant to that segment, " +
  "accompanied by editorial context and comparison CTAs.";

/**
 * Programmatic routing note — Ukrainian.
 */
export const TOOL_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути автоматично генеруються для сегментів шляху " +
  "/tools/<category>, /tools/<industry> та /tools/<use-case>. Кожен маршрут " +
  "відображає відфільтрований, ранжований список інструментів, релевантних " +
  "для цього сегменту, з редакційним контекстом і CTA для порівняння.";

/**
 * Seed target note — English.
 */
export const TOOL_SEED_NOTE_EN =
  "The catalog seed target is 200–500 curated tools across all categories. " +
  "Priority seeding focuses on OSINT, satellite imagery, and threat-intelligence " +
  "categories, which drive the highest search volume for the target audience.";

/**
 * Seed target note — Ukrainian.
 */
export const TOOL_SEED_NOTE_UK =
  "Цільовий показник заповнення каталогу — 200–500 відібраних інструментів " +
  "по всіх категоріях. Пріоритетне заповнення зосереджено на категоріях " +
  "OSINT, супутникових знімків і розвідки загроз, які генерують найбільший " +
  "обсяг пошукових запитів для цільової аудиторії.";

/**
 * Free vs paid badge note — English.
 */
export const TOOL_FREE_PAID_BADGE_NOTE_EN =
  "Every tool listing displays a prominent free/paid badge derived from the " +
  "pricingModel field. Free and open-source tools are labelled 'Free'; " +
  "freemium tools show 'Free tier available'; paid and enterprise tools show " +
  "'Paid' or 'Enterprise'. Badges improve scanability and filter UX.";

/**
 * Free vs paid badge note — Ukrainian.
 */
export const TOOL_FREE_PAID_BADGE_NOTE_UK =
  "Кожен лістинг інструменту відображає помітний значок безкоштовний/платний, " +
  "що формується з поля pricingModel. Безкоштовні та відкриті інструменти " +
  "позначаються «Безкоштовно»; freemium-інструменти показують «Є безкоштовний " +
  "рівень»; платні та корпоративні інструменти показують «Платний» або " +
  "«Корпоративний». Значки покращують зручність сканування та UX фільтрів.";

// ── Schema.org builder ────────────────────────────────────────────────────────

/**
 * Builds a schema.org SoftwareApplication object from a ToolProfile.
 * Use in JSON-LD <script> blocks on /tools/<slug> pages.
 *
 * Будує об'єкт schema.org SoftwareApplication з ToolProfile.
 * Використовується в блоках JSON-LD <script> на сторінках /tools/<slug>.
 */
export function buildToolSchemaOrg(tool: ToolProfile): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description_en,
    applicationCategory: tool.category,
    offers: {
      "@type": "Offer",
      price: tool.pricingModel === "free" || tool.pricingModel === "open-source" ? "0" : undefined,
      priceCurrency: "USD",
      description: tool.priceRange_en,
    },
  };

  if (tool.ratingAvg !== null && tool.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: tool.ratingAvg,
      reviewCount: tool.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (tool.screenshots.length > 0) {
    schema.screenshot = tool.screenshots;
  }

  return schema;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the ToolCategoryConfig for a given ToolCategory id, or undefined.
 * Повертає ToolCategoryConfig для заданого id ToolCategory, або undefined.
 */
export function getToolCategory(id: ToolCategory): ToolCategoryConfig | undefined {
  return TOOL_CATEGORIES_CONFIG.find((c) => c.id === id);
}
