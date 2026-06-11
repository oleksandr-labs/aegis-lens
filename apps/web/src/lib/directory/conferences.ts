/**
 * Conferences directory — types, profiles, schema notes, and helper.
 * Директорія конференцій — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type ConferenceFormat = "in-person" | "virtual" | "hybrid";

export type ConferenceFocus =
  | "osint"
  | "cybersecurity"
  | "intelligence"
  | "conflict-reporting"
  | "open-source-investigation"
  | "satellite"
  | "disinformation"
  | "humanitarian";

// ---------------------------------------------------------------------------
// ConferenceProfile interface
// ---------------------------------------------------------------------------

export interface ConferenceProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  format: ConferenceFormat;
  focus: ConferenceFocus[];
  locationCity: string | null;
  locationCountry: string | null;
  /** Month number 1–12 when the conference typically occurs, or null if varies. */
  annualMonth: number | null;
  /** Placeholder — verify before publishing. */
  websiteUrl_en: string;
  /** Placeholder — verify before publishing. */
  websiteUrl_uk: string;
  freeToAttend: boolean;
  ticketPriceRange_en: string;
  ticketPriceRange_uk: string;
  verified: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const CONFERENCE_SCHEMA_NOTE_EN =
  "Schema.org type: Event. Required fields — name, startDate, endDate, location (PostalAddress or VirtualLocation), eventAttendanceMode (OnlineEventAttendanceMode / OfflineEventAttendanceMode / MixedEventAttendanceMode), organizer, url, and offers (price, priceCurrency). Add eventStatus: EventScheduled when confirmed.";
export const CONFERENCE_SCHEMA_NOTE_UK =
  "Тип schema.org: Event. Обов'язкові поля — name, startDate, endDate, location (PostalAddress або VirtualLocation), eventAttendanceMode (OnlineEventAttendanceMode / OfflineEventAttendanceMode / MixedEventAttendanceMode), organizer, url та offers (price, priceCurrency). Додавати eventStatus: EventScheduled після підтвердження.";

export const CONFERENCE_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /conferences/<year> (e.g. /conferences/2025) for upcoming or archived events; /conferences/<focus> (e.g. /conferences/osint) for topic-filtered listings. Each route renders SEO meta + FAQPage schema with common attendee questions.";
export const CONFERENCE_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /conferences/<year> (напр. /conferences/2025) для майбутніх або архівних заходів; /conferences/<focus> (напр. /conferences/osint) для тематично відфільтрованих списків. Кожен маршрут містить SEO-метадані + схему FAQPage із поширеними запитаннями учасників.";

export const CONFERENCE_SEED_NOTE_EN =
  "Seed target: 50–100 curated OSINT / intelligence / security conferences globally. Priority: OSINT:Summit, DEF CON, Black Hat, CyberWarCon, RightsCon, NICAR, IRE, Investigate Europe, NATO STRATCOM events, EU DisinfoLab conference, SANS OSINT Summit, Bellingcat workshops, GIJN Global Investigative Journalism Conference.";
export const CONFERENCE_SEED_NOTE_UK =
  "Цільовий обсяг seed: 50–100 відібраних конференцій з OSINT / розвідки / безпеки по всьому світу. Пріоритет: OSINT:Summit, DEF CON, Black Hat, CyberWarCon, RightsCon, NICAR, IRE, Investigate Europe, заходи NATO STRATCOM, конференція EU DisinfoLab, SANS OSINT Summit, воркшопи Bellingcat, GIJN Global Investigative Journalism Conference.";

export const CONFERENCE_REVIEWS_NOTE_EN =
  "Attendee reviews cover: speaker quality, networking opportunities, content depth, workshop hands-on value, ticket price vs. value, venue accessibility, and online experience quality for hybrid/virtual editions. Reviews link to verified attendee profiles where available.";
export const CONFERENCE_REVIEWS_NOTE_UK =
  "Відгуки учасників охоплюють: якість доповідачів, можливості для нетворкінгу, глибину контенту, практичну цінність воркшопів, відповідність ціни квитка цінності, доступність майданчика та якість онлайн-досвіду для гібридних/віртуальних видань. Відгуки посилаються на верифіковані профілі учасників там, де доступно.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 50–100 entries)
// ---------------------------------------------------------------------------

export const CONFERENCE_PROFILES: ConferenceProfile[] = [
  {
    id: "conf-001",
    slug: "osint-summit",
    name_en: "OSINT:Summit",
    name_uk: "OSINT:Summit",
    description_en:
      "Annual virtual conference dedicated to open-source intelligence tradecraft, featuring practitioners from government, journalism, and the private sector.",
    description_uk:
      "Щорічна віртуальна конференція, присвячена методам OSINT, де виступають практики з державного сектора, журналістики та бізнесу.",
    format: "virtual",
    focus: ["osint", "open-source-investigation"],
    locationCity: null,
    locationCountry: null,
    annualMonth: 1,
    websiteUrl_en: "https://www.sans.org/osint-summit/",
    websiteUrl_uk: "https://www.sans.org/osint-summit/",
    freeToAttend: false,
    ticketPriceRange_en: "$0–$500 depending on tier",
    ticketPriceRange_uk: "$0–$500 залежно від рівня",
    verified: true,
    notes_en: "Seed entry — confirm next event date and pricing before publishing.",
    notes_uk: "Запис seed — підтвердьте дату наступного заходу та ціни перед публікацією.",
  },
  {
    id: "conf-002",
    slug: "def-con",
    name_en: "DEF CON",
    name_uk: "DEF CON",
    description_en:
      "One of the world's largest hacker conventions, held annually in Las Vegas. Covers cybersecurity, OSINT, hardware hacking, and intelligence topics.",
    description_uk:
      "Одна з найбільших у світі хакерських конвенцій, що проводиться щороку в Лас-Вегасі. Охоплює кібербезпеку, OSINT, апаратний хакінг та теми розвідки.",
    format: "in-person",
    focus: ["cybersecurity", "osint", "intelligence"],
    locationCity: "Las Vegas",
    locationCountry: "US",
    annualMonth: 8,
    websiteUrl_en: "https://defcon.org/",
    websiteUrl_uk: "https://defcon.org/",
    freeToAttend: false,
    ticketPriceRange_en: "$360–$440 (cash at door)",
    ticketPriceRange_uk: "$360–$440 (готівка на місці)",
    verified: true,
    notes_en: "Seed entry — cash-only ticketing; check badge pricing each year.",
    notes_uk: "Запис seed — квитки лише за готівку; перевіряйте вартість кожного року.",
  },
  {
    id: "conf-003",
    slug: "gijn-conference",
    name_en: "GIJN Global Investigative Journalism Conference",
    name_uk: "Глобальна конференція GIJN з журналістики розслідувань",
    description_en:
      "Biennial gathering of investigative journalists worldwide, covering OSINT, data journalism, conflict reporting, and cross-border collaboration.",
    description_uk:
      "Дворічна зустріч журналістів-розслідувачів з усього світу, що охоплює OSINT, журналістику даних, репортажі про конфлікти та транскордонне співробітництво.",
    format: "in-person",
    focus: ["osint", "conflict-reporting", "open-source-investigation", "disinformation"],
    locationCity: null,
    locationCountry: null,
    annualMonth: 9,
    websiteUrl_en: "https://gijn.org/conference/",
    websiteUrl_uk: "https://gijn.org/conference/",
    freeToAttend: false,
    ticketPriceRange_en: "$400–$800 (scholarships available)",
    ticketPriceRange_uk: "$400–$800 (доступні стипендії)",
    verified: true,
    notes_en: "Seed entry — biennial; confirm year of next edition.",
    notes_uk: "Запис seed — дворічна; підтвердьте рік наступного видання.",
  },
];

// ---------------------------------------------------------------------------
// Conference category config (drives programmatic pages)
// ---------------------------------------------------------------------------

export const CONFERENCE_FOCUS_CONFIG = [
  {
    slug: "osint",
    label_en: "OSINT",
    label_uk: "OSINT",
    description_en: "Open-source intelligence conferences for practitioners and researchers.",
    description_uk: "Конференції з відкритих джерел розвідки для практиків і дослідників.",
  },
  {
    slug: "cybersecurity",
    label_en: "Cybersecurity",
    label_uk: "Кібербезпека",
    description_en: "Conferences covering cyber threats, defence, and offensive security.",
    description_uk: "Конференції з кіберзагроз, захисту та наступальної безпеки.",
  },
  {
    slug: "intelligence",
    label_en: "Intelligence",
    label_uk: "Розвідка",
    description_en: "Events focused on intelligence tradecraft, analysis, and policy.",
    description_uk: "Заходи, присвячені методам розвідки, аналізу та політиці.",
  },
  {
    slug: "conflict-reporting",
    label_en: "Conflict Reporting",
    label_uk: "Репортажі про конфлікти",
    description_en: "Conferences for journalists and researchers covering armed conflicts.",
    description_uk: "Конференції для журналістів і дослідників, що висвітлюють збройні конфлікти.",
  },
  {
    slug: "open-source-investigation",
    label_en: "Open-Source Investigation",
    label_uk: "Розслідування з відкритих джерел",
    description_en: "Events dedicated to open-source investigative methodologies.",
    description_uk: "Заходи, присвячені методологіям розслідувань із відкритих джерел.",
  },
  {
    slug: "satellite",
    label_en: "Satellite & Geospatial",
    label_uk: "Супутникові та геопросторові дані",
    description_en: "Conferences on satellite imagery analysis and geospatial intelligence.",
    description_uk: "Конференції з аналізу супутникових знімків та геопросторової розвідки.",
  },
  {
    slug: "disinformation",
    label_en: "Disinformation",
    label_uk: "Дезінформація",
    description_en: "Events covering influence operations, mis/disinformation research.",
    description_uk: "Заходи з операцій впливу та дослідження дезінформації.",
  },
  {
    slug: "humanitarian",
    label_en: "Humanitarian",
    label_uk: "Гуманітарна сфера",
    description_en: "Conferences on humanitarian response, aid, and crisis coordination.",
    description_uk: "Конференції з гуманітарного реагування, допомоги та координації в кризах.",
  },
] as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getConferenceProfile(slug: string): ConferenceProfile | undefined {
  return CONFERENCE_PROFILES.find((c) => c.slug === slug);
}
