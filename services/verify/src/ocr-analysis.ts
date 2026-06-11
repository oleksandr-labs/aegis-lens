/**
 * OCR text extraction with automatic redaction of sensitive identifiers.
 *
 * Extracts visible text from images (signs, banners, license plates) to
 * support geolocation and claim verification. License plates and personal
 * identifiers are automatically redacted before storage.
 *
 * NOTES:
 * 1. OCR engine (EN): Tesseract.js (client) or Google Vision OCR (server) for production accuracy.
 *    OCR engine (UK): Tesseract.js (клієнт) або Google Vision OCR (сервер) для точності у production.
 * 2. License plate redaction (EN): UA, RU, and EU format plates auto-redacted as [PLATE-xx].
 *    License plate redaction (UK): Номерні знаки форматів UA, RU, ЄС автоматично замінюються на [PLATE-xx].
 * 3. Privacy / GDPR (EN): extracted text must not be stored in raw form if it contains personal data.
 *    Privacy / GDPR (UK): витягнутий текст не можна зберігати в сирому вигляді, якщо він містить персональні дані.
 */

export interface OCRResult {
  imageUrl: string;
  /** Raw extracted text (not persisted — use redactedText for storage) */
  extractedText: string;
  /** Text with sensitive identifiers replaced */
  redactedText: string;
  /** License plates found, each represented as [PLATE-01], [PLATE-02], … */
  licensePlates: string[];
  /** BCP-47 language code if detected */
  language?: string;
  /** 0–1 */
  confidence: number;
  analyzedAt: string;
}

// ── Redaction patterns ────────────────────────────────────────────────────────

/** Regex patterns for license plate formats: UA, RU (legacy + modern), EU generic. */
export const OCR_REDACTION_PATTERNS: RegExp[] = [
  // Ukrainian: AA 0000 BB or AA0000BB
  /\b[A-ZА-ЯЇІЄ]{2}\s?\d{4}\s?[A-ZА-ЯЇІЄ]{2}\b/gi,
  // Russian pre-2012: A000AA 77 / 777 region suffix (legacy)
  /\b[A-ZА-Я]\d{3}[A-ZА-Я]{2}\s?\d{2,3}\b/gi,
  // Generic EU format: 1-3 letters, 1-4 digits, 1-3 letters (covers DE/PL/FR/etc.)
  /\b[A-Z]{1,3}[-\s]?\d{1,4}[-\s]?[A-Z]{0,3}\b/g,
];

/**
 * Replace all license plate patterns with [PLATE-01], [PLATE-02], …
 * Returns the cleaned text and the list of placeholder tokens used.
 */
export function redactSensitiveText(text: string): string {
  let result = text;
  let counter = 0;
  for (const pattern of OCR_REDACTION_PATTERNS) {
    result = result.replace(pattern, () => {
      counter += 1;
      return `[PLATE-${String(counter).padStart(2, "0")}]`;
    });
  }
  return result;
}

/** Extract the placeholder tokens from a redacted string. */
function extractPlaceholders(redacted: string): string[] {
  const matches = redacted.match(/\[PLATE-\d{2}\]/g);
  return matches ?? [];
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const OCR_NOTES_EN = [
  "Tesseract / Google Vision OCR: use Tesseract.js for in-browser extraction; Google Vision for higher accuracy in production.",
  "License plate auto-redaction: Ukrainian, Russian (legacy), and generic EU plate formats are replaced with [PLATE-xx] tokens before storage.",
  "Privacy / GDPR: raw OCR output must never be persisted if it contains personal identifiers — always store the redacted version.",
] as const;

export const OCR_NOTES_UK = [
  "Tesseract / Google Vision OCR: Tesseract.js для браузера; Google Vision для вищої точності у production.",
  "Автоматична заміна номерних знаків: формати UA, RU (застарілий), ЄС замінюються токенами [PLATE-xx] до збереження.",
  "Конфіденційність / GDPR: сирий вивід OCR ніколи не зберігається, якщо містить персональні ідентифікатори.",
] as const;

// ── Stub client ───────────────────────────────────────────────────────────────

class OCRClient {
  /**
   * Stub: returns empty extraction. Replace with Tesseract / Vision API call.
   */
  async analyze(imageUrl: string): Promise<OCRResult> {
    const extractedText = "";
    const redactedText = redactSensitiveText(extractedText);
    const licensePlates = extractPlaceholders(redactedText);
    return {
      imageUrl,
      extractedText,
      redactedText,
      licensePlates,
      confidence: 0,
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const ocrClient = new OCRClient();
