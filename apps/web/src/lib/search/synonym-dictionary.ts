/**
 * Synonym dictionary — multi-locale (EN / UK / RU).
 *
 * Sprint 2.70 — Search infra completion.
 *
 * Covers four semantic domains:
 *   military  — actions, formations, tactics
 *   geo       — place names, transliteration variants
 *   equipment — weapon systems, designations
 *   political — organisations, abbreviations
 *   general   — catch-all
 *
 * Usage:
 *   expandSynonyms("airstrike", "en")  →  ["airstrike", "air strike", "повітряний удар", ...]
 *   buildElasticSynonyms()             →  ["airstrike, air strike, повітряний удар", ...]
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SynonymLocale = "en" | "uk" | "ru" | "all";
export type SynonymCategory =
  | "military"
  | "geo"
  | "equipment"
  | "political"
  | "general";

export interface SynonymEntry {
  /** The primary / canonical form used internally. */
  canonical: string;
  /** Which locale(s) this entry targets. "all" = every locale. */
  locale: SynonymLocale;
  /** All equivalent terms including the canonical form. */
  synonyms: string[];
  category: SynonymCategory;
}

// ---------------------------------------------------------------------------
// Dictionary data (≥ 30 entries)
// ---------------------------------------------------------------------------

export const SYNONYM_DICTIONARY: SynonymEntry[] = [
  // ── Military actions ──────────────────────────────────────────────────────
  {
    canonical: "airstrike",
    locale: "all",
    synonyms: ["airstrike", "air strike", "air attack", "повітряний удар", "авіаудар", "авіаційний удар"],
    category: "military",
  },
  {
    canonical: "shelling",
    locale: "all",
    synonyms: ["shelling", "bombardment", "artillery fire", "обстріл", "артобстріл", "бомбардування"],
    category: "military",
  },
  {
    canonical: "drone",
    locale: "all",
    synonyms: ["drone", "UAV", "UAS", "unmanned aerial vehicle", "БПЛА", "безпілотник", "дрон"],
    category: "military",
  },
  {
    canonical: "missile",
    locale: "all",
    synonyms: ["missile", "rocket", "cruise missile", "ракета", "крилата ракета"],
    category: "military",
  },
  {
    canonical: "ground assault",
    locale: "all",
    synonyms: ["ground assault", "ground attack", "infantry assault", "наземний штурм", "штурм", "атака"],
    category: "military",
  },
  {
    canonical: "ceasefire",
    locale: "all",
    synonyms: ["ceasefire", "cease-fire", "truce", "armistice", "перемир'я", "припинення вогню"],
    category: "military",
  },
  {
    canonical: "evacuation",
    locale: "all",
    synonyms: ["evacuation", "civilian evacuation", "evac", "евакуація", "евакуювання"],
    category: "military",
  },
  {
    canonical: "minefield",
    locale: "all",
    synonyms: ["minefield", "mine field", "IED", "мінне поле", "замінування"],
    category: "military",
  },
  {
    canonical: "sniper",
    locale: "all",
    synonyms: ["sniper", "marksman", "sniper fire", "снайпер", "снайперський вогонь"],
    category: "military",
  },
  {
    canonical: "POW",
    locale: "all",
    synonyms: ["POW", "prisoner of war", "captive", "полонений", "військовополонений"],
    category: "military",
  },

  // ── Geography ─────────────────────────────────────────────────────────────
  {
    canonical: "Kyiv",
    locale: "all",
    synonyms: ["Kyiv", "Kiev", "Київ", "Киев"],
    category: "geo",
  },
  {
    canonical: "Kharkiv",
    locale: "all",
    synonyms: ["Kharkiv", "Kharkov", "Харків", "Харьков"],
    category: "geo",
  },
  {
    canonical: "Zaporizhzhia",
    locale: "all",
    synonyms: ["Zaporizhzhia", "Zaporizhia", "Zaporozhye", "Zaporizhye", "Запоріжжя", "Запорожье"],
    category: "geo",
  },
  {
    canonical: "Odesa",
    locale: "all",
    synonyms: ["Odesa", "Odessa", "Одеса", "Одесса"],
    category: "geo",
  },
  {
    canonical: "Mariupol",
    locale: "all",
    synonyms: ["Mariupol", "Маріуполь", "Мариуполь"],
    category: "geo",
  },
  {
    canonical: "Bakhmut",
    locale: "all",
    synonyms: ["Bakhmut", "Артемівськ", "Artemivsk", "Бахмут"],
    category: "geo",
  },
  {
    canonical: "Kherson",
    locale: "all",
    synonyms: ["Kherson", "Херсон", "Херсон"],
    category: "geo",
  },
  {
    canonical: "Donetsk",
    locale: "all",
    synonyms: ["Donetsk", "Донецьк", "Донецк"],
    category: "geo",
  },
  {
    canonical: "Luhansk",
    locale: "all",
    synonyms: ["Luhansk", "Lugansk", "Луганськ", "Луганск"],
    category: "geo",
  },
  {
    canonical: "Crimea",
    locale: "all",
    synonyms: ["Crimea", "Крим", "Крымский полуостров", "Crimean Peninsula"],
    category: "geo",
  },
  {
    canonical: "Dnipro",
    locale: "all",
    synonyms: ["Dnipro", "Dnipropetrovsk", "Дніпро", "Дніпропетровськ"],
    category: "geo",
  },

  // ── Equipment / weapon systems ────────────────────────────────────────────
  {
    canonical: "HIMARS",
    locale: "all",
    synonyms: ["HIMARS", "M142 HIMARS", "High Mobility Artillery Rocket System", "М142"],
    category: "equipment",
  },
  {
    canonical: "Javelin",
    locale: "all",
    synonyms: ["Javelin", "FGM-148", "FGM-148 Javelin", "Джавелін"],
    category: "equipment",
  },
  {
    canonical: "Bayraktar TB2",
    locale: "all",
    synonyms: ["Bayraktar", "Bayraktar TB2", "TB2", "TB-2", "Байрактар"],
    category: "equipment",
  },
  {
    canonical: "tank",
    locale: "all",
    synonyms: ["tank", "MBT", "main battle tank", "танк"],
    category: "equipment",
  },
  {
    canonical: "MLRS",
    locale: "all",
    synonyms: ["MLRS", "multiple launch rocket system", "РСЗВ", "реактивна система залпового вогню"],
    category: "equipment",
  },
  {
    canonical: "Shahed",
    locale: "all",
    synonyms: ["Shahed", "Shahed-136", "Geran-2", "Герань-2", "Shahed drone", "шахед"],
    category: "equipment",
  },

  // ── Political / organisational ────────────────────────────────────────────
  {
    canonical: "AFU",
    locale: "all",
    synonyms: ["AFU", "Armed Forces of Ukraine", "Ukrainian Army", "ЗСУ", "Збройні сили України"],
    category: "political",
  },
  {
    canonical: "MoD",
    locale: "all",
    synonyms: ["MoD", "Ministry of Defence", "Ministry of Defense", "Міністерство оборони", "МО"],
    category: "political",
  },
  {
    canonical: "NATO",
    locale: "all",
    synonyms: ["NATO", "North Atlantic Treaty Organization", "НАТО"],
    category: "political",
  },
  {
    canonical: "UN",
    locale: "all",
    synonyms: ["UN", "United Nations", "ООН"],
    category: "political",
  },
  {
    canonical: "Zelensky",
    locale: "all",
    synonyms: ["Zelensky", "Zelenskyy", "Zelenskiy", "Zelenskyi", "Зеленський", "Зеленский"],
    category: "political",
  },

  // ── General ───────────────────────────────────────────────────────────────
  {
    canonical: "explosion",
    locale: "all",
    synonyms: ["explosion", "blast", "detonation", "вибух", "підрив"],
    category: "general",
  },
  {
    canonical: "fire",
    locale: "all",
    synonyms: ["fire", "blaze", "burning", "пожежа", "вогонь", "загоряння"],
    category: "general",
  },
];

// ---------------------------------------------------------------------------
// Query expansion
// ---------------------------------------------------------------------------

/**
 * Expand a query string by adding synonyms from the dictionary.
 *
 * Returns a deduplicated list of terms including the original tokens and any
 * matching synonym groups.  The expansion is case-insensitive.
 */
export function expandSynonyms(query: string, locale: "en" | "uk" | "ru"): string[] {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const expanded = new Set<string>(tokens.map((t) => t.toLowerCase()));

  for (const token of tokens) {
    const lower = token.toLowerCase();
    for (const entry of SYNONYM_DICTIONARY) {
      if (entry.locale !== "all" && entry.locale !== locale) continue;
      const matchedSynonym = entry.synonyms.find((s) => s.toLowerCase() === lower);
      if (matchedSynonym) {
        for (const s of entry.synonyms) {
          expanded.add(s.toLowerCase());
        }
      }
    }
  }

  return Array.from(expanded);
}

// ---------------------------------------------------------------------------
// Elasticsearch synonym filter format
// ---------------------------------------------------------------------------

/**
 * Export the synonym dictionary in Elasticsearch synonym filter format:
 *   "term1, term2, term3"  (explicit equivalence)
 *
 * Each SynonymEntry becomes one line with all synonyms joined by ", ".
 */
export function buildElasticSynonyms(): string[] {
  return SYNONYM_DICTIONARY.map((entry) =>
    entry.synonyms.map((s) => s.toLowerCase()).join(", "),
  );
}
