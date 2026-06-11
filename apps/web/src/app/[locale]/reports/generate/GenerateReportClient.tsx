"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ALL_CLASSES } from "@/lib/filter-config";
import { REPORT_TYPE_LABELS } from "@/lib/reports-data";
import type { ReportType } from "@/lib/reports-data";

/* ─── Constants ──────────────────────────────────────── */

const REPORT_TYPES: { id: ReportType; label: string; description: string }[] = [
  {
    id: "regional_brief",
    label: "Regional Brief",
    description: "Geographic area analysis with cross-domain event correlation",
  },
  {
    id: "incident_dossier",
    label: "Incident Dossier",
    description: "Single-event deep-dive with provenance chain and confidence scoring",
  },
  {
    id: "weekly_digest",
    label: "Weekly Digest",
    description: "7-day summary across all event classes with trend indicators",
  },
  {
    id: "custom_query",
    label: "Custom Query",
    description: "Free-form query across the full event database",
  },
];

const REGIONS = [
  "Ukraine",
  "Kharkiv Oblast",
  "Black Sea",
  "Donetsk Oblast",
  "Kyiv",
  "Global",
];

const TIME_WINDOWS = [
  { label: "24 hours", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "Custom range", value: "custom" },
];

const TONES = ["Analytical", "Executive", "Technical"] as const;

const LENGTHS: { label: string; desc: string; value: string }[] = [
  { label: "Short", desc: "2–3 pages", value: "short" },
  { label: "Standard", desc: "8–12 pages", value: "standard" },
  { label: "Comprehensive", desc: "20+ pages", value: "comprehensive" },
];

const GENERATION_STEPS = [
  "Retrieving events…",
  "Running analysis…",
  "Writing report…",
];

/* ─── Types ──────────────────────────────────────────── */

type Step = 1 | 2 | 3;

interface FormState {
  type: ReportType;
  region: string;
  timeWindow: string;
  focusAreas: string[];
  tone: string;
  length: string;
}

/* ─── Main client component ──────────────────────────── */

export function GenerateReportClient() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    type: "weekly_digest",
    region: "Ukraine",
    timeWindow: "7d",
    focusAreas: [],
    tone: "Analytical",
    length: "standard",
  });

  const [generationStep, setGenerationStep] = useState(0); // 0 = idle, 1-3 = steps, 4 = done
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleGenerate() {
    setStep(2);
    setGenerationStep(1);
    let count = 1;
    intervalRef.current = setInterval(() => {
      count++;
      if (count > 3) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGenerationStep(4);
      } else {
        setGenerationStep(count);
      }
    }, 1500);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function toggleFocusArea(id: string) {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(id)
        ? prev.focusAreas.filter((x) => x !== id)
        : [...prev.focusAreas, id],
    }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Step indicator */}
      <StepIndicator current={step} />

      {step === 1 && (
        <Step1
          form={form}
          setForm={setForm}
          onToggleFocusArea={toggleFocusArea}
          onGenerate={handleGenerate}
        />
      )}

      {step === 2 && (
        <Step2
          form={form}
          generationStep={generationStep}
          onFinalize={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3 form={form} onReset={() => { setStep(1); setGenerationStep(0); }} />
      )}
    </div>
  );
}

/* ─── Step indicator ─────────────────────────────────── */

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Parameters" },
    { n: 2, label: "Preview" },
    { n: 3, label: "Download" },
  ];
  return (
    <div className="mb-8 flex items-center gap-0">
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-semibold",
                  done
                    ? "border-accent bg-accent text-black"
                    : active
                    ? "border-accent text-accent"
                    : "border-border-subtle text-text-muted",
                ].join(" ")}
              >
                {done ? "✓" : s.n}
              </div>
              <span
                className={[
                  "mt-1 font-mono text-[10px] uppercase tracking-wider",
                  active ? "text-accent" : "text-text-muted",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "mx-3 mb-4 h-px flex-1 w-16",
                  done ? "bg-accent" : "bg-border-subtle",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Parameters ─────────────────────────────── */

function Step1({
  form,
  setForm,
  onToggleFocusArea,
  onGenerate,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onToggleFocusArea: (id: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Report type */}
      <fieldset>
        <legend className="mb-3 font-mono text-[11px] uppercase tracking-widest text-accent">
          Report type
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {REPORT_TYPES.map((rt) => (
            <label
              key={rt.id}
              className={[
                "flex cursor-pointer flex-col rounded border p-4 transition-colors",
                form.type === rt.id
                  ? "border-accent bg-accent/5"
                  : "border-border-subtle bg-bg-surface hover:border-accent/40",
              ].join(" ")}
            >
              <input
                type="radio"
                name="reportType"
                value={rt.id}
                checked={form.type === rt.id}
                onChange={() => setForm((p) => ({ ...p, type: rt.id }))}
                className="sr-only"
              />
              <span className="font-semibold text-sm text-text-primary">{rt.label}</span>
              <span className="mt-1 text-xs text-text-muted">{rt.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Region + Time window */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-accent">
            Region
          </label>
          <select
            value={form.region}
            onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
            className="w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-accent">
            Time window
          </label>
          <select
            value={form.timeWindow}
            onChange={(e) => setForm((p) => ({ ...p, timeWindow: e.target.value }))}
            className="w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            {TIME_WINDOWS.map((tw) => (
              <option key={tw.value} value={tw.value}>
                {tw.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Focus areas */}
      <fieldset>
        <legend className="mb-3 font-mono text-[11px] uppercase tracking-widest text-accent">
          Focus areas
        </legend>
        <div className="flex flex-wrap gap-2">
          {ALL_CLASSES.map((cls) => {
            const checked = form.focusAreas.includes(cls.id);
            return (
              <label
                key={cls.id}
                className={[
                  "flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors",
                  checked
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-subtle bg-bg-surface text-text-muted hover:border-accent/40 hover:text-text-secondary",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleFocusArea(cls.id)}
                  className="sr-only"
                />
                <span
                  className={[
                    "inline-flex h-3 w-3 items-center justify-center rounded-sm border",
                    checked ? "border-accent bg-accent" : "border-border-subtle",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {checked && (
                    <svg viewBox="0 0 10 10" className="h-2 w-2 fill-none stroke-black stroke-2">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {cls.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Tone + Length */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-accent">
            Tone
          </label>
          <select
            value={form.tone}
            onChange={(e) => setForm((p) => ({ ...p, tone: e.target.value }))}
            className="w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-accent">
            Length
          </legend>
          <div className="flex gap-2">
            {LENGTHS.map((l) => (
              <label
                key={l.value}
                className={[
                  "flex flex-1 cursor-pointer flex-col items-center rounded border p-2 text-center transition-colors",
                  form.length === l.value
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border-subtle bg-bg-surface text-text-muted hover:border-accent/40",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="length"
                  value={l.value}
                  checked={form.length === l.value}
                  onChange={() => setForm((p) => ({ ...p, length: l.value }))}
                  className="sr-only"
                />
                <span className="text-xs font-semibold">{l.label}</span>
                <span className="text-[10px]">{l.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <button
        onClick={onGenerate}
        className="w-full rounded bg-accent px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
      >
        Generate preview →
      </button>
    </div>
  );
}

/* ─── Step 2: Preview ────────────────────────────────── */

function Step2({
  form,
  generationStep,
  onFinalize,
}: {
  form: FormState;
  generationStep: number;
  onFinalize: () => void;
}) {
  const isLoading = generationStep > 0 && generationStep < 4;
  const isDone = generationStep === 4;

  const typeLabel = REPORT_TYPE_LABELS[form.type];
  const twLabel = TIME_WINDOWS.find((t) => t.value === form.timeWindow)?.label ?? form.timeWindow;
  const lengthLabel = LENGTHS.find((l) => l.value === form.length)?.label ?? form.length;

  const previewTitle = `${typeLabel} — ${form.region} (${twLabel})`;
  const previewSubtitle = `${form.tone} tone · ${lengthLabel} · Generated by Aegis AI`;

  const execSummary = buildExecSummary(form);

  const findings = [
    `Verified event density in ${form.region} is above the 30-day rolling average by 18%.`,
    `${form.focusAreas.length > 0
      ? form.focusAreas.map((f) => f.replace(/_/g, " ")).join(", ")
      : "Military and infrastructure"} events account for the majority of severity-weighted incidents.`,
    "Confidence scores average 0.74 across cited events; three events remain at unverified state pending corroboration.",
  ];

  const tableRows = [
    { cls: "Military action", count: 14, severity: "3.2" },
    { cls: "Infrastructure", count: 8, severity: "2.8" },
    { cls: "Civilian alert", count: 22, severity: "2.1" },
    { cls: "Cyber", count: 5, severity: "1.8" },
    { cls: "Maritime", count: 3, severity: "2.5" },
  ];

  return (
    <div>
      {isLoading && (
        <div className="flex flex-col items-center py-20 gap-6">
          <LoadingDots />
          <p className="font-mono text-sm text-accent animate-pulse">
            {GENERATION_STEPS[(generationStep - 1) % GENERATION_STEPS.length]}
          </p>
          <div className="flex gap-2 mt-2">
            {GENERATION_STEPS.map((label, i) => (
              <div
                key={label}
                className={[
                  "h-1.5 w-16 rounded-full transition-colors",
                  i < generationStep ? "bg-accent" : "bg-border-subtle",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      )}

      {isDone && (
        <div className="space-y-6">
          {/* Report preview card */}
          <div className="rounded border border-border-subtle bg-bg-surface p-6">
            {/* Header */}
            <div className="border-b border-border-subtle pb-4 mb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                {typeLabel}
              </p>
              <h2 className="text-xl font-semibold text-text-primary">{previewTitle}</h2>
              <p className="mt-1 text-xs text-text-muted">{previewSubtitle}</p>
            </div>

            {/* Executive summary */}
            <div className="mb-6">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-text-muted mb-2">
                Executive Summary
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{execSummary}</p>
            </div>

            {/* Key findings */}
            <div className="mb-6">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-text-muted mb-3">
                Key Findings
              </h3>
              <ul className="space-y-2">
                {findings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="mt-0.5 flex-shrink-0 font-mono text-accent">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Data table */}
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-text-muted mb-3">
                Event Distribution
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="pb-2 text-left font-mono font-normal text-text-muted uppercase tracking-wider">
                      Class
                    </th>
                    <th className="pb-2 text-right font-mono font-normal text-text-muted uppercase tracking-wider">
                      Events
                    </th>
                    <th className="pb-2 text-right font-mono font-normal text-text-muted uppercase tracking-wider">
                      Avg. Severity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.cls} className="border-b border-border-subtle/50">
                      <td className="py-2 text-text-secondary">{row.cls}</td>
                      <td className="py-2 text-right font-mono text-text-primary">{row.count}</td>
                      <td className="py-2 text-right font-mono text-text-muted">{row.severity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <p className="mt-4 text-[10px] text-text-muted italic">
              [Preview — AI-generated structured output. All event citations are sourced from the
              Aegis Lens verified event database. Final report includes full provenance chains.]
            </p>
          </div>

          {/* Download actions */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Download PDF
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent/50 hover:text-accent"
            >
              Download DOCX
            </a>
            <button
              onClick={onFinalize}
              className="ml-auto text-xs text-accent hover:underline"
            >
              Confirm &amp; finalise →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 3: Done ───────────────────────────────────── */

function Step3({
  form,
  onReset,
}: {
  form: FormState;
  onReset: () => void;
}) {
  const typeLabel = REPORT_TYPE_LABELS[form.type];
  return (
    <div className="flex flex-col items-center py-12 text-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent bg-accent/10 text-accent text-2xl">
        ✓
      </div>
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Report ready!</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Your {typeLabel} for {form.region} has been generated.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90"
        >
          Download PDF
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="rounded border border-border-subtle bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-secondary hover:border-accent/50 hover:text-accent"
        >
          Download DOCX
        </a>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={onReset}
          className="text-accent hover:underline"
        >
          Create another report
        </button>
        <Link href="/reports" className="text-text-muted hover:underline">
          Back to reports
        </Link>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────── */

function LoadingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-accent animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function buildExecSummary(form: FormState): string {
  const twLabel = TIME_WINDOWS.find((t) => t.value === form.timeWindow)?.label ?? form.timeWindow;
  const focusStr =
    form.focusAreas.length > 0
      ? form.focusAreas.map((f) => f.replace(/_/g, " ")).join(", ")
      : "all event classes";

  return (
    `This ${REPORT_TYPE_LABELS[form.type].toLowerCase()} covers verified intelligence events ` +
    `in ${form.region} over the past ${twLabel}, with primary focus on ${focusStr}. ` +
    `Analysis is drawn from the Aegis Lens event database, cross-referenced against open-source ` +
    `signals and corroboration chains. All severity and confidence values reflect the platform's ` +
    `weighted scoring model as of the report generation timestamp. ` +
    `Unverified events are flagged and excluded from aggregate statistics unless otherwise noted.`
  );
}
