"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ALL_CLASSES, CLASS_COLOR, COUNTRIES, COUNTRY_LABELS } from "@/lib/filter-config";
import { showToast } from "@/components/ui/toast-store";
import type { EventClass } from "@aegis/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = "nl" | "visual";
type Channel = "in_app" | "email" | "telegram" | "slack" | "webhook";
type Schedule = "immediate" | "hourly" | "daily";
type Verification = "any" | "corroborated";
type Priority = "normal" | "high" | "critical";

interface RuleState {
  name: string;
  description: string;
  classes: EventClass[];
  country: string;
  oblast: string;
  minConfidence: number;
  minSeverity: number;
  verification: Verification;
  keywords: string[];
  channels: Channel[];
  schedule: Schedule;
  quietHours: boolean;
  quietFrom: string;
  quietTo: string;
  priority: Priority;
}

const DEFAULT_RULE: RuleState = {
  name: "",
  description: "",
  classes: [],
  country: "ua",
  oblast: "",
  minConfidence: 0,
  minSeverity: 0,
  verification: "any",
  keywords: [],
  channels: ["in_app"],
  schedule: "immediate",
  quietHours: false,
  quietFrom: "22:00",
  quietTo: "07:00",
  priority: "normal",
};

// Parsed result that a simulated "AI" returns from a natural-language prompt.
const NL_PARSE_RESULT: Partial<RuleState> = {
  classes: ["military_action"],
  country: "ua",
  minConfidence: 80,
  channels: ["in_app", "email"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHANNEL_META: { id: Channel; label: string }[] = [
  { id: "in_app", label: "In-app" },
  { id: "email", label: "Email" },
  { id: "telegram", label: "Telegram" },
  { id: "slack", label: "Slack" },
  { id: "webhook", label: "Webhook" },
];

const SCHEDULE_OPTIONS: { id: Schedule; label: string }[] = [
  { id: "immediate", label: "Immediately" },
  { id: "hourly", label: "Digest (hourly)" },
  { id: "daily", label: "Digest (daily)" },
];

const PRIORITY_OPTIONS: { id: Priority; label: string; desc: string }[] = [
  { id: "normal", label: "Normal", desc: "Standard delivery" },
  { id: "high", label: "High", desc: "Elevated urgency" },
  { id: "critical", label: "Critical", desc: "Overrides quiet hours" },
];

function getCountryLabel(code: string): string {
  return COUNTRY_LABELS[code as keyof typeof COUNTRY_LABELS] ?? code.toUpperCase();
}

function buildPreviewSentence(rule: RuleState): string {
  const channelList =
    rule.channels.length === 0
      ? "no channels"
      : rule.channels
          .map((c) => CHANNEL_META.find((m) => m.id === c)?.label ?? c)
          .join(" and ");

  const schedulePhrase =
    rule.schedule === "immediate"
      ? "immediately"
      : rule.schedule === "hourly"
        ? "as an hourly digest"
        : "as a daily digest";

  const classParts =
    rule.classes.length === 0
      ? "any event class"
      : rule.classes
          .map((id) => ALL_CLASSES.find((c) => c.id === id)?.label ?? id)
          .join(", ");

  const regionParts = [
    getCountryLabel(rule.country),
    rule.oblast ? rule.oblast : null,
  ]
    .filter(Boolean)
    .join(" — ");

  const lines: string[] = [
    `Alert me ${schedulePhrase} via ${channelList} when:`,
    `  • Event class: ${classParts}`,
    `  • Region: ${regionParts}`,
  ];

  if (rule.minConfidence > 0) {
    lines.push(`  • Confidence ≥ ${rule.minConfidence}%`);
  }
  if (rule.minSeverity > 0) {
    lines.push(`  • Severity ≥ ${rule.minSeverity}`);
  }
  if (rule.verification === "corroborated") {
    lines.push("  • Corroborated sources only");
  }
  if (rule.keywords.length > 0) {
    lines.push(`  • Keywords: ${rule.keywords.join(", ")}`);
  }
  if (rule.quietHours && rule.priority !== "critical") {
    lines.push(`  • Quiet hours: ${rule.quietFrom} – ${rule.quietTo}`);
  }
  if (rule.name) {
    lines.push("", `Rule name: "${rule.name}"`);
  }
  if (rule.priority !== "normal") {
    lines.push(`Priority: ${rule.priority.toUpperCase()}`);
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm text-text-primary">{label}</label>
        <span className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs text-accent">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded bg-border-subtle accent-accent"
      />
      <div className="mt-0.5 flex justify-between font-mono text-[10px] text-text-secondary">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RuleBuilderClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("nl");
  const [nlText, setNlText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [rule, setRule] = useState<RuleState>(DEFAULT_RULE);
  const [keywordInput, setKeywordInput] = useState("");
  const [saving, setSaving] = useState(false);
  const keywordRef = useRef<HTMLInputElement>(null);

  // Merge partial update into rule state
  const updateRule = useCallback(
    <K extends keyof RuleState>(key: K, value: RuleState[K]) => {
      setRule((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Toggle a class in/out of the selected list
  function toggleClass(id: EventClass) {
    setRule((prev) => ({
      ...prev,
      classes: prev.classes.includes(id)
        ? prev.classes.filter((c) => c !== id)
        : [...prev.classes, id],
    }));
  }

  // Toggle a channel in/out
  function toggleChannel(id: Channel) {
    setRule((prev) => ({
      ...prev,
      channels: prev.channels.includes(id)
        ? prev.channels.filter((c) => c !== id)
        : [...prev.channels, id],
    }));
  }

  // Add a keyword chip
  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw || rule.keywords.includes(kw)) return;
    setRule((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
    setKeywordInput("");
    keywordRef.current?.focus();
  }

  // Simulated AI parse
  function parseNL() {
    if (!nlText.trim()) return;
    setParsing(true);
    setTimeout(() => {
      setRule((prev) => ({ ...prev, ...NL_PARSE_RESULT }));
      setParsing(false);
      setMode("visual");
    }, 1500);
  }

  // Save (mock)
  function saveRule() {
    if (!rule.name.trim()) {
      showToast("Please enter a rule name before saving.", "warning");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast(`Rule "${rule.name}" saved successfully.`, "success");
      router.push("../alerts");
    }, 800);
  }

  const previewText = buildPreviewSentence(rule);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Mode toggle */}
      <div className="mb-8 inline-flex rounded border border-border-subtle bg-bg-surface p-1">
        {(["nl", "visual"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              "rounded px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-accent text-bg-base"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {m === "nl" ? "Natural language" : "Visual builder"}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* ---------------------------------------------------------------- */}
        {/* Left column                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Natural language mode */}
          {mode === "nl" && (
            <SectionCard title="Describe your alert">
              <p className="text-xs text-text-secondary">
                Type a plain-English description of the events you want to be alerted about.
                Click &ldquo;Parse with AI&rdquo; to convert it into a structured rule.
              </p>
              <textarea
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder='Alert me when there are military events in Kharkiv Oblast with confidence ≥ 80%'
                className="w-full resize-none rounded border border-border-default bg-bg-base px-3 py-3 text-sm text-text-primary outline-none focus:border-accent"
                rows={4}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={parseNL}
                  disabled={parsing || !nlText.trim()}
                  className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-bg-base hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  {parsing ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                      Parsing…
                    </>
                  ) : (
                    "Parse with AI →"
                  )}
                </button>
                <span className="text-xs text-text-secondary">
                  Populates the visual builder with extracted conditions.
                </span>
              </div>

              {/* Example prompts */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-text-secondary">Examples:</p>
                {[
                  "Alert me when there are military events in Kharkiv Oblast with confidence ≥ 80%",
                  "Notify via Telegram for cyber attacks in EU countries, high severity only",
                  "Daily digest of humanitarian events, any region",
                ].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setNlText(ex)}
                    className="block w-full rounded border border-dashed border-border-subtle px-3 py-2 text-left text-xs text-text-secondary hover:border-accent/50 hover:text-text-primary transition-colors"
                  >
                    &ldquo;{ex}&rdquo;
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Visual builder mode */}
          {mode === "visual" && (
            <>
              {/* Section 1: Trigger */}
              <SectionCard title="1 — Trigger condition">
                {/* Event class */}
                <div>
                  <p className="mb-2 text-sm text-text-primary">Event class</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {ALL_CLASSES.map((cls) => {
                      const selected = rule.classes.includes(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => toggleClass(cls.id)}
                          className={[
                            "flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs text-left transition-colors",
                            selected
                              ? "border-accent/60 bg-accent/5 text-text-primary"
                              : "border-border-subtle bg-bg-base text-text-secondary hover:border-border-default hover:text-text-primary",
                          ].join(" ")}
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: CLASS_COLOR[cls.id] }}
                          />
                          {cls.label}
                        </button>
                      );
                    })}
                  </div>
                  {rule.classes.length === 0 && (
                    <p className="mt-1.5 text-xs text-text-secondary">
                      No class selected — matches all event types.
                    </p>
                  )}
                </div>

                {/* Region */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-text-primary">Country</label>
                    <select
                      value={rule.country}
                      onChange={(e) => updateRule("country", e.target.value)}
                      className="w-full rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {getCountryLabel(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-text-primary">
                      Oblast / region{" "}
                      <span className="text-text-secondary">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={rule.oblast}
                      onChange={(e) => updateRule("oblast", e.target.value)}
                      placeholder="e.g. Kharkiv Oblast"
                      className="w-full rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Sliders */}
                <SliderField
                  label="Minimum confidence"
                  value={rule.minConfidence}
                  min={0}
                  max={100}
                  format={(v) => (v === 0 ? "Any" : `${v}%`)}
                  onChange={(v) => updateRule("minConfidence", v)}
                />
                <SliderField
                  label="Minimum severity"
                  value={rule.minSeverity}
                  min={0}
                  max={5}
                  format={(v) => (v === 0 ? "Any" : `${v} / 5`)}
                  onChange={(v) => updateRule("minSeverity", v)}
                />

                {/* Verification */}
                <div>
                  <p className="mb-2 text-sm text-text-primary">Verification state</p>
                  <div className="flex gap-2">
                    {(["any", "corroborated"] as Verification[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => updateRule("verification", v)}
                        className={[
                          "rounded border px-3 py-1.5 text-xs transition-colors capitalize",
                          rule.verification === v
                            ? "border-accent/60 bg-accent/5 text-text-primary"
                            : "border-border-subtle text-text-secondary hover:text-text-primary",
                        ].join(" ")}
                      >
                        {v === "any" ? "Any" : "Corroborated only"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <p className="mb-2 text-sm text-text-primary">
                    Keywords{" "}
                    <span className="text-text-secondary">(optional)</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={keywordRef}
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      placeholder="e.g. rail, bridge…"
                      className="flex-1 rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      disabled={!keywordInput.trim()}
                      className="rounded border border-border-default px-3 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {rule.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rule.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="flex items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-xs text-text-primary"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() =>
                              setRule((prev) => ({
                                ...prev,
                                keywords: prev.keywords.filter((k) => k !== kw),
                              }))
                            }
                            className="opacity-50 hover:opacity-100"
                            aria-label={`Remove keyword ${kw}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Section 2: Delivery */}
              <SectionCard title="2 — Delivery">
                {/* Channels */}
                <div>
                  <p className="mb-2 text-sm text-text-primary">Notification channels</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {CHANNEL_META.map(({ id, label }) => {
                      const active = rule.channels.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleChannel(id)}
                          className={[
                            "rounded border px-3 py-2 text-xs text-left transition-colors",
                            active
                              ? "border-accent/60 bg-accent/5 text-text-primary"
                              : "border-border-subtle bg-bg-base text-text-secondary hover:text-text-primary",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <p className="mb-2 text-sm text-text-primary">Delivery schedule</p>
                  <div className="flex flex-wrap gap-2">
                    {SCHEDULE_OPTIONS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateRule("schedule", id)}
                        className={[
                          "rounded border px-3 py-1.5 text-xs transition-colors",
                          rule.schedule === id
                            ? "border-accent/60 bg-accent/5 text-text-primary"
                            : "border-border-subtle text-text-secondary hover:text-text-primary",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quiet hours */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={rule.quietHours}
                      onChange={(e) => updateRule("quietHours", e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                    Respect quiet hours
                  </label>
                  {rule.quietHours && (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="time"
                        value={rule.quietFrom}
                        onChange={(e) => updateRule("quietFrom", e.target.value)}
                        className="rounded border border-border-default bg-bg-base px-2 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
                      />
                      <span className="text-xs text-text-secondary">to</span>
                      <input
                        type="time"
                        value={rule.quietTo}
                        onChange={(e) => updateRule("quietTo", e.target.value)}
                        className="rounded border border-border-default bg-bg-base px-2 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
                      />
                      {rule.priority === "critical" && (
                        <span className="text-xs text-yellow-400">
                          Overridden by Critical priority
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Section 3: Name & priority */}
              <SectionCard title="3 — Name & priority">
                {/* Rule name */}
                <div>
                  <label className="mb-1 block text-sm text-text-primary">
                    Rule name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => updateRule("name", e.target.value)}
                    placeholder="e.g. Military Ukraine — High confidence"
                    className="w-full rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm text-text-primary">
                    Description <span className="text-text-secondary">(optional)</span>
                  </label>
                  <textarea
                    value={rule.description}
                    onChange={(e) => updateRule("description", e.target.value)}
                    placeholder="Short note about why this rule exists…"
                    rows={2}
                    className="w-full resize-none rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  />
                </div>

                {/* Priority */}
                <div>
                  <p className="mb-2 text-sm text-text-primary">Priority</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PRIORITY_OPTIONS.map(({ id, label, desc }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateRule("priority", id)}
                        className={[
                          "rounded border px-3 py-2 text-left text-xs transition-colors",
                          rule.priority === id
                            ? id === "critical"
                              ? "border-red-500/60 bg-red-500/5 text-red-400"
                              : id === "high"
                                ? "border-yellow-500/60 bg-yellow-500/5 text-yellow-400"
                                : "border-accent/60 bg-accent/5 text-text-primary"
                            : "border-border-subtle text-text-secondary hover:text-text-primary",
                        ].join(" ")}
                      >
                        <span className="block font-medium">{label}</span>
                        <span className="mt-0.5 block opacity-70">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Save button (always visible) */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={saveRule}
              disabled={saving}
              className="flex items-center gap-2 rounded bg-accent px-5 py-2.5 text-sm font-medium text-bg-base hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Save rule"
              )}
            </button>
            <a
              href="../alerts"
              className="text-sm text-text-secondary hover:text-text-primary underline-offset-2 hover:underline transition-colors"
            >
              Cancel
            </a>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Preview pane                                                       */}
        {/* ---------------------------------------------------------------- */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-6 rounded border border-border-subtle bg-bg-surface p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">
              Live preview
            </p>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-text-secondary">
              {previewText}
            </pre>

            {/* Class dot legend */}
            {rule.classes.length > 0 && (
              <div className="mt-4 space-y-1 border-t border-border-subtle pt-3">
                {rule.classes.map((cls) => (
                  <div key={cls} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: CLASS_COLOR[cls] }}
                    />
                    {ALL_CLASSES.find((c) => c.id === cls)?.label ?? cls}
                  </div>
                ))}
              </div>
            )}

            {/* Channel badges */}
            {rule.channels.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {rule.channels.map((ch) => (
                  <span
                    key={ch}
                    className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary"
                  >
                    {CHANNEL_META.find((m) => m.id === ch)?.label ?? ch}
                  </span>
                ))}
              </div>
            )}

            {/* Name display */}
            {rule.name && (
              <p className="mt-3 rounded bg-accent/5 px-2 py-1.5 text-xs font-medium text-accent">
                &ldquo;{rule.name}&rdquo;
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
