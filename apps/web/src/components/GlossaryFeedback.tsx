"use client";

import { useState } from "react";

type Vote = "up" | "down" | null;

export function GlossaryFeedback() {
  const [vote, setVote] = useState<Vote>(null);

  function handleVote(v: Vote) {
    setVote((prev) => (prev === v ? null : v));
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-muted">Was this helpful?</span>
      <button
        onClick={() => handleVote("up")}
        aria-label="Yes, this was helpful"
        aria-pressed={vote === "up"}
        className={`flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
          vote === "up"
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
            : "border-border-subtle text-text-muted hover:border-emerald-500/50 hover:text-emerald-400"
        }`}
      >
        <span aria-hidden="true">👍</span>
        Yes
      </button>
      <button
        onClick={() => handleVote("down")}
        aria-label="No, this was not helpful"
        aria-pressed={vote === "down"}
        className={`flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
          vote === "down"
            ? "border-rose-500 bg-rose-500/10 text-rose-400"
            : "border-border-subtle text-text-muted hover:border-rose-500/50 hover:text-rose-400"
        }`}
      >
        <span aria-hidden="true">👎</span>
        No
      </button>
      {vote && (
        <p className="text-xs text-text-muted" role="status" aria-live="polite">
          {vote === "up" ? "Thanks for the feedback!" : "We'll work on improving this."}
        </p>
      )}
    </div>
  );
}
