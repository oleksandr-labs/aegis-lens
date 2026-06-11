/**
 * Ukrhydromet (Ukrainian Hydrometeorological Center / meteo.gov.ua) source types.
 *
 * Covers three product surfaces:
 *   1. Forecasts        — daily/period forecasts per oblast centre.
 *   2. Severe warnings  — per-oblast storm warnings with a colour/level taxonomy
 *                         aligned to the EU Meteoalarm convention used by UHMC.
 *   3. Hydrology        — river-gauge water levels + derived flood risk.
 *
 * Oblast geography is shared with @ua-map/civilian-alerts (OBLASTS / OblastCode);
 * we re-declare the codes here so this package stays self-contained (the brief's
 * "additive only / import only what exists" rule — no hard dep on civilian-alerts).
 */

// ── Oblast geography (ISO 3166-2:UA) ────────────────────────────────────────────

/** ISO 3166-2:UA oblast codes + Kyiv/Sevastopol cities (mirrors civilian-alerts). */
export type OblastCode =
  | "UA-43" // Autonomous Republic of Crimea
  | "UA-71" // Cherkasy
  | "UA-74" // Chernihiv
  | "UA-77" // Chernivtsi
  | "UA-12" // Dnipropetrovsk
  | "UA-14" // Donetsk
  | "UA-26" // Ivano-Frankivsk
  | "UA-63" // Kharkiv
  | "UA-65" // Kherson
  | "UA-68" // Khmelnytskyi
  | "UA-35" // Kirovohrad
  | "UA-30" // Kyiv city
  | "UA-32" // Kyiv oblast
  | "UA-09" // Luhansk
  | "UA-46" // Lviv
  | "UA-48" // Mykolaiv
  | "UA-51" // Odesa
  | "UA-53" // Poltava
  | "UA-56" // Rivne
  | "UA-40" // Sevastopol
  | "UA-59" // Sumy
  | "UA-61" // Ternopil
  | "UA-05" // Vinnytsia
  | "UA-07" // Volyn
  | "UA-21" // Zakarpattia
  | "UA-23" // Zaporizhzhia
  | "UA-18"; // Zhytomyr

export interface OblastGeo {
  code: OblastCode;
  nameUk: string;
  nameEn: string;
  /** Oblast centre [lon, lat] (WGS-84). */
  center: [number, number];
}

/** Oblast centres used for forecast sampling + warning placement. */
export const OBLAST_GEO: Record<OblastCode, OblastGeo> = {
  "UA-43": { code: "UA-43", nameUk: "АРК",              nameEn: "Crimea",          center: [34.10, 45.31] },
  "UA-71": { code: "UA-71", nameUk: "Черкаська",         nameEn: "Cherkasy",        center: [31.97, 49.44] },
  "UA-74": { code: "UA-74", nameUk: "Чернігівська",      nameEn: "Chernihiv",       center: [31.29, 51.50] },
  "UA-77": { code: "UA-77", nameUk: "Чернівецька",       nameEn: "Chernivtsi",      center: [25.94, 48.29] },
  "UA-12": { code: "UA-12", nameUk: "Дніпропетровська",  nameEn: "Dnipropetrovsk",  center: [35.04, 48.46] },
  "UA-14": { code: "UA-14", nameUk: "Донецька",          nameEn: "Donetsk",         center: [37.80, 48.01] },
  "UA-26": { code: "UA-26", nameUk: "Івано-Франківська", nameEn: "Ivano-Frankivsk", center: [24.71, 48.92] },
  "UA-63": { code: "UA-63", nameUk: "Харківська",        nameEn: "Kharkiv",         center: [36.23, 49.99] },
  "UA-65": { code: "UA-65", nameUk: "Херсонська",        nameEn: "Kherson",         center: [32.61, 46.64] },
  "UA-68": { code: "UA-68", nameUk: "Хмельницька",       nameEn: "Khmelnytskyi",    center: [26.99, 49.42] },
  "UA-35": { code: "UA-35", nameUk: "Кіровоградська",    nameEn: "Kirovohrad",      center: [32.26, 48.51] },
  "UA-30": { code: "UA-30", nameUk: "Київ",              nameEn: "Kyiv city",       center: [30.52, 50.45] },
  "UA-32": { code: "UA-32", nameUk: "Київська",          nameEn: "Kyiv oblast",     center: [30.57, 50.07] },
  "UA-09": { code: "UA-09", nameUk: "Луганська",         nameEn: "Luhansk",         center: [38.92, 48.57] },
  "UA-46": { code: "UA-46", nameUk: "Львівська",         nameEn: "Lviv",            center: [24.03, 49.84] },
  "UA-48": { code: "UA-48", nameUk: "Миколаївська",      nameEn: "Mykolaiv",        center: [31.99, 47.05] },
  "UA-51": { code: "UA-51", nameUk: "Одеська",           nameEn: "Odesa",           center: [30.74, 46.49] },
  "UA-53": { code: "UA-53", nameUk: "Полтавська",        nameEn: "Poltava",         center: [34.55, 49.59] },
  "UA-56": { code: "UA-56", nameUk: "Рівненська",        nameEn: "Rivne",           center: [26.25, 50.62] },
  "UA-40": { code: "UA-40", nameUk: "Севастополь",       nameEn: "Sevastopol",      center: [33.53, 44.60] },
  "UA-59": { code: "UA-59", nameUk: "Сумська",           nameEn: "Sumy",            center: [34.80, 51.02] },
  "UA-61": { code: "UA-61", nameUk: "Тернопільська",     nameEn: "Ternopil",        center: [25.60, 49.55] },
  "UA-05": { code: "UA-05", nameUk: "Вінницька",         nameEn: "Vinnytsia",       center: [28.47, 49.23] },
  "UA-07": { code: "UA-07", nameUk: "Волинська",         nameEn: "Volyn",           center: [25.33, 51.25] },
  "UA-21": { code: "UA-21", nameUk: "Закарпатська",      nameEn: "Zakarpattia",     center: [22.29, 48.62] },
  "UA-23": { code: "UA-23", nameUk: "Запорізька",        nameEn: "Zaporizhzhia",    center: [35.17, 47.84] },
  "UA-18": { code: "UA-18", nameUk: "Житомирська",       nameEn: "Zhytomyr",        center: [28.66, 50.25] },
};

/** Approximate bounding box of mainland Ukraine (WGS-84) — used by source-preference. */
export const UKRAINE_BBOX = {
  minLon: 22.0,
  minLat: 44.0,
  maxLon: 40.3,
  maxLat: 52.5,
} as const;

// ── Forecast model ──────────────────────────────────────────────────────────────

/** A single day's forecast for one location. */
export interface DailyForecast {
  /** ISO date (YYYY-MM-DD), local UA time. */
  date: string;
  tempMinC: number;
  tempMaxC: number;
  /** Total precipitation mm. */
  precipMm: number;
  /** Probability of precipitation 0..100. */
  precipProbPct: number;
  windSpeedMs: number;
  windGustMs: number;
  windDirDeg: number;
  /** UHMC condition code (see CONDITION_CODES). */
  condition: ConditionCode;
}

/** Forecast bundle for one oblast centre. */
export interface OblastForecast {
  oblast: OblastCode;
  lat: number;
  lon: number;
  /** ISO timestamp the forecast was issued by UHMC. */
  issuedAt: string;
  days: DailyForecast[];
}

/** UHMC / WMO-aligned condition taxonomy (subset used by meteo.gov.ua). */
export type ConditionCode =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "overcast"
  | "fog"
  | "light_rain"
  | "rain"
  | "heavy_rain"
  | "thunderstorm"
  | "light_snow"
  | "snow"
  | "heavy_snow"
  | "sleet"
  | "ice";

export const CONDITION_LABELS: Record<ConditionCode, { uk: string; en: string }> = {
  clear:          { uk: "Ясно",                en: "Clear" },
  partly_cloudy:  { uk: "Мінлива хмарність",   en: "Partly cloudy" },
  cloudy:         { uk: "Хмарно",              en: "Cloudy" },
  overcast:       { uk: "Похмуро",             en: "Overcast" },
  fog:            { uk: "Туман",               en: "Fog" },
  light_rain:     { uk: "Невеликий дощ",       en: "Light rain" },
  rain:           { uk: "Дощ",                 en: "Rain" },
  heavy_rain:     { uk: "Сильний дощ",         en: "Heavy rain" },
  thunderstorm:   { uk: "Гроза",               en: "Thunderstorm" },
  light_snow:     { uk: "Невеликий сніг",      en: "Light snow" },
  snow:           { uk: "Сніг",                en: "Snow" },
  heavy_snow:     { uk: "Сильний снігопад",    en: "Heavy snow" },
  sleet:          { uk: "Мокрий сніг",         en: "Sleet" },
  ice:            { uk: "Ожеледь",             en: "Ice / glaze" },
};

// ── Severe-weather warning taxonomy ─────────────────────────────────────────────

/**
 * UHMC issues "штормові попередження" graded I–III, which it maps to the EU
 * Meteoalarm colour scale. We model both so the product can colour the overlay.
 */
export type WarningLevel = "yellow" | "orange" | "red";

/** Numeric severity used downstream (mirrors AegisEventV1 severity 1..5). */
export const WARNING_LEVEL_SEVERITY: Record<WarningLevel, 1 | 2 | 3 | 4 | 5> = {
  yellow: 2,
  orange: 4,
  red: 5,
};

export const WARNING_LEVEL_LABELS: Record<WarningLevel, { uk: string; en: string; colorHex: string }> = {
  yellow: { uk: "Жовтий рівень небезпеки", en: "Yellow (be aware)",   colorHex: "#F5C518" },
  orange: { uk: "Помаранчевий рівень небезпеки", en: "Orange (be prepared)", colorHex: "#F57C00" },
  red:    { uk: "Червоний рівень небезпеки", en: "Red (take action)",  colorHex: "#D32F2F" },
};

/** Phenomenon a warning covers. */
export type WarningPhenomenon =
  | "wind"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "ice"
  | "fog"
  | "heat"
  | "frost"
  | "flood"
  | "fire_danger";

export const PHENOMENON_LABELS: Record<WarningPhenomenon, { uk: string; en: string }> = {
  wind:         { uk: "Сильний вітер",        en: "Strong wind" },
  rain:         { uk: "Сильні опади",         en: "Heavy rainfall" },
  thunderstorm: { uk: "Грози",                en: "Thunderstorms" },
  snow:         { uk: "Снігопади",            en: "Snowfall" },
  ice:          { uk: "Ожеледиця",            en: "Ice" },
  fog:          { uk: "Туман",                en: "Fog" },
  heat:         { uk: "Спека",                en: "Extreme heat" },
  frost:        { uk: "Заморозки",            en: "Frost" },
  flood:        { uk: "Підйом рівня води",    en: "Rising water levels" },
  fire_danger:  { uk: "Надзвичайна пожежна небезпека", en: "Extreme fire danger" },
};

/** A per-oblast severe-weather warning issued by UHMC. */
export interface SevereWarning {
  warningId: string;
  oblast: OblastCode;
  phenomenon: WarningPhenomenon;
  level: WarningLevel;
  /** ISO timestamps for the validity window (local UA time, with offset). */
  onsetAt: string;
  expiresAt: string;
  issuedAt: string;
  /** Headline + instruction text (bilingual). */
  headline: { uk: string; en: string };
  instruction?: { uk: string; en: string };
  source: string;
}

// ── Hydrology model ─────────────────────────────────────────────────────────────

/** Flood-risk band derived from gauge level vs adverse/danger marks. */
export type FloodRisk = "normal" | "elevated" | "adverse" | "danger";

export const FLOOD_RISK_LABELS: Record<FloodRisk, { uk: string; en: string; severity: 1 | 2 | 3 | 4 | 5 }> = {
  normal:   { uk: "Норма",                       en: "Normal",          severity: 1 },
  elevated: { uk: "Підвищений рівень",           en: "Elevated level",  severity: 2 },
  adverse:  { uk: "Несприятливе явище",          en: "Adverse event",   severity: 4 },
  danger:   { uk: "Небезпечне явище (паводок)",  en: "Dangerous flood", severity: 5 },
};

/** A river-gauge station reading. */
export interface RiverGauge {
  gaugeId: string;
  /** Station / settlement name. */
  stationUk: string;
  stationEn: string;
  riverUk: string;
  riverEn: string;
  oblast: OblastCode;
  lat: number;
  lon: number;
  /** Measured water level, cm above gauge datum. */
  levelCm: number;
  /** 24h change, cm (positive = rising). */
  changeCm24h: number;
  /** "Adverse" mark (несприятливе явище), cm. */
  adverseMarkCm: number;
  /** "Danger" mark (небезпечне явище), cm. */
  dangerMarkCm: number;
  /** Derived risk band (see deriveFloodRisk). */
  risk: FloodRisk;
  measuredAt: string;
  source: string;
}
