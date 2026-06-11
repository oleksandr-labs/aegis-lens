/**
 * Books directory (OSINT / Intel / Conflict / Cyber) — types, profiles, schema notes, and helper.
 * Директорія книг (OSINT / Розвідка / Конфлікти / Кібер) — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type BookTopic =
  | "osint-field-guide"
  | "conflict-history"
  | "intelligence-tradecraft"
  | "disinformation"
  | "cyber-warfare"
  | "satellite-imaging"
  | "investigative-journalism"
  | "war-crimes"
  | "geopolitics";

export type BookFormat =
  | "paperback"
  | "ebook"
  | "audiobook"
  | "open-access-pdf";

// ---------------------------------------------------------------------------
// BookProfile interface
// ---------------------------------------------------------------------------

export interface BookProfile {
  id: string;
  slug: string;
  title_en: string;
  title_uk: string;
  author_en: string;
  author_uk: string;
  description_en: string;
  description_uk: string;
  topic: BookTopic[];
  format: BookFormat[];
  publishedYear: number | null;
  isbn: string | null;
  free: boolean;
  affiliateAvailable: boolean;
  verified: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const BOOK_SCHEMA_NOTE_EN =
  "Schema.org type: Book. Include name, author (Person), isbn, datePublished, inLanguage, and url. Add Review schema on individual book pages where platform editorial reviews are present.";
export const BOOK_SCHEMA_NOTE_UK =
  "Тип schema.org: Book. Включати name, author (Person), isbn, datePublished, inLanguage та url. Додавати схему Review на окремих сторінках книг там, де наявні редакційні рецензії платформи.";

export const BOOK_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /books/<topic> (e.g. /books/osint-field-guide). 'Best books for OSINT 2025' programmatic listicle auto-generated from verified entries with free=false and topic includes osint-field-guide or intelligence-tradecraft.";
export const BOOK_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /books/<topic> (напр. /books/osint-field-guide). Програматичний список 'Найкращі книги з OSINT 2025' автоматично генерується з верифікованих записів, де free=false, а тема включає osint-field-guide або intelligence-tradecraft.";

export const BOOK_AFFILIATE_NOTE_EN =
  "Affiliate links to Amazon and Bookshop.org are always clearly disclosed on the page. Affiliate revenue is minor but trust-building — transparency is mandatory. Never present affiliate links without disclosure.";
export const BOOK_AFFILIATE_NOTE_UK =
  "Афілійовані посилання на Amazon та Bookshop.org завжди чітко розкриваються на сторінці. Афілійований дохід незначний, але зміцнює довіру — прозорість є обов'язковою. Ніколи не розміщуйте афілійовані посилання без розкриття інформації.";

export const BOOK_SEED_NOTE_EN =
  "Seed target: 100–300 curated essential reads across OSINT, intelligence tradecraft, conflict history, disinformation, cyber warfare, satellite imaging, and geopolitics. Include both classic and recent titles.";
export const BOOK_SEED_NOTE_UK =
  "Цільовий обсяг seed: 100–300 відібраних обов'язкових книг з OSINT, розвідувальної майстерності, історії конфліктів, дезінформації, кібервійни, супутникових знімків та геополітики. Включати як класичні, так і нові видання.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 100–300 entries)
// ---------------------------------------------------------------------------

export const BOOK_PROFILES: BookProfile[] = [
  {
    id: "book-001",
    slug: "open-source-intelligence-techniques-bazzell",
    title_en: "Open Source Intelligence Techniques",
    title_uk: "Техніки розвідки на основі відкритих джерел",
    author_en: "Michael Bazzell",
    author_uk: "Майкл Базелл",
    description_en:
      "Comprehensive field guide covering OSINT methodologies, tools, and workflows for investigators, journalists, and security professionals. Updated annually.",
    description_uk:
      "Комплексний посібник з методологій, інструментів та робочих процесів OSINT для слідчих, журналістів та фахівців з безпеки. Оновлюється щорічно.",
    topic: ["osint-field-guide", "investigative-journalism"],
    format: ["paperback", "ebook"],
    publishedYear: 2024,
    isbn: "978-0-578-13257-3",
    free: false,
    affiliateAvailable: true,
    verified: true,
    notes_en: "Seed entry — confirm current edition year and ISBN.",
    notes_uk: "Запис seed — підтвердьте рік поточного видання та ISBN.",
  },
  {
    id: "book-002",
    slug: "this-is-not-propaganda-pomerantsev",
    title_en: "This Is Not Propaganda: Adventures in the War Against Reality",
    title_uk: "Це не пропаганда: Пригоди у війні проти реальності",
    author_en: "Peter Pomerantsev",
    author_uk: "Пітер Померанцев",
    description_en:
      "Investigative account of how authoritarian regimes weaponise information, disinformation, and media manipulation — with deep focus on Russia and Ukraine.",
    description_uk:
      "Документальне дослідження того, як авторитарні режими використовують інформацію, дезінформацію та маніпуляції з медіа як зброю — з глибоким акцентом на Росії та Україні.",
    topic: ["disinformation", "geopolitics"],
    format: ["paperback", "ebook", "audiobook"],
    publishedYear: 2019,
    isbn: "978-1-61039-902-8",
    free: false,
    affiliateAvailable: true,
    verified: true,
    notes_en: "Seed entry — essential disinformation reading; confirm affiliate link.",
    notes_uk: "Запис seed — обов'язкове читання з дезінформації; підтвердьте афілійоване посилання.",
  },
  {
    id: "book-003",
    slug: "the-art-of-invisibility-mitnick",
    title_en: "The Art of Invisibility",
    title_uk: "Мистецтво невидимості",
    author_en: "Kevin Mitnick",
    author_uk: "Кевін Митнік",
    description_en:
      "Practical guide to digital privacy and counter-surveillance by legendary hacker Kevin Mitnick — relevant for OSINT practitioners and journalists protecting sources.",
    description_uk:
      "Практичний посібник із цифрової конфіденційності та протидії стеженню від легендарного хакера Кевіна Митніка — актуально для практиків OSINT та журналістів, які захищають джерела.",
    topic: ["osint-field-guide", "cyber-warfare"],
    format: ["paperback", "ebook", "audiobook"],
    publishedYear: 2017,
    isbn: "978-0-316-38099-9",
    free: false,
    affiliateAvailable: true,
    verified: true,
    notes_en: "Seed entry — confirm affiliate availability and current edition.",
    notes_uk: "Запис seed — підтвердьте наявність афілійованого посилання та поточне видання.",
  },
  {
    id: "book-004",
    slug: "sandworm-greenberg",
    title_en: "Sandworm: A New Era of Cyberwar and the Hunt for the Kremlin's Most Dangerous Hackers",
    title_uk: "Sandworm: Нова ера кібервійни та полювання на найнебезпечніших хакерів Кремля",
    author_en: "Andy Greenberg",
    author_uk: "Енді Ґрінберґ",
    description_en:
      "Definitive account of the Sandworm hacker group's destructive cyberattacks against Ukraine and global infrastructure, including the NotPetya operation.",
    description_uk:
      "Вичерпна розповідь про деструктивні кібератаки хакерської групи Sandworm проти України та глобальної інфраструктури, включаючи операцію NotPetya.",
    topic: ["cyber-warfare", "conflict-history", "geopolitics"],
    format: ["paperback", "ebook", "audiobook"],
    publishedYear: 2019,
    isbn: "978-0-385-54440-5",
    free: false,
    affiliateAvailable: true,
    verified: true,
    notes_en: "Seed entry — essential Ukraine-cyber reading.",
    notes_uk: "Запис seed — обов'язкове читання про Україну та кіберзагрози.",
  },
  {
    id: "book-005",
    slug: "bellingcat-higgins",
    title_en: "We Are Bellingcat: An Intelligence Agency for the People",
    title_uk: "Ми — Bellingcat: Розвідувальна агенція для людей",
    author_en: "Eliot Higgins",
    author_uk: "Еліот Гіггінс",
    description_en:
      "Story of the citizen-investigator revolution in OSINT, showing how open-source techniques exposed war crimes and disinformation campaigns in Ukraine, Syria, and beyond.",
    description_uk:
      "Розповідь про революцію громадських слідчих в OSINT, що показує, як відкриті техніки розкривали воєнні злочини та кампанії дезінформації в Україні, Сирії та інших місцях.",
    topic: ["osint-field-guide", "investigative-journalism", "war-crimes"],
    format: ["paperback", "ebook", "audiobook"],
    publishedYear: 2021,
    isbn: "978-1-63557-468-5",
    free: false,
    affiliateAvailable: true,
    verified: true,
    notes_en: "Seed entry — core OSINT community reference.",
    notes_uk: "Запис seed — ключова довідка спільноти OSINT.",
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getBookProfile(slug: string): BookProfile | undefined {
  return BOOK_PROFILES.find((b) => b.slug === slug);
}
