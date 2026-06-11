/**
 * Transliteration — Ukrainian ↔ Latin + spelling correction.
 *
 * Sprint 2.70 — Search infra completion.
 *
 * Implements the Ukrainian national transliteration standard (KMU Resolution
 * No. 55 of 27 January 2010) for the uk-to-en direction.
 * en-to-uk reverses the same table on a best-effort basis (some mappings are
 * not bijective, e.g. "i" maps to "і" by default).
 */

// ---------------------------------------------------------------------------
// KMU 2010 transliteration table  (Ukrainian Cyrillic → Latin)
// ---------------------------------------------------------------------------

export const TRANSLITERATION_TABLE: Record<string, string> = {
  // Uppercase
  А: "A",  Б: "B",  В: "V",  Г: "H",  Ґ: "G",
  Д: "D",  Е: "E",  Є: "Ye", Ж: "Zh", З: "Z",
  И: "Y",  І: "I",  Ї: "Yi", Й: "Y",  К: "K",
  Л: "L",  М: "M",  Н: "N",  О: "O",  П: "P",
  Р: "R",  С: "S",  Т: "T",  У: "U",  Ф: "F",
  Х: "Kh", Ц: "Ts", Ч: "Ch", Ш: "Sh", Щ: "Shch",
  Ь: "",   Ю: "Yu", Я: "Ya",
  // Lowercase
  а: "a",  б: "b",  в: "v",  г: "h",  ґ: "g",
  д: "d",  е: "e",  є: "ye", ж: "zh", з: "z",
  и: "y",  і: "i",  ї: "yi", й: "y",  к: "k",
  л: "l",  м: "m",  н: "n",  о: "o",  п: "p",
  р: "r",  с: "s",  т: "t",  у: "u",  ф: "f",
  х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ь: "",   ю: "yu", я: "ya",
  // Apostrophe / soft sign variants
  "'": "",  "ʼ": "", "’": "",
};

// Reverse table: Latin → Ukrainian (best-effort, lowercase only)
const REVERSE_TABLE: Record<string, string> = {};
(function buildReverse() {
  // Map digraphs first so they take priority when reversing.
  const digraphs = [
    ["shch", "щ"],
    ["zh", "ж"],
    ["kh", "х"],
    ["ts", "ц"],
    ["ch", "ч"],
    ["sh", "ш"],
    ["ye", "є"],
    ["yi", "ї"],
    ["yu", "ю"],
    ["ya", "я"],
  ] as const;
  for (const [lat, cyr] of digraphs) {
    REVERSE_TABLE[lat] = cyr;
  }
  // Single-character mappings.
  for (const [cyr, lat] of Object.entries(TRANSLITERATION_TABLE)) {
    const lower = lat.toLowerCase();
    if (lower && lower.length === 1 && !REVERSE_TABLE[lower]) {
      REVERSE_TABLE[lower] = cyr.toLowerCase();
    }
  }
})();

// ---------------------------------------------------------------------------
// Transliteration engine
// ---------------------------------------------------------------------------

/**
 * Transliterate text character-by-character using the KMU 2010 table.
 *
 * direction "uk-to-en": Cyrillic → Latin
 * direction "en-to-uk": Latin → Cyrillic (best-effort)
 */
export function translit(text: string, direction: "uk-to-en" | "en-to-uk"): string {
  if (direction === "uk-to-en") {
    return text
      .split("")
      .map((ch) => TRANSLITERATION_TABLE[ch] ?? ch)
      .join("");
  }

  // en-to-uk: greedily match digraphs before single chars.
  const lower = text.toLowerCase();
  let result = "";
  let i = 0;
  while (i < lower.length) {
    // Try 4-char digraph first (shch).
    const four = lower.slice(i, i + 4);
    if (REVERSE_TABLE[four]) {
      result += REVERSE_TABLE[four];
      i += 4;
      continue;
    }
    const two = lower.slice(i, i + 2);
    if (REVERSE_TABLE[two]) {
      result += REVERSE_TABLE[two];
      i += 2;
      continue;
    }
    const one = lower[i];
    result += REVERSE_TABLE[one] ?? one;
    i += 1;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Script detection
// ---------------------------------------------------------------------------

export function detectScript(text: string): "latin" | "cyrillic" | "mixed" {
  let latin = 0;
  let cyrillic = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if ((code >= 0x0041 && code <= 0x007a) || (code >= 0x00c0 && code <= 0x024f)) latin++;
    else if (code >= 0x0400 && code <= 0x04ff) cyrillic++;
  }
  if (cyrillic === 0 && latin > 0) return "latin";
  if (latin === 0 && cyrillic > 0) return "cyrillic";
  if (latin > 0 || cyrillic > 0) return "mixed";
  return "latin"; // Default for punctuation-only / numeric strings.
}

// ---------------------------------------------------------------------------
// Common spelling variants
// ---------------------------------------------------------------------------

/**
 * Well-known spelling variants for prominent names and places that analysts
 * commonly type in multiple ways.  Keys are canonical forms; values are all
 * recognised variant spellings.
 */
export const COMMON_SPELLING_VARIANTS: Record<string, string[]> = {
  Zelensky: ["Zelensky", "Zelenskyy", "Zelenskiy", "Zelenskyi", "Зеленський"],
  Kyiv: ["Kyiv", "Kiev", "Київ", "Kiiv"],
  Kharkiv: ["Kharkiv", "Kharkov", "Харків"],
  Zaporizhzhia: ["Zaporizhzhia", "Zaporizhia", "Zaporozhye", "Запоріжжя"],
  Odesa: ["Odesa", "Odessa", "Одеса"],
  Kherson: ["Kherson", "Херсон"],
  Donetsk: ["Donetsk", "Донецьк", "Donets'k"],
  Luhansk: ["Luhansk", "Lugansk", "Луганськ"],
  Mariupol: ["Mariupol", "Маріуполь", "Mariupol'"],
  Crimea: ["Crimea", "Крим", "Krym"],
  Dnipro: ["Dnipro", "Dnepr", "Dnepropetrovsk", "Дніпро"],
  Bakhmut: ["Bakhmut", "Артемівськ", "Artemivsk"],
  Sloviansk: ["Sloviansk", "Slaviansk", "Слов'янськ"],
  Kramatorsk: ["Kramatorsk", "Краматорськ"],
  Melitopol: ["Melitopol", "Мелітополь"],
  Berdyansk: ["Berdyansk", "Berdiansk", "Бердянськ"],
  HIMARS: ["HIMARS", "himars", "Himars"],
  Bayraktar: ["Bayraktar", "Bayraktar TB2", "TB2", "Байрактар"],
  Shahed: ["Shahed", "shahed", "Shahed-136", "Geran-2", "Герань-2"],
  Javelin: ["Javelin", "FGM-148", "javelin"],
  "Залужний": ["Залужний", "Zaluzhny", "Zaluzhnyi", "Zaluzhni"],
  Bucha: ["Bucha", "Буча"],
  Irpin: ["Irpin", "Irpen", "Ірпінь"],
  Izium: ["Izium", "Izyum", "Ізюм"],
};

// ---------------------------------------------------------------------------
// Query normalisation
// ---------------------------------------------------------------------------

/**
 * Return all plausible search variants for a query in the given locale.
 *
 * Steps:
 *   1. Add the original query.
 *   2. If Cyrillic → add Latin transliteration variant.
 *   3. If Latin → add Cyrillic transliteration variant.
 *   4. Add any known spelling variants for tokens found in the query.
 */
export function normalizeQuery(query: string, locale: "en" | "uk"): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const variants = new Set<string>();
  variants.add(trimmed);

  const script = detectScript(trimmed);

  if (script === "cyrillic" || script === "mixed") {
    variants.add(translit(trimmed, "uk-to-en"));
  }
  if (script === "latin" || script === "mixed") {
    variants.add(translit(trimmed, "en-to-uk"));
  }

  // Spelling variant expansion.
  const lowerQuery = trimmed.toLowerCase();
  for (const [canonical, allVariants] of Object.entries(COMMON_SPELLING_VARIANTS)) {
    const matched = allVariants.some((v) => lowerQuery.includes(v.toLowerCase()));
    if (matched) {
      for (const v of allVariants) variants.add(v);
      variants.add(canonical);
    }
  }

  // Remove empty strings.
  variants.delete("");
  return Array.from(variants);
}
