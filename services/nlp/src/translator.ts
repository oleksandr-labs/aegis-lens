/**
 * Translation implementations.
 *
 * Primary:  DeepL REST API
 * Fallback: NLLB-200 self-hosted REST endpoint
 */

import type { Translator } from "./pipeline";
import type { TranslationResult } from "./types";

// ── DeepL ─────────────────────────────────────────────────────────────────────

const DEEPL_LANG_MAP: Record<string, string> = {
  uk: "UK",
  ru: "RU",
  en: "EN-US",
  de: "DE",
  fr: "FR",
  pl: "PL",
};

export class DeepLTranslator implements Translator {
  private readonly baseUrl: string;

  constructor(
    private readonly apiKey: string,
    private readonly plan: "free" | "pro" = "free",
  ) {
    this.baseUrl =
      plan === "pro"
        ? "https://api.deepl.com/v2"
        : "https://api-free.deepl.com/v2";
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<TranslationResult> {
    const src = DEEPL_LANG_MAP[sourceLang] ?? sourceLang.toUpperCase();
    const tgt = DEEPL_LANG_MAP[targetLang] ?? targetLang.toUpperCase();

    const res = await fetch(`${this.baseUrl}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        source_lang: src,
        target_lang: tgt,
      }),
    });

    if (!res.ok) {
      throw new Error(`DeepL error ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as { translations: { text: string }[] };
    return {
      source_language: sourceLang,
      target_language: targetLang,
      original: text,
      translated: json.translations[0]?.text ?? text,
      provider: "deepl",
    };
  }
}

// ── NLLB (self-hosted) ────────────────────────────────────────────────────────

const NLLB_LANG_MAP: Record<string, string> = {
  uk: "ukr_Cyrl",
  ru: "rus_Cyrl",
  en: "eng_Latn",
  de: "deu_Latn",
  fr: "fra_Latn",
  pl: "pol_Latn",
};

export class NLLBTranslator implements Translator {
  constructor(private readonly endpointUrl: string) {}

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<TranslationResult> {
    const src = NLLB_LANG_MAP[sourceLang] ?? `${sourceLang}_Latn`;
    const tgt = NLLB_LANG_MAP[targetLang] ?? `${targetLang}_Latn`;

    const res = await fetch(this.endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, src_lang: src, tgt_lang: tgt }),
    });

    if (!res.ok) {
      throw new Error(`NLLB error ${res.status}`);
    }

    const json = (await res.json()) as { translation: string };
    return {
      source_language: sourceLang,
      target_language: targetLang,
      original: text,
      translated: json.translation,
      provider: "nllb",
    };
  }
}

// ── Fallback chain ────────────────────────────────────────────────────────────

export class FallbackTranslator implements Translator {
  constructor(
    private readonly primary: Translator,
    private readonly fallback: Translator,
  ) {}

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<TranslationResult> {
    try {
      return await this.primary.translate(text, sourceLang, targetLang);
    } catch {
      return this.fallback.translate(text, sourceLang, targetLang);
    }
  }
}
