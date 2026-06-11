"use client";

import { useEffect, useState, useCallback } from "react";

export function StatusRefresher() {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  function formatAge(s: number): string {
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem === 0 ? `${m}m ago` : `${m}m ${rem}s ago`;
  }

  return (
    <div className="flex items-center gap-3 text-xs text-text-tertiary">
      <span>Last updated: {formatAge(secondsAgo)}</span>
      <button
        onClick={handleRefresh}
        className="rounded border border-border-subtle bg-bg-surface px-2.5 py-1 text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}

export function StatusSubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics: ["status-updates"] }),
      });
      if (res.ok) {
        setState("ok");
      } else if (res.status === 429) {
        setState("err");
        setError("Too many attempts. Please try again shortly.");
      } else {
        setState("err");
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setState("err");
      setError("Network error. Check your connection.");
    }
  }

  if (state === "ok") {
    return (
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
        ✓ Subscribed — you will receive incident notifications by email.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full rounded border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none sm:w-72"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full rounded border border-accent bg-transparent px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent hover:text-black disabled:opacity-50 sm:w-auto"
        >
          {state === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
