/**
 * Provider-agnostic streaming.
 *
 * Each provider emits its own SSE/event shape; this module exposes:
 *   - {@link parseSseLines} — turn a fetch Response body into `data:` JSON events.
 *   - {@link collectStream} — drain a {@link StreamChunk} iterator into a final
 *     {@link CompletionResult} (so callers that don't need tokens can `await`).
 *   - {@link fakeStream} — deterministic fake stream when no key is configured.
 *
 * The clients translate their native events into {@link StreamChunk}s; this file
 * holds the shared plumbing so every provider streams identically downstream.
 */

import type { CompletionResult, ProviderId, StreamChunk } from "./types";

/**
 * Parse an SSE byte stream into successive `data:` JSON payloads. Yields the
 * decoded JSON for each event; skips `[DONE]` sentinels and comments/heartbeats.
 */
export async function* parseSseLines(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line || line.startsWith(":") || line.startsWith("event:")) continue;
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as Record<string, unknown>;
        } catch {
          /* partial/non-JSON heartbeat — ignore */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Drain a stream into the final result. Concatenates text chunks; the terminal
 * `done` chunk carries authoritative usage/stopReason from the provider.
 */
export async function collectStream(
  stream: AsyncIterable<StreamChunk>,
): Promise<CompletionResult> {
  let text = "";
  let final: CompletionResult | undefined;
  for await (const chunk of stream) {
    if (chunk.type === "text") text += chunk.text;
    else if (chunk.type === "done") final = chunk.result;
  }
  if (final) {
    // Prefer accumulated text if the done chunk omitted it.
    return final.text ? final : { ...final, text };
  }
  return {
    text,
    provider: "openweights",
    model: "unknown",
    mode: "fake",
    usage: { inputTokens: 0, outputTokens: 0 },
    stopReason: "end_turn",
  };
}

/** Deterministic fake stream — used when a provider has no key configured. */
export async function* fakeStream(
  text: string,
  provider: ProviderId,
  model: string,
): AsyncGenerator<StreamChunk> {
  // Chunk on word boundaries so consumers exercise multi-chunk handling.
  const words = text.split(/(\s+)/);
  for (const w of words) {
    if (w) yield { type: "text", text: w };
  }
  yield {
    type: "done",
    result: {
      text,
      provider,
      model,
      mode: "fake",
      usage: { inputTokens: 0, outputTokens: 0 },
      stopReason: "end_turn",
    },
  };
}
