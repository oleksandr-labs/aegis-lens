"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { urls } from "@aegis/url-builder";
import { useFilters } from "@/lib/use-filters";

type Citation = { eventId: string; class: string; subclass: string | null };

type StatsBlock = {
  country: string;
  hours: number;
  eventCount: number;
  topClass: { id: string; count: number } | null;
  avgDanger: number;
};

type HistoryMessage = {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  stats?: StatsBlock;
  mode?: string;
  model?: string;
};

// ── Suggested prompts ─────────────────────────────────────────────────────────
const ALL_SUGGESTED = [
  "Summarize last 6h in Kharkiv Oblast.",
  "What changed in the Black Sea today?",
  "Compare drone activity this week vs last week.",
  "Civilian safety status in Kherson now.",
  "Why are confidence scores low for recent events?",
  "Draft an intelligence brief for Donetsk Oblast.",
  "What's the anomaly in tonight's data?",
  "Show me military events with danger > 70.",
  "Compare Ukraine vs Poland event counts.",
  "What sources reported the last drone event?",
];

// ── Country options for compare mode ─────────────────────────────────────────
const COMPARE_COUNTRIES: { value: string; label: string }[] = [
  { value: "pl", label: "Poland" },
  { value: "de", label: "Germany" },
  { value: "by", label: "Belarus" },
  { value: "ru", label: "Russia" },
  { value: "ua", label: "Ukraine" },
];

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(msg);
    timerRef.current = setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { toast, showToast };
}

export function Copilot() {
  const f = useFilters();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Streaming state — built up incrementally, committed on "done"
  const [streamingText, setStreamingText] = useState("");
  const [streamingStats, setStreamingStats] = useState<StatsBlock | null>(null);
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);

  // Suggested prompts rotation
  const [promptPage, setPromptPage] = useState(0);
  const totalPages = Math.ceil(ALL_SUGGESTED.length / 4);
  const visiblePrompts = ALL_SUGGESTED.slice(promptPage * 4, promptPage * 4 + 4);

  function rotateSuggestions() {
    setPromptPage((p) => (p + 1) >= totalPages ? 0 : p + 1);
  }

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareCountry, setCompareCountry] = useState("pl");

  // Toast
  const { toast, showToast } = useToast();

  async function submit(p: string) {
    if (!p.trim() || loading) return;

    // Apply compare mode prefix
    const finalPrompt = compareMode
      ? `Compare ${f.country.toUpperCase()} vs ${compareCountry.toUpperCase()}: ${p}`
      : p;

    setLoading(true);
    setStreamingText("");
    setStreamingStats(null);
    setStreamingCitations([]);
    setHistory((h) => [...h, { role: "user", text: finalPrompt }]);
    setPrompt("");

    try {
      const body: Record<string, unknown> = {
        prompt: finalPrompt,
        country: f.country,
        hours: f.hours,
      };
      if (compareMode) body.compareCountry = compareCountry;

      const r = await fetch("/api/copilot/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!r.ok || !r.body) {
        throw new Error(`HTTP ${r.status}`);
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Accumulate mutable refs during streaming
      let accText = "";
      let accStats: StatsBlock | null = null;
      let accCitations: Citation[] = [];
      let accMode = "";
      let accModel = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newline
        const parts = buffer.split("\n\n");
        // Last element may be incomplete — keep it in buffer
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          let eventName = "";
          let dataLine = "";

          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataLine = line.slice(6).trim();
            }
          }

          if (!eventName || !dataLine) continue;

          let payload: unknown;
          try {
            payload = JSON.parse(dataLine);
          } catch {
            continue;
          }

          if (eventName === "stats") {
            accStats = payload as StatsBlock;
            setStreamingStats(accStats);
          } else if (eventName === "delta") {
            const chunk = (payload as { text: string }).text;
            accText += chunk;
            setStreamingText(accText);
          } else if (eventName === "citation") {
            accCitations = (payload as { events: Citation[] }).events;
            setStreamingCitations(accCitations);
          } else if (eventName === "done") {
            const d = payload as { mode: string; model: string };
            accMode = d.mode;
            accModel = d.model;

            // Commit the completed message to history
            setHistory((h) => [
              ...h,
              {
                role: "assistant",
                text: accText,
                citations: accCitations,
                stats: accStats ?? undefined,
                mode: accMode,
                model: accModel,
              },
            ]);

            // Clear streaming state
            setStreamingText("");
            setStreamingStats(null);
            setStreamingCitations([]);
            setLoading(false);
            break outer;
          }
        }
      }
    } catch {
      setHistory((h) => [
        ...h,
        { role: "assistant", text: "Sorry — copilot is offline. Try again." },
      ]);
      setStreamingText("");
      setStreamingStats(null);
      setStreamingCitations([]);
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit(prompt);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
  }

  function exportAsReport(text: string) {
    router.push(`/reports/generate?brief=${encodeURIComponent(text.slice(0, 200))}`);
  }

  function addToCase(text: string) {
    router.push(`/cases?draft=${encodeURIComponent(text.slice(0, 200))}`);
  }

  // Render action buttons after each assistant message
  function MessageActions({ text }: { text: string }) {
    return (
      <div className="flex gap-1.5 mt-2">
        <button
          onClick={() => copyToClipboard(text)}
          className="rounded border border-border-subtle px-2 py-1 text-[10px] text-text-muted hover:text-text-primary"
        >
          Copy
        </button>
        <button
          onClick={() => exportAsReport(text)}
          className="rounded border border-border-subtle px-2 py-1 text-[10px] text-text-muted hover:text-text-primary"
        >
          Save to report
        </button>
        <button
          onClick={() => addToCase(text)}
          className="rounded border border-border-subtle px-2 py-1 text-[10px] text-text-muted hover:text-text-primary"
        >
          Add to case
        </button>
      </div>
    );
  }

  // Render a completed assistant message bubble
  function AssistantBubble({ msg }: { msg: HistoryMessage }) {
    return (
      <div className="rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary">
        <div className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
          assistant
        </div>
        {msg.stats && (
          <div className="mt-1 font-mono text-[10px] text-text-muted">
            {msg.stats.country} · {msg.stats.hours}h · {msg.stats.eventCount} events
            {msg.stats.topClass ? ` · top: ${msg.stats.topClass.id}` : ""}
            {" · "}avg danger {msg.stats.avgDanger}
          </div>
        )}
        <div className="mt-1 whitespace-pre-wrap text-text-primary">{msg.text}</div>
        {msg.citations && msg.citations.length > 0 && (
          <ul className="mt-2 space-y-1">
            {msg.citations.map((c) => (
              <li key={c.eventId}>
                <Link
                  href={urls.event("en", c.eventId)}
                  className="text-[11px] text-accent hover:underline"
                >
                  ↗ {c.class}/{c.subclass} ({c.eventId.slice(0, 12)}…)
                </Link>
              </li>
            ))}
          </ul>
        )}
        {msg.model && (
          <span className="mt-1 block font-mono text-[9px] text-text-muted">
            via {msg.model} ({msg.mode})
          </span>
        )}
        <MessageActions text={msg.text} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          AI Copilot
        </h2>
        {/* Compare mode toggle */}
        <button
          onClick={() => setCompareMode((v) => !v)}
          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
            compareMode
              ? "bg-accent text-black"
              : "border border-border-subtle text-text-muted hover:text-text-primary"
          }`}
          title="Toggle region compare mode"
        >
          ⇄ Compare
        </button>
      </div>

      {/* Compare mode second-country selector */}
      {compareMode && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className="font-semibold uppercase">{f.country.toUpperCase()}</span>
          <span>vs</span>
          <select
            value={compareCountry}
            onChange={(e) => setCompareCountry(e.target.value)}
            className="rounded border border-border-subtle bg-bg-base px-1 py-0.5 text-[11px] text-text-primary outline-none focus:border-accent"
          >
            {COMPARE_COUNTRIES.filter((c) => c.value !== f.country).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="mt-1 rounded bg-accent/20 px-2 py-1 text-center text-[10px] text-accent">
          {toast}
        </div>
      )}

      {/* Conversation */}
      <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
        {history.length === 0 && !loading && (
          <>
            {/* Quick action chips */}
            <button
              onClick={() => submit("Explain why events in the current view have low confidence scores.")}
              className="w-full rounded border border-accent/40 bg-accent/10 px-3 py-1.5 text-left text-[11px] text-accent hover:bg-accent/20"
            >
              ✦ Explain confidence levels
            </button>

            {/* Suggested prompts with rotation */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Suggested prompts
              </p>
              <button
                onClick={rotateSuggestions}
                className="rounded p-0.5 text-sm text-text-muted hover:text-text-primary"
                title="Show more suggestions"
              >
                ↺
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              {visiblePrompts.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => submit(s)}
                    className="w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-left text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {history.map((msg, i) =>
          msg.role === "user" ? (
            <div
              key={i}
              className="rounded border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-text-primary"
            >
              <div className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                you
              </div>
              <div className="mt-1 whitespace-pre-wrap text-text-primary">{msg.text}</div>
            </div>
          ) : (
            <AssistantBubble key={i} msg={msg} />
          ),
        )}

        {/* Streaming in-progress bubble */}
        {loading && (
          <div className="rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary">
            <div className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
              assistant
            </div>
            {streamingStats && (
              <div className="mt-1 font-mono text-[10px] text-text-muted">
                {streamingStats.country} · {streamingStats.hours}h ·{" "}
                {streamingStats.eventCount} events
                {streamingStats.topClass ? ` · top: ${streamingStats.topClass.id}` : ""}
                {" · "}avg danger {streamingStats.avgDanger}
              </div>
            )}
            <div className="mt-1 whitespace-pre-wrap text-text-primary">
              {streamingText}
              {streamingText === "" ? (
                <span className="text-text-muted animate-pulse">thinking…</span>
              ) : (
                <span className="animate-pulse">…</span>
              )}
            </div>
            {streamingCitations.length > 0 && (
              <ul className="mt-2 space-y-1">
                {streamingCitations.map((c) => (
                  <li key={c.eventId}>
                    <Link
                      href={urls.event("en", c.eventId)}
                      className="text-[11px] text-accent hover:underline"
                    >
                      ↗ {c.class}/{c.subclass} ({c.eventId.slice(0, 12)}…)
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Context chips */}
      <div className="flex flex-wrap gap-1 mt-2 mb-1 text-[10px]">
        <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-text-muted">
          🌍 {f.country.toUpperCase()}
        </span>
        <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-text-muted">
          ⏱ {f.hours}h
        </span>
        {f.classes && f.classes.length > 0 && (
          <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-text-muted">
            {f.classes.length} classes
          </span>
        )}
        {compareMode && (
          <span className="rounded bg-accent/20 px-1.5 py-0.5 text-accent">
            ⇄ vs {compareCountry.toUpperCase()}
          </span>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="mt-1 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            compareMode
              ? `Compare ${f.country.toUpperCase()} vs ${compareCountry.toUpperCase()}…`
              : "Ask anything about current view…"
          }
          disabled={loading}
          className="flex-1 rounded border border-border-default bg-bg-base px-2 py-1.5 text-sm text-text-primary outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded bg-accent px-3 py-1.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
