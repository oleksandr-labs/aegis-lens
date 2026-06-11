import type { DetectionResult, SupportedLocale } from "./types";

/**
 * Language detection.
 * Uses script heuristics as a fast pre-filter, then delegates to a model API.
 */
export interface LanguageDetector {
  detect(text: string): Promise<DetectionResult>;
}

/**
 * Heuristic-only detector (no network call).
 * Accurate enough for UA/RU/EN triaging; use model-backed detector for production.
 */
export class HeuristicLanguageDetector implements LanguageDetector {
  // UA-specific letters not in RU
  private static readonly UA_ONLY = /[іїєґ]/i;
  // RU-specific letters not in UA
  private static readonly RU_ONLY = /[ыъэё]/i;
  private static readonly CYRILLIC = /[Ѐ-ӿ]/;
  private static readonly LATIN = /[a-zA-Z]/;

  async detect(text: string): Promise<DetectionResult> {
    const hasCyrillic = HeuristicLanguageDetector.CYRILLIC.test(text);
    const hasLatin = HeuristicLanguageDetector.LATIN.test(text);

    if (hasCyrillic && !hasLatin) {
      const uaCount = (text.match(HeuristicLanguageDetector.UA_ONLY) ?? []).length;
      const ruCount = (text.match(HeuristicLanguageDetector.RU_ONLY) ?? []).length;

      if (uaCount > ruCount) {
        return { language: "uk", confidence: 0.85, script: "Cyrillic" };
      }
      if (ruCount > uaCount) {
        return { language: "ru", confidence: 0.85, script: "Cyrillic" };
      }
      return { language: "uk", confidence: 0.55, script: "Cyrillic" };
    }

    if (hasLatin && !hasCyrillic) {
      return { language: "en", confidence: 0.75, script: "Latin" };
    }

    return { language: "uk", confidence: 0.4, script: "Cyrillic" };
  }
}

/**
 * Model-backed detector via a REST API (e.g. fasttext lid.176.bin server).
 */
export class ModelLanguageDetector implements LanguageDetector {
  constructor(private readonly endpoint: string) {}

  async detect(text: string): Promise<DetectionResult> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 500) }),
    });

    if (!res.ok) {
      // Fallback to heuristic
      return new HeuristicLanguageDetector().detect(text);
    }

    const data = await res.json() as { language: string; confidence: number };
    const script = /[Ѐ-ӿ]/.test(text) ? "Cyrillic" : "Latin";
    return {
      language: data.language as SupportedLocale,
      confidence: data.confidence,
      script,
    };
  }
}
