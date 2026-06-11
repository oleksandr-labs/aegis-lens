"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";

type State = "loading" | "success" | "error" | "missing";

export default function MagicLinkPage() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setState("missing");
      return;
    }

    fetch("/api/auth/magic-link/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setState("success");
          // Short delay to show the success state before redirecting
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1200);
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") {
    return (
      <AuthCard title="Signing you in…">
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Spinner */}
          <svg
            className="animate-spin text-accent"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Loading"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-sm text-text-secondary">
            Verifying your magic link…
          </p>
        </div>
      </AuthCard>
    );
  }

  if (state === "success") {
    return (
      <AuthCard title="Signed in!" subtitle="Redirecting to your dashboard…">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-accent"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">Taking you to your dashboard…</p>
        </div>
      </AuthCard>
    );
  }

  if (state === "missing") {
    return (
      <AuthCard
        title="Invalid link"
        subtitle="No token was found in this URL."
      >
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-4">
            This link appears to be malformed or incomplete.
          </p>
          <Link href="/login" className="text-sm text-accent hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  // error state
  return (
    <AuthCard
      title="Link expired"
      subtitle="This magic link is no longer valid."
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          This link has expired or has already been used. Magic links are valid
          for 15 minutes and can only be used once.
        </p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          Request a new link →
        </Link>
      </div>
    </AuthCard>
  );
}
