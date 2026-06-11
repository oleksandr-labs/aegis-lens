"use client";

import { useState } from "react";

const SUBJECTS = [
  { value: "Sales", label: "Sales" },
  { value: "Press", label: "Press" },
  { value: "Partnership", label: "Partnership" },
  { value: "Security", label: "Security" },
  { value: "Other", label: "Other" },
];

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setState("success");
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(
          (body as { message?: string }).message ?? "Something went wrong. Please try again."
        );
        setState("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div
        role="status"
        className="rounded border border-accent/40 bg-accent/10 p-6 text-center"
      >
        <p className="font-semibold text-text-primary">Message sent</p>
        <p className="mt-1 text-sm text-text-secondary">
          We&rsquo;ll reply to the email you provided. Check spam if you don&rsquo;t hear from
          us within the expected window.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-4 font-mono text-xs text-accent hover:underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded border border-border-subtle bg-bg-surface p-5"
      noValidate
    >
      {state === "error" && errorMessage && (
        <div
          role="alert"
          className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-text-primary"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="block text-sm font-medium text-text-primary">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            disabled={state === "submitting"}
            className="mt-2 w-full rounded border border-border-subtle bg-bg-surface p-3 text-text-primary outline-none focus:border-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="cf-email" className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={state === "submitting"}
            className="mt-2 w-full rounded border border-border-subtle bg-bg-surface p-3 text-text-primary outline-none focus:border-accent disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className="block text-sm font-medium text-text-primary">
          Subject
        </label>
        <select
          id="cf-subject"
          name="subject"
          defaultValue="Other"
          disabled={state === "submitting"}
          className="mt-2 w-full rounded border border-border-subtle bg-bg-surface p-3 text-text-primary outline-none focus:border-accent disabled:opacity-50"
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-sm font-medium text-text-primary">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={6}
          disabled={state === "submitting"}
          className="mt-2 w-full rounded border border-border-subtle bg-bg-surface p-3 text-text-primary outline-none focus:border-accent disabled:opacity-50"
        />
      </div>

      {/* hCaptcha placeholder */}
      <div className="text-xs text-text-muted">Protected by hCaptcha</div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-bg-base hover:bg-accent/90 disabled:opacity-50 transition-opacity"
        >
          {state === "submitting" ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-text-muted">
          We do not share your message with third parties.
        </p>
      </div>
    </form>
  );
}
