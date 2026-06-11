/**
 * Translation Pipeline — typed contract + TranslationPipeline service
 *
 * Provider chain: DeepL → Lingvanex → LLM fallback.
 * Builds on the existing DeepLTranslator / NLLBTranslator implementations
 * in translator.ts, adding a job-oriented API, quality scoring, and batch support.
 *
 * Phase 1 — Translation pipeline (UK/RU/EN tier-1)
 */

// ── Tier-1 language pairs ─────────────────────────────────────────────────────

/** High-priority direction pairs that receive the full provider chain. */
export const TIER1_LANGUAGE_PAIRS: Set<string> = new Set([
  "uk→en",
  "en→uk",
  "ru→en",
  "en→ru",
  "uk→ru",
  "ru→uk",
]);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TranslationJob {
  jobId: string;
  sourceText: string;
  sourceLang: "uk" | "ru" | "en" | "auto";
  targetLangs: string[];
  priority: "high" | "normal" | "low";
  /** Optional: associate with an event for context-aware translation. */
  eventId?: string;
}

export interface TranslationResult {
  jobId: string;
  /** Map of targetLang → translated text. */
  translations: Record<string, string>;
  /** Language actually detected/used when sourceLang was 'auto'. */
  detectedSourceLang: string;
  /** Which provider successfully handled this job. */
  providerUsed: "deepl" | "lingvanex" | "llm-fallback";
  /** 0-1 estimated quality. DeepL tier-1 ≈ 0.95, LLM fallback ≈ 0.75. */
  qualityScore: number;
}

// ── Provider interfaces ───────────────────────────────────────────────────────

interface ProviderResult {
  translatedText: string;
  detectedLang: string;
  provider: "deepl" | "lingvanex" | "llm-fallback";
}

// ── DeepL adapter ─────────────────────────────────────────────────────────────

const DEEPL_LANG_MAP: Record<string, string> = {
  uk: "UK",
  ru: "RU",
  en: "EN-US",
  de: "DE",
  fr: "FR",
  pl: "PL",
};

async function callDeepL(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<ProviderResult | null> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) return null;

  const baseUrl =
    process.env.DEEPL_PLAN === "pro"
      ? "https://api.deepl.com/v2"
      : "https://api-free.deepl.com/v2";

  const src = sourceLang === "auto" ? undefined : (DEEPL_LANG_MAP[sourceLang] ?? sourceLang.toUpperCase());
  const tgt = DEEPL_LANG_MAP[targetLang] ?? targetLang.toUpperCase();

  try {
    const res = await fetch(`${baseUrl}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        ...(src ? { source_lang: src } : {}),
        target_lang: tgt,
      }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      translations: { text: string; detected_source_language: string }[];
    };
    const t = json.translations[0];
    if (!t) return null;

    return {
      translatedText: t.text,
      detectedLang: t.detected_source_language?.toLowerCase() ?? sourceLang,
      provider: "deepl",
    };
  } catch {
    return null;
  }
}

// ── Lingvanex adapter ─────────────────────────────────────────────────────────

async function callLingvanex(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<ProviderResult | null> {
  const apiKey = process.env.LINGVANEX_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api-b2b.backenster.com/b1/api/v3/translate", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: "api",
        from: sourceLang === "auto" ? undefined : `${sourceLang}_${sourceLang.toUpperCase()}`,
        to: `${targetLang}_${targetLang.toUpperCase()}`,
        data: text,
        enableTransliteration: false,
      }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as { result: string; err: unknown };
    if (json.err || !json.result) return null;

    return {
      translatedText: json.result,
      detectedLang: sourceLang === "auto" ? "en" : sourceLang,
      provider: "lingvanex",
    };
  } catch {
    return null;
  }
}

// ── LLM fallback adapter ──────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

async function callLLMFallback(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<ProviderResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const langName = (code: string) =>
    code === "uk" ? "Ukrainian" : code === "ru" ? "Russian" : "English";

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 1200,
        system: `Translate from ${langName(sourceLang)} to ${langName(targetLang)}. Output only the translated text — no explanations.`,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const translated =
      json.content
        ?.map((c) => (c.type === "text" ? c.text : ""))
        .filter(Boolean)
        .join("") ?? text;

    return { translatedText: translated, detectedLang: sourceLang, provider: "llm-fallback" };
  } catch {
    return null;
  }
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

const QUALITY_SCORES: Record<ProviderResult["provider"], number> = {
  deepl: 0.95,
  lingvanex: 0.82,
  "llm-fallback": 0.75,
};

class TranslationPipeline {
  async translate(job: TranslationJob): Promise<TranslationResult> {
    const translations: Record<string, string> = {};
    let detectedSourceLang: string = job.sourceLang === "auto" ? "en" : job.sourceLang;
    let providerUsed: TranslationResult["providerUsed"] = "llm-fallback";
    let qualityScore = 0.5;

    for (const targetLang of job.targetLangs) {
      if (targetLang === job.sourceLang) {
        translations[targetLang] = job.sourceText;
        continue;
      }

      const result =
        (await callDeepL(job.sourceText, job.sourceLang, targetLang)) ??
        (await callLingvanex(job.sourceText, job.sourceLang, targetLang)) ??
        (await callLLMFallback(job.sourceText, job.sourceLang, targetLang));

      if (result) {
        translations[targetLang] = result.translatedText;
        detectedSourceLang = result.detectedLang;
        providerUsed = result.provider;
        qualityScore = QUALITY_SCORES[result.provider];
      } else {
        // Last resort: return source text unchanged
        translations[targetLang] = job.sourceText;
        qualityScore = 0;
      }
    }

    return {
      jobId: job.jobId,
      translations,
      detectedSourceLang,
      providerUsed,
      qualityScore,
    };
  }

  async batchTranslate(jobs: TranslationJob[]): Promise<TranslationResult[]> {
    // High-priority jobs first, then parallel execution per priority tier
    const sorted = [...jobs].sort((a, b) => {
      const rank = { high: 0, normal: 1, low: 2 };
      return rank[a.priority] - rank[b.priority];
    });
    return Promise.all(sorted.map((j) => this.translate(j)));
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const translationPipeline = new TranslationPipeline();
export { TranslationPipeline };
