"use client";

import { useState, useRef } from "react";

export function DashboardCopilot() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = textareaRef.current?.value.trim();
    if (!prompt) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          country: "ua",
          hours: 24,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { result?: string; text?: string; content?: string };
      setResult(data.result ?? data.text ?? data.content ?? JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        rows={3}
        defaultValue="Generate morning brief for Ukraine"
        className="w-full resize-none rounded border border-border-subtle bg-bg-base px-3 py-2 font-mono text-xs text-text-primary outline-none focus:border-accent placeholder:text-text-muted"
        placeholder="Type your intelligence prompt…"
        aria-label="AI prompt"
      />
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded bg-accent px-4 py-1.5 text-xs font-semibold text-bg-base hover:bg-accent/90 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate brief"}
      </button>

      {error && (
        <p className="rounded border border-red-900/40 bg-red-950/30 px-3 py-2 font-mono text-xs text-red-400">
          Error: {error}
        </p>
      )}

      {result && (
        <div className="mt-1 rounded border border-border-subtle bg-bg-base p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            AI Response
          </p>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-secondary">
            {result}
          </pre>
        </div>
      )}
    </form>
  );
}
