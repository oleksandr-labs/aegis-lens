"use client";

import { useState } from "react";
import { useFilters } from "@/lib/use-filters";
import {
  ALL_CLASSES,
  CLASS_COLOR,
  COUNTRIES,
  COUNTRY_LABELS,
  TIME_WINDOWS,
  VERIFICATION_STATES,
} from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";
import { SavedSearches } from "@/components/SavedSearches";

export function FilterBar() {
  const f = useFilters();
  const [expanded, setExpanded] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const activeWindow = TIME_WINDOWS.find((w) => w.hours === f.hours) ?? TIME_WINDOWS[2];

  const filtersActive =
    f.classes.length > 0 ||
    f.country !== "ua" ||
    f.hours !== 24 ||
    f.minSeverity > 0 ||
    f.minConfidence > 0 ||
    f.verification !== "" ||
    f.minDanger > 0 ||
    f.hasMedia !== "";

  const advancedActive =
    f.minSeverity > 0 || f.minConfidence > 0 || f.verification || f.minDanger > 0 || f.hasMedia;

  return (
    <div className="pointer-events-auto absolute inset-x-0 top-3 z-10 mx-auto max-w-3xl">
      {/* Primary row */}
      <div className="flex items-center gap-2 rounded border border-border-subtle bg-bg-elevated/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
        {/* Country */}
        <label className="flex items-center gap-1.5">
          <span className="font-mono uppercase text-text-muted">Country</span>
          <select
            value={f.country}
            onChange={(e) => f.setCountry(e.target.value)}
            className="rounded border border-border-default bg-bg-base px-2 py-1 text-text-primary"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>

        <span className="text-border-default">|</span>

        {/* Time */}
        <span className="font-mono uppercase text-text-muted">Time</span>
        <div className="flex items-center gap-1">
          {TIME_WINDOWS.map((w) => (
            <button
              key={w.label}
              onClick={() => f.setHours(w.hours ?? 0)}
              className={
                activeWindow.label === w.label
                  ? "rounded bg-accent px-2 py-1 font-semibold text-black"
                  : "rounded px-2 py-1 text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              }
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Class chips */}
        {f.classes.length > 0 && (
          <>
            <span className="text-border-default">|</span>
            <div className="flex flex-wrap items-center gap-1">
              {f.classes.map((cls) => (
                <button
                  key={cls}
                  onClick={() => f.toggleClass(cls as EventClass)}
                  className="flex items-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-2 py-1 text-text-primary hover:bg-bg-elevated"
                  aria-label={`Remove ${cls} filter`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: CLASS_COLOR[cls as EventClass] }}
                  />
                  {ALL_CLASSES.find((c) => c.id === cls)?.label ?? cls}
                  <span className="text-text-muted">×</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* minDanger chip */}
        {f.minDanger > 0 && (
          <button
            onClick={() => f.setMinDanger(0)}
            className="flex items-center gap-1 rounded border border-border-subtle bg-bg-surface px-2 py-1 text-xs text-text-primary"
          >
            ⚠ ≥{f.minDanger} danger <span className="text-text-muted">×</span>
          </button>
        )}

        {/* hasMedia chip */}
        {f.hasMedia && (
          <button
            onClick={() => f.setHasMedia("")}
            className="flex items-center gap-1 rounded border border-border-subtle bg-bg-surface px-2 py-1 text-xs text-text-primary"
          >
            📎 {f.hasMedia} <span className="text-text-muted">×</span>
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Filter → Alert */}
          {filtersActive && (
            <button
              onClick={() => {
                const q = new URLSearchParams(window.location.search);
                window.location.href = `/alerts/rule-builder?${q.toString()}`;
              }}
              className="rounded border border-accent/30 px-2 py-1 text-xs text-accent hover:bg-accent/10"
            >
              + Create alert from filter
            </button>
          )}

          {/* Filter → Report */}
          <button
            onClick={() => {
              const country = f.country;
              const hours = f.hours;
              window.location.href = `/reports/generate?country=${country}&hours=${hours}`;
            }}
            className="rounded border border-border-subtle px-2 py-1 text-xs text-text-muted hover:text-text-secondary"
          >
            → Generate report
          </button>

          {/* Saved searches */}
          <div className="relative">
            <button
              onClick={() => setSavedOpen((v) => !v)}
              className={`rounded px-2 py-1 text-text-muted hover:bg-bg-surface hover:text-text-primary ${savedOpen ? "bg-bg-surface text-text-primary" : ""}`}
              title="Saved searches"
            >
              💾 Save search
            </button>
            {savedOpen && (
              <SavedSearches onClose={() => setSavedOpen(false)} />
            )}
          </div>

          {/* More filters toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`rounded px-2 py-1 text-text-muted hover:bg-bg-surface hover:text-text-primary ${expanded ? "bg-bg-surface text-text-primary" : ""}`}
            aria-expanded={expanded}
            title="More filters"
          >
            ⚙ Filters{advancedActive ? " •" : ""}
          </button>

          {filtersActive && (
            <button
              onClick={f.clearAll}
              className="rounded px-2 py-1 text-text-muted hover:bg-bg-surface hover:text-text-primary"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-1 rounded border border-border-subtle bg-bg-elevated/95 px-4 py-3 text-xs shadow-lg backdrop-blur">
          <div className="grid grid-cols-3 gap-4">
            {/* Event class toggles */}
            <div>
              <div className="mb-2 font-mono uppercase tracking-wider text-text-muted">Event class</div>
              <div className="flex flex-wrap gap-1">
                {ALL_CLASSES.map((c) => {
                  const active = f.classes.length === 0 || f.classes.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => f.toggleClass(c.id)}
                      className={`flex items-center gap-1 rounded border px-2 py-1 ${
                        f.classes.includes(c.id)
                          ? "border-transparent bg-bg-surface text-text-primary"
                          : f.classes.length === 0
                          ? "border-border-subtle text-text-secondary"
                          : "border-border-subtle text-text-muted line-through"
                      }`}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: CLASS_COLOR[c.id], opacity: active ? 1 : 0.3 }}
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-text-muted">
                    Min severity
                  </span>
                  <span className="font-mono text-text-primary">{f.minSeverity}/5</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={f.minSeverity}
                  onChange={(e) => f.setMinSeverity(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between font-mono text-[9px] text-text-muted">
                  <span>0</span><span>5</span>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-text-muted">
                    Min confidence
                  </span>
                  <span className="font-mono text-text-primary">{f.minConfidence}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={f.minConfidence}
                  onChange={(e) => f.setMinConfidence(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between font-mono text-[9px] text-text-muted">
                  <span>0%</span><span>100%</span>
                </div>
              </div>

              {/* Danger score slider */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-text-muted">Min danger</span>
                  <span className="font-mono text-text-primary">{f.minDanger}/100</span>
                </div>
                <input
                  type="range" min={0} max={100} step={10}
                  value={f.minDanger}
                  onChange={(e) => f.setMinDanger(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between font-mono text-[9px] text-text-muted">
                  <span>0</span><span>100</span>
                </div>
              </div>

              {/* Has media */}
              <div className="mt-3">
                <div className="mb-2 font-mono uppercase tracking-wider text-text-muted">Has media</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "", label: "Any" },
                    { id: "image", label: "Image" },
                    { id: "video", label: "Video" },
                    { id: "satellite", label: "Satellite" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => f.setHasMedia(m.id)}
                      className={`rounded border px-2 py-1 text-xs ${
                        f.hasMedia === m.id
                          ? "border-transparent bg-bg-surface text-text-primary"
                          : "border-border-subtle text-text-muted"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification state */}
            <div>
              <div className="mb-2 font-mono uppercase tracking-wider text-text-muted">
                Verification
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => f.setVerification("")}
                  className={`block w-full rounded border px-2 py-1 text-left ${
                    f.verification === ""
                      ? "border-transparent bg-bg-surface text-text-primary"
                      : "border-border-subtle text-text-muted hover:text-text-secondary"
                  }`}
                >
                  All
                </button>
                {VERIFICATION_STATES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      f.setVerification(f.verification === v.id ? "" : v.id)
                    }
                    className={`block w-full rounded border px-2 py-1 text-left ${
                      f.verification === v.id
                        ? "border-transparent bg-bg-surface text-text-primary"
                        : "border-border-subtle text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
