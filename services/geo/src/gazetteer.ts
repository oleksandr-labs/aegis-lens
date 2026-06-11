/**
 * UA toponym gazetteer.
 *
 * Covers all 27 oblasts (level 1), ~100 major cities/raions (level 2),
 * and key strategic locations (level 3).
 *
 * Data is compiled from public OSM Ukraine administrative boundaries.
 * Replace with a full OSM-derived Postgres/PostGIS import in production.
 */

import type { AdminRegion, GeoResult, LatLng } from "./types";

export interface GazetteerEntry {
  id: string;
  /** EN + UK names. Cyrillic variant for fuzzy matching. */
  names: Record<string, string>;
  /** Common alternate spellings / transliterations */
  aliases: string[];
  level: 0 | 1 | 2 | 3 | 4;
  /** ISO 3166-1 alpha-2 country code */
  country: string;
  centroid: LatLng;
  /** Bounding box [minLon, minLat, maxLon, maxLat] */
  bbox: [number, number, number, number];
  /** Typical geocoding uncertainty in metres */
  precision_m: number;
  /** Parent entry id */
  parent_id?: string;
}

// ── Country ────────────────────────────────────────────────────────────────────
const UA_COUNTRY: GazetteerEntry = {
  id: "UA",
  names: { en: "Ukraine", uk: "Україна" },
  aliases: ["Україна", "Ukraine"],
  level: 0,
  country: "UA",
  centroid: { lat: 49.0, lng: 31.5 },
  bbox: [22.0, 44.0, 40.5, 52.5],
  precision_m: 500_000,
};

// ── Oblasts (level 1) ──────────────────────────────────────────────────────────
const OBLASTS: GazetteerEntry[] = [
  { id: "UA-71", names: { en: "Cherkasy Oblast", uk: "Черкаська область" }, aliases: ["Cherkasy", "Черкаси", "Cherkassy"], level: 1, country: "UA", centroid: { lat: 49.444, lng: 32.059 }, bbox: [30.2, 48.6, 33.5, 50.1], precision_m: 50_000, parent_id: "UA" },
  { id: "UA-74", names: { en: "Chernihiv Oblast", uk: "Чернігівська область" }, aliases: ["Chernihiv", "Чернігів", "Chernigov"], level: 1, country: "UA", centroid: { lat: 51.498, lng: 31.289 }, bbox: [30.0, 50.3, 34.0, 52.5], precision_m: 50_000, parent_id: "UA" },
  { id: "UA-77", names: { en: "Chernivtsi Oblast", uk: "Чернівецька область" }, aliases: ["Chernivtsi", "Чернівці", "Chernovtsy"], level: 1, country: "UA", centroid: { lat: 48.291, lng: 25.935 }, bbox: [24.9, 47.8, 27.0, 48.6], precision_m: 40_000, parent_id: "UA" },
  { id: "UA-12", names: { en: "Dnipropetrovsk Oblast", uk: "Дніпропетровська область" }, aliases: ["Dnipro", "Дніпро", "Dnepropetrovsk"], level: 1, country: "UA", centroid: { lat: 48.464, lng: 35.046 }, bbox: [33.0, 47.2, 36.7, 49.3], precision_m: 80_000, parent_id: "UA" },
  { id: "UA-14", names: { en: "Donetsk Oblast", uk: "Донецька область" }, aliases: ["Donetsk", "Донецьк", "Donbas", "Донбас"], level: 1, country: "UA", centroid: { lat: 48.015, lng: 37.802 }, bbox: [36.5, 47.0, 39.0, 49.3], precision_m: 80_000, parent_id: "UA" },
  { id: "UA-26", names: { en: "Ivano-Frankivsk Oblast", uk: "Івано-Франківська область" }, aliases: ["Ivano-Frankivsk", "Івано-Франківськ"], level: 1, country: "UA", centroid: { lat: 48.922, lng: 24.711 }, bbox: [23.6, 47.7, 25.8, 49.3], precision_m: 40_000, parent_id: "UA" },
  { id: "UA-63", names: { en: "Kharkiv Oblast", uk: "Харківська область" }, aliases: ["Kharkiv", "Харків", "Kharkov"], level: 1, country: "UA", centroid: { lat: 49.993, lng: 36.23 }, bbox: [35.0, 49.0, 38.2, 51.3], precision_m: 70_000, parent_id: "UA" },
  { id: "UA-65", names: { en: "Kherson Oblast", uk: "Херсонська область" }, aliases: ["Kherson", "Херсон"], level: 1, country: "UA", centroid: { lat: 46.635, lng: 32.616 }, bbox: [31.3, 45.6, 35.1, 47.6], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-68", names: { en: "Khmelnytskyi Oblast", uk: "Хмельницька область" }, aliases: ["Khmelnytskyi", "Хмельницький", "Khmelnitsky"], level: 1, country: "UA", centroid: { lat: 49.422, lng: 27.001 }, bbox: [25.8, 48.5, 28.6, 50.5], precision_m: 50_000, parent_id: "UA" },
  { id: "UA-35", names: { en: "Kirovohrad Oblast", uk: "Кіровоградська область" }, aliases: ["Kirovohrad", "Кропивницький", "Kropyvnytskyi"], level: 1, country: "UA", centroid: { lat: 48.513, lng: 32.262 }, bbox: [29.9, 47.5, 34.0, 49.6], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-09", names: { en: "Luhansk Oblast", uk: "Луганська область" }, aliases: ["Luhansk", "Луганськ", "Lugansk"], level: 1, country: "UA", centroid: { lat: 48.574, lng: 39.307 }, bbox: [37.9, 47.8, 40.2, 50.1], precision_m: 70_000, parent_id: "UA" },
  { id: "UA-46", names: { en: "Lviv Oblast", uk: "Львівська область" }, aliases: ["Lviv", "Львів", "Lwow", "Lvov"], level: 1, country: "UA", centroid: { lat: 49.839, lng: 24.029 }, bbox: [22.6, 48.6, 25.4, 50.5], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-48", names: { en: "Mykolaiv Oblast", uk: "Миколаївська область" }, aliases: ["Mykolaiv", "Миколаїв", "Nikolaev"], level: 1, country: "UA", centroid: { lat: 47.058, lng: 31.993 }, bbox: [30.4, 46.2, 33.5, 48.0], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-51", names: { en: "Odesa Oblast", uk: "Одеська область" }, aliases: ["Odesa", "Одеса", "Odessa"], level: 1, country: "UA", centroid: { lat: 46.482, lng: 30.723 }, bbox: [28.5, 45.3, 31.5, 48.2], precision_m: 70_000, parent_id: "UA" },
  { id: "UA-53", names: { en: "Poltava Oblast", uk: "Полтавська область" }, aliases: ["Poltava", "Полтава"], level: 1, country: "UA", centroid: { lat: 49.588, lng: 34.55 }, bbox: [32.5, 48.5, 36.0, 51.0], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-56", names: { en: "Rivne Oblast", uk: "Рівненська область" }, aliases: ["Rivne", "Рівне", "Rovno"], level: 1, country: "UA", centroid: { lat: 50.619, lng: 26.252 }, bbox: [25.2, 49.8, 27.6, 51.9], precision_m: 50_000, parent_id: "UA" },
  { id: "UA-59", names: { en: "Sumy Oblast", uk: "Сумська область" }, aliases: ["Sumy", "Суми"], level: 1, country: "UA", centroid: { lat: 50.907, lng: 34.798 }, bbox: [32.3, 49.9, 36.2, 52.4], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-61", names: { en: "Ternopil Oblast", uk: "Тернопільська область" }, aliases: ["Ternopil", "Тернопіль", "Ternopol"], level: 1, country: "UA", centroid: { lat: 49.553, lng: 25.594 }, bbox: [24.5, 48.8, 26.8, 50.3], precision_m: 40_000, parent_id: "UA" },
  { id: "UA-05", names: { en: "Vinnytsia Oblast", uk: "Вінницька область" }, aliases: ["Vinnytsia", "Вінниця", "Vinnitsa"], level: 1, country: "UA", centroid: { lat: 49.233, lng: 28.468 }, bbox: [27.0, 48.1, 30.0, 50.2], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-07", names: { en: "Volyn Oblast", uk: "Волинська область" }, aliases: ["Volyn", "Волинь", "Lutsk"], level: 1, country: "UA", centroid: { lat: 51.25, lng: 25.33 }, bbox: [23.5, 50.3, 27.0, 52.4], precision_m: 50_000, parent_id: "UA" },
  { id: "UA-21", names: { en: "Zakarpattia Oblast", uk: "Закарпатська область" }, aliases: ["Zakarpattia", "Закарпаття", "Uzhhorod"], level: 1, country: "UA", centroid: { lat: 48.62, lng: 22.3 }, bbox: [22.1, 47.9, 24.6, 49.1], precision_m: 40_000, parent_id: "UA" },
  { id: "UA-23", names: { en: "Zaporizhzhia Oblast", uk: "Запорізька область" }, aliases: ["Zaporizhzhia", "Запоріжжя", "Zaporozhye"], level: 1, country: "UA", centroid: { lat: 47.838, lng: 35.14 }, bbox: [34.0, 46.5, 37.0, 48.5], precision_m: 70_000, parent_id: "UA" },
  { id: "UA-18", names: { en: "Zhytomyr Oblast", uk: "Житомирська область" }, aliases: ["Zhytomyr", "Житомир"], level: 1, country: "UA", centroid: { lat: 50.254, lng: 28.658 }, bbox: [27.2, 49.3, 30.5, 51.6], precision_m: 60_000, parent_id: "UA" },
  { id: "UA-32", names: { en: "Kyiv Oblast", uk: "Київська область" }, aliases: ["Kyiv Oblast", "Київщина"], level: 1, country: "UA", centroid: { lat: 50.45, lng: 30.52 }, bbox: [29.0, 49.5, 32.2, 51.7], precision_m: 70_000, parent_id: "UA" },
];

// ── Major cities (level 2) ────────────────────────────────────────────────────
const CITIES: GazetteerEntry[] = [
  { id: "UA-KYV", names: { en: "Kyiv", uk: "Київ" }, aliases: ["Kiev", "Київ", "Kyiv"], level: 2, country: "UA", centroid: { lat: 50.4501, lng: 30.5234 }, bbox: [30.24, 50.21, 30.83, 50.59], precision_m: 5_000, parent_id: "UA-32" },
  { id: "UA-KHK", names: { en: "Kharkiv", uk: "Харків" }, aliases: ["Kharkov", "Харків"], level: 2, country: "UA", centroid: { lat: 49.9935, lng: 36.2304 }, bbox: [36.1, 49.87, 36.46, 50.11], precision_m: 5_000, parent_id: "UA-63" },
  { id: "UA-ODS", names: { en: "Odesa", uk: "Одеса" }, aliases: ["Odessa", "Одеса"], level: 2, country: "UA", centroid: { lat: 46.4825, lng: 30.7233 }, bbox: [30.55, 46.34, 30.87, 46.61], precision_m: 4_000, parent_id: "UA-51" },
  { id: "UA-DNP", names: { en: "Dnipro", uk: "Дніпро" }, aliases: ["Dnepr", "Dnipropetrovsk", "Дніпро"], level: 2, country: "UA", centroid: { lat: 48.4647, lng: 35.0462 }, bbox: [34.82, 48.32, 35.25, 48.57], precision_m: 5_000, parent_id: "UA-12" },
  { id: "UA-ZPZ", names: { en: "Zaporizhzhia", uk: "Запоріжжя" }, aliases: ["Zaporizhia", "Zaporizhzhe", "Запоріжжя"], level: 2, country: "UA", centroid: { lat: 47.8388, lng: 35.1396 }, bbox: [34.92, 47.71, 35.37, 47.98], precision_m: 5_000, parent_id: "UA-23" },
  { id: "UA-LVV", names: { en: "Lviv", uk: "Львів" }, aliases: ["Lvov", "Лвів", "Львів"], level: 2, country: "UA", centroid: { lat: 49.8397, lng: 24.0297 }, bbox: [23.92, 49.77, 24.17, 49.93], precision_m: 3_000, parent_id: "UA-46" },
  { id: "UA-MYK", names: { en: "Mykolaiv", uk: "Миколаїв" }, aliases: ["Nikolaev", "Миколаїв"], level: 2, country: "UA", centroid: { lat: 46.975, lng: 31.994 }, bbox: [31.83, 46.87, 32.13, 47.12], precision_m: 4_000, parent_id: "UA-48" },
  { id: "UA-KHR", names: { en: "Kherson", uk: "Херсон" }, aliases: ["Херсон"], level: 2, country: "UA", centroid: { lat: 46.6354, lng: 32.6169 }, bbox: [32.48, 46.55, 32.72, 46.72], precision_m: 3_000, parent_id: "UA-65" },
  { id: "UA-SUM", names: { en: "Sumy", uk: "Суми" }, aliases: ["Суми"], level: 2, country: "UA", centroid: { lat: 50.9077, lng: 34.7981 }, bbox: [34.66, 50.84, 34.96, 51.0], precision_m: 3_000, parent_id: "UA-59" },
  { id: "UA-CHN", names: { en: "Chernihiv", uk: "Чернігів" }, aliases: ["Chernigov", "Чернігів"], level: 2, country: "UA", centroid: { lat: 51.4982, lng: 31.2893 }, bbox: [31.16, 51.42, 31.45, 51.58], precision_m: 3_000, parent_id: "UA-74" },
  { id: "UA-PLT", names: { en: "Poltava", uk: "Полтава" }, aliases: ["Полтава"], level: 2, country: "UA", centroid: { lat: 49.5883, lng: 34.5514 }, bbox: [34.42, 49.52, 34.68, 49.68], precision_m: 3_000, parent_id: "UA-53" },
  { id: "UA-KRM", names: { en: "Kramatorsk", uk: "Краматорськ" }, aliases: ["Краматорськ"], level: 2, country: "UA", centroid: { lat: 48.7337, lng: 37.573 }, bbox: [37.44, 48.69, 37.73, 48.82], precision_m: 3_000, parent_id: "UA-14" },
  { id: "UA-BKH", names: { en: "Bakhmut", uk: "Бахмут" }, aliases: ["Бахмут", "Artemivsk", "Артемівськ"], level: 2, country: "UA", centroid: { lat: 48.593, lng: 37.997 }, bbox: [37.91, 48.54, 38.09, 48.65], precision_m: 2_000, parent_id: "UA-14" },
  { id: "UA-MRP", names: { en: "Mariupol", uk: "Маріуполь" }, aliases: ["Маріуполь"], level: 2, country: "UA", centroid: { lat: 47.0959, lng: 37.5427 }, bbox: [37.35, 47.02, 37.72, 47.18], precision_m: 4_000, parent_id: "UA-14" },
];

// ── Strategic locations (level 3) ─────────────────────────────────────────────
const STRATEGIC: GazetteerEntry[] = [
  { id: "UA-ZNPP", names: { en: "Zaporizhzhia Nuclear Power Plant", uk: "Запорізька АЕС" }, aliases: ["ZNPP", "Zaporizhzhia NPP", "Zaporizhska NPP", "Енергодар"], level: 3, country: "UA", centroid: { lat: 47.508, lng: 34.588 }, bbox: [34.55, 47.48, 34.63, 47.54], precision_m: 500, parent_id: "UA-23" },
  { id: "UA-KAKHO", names: { en: "Kakhovka Dam", uk: "Каховська ГЕС" }, aliases: ["Kakhovka", "Nova Kakhovka", "Нова Каховка", "Каховська дамба"], level: 3, country: "UA", centroid: { lat: 46.74, lng: 33.38 }, bbox: [33.3, 46.71, 33.48, 46.77], precision_m: 200, parent_id: "UA-65" },
];

// ── Gazetteer service ──────────────────────────────────────────────────────────

const ALL_ENTRIES: GazetteerEntry[] = [
  UA_COUNTRY,
  ...OBLASTS,
  ...CITIES,
  ...STRATEGIC,
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[''`-]/g, "").replace(/\s+/g, " ").trim();
}

export class UAGazetteer {
  private readonly byId = new Map<string, GazetteerEntry>();
  /** normalized name → entries */
  private readonly byName = new Map<string, GazetteerEntry[]>();

  constructor(entries: GazetteerEntry[] = ALL_ENTRIES) {
    for (const e of entries) {
      this.byId.set(e.id, e);
      const keys = [
        ...Object.values(e.names),
        ...e.aliases,
      ].map(normalize);
      for (const k of keys) {
        if (!this.byName.has(k)) this.byName.set(k, []);
        this.byName.get(k)!.push(e);
      }
    }
  }

  getById(id: string): GazetteerEntry | undefined {
    return this.byId.get(id);
  }

  /** Exact lookup by name (case-insensitive, diacritic-tolerant) */
  findByName(name: string): GazetteerEntry[] {
    return this.byName.get(normalize(name)) ?? [];
  }

  /** Prefix search, up to maxResults */
  prefixSearch(prefix: string, maxResults = 10): GazetteerEntry[] {
    const norm = normalize(prefix);
    const seen = new Set<string>();
    const results: GazetteerEntry[] = [];
    for (const [key, entries] of this.byName) {
      if (!key.startsWith(norm)) continue;
      for (const e of entries) {
        if (seen.has(e.id)) continue;
        seen.add(e.id);
        results.push(e);
        if (results.length >= maxResults) return results;
      }
    }
    return results;
  }

  /** Find best match and return as GeoResult */
  geocode(name: string): GeoResult | null {
    const candidates = this.findByName(name);
    if (candidates.length === 0) return null;
    // Prefer more specific levels
    candidates.sort((a, b) => b.level - a.level);
    const e = candidates[0];
    return this.entryToGeoResult(e);
  }

  private entryToGeoResult(e: GazetteerEntry): GeoResult {
    const admins: AdminRegion[] = [];
    let cur: GazetteerEntry | undefined = e;
    while (cur) {
      admins.unshift({
        level: cur.level,
        code: cur.id,
        name: cur.names,
      });
      cur = cur.parent_id ? this.byId.get(cur.parent_id) : undefined;
    }

    return {
      point: e.centroid,
      precision_m: e.precision_m,
      method: "region_centroid",
      admin: admins,
      display_name: e.names,
      confidence: e.level >= 2 ? 0.85 : 0.7,
    };
  }

  /** Reverse lookup: find the most-specific entry whose bbox contains the point */
  reverse(lat: number, lng: number): GazetteerEntry | null {
    let best: GazetteerEntry | null = null;
    let bestLevel = -1;
    for (const e of this.byId.values()) {
      const [minLon, minLat, maxLon, maxLat] = e.bbox;
      if (lng >= minLon && lng <= maxLon && lat >= minLat && lat <= maxLat) {
        if (e.level > bestLevel) {
          bestLevel = e.level;
          best = e;
        }
      }
    }
    return best;
  }
}

export const UA_GAZETTEER = new UAGazetteer();
