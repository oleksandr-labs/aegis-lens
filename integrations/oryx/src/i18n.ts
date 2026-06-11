/**
 * Equipment-name internationalisation for Oryx entries.
 *
 * Oryx publishes model names in English/Latin (e.g. "T-72B3", "Leopard 2A6").
 * Aegis Lens surfaces equipment to Ukrainian readers, so we provide:
 *   - a curated en→uk lookup for the most common models, and
 *   - a deterministic Latin→Cyrillic transliteration fallback for the long tail.
 *
 * Alphanumeric NATO/GRAU designators (T-72, BMP-2, S-400) are kept verbatim —
 * only the descriptive word parts are transliterated.
 */

/** Curated Ukrainian names for frequently-seen models. */
const UK_NAMES: Record<string, string> = {
  "t-72b3": "Т-72Б3",
  "t-90m proryv": "Т-90М «Прорив»",
  "t-80bvm": "Т-80БВМ",
  "t-64bv": "Т-64БВ",
  "bmp-2": "БМП-2",
  "bmp-3": "БМП-3",
  "btr-82a": "БТР-82А",
  "2s19 msta-s": "2С19 «Мста-С»",
  "2s1 gvozdika": "2С1 «Гвоздика»",
  "s-400 triumf": "С-400 «Тріумф»",
  "su-34": "Су-34",
  "su-25": "Су-25",
  "leopard 2a6": "Leopard 2A6",
  "m2a2 bradley": "M2A2 Bradley",
  "project 11356 frigate": "фрегат проєкту 11356",
};

/** Descriptive word → Ukrainian, used by the transliteration fallback. */
const WORD_UK: Record<string, string> = {
  proryv: "Прорив",
  triumf: "Тріумф",
  gvozdika: "Гвоздика",
  frigate: "фрегат",
  project: "проєкт",
  tank: "танк",
  destroyed: "знищено",
};

const LATIN_TO_CYRILLIC: Record<string, string> = {
  shch: "щ", sh: "ш", ch: "ч", kh: "х", ts: "ц", ya: "я", yu: "ю",
  ye: "є", yi: "ї", zh: "ж", a: "а", b: "б", v: "в", h: "г", g: "ґ",
  d: "д", e: "е", z: "з", y: "и", i: "і", k: "к", l: "л", m: "м",
  n: "н", o: "о", p: "п", r: "р", s: "с", t: "т", u: "у", f: "ф",
  c: "ц", j: "й", w: "в", x: "кс", q: "к",
};

/** Deterministic Latin→Cyrillic transliteration of a single word. */
function translitWord(word: string): string {
  const lower = word.toLowerCase();
  if (WORD_UK[lower]) return WORD_UK[lower];
  let out = "";
  let i = 0;
  while (i < lower.length) {
    let matched = false;
    for (const len of [4, 3, 2, 1]) {
      const chunk = lower.slice(i, i + len);
      if (LATIN_TO_CYRILLIC[chunk]) {
        out += LATIN_TO_CYRILLIC[chunk];
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += lower[i];
      i += 1;
    }
  }
  // Capitalise to mirror source casing of the first letter.
  return /[A-Z]/.test(word[0] ?? "") ? out.charAt(0).toUpperCase() + out.slice(1) : out;
}

/**
 * Resolve the Ukrainian display name for an equipment model.
 * Designators (parts containing digits) are preserved verbatim; descriptive
 * words are curated-or-transliterated.
 */
export function equipmentNameUk(modelEn: string): string {
  const key = modelEn.toLowerCase().trim();
  if (UK_NAMES[key]) return UK_NAMES[key];
  return modelEn
    .split(/\s+/)
    .map((part) => (/[0-9]/.test(part) || /^[A-Z]{1,4}-/.test(part) ? part : translitWord(part)))
    .join(" ");
}

/**
 * Latin transliteration of the Ukrainian name (used for slugs and search).
 * For already-Latin model names this is effectively the lowercased name.
 */
export function transliterateModel(modelEn: string): string {
  return modelEn
    .toLowerCase()
    .replace(/['«»"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
