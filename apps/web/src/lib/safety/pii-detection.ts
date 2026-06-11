/**
 * PII Detection + Auto-Redact — detect and remove personally identifiable information.
 *
 * Covers phones, emails, physical addresses, national IDs, passports,
 * bank cards, and precise coordinates. Applied to all user-submitted text
 * before indexing or publishing.
 *
 * Виявлення та авто-видалення персональних даних з тексту перед публікацією.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const PII_NOTE_EN =
  "Regex-based PII detection. Supplement with an ML-based classifier (e.g. Presidio) in production.";

export const PII_NOTE_UK =
  "Виявлення ПДн на регексах. У продакшені доповнити ML-класифікатором (напр. Presidio).";

// ── PiiType ───────────────────────────────────────────────────────────────────

/**
 * Enumeration of PII categories the detector can identify.
 *
 * Категорії персональних даних, які виявляє детектор.
 */
export enum PiiType {
  Phone = "phone",
  Email = "email",
  Address = "address",
  NationalId = "national-id",
  Passport = "passport",
  BankCard = "bank-card",
  CoordinatesPrecise = "coordinates-precise",
}

// ── Redaction patterns ────────────────────────────────────────────────────────

/**
 * Regex patterns per PII type. Match results are replaced with a
 * [REDACTED:<type>] token in the output text.
 *
 * Патерни для кожного типу ПДн. Збіги замінюються токеном [REDACTED:<type>].
 */
export const PII_REDACTION_PATTERNS: Record<PiiType, RegExp> = {
  [PiiType.Phone]:
    /(?:\+?3?8?[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\+?\d[\d\s\-().]{9,15}\d/g,

  [PiiType.Email]: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,

  // Street-level address fragments (heuristic)
  [PiiType.Address]:
    /\b\d{1,5}[,\s]+[A-ZÀÁÂÄÆÃÅĀA][a-zàáâäæãåāa]+(?:\s[A-ZÀÁÂÄÆÃÅĀA][a-zàáâäæãåāa]+)*(?:\s(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|вулиця|вул\.|просп\.|бульв\.))[,\s]*\d{5,6}?\b/gi,

  // Ukrainian РНОКПП (10-digit) + generic national IDs
  [PiiType.NationalId]:
    /\b\d{10}\b|\b[A-Z]{1,2}\d{6,9}\b/g,

  // Ukrainian passport series + number
  [PiiType.Passport]:
    /\b[A-ZАБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{2}\s?\d{6}\b|\bID-card\s?\d{9}\b/gi,

  // Luhn-approximate bank card (13-19 digits with optional spaces/dashes)
  [PiiType.BankCard]:
    /\b(?:\d{4}[\s\-]){3}\d{4}(?:[\s\-]\d{1,3})?\b|\b\d{13,19}\b/g,

  // Precise GPS coords (>4 decimal places = household precision)
  [PiiType.CoordinatesPrecise]:
    /\b-?\d{1,3}\.\d{5,}\s*[,;]\s*-?\d{1,3}\.\d{5,}\b/g,
};

// ── detectAndRedactPii ────────────────────────────────────────────────────────

/**
 * Scan `text` for all PII patterns; replace matches with [REDACTED:<type>] tokens.
 * Returns the sanitised text and a deduplicated list of PII types found.
 *
 * Сканує текст, замінює ПДн токенами та повертає список знайдених типів.
 */
export function detectAndRedactPii(text: string): {
  redacted: string;
  findings: PiiType[];
} {
  let redacted = text;
  const findingsSet = new Set<PiiType>();

  for (const [type, pattern] of Object.entries(PII_REDACTION_PATTERNS) as [
    PiiType,
    RegExp,
  ][]) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      findingsSet.add(type);
      pattern.lastIndex = 0;
      redacted = redacted.replace(pattern, `[REDACTED:${type}]`);
    }
  }

  return { redacted, findings: Array.from(findingsSet) };
}
