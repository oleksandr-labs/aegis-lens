/**
 * Tool-calling abstraction across providers.
 *
 * One {@link ToolSpec} → each provider's native tool format. Also normalizes the
 * various tool-call response shapes back into the unified {@link ToolCall}.
 *
 *   Anthropic : { name, description, input_schema }       → tool_use blocks
 *   OpenAI    : { type:"function", function:{...} }        → tool_calls[].function
 *   OpenWeights: OpenAI-compatible (vLLM / HF TGI)         → same as OpenAI
 */

import type { ToolSpec, ToolCall, JsonSchema } from "./types";

// ── ToolSpec → provider wire formats ────────────────────────────────────────

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: JsonSchema;
}

export function toAnthropicTools(tools: ToolSpec[]): AnthropicTool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

export interface OpenAITool {
  type: "function";
  function: { name: string; description: string; parameters: JsonSchema };
}

export function toOpenAITools(tools: ToolSpec[]): OpenAITool[] {
  return tools.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

/** Open-weights endpoints (vLLM / HF TGI) are OpenAI tool-format compatible. */
export const toOpenWeightsTools = toOpenAITools;

// ── tool_choice translation ─────────────────────────────────────────────────

export function toAnthropicToolChoice(
  choice?: "auto" | "required" | "none",
): { type: "auto" | "any" | "none" } | undefined {
  if (!choice) return undefined;
  if (choice === "required") return { type: "any" };
  return { type: choice };
}

export function toOpenAIToolChoice(
  choice?: "auto" | "required" | "none",
): "auto" | "required" | "none" | undefined {
  return choice; // OpenAI accepts the same literals.
}

// ── response normalization → ToolCall[] ──────────────────────────────────────

/** Anthropic `content` blocks → ToolCall[]. */
export function parseAnthropicToolCalls(
  content: { type: string; id?: string; name?: string; input?: unknown }[],
): ToolCall[] {
  return content
    .filter((b) => b.type === "tool_use")
    .map((b) => ({
      id: b.id ?? "",
      name: b.name ?? "",
      arguments: (b.input as Record<string, unknown>) ?? {},
    }));
}

/** OpenAI / vLLM `message.tool_calls` → ToolCall[]. */
export function parseOpenAIToolCalls(
  toolCalls: { id: string; function: { name: string; arguments: string } }[] | undefined,
): ToolCall[] {
  if (!toolCalls) return [];
  return toolCalls.map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParse(tc.function.arguments),
  }));
}

/** vLLM/TGI sometimes emit slightly off JSON — never raw-string-match; parse defensively. */
function safeParse(s: string): Record<string, unknown> {
  try {
    const v = JSON.parse(s);
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
