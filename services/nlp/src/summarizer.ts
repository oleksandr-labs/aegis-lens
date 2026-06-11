/**
 * Text summarization.
 *
 * LLMSummarizer:       Claude / OpenAI API – high quality, latency ~1-3s
 * ExtractiveSummarizer: Sentence-scoring fallback – zero latency, no API
 */

import type { Summarizer } from "./pipeline";
import type { SummaryResult } from "./types";

// ── LLM Summarizer ────────────────────────────────────────────────────────────

type LLMProvider = "openai" | "anthropic";

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
};

export class LLMSummarizer implements Summarizer {
  private readonly model: string;

  constructor(private readonly config: LLMConfig) {
    this.model = config.model ?? DEFAULT_MODELS[config.provider];
  }

  async summarize(
    text: string,
    _language: string,
    targetLanguages: string[],
  ): Promise<SummaryResult[]> {
    const targets = targetLanguages.length > 0 ? targetLanguages : ["en"];
    const results: SummaryResult[] = [];

    for (const lang of targets) {
      const langLabel =
        lang === "uk" ? "Ukrainian" : lang === "ru" ? "Russian" : "English";

      const prompt = `Summarize the following conflict-related text in 1-2 sentences in ${langLabel}. Be factual and concise. Do not add commentary.\n\nText:\n${text}`;

      try {
        const summary = await this._callAPI(prompt);
        results.push({ summary, language: lang, model: this.model });
      } catch {
        // Skip this language on error
      }
    }

    return results;
  }

  private async _callAPI(prompt: string): Promise<string> {
    if (this.config.provider === "anthropic") {
      return this._callAnthropic(prompt);
    }
    return this._callOpenAI(prompt);
  }

  private async _callAnthropic(prompt: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const json = (await res.json()) as {
      content: { type: string; text: string }[];
    };
    return json.content.find((c) => c.type === "text")?.text ?? "";
  }

  private async _callOpenAI(prompt: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return json.choices[0]?.message?.content ?? "";
  }
}

// ── Extractive fallback ───────────────────────────────────────────────────────

function sentenceScore(sentence: string, allWords: Map<string, number>): number {
  const words = sentence.toLowerCase().split(/\W+/).filter(Boolean);
  if (words.length === 0) return 0;
  const score = words.reduce((s, w) => s + (allWords.get(w) ?? 0), 0);
  return score / words.length;
}

export class ExtractiveSummarizer implements Summarizer {
  async summarize(
    text: string,
    language: string,
    targetLanguages: string[],
  ): Promise<SummaryResult[]> {
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    if (sentences.length === 0) return [];

    // Simple TF-based sentence scoring
    const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

    const scored = sentences.map((s) => ({
      s,
      score: sentenceScore(s, freq),
    }));
    scored.sort((a, b) => b.score - a.score);

    const summary = scored
      .slice(0, 2)
      .map((x) => x.s.trim())
      .join(" ");

    const langs = targetLanguages.length > 0 ? targetLanguages : [language];
    return langs.map((lang) => ({
      summary,
      language: lang,
      model: "extractive",
    }));
  }
}

// ── Fallback chain ────────────────────────────────────────────────────────────

export class FallbackSummarizer implements Summarizer {
  constructor(
    private readonly primary: Summarizer,
    private readonly fallback: ExtractiveSummarizer,
  ) {}

  async summarize(
    text: string,
    language: string,
    targetLanguages: string[],
  ): Promise<SummaryResult[]> {
    try {
      const results = await this.primary.summarize(text, language, targetLanguages);
      if (results.length > 0) return results;
    } catch {
      // fall through
    }
    return this.fallback.summarize(text, language, targetLanguages);
  }
}
