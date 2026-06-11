"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";

const INPUT_CLS =
  "rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary w-full outline-none focus:border-accent text-sm";
const PRIMARY_BTN =
  "w-full rounded bg-accent py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-opacity";
const OAUTH_BTN =
  "w-full flex items-center justify-center gap-3 rounded border border-border-default px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface transition-colors";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
        fill="#4285F4"
      />
      <path
        d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.84-2.7.84-2.08 0-3.84-1.4-4.47-3.29H1.82v2.07A8 8 0 0 0 8.98 17z"
        fill="#34A853"
      />
      <path
        d="M4.51 10.6A4.8 4.8 0 0 1 4.26 9c0-.56.1-1.1.25-1.6V5.33H1.82A8 8 0 0 0 .98 9c0 1.29.31 2.51.84 3.67l2.69-2.07z"
        fill="#FBBC05"
      />
      <path
        d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.16 4.33l2.69 2.07c.63-1.89 2.39-3.32 4.47-3.32z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function Divider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border-subtle" />
      </div>
      <div className="relative flex justify-center text-xs text-text-muted">
        <span className="bg-bg-surface px-2">or</span>
      </div>
    </div>
  );
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [rememberMe, setRememberMe] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Field-level errors
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  function validate() {
    let ok = true;
    if (!email) {
      setEmailErr("Email is required.");
      ok = false;
    } else if (!validateEmail(email)) {
      setEmailErr("Enter a valid email address.");
      ok = false;
    } else {
      setEmailErr(null);
    }
    if (mode === "password") {
      if (!password) {
        setPassErr("Password is required.");
        ok = false;
      } else {
        setPassErr(null);
      }
    }
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "magic") {
        const res = await fetch("/api/auth/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setMagicSent(true);
        } else {
          setError("Failed to send magic link. Please try again.");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, rememberMe }),
        });
        if (res.ok) {
          window.location.href = "/dashboard";
        } else {
          setError("Invalid email or password.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <AuthCard title="Check your email" subtitle="We sent a magic link to your inbox.">
        <p className="text-sm text-text-secondary text-center">
          Click the link in the email to sign in. It expires in 15 minutes.
        </p>
        <button
          onClick={() => { setMagicSent(false); setMode("password"); }}
          className="mt-4 w-full text-sm text-accent hover:underline"
        >
          Back to sign in
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Sign in to your account"
      subtitle="Welcome back to Aegis Lens"
    >
      {/* Global error */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="mb-3">
          <label
            htmlFor="login-email"
            className="mb-1 block text-xs text-text-secondary"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailErr(null); }}
            className={INPUT_CLS}
            placeholder="you@example.com"
          />
          {emailErr && <p className="text-xs text-red-400 mt-1">{emailErr}</p>}
        </div>

        {/* Password (only in password mode) */}
        {mode === "password" && (
          <div className="mb-1">
            <label
              htmlFor="login-password"
              className="mb-1 block text-xs text-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPassErr(null); }}
                className={INPUT_CLS + " pr-10"}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {passErr && <p className="text-xs text-red-400 mt-1">{passErr}</p>}

            <div className="mt-1.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-accent"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-accent hover:underline"
              >
                Forgot password? →
              </Link>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={PRIMARY_BTN + " mt-4"}
        >
          {loading
            ? "Signing in…"
            : mode === "magic"
            ? "Send magic link"
            : "Sign in"}
        </button>
      </form>

      {/* Magic link toggle */}
      <button
        type="button"
        onClick={() => { setMode(mode === "password" ? "magic" : "password"); setError(null); }}
        className="mt-3 w-full text-xs text-text-muted hover:text-accent transition-colors"
      >
        {mode === "password"
          ? "Sign in with magic link instead"
          : "Sign in with password instead"}
      </button>

      <Divider />

      {/* OAuth */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => { window.location.href = "/api/auth/google"; }}
          className={OAUTH_BTN}
        >
          <GoogleIcon /> Continue with Google
        </button>
        <button
          type="button"
          onClick={() => { window.location.href = "/api/auth/github"; }}
          className={OAUTH_BTN}
        >
          <GitHubIcon /> Continue with GitHub
        </button>
      </div>

      {/* Sign up link */}
      <p className="mt-5 text-center text-xs text-text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up →
        </Link>
      </p>
    </AuthCard>
  );
}
