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

// ── Password strength ───────────────────────────────────────────
type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function calcStrength(pw: string): StrengthLevel {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score) as StrengthLevel;
}

const STRENGTH_LABEL: Record<StrengthLevel, string> = {
  0: "",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

const STRENGTH_COLOR: Record<StrengthLevel, string> = {
  0: "bg-border-subtle",
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-500",
};

function PasswordStrength({ password }: { password: string }) {
  const level = calcStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= level ? STRENGTH_COLOR[level] : "bg-border-subtle"
            }`}
          />
        ))}
      </div>
      <p className="mt-0.5 text-xs text-text-muted">{STRENGTH_LABEL[level]}</p>
    </div>
  );
}

// ── Role cards ───────────────────────────────────────────────────
const ROLES = [
  {
    id: "osint",
    label: "OSINT Analyst",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: "journalist",
    label: "Journalist",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: "ngo",
    label: "NGO / Humanitarian",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "government",
    label: "Government / Defense",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
] as const;

const HOW_OPTIONS = [
  "Search engine",
  "Social media",
  "Colleague or friend",
  "Conference or event",
  "News article",
  "Other",
];

// ── Step indicator ───────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
          step >= 1
            ? "bg-accent text-black"
            : "border border-border-subtle text-text-muted"
        }`}
      >
        1
      </div>
      <div
        className={`h-px w-8 ${
          step === 2 ? "bg-accent" : "bg-border-subtle"
        }`}
      />
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
          step === 2
            ? "bg-accent text-black"
            : "border border-border-subtle text-text-muted"
        }`}
      >
        2
      </div>
    </div>
  );
}

// ── Google / GitHub icons ────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4" />
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.84-2.7.84-2.08 0-3.84-1.4-4.47-3.29H1.82v2.07A8 8 0 0 0 8.98 17z" fill="#34A853" />
      <path d="M4.51 10.6A4.8 4.8 0 0 1 4.26 9c0-.56.1-1.1.25-1.6V5.33H1.82A8 8 0 0 0 .98 9c0 1.29.31 2.51.84 3.67l2.69-2.07z" fill="#FBBC05" />
      <path d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.16 4.33l2.69 2.07c.63-1.89 2.39-3.32 4.47-3.32z" fill="#EA4335" />
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

// ── Main component ───────────────────────────────────────────────
export function SignupClient() {
  // Step
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Step 1 errors
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [agreeErr, setAgreeErr] = useState<string | null>(null);

  // Step 2
  const [role, setRole] = useState<string | null>(null);
  const [howHeard, setHowHeard] = useState("");
  const [plan, setPlan] = useState<"free" | "analyst">("free");

  // Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function validateStep1() {
    let ok = true;
    if (!name.trim()) { setNameErr("Full name is required."); ok = false; } else setNameErr(null);
    if (!email) { setEmailErr("Email is required."); ok = false; }
    else if (!validateEmail(email)) { setEmailErr("Enter a valid email address."); ok = false; }
    else setEmailErr(null);
    if (!password) { setPassErr("Password is required."); ok = false; }
    else if (password.length < 8) { setPassErr("Password must be at least 8 characters."); ok = false; }
    else setPassErr(null);
    if (!agreed) { setAgreeErr("You must agree to the Terms and Privacy Policy."); ok = false; }
    else setAgreeErr(null);
    return ok;
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, howHeard, plan }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? "Failed to create account. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success state
  if (done) {
    return (
      <AuthCard title="Check your email" subtitle="Account created successfully!">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">
            We sent a confirmation link to <strong className="text-text-primary">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm text-accent hover:underline">
            Back to sign in →
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={step === 1 ? "Create your account" : "Tell us about yourself"}
      subtitle={step === 1 ? "Join thousands of analysts on Aegis Lens" : "Help us personalise your experience"}
    >
      <StepIndicator step={step} />

      {/* ── Step 1: Account details */}
      {step === 1 && (
        <>
          {/* OAuth shortcuts */}
          <div className="flex flex-col gap-2 mb-4">
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

          <Divider />

          <form onSubmit={handleStep1} noValidate>
            {/* Full name */}
            <div className="mb-3">
              <label htmlFor="su-name" className="mb-1 block text-xs text-text-secondary">
                Full name
              </label>
              <input
                id="su-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameErr(null); }}
                className={INPUT_CLS}
                placeholder="Jane Doe"
              />
              {nameErr && <p className="text-xs text-red-400 mt-1">{nameErr}</p>}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="su-email" className="mb-1 block text-xs text-text-secondary">
                Email
              </label>
              <input
                id="su-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(null); }}
                className={INPUT_CLS}
                placeholder="you@example.com"
              />
              {emailErr && <p className="text-xs text-red-400 mt-1">{emailErr}</p>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="su-password" className="mb-1 block text-xs text-text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  id="su-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPassErr(null); }}
                  className={INPUT_CLS + " pr-10"}
                  placeholder="At least 8 characters"
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
              <PasswordStrength password={password} />
              {passErr && <p className="text-xs text-red-400 mt-1">{passErr}</p>}
            </div>

            {/* Terms */}
            <div className="mb-4">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); setAgreeErr(null); }}
                  className="mt-0.5 rounded accent-accent"
                />
                <span className="text-xs text-text-secondary">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-accent hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {agreeErr && <p className="text-xs text-red-400 mt-1">{agreeErr}</p>}
            </div>

            <button type="submit" className={PRIMARY_BTN}>
              Continue →
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in →
            </Link>
          </p>
        </>
      )}

      {/* ── Step 2: Profile + plan */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div role="alert" className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Role selection */}
          <p className="mb-2 text-xs text-text-secondary">
            What best describes you? <span className="text-text-muted">(optional)</span>
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(role === r.id ? null : r.id)}
                className={`flex flex-col items-center gap-1.5 rounded border p-3 text-xs transition-colors ${
                  role === r.id
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
                }`}
              >
                <span className={role === r.id ? "text-accent" : ""}>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* How did you hear */}
          <div className="mb-4">
            <label htmlFor="su-how" className="mb-1 block text-xs text-text-secondary">
              How did you hear about us? <span className="text-text-muted">(optional)</span>
            </label>
            <select
              id="su-how"
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
              className={INPUT_CLS + " bg-bg-base"}
            >
              <option value="">Select…</option>
              {HOW_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Plan selector */}
          <p className="mb-2 text-xs text-text-secondary">Choose your plan</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {(["free", "analyst"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`rounded border p-3 text-left transition-colors ${
                  plan === p
                    ? "border-accent bg-accent/10"
                    : "border-border-subtle hover:border-border-default"
                }`}
              >
                <p className={`text-sm font-semibold ${plan === p ? "text-accent" : "text-text-primary"}`}>
                  {p === "free" ? "Free" : "Analyst"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {p === "free" ? "Get started, no card" : "$49 / month"}
                </p>
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={PRIMARY_BTN}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-3 w-full text-xs text-text-muted hover:text-accent transition-colors"
          >
            ← Back
          </button>
        </form>
      )}
    </AuthCard>
  );
}
