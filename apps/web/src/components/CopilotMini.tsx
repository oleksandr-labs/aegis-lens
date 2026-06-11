"use client";

import { useState, type FormEvent } from "react";

type MiniResponse = {
  text: string;
  citations?: { eventId: string; class: string; subclass: string | null }[];
  mode?: string;
  model?: string;
};

type Props = {
  placeholder?: string;
  /** Optional pre-filled context string prepended to every prompt. */
  context?: string;
};

/**
 * CopilotMini — compact single-shot copilot widget.
 * Used in the dashboard AI Morning Brief widget and similar embeds.
 * Shows one response at a time (no full conversation history).
 */
export function CopilotMini({ placeholder = "Ask the AI copilot…", context }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<MiniResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    const finalPrompt = context ? `${context}\n\n${trimmed}` : trimmed;

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        data: {
          text: string;
          citations?: { eventId: string; class: string; subclass: string | null }[];
        };
        meta: { mode: string; model: string };
      };

      setResponse({
        text: json.data.text,
        citations: json.data.citations,
        mode: json.meta.mode,
        model: json.meta.model,
      });
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copilot unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Input row */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="flex-1 rounded border border-border-default bg-bg-base px-2 py-1.5 text-sm text-text-primary outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded bg-accent px-3 py-1.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="rounded bg-red-500/10 px-2 py-1 text-[11px] text-red-400">{error}</p>
      )}

      {/* Response card */}
      {response && (
        <div className="rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm">
          <div className="whitespace-pre-wrap text-text-primary">{response.text}</div>

          {response.citations && response.citations.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {response.citations.map((c) => (
                <li key={c.eventId} className="text-[10px] text-text-muted">
                  ↗ {c.class}/{c.subclass ?? "—"}{" "}
                  <span className="font-mono">{c.eventId.slice(0, 12)}…</span>
                </li>
              ))}
            </ul>
          )}

          {response.model && (
            <span className="mt-1 block font-mono text-[9px] text-text-muted">
              via {response.model} ({response.mode})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
