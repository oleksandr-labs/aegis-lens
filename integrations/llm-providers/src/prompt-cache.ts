/**
 * Prompt caching helpers.
 *
 * - Anthropic: explicit prefix caching via `cache_control: {type:"ephemeral"}`
 *   on the last stable block (system prompt / tool list). Prefix-match: any byte
 *   change before the breakpoint invalidates everything after it, so we only mark
 *   content the caller flags as stable.
 * - OpenAI: automatic prefix caching (no marker) — cached when the prompt prefix
 *   is >= ~1024 tokens and reused; we surface read hits from `usage`.
 * - Open-weights (vLLM): server-side prefix/KV caching is automatic; nothing to
 *   send. (HF Inference has no cross-request cache.)
 *
 * This module produces the per-provider request fragments + reads cache usage
 * back out of responses so cost-tracking can credit cache reads.
 */

import type { TokenUsage } from "./types";

export interface CacheControl {
  type: "ephemeral";
  ttl?: "5m" | "1h";
}

export const EPHEMERAL: CacheControl = { type: "ephemeral" };

/**
 * Anthropic system prompt as a cacheable block array. Returns a plain string when
 * caching is off (cheaper, no breakpoint) or the system prompt is empty.
 */
export function anthropicSystem(
  system: string | undefined,
  enableCaching: boolean | undefined,
  ttl: "5m" | "1h" = "5m",
):
  | string
  | { type: "text"; text: string; cache_control: CacheControl }[]
  | undefined {
  if (!system) return undefined;
  if (!enableCaching) return system;
  return [{ type: "text", text: system, cache_control: { type: "ephemeral", ttl } }];
}

/**
 * Attach a cache breakpoint to the last Anthropic tool definition so the whole
 * tools+system prefix caches together. Mutates a shallow copy, returns it.
 */
export function withToolCacheBreakpoint<T extends object>(
  tools: T[] | undefined,
  enableCaching: boolean | undefined,
): (T | (T & { cache_control: CacheControl }))[] | undefined {
  if (!tools || tools.length === 0 || !enableCaching) return tools;
  const copy = tools.slice();
  copy[copy.length - 1] = { ...copy[copy.length - 1], cache_control: EPHEMERAL };
  return copy;
}

/** Normalize Anthropic usage → unified TokenUsage. */
export function readAnthropicUsage(u: {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}): TokenUsage {
  return {
    inputTokens: u.input_tokens ?? 0,
    outputTokens: u.output_tokens ?? 0,
    cacheCreationTokens: u.cache_creation_input_tokens ?? 0,
    cacheReadTokens: u.cache_read_input_tokens ?? 0,
  };
}

/** Normalize OpenAI / vLLM usage → unified TokenUsage (cached prefix from details). */
export function readOpenAIUsage(u: {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
}): TokenUsage {
  const cached = u.prompt_tokens_details?.cached_tokens ?? 0;
  return {
    inputTokens: (u.prompt_tokens ?? 0) - cached,
    outputTokens: u.completion_tokens ?? 0,
    cacheReadTokens: cached,
  };
}
