"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");

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
        body: JSON.stringify({ email, topics: ["intelligence-briefs"] }),
      });
      if (res.ok) {
        setState("ok");
      } else if (res.status === 429) {
        setState("err");
        setError("Too many attempts. Please try again in a moment.");
      } else {
        setState("err");
        setError("Something went wrong. Try again.");
      }
    } catch {
      setState("err");
      setError("Network error. Check your connection.");
    }
  }

  if (state === "ok") {
    return (
      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
        ✓ You're on the list — intelligence briefs coming soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 sm:flex-row">
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
      {error && (
        <p className="w-full text-xs text-red-400 sm:absolute sm:bottom-0 sm:translate-y-full">{error}</p>
      )}
    </form>
  );
}
