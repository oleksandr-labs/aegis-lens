/**
 * Open-weights provider (SOVEREIGNTY fallback).
 *
 * Targets either:
 *   - a self-hosted vLLM server (OpenAI-compatible `/v1/chat/completions`), OR
 *   - HuggingFace Inference (router endpoint, also OpenAI-compatible).
 *
 * This is the data-sovereignty path: when neither Anthropic nor OpenAI is
 * acceptable (sensitive data must stay on our infra) or both are down, route to
 * open weights running on the Hetzner box. The wire format is OpenAI-compatible,
 * so we reuse the OpenAI tool/usage translators.
 *
 * No secrets in code. An internal vLLM may be keyless (reached purely via
 * OPENWEIGHTS_BASE_URL); HF Inference uses HUGGINGFACE_API_KEY.
 */

import type {
  CompletionOptions,
  CompletionResult,
  LlmMessage,
  LlmProvider,
  StreamChunk,
} from "./types";
import { resolveOpenWeightsModel } from "./models";
import { resolveKey, hasKey } from "./byok";
import { redactMessages } from "./pii-pre-send";
import {
  toOpenWeightsTools,
  toOpenAIToolChoice,
  parseOpenAIToolCalls,
} from "./tool-calling";
import { readOpenAIUsage } from "./prompt-cache";
import { parseSseLines, fakeStream } from "./streaming";
import { costTracker } from "./cost-tracking";

/** HF router default; overridden by OPENWEIGHTS_BASE_URL for self-hosted vLLM. */
const DEFAULT_BASE = "https://router.huggingface.co/v1";

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
    default:
      return "end_turn";
  }
}

function buildBody(messages: LlmMessage[], model: string, opts: CompletionOptions) {
  const { messages: clean } = redactMessages(messages);
  const msgs = (opts.system
    ? [{ role: "system", content: opts.system }, ...clean]
    : clean
  ).map((m) =>
    m.role === "tool"
      ? { role: "tool", content: m.content, tool_call_id: m.toolCallId }
      : { role: m.role, content: m.content },
  );

  const body: Record<string, unknown> = {
    model,
    messages: msgs,
    max_tokens: opts.maxTokens ?? 1024,
  };
  if (opts.temperature != null) body.temperature = opts.temperature;
  if (opts.tools) {
    body.tools = toOpenWeightsTools(opts.tools);
    const tc = toOpenAIToolChoice(opts.toolChoice);
    if (tc) body.tool_choice = tc;
  }
  return body;
}

function authHeaders(apiKey: string): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json" };
  // Keyless internal vLLM: no Authorization header.
  if (apiKey) h.authorization = `Bearer ${apiKey}`;
  return h;
}

export const openweightsProvider: LlmProvider = {
  id: "openweights",
  defaultModel: resolveOpenWeightsModel(),
  // Tool support depends on the served model/template; assume true (vLLM + Llama 3.x).
  supportsTools: true,
  supportsStreaming: true,

  isConfigured(tenantId?: string) {
    return hasKey("openweights", tenantId);
  },

  async complete(messages, opts = {}): Promise<CompletionResult> {
    const model = resolveOpenWeightsModel(opts.model);
    const feature = opts.feature ?? "other";
    const key = resolveKey("openweights", opts.tenantId);
    if (!key) return fakeResult(messages, model);

    const res = await fetch(chatUrl(key.baseUrl), {
      method: "POST",
      headers: authHeaders(key.apiKey),
      body: JSON.stringify(buildBody(messages, model, opts)),
      signal: opts.signal,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`OpenWeights ${res.status}: ${errBody.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: {
        message?: { content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] };
        finish_reason?: string;
      }[];
      usage?: Record<string, number>;
    };
    const choice = json.choices?.[0];
    const text = choice?.message?.content ?? "";
    const toolCalls = parseOpenAIToolCalls(choice?.message?.tool_calls);
    const usage = readOpenAIUsage(json.usage ?? {});
    costTracker.record("openweights", model, feature, usage, opts.tenantId);

    return {
      text,
      provider: "openweights",
      model,
      mode: "live",
      usage,
      stopReason: mapFinish(choice?.finish_reason),
      toolCalls: toolCalls.length ? toolCalls : undefined,
    };
  },

  async *stream(messages, opts = {}): AsyncGenerator<StreamChunk> {
    const model = resolveOpenWeightsModel(opts.model);
    const feature = opts.feature ?? "other";
    const key = resolveKey("openweights", opts.tenantId);
    if (!key) {
      yield* fakeStream(fakeText(messages), "openweights", model);
      return;
    }

    const body = { ...buildBody(messages, model, opts), stream: true };
    const res = await fetch(chatUrl(key.baseUrl), {
      method: "POST",
      headers: authHeaders(key.apiKey),
      body: JSON.stringify(body),
      signal: opts.signal,
    });
    if (!res.ok || !res.body) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`OpenWeights stream ${res.status}: ${errBody.slice(0, 200)}`);
    }

    let text = "";
    let stopReason: CompletionResult["stopReason"] = "end_turn";
    let usage = { inputTokens: 0, outputTokens: 0 };

    for await (const ev of parseSseLines(res.body)) {
      const choice = (ev.choices as { delta?: { content?: string }; finish_reason?: string }[] | undefined)?.[0];
      if (choice?.delta?.content) {
        text += choice.delta.content;
        yield { type: "text", text: choice.delta.content };
      }
      if (choice?.finish_reason) stopReason = mapFinish(choice.finish_reason);
      if (ev.usage) usage = readOpenAIUsage(ev.usage as Record<string, number>);
    }

    costTracker.record("openweights", model, feature, usage, opts.tenantId);
    yield {
      type: "done",
      result: { text, provider: "openweights", model, mode: "live", usage, stopReason },
    };
  },
};

function fakeText(messages: LlmMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "(empty)";
  return `Synthetic open-weights response (no HUGGINGFACE_API_KEY / OPENWEIGHTS_BASE_URL set). Prompt: "${lastUser.slice(0, 200)}"`;
}

function fakeResult(messages: LlmMessage[], model: string): CompletionResult {
  return {
    text: fakeText(messages),
    provider: "openweights",
    model,
    mode: "fake",
    usage: { inputTokens: 0, outputTokens: 0 },
    stopReason: "end_turn",
  };
}
