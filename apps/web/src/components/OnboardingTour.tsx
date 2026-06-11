"use client";

import { useEffect, useState } from "react";

// ─── Tour steps ───────────────────────────────────────────────────────────────

const TOUR_STEPS = [
  {
    id: "welcome",
    target: null,
    title: "Welcome to Aegis Lens",
    body: "The world's first AI-native OSINT intelligence platform. We'll walk you through the key features in 60 seconds.",
    cta: "Start tour",
  },
  {
    id: "map",
    target: "#map-canvas",
    title: "Live Intelligence Map",
    body: "The map shows verified events in real time. Click any marker to see details, AI analysis, and sources.",
    cta: "Next →",
  },
  {
    id: "layers",
    target: "#layer-rail",
    title: "Intelligence Layers",
    body: "Toggle between 15+ layers: military actions, civilian alerts, infrastructure damage, maritime, aviation, and more.",
    cta: "Next →",
  },
  {
    id: "copilot",
    target: "#copilot-rail",
    title: "AI Copilot",
    body: "Ask the AI analyst anything about the current map view. It cites sources and never invents events.",
    cta: "Next →",
  },
  {
    id: "filterbar",
    target: "#filter-bar",
    title: "Smart Filters",
    body: "Filter by country, time window, event class, severity, confidence, and verification state — all reflected in the URL.",
    cta: "Next →",
  },
  {
    id: "command",
    target: null,
    title: "Command Palette",
    body: "Press ⌘K from anywhere to quickly navigate, filter, or ask the AI anything. Power users love this.",
    cta: "Got it — start exploring",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("aegis_tour_done")) {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const currentStep = TOUR_STEPS[step];

  function skip() {
    localStorage.setItem("aegis_tour_done", "1");
    setOpen(false);
  }

  function next() {
    if (step >= TOUR_STEPS.length - 1) {
      skip();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
        onClick={skip}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="fixed left-1/2 top-1/2 z-[81] -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-2xl"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase text-text-muted">
            {step + 1} / {TOUR_STEPS.length}
          </span>
          <button
            onClick={skip}
            className="text-text-muted hover:text-text-primary"
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <h2 id="tour-title" className="mt-2 text-xl font-semibold text-text-primary">
          {currentStep.title}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {currentStep.body}
        </p>

        {/* Progress bar */}
        <div className="flex gap-1.5 mt-4" aria-hidden="true">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${i <= step ? "bg-accent" : "bg-border-subtle"}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={skip}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover"
          >
            {currentStep.cta}
          </button>
        </div>
      </div>
    </>
  );
}
