/**
 * Canonical model ids. House default = the LATEST Claude releases.
 * NEVER use legacy ids (claude-3-*, claude-2-*, gpt-3.5-*).
 *
 * Overridable via env so ops can pin/bump without a code change:
 *   ANTHROPIC_MODEL, OPENAI_MODEL, OPENWEIGHTS_MODEL.
 */

export const CLAUDE_MODELS = {
  /** Most capable — long-horizon agentic work, hard reasoning. */
  opus: "claude-opus-4-8",
  /** Best speed/intelligence balance — default workhorse. */
  sonnet: "claude-sonnet-4-6",
  /** Fastest / cheapest — classification, high-volume. */
  haiku: "claude-haiku-4-5",
} as const;

export const OPENAI_MODELS = {
  /** General default for failover. */
  default: "gpt-4o",
  /** Cheap/fast tier. */
  mini: "gpt-4o-mini",
} as const;

/**
 * Open-weights default. Self-hosted vLLM or HF Inference both serve OpenAI-style
 * `/v1/chat/completions`, so we key off the served model id.
 */
export const OPENWEIGHTS_MODELS = {
  default: "meta-llama/Llama-3.3-70B-Instruct",
} as const;

export function resolveAnthropicModel(override?: string): string {
  return override ?? process.env.ANTHROPIC_MODEL ?? CLAUDE_MODELS.haiku;
}

export function resolveOpenAIModel(override?: string): string {
  return override ?? process.env.OPENAI_MODEL ?? OPENAI_MODELS.default;
}

export function resolveOpenWeightsModel(override?: string): string {
  return override ?? process.env.OPENWEIGHTS_MODEL ?? OPENWEIGHTS_MODELS.default;
}

/** Adaptive-thinking-only models reject `temperature`/`top_p`/`top_k` (400). */
export function modelRejectsSamplingParams(model: string): boolean {
  return /^claude-opus-4-(7|8)/.test(model);
}
