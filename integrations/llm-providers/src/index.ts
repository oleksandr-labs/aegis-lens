/**
 * @ua-map/llm-providers — multi-provider LLM abstraction for Aegis Lens.
 *
 * Anthropic Claude (primary) · OpenAI (failover + specialty) · open-weights
 * (HuggingFace / self-hosted vLLM, sovereignty). All three implement the unified
 * `LlmProvider` interface. Use `defaultRouter` for outage-resilient routing.
 */

export * from "./types";
export * from "./models";
export * from "./byok";
export * from "./pii-pre-send";
export * from "./tool-calling";
export * from "./prompt-cache";
export * from "./cost-tracking";
export * from "./streaming";
export * from "./anthropic-client";
export * from "./openai-client";
export * from "./openweights-client";
export * from "./failover-router";
export * from "./eval-suite";
