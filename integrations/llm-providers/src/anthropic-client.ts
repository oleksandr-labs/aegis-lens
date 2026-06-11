/**
 * Anthropic Claude provider (PRIMARY) — Sprint 1.3.
 *
 * Implements {@link LlmProvider}: complete / stream / tool-calling, with Anthropic
 * prompt caching and PII pre-send redaction. House default model = latest Claude
 * (resolved via `resolveAnthropicModel`, never a legacy id).
 *
 * No secrets in code — the API key is resolved via BYOK (per-tenant) → env.
 */

import type {
  CompletionOptions,
  CompletionResult,
  LlmMessage,
  LlmProvider,
  StreamChunk,
} from "./types";
import { resolveAnthropicModel, modelRejectsSamplingParams } from "./models";
import { resolveKey, hasKey } from "./byok";
import { redactMessages } from "./pii-pre-send";
import {
  toAnthropicTools,
  toAnthropicToolChoice,
  parseAnthropicToolCalls,
} from "./tool-calling";
import {
  anthropicSystem,
  withToolCacheBreakpoint,
  readAnthropicUsage,
} from "./prompt-cache";
import { parseSseLines, fakeStream } from "./streaming";
import { costTracker } from "./cost-tracking";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

function mapStopReason(r: string | null | undefined): CompletionResult["stopReason"] {
  switch (r) {
    case "end_turn":
      return "end_turn";
    case "max_tokens":
      return "max_tokens";
    case "tool_use":
      return "tool_use";
    case "stop_sequence":
      return "stop_sequence";
    case "refusal":
      return "refusal";
    default:
      return "end_turn";
  }
}

/** Build the Anthropic request body (shared by complete + stream). */
function buildBody(messages: LlmMessage[], model: string, opts: CompletionOptions) {
  const { messages: clean } = redactMessages(messages);
  const tools = opts.tools ? toAnthropicTools(opts.tools) : undefined;

  const body: Record<string, unknown> = {
    model,
    max_tokens: opts.maxTokens ?? 1024,
    messages: clean
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "tool" ? "user" : m.role, content: m.content })),
  };

  const system = anthropicSystem(opts.system, opts.enableCaching);
  if (system) body.system = system;

  const cachedTools = withToolCacheBreakpoint(tools, opts.enableCaching);
  if (cachedTools) {
    body.tools = cachedTools;
    const tc = toAnthropicToolChoice(opts.toolChoice);
    if (tc) body.tool_choice = tc;
  }

  // Opus 4.7/4.8 reject temperature; only send when the model accepts it.
  if (opts.temperature != null && !modelRejectsSamplingParams(model)) {
    body.temperature = opts.temperature;
  }
  return body;
}

function headers(apiKey: string): Record<string, string> {
  return {
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "content-type": "application/json",
  };
}

export const anthropicProvider: LlmProvider = {
  id: "anthropic",
  defaultModel: resolveAnthropicModel(),
  supportsTools: true,
  supportsStreaming: true,

  isConfigured(tenantId?: string) {
    return hasKey("anthropic", tenantId);
  },

  async complete(messages, opts = {}): Promise<CompletionResult> {
    const model = resolveAnthropicModel(opts.model);
    const feature = opts.feature ?? "other";
    const key = resolveKey("anthropic", opts.tenantId);

    if (!key) {
      return fakeResult(messages, model);
    }

    const body = buildBody(messages, model, opts);
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: headers(key.apiKey),
      body: JSON.stringify(body),
      signal: opts.signal,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${errBody.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      content?: { type: string; text?: string; id?: string; name?: string; input?: unknown }[];
      stop_reason?: string;
      usage?: Record<string, number>;
    };

    const text =
      json.content
        ?.filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n") ?? "";
    const toolCalls = parseAnthropicToolCalls(json.content ?? []);
    const usage = readAnthropicUsage(json.usage ?? {});
    costTracker.record("anthropic", model, feature, usage, opts.tenantId);

    return {
      text,
      provider: "anthropic",
      model,
      mode: "live",
      usage,
      stopReason: mapStopReason(json.stop_reason),
      toolCalls: toolCalls.length ? toolCalls : undefined,
    };
  },

  async *stream(messages, opts = {}): AsyncGenerator<StreamChunk> {
    const model = resolveAnthropicModel(opts.model);
    const feature = opts.feature ?? "other";
    const key = resolveKey("anthropic", opts.tenantId);

    if (!key) {
      yield* fakeStream(fakeText(messages), "anthropic", model);
      return;
    }

    const body = { ...buildBody(messages, model, opts), stream: true };
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: headers(key.apiKey),
      body: JSON.stringify(body),
      signal: opts.signal,
    });
    if (!res.ok || !res.body) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Anthropic stream ${res.status}: ${errBody.slice(0, 200)}`);
    }

    let text = "";
    let stopReason: CompletionResult["stopReason"] = "end_turn";
    let usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 };
    const toolNames = new Map<number, { id: string; name: string }>();

    for await (const ev of parseSseLines(res.body)) {
      const type = ev.type as string;
      if (type === "message_start") {
        const u = (ev.message as { usage?: Record<string, number> })?.usage;
        if (u) usage = { ...usage, ...readAnthropicUsage(u) };
      } else if (type === "content_block_start") {
        const block = ev.content_block as { type: string; id?: string; name?: string };
        if (block?.type === "tool_use") {
          const idx = ev.index as number;
          toolNames.set(idx, { id: block.id ?? "", name: block.name ?? "" });
          yield { type: "tool_call_start", id: block.id ?? "", name: block.name ?? "" };
        }
      } else if (type === "content_block_delta") {
        const delta = ev.delta as { type: string; text?: string; partial_json?: string };
        if (delta?.type === "text_delta" && delta.text) {
          text += delta.text;
          yield { type: "text", text: delta.text };
        } else if (delta?.type === "input_json_delta" && delta.partial_json != null) {
          const t = toolNames.get(ev.index as number);
          if (t) yield { type: "tool_call_delta", id: t.id, argsDelta: delta.partial_json };
        }
      } else if (type === "message_delta") {
        const d = ev.delta as { stop_reason?: string };
        if (d?.stop_reason) stopReason = mapStopReason(d.stop_reason);
        const u = ev.usage as Record<string, number> | undefined;
        if (u?.output_tokens != null) usage.outputTokens = u.output_tokens;
      }
    }

    costTracker.record("anthropic", model, feature, usage, opts.tenantId);
    yield {
      type: "done",
      result: { text, provider: "anthropic", model, mode: "live", usage, stopReason },
    };
  },
};

// ── fake-mode (no key) ───────────────────────────────────────────────────────

function fakeText(messages: LlmMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "(empty)";
  return [
    "Synthetic Claude response (no ANTHROPIC_API_KEY set; provider-agnostic fake-mode).",
    "",
    `Prompt: "${lastUser.slice(0, 200)}"`,
  ].join("\n");
}

function fakeResult(messages: LlmMessage[], model: string): CompletionResult {
  return {
    text: fakeText(messages),
    provider: "anthropic",
    model,
    mode: "fake",
    usage: { inputTokens: 0, outputTokens: 0 },
    stopReason: "end_turn",
  };
}
