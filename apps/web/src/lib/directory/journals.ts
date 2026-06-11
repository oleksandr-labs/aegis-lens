/**
 * Academic Journals & Publications directory — types, profiles, schema notes, and helper.
 * Директорія академічних журналів та публікацій — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type JournalFocus =
  | "security-studies"
  | "intelligence"
  | "conflict-resolution"
  | "cyber"
  | "osint"
  | "human-rights"
  | "international-relations"
  | "disinformation"
  | "satellite-remote-sensing";

export type JournalAccess =
  | "open-access"
  | "subscription"
  | "hybrid"
  | "institutional-only";

// ---------------------------------------------------------------------------
// JournalProfile interface
// ---------------------------------------------------------------------------

export interface JournalProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  publisher_en: string;
  publisher_uk: string;
  description_en: string;
  description_uk: string;
  focus: JournalFocus[];
  access: JournalAccess;
  impactScore: number | null;
  issn: string | null;
  verified: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const JOURNAL_SCHEMA_NOTE_EN =
  "Schema.org type: Periodical. Include name, issn, publisher (as Organization), about (topics), and url. Individual articles linked from platform reports use Article schema with DOI as identifier.";
export const JOURNAL_SCHEMA_NOTE_UK =
  "Тип schema.org: Periodical. Включати name, issn, publisher (як Organization), about (теми) та url. Окремі статті, пов'язані зі звітами платформи, використовують схему Article з DOI як ідентифікатором.";

export const JOURNAL_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /journals/<focus> (e.g. /journals/intelligence) and /journals/<access> (e.g. /journals/open-access). Cross-linked from relevant pillar pages and research reports.";
export const JOURNAL_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /journals/<focus> (напр. /journals/intelligence) і /journals/<access> (напр. /journals/open-access). Перехресні посилання з відповідних pillar-сторінок та дослідницьких звітів.";

export const JOURNAL_CITATION_NOTE_EN =
  "Journals in this directory are linked from platform research reports via DOI citations. Verified journal entries boost E-E-A-T signals and support structured citation rendering on report pages.";
export const JOURNAL_CITATION_NOTE_UK =
  "Журнали в цій директорії пов'язані зі звітами платформи через DOI-цитування. Верифіковані записи журналів підсилюють сигнали E-E-A-T та підтримують структуроване відображення цитувань на сторінках звітів.";

export const JOURNAL_SEED_NOTE_EN =
  "Seed target: 50–100 key peer-reviewed journals and practitioner publications covering security studies, intelligence, OSINT, cyber, conflict, and remote sensing. Include both open-access and subscription titles.";
export const JOURNAL_SEED_NOTE_UK =
  "Цільовий обсяг seed: 50–100 ключових рецензованих журналів та практичних видань з досліджень безпеки, розвідки, OSINT, кіберзахисту, конфліктів та дистанційного зондування. Включати як відкритий доступ, так і платні видання.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 50–100 entries)
// ---------------------------------------------------------------------------

export const JOURNAL_PROFILES: JournalProfile[] = [
  {
    id: "journal-001",
    slug: "intelligence-and-national-security",
    name_en: "Intelligence and National Security",
    name_uk: "Intelligence and National Security",
    publisher_en: "Taylor & Francis",
    publisher_uk: "Taylor & Francis",
    description_en:
      "Peer-reviewed journal covering intelligence theory, practice, history, and policy across all intelligence disciplines.",
    description_uk:
      "Рецензований журнал з теорії, практики, історії та політики розвідки в усіх розвідувальних дисциплінах.",
    focus: ["intelligence", "security-studies"],
    access: "subscription",
    impactScore: 1.8,
    issn: "0268-4527",
    verified: true,
    notes_en: "Seed entry — confirm current impact score and access model.",
    notes_uk: "Запис seed — підтвердьте поточний індекс впливу та модель доступу.",
  },
  {
    id: "journal-002",
    slug: "journal-of-strategic-studies",
    name_en: "Journal of Strategic Studies",
    name_uk: "Journal of Strategic Studies",
    publisher_en: "Taylor & Francis",
    publisher_uk: "Taylor & Francis",
    description_en:
      "Leading journal on strategy, war, and international security, regularly publishing analysis on the Russia-Ukraine conflict.",
    description_uk:
      "Провідний журнал зі стратегії, війни та міжнародної безпеки, що регулярно публікує аналіз конфлікту Росія–Україна.",
    focus: ["security-studies", "conflict-resolution", "international-relations"],
    access: "subscription",
    impactScore: 2.4,
    issn: "0140-2390",
    verified: true,
    notes_en: "Seed entry — confirm current impact score.",
    notes_uk: "Запис seed — підтвердьте поточний індекс впливу.",
  },
  {
    id: "journal-003",
    slug: "remote-sensing-mdpi",
    name_en: "Remote Sensing (MDPI)",
    name_uk: "Remote Sensing (MDPI)",
    publisher_en: "MDPI",
    publisher_uk: "MDPI",
    description_en:
      "Open-access journal covering satellite imagery, geospatial analysis, and remote sensing applications including conflict zone monitoring.",
    description_uk:
      "Журнал відкритого доступу з супутникових знімків, геопросторового аналізу та застосувань дистанційного зондування, включаючи моніторинг зон конфліктів.",
    focus: ["satellite-remote-sensing", "osint"],
    access: "open-access",
    impactScore: 5.0,
    issn: "2072-4292",
    verified: true,
    notes_en: "Seed entry — open access, high relevance for OSINT satellite work.",
    notes_uk: "Запис seed — відкритий доступ, висока релевантність для OSINT-роботи з супутниками.",
  },
  {
    id: "journal-004",
    slug: "journal-of-cyber-policy",
    name_en: "Journal of Cyber Policy",
    name_uk: "Journal of Cyber Policy",
    publisher_en: "Taylor & Francis",
    publisher_uk: "Taylor & Francis",
    description_en:
      "Interdisciplinary journal bridging cybersecurity, policy, and international relations — covers cyber warfare, digital sovereignty, and offensive cyber operations.",
    description_uk:
      "Міждисциплінарний журнал на перетині кібербезпеки, політики та міжнародних відносин — охоплює кібервійну, цифровий суверенітет та наступальні кіберопераційні дії.",
    focus: ["cyber", "disinformation", "international-relations"],
    access: "hybrid",
    impactScore: null,
    issn: "2373-8871",
    verified: true,
    notes_en: "Seed entry — hybrid access model; impact score not yet widely indexed.",
    notes_uk: "Запис seed — гібридна модель доступу; індекс впливу ще не широко індексується.",
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getJournalProfile(slug: string): JournalProfile | undefined {
  return JOURNAL_PROFILES.find((j) => j.slug === slug);
}
