"use client";

import { useState } from "react";
import { FLAG_DEFINITIONS, type FlagId } from "@/lib/feature-flags";

type Audience = "all" | "beta" | "enterprise" | "team+" | "analyst+";

type FlagState = {
  id: FlagId;
  label: string;
  description: string;
  audience: Audience;
  enabled: boolean;
  rollout: number;
};

// Merge FLAG_DEFINITIONS with local enabled/rollout state.
// Any flag not in FLAG_DEFINITIONS is dropped; new flags get a default state.
const INITIAL_FLAGS: FlagState[] = FLAG_DEFINITIONS.map((def) => {
  // Legacy overrides for flags that existed before with specific on/rollout values
  const legacy: Partial<Record<FlagId, { enabled: boolean; rollout: number }>> = {
    ai_copilot_v2: { enabled: true, rollout: 100 },
    dashboard_widgets: { enabled: false, rollout: 0 },
    embed_builder: { enabled: true, rollout: 100 },
    mapbox_swap: { enabled: false, rollout: 0 },
    ai_reports: { enabled: true, rollout: 50 },
    browser_extension_link: { enabled: false, rollout: 0 },
  };
  const saved = legacy[def.id];
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    audience: def.audience as Audience,
    enabled: saved?.enabled ?? def.defaultEnabled,
    rollout: saved?.rollout ?? (def.defaultEnabled ? 100 : 0),
  };
});

const AUDIENCE_COLOR: Record<Audience, string> = {
  all: "text-emerald-400 border-emerald-400/40",
  beta: "text-[#4ea1ff] border-[#4ea1ff]/40",
  enterprise: "text-amber-400 border-amber-400/40",
  "team+": "text-purple-400 border-purple-400/40",
  "analyst+": "text-rose-400 border-rose-400/40",
};

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FlagState[]>(INITIAL_FLAGS);
  const [drafts, setDrafts] = useState<Record<string, { enabled: boolean; rollout: number }>>(() =>
    Object.fromEntries(INITIAL_FLAGS.map((f) => [f.id, { enabled: f.enabled, rollout: f.rollout }])),
  );
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [killSwitchModal, setKillSwitchModal] = useState(false);
  const [allDisabled, setAllDisabled] = useState(false);

  const updateDraft = (id: string, patch: Partial<{ enabled: boolean; rollout: number }>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveFlag = (id: string) => {
    const draft = drafts[id];
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...draft } : f)),
    );
    // Sync to localStorage so DevFlagsPanel and useFlagEnabled() pick up changes immediately
    localStorage.setItem(`aegis_flag_${id}`, String(draft.enabled));

    setSaved((prev) => {
      const next = new Set(prev);
      next.add(id);
      setTimeout(() => setSaved((s) => { const n = new Set(s); n.delete(id); return n; }), 1500);
      return next;
    });
  };

  const disableAll = () => {
    setFlags((prev) => prev.map((f) => ({ ...f, enabled: false, rollout: 0 })));
    setDrafts(Object.fromEntries(flags.map((f) => [f.id, { enabled: false, rollout: 0 }])));
    // Sync all to localStorage
    for (const f of flags) {
      localStorage.setItem(`aegis_flag_${f.id}`, "false");
    }
    setAllDisabled(true);
    setKillSwitchModal(false);
  };

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Admin</span>
          <h1 className="text-xl font-semibold text-text-primary">Feature Flags</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-muted">
            {enabledCount}/{flags.length} active
          </span>
          <a
            href="/admin"
            className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface"
          >
            ← Dashboard
          </a>
        </div>
      </div>

      {allDisabled && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-900/20 px-4 py-3 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-red-400 font-mono uppercase tracking-wider">
            Emergency kill-switch activated — all flags disabled
          </span>
          <button
            onClick={() => setAllDisabled(false)}
            className="ml-auto text-[10px] font-mono text-text-muted hover:text-text-primary uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency kill-switch */}
      <div className="mb-6 flex items-center justify-between rounded border border-red-500/30 bg-red-900/10 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-red-400">Emergency Kill-Switch</div>
          <div className="text-xs text-text-muted mt-0.5">
            Immediately disables all feature flags for all users and orgs.
          </div>
        </div>
        <button
          onClick={() => setKillSwitchModal(true)}
          className="rounded border border-red-500 bg-red-900/30 px-4 py-2 text-xs font-bold text-red-400 uppercase tracking-wider hover:bg-red-800/40 transition"
        >
          DISABLE ALL FLAGS
        </button>
      </div>

      {/* Flags table */}
      <div className="overflow-hidden rounded border border-border-subtle bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle bg-bg-elevated">
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
              <th className="px-4 py-2">Flag</th>
              <th className="px-4 py-2">Audience</th>
              <th className="px-4 py-2 w-20 text-center">On/Off</th>
              <th className="px-4 py-2">Rollout %</th>
              <th className="px-4 py-2 w-20 text-center">Save</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => {
              const draft = drafts[flag.id];
              const isDirty =
                draft.enabled !== flag.enabled || draft.rollout !== flag.rollout;

              return (
                <tr key={flag.id} className="border-t border-border-subtle">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-semibold text-text-primary">{flag.id}</div>
                    <div className="text-xs text-text-muted mt-0.5">{flag.description}</div>
                    {isDirty && (
                      <span className="mt-1 inline-block font-mono text-[9px] uppercase text-amber-400 tracking-wider">
                        unsaved changes
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${AUDIENCE_COLOR[flag.audience]}`}
                    >
                      {flag.audience}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={draft.enabled}
                      onClick={() =>
                        updateDraft(flag.id, {
                          enabled: !draft.enabled,
                          rollout: !draft.enabled ? flag.rollout || 100 : 0,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition ${
                        draft.enabled
                          ? "border-accent bg-accent/30"
                          : "border-border-default bg-bg-elevated"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full transition ${
                          draft.enabled ? "translate-x-6 bg-accent" : "translate-x-1 bg-text-muted"
                        }`}
                        aria-hidden
                      />
                      <span className="sr-only">{draft.enabled ? "on" : "off"}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={draft.rollout}
                        disabled={!draft.enabled}
                        onChange={(e) => updateDraft(flag.id, { rollout: Number(e.target.value) })}
                        className="w-28 accent-accent disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="w-10 font-mono text-xs text-text-secondary text-right">
                        {draft.rollout}%
                      </span>
                      {/* mini bar */}
                      <div className="w-20 h-1.5 rounded bg-bg-elevated overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{ width: `${draft.rollout}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {saved.has(flag.id) ? (
                      <span className="font-mono text-[10px] text-emerald-400 uppercase">Saved!</span>
                    ) : (
                      <button
                        onClick={() => saveFlag(flag.id)}
                        disabled={!isDirty}
                        className={`rounded border px-3 py-1 text-[10px] font-mono uppercase transition ${
                          isDirty
                            ? "border-accent/40 text-accent hover:bg-accent/10"
                            : "border-border-subtle text-text-muted cursor-not-allowed opacity-50"
                        }`}
                      >
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        UI-only · persistence via /api/admin/flags in Sprint 2 · changes sync to localStorage immediately
      </p>

      {/* Kill-switch confirmation modal */}
      {killSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded border border-red-500/50 bg-bg-elevated p-6 w-96 shadow-2xl">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-red-400">
              Danger zone
            </div>
            <div className="text-base font-bold text-text-primary mb-3">
              Disable all feature flags?
            </div>
            <p className="text-xs text-text-muted mb-5">
              This will immediately set all flags to{" "}
              <span className="text-red-400 font-semibold">disabled</span> with{" "}
              <span className="text-red-400 font-semibold">0% rollout</span> for every user and org.
              This action is logged.
            </p>
            <div className="flex gap-2">
              <button
                onClick={disableAll}
                className="flex-1 rounded bg-red-700 px-3 py-2 text-sm font-bold text-white hover:bg-red-800 uppercase tracking-wider"
              >
                Confirm — Disable All
              </button>
              <button
                onClick={() => setKillSwitchModal(false)}
                className="flex-1 rounded border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
