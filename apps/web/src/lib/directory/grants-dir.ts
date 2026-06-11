/**
 * Grants & Funding directory — types, profiles, schema notes, and helper.
 * Директорія грантів і фінансування — типи, профілі, нотатки схем і хелпер.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type GrantFocus =
  | "journalism"
  | "osint-research"
  | "disinformation-counter"
  | "conflict-documentation"
  | "digital-rights"
  | "humanitarian"
  | "security-research"
  | "academic";

export type GrantFunder =
  | "foundation"
  | "government"
  | "eu-program"
  | "us-government"
  | "bilateral"
  | "corporate-csr"
  | "multilateral-un";

// ---------------------------------------------------------------------------
// GrantProfile interface
// ---------------------------------------------------------------------------

export interface GrantProfile {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  funder_en: string;
  funder_uk: string;
  description_en: string;
  description_uk: string;
  focus: GrantFocus[];
  funderType: GrantFunder;
  amountRangeUsd_en: string;
  amountRangeUsd_uk: string;
  deadlineNote_en: string;
  deadlineNote_uk: string;
  eligibility_en: string;
  eligibility_uk: string;
  /** Placeholder application URL — confirm before publishing. */
  applicationUrl_en: string;
  /** Placeholder application URL — confirm before publishing. */
  applicationUrl_uk: string;
  verified: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Policy and schema notes
// ---------------------------------------------------------------------------

export const GRANT_SCHEMA_NOTE_EN =
  "Schema.org type: Grant (custom type) or Organization as funder. Use 'Grant' as additionalType on a CreativeWork node; include name, funder, amount, and url properties.";
export const GRANT_SCHEMA_NOTE_UK =
  "Тип schema.org: Grant (кастомний тип) або Organization як funder. Використовувати 'Grant' як additionalType на вузлі CreativeWork; включати властивості name, funder, amount і url.";

export const GRANT_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes: /grants/<focus> (e.g. /grants/journalism) and /grants/<funder-type> (e.g. /grants/eu-program). Each route renders a filtered listing page with deadline-aware sorting.";
export const GRANT_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути: /grants/<focus> (напр. /grants/journalism) і /grants/<funder-type> (напр. /grants/eu-program). Кожен маршрут відображає відфільтровану сторінку з сортуванням за дедлайном.";

export const GRANT_DEADLINE_NOTE_EN =
  "Grant deadlines auto-expire: listings are automatically removed 30 days after the stated deadline. Editors must re-add reopened grant cycles as new entries.";
export const GRANT_DEADLINE_NOTE_UK =
  "Дедлайни грантів спливають автоматично: лістинги автоматично видаляються через 30 днів після зазначеного дедлайну. Редактори повинні повторно додавати відновлені цикли грантів як нові записи.";

export const GRANT_SEED_NOTE_EN =
  "Seed target: 100–300 relevant grants for the OSINT, conflict-documentation, investigative journalism, and digital-rights community. Prioritise recurring annual programmes and EU/US government instruments.";
export const GRANT_SEED_NOTE_UK =
  "Цільовий обсяг seed: 100–300 актуальних грантів для спільноти OSINT, документування конфліктів, журналістських розслідувань та цифрових прав. Пріоритет — щорічні програми та інструменти ЄС/уряду США.";

export const GRANT_APP_PLACEHOLDER_NOTE_EN =
  "Application URLs are placeholders. Each must be manually confirmed against the funder's official grant portal before the listing is published.";
export const GRANT_APP_PLACEHOLDER_NOTE_UK =
  "URL-адреси заявок є заглушками. Кожна має бути вручну підтверджена на офіційному грантовому порталі фандера перед публікацією лістингу.";

// ---------------------------------------------------------------------------
// Seed data (illustrative — expand to full 100–300 entries)
// ---------------------------------------------------------------------------

export const GRANT_PROFILES: GrantProfile[] = [
  {
    id: "grant-001",
    slug: "ifj-safety-fund",
    name_en: "IFJ Safety Fund for Journalists",
    name_uk: "Фонд безпеки журналістів МФЖ",
    funder_en: "International Federation of Journalists (IFJ)",
    funder_uk: "Міжнародна федерація журналістів (МФЖ)",
    description_en:
      "Emergency financial support for journalists at risk, including those covering the Ukraine conflict and other high-danger zones.",
    description_uk:
      "Надзвичайна фінансова підтримка журналістам у небезпеці, зокрема тим, хто висвітлює конфлікт в Україні та інші зони підвищеної небезпеки.",
    focus: ["journalism", "conflict-documentation"],
    funderType: "multilateral-un",
    amountRangeUsd_en: "$500–$5,000 per applicant",
    amountRangeUsd_uk: "$500–$5,000 на заявника",
    deadlineNote_en: "Rolling applications — no fixed deadline; reviewed quarterly.",
    deadlineNote_uk: "Заявки приймаються постійно — без фіксованого дедлайну; розглядаються щоквартально.",
    eligibility_en: "IFJ-affiliated union members; journalists covering conflict zones.",
    eligibility_uk: "Члени профспілок, афілійованих з МФЖ; журналісти, що висвітлюють зони конфліктів.",
    applicationUrl_en: "https://www.ifj.org/actions/ifj-safety-fund.html",
    applicationUrl_uk: "https://www.ifj.org/actions/ifj-safety-fund.html",
    verified: true,
    notes_en: "Seed entry — confirm deadline policy and eligibility criteria.",
    notes_uk: "Запис seed — підтвердьте політику дедлайнів та критерії прийнятності.",
  },
  {
    id: "grant-002",
    slug: "horizon-europe-security",
    name_en: "Horizon Europe — Cluster 3 (Civil Security)",
    name_uk: "Horizon Europe — Кластер 3 (Цивільна безпека)",
    funder_en: "European Commission",
    funder_uk: "Європейська комісія",
    description_en:
      "EU research and innovation funding for civil-security topics including disinformation, hybrid threats, and conflict analysis tools.",
    description_uk:
      "Фінансування ЄС на дослідження та інновації у сфері цивільної безпеки, включаючи дезінформацію, гібридні загрози та інструменти аналізу конфліктів.",
    focus: ["disinformation-counter", "security-research", "academic"],
    funderType: "eu-program",
    amountRangeUsd_en: "$500,000–$5,000,000 per project consortium",
    amountRangeUsd_uk: "$500,000–$5,000,000 на консорціум проєкту",
    deadlineNote_en: "Annual calls; typically closes Q1. Check EU Funding & Tenders portal.",
    deadlineNote_uk: "Щорічні конкурси; зазвичай закриваються у Q1. Перевіряйте портал EU Funding & Tenders.",
    eligibility_en: "Research institutions, universities, and civil-society orgs from EU member states or associated countries.",
    eligibility_uk: "Наукові установи, університети та організації громадянського суспільства з країн — членів ЄС або асоційованих країн.",
    applicationUrl_en: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/",
    applicationUrl_uk: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/",
    verified: true,
    notes_en: "Seed entry — verify active call reference numbers each cycle.",
    notes_uk: "Запис seed — перевіряйте референс-номери активних конкурсів щоциклу.",
  },
  {
    id: "grant-003",
    slug: "ned-democracy-fellows",
    name_en: "NED — Reagan-Fascell Democracy Fellows",
    name_uk: "NED — Стипендіати демократії ім. Рейгана–Фасселла",
    funder_en: "National Endowment for Democracy (NED)",
    funder_uk: "Національний фонд демократії (NED)",
    description_en:
      "Fellowship program for civil-society activists, journalists, and academics working on democracy and human rights, including those from Ukraine and Eastern Europe.",
    description_uk:
      "Стипендіальна програма для активістів громадянського суспільства, журналістів та науковців у сфері демократії та прав людини, зокрема з України та Східної Європи.",
    focus: ["journalism", "digital-rights", "conflict-documentation"],
    funderType: "us-government",
    amountRangeUsd_en: "$40,000–$55,000 stipend per fellow (5–10 months)",
    amountRangeUsd_uk: "$40,000–$55,000 стипендія на стипендіата (5–10 місяців)",
    deadlineNote_en: "Annual deadline typically in October. Confirm on NED website each cycle.",
    deadlineNote_uk: "Щорічний дедлайн зазвичай у жовтні. Підтверджуйте на сайті NED щоциклу.",
    eligibility_en: "Non-US citizens working on democracy promotion; based outside the US during fellowship.",
    eligibility_uk: "Не-громадяни США, що працюють над просуванням демократії; перебування за межами США під час стипендії.",
    applicationUrl_en: "https://www.ned.org/fellowships/reagan-fascell-democracy-fellows-program/",
    applicationUrl_uk: "https://www.ned.org/fellowships/reagan-fascell-democracy-fellows-program/",
    verified: true,
    notes_en: "Seed entry — confirm current cycle deadline and stipend amount.",
    notes_uk: "Запис seed — підтвердьте дедлайн поточного циклу та розмір стипендії.",
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getGrantProfile(slug: string): GrantProfile | undefined {
  return GRANT_PROFILES.find((g) => g.slug === slug);
}
