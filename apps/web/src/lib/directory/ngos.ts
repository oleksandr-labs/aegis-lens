/**
 * NGO / Humanitarian Org directory — types, profiles, schema notes, and helper.
 * Директорія НГО / Гуманітарних організацій — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type NgoFocus =
  | "humanitarian-aid"
  | "human-rights"
  | "conflict-monitoring"
  | "disinformation-research"
  | "open-source-investigation"
  | "digital-rights"
  | "refugee-assistance"
  | "reconstruction"
  | "war-crimes-documentation";

export type NgoRegion =
  | "ukraine"
  | "eastern-europe"
  | "middle-east"
  | "africa"
  | "global"
  | "transatlantic";

// ---------------------------------------------------------------------------
// NgoProfile interface
// ---------------------------------------------------------------------------

export interface NgoProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  focus: NgoFocus[];
  region: NgoRegion[];
  founded: number | null;
  country: string;
  verified: boolean;
  /** Placeholder donation/partner URL — confirm before publishing. */
  donationLink_en: string;
  /** Placeholder donation/partner URL — confirm before publishing. */
  donationLink_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const NGO_SCHEMA_NOTE_EN =
  "Schema.org type: NGO rendered as Organization (additionalType: 'NGO'). Include name, description, url, areaServed, and foundingDate where available.";
export const NGO_SCHEMA_NOTE_UK =
  "Тип schema.org: НГО відображається як Organization (additionalType: 'NGO'). Включати name, description, url, areaServed і foundingDate де доступно.";

export const NGO_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /ngos/<focus> (e.g. /ngos/humanitarian-aid) and /ngos/<region> (e.g. /ngos/ukraine). Each route renders a filtered listing page with SEO meta and FAQPage schema.";
export const NGO_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /ngos/<focus> (напр. /ngos/humanitarian-aid) і /ngos/<region> (напр. /ngos/ukraine). Кожен маршрут відображає відфільтровану сторінку з SEO-метою та схемою FAQPage.";

export const NGO_VETTING_NOTE_EN =
  "NGO verification: charity registration number checked against national registrar + active operations confirmed via public reports or partner attestation before 'verified' flag is set.";
export const NGO_VETTING_NOTE_UK =
  "Верифікація НГО: реєстраційний номер благодійної організації перевіряється в національному реєстрі + активна діяльність підтверджується публічними звітами або атестацією партнера перед встановленням прапорця 'verified'.";

export const NGO_SEED_NOTE_EN =
  "Seed target: 200–500 curated NGOs; prioritise organisations active in the Ukraine conflict — conflict monitoring, war-crimes documentation, refugee assistance, and humanitarian aid. Expand globally in phase 2.";
export const NGO_SEED_NOTE_UK =
  "Цільовий обсяг seed: 200–500 відібраних НГО; пріоритет — організації, активні у контексті конфлікту в Україні: моніторинг конфлікту, документування воєнних злочинів, допомога біженцям та гуманітарна підтримка. Глобальне розширення — у фазі 2.";

export const NGO_DONATION_PLACEHOLDER_NOTE_EN =
  "Donation / partnership links are placeholder text. Each must be manually confirmed against the NGO's official website before the listing is published.";
export const NGO_DONATION_PLACEHOLDER_NOTE_UK =
  "Посилання на пожертви / партнерство є текстом-заглушкою. Кожне має бути вручну підтверджено на офіційному сайті НГО перед публікацією лістингу.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 200–500 entries)
// ---------------------------------------------------------------------------

export const NGO_PROFILES: NgoProfile[] = [
  {
    id: "ngo-001",
    slug: "human-rights-watch",
    name_en: "Human Rights Watch",
    name_uk: "Human Rights Watch",
    description_en:
      "International NGO conducting fact-based investigations into human-rights abuses worldwide, including conflict zones such as Ukraine.",
    description_uk:
      "Міжнародна НГО, що проводить документальні розслідування порушень прав людини по всьому світу, зокрема у зонах конфліктів, таких як Україна.",
    focus: ["human-rights", "war-crimes-documentation", "conflict-monitoring"],
    region: ["ukraine", "global"],
    founded: 1978,
    country: "US",
    verified: true,
    donationLink_en: "https://www.hrw.org/get-involved/donate",
    donationLink_uk: "https://www.hrw.org/get-involved/donate",
    notes_en: "Seed entry — verify donation URL and registration number before publishing.",
    notes_uk: "Запис seed — перевірте URL пожертви та реєстраційний номер перед публікацією.",
  },
  {
    id: "ngo-002",
    slug: "ukrainian-helsinki-human-rights-union",
    name_en: "Ukrainian Helsinki Human Rights Union",
    name_uk: "Українська Гельсінська спілка з прав людини",
    description_en:
      "Ukrainian civil-society organisation monitoring human-rights conditions and documenting violations during the armed conflict.",
    description_uk:
      "Українська організація громадянського суспільства, що відстежує стан прав людини та документує порушення під час збройного конфлікту.",
    focus: ["human-rights", "war-crimes-documentation"],
    region: ["ukraine", "eastern-europe"],
    founded: 1990,
    country: "UA",
    verified: true,
    donationLink_en: "https://helsinki.org.ua/en/support/",
    donationLink_uk: "https://helsinki.org.ua/pidtrymaty/",
    notes_en: "Seed entry — confirm active operational status.",
    notes_uk: "Запис seed — підтвердьте активний операційний статус.",
  },
  {
    id: "ngo-003",
    slug: "msf-ukraine",
    name_en: "Médecins Sans Frontières (MSF) — Ukraine",
    name_uk: "Лікарі без кордонів (MSF) — Україна",
    description_en:
      "Emergency humanitarian medical care in conflict-affected regions of Ukraine, including trauma surgery and mental health support.",
    description_uk:
      "Надання невідкладної гуманітарної медичної допомоги в постраждалих від конфлікту регіонах України, включаючи травматологічну хірургію та психологічну підтримку.",
    focus: ["humanitarian-aid", "refugee-assistance"],
    region: ["ukraine"],
    founded: 1971,
    country: "FR",
    verified: true,
    donationLink_en: "https://www.msf.org/donate",
    donationLink_uk: "https://www.msf.org/donate",
    notes_en: "Seed entry — global org with Ukraine-specific operations.",
    notes_uk: "Запис seed — глобальна організація з Україна-специфічними операціями.",
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getNgoProfile(slug: string): NgoProfile | undefined {
  return NGO_PROFILES.find((n) => n.slug === slug);
}
