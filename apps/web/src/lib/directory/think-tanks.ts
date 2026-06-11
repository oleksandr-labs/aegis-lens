/**
 * Think Tanks & Research Centers directory — types, profiles, schema notes, and helper.
 * Директорія аналітичних центрів і дослідницьких організацій — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type ThinkTankFocus =
  | "security"
  | "defense"
  | "cyber"
  | "intelligence"
  | "conflict-resolution"
  | "disinformation"
  | "geopolitics"
  | "humanitarian"
  | "arms-control"
  | "energy-security";

export type ThinkTankGeography =
  | "global"
  | "transatlantic"
  | "european"
  | "us"
  | "uk"
  | "eastern-europe"
  | "middle-east"
  | "apac";

// ---------------------------------------------------------------------------
// ThinkTankProfile interface
// ---------------------------------------------------------------------------

export interface ThinkTankProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  founded: number | null;
  hqCountry: string;
  focus: ThinkTankFocus[];
  geography: ThinkTankGeography[];
  /** Placeholder publications URL — verify before publishing. */
  publicationsUrl_en: string;
  /** Placeholder publications URL — verify before publishing. */
  publicationsUrl_uk: string;
  verified: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const THINK_TANK_SCHEMA_NOTE_EN =
  "Schema.org type: Organization with additionalType: 'https://schema.org/ResearchOrganization'. Required fields — name, description, url, foundingDate, address (PostalAddress with addressCountry), sameAs (Wikidata QID where available), knowsAbout (array of focus topics). Mark as researchOrganization in structured data for enhanced search features.";
export const THINK_TANK_SCHEMA_NOTE_UK =
  "Тип schema.org: Organization з additionalType: 'https://schema.org/ResearchOrganization'. Обов'язкові поля — name, description, url, foundingDate, address (PostalAddress з addressCountry), sameAs (Wikidata QID де доступно), knowsAbout (масив тематичних напрямів). Позначати як researchOrganization у структурованих даних для розширених функцій пошуку.";

export const THINK_TANK_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /think-tanks/<focus> (e.g. /think-tanks/cyber) and /think-tanks/<geography> (e.g. /think-tanks/eastern-europe). Each route renders a filtered listing with SEO meta, FAQPage schema, and cross-links to published reports indexed in the Aegis Lens research database.";
export const THINK_TANK_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /think-tanks/<focus> (напр. /think-tanks/cyber) та /think-tanks/<geography> (напр. /think-tanks/eastern-europe). Кожен маршрут відображає відфільтрований список із SEO-метою, схемою FAQPage та перехресними посиланнями на опубліковані звіти, індексовані в дослідницькій базі Aegis Lens.";

export const THINK_TANK_SEED_NOTE_EN =
  "Seed target: 100–200 key global think tanks. Priority: RAND Corporation, Brookings Institution, Carnegie Endowment for International Peace, Chatham House (RIIA), IISS, SIPRI, Atlantic Council, Wilson Center, CSIS, ECFR, IRSEM, Razumkov Centre (UA), New Europe Center (UA), Centre for Defence Strategies (UA), Ukrainian Institute, ISW (Institute for the Study of War), Kyiv Security Forum, GLOBSEC, CEPA, OSW (Warsaw).";
export const THINK_TANK_SEED_NOTE_UK =
  "Цільовий обсяг seed: 100–200 ключових світових аналітичних центрів. Пріоритет: RAND Corporation, Brookings Institution, Carnegie Endowment for International Peace, Chatham House (RIIA), IISS, SIPRI, Atlantic Council, Wilson Center, CSIS, ECFR, IRSEM, Центр Разумкова (UA), Новий Європ. центр (UA), Центр оборонних стратегій (UA), Український інститут, ISW, Київський безпековий форум, GLOBSEC, CEPA, OSW (Варшава).";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 100–200 entries)
// ---------------------------------------------------------------------------

export const THINK_TANK_PROFILES: ThinkTankProfile[] = [
  {
    id: "tt-001",
    slug: "institute-for-the-study-of-war",
    name_en: "Institute for the Study of War (ISW)",
    name_uk: "Інститут вивчення війни (ISW)",
    description_en:
      "US-based non-partisan research institute producing daily open-source analysis of Russian military operations in Ukraine and global conflict zones.",
    description_uk:
      "Американський безпартійний науково-дослідний інститут, що щодня публікує аналіз на основі відкритих джерел щодо російських військових операцій в Україні та глобальних зон конфліктів.",
    founded: 2007,
    hqCountry: "US",
    focus: ["security", "defense", "intelligence", "geopolitics"],
    geography: ["us", "eastern-europe", "global"],
    publicationsUrl_en: "https://www.understandingwar.org/publications",
    publicationsUrl_uk: "https://www.understandingwar.org/publications",
    verified: true,
    notes_en: "Seed entry — daily Ukraine updates; high-priority cross-link target for Aegis Lens conflict pages.",
    notes_uk: "Запис seed — щоденні оновлення щодо України; пріоритетна ціль перехресних посилань для сторінок конфліктів Aegis Lens.",
  },
  {
    id: "tt-002",
    slug: "chatham-house",
    name_en: "Chatham House (Royal Institute of International Affairs)",
    name_uk: "Chatham House (Королівський інститут міжнародних відносин)",
    description_en:
      "One of the world's leading international affairs think tanks, headquartered in London. Produces influential research on security, geopolitics, and Eastern Europe.",
    description_uk:
      "Один із провідних аналітичних центрів світу з міжнародних відносин, розташований у Лондоні. Видає впливові дослідження з безпеки, геополітики та Східної Європи.",
    founded: 1920,
    hqCountry: "GB",
    focus: ["geopolitics", "security", "energy-security", "disinformation"],
    geography: ["uk", "transatlantic", "european", "eastern-europe", "global"],
    publicationsUrl_en: "https://www.chathamhouse.org/publications",
    publicationsUrl_uk: "https://www.chathamhouse.org/publications",
    verified: true,
    notes_en: "Seed entry — Chatham House Rule origin; strong Ukraine/Russia research programme.",
    notes_uk: "Запис seed — джерело Chatham House Rule; потужна дослідницька програма щодо України/Росії.",
  },
  {
    id: "tt-003",
    slug: "razumkov-centre",
    name_en: "Razumkov Centre",
    name_uk: "Центр Разумкова",
    description_en:
      "Ukrainian independent think tank conducting research on national security, political reform, economic policy, and public opinion in Ukraine.",
    description_uk:
      "Незалежний аналітичний центр України, що проводить дослідження з питань національної безпеки, політичних реформ, економічної політики та громадської думки.",
    founded: 1995,
    hqCountry: "UA",
    focus: ["security", "geopolitics", "conflict-resolution"],
    geography: ["eastern-europe", "european"],
    publicationsUrl_en: "https://razumkov.org.ua/en/publications",
    publicationsUrl_uk: "https://razumkov.org.ua/publications",
    verified: true,
    notes_en: "Seed entry — key Ukrainian domestic source; bilingual publications available.",
    notes_uk: "Запис seed — ключове українське внутрішнє джерело; доступні двомовні публікації.",
  },
  {
    id: "tt-004",
    slug: "sipri",
    name_en: "Stockholm International Peace Research Institute (SIPRI)",
    name_uk: "Стокгольмський міжнародний інститут дослідження миру (SIPRI)",
    description_en:
      "International institute dedicated to research on conflict, armaments, arms control, and disarmament. Known for authoritative annual military expenditure and arms transfer databases.",
    description_uk:
      "Міжнародний інститут, присвячений дослідженням конфліктів, озброєнь, контролю над озброєннями та роззброєнню. Відомий авторитетними щорічними базами даних військових витрат і передачі зброї.",
    founded: 1966,
    hqCountry: "SE",
    focus: ["arms-control", "security", "defense", "conflict-resolution"],
    geography: ["global", "european"],
    publicationsUrl_en: "https://www.sipri.org/publications",
    publicationsUrl_uk: "https://www.sipri.org/publications",
    verified: true,
    notes_en: "Seed entry — SIPRI Yearbook is essential annual reference; confirm current URL.",
    notes_uk: "Запис seed — Щорічник SIPRI є ключовим щорічним довідником; підтвердьте поточний URL.",
  },
];

// ---------------------------------------------------------------------------
// Think tank focus config (drives programmatic pages)
// ---------------------------------------------------------------------------

export const THINK_TANK_FOCUS_CONFIG = [
  {
    slug: "security",
    label_en: "Security",
    label_uk: "Безпека",
    description_en: "National and international security policy and strategy research.",
    description_uk: "Дослідження національної та міжнародної безпекової політики та стратегії.",
  },
  {
    slug: "defense",
    label_en: "Defense",
    label_uk: "Оборона",
    description_en: "Defence industry, military capability, and armed forces policy.",
    description_uk: "Оборонна промисловість, військовий потенціал та політика збройних сил.",
  },
  {
    slug: "cyber",
    label_en: "Cyber",
    label_uk: "Кіберсфера",
    description_en: "Cyber policy, cybersecurity strategy, and digital conflict research.",
    description_uk: "Кіберполітика, стратегія кібербезпеки та дослідження цифрових конфліктів.",
  },
  {
    slug: "intelligence",
    label_en: "Intelligence",
    label_uk: "Розвідка",
    description_en: "Intelligence community studies, oversight, and reform analysis.",
    description_uk: "Дослідження розвідувального співтовариства, нагляд та аналіз реформ.",
  },
  {
    slug: "conflict-resolution",
    label_en: "Conflict Resolution",
    label_uk: "Врегулювання конфліктів",
    description_en: "Peace processes, mediation, and post-conflict reconstruction research.",
    description_uk: "Дослідження мирних процесів, медіації та постконфліктного відновлення.",
  },
  {
    slug: "disinformation",
    label_en: "Disinformation",
    label_uk: "Дезінформація",
    description_en: "Strategic communication, influence operations, and information warfare.",
    description_uk: "Стратегічна комунікація, операції впливу та інформаційна війна.",
  },
  {
    slug: "geopolitics",
    label_en: "Geopolitics",
    label_uk: "Геополітика",
    description_en: "International relations, power competition, and regional order analysis.",
    description_uk: "Міжнародні відносини, конкуренція держав та аналіз регіонального порядку.",
  },
  {
    slug: "humanitarian",
    label_en: "Humanitarian",
    label_uk: "Гуманітарна сфера",
    description_en: "Humanitarian law, refugee policy, and crisis response research.",
    description_uk: "Гуманітарне право, політика щодо біженців та дослідження реагування на кризи.",
  },
  {
    slug: "arms-control",
    label_en: "Arms Control",
    label_uk: "Контроль над озброєннями",
    description_en: "Arms treaties, disarmament, and nuclear non-proliferation studies.",
    description_uk: "Угоди про озброєння, роззброєння та дослідження ядерного нерозповсюдження.",
  },
  {
    slug: "energy-security",
    label_en: "Energy Security",
    label_uk: "Енергетична безпека",
    description_en: "Energy policy, supply chain risk, and critical infrastructure protection.",
    description_uk: "Енергетична політика, ризики ланцюга постачання та захист критичної інфраструктури.",
  },
] as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getThinkTankProfile(slug: string): ThinkTankProfile | undefined {
  return THINK_TANK_PROFILES.find((t) => t.slug === slug);
}
