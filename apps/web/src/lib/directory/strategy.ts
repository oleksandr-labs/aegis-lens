/**
 * Directory strategy — types, listing tiers, monetization, and schema mapping.
 * Стратегія директорії — типи, рівні лістингу, монетизація та маппінг схем.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type DirectoryType =
  | "companies"
  | "tools"
  | "services"
  | "experts"
  | "aoi-commercial"
  | "datasets"
  | "conferences"
  | "courses"
  | "podcasts"
  | "think-tanks"
  | "ngos"
  | "grants"
  | "journals"
  | "books";

export type ListingTier =
  | "free-community"
  | "free-crawled"
  | "claimed-basic"
  | "claimed-featured"
  | "sponsored";

export type ListingSchemaType =
  | "Organization"
  | "SoftwareApplication"
  | "Service"
  | "Person"
  | "Event"
  | "Course"
  | "Podcast"
  | "CreativeWork";

// ---------------------------------------------------------------------------
// DirectoryTypeConfig
// ---------------------------------------------------------------------------

export interface DirectoryTypeConfig {
  id: DirectoryType;
  name_en: string;
  name_uk: string;
  schemaType: ListingSchemaType;
  urlPrefix: string;
  seoValueNote_en: string;
  seoValueNote_uk: string;
  notes_en: string;
  notes_uk: string;
}

export const DIRECTORY_TYPE_CONFIGS: DirectoryTypeConfig[] = [
  {
    id: "companies",
    name_en: "Companies",
    name_uk: "Компанії",
    schemaType: "Organization",
    urlPrefix: "/directory/companies",
    seoValueNote_en: "High-intent B2B searches; lead-gen anchor for the platform.",
    seoValueNote_uk: "B2B-запити з високим наміром; якір лід-генерації для платформи.",
    notes_en: "OSINT, cyber, defense, geo-intel, threat-intel, humanitarian-tech firms.",
    notes_uk: "Компанії у сферах OSINT, кіберзахисту, оборони, геоінтелекту, threat-intel, гуманітарних технологій.",
  },
  {
    id: "tools",
    name_en: "Tools",
    name_uk: "Інструменти",
    schemaType: "SoftwareApplication",
    urlPrefix: "/directory/tools",
    seoValueNote_en: "High search volume for tool comparisons; affiliate and sponsored placement opportunities.",
    seoValueNote_uk: "Великий обсяг пошукових запитів для порівняння інструментів; можливості афілійованого та спонсорованого розміщення.",
    notes_en: "Software tools: open-source and commercial, CLI, SaaS, desktop.",
    notes_uk: "Програмні інструменти: відкритий код і комерційні, CLI, SaaS, десктоп.",
  },
  {
    id: "services",
    name_en: "Services",
    name_uk: "Послуги",
    schemaType: "Service",
    urlPrefix: "/directory/services",
    seoValueNote_en: "Professional services pages rank for high-value consulting queries.",
    seoValueNote_uk: "Сторінки послуг ранжуються за запитами консалтингу з високою вартістю.",
    notes_en: "Consulting, research, training, managed services, red-teaming.",
    notes_uk: "Консалтинг, дослідження, навчання, керовані послуги, red-teaming.",
  },
  {
    id: "experts",
    name_en: "Experts",
    name_uk: "Експерти",
    schemaType: "Person",
    urlPrefix: "/directory/experts",
    seoValueNote_en: "E-E-A-T signal; expert profiles link to reports and publications.",
    seoValueNote_uk: "Сигнал E-E-A-T; профілі експертів посилаються на звіти та публікації.",
    notes_en: "Analysts, investigators, researchers, journalists with verifiable public profiles.",
    notes_uk: "Аналітики, слідчі, дослідники, журналісти з верифікованими публічними профілями.",
  },
  {
    id: "aoi-commercial",
    name_en: "Areas of Interest (Commercial)",
    name_uk: "Зони інтересів (Комерційні)",
    schemaType: "Organization",
    urlPrefix: "/directory/aoi-commercial",
    seoValueNote_en: "Commercial AOI data providers and geofencing service vendors.",
    seoValueNote_uk: "Комерційні провайдери даних AOI та постачальники послуг геофенсингу.",
    notes_en: "Commercial satellite, aerial, and sensor data for specific geographic areas.",
    notes_uk: "Комерційні супутникові, аеріальні та сенсорні дані для конкретних географічних зон.",
  },
  {
    id: "datasets",
    name_en: "Datasets",
    name_uk: "Датасети",
    schemaType: "CreativeWork",
    urlPrefix: "/directory/datasets",
    seoValueNote_en: "Researchers search for named datasets; drives long-tail organic traffic.",
    seoValueNote_uk: "Дослідники шукають іменовані датасети; генерує довгохвостовий органічний трафік.",
    notes_en: "Open and commercial datasets: conflict, sanctions, geospatial, entity data.",
    notes_uk: "Відкриті та комерційні датасети: конфлікти, санкції, геопросторові дані, дані сутностей.",
  },
  {
    id: "conferences",
    name_en: "Conferences",
    name_uk: "Конференції",
    schemaType: "Event",
    urlPrefix: "/directory/conferences",
    seoValueNote_en: "Event pages capture pre-event search traffic and speaker name searches.",
    seoValueNote_uk: "Сторінки подій захоплюють пошуковий трафік перед подією та пошуки імен спікерів.",
    notes_en: "OSINT, security, defense, and intelligence industry conferences worldwide.",
    notes_uk: "Конференції OSINT, безпеки, оборони та розвідки по всьому світу.",
  },
  {
    id: "courses",
    name_en: "Courses",
    name_uk: "Курси",
    schemaType: "Course",
    urlPrefix: "/directory/courses",
    seoValueNote_en: "High-intent learner searches; affiliate and sponsored placement revenue.",
    seoValueNote_uk: "Пошуки учнів із високим наміром; дохід від афілійованих та спонсорованих розміщень.",
    notes_en: "Online and in-person courses for OSINT, cyber, threat analysis, and geospatial skills.",
    notes_uk: "Онлайн та очні курси з OSINT, кіберзахисту, аналізу загроз та геопросторових навичок.",
  },
  {
    id: "podcasts",
    name_en: "Podcasts",
    name_uk: "Подкасти",
    schemaType: "Podcast",
    urlPrefix: "/directory/podcasts",
    seoValueNote_en: "Podcast discovery pages drive repeat visitors and newsletter sign-ups.",
    seoValueNote_uk: "Сторінки відкриття подкастів приваблюють постійних відвідувачів та підписки на розсилку.",
    notes_en: "Intelligence, security, and geopolitics podcasts with episode archives.",
    notes_uk: "Подкасти з розвідки, безпеки та геополітики з архівами епізодів.",
  },
  {
    id: "think-tanks",
    name_en: "Think Tanks",
    name_uk: "Аналітичні центри",
    schemaType: "Organization",
    urlPrefix: "/directory/think-tanks",
    seoValueNote_en: "Authoritative source references boost domain E-E-A-T.",
    seoValueNote_uk: "Посилання на авторитетні джерела підвищують E-E-A-T домену.",
    notes_en: "Policy research institutes focused on security, defense, and conflict analysis.",
    notes_uk: "Інститути політичних досліджень, зосереджені на безпеці, обороні та аналізі конфліктів.",
  },
  {
    id: "ngos",
    name_en: "NGOs",
    name_uk: "НГО / Громадські організації",
    schemaType: "Organization",
    urlPrefix: "/directory/ngos",
    seoValueNote_en: "NGO profiles drive grant-seeker and journalist traffic.",
    seoValueNote_uk: "Профілі НГО приваблюють тих, хто шукає гранти, та журналістів.",
    notes_en: "Non-governmental organizations active in conflict monitoring, human rights, and humanitarian response.",
    notes_uk: "Неурядові організації, що займаються моніторингом конфліктів, правами людини та гуманітарним реагуванням.",
  },
  {
    id: "grants",
    name_en: "Grants",
    name_uk: "Гранти",
    schemaType: "CreativeWork",
    urlPrefix: "/directory/grants",
    seoValueNote_en: "Grant opportunity pages attract researchers, journalists, and civil society orgs.",
    seoValueNote_uk: "Сторінки грантових можливостей приваблюють дослідників, журналістів та організації громадянського суспільства.",
    notes_en: "Funding opportunities for OSINT, investigative journalism, security research, and humanitarian tech.",
    notes_uk: "Можливості фінансування для OSINT, журналістських розслідувань, досліджень безпеки та гуманітарних технологій.",
  },
  {
    id: "journals",
    name_en: "Journals",
    name_uk: "Журнали / Видання",
    schemaType: "CreativeWork",
    urlPrefix: "/directory/journals",
    seoValueNote_en: "Academic and trade journal pages capture citation-driven search traffic.",
    seoValueNote_uk: "Сторінки академічних і галузевих журналів захоплюють пошуковий трафік на основі цитувань.",
    notes_en: "Peer-reviewed and trade journals covering intelligence, security, and conflict studies.",
    notes_uk: "Рецензовані та галузеві журнали з розвідки, безпеки та конфліктології.",
  },
  {
    id: "books",
    name_en: "Books",
    name_uk: "Книги",
    schemaType: "CreativeWork",
    urlPrefix: "/directory/books",
    seoValueNote_en: "Book title and author searches drive highly targeted traffic; affiliate revenue opportunity.",
    seoValueNote_uk: "Пошуки назв книг і авторів приваблюють цільовий трафік; можливість афілійованого доходу.",
    notes_en: "Essential reading on OSINT, intelligence tradecraft, conflict analysis, and cyber operations.",
    notes_uk: "Обов'язкова читанка з OSINT, розвідувальної майстерності, аналізу конфліктів та кіберопераційної діяльності.",
  },
];

// ---------------------------------------------------------------------------
// ListingTierConfig
// ---------------------------------------------------------------------------

export interface ListingTierConfig {
  tier: ListingTier;
  name_en: string;
  name_uk: string;
  features_en: string[];
  features_uk: string[];
  priceUsd: number | string;
  notes_en: string;
  notes_uk: string;
}

export const LISTING_TIER_CONFIGS: ListingTierConfig[] = [
  {
    tier: "free-community",
    name_en: "Free — Community",
    name_uk: "Безкоштовно — Спільнота",
    features_en: [
      "Community-submitted listing",
      "Manual editorial review before publish",
      "Basic profile: name, description, website, region",
      "Indexed by search engines",
    ],
    features_uk: [
      "Лістинг, поданий спільнотою",
      "Ручна редакційна перевірка перед публікацією",
      "Базовий профіль: назва, опис, сайт, регіон",
      "Індексується пошуковими системами",
    ],
    priceUsd: 0,
    notes_en: "Open submission with spam and duplicate detection. Moderator approval required.",
    notes_uk: "Відкрита подача з виявленням спаму та дублікатів. Потрібне схвалення модератора.",
  },
  {
    tier: "free-crawled",
    name_en: "Free — Auto-Crawled",
    name_uk: "Безкоштовно — Автоматично сканований",
    features_en: [
      "Automatically discovered and indexed",
      "Auto-refreshed on schedule",
      "Basic profile populated from public web sources",
      "Can be claimed by the organization",
    ],
    features_uk: [
      "Автоматично виявлено та індексовано",
      "Автоматичне оновлення за розкладом",
      "Базовий профіль, заповнений із публічних веб-джерел",
      "Може бути заявлений організацією",
    ],
    priceUsd: 0,
    notes_en: "Crawled from public web; data accuracy is best-effort. Organizations may claim to correct data.",
    notes_uk: "Зісканований із публічного вебу; точність даних — на рівні best-effort. Організації можуть заявити для виправлення даних.",
  },
  {
    tier: "claimed-basic",
    name_en: "Claimed — Basic",
    name_uk: "Заявлений — Базовий",
    features_en: [
      "Domain-verified ownership",
      "Full edit rights over profile content",
      "Contact information displayed",
      "Verified badge on listing",
      "Appear in 'verified only' filter results",
    ],
    features_uk: [
      "Верифікація через домен",
      "Повні права редагування профілю",
      "Відображення контактної інформації",
      "Позначка верифікації на лістингу",
      "Відображення у результатах фільтра 'тільки верифіковані'",
    ],
    priceUsd: 0,
    notes_en: "Free claim via DNS TXT or email verification. Gives the org control over their data.",
    notes_uk: "Безкоштовна заявка через DNS TXT або верифікацію електронною поштою. Дає організації контроль над своїми даними.",
  },
  {
    tier: "claimed-featured",
    name_en: "Claimed — Featured",
    name_uk: "Заявлений — Виділений",
    features_en: [
      "Top placement in category and search results",
      "Analytics dashboard: profile views, clicks, leads",
      "Lead-gen widget: request quote / demo CTA",
      "Featured badge and visual highlight",
      "Rich profile: case studies, team, integrations",
      "Priority support",
    ],
    features_uk: [
      "Топ-позиція в категорії та результатах пошуку",
      "Аналітичний дашборд: перегляди профілю, кліки, ліди",
      "Лід-генерувальний віджет: CTA 'запит пропозиції / демо'",
      "Позначка 'Виділений' та візуальне виділення",
      "Розширений профіль: кейси, команда, інтеграції",
      "Пріоритетна підтримка",
    ],
    priceUsd: "$99–$499/mo",
    notes_en: "Price varies by category and traffic volume. Monthly or annual billing.",
    notes_uk: "Ціна залежить від категорії та обсягу трафіку. Щомісячна або річна оплата.",
  },
  {
    tier: "sponsored",
    name_en: "Sponsored",
    name_uk: "Спонсорований",
    features_en: [
      "Top-of-category placement above all other listings",
      "Logo in category header banner",
      "Sponsored label (transparent)",
      "Dedicated landing page on platform",
      "Newsletter mention option",
      "Custom lead-gen form",
    ],
    features_uk: [
      "Розміщення на вершині категорії вище за всі інші лістинги",
      "Логотип у банері заголовка категорії",
      "Позначка 'Спонсоровано' (прозора)",
      "Виділена цільова сторінка на платформі",
      "Опція згадки в розсилці",
      "Кастомна форма лід-генерації",
    ],
    priceUsd: "$299–$999/mo",
    notes_en: "Category exclusivity optional at premium rate. Quarterly minimum commitment.",
    notes_uk: "Ексклюзивність категорії доступна за підвищеною ставкою. Мінімальне зобов'язання — квартал.",
  },
];

// ---------------------------------------------------------------------------
// Policy and notes constants
// ---------------------------------------------------------------------------

export const DIRECTORY_MONETIZATION_NOTE_EN =
  "Revenue model: featured and sponsored listing fees ($99–$999/mo), pay-to-claim upsells, lead-gen widget commissions, and affiliate links on tool/book listings.";
export const DIRECTORY_MONETIZATION_NOTE_UK =
  "Модель монетизації: плата за виділені та спонсоровані лістинги ($99–$999/міс), апсейли за заявку, комісії лід-генерувального віджету та афілійовані посилання на інструменти/книги.";

export const DIRECTORY_CONTENT_NOTE_EN =
  "Each listing supports rich per-entry content: long-form description, capabilities list, regions served, technology integrations, partner network, ratings, and moderated reviews.";
export const DIRECTORY_CONTENT_NOTE_UK =
  "Кожен лістинг підтримує насичений контент: розгорнутий опис, перелік можливостей, регіони обслуговування, технологічні інтеграції, мережу партнерів, рейтинги та модеровані відгуки.";

export const ANTI_SPAM_NOTE_EN =
  "Anti-spam and anti-fake-listing controls: automated template text detection, doppelgänger profile deduplication, domain age checks, manual moderation queue for flagged entries, and community report mechanism.";
export const ANTI_SPAM_NOTE_UK =
  "Засоби захисту від спаму та фальшивих лістингів: автоматичне виявлення шаблонних текстів, дедублікація профілів-двійників, перевірка віку домену, черга ручної модерації для позначених записів і механізм скарг спільноти.";

export const SCHEMA_ORG_NOTE_EN =
  "Every listing renders per-listing schema.org markup using the mapped type (Organization, SoftwareApplication, Service, Person, Event, Course, Podcast, or CreativeWork) to maximize structured data coverage and rich-result eligibility.";
export const SCHEMA_ORG_NOTE_UK =
  "Кожен лістинг відображає розмітку schema.org відповідно до маппованого типу (Organization, SoftwareApplication, Service, Person, Event, Course, Podcast або CreativeWork) для максимального покриття структурованих даних та відповідності вимогам розширених результатів.";

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getDirectoryTypeConfig(id: DirectoryType): DirectoryTypeConfig | undefined {
  return DIRECTORY_TYPE_CONFIGS.find((c) => c.id === id);
}

export function getListingTierConfig(tier: ListingTier): ListingTierConfig | undefined {
  return LISTING_TIER_CONFIGS.find((c) => c.tier === tier);
}
