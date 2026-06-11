/**
 * Vessel registry — type + flag + operator resolution.
 *
 * Assembles a localized {@link VesselRegistryEntry} from a live AIS position and
 * optional external/operator data. Flag is resolved from the MMSI MID prefix to
 * a country with EN/UK names, and flag-of-convenience registers are tagged
 * (relevant to shadow-fleet analysis).
 */

import type {
  VesselPosition,
  VesselOperator,
  VesselRegistryEntry,
  ShipType,
} from "./types";
import { inferCargoClass } from "./cargo-inference";

/** ISO 3166-1 alpha-2 → { en, uk } flag-state names (Black Sea relevant set). */
const FLAG_NAMES: Record<string, { en: string; uk: string }> = {
  UA: { en: "Ukraine", uk: "Україна" },
  RU: { en: "Russia", uk: "Росія" },
  TR: { en: "Türkiye", uk: "Туреччина" },
  GE: { en: "Georgia", uk: "Грузія" },
  CY: { en: "Cyprus", uk: "Кіпр" },
  GR: { en: "Greece", uk: "Греція" },
  MT: { en: "Malta", uk: "Мальта" },
  DE: { en: "Germany", uk: "Німеччина" },
  PA: { en: "Panama", uk: "Панама" },
  LR: { en: "Liberia", uk: "Ліберія" },
  MH: { en: "Marshall Islands", uk: "Маршаллові Острови" },
  GA: { en: "Gabon", uk: "Габон" },
  CK: { en: "Cook Islands", uk: "Острови Кука" },
  PW: { en: "Palau", uk: "Палау" },
  CM: { en: "Cameroon", uk: "Камерун" },
  SL: { en: "Sierra Leone", uk: "Сьєрра-Леоне" },
  TZ: { en: "Tanzania", uk: "Танзанія" },
  AO: { en: "Antigua and Barbuda", uk: "Антигуа і Барбуда" },
};

/** Registers commonly used as flags of convenience / shadow-fleet re-flagging. */
const FLAG_OF_CONVENIENCE = new Set([
  "PA", "LR", "MH", "GA", "CK", "PW", "CM", "SL", "TZ", "AO", "CY", "MT",
]);

/** MMSI MID (first 3 digits) → ISO alpha-2 flag. Superset of the client map. */
const MID_TO_FLAG: Record<string, string> = {
  "272": "UA", "273": "RU", "212": "CY", "271": "TR", "240": "GR", "241": "GR",
  "248": "MT", "256": "MT", "211": "DE", "218": "DE", "269": "GE",
  "351": "PA", "352": "PA", "353": "PA", "354": "PA", "636": "LR", "538": "MH",
  "626": "GA", "518": "CK", "511": "PW", "613": "CM", "667": "SL", "674": "TZ",
  "304": "AO", "305": "AO",
};

/** Resolve a flag (ISO alpha-2) from an MMSI, falling back to a provided value. */
export function resolveFlag(mmsi: string, fallback: string | null): string | null {
  return MID_TO_FLAG[mmsi.slice(0, 3)] ?? fallback ?? null;
}

export function isFlagOfConvenience(flag: string | null): boolean {
  return !!flag && FLAG_OF_CONVENIENCE.has(flag);
}

export function flagNames(flag: string | null): { en: string | null; uk: string | null } {
  if (!flag) return { en: null, uk: null };
  const n = FLAG_NAMES[flag];
  return n ? { en: n.en, uk: n.uk } : { en: flag, uk: flag };
}

/**
 * Very small ASCII transliteration for Cyrillic vessel names, so we always have
 * an EN-side label. Lossy but deterministic; production uses ICU transliteration.
 */
const CYR_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya", ы: "y", э: "e", ё: "yo", ъ: "",
};

export function transliterate(name: string | null): string | null {
  if (!name) return null;
  let out = "";
  for (const ch of name) {
    const low = ch.toLowerCase();
    const mapped = CYR_MAP[low];
    if (mapped === undefined) {
      out += ch;
    } else {
      out += ch === low ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    }
  }
  return out;
}

function hasCyrillic(s: string | null): boolean {
  return !!s && /[Ѐ-ӿ]/.test(s);
}

/** Build a localized registry entry from a live AIS position (+ optional data). */
export function buildRegistryEntry(
  pos: VesselPosition,
  extra: {
    operator?: VesselOperator | null;
    gross_tonnage?: number | null;
    length_m?: number | null;
    year_built?: number | null;
    ship_type?: ShipType;
  } = {},
): VesselRegistryEntry {
  const flag = resolveFlag(pos.mmsi, pos.flag);
  const fnames = flagNames(flag);
  const ship_type = extra.ship_type ?? pos.ship_type;

  const raw = pos.ship_name;
  const cyr = hasCyrillic(raw);
  const name_uk = cyr ? raw : raw;
  const name_en = cyr ? transliterate(raw) : raw;

  return {
    mmsi: pos.mmsi,
    imo: pos.imo,
    ship_name: raw,
    name_en,
    name_uk,
    ship_type,
    cargo_class: inferCargoClass({
      ship_type,
      destination: pos.destination,
      draught_m: pos.draught_m,
      ship_name: raw,
    }),
    flag,
    flag_name_en: fnames.en,
    flag_name_uk: fnames.uk,
    flag_of_convenience: isFlagOfConvenience(flag),
    operator: extra.operator ?? null,
    gross_tonnage: extra.gross_tonnage ?? null,
    length_m: extra.length_m ?? null,
    year_built: extra.year_built ?? null,
  };
}
