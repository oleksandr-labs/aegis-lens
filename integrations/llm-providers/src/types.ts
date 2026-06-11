/**
 * Core types for the multi-provider LLM abstraction.
 *
 * Three providers implement the {@link LlmProvider} interface:
 *   - Anthropic Claude (primary copilot / summarization / reports) — Sprint 1.3.
 *   - OpenAI (failover + specialty models).
 *   - Open-weights (HuggingFace Inference / self-hosted vLLM) — sovereignty fallback.
 *
 * House default model ids are the LATEST Claude releases (Opus 4.x / Sonnet 4.x /
 * Haiku 4.x). Never hardcode legacy ids (claude-3-*, claude-2-*).
 */

export type ProviderId = "anthropic" | "openai" | "openweights";

/** A feature/surface that consumes the LLM — used for per-feature cost accounting. */
export type LlmFeature =
  | "copilot"
  | "summarization"
  | "reports"
  | "misinfo"
  | "entity-extraction"
  | "auto-tagging"
  | "rule-builder"
  | "eval"
  | "other";

export type LlmRole = "system" | "user" | "assistant" | "tool";

export interface LlmMessage {
  role: LlmRole;
  content: string;
  /** Set on a `tool` role message — the id of the tool_use/tool_call being answered. */
  toolCallId?: string;
  /** Optional name (e.g. tool name) — passed through to providers that accept it. */
  name?: string;
}

/**
 * Provider-agnostic tool specification. {@link toAnthropicTools},
 * {@link toOpenAITools}, {@link toOpenWeightsTools} in `tool-calling.ts` translate
 * this into each provider's wire format.
 */
export interface ToolSpec {
  name: string;
  description: string;
  /** JSON Schema for the tool's input object. */
  parameters: JsonSchema;
}

/** Minimal JSON-Schema subset shared across providers (no recursion guarantees). */
export interface JsonSchema {
  type: "object" | "string" | "number" | "integer" | "boolean" | "array" | "null";
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: (string | number | boolean)[];
  description?: string;
  additionalProperties?: boolean;
}

/** A tool invocation requested by the model, normalized across providers. */
export interface ToolCall {
  id: string;
  name: string;
  /** Parsed arguments object (already JSON.parse'd). */
  arguments: Record<string, unknown>;
}

export interface CompletionOptions {
  /** Override the provider's default model id. */
  model?: string;
  maxTokens?: number;
  /** Provider-agnostic; clamped/dropped per provider (e.g. Opus 4.x rejects it). */
  temperature?: number;
  system?: string;
  tools?: ToolSpec[];
  /** Force / forbid / auto tool use, when the provider supports it. */
  toolChoice?: "auto" | "required" | "none";
  /** Mark stable prefixes for caching — see prompt-cache.ts. */
  enableCaching?: boolean;
  /** Feature label for cost accounting. */
  feature?: LlmFeature;
  /** Tenant id for BYOK key resolution + per-tenant cost rollups. */
  tenantId?: string;
  /** Abort/timeout signal. */
  signal?: AbortSignal;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  /** Tokens written to the cache (Anthropic) — billed at a write premium. */
  cacheCreationTokens?: number;
  /** Tokens served from cache (Anthropic prompt caching / OpenAI cached prefix). */
  cacheReadTokens?: number;
}

export type StopReason =
  | "end_turn"
  | "max_tokens"
  | "tool_use"
  | "stop_sequence"
  | "refusal"
  | "error";

export interface CompletionResult {
  text: string;
  provider: ProviderId;
  model: string;
  /** Whether this was a real network call or a deterministic fake (no key set). */
  mode: "live" | "fake";
  usage: TokenUsage;
  stopReason: StopReason;
  toolCalls?: ToolCall[];
}

/** One chunk in a provider-agnostic stream (see streaming.ts). */
export type StreamChunk =
  | { type: "text"; text: string }
  | { type: "tool_call_start"; id: string; name: string }
  | { type: "tool_call_delta"; id: string; argsDelta: string }
  | { type: "tool_call_stop"; id: string }
  | { type: "done"; result: CompletionResult };

/**
 * The contract every provider client implements.
 *
 * - `complete` — one-shot completion (may include tool calls).
 * - `stream`   — async iterator of {@link StreamChunk}, terminated by a `done` chunk.
 * - `supportsTools` / `supportsStreaming` — capability flags for the router.
 */
export interface LlmProvider {
  readonly id: ProviderId;
  readonly defaultModel: string;
  readonly supportsTools: boolean;
  readonly supportsStreaming: boolean;

  /** True when a real API key/endpoint is configured (else fake-mode). */
  isConfigured(tenantId?: string): boolean;

  complete(messages: LlmMessage[], opts?: CompletionOptions): Promise<CompletionResult>;

  stream(
    messages: LlmMessage[],
    opts?: CompletionOptions,
  ): AsyncIterable<StreamChunk>;
}

/** Health snapshot used by the failover router. */
export interface ProviderHealth {
  provider: ProviderId;
  healthy: boolean;
  consecutiveFailures: number;
  lastError?: string;
  lastCheckedAt: string;
  /** Epoch ms until which the provider is in an open-circuit (skip) state. */
  cooldownUntil?: number;
}
