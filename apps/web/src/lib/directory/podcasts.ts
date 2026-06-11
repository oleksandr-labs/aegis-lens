/**
 * Podcasts directory — types, profiles, schema notes, and helper.
 * Директорія подкастів — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type PodcastTopic =
  | "osint"
  | "conflict-analysis"
  | "cybersecurity"
  | "disinformation"
  | "intelligence"
  | "humanitarian"
  | "geopolitics"
  | "investigative-journalism";

export type PodcastLanguage =
  | "en"
  | "uk"
  | "de"
  | "pl"
  | "fr"
  | "ar"
  | "ru-diaspora";

// ---------------------------------------------------------------------------
// PodcastProfile interface
// ---------------------------------------------------------------------------

export interface PodcastProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  host_en: string;
  host_uk: string;
  description_en: string;
  description_uk: string;
  topics: PodcastTopic[];
  language: PodcastLanguage;
  episodeCount: number | null;
  frequency_en: string;
  frequency_uk: string;
  free: boolean;
  /** Placeholder RSS feed URL — verify before publishing. */
  feedUrl_en: string;
  /** Placeholder RSS feed URL — verify before publishing. */
  feedUrl_uk: string;
  verified: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const PODCAST_SCHEMA_NOTE_EN =
  "Schema.org types: PodcastSeries (for the show) and PodcastEpisode (for individual episodes). PodcastSeries fields: name, description, webFeed, author, publisher, image, inLanguage. PodcastEpisode fields: name, description, datePublished, duration (ISO 8601), associatedMedia (AudioObject with contentUrl).";
export const PODCAST_SCHEMA_NOTE_UK =
  "Типи schema.org: PodcastSeries (для шоу) та PodcastEpisode (для окремих епізодів). Поля PodcastSeries: name, description, webFeed, author, publisher, image, inLanguage. Поля PodcastEpisode: name, description, datePublished, duration (ISO 8601), associatedMedia (AudioObject з contentUrl).";

export const PODCAST_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /podcasts-directory/<topic> (e.g. /podcasts-directory/osint) and /podcasts-directory/<language> (e.g. /podcasts-directory/uk). Each route renders a filtered listing with SEO meta, FAQPage schema, and a 'Best intel podcasts for <topic>' H1 for listicle SEO.";
export const PODCAST_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /podcasts-directory/<topic> (напр. /podcasts-directory/osint) та /podcasts-directory/<language> (напр. /podcasts-directory/uk). Кожен маршрут відображає відфільтрований список із SEO-метою, схемою FAQPage та H1 'Найкращі подкасти з розвідки для <topic>' для SEO-лістинклів.";

export const PODCAST_SEED_NOTE_EN =
  "Seed target: 50–150 curated OSINT / intelligence / geopolitics podcasts. Priority shows: Risky Business, Darknet Diaries, The Spy Cast (SPYMUSEUM), The Intelligence (The Economist), Lawfare Podcast, War on the Rocks, The Bellingcat Podcast, Meduza In Context (ru-diaspora), Hromadske Radio (uk), Interpreter Mag Podcast, Ukraine in Focus, CyberWire Daily, OSINT Curious, Recorded Future The Record.";
export const PODCAST_SEED_NOTE_UK =
  "Цільовий обсяг seed: 50–150 відібраних подкастів з OSINT / розвідки / геополітики. Пріоритетні шоу: Risky Business, Darknet Diaries, The Spy Cast (SPYMUSEUM), The Intelligence (The Economist), Lawfare Podcast, War on the Rocks, The Bellingcat Podcast, Meduza In Context (ru-diaspora), Hromadske Radio (uk), Interpreter Mag Podcast, Ukraine in Focus, CyberWire Daily, OSINT Curious, Recorded Future The Record.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 50–150 entries)
// ---------------------------------------------------------------------------

export const PODCAST_PROFILES: PodcastProfile[] = [
  {
    id: "podcast-001",
    slug: "darknet-diaries",
    name_en: "Darknet Diaries",
    name_uk: "Darknet Diaries",
    host_en: "Jack Rhysider",
    host_uk: "Jack Rhysider",
    description_en:
      "True stories from the dark side of the internet — cybercrime, hackers, espionage, and OSINT-rich investigations into digital underworlds.",
    description_uk:
      "Реальні історії з темного боку інтернету — кіберзлочинність, хакери, шпигунство та OSINT-насичені розслідування цифрових підпілль.",
    topics: ["cybersecurity", "intelligence", "investigative-journalism"],
    language: "en",
    episodeCount: 140,
    frequency_en: "Monthly",
    frequency_uk: "Щомісяця",
    free: true,
    feedUrl_en: "https://darknetdiaries.com/feed/mp3/",
    feedUrl_uk: "https://darknetdiaries.com/feed/mp3/",
    verified: true,
    notes_en: "Seed entry — episode count approximate; verify current feed URL.",
    notes_uk: "Запис seed — кількість епізодів приблизна; перевірте поточний URL стрічки.",
  },
  {
    id: "podcast-002",
    slug: "war-on-the-rocks",
    name_en: "War on the Rocks",
    name_uk: "War on the Rocks",
    host_en: "Ryan Evans & Guests",
    host_uk: "Ryan Evans та гості",
    description_en:
      "Weekly podcast from the War on the Rocks platform featuring analysis of national security, military strategy, conflict reporting, and geopolitics.",
    description_uk:
      "Щотижневий подкаст платформи War on the Rocks з аналізом національної безпеки, військової стратегії, репортажів про конфлікти та геополітики.",
    topics: ["intelligence", "conflict-analysis", "geopolitics"],
    language: "en",
    episodeCount: null,
    frequency_en: "Weekly",
    frequency_uk: "Щотижня",
    free: true,
    feedUrl_en: "https://warontherocks.com/feed/podcast/",
    feedUrl_uk: "https://warontherocks.com/feed/podcast/",
    verified: true,
    notes_en: "Seed entry — confirm feed URL before publishing.",
    notes_uk: "Запис seed — підтвердьте URL стрічки перед публікацією.",
  },
  {
    id: "podcast-003",
    slug: "hromadske-radio",
    name_en: "Hromadske Radio",
    name_uk: "Громадське Радіо",
    host_en: "Hromadske editorial team",
    host_uk: "Редакція Громадського радіо",
    description_en:
      "Ukrainian public radio covering conflict reporting, humanitarian issues, and investigative journalism from inside Ukraine.",
    description_uk:
      "Українське громадське радіо, що висвітлює репортажі про конфлікт, гуманітарні питання та журналістику розслідувань зсередини України.",
    topics: ["conflict-analysis", "humanitarian", "investigative-journalism"],
    language: "uk",
    episodeCount: null,
    frequency_en: "Daily",
    frequency_uk: "Щодня",
    free: true,
    feedUrl_en: "https://hromadske.radio/feed/podcast",
    feedUrl_uk: "https://hromadske.radio/feed/podcast",
    verified: true,
    notes_en: "Seed entry — Ukrainian-language content; confirm feed URL.",
    notes_uk: "Запис seed — контент українською мовою; підтвердьте URL стрічки.",
  },
];

// ---------------------------------------------------------------------------
// Podcast topic config (drives programmatic pages)
// ---------------------------------------------------------------------------

export const PODCAST_TOPIC_CONFIG = [
  {
    slug: "osint",
    label_en: "OSINT",
    label_uk: "OSINT",
    description_en: "Podcasts dedicated to open-source intelligence tools and tradecraft.",
    description_uk: "Подкасти, присвячені інструментам і методам OSINT.",
  },
  {
    slug: "conflict-analysis",
    label_en: "Conflict Analysis",
    label_uk: "Аналіз конфліктів",
    description_en: "Deep analysis of armed conflicts, war strategy, and battlefield reporting.",
    description_uk: "Глибокий аналіз збройних конфліктів, воєнної стратегії та репортажів із поля бою.",
  },
  {
    slug: "cybersecurity",
    label_en: "Cybersecurity",
    label_uk: "Кібербезпека",
    description_en: "Cybercrime, hacking, threat intelligence, and digital defence podcasts.",
    description_uk: "Подкасти про кіберзлочинність, хакінг, розвідку загроз і цифровий захист.",
  },
  {
    slug: "disinformation",
    label_en: "Disinformation",
    label_uk: "Дезінформація",
    description_en: "Influence operations, propaganda, and information warfare analysis.",
    description_uk: "Аналіз операцій впливу, пропаганди та інформаційних воєн.",
  },
  {
    slug: "intelligence",
    label_en: "Intelligence",
    label_uk: "Розвідка",
    description_en: "Espionage, signals intelligence, and geopolitical intelligence analysis.",
    description_uk: "Шпигунство, радіоелектронна розвідка та аналіз геополітичної розвідки.",
  },
  {
    slug: "humanitarian",
    label_en: "Humanitarian",
    label_uk: "Гуманітарна сфера",
    description_en: "Podcasts covering humanitarian crises, aid, and displacement.",
    description_uk: "Подкасти про гуманітарні кризи, допомогу та переміщення населення.",
  },
  {
    slug: "geopolitics",
    label_en: "Geopolitics",
    label_uk: "Геополітика",
    description_en: "International relations, power dynamics, and regional security analysis.",
    description_uk: "Міжнародні відносини, динаміка сил і регіональна безпека.",
  },
  {
    slug: "investigative-journalism",
    label_en: "Investigative Journalism",
    label_uk: "Журналістика розслідувань",
    description_en: "Behind-the-scenes reporting from investigative journalists worldwide.",
    description_uk: "Репортажі журналістів-розслідувачів з усього світу, що розкривають таємниці.",
  },
] as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getPodcastProfile(slug: string): PodcastProfile | undefined {
  return PODCAST_PROFILES.find((p) => p.slug === slug);
}
