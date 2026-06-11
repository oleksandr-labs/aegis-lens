"use client";

import { useState } from "react";
import { FLAG_DEFINITIONS } from "@/lib/feature-flags";

// Only render in development
export function DevFlagsPanel() {
  if (process.env.NODE_ENV !== "development") return null;

  return <DevFlagsPanelInner />;
}

// Inner component so hooks only run in dev (avoids conditional hook violation)
function DevFlagsPanelInner() {
  const [open, setOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => {
    const result: Record<string, boolean> = {};
    for (const flag of FLAG_DEFINITIONS) {
      const val = localStorage.getItem(`aegis_flag_${flag.id}`);
      if (val !== null) result[flag.id] = val === "true";
    }
    return result;
  });

  const setOverride = (id: string, value: boolean | null) => {
    if (value === null) {
      localStorage.removeItem(`aegis_flag_${id}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = overrides;
      setOverrides(rest);
    } else {
      localStorage.setItem(`aegis_flag_${id}`, String(value));
      setOverrides((prev) => ({ ...prev, [id]: value }));
    }
  };

  const resetAll = () => {
    for (const flag of FLAG_DEFINITIONS) {
      localStorage.removeItem(`aegis_flag_${flag.id}`);
    }
    setOverrides({});
    window.location.reload();
  };

  return (
    <>
      {/* Trigger button — bottom left corner */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-[200] h-8 w-8 rounded-full bg-purple-600 text-white text-[10px] font-mono shadow-lg hover:bg-purple-500 transition-colors flex items-center justify-center"
        title="Dev: Feature flags"
        aria-label="Toggle feature flags panel"
      >
        🚩
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-14 left-4 z-[200] w-80 max-h-96 overflow-y-auto rounded-lg border border-purple-500/30 bg-bg-base shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between bg-bg-elevated px-3 py-2 border-b border-border-subtle">
            <span className="font-mono text-[10px] uppercase text-purple-400 tracking-wider">
              Dev: Feature Flags
            </span>
            <button
              onClick={resetAll}
              className="text-[10px] text-text-muted hover:text-red-400 transition-colors"
            >
              Reset all
            </button>
          </div>

          {/* Flag rows */}
          <div className="divide-y divide-border-subtle">
            {FLAG_DEFINITIONS.map((flag) => {
              const effectiveValue = overrides[flag.id] ?? flag.defaultEnabled;
              const hasOverride = flag.id in overrides;

              return (
                <div key={flag.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="text-[11px] font-medium text-text-primary truncate">
                      {flag.label}
                    </div>
                    {hasOverride && (
                      <div className="text-[9px] text-purple-400 uppercase tracking-wider">
                        overridden
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => setOverride(flag.id, !effectiveValue)}
                      role="switch"
                      aria-checked={effectiveValue}
                      aria-label={`Toggle ${flag.label}`}
                      className={`h-5 w-9 rounded-full transition-colors relative ${
                        effectiveValue ? "bg-green-500" : "bg-border-default"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          effectiveValue ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    {/* Clear override */}
                    {hasOverride && (
                      <button
                        onClick={() => setOverride(flag.id, null)}
                        className="text-[10px] text-text-muted hover:text-text-primary ml-1 transition-colors"
                        aria-label={`Clear override for ${flag.label}`}
                        title="Clear override"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
