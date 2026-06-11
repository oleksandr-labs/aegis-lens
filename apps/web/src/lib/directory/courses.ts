/**
 * Courses directory — types, profiles, schema notes, and helper.
 * Директорія курсів — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type CourseFormat =
  | "self-paced"
  | "live-cohort"
  | "workshop"
  | "certification-track";

export type CourseTopic =
  | "osint-fundamentals"
  | "geolocation"
  | "satellite-analysis"
  | "social-media-investigation"
  | "disinformation-detection"
  | "threat-intelligence"
  | "conflict-journalism"
  | "digital-forensics";

// ---------------------------------------------------------------------------
// CourseProfile interface
// ---------------------------------------------------------------------------

export interface CourseProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  provider_en: string;
  provider_uk: string;
  description_en: string;
  description_uk: string;
  format: CourseFormat;
  topics: CourseTopic[];
  durationHours: number | null;
  priceUsd: number | null;
  free: boolean;
  certification: boolean;
  language: string;
  verified: boolean;
  ratingAvg: number | null;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const COURSE_SCHEMA_NOTE_EN =
  "Schema.org type: Course. Required fields — name, description, provider (Organization), courseCode, hasCourseInstance (with courseMode: 'online' | 'onsite' | 'blended', startDate, endDate, offers). Add educationalCredentialAwarded when certification is true.";
export const COURSE_SCHEMA_NOTE_UK =
  "Тип schema.org: Course. Обов'язкові поля — name, description, provider (Organization), courseCode, hasCourseInstance (з courseMode: 'online' | 'onsite' | 'blended', startDate, endDate, offers). Додавати educationalCredentialAwarded, коли certification = true.";

export const COURSE_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /courses-directory/<topic> (e.g. /courses-directory/osint-fundamentals) and /courses-directory/<format> (e.g. /courses-directory/self-paced). Each route renders a filtered listing with SEO meta, FAQPage schema, and a 'Best OSINT courses for <topic>' H1.";
export const COURSE_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /courses-directory/<topic> (напр. /courses-directory/osint-fundamentals) та /courses-directory/<format> (напр. /courses-directory/self-paced). Кожен маршрут відображає відфільтрований список із SEO-метою, схемою FAQPage і H1 'Найкращі курси OSINT з <topic>'.";

export const COURSE_CERTIFICATION_NOTE_EN =
  "Certified courses are prominently badged with a 'Certified' label in listings and detail pages. Academy graduates are cross-linked to the Aegis Lens Academy module. Certification provider name and issuing body must be manually verified before the 'certification' flag is set.";
export const COURSE_CERTIFICATION_NOTE_UK =
  "Сертифіковані курси помітно позначені міткою 'Certified' у списках та на сторінках деталей. Випускники Академії перехресно посилаються на модуль Академії Aegis Lens. Назва постачальника сертифікації та органу-видавця мають бути перевірені вручну перед встановленням прапорця 'certification'.";

export const COURSE_SEED_NOTE_EN =
  "Seed target: 100–300 curated courses. Priority providers: Bellingcat, SANS Institute, Trace Labs, GIJN, Coursera (cybersecurity/OSINT), edX, Udemy (OSINT), Intel Techniques (Michael Bazzell), OSINTCurious, Toddington International, GeoSpy, Forensic Focus, Future Learn, LinkedIn Learning.";
export const COURSE_SEED_NOTE_UK =
  "Цільовий обсяг seed: 100–300 відібраних курсів. Пріоритетні постачальники: Bellingcat, SANS Institute, Trace Labs, GIJN, Coursera (кібербезпека/OSINT), edX, Udemy (OSINT), Intel Techniques (Michael Bazzell), OSINTCurious, Toddington International, GeoSpy, Forensic Focus, Future Learn, LinkedIn Learning.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 100–300 entries)
// ---------------------------------------------------------------------------

export const COURSE_PROFILES: CourseProfile[] = [
  {
    id: "course-001",
    slug: "bellingcat-online-investigations-toolkit",
    name_en: "Online Investigations Toolkit",
    name_uk: "Інструментарій онлайн-розслідувань",
    provider_en: "Bellingcat",
    provider_uk: "Bellingcat",
    description_en:
      "Hands-on course covering geolocation, social-media investigation, and satellite imagery analysis from the world-leading open-source investigations outlet.",
    description_uk:
      "Практичний курс з геолокації, розслідувань у соціальних мережах та аналізу супутникових знімків від провідної організації з розслідувань із відкритих джерел.",
    format: "self-paced",
    topics: ["osint-fundamentals", "geolocation", "satellite-analysis", "social-media-investigation"],
    durationHours: 20,
    priceUsd: 0,
    free: true,
    certification: false,
    language: "en",
    verified: true,
    ratingAvg: 4.8,
    notes_en: "Seed entry — confirm content is still current before publishing.",
    notes_uk: "Запис seed — підтвердьте актуальність контенту перед публікацією.",
  },
  {
    id: "course-002",
    slug: "sans-osint-summit-workshop",
    name_en: "OSINT Fundamentals Workshop",
    name_uk: "Воркшоп з основ OSINT",
    provider_en: "SANS Institute",
    provider_uk: "SANS Institute",
    description_en:
      "Intensive workshop introducing OSINT methodology, tools, and legal considerations for security professionals and investigators.",
    description_uk:
      "Інтенсивний воркшоп, що знайомить із методологією, інструментами та правовими аспектами OSINT для фахівців із безпеки та слідчих.",
    format: "workshop",
    topics: ["osint-fundamentals", "threat-intelligence", "digital-forensics"],
    durationHours: 16,
    priceUsd: 1500,
    free: false,
    certification: true,
    language: "en",
    verified: true,
    ratingAvg: 4.6,
    notes_en: "Seed entry — verify current pricing and schedule from SANS website.",
    notes_uk: "Запис seed — перевірте поточні ціни та розклад на сайті SANS.",
  },
  {
    id: "course-003",
    slug: "michael-bazzell-osint-techniques",
    name_en: "OSINT Techniques — Complete Self-Study Course",
    name_uk: "Методи OSINT — повний курс самостійного навчання",
    provider_en: "Intel Techniques (Michael Bazzell)",
    provider_uk: "Intel Techniques (Michael Bazzell)",
    description_en:
      "Comprehensive self-paced course covering advanced OSINT methodologies, privacy, and custom search tools by the author of the OSINT Techniques book.",
    description_uk:
      "Комплексний курс у власному темпі, що охоплює розширені методи OSINT, конфіденційність та кастомні інструменти пошуку від автора книги OSINT Techniques.",
    format: "self-paced",
    topics: ["osint-fundamentals", "social-media-investigation", "digital-forensics"],
    durationHours: 40,
    priceUsd: 199,
    free: false,
    certification: false,
    language: "en",
    verified: true,
    ratingAvg: 4.9,
    notes_en: "Seed entry — confirm course URL and current price on inteltechniques.com.",
    notes_uk: "Запис seed — підтвердьте URL курсу та поточну ціну на inteltechniques.com.",
  },
];

// ---------------------------------------------------------------------------
// Course topic config (drives programmatic pages)
// ---------------------------------------------------------------------------

export const COURSE_TOPIC_CONFIG = [
  {
    slug: "osint-fundamentals",
    label_en: "OSINT Fundamentals",
    label_uk: "Основи OSINT",
    description_en: "Core open-source intelligence skills for beginners and intermediates.",
    description_uk: "Базові навички OSINT для початківців і фахівців середнього рівня.",
  },
  {
    slug: "geolocation",
    label_en: "Geolocation",
    label_uk: "Геолокація",
    description_en: "Techniques for locating images, videos, and events using open sources.",
    description_uk: "Методи геолокації зображень, відео та подій за відкритими джерелами.",
  },
  {
    slug: "satellite-analysis",
    label_en: "Satellite Analysis",
    label_uk: "Аналіз супутникових даних",
    description_en: "Interpreting satellite imagery for conflict monitoring and OSINT.",
    description_uk: "Інтерпретація супутникових знімків для моніторингу конфліктів та OSINT.",
  },
  {
    slug: "social-media-investigation",
    label_en: "Social Media Investigation",
    label_uk: "Розслідування в соціальних мережах",
    description_en: "Collecting and verifying intelligence from social media platforms.",
    description_uk: "Збір і верифікація розвідувальних даних із платформ соціальних мереж.",
  },
  {
    slug: "disinformation-detection",
    label_en: "Disinformation Detection",
    label_uk: "Виявлення дезінформації",
    description_en: "Identifying and countering mis- and disinformation campaigns.",
    description_uk: "Ідентифікація та протидія кампаніям з дезінформації.",
  },
  {
    slug: "threat-intelligence",
    label_en: "Threat Intelligence",
    label_uk: "Розвідка загроз",
    description_en: "Cyber threat intelligence collection, analysis, and reporting.",
    description_uk: "Збір, аналіз і звітування з кіберрозвідки загроз.",
  },
  {
    slug: "conflict-journalism",
    label_en: "Conflict Journalism",
    label_uk: "Журналістика конфліктів",
    description_en: "Reporting from and about armed conflict zones safely and accurately.",
    description_uk: "Безпечне та точне репортування із зон збройних конфліктів.",
  },
  {
    slug: "digital-forensics",
    label_en: "Digital Forensics",
    label_uk: "Цифрова криміналістика",
    description_en: "Preserving and analysing digital evidence for investigations.",
    description_uk: "Збереження та аналіз цифрових доказів для розслідувань.",
  },
] as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getCourseProfile(slug: string): CourseProfile | undefined {
  return COURSE_PROFILES.find((c) => c.slug === slug);
}
