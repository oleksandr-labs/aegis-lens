"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";

const INPUT_CLS =
  "rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary w-full outline-none focus:border-accent text-sm";
const PRIMARY_BTN =
  "w-full rounded bg-accent py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-opacity";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function validate() {
    if (!email) { setEmailErr("Email is required."); return false; }
    if (!validateEmail(email)) { setEmailErr("Enter a valid email address."); return false; }
    setEmailErr(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard title="Check your inbox" subtitle="Password reset link sent">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">
            If an account exists for{" "}
            <strong className="text-text-primary">{email}</strong>, we sent a
            password reset link. Check your inbox and spam folder.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="fp-email"
            className="mb-1 block text-xs text-text-secondary"
          >
            Email
          </label>
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailErr(null);
            }}
            className={INPUT_CLS}
            placeholder="you@example.com"
          />
          {emailErr && (
            <p className="text-xs text-red-400 mt-1">{emailErr}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className={PRIMARY_BTN}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-text-muted">
        Remember your password?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in →
        </Link>
      </p>
    </AuthCard>
  );
}
