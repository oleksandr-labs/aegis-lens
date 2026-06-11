/**
 * Civilian alert types for the Ukrainian air-raid and shelter system.
 *
 * Primary data source: air_alert_ua API (https://api.ukrainealarm.com)
 * Supplementary: official regional Telegram channels
 */

export type AlertType =
  | "air_raid"
  | "artillery"
  | "urban_fighting"
  | "chemical"
  | "nuclear"
  | "radiological"
  | "info";

export type AlertStatus = "active" | "all_clear" | "partial_clear";

/** ISO 3166-2:UA oblast codes + Kyiv city */
export type OblastCode =
  | "UA-43"  // Autonomous Republic of Crimea
  | "UA-71"  // Cherkasy
  | "UA-74"  // Chernihiv
  | "UA-77"  // Chernivtsi
  | "UA-12"  // Dnipropetrovsk
  | "UA-14"  // Donetsk
  | "UA-26"  // Ivano-Frankivsk
  | "UA-63"  // Kharkiv
  | "UA-65"  // Kherson
  | "UA-68"  // Khmelnytskyi
  | "UA-35"  // Kirovohrad
  | "UA-30"  // Kyiv city
  | "UA-32"  // Kyiv oblast
  | "UA-09"  // Luhansk
  | "UA-46"  // Lviv
  | "UA-48"  // Mykolaiv
  | "UA-51"  // Odesa
  | "UA-53"  // Poltava
  | "UA-56"  // Rivne
  | "UA-40"  // Sevastopol
  | "UA-59"  // Sumy
  | "UA-61"  // Ternopil
  | "UA-05"  // Vinnytsia
  | "UA-07"  // Volyn
  | "UA-21"  // Zakarpattia
  | "UA-23"  // Zaporizhzhia
  | "UA-18"; // Zhytomyr

export interface OblastInfo {
  code: OblastCode;
  nameUk: string;
  nameEn: string;
  /** Approximate center [lon, lat] */
  center: [number, number];
  /** Population estimate */
  population: number;
}

export const OBLASTS: Record<OblastCode, OblastInfo> = {
  "UA-43": { code: "UA-43", nameUk: "АРК",              nameEn: "Autonomous Republic of Crimea", center: [34.10, 45.31], population: 1900000 },
  "UA-71": { code: "UA-71", nameUk: "Черкаська",         nameEn: "Cherkasy",              center: [31.97, 49.44], population: 1200000 },
  "UA-74": { code: "UA-74", nameUk: "Чернігівська",      nameEn: "Chernihiv",             center: [31.29, 51.50], population: 1000000 },
  "UA-77": { code: "UA-77", nameUk: "Чернівецька",       nameEn: "Chernivtsi",            center: [25.94, 48.29], population: 910000  },
  "UA-12": { code: "UA-12", nameUk: "Дніпропетровська",  nameEn: "Dnipropetrovsk",        center: [35.04, 48.46], population: 3200000 },
  "UA-14": { code: "UA-14", nameUk: "Донецька",          nameEn: "Donetsk",               center: [37.80, 48.01], population: 4200000 },
  "UA-26": { code: "UA-26", nameUk: "Івано-Франківська", nameEn: "Ivano-Frankivsk",       center: [24.71, 48.92], population: 1400000 },
  "UA-63": { code: "UA-63", nameUk: "Харківська",        nameEn: "Kharkiv",               center: [36.23, 49.99], population: 2700000 },
  "UA-65": { code: "UA-65", nameUk: "Херсонська",        nameEn: "Kherson",               center: [32.61, 46.64], population: 1070000 },
  "UA-68": { code: "UA-68", nameUk: "Хмельницька",       nameEn: "Khmelnytskyi",          center: [26.99, 49.42], population: 1300000 },
  "UA-35": { code: "UA-35", nameUk: "Кіровоградська",    nameEn: "Kirovohrad",            center: [32.26, 48.51], population: 960000  },
  "UA-30": { code: "UA-30", nameUk: "Київ",              nameEn: "Kyiv city",             center: [30.52, 50.45], population: 2900000 },
  "UA-32": { code: "UA-32", nameUk: "Київська",          nameEn: "Kyiv oblast",           center: [30.57, 50.07], population: 1800000 },
  "UA-09": { code: "UA-09", nameUk: "Луганська",         nameEn: "Luhansk",               center: [38.92, 48.57], population: 2200000 },
  "UA-46": { code: "UA-46", nameUk: "Львівська",         nameEn: "Lviv",                  center: [24.03, 49.84], population: 2500000 },
  "UA-48": { code: "UA-48", nameUk: "Миколаївська",      nameEn: "Mykolaiv",              center: [31.99, 47.05], population: 1160000 },
  "UA-51": { code: "UA-51", nameUk: "Одеська",           nameEn: "Odesa",                 center: [30.74, 46.49], population: 2400000 },
  "UA-53": { code: "UA-53", nameUk: "Полтавська",        nameEn: "Poltava",               center: [34.55, 49.59], population: 1420000 },
  "UA-56": { code: "UA-56", nameUk: "Рівненська",        nameEn: "Rivne",                 center: [26.25, 50.62], population: 1170000 },
  "UA-40": { code: "UA-40", nameUk: "Севастополь",       nameEn: "Sevastopol",            center: [33.53, 44.60], population: 500000  },
  "UA-59": { code: "UA-59", nameUk: "Сумська",           nameEn: "Sumy",                  center: [34.80, 51.02], population: 1080000 },
  "UA-61": { code: "UA-61", nameUk: "Тернопільська",     nameEn: "Ternopil",              center: [25.60, 49.55], population: 1070000 },
  "UA-05": { code: "UA-05", nameUk: "Вінницька",         nameEn: "Vinnytsia",             center: [28.47, 49.23], population: 1580000 },
  "UA-07": { code: "UA-07", nameUk: "Волинська",         nameEn: "Volyn",                 center: [25.33, 51.25], population: 1040000 },
  "UA-21": { code: "UA-21", nameUk: "Закарпатська",      nameEn: "Zakarpattia",           center: [22.29, 48.62], population: 1250000 },
  "UA-23": { code: "UA-23", nameUk: "Запорізька",        nameEn: "Zaporizhzhia",          center: [35.17, 47.84], population: 1770000 },
  "UA-18": { code: "UA-18", nameUk: "Житомирська",       nameEn: "Zhytomyr",              center: [28.66, 50.25], population: 1230000 },
};

export interface CivilianAlert {
  alertId: string;
  oblastCode: OblastCode;
  type: AlertType;
  status: AlertStatus;
  startedAt: string;
  endedAt?: string;
  /** Duration in seconds (if alert cleared) */
  durationSec?: number;
  /** Source description */
  source: string;
  /** Human-readable description in EN + UK */
  description?: { en?: string; uk?: string };
}

export interface AlertFeedSnapshot {
  fetchedAt: string;
  activeAlerts: CivilianAlert[];
  activeOblastCodes: OblastCode[];
  alertCount: number;
}
