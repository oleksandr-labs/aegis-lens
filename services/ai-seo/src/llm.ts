/**
 * LLM abstraction — LOOSE COUPLING.
 *
 * This service does not hard-depend on any provider package. It consumes the
 * `LLMBackend` contract (mirrors `services/reports`). Callers inject whichever
 * backend they want — the future `integrations/llm-providers`, the Anthropic
 * adapter below, or `StubBackend` for deterministic tests/offline use.
 *
 * Secrets: never hardcoded. The Anthropic adapter reads the key from
 * `process.env.ANTHROPIC_API_KEY` (documented in COMPLIANCE.md).
 *
 * House default model is the latest Claude (Haiku 4.x for cheap high-volume SEO
 * drafting). Do not hardcode legacy model ids elsewhere.
 */

import type { LLMBackend, LLMCompleteOptions, LLMResult } from "./types";

export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

/** Coarse pricing table (USD per 1M tokens) for cost estimation. Update as needed. */
export const MODEL_PRICING_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
  "claude-sonnet-4-5": { input: 3.0, output: 15.0 },
  "claude-opus-4-1": { input: 15.0, output: 75.0 },
};

/**
 * Anthropic adapter. Optional convenience — callers may inject their own.
 * Key is read from the environment, never a literal.
 */
export class AnthropicBackend implements LLMBackend {
  constructor(
    private readonly apiKey: string = process.env.ANTHROPIC_API_KEY ?? "",
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async complete(prompt: string, opts: LLMCompleteOptions = {}): Promise<LLMResult> {
    if (!this.apiKey) throw new Error("ai-seo: ANTHROPIC_API_KEY not set");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens ?? 512,
        temperature: opts.temperature ?? 0.3,
        system: opts.system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const json = (await res.json()) as {
      content: { type: string; text: string }[];
      usage?: { input_tokens: number; output_tokens: number };
      model?: string;
    };
    return {
      text: json.content.find((c) => c.type === "text")?.text ?? "",
      model: json.model ?? this.model,
      usage: json.usage
        ? { inputTokens: json.usage.input_tokens, outputTokens: json.usage.output_tokens }
        : undefined,
    };
  }
}

/**
 * Deterministic offline backend for tests / no-network environments.
 * Returns whatever the supplied responder produces (default: echoes prompt).
 */
export class StubBackend implements LLMBackend {
  constructor(
    private readonly responder: (prompt: string, opts: LLMCompleteOptions) => string = (p) => p,
    private readonly model = "stub-llm",
  ) {}

  async complete(prompt: string, opts: LLMCompleteOptions = {}): Promise<LLMResult> {
    const text = this.responder(prompt, opts);
    return {
      text,
      model: this.model,
      usage: {
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(text.length / 4),
      },
    };
  }
}
