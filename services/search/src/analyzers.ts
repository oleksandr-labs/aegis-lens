/**
 * Locale-aware analyzer configuration for Elasticsearch.
 *
 * Each analyzer is an ES analyzer definition (tokenizer + filters).
 * Transliteration maps handle Cyrillic → Latin for cross-script search.
 */

export interface ESAnalyzerConfig {
  type: "custom";
  tokenizer: string;
  filter: string[];
  char_filter?: string[];
}

export const ANALYZERS: Record<string, ESAnalyzerConfig> = {
  uk: {
    type: "custom",
    tokenizer: "standard",
    filter: ["lowercase", "ukrainian_stop", "ukrainian_stemmer"],
  },
  ru: {
    type: "custom",
    tokenizer: "standard",
    filter: ["lowercase", "russian_stop", "russian_stemmer"],
  },
  en: {
    type: "custom",
    tokenizer: "standard",
    filter: ["lowercase", "english_stop", "porter_stem"],
  },
  de: {
    type: "custom",
    tokenizer: "standard",
    filter: ["lowercase", "german_stop", "german_normalization", "german_stemmer"],
  },
  pl: {
    type: "custom",
    tokenizer: "standard",
    filter: ["lowercase", "polish_stop"],
  },
  default: {
    type: "custom",
    tokenizer: "standard",
    filter: ["lowercase"],
  },
};

/** Transliteration pairs: Ukrainian/Russian city names → English equivalents */
export const TRANSLITERATION_SYNONYMS: [string, string][] = [
  ["kharkiv", "харків"],
  ["kherson", "херсон"],
  ["zaporizhzhia", "запоріжжя"],
  ["kyiv", "київ", ],
  ["odesa", "одеса"],
  ["mariupol", "маріуполь"],
  ["bakhmut", "бахмут"],
  ["avdiivka", "авдіївка"],
  ["donetsk", "донецьк"],
  ["luhansk", "луганськ"],
  ["crimea", "крим"],
  ["donbas", "донбас"],
];

/** Simple Cyrillic → Latin transliteration for query normalization */
const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye",
  ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
  ю: "yu", я: "ya",
};

export function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => CYRILLIC_MAP[c] ?? c)
    .join("");
}

export function detectLocale(query: string): string {
  const cyrillicRatio =
    [...query].filter((c) => /[Ѐ-ӿ]/.test(c)).length / Math.max(query.length, 1);

  if (cyrillicRatio > 0.3) {
    // Distinguish Ukrainian from Russian: look for Ukrainian-specific letters
    const hasUkrLetters = /[іїєґ]/.test(query);
    return hasUkrLetters ? "uk" : "ru";
  }

  return "en";
}

export function getAnalyzerForLocale(locale: string): string {
  return locale in ANALYZERS ? locale : "default";
}
