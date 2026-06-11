/**
 * OpenAI provider (FAILOVER + specialty models).
 *
 * Implements {@link LlmProvider} against the Chat Completions API
 * (`/v1/chat/completions`): complete / stream / tool-calling, OpenAI automatic
 * prefix caching (read hits surfaced from usage), and PII pre-send redaction.
 *
 * No secrets in code — key + optional base URL resolved via BYOK → env.
 */

import type {
  CompletionOptions,
  CompletionResult,
  LlmMessage,
  LlmProvider,
  StreamChunk,
} from "./types";
import { resolveOpenAIModel } from "./models";
import { resolveKey, hasKey } from "./byok";
import { redactMessages } from "./pii-pre-send";
import {
  toOpenAITools,
  toOpenAIToolChoice,
  parseOpenAIToolCalls,
} from "./tool-calling";
import { readOpenAIUsage } from "./prompt-cache";
import { parseSseLines, fakeStream } from "./streaming";
import { costTracker } from "./cost-tracking";

const DEFAULT_BASE = "https://api.openai.com/v1";

function chatUrl(baseUrl?: string): string {
  return `${(baseUrl ?? DEFAULT_BASE).replace(/\/$/, "")}/chat/completions`;
}

function mapFinish(r: string | null | undefined): CompletionResult["stopReason"] {
  switch (r) {
    case "stop":
      return "end_turn";
    case "length":
      return "max_tokens";
    case "tool_calls":
      return "tool_use";
    case "content_filter":
      return "refusal";
    default:
      return "end_turn";
  }
}

/** Map our roles to OpenAI roles (tool messages need tool_call_id). */
function toOpenAIMessages(messages: LlmMessage[]) {
  return messages.map((m) => {
    if (m.role === "tool") {
      return { role: "tool" as const, content: m.content, tool_call_id: m.toolCallId };
    }
    return { role: m.role, content: m.content };
  });
}

function buildBody(messages: LlmMessage[], model: string, opts: CompletionOptions) {
  const { messages: clean } = redactMessages(messages);
  const msgs = opts.system
    ? [{ role: "system" as const, content: opts.system }, ...toOpenAIMessages(clean)]
    : toOpenAIMessages(clean);

  const body: Record<string, unknown> = {
    model,
    messages: msgs,
    max_completion_tokens: opts.maxTokens ?? 1024,
  };
  if (opts.temperature != null) body.temperature = opts.temperature;
  if (opts.tools) {
    body.tools = toOpenAITools(opts.tools);
    const tc = toOpenAIToolChoice(opts.toolChoice);
    if (tc) body.tool_choice = tc;
  }
  return body;
}

export const openaiProvider: LlmProvider = {
  id: "openai",
  defaultModel: resolveOpenAIModel(),
  supportsTools: true,
  supportsStreaming: true,

  isConfigured(tenantId?: string) {
    return hasKey("openai", tenantId);
  },

  async complete(messages, opts = {}): Promise<CompletionResult> {
    const model = resolveOpenAIModel(opts.model);
    const feature = opts.feature ?? "other";
    const key = resolveKey("openai", opts.tenantId);
    if (!key) return fakeResult(messages, model);

    const res = await fetch(chatUrl(key.baseUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${key.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(buildBody(messages, model, opts)),
      signal: opts.signal,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${errBody.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: {
        message?: { content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] };
        finish_reason?: string;
      }[];
      usage?: Record<string, number> & { prompt_tokens_details?: { cached_tokens?: number } };
    };
    const choice = json.choices?.[0];
    const text = choice?.message?.content ?? "";
    const toolCalls = parseOpenAIToolCalls(choice?.message?.tool_calls);
    const usage = readOpenAIUsage(json.usage ?? {});
    costTracker.record("openai", model, feature, usage, opts.tenantId);

    return {
      text,
      provider: "openai",
      model,
      mode: "live",
      usage,
      stopReason: mapFinish(choice?.finish_reason),
      toolCalls: toolCalls.length ? toolCalls : undefined,
    };
  },

  async *stream(messages, opts = {}): AsyncGenerator<StreamChunk> {
    const model = resolveOpenAIModel(opts.model);
    const feature = opts.feature ?? "other";
    const key = resolveKey("openai", opts.tenantId);
    if (!key) {
      yield* fakeStream(fakeText(messages), "openai", model);
      return;
    }

    const body = {
      ...buildBody(messages, model, opts),
      stream: true,
      stream_options: { include_usage: true },
    };
    const res = await fetch(chatUrl(key.baseUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${key.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: opts.signal,
    });
    if (!res.ok || !res.body) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`OpenAI stream ${res.status}: ${errBody.slice(0, 200)}`);
    }

    let text = "";
    let stopReason: CompletionResult["stopReason"] = "end_turn";
    let usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 };
    const startedTools = new Set<string>();

    for await (const ev of parseSseLines(res.body)) {
      const choice = (ev.choices as { delta?: Record<string, unknown>; finish_reason?: string }[] | undefined)?.[0];
      if (choice) {
        const delta = choice.delta as
          | { content?: string; tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[] }
          | undefined;
        if (delta?.content) {
          text += delta.content;
          yield { type: "text", text: delta.content };
        }
        for (const tc of delta?.tool_calls ?? []) {
          if (tc.id && !startedTools.has(tc.id)) {
            startedTools.add(tc.id);
            yield { type: "tool_call_start", id: tc.id, name: tc.function?.name ?? "" };
          }
          if (tc.function?.arguments) {
            const id = tc.id ?? [...startedTools].pop() ?? "";
            yield { type: "tool_call_delta", id, argsDelta: tc.function.arguments };
          }
        }
        if (choice.finish_reason) stopReason = mapFinish(choice.finish_reason);
      }
      if (ev.usage) usage = readOpenAIUsage(ev.usage as Record<string, number>);
    }

    costTracker.record("openai", model, feature, usage, opts.tenantId);
    yield {
      type: "done",
      result: { text, provider: "openai", model, mode: "live", usage, stopReason },
    };
  },
};

function fakeText(messages: LlmMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "(empty)";
  return `Synthetic OpenAI response (no OPENAI_API_KEY set). Prompt: "${lastUser.slice(0, 200)}"`;
}

function fakeResult(messages: LlmMessage[], model: string): CompletionResult {
  return {
    text: fakeText(messages),
    provider: "openai",
    model,
    mode: "fake",
    usage: { inputTokens: 0, outputTokens: 0 },
    stopReason: "end_turn",
  };
}
