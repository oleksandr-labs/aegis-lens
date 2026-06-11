import "server-only";

/**
 * LLM provider abstraction.
 *
 * - If `ANTHROPIC_API_KEY` is set → real Claude call.
 * - Otherwise → deterministic fake-mode (used in dev + when key absent).
 *
 * Switching providers in future: add another branch here without touching callers.
 */

export type LLMMessage = { role: "user" | "assistant" | "system"; content: string };

export type LLMResult = {
  text: string;
  /** Provider name actually used. */
  mode: "anthropic" | "fake";
  /** Optional model id. */
  model: string;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export async function generate(opts: {
  system: string;
  messages: LLMMessage[];
  maxTokens?: number;
}): Promise<LLMResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { text: fakeAnswer(opts), mode: "fake", model: "seed-aggregator-v0" };
  }

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? 800,
        system: opts.system,
        messages: opts.messages.filter((m) => m.role !== "system"),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text =
      json.content
        ?.map((c) => (c.type === "text" ? c.text : ""))
        .filter(Boolean)
        .join("\n") ?? "";
    return { text, mode: "anthropic", model: DEFAULT_MODEL };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[llm] anthropic call failed, falling back to fake:", err);
    }
    return {
      text: fakeAnswer(opts) + "\n\n(fell back to fake-mode due to provider error)",
      mode: "fake",
      model: "seed-aggregator-v0",
    };
  }
}

/**
 * Deterministic fake answer — mirrors the prompt + most recent user message.
 */
function fakeAnswer(opts: { messages: LLMMessage[]; system: string }): string {
  const lastUser =
    [...opts.messages].reverse().find((m) => m.role === "user")?.content ?? "(empty)";
  return [
    "Synthetic AI response · grounded in the structured context supplied (no LLM call).",
    "",
    `Prompt: "${lastUser.slice(0, 200)}"`,
    "",
    `Set ANTHROPIC_API_KEY in .env.local to switch to a real Claude call.`,
  ].join("\n");
}
