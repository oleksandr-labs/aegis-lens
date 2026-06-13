// Takedown / Retraction Public Report
// Quarterly public statistics on takedowns, retractions, and corrections.
// Provides per-quarter counts + categories, anonymized per-source breakdown,
// per-jurisdiction breakdown, per-retraction-reason categories, a
// time-to-resolution distribution, the /transparency/takedowns page descriptor,
// and a rolling 4-quarter chart configuration. Bilingual EN + UK.

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export type TakedownCategory =
  | "legal-obligation"
  | "policy-violation"
  | "court-order"
  | "privacy-request"
  | "rights-holder-claim";

export type RetractionReason =
  | "source-error"
  | "misidentification"
  | "geolocation-error"
  | "fabricated-source"
  | "context-correction"
  | "duplicate";

export type Jurisdiction = string; // ISO 3166-1 alpha-2 or "intl"

// Time-to-resolution distribution buckets (in days).
export type ResolutionBucket =
  | "<1d"
  | "1-3d"
  | "4-7d"
  | "8-30d"
  | ">30d";

// Per-quarter counts + categories.
export interface QuarterlyTakedownStats {
  year: number;
  quarter: Quarter;
  totalTakedowns: number;
  totalRetractions: number;
  byCategory: Record<TakedownCategory, number>;
  appealsReceived: number;
  appealsUpheld: number;
}

// Per-source breakdown (anonymized — sources are bucketed by type, never named).
export type AnonymizedSourceType =
  | "news-outlet"
  | "social-media"
  | "government-db"
  | "satellite-provider"
  | "user-submission"
  | "other-osint";

export interface PerSourceBreakdown {
  sourceType: AnonymizedSourceType;
  takedowns: number;
  retractions: number;
  label_en: string;
  label_uk: string;
}

// Per-jurisdiction breakdown.
export interface PerJurisdictionBreakdown {
  jurisdiction: Jurisdiction;
  takedowns: number;
  byCategory: Record<TakedownCategory, number>;
}

// Per-retraction-reason category breakdown.
export interface PerRetractionReasonBreakdown {
  reason: RetractionReason;
  count: number;
  label_en: string;
  label_uk: string;
}

// Time-to-resolution distribution.
export interface ResolutionDistribution {
  bucket: ResolutionBucket;
  count: number;
  label_en: string;
  label_uk: string;
}

export const RESOLUTION_BUCKETS: ResolutionDistribution[] = [
  { bucket: "<1d", count: 0, label_en: "Under 1 day", label_uk: "Менше 1 дня" },
  { bucket: "1-3d", count: 0, label_en: "1 to 3 days", label_uk: "1–3 дні" },
  { bucket: "4-7d", count: 0, label_en: "4 to 7 days", label_uk: "4–7 днів" },
  { bucket: "8-30d", count: 0, label_en: "8 to 30 days", label_uk: "8–30 днів" },
  { bucket: ">30d", count: 0, label_en: "Over 30 days", label_uk: "Понад 30 днів" },
];

export const TAKEDOWN_CATEGORY_LABELS_EN: Record<TakedownCategory, string> = {
  "legal-obligation": "Legal obligation",
  "policy-violation": "Policy violation",
  "court-order": "Court order",
  "privacy-request": "Privacy request",
  "rights-holder-claim": "Rights-holder claim",
};

export const TAKEDOWN_CATEGORY_LABELS_UK: Record<TakedownCategory, string> = {
  "legal-obligation": "Юридичне зобов'язання",
  "policy-violation": "Порушення політики",
  "court-order": "Судовий наказ",
  "privacy-request": "Запит про приватність",
  "rights-holder-claim": "Претензія правовласника",
};

export const PER_SOURCE_BREAKDOWN_TEMPLATE: PerSourceBreakdown[] = [
  { sourceType: "news-outlet", takedowns: 0, retractions: 0, label_en: "News outlets", label_uk: "Новинні видання" },
  { sourceType: "social-media", takedowns: 0, retractions: 0, label_en: "Social media", label_uk: "Соціальні мережі" },
  { sourceType: "government-db", takedowns: 0, retractions: 0, label_en: "Government databases", label_uk: "Урядові бази даних" },
  { sourceType: "satellite-provider", takedowns: 0, retractions: 0, label_en: "Satellite providers", label_uk: "Постачальники супутникових знімків" },
  { sourceType: "user-submission", takedowns: 0, retractions: 0, label_en: "User submissions", label_uk: "Подання користувачів" },
  { sourceType: "other-osint", takedowns: 0, retractions: 0, label_en: "Other OSINT", label_uk: "Інші відкриті джерела" },
];

export const PER_RETRACTION_REASON_TEMPLATE: PerRetractionReasonBreakdown[] = [
  { reason: "source-error", count: 0, label_en: "Source was in error", label_uk: "Помилка джерела" },
  { reason: "misidentification", count: 0, label_en: "Entity misidentification", label_uk: "Хибна ідентифікація сутності" },
  { reason: "geolocation-error", count: 0, label_en: "Geolocation error", label_uk: "Помилка геолокації" },
  { reason: "fabricated-source", count: 0, label_en: "Fabricated / staged source", label_uk: "Сфабриковане / постановочне джерело" },
  { reason: "context-correction", count: 0, label_en: "Context correction", label_uk: "Виправлення контексту" },
  { reason: "duplicate", count: 0, label_en: "Duplicate of an existing item", label_uk: "Дублікат наявного елемента" },
];

// Canonical empty per-quarter stats template.
export const QUARTERLY_TAKEDOWN_TEMPLATE: QuarterlyTakedownStats = {
  year: new Date().getFullYear(),
  quarter: "Q1",
  totalTakedowns: 0,
  totalRetractions: 0,
  byCategory: {
    "legal-obligation": 0,
    "policy-violation": 0,
    "court-order": 0,
    "privacy-request": 0,
    "rights-holder-claim": 0,
  },
  appealsReceived: 0,
  appealsUpheld: 0,
};

// /transparency/takedowns page descriptor.
export interface TakedownPageDescriptor {
  path: "/transparency/takedowns";
  cadence: "quarterly";
  locales: string[];
  sections: string[];
  title_en: string;
  title_uk: string;
  intro_en: string;
  intro_uk: string;
}

export const TAKEDOWN_PAGE_DESCRIPTOR: TakedownPageDescriptor = {
  path: "/transparency/takedowns",
  cadence: "quarterly",
  locales: ["en", "uk"],
  sections: [
    "quarter-summary",
    "per-source-breakdown",
    "per-jurisdiction-breakdown",
    "retraction-reasons",
    "time-to-resolution",
    "rolling-4-quarter-chart",
  ],
  title_en: "Takedowns & Retractions",
  title_uk: "Видалення та спростування",
  intro_en:
    "Each quarter we publish how much content we removed or restricted and how many published items we retracted or corrected, broken down by category, anonymized source type, jurisdiction, retraction reason, and time to resolution. Publishing every retraction strengthens credibility; hiding them does not.",
  intro_uk:
    "Щокварталу ми публікуємо, скільки контенту ми видалили чи обмежили та скільки опублікованих елементів ми відкликали чи виправили, з розбивкою за категорією, анонімізованим типом джерела, юрисдикцією, причиною спростування та часом до вирішення. Публікація кожного спростування зміцнює довіру; приховування — ні.",
};

// Rolling 4-quarter chart config.
export interface RollingQuarterChartConfig {
  windowQuarters: 4;
  series: ("takedowns" | "retractions" | "appealsUpheld")[];
  chartType: "stacked-bar";
  xAxis: "quarter";
  description_en: string;
  description_uk: string;
}

export const ROLLING_QUARTER_CHART_CONFIG: RollingQuarterChartConfig = {
  windowQuarters: 4,
  series: ["takedowns", "retractions", "appealsUpheld"],
  chartType: "stacked-bar",
  xAxis: "quarter",
  description_en:
    "A rolling chart of the most recent four quarters showing takedowns, retractions, and upheld appeals side by side, so trends and seasonality are visible at a glance.",
  description_uk:
    "Ковзний графік чотирьох останніх кварталів, що показує видалення, спростування та задоволені апеляції поряд, щоб тренди та сезонність були видні з першого погляду.",
};

export const TAKEDOWN_REPORT_SUMMARY_EN =
  "We publish quarterly takedown and retraction statistics at /transparency/takedowns: per-quarter counts and categories, an anonymized per-source-type breakdown, a per-jurisdiction breakdown, per-retraction-reason categories, a time-to-resolution distribution, and a rolling four-quarter chart.";

export const TAKEDOWN_REPORT_SUMMARY_UK =
  "Ми публікуємо квартальну статистику видалень і спростувань на /transparency/takedowns: кількість і категорії за кварталами, анонімізовану розбивку за типом джерела, розбивку за юрисдикціями, категорії причин спростувань, розподіл часу до вирішення та ковзний графік чотирьох кварталів.";
