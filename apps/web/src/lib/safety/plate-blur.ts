/**
 * License Plate Auto-Blur — detect and redact vehicle plates in images/text refs.
 *
 * Supports UA, RU, and EU plate formats via regex patterns.
 * Detection is a stub; in production wire up a CV model (e.g. YOLOv8 + OCR).
 *
 * Виявлення та розмиття номерних знаків транспортних засобів.
 * Патерни: UA, RU, ЄС-формат. Стаб; у продакшені — CV-модель.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const PLATE_BLUR_NOTE_EN =
  "Plate detection is a regex/OCR stub. Wire up a dedicated ANPR model before production use.";

export const PLATE_BLUR_NOTE_UK =
  "Виявлення номерів — стаб на регексах/OCR. Перед продакшеном підключити ANPR-модель.";

// ── Plate regex patterns ──────────────────────────────────────────────────────

/**
 * Per-country regex patterns for license plate text detection.
 * Applied to OCR output or text overlays extracted from images.
 *
 * Регулярні вирази для розпізнавання номерних знаків різних країн.
 */
export const PLATE_REGEX_PATTERNS: Record<string, RegExp> = {
  /** Ukrainian plates: AA 1234 BB or AA1234BB */
  UA: /\b[ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{2}\s?\d{4}\s?[ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{2}\b/i,

  /** Russian plates: A 123 BC 77 or A123BC77 */
  RU: /\b[АВЕКМНОРСТУХ]{1}\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}\b/i,

  /** EU generic: 1-3 letters + 3-4 digits + optional country letters */
  EU: /\b[A-Z]{1,3}[-\s]?\d{3,4}[-\s]?[A-Z]{0,3}\b/,

  /** UK plates: AB51 ABC or similar */
  UK: /\b[A-Z]{2}\d{2}\s?[A-Z]{3}\b/i,

  /** German plates: M AB 1234 */
  DE: /\b[A-ZÄÖÜ]{1,3}[-\s][A-Z]{1,2}[-\s]\d{1,4}[HE]?\b/i,

  /** Polish plates: WA 12345 */
  PL: /\b[A-Z]{1,3}\s?\d{5}\b/i,
};

// ── Result type ───────────────────────────────────────────────────────────────

export interface PlateBlurResult {
  /** Reference to the image being processed */
  imageRef: string;
  /** Country code of detected plate (or 'UNKNOWN') */
  countryCode: string;
  /** Raw plate text as read by OCR (stub returns synthetic value) */
  plateText: string;
  /** Character offset (if detected in text overlay) */
  offset: number | null;
  /** Whether blur was applied to this plate */
  blurred: boolean;
}

// ── detectPlates ──────────────────────────────────────────────────────────────

/**
 * Detect license plate patterns in `imageRef` (stub: treats ref as text probe).
 * In production, this function calls an ANPR microservice with the actual image bytes.
 *
 * Виявляє номерні знаки у зображенні (стаб — обробляє imageRef як текстовий рядок).
 */
export function detectPlates(imageRef: string): PlateBlurResult[] {
  const results: PlateBlurResult[] = [];

  for (const [country, pattern] of Object.entries(PLATE_REGEX_PATTERNS)) {
    const match = pattern.exec(imageRef);
    if (match) {
      results.push({
        imageRef,
        countryCode: country,
        plateText: match[0],
        offset: match.index,
        blurred: true, // stub: assume blur applied
      });
    }
  }

  return results;
}
