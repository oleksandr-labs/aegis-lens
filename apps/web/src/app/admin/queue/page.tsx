"use client";

import { useState } from "react";

type Priority = "critical" | "high" | "normal";
type EventClass = "military_action" | "civilian_alert" | "infrastructure" | "cyber" | "diplomatic";
type VerificationState = "pending" | "verified" | "retracted";

type QueueItem = {
  id: string;
  eventId: string;
  class: EventClass;
  summary: string;
  confidence: number;
  sources: number;
  submittedAt: string;
  priority: Priority;
  state: VerificationState;
};

const INITIAL_QUEUE: QueueItem[] = [
  { id: "q1", eventId: "01HXKHARKIVDRONE001", class: "military_action", summary: "Reported drone activity near Kharkiv — multiple eyewitness accounts from residential areas", confidence: 0.68, sources: 2, submittedAt: "2h ago", priority: "high", state: "pending" },
  { id: "q2", eventId: "LIVE-001", class: "civilian_alert", summary: "Air raid warning in Mykolaiv Oblast — sirens active, shelter-in-place advisory issued", confidence: 0.45, sources: 1, submittedAt: "30min ago", priority: "critical", state: "pending" },
  { id: "q3", eventId: "LIVE-002", class: "infrastructure", summary: "Reported power outage in Zaporizhzhia — approx 40k customers affected, utility company silent", confidence: 0.72, sources: 3, submittedAt: "4h ago", priority: "normal", state: "pending" },
];

const CLASS_COLOR: Record<EventClass, string> = {
  military_action: "#ef4444",
  civilian_alert: "#f97316",
  infrastructure: "#eab308",
  cyber: "#a855f7",
  diplomatic: "#4ea1ff",
};

const PRIORITY_STYLE: Record<Priority, string> = {
  critical: "bg-red-900/40 text-red-400 border-red-500/40",
  high: "bg-amber-900/30 text-amber-400 border-amber-500/40",
  normal: "bg-bg-elevated text-text-muted border-border-default",
};

const SOURCE_LINKS: Record<string, string[]> = {
  q1: ["t.me/ukraine_osint (post #4921)", "twitter.com/UAweapons (archived)"],
  q2: ["t.me/suspilne_news (post #1103)", "no secondary source"],
  q3: ["t.me/zaporiz_info (post #782)", "oblenergo.zp.ua (offline)", "kyivindependent.com/article/44321"],
};

export default function AdminQueuePage() {
  const [items, setItems] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [panel, setPanel] = useState<QueueItem | null>(null);
  const [confidence, setConfidence] = useState<number>(0.5);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const act = (id: string, next: VerificationState) => {
    setItems((prev) => prev.map((q) => (q.id === id ? { ...q, state: next } : q)));
    if (panel?.id === id) setPanel((p) => p ? { ...p, state: next } : null);
  };

  const openPanel = (item: QueueItem) => {
    setPanel(item);
    setConfidence(item.confidence);
    setNote("");
    setNoteSaved(false);
  };

  const saveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const pending = items.filter((i) => i.state === "pending");
  const resolved = items.filter((i) => i.state !== "pending");

  return (
    <div className="px-6 py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Admin</span>
          <h1 className="text-xl font-semibold text-text-primary">Verification Queue</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-muted">
            {pending.length} pending · {resolved.length} resolved
          </span>
          <a href="/admin" className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface">
            ← Dashboard
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-6 flex gap-4">
        {(["critical", "high", "normal"] as Priority[]).map((p) => {
          const count = pending.filter((i) => i.priority === p).length;
          return (
            <div key={p} className={`rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${PRIORITY_STYLE[p]}`}>
              {p}: {count}
            </div>
          );
        })}
      </div>

      {/* Queue table */}
      <div className={`overflow-hidden rounded border border-border-subtle bg-bg-surface transition-all ${panel ? "mr-[416px]" : ""}`}>
        {/* Pending */}
        <div className="border-b border-border-subtle px-4 py-2 bg-bg-elevated">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Pending review ({pending.length})</span>
        </div>
        {pending.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-text-muted">Queue empty — all events reviewed.</div>
        )}
        {pending.map((item) => (
          <div
            key={item.id}
            className={`border-b border-border-subtle px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between transition-colors hover:bg-bg-elevated cursor-pointer ${
              panel?.id === item.id ? "bg-bg-elevated" : ""
            }`}
            onClick={() => openPanel(item)}
          >
            {/* Left: identity */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span
                className="mt-1.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: CLASS_COLOR[item.class] }}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-text-muted">{item.eventId}</span>
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${PRIORITY_STYLE[item.priority]}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="mt-0.5 text-sm text-text-primary truncate max-w-lg">{item.summary}</div>
                <div className="mt-1 flex gap-3 flex-wrap font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  <span style={{ color: CLASS_COLOR[item.class] }}>{item.class.replace("_", " ")}</span>
                  <span>conf: {item.confidence.toFixed(2)}</span>
                  <span>{item.sources} source{item.sources !== 1 ? "s" : ""}</span>
                  <span>{item.submittedAt}</span>
                </div>
              </div>
            </div>

            {/* Confidence mini-bar */}
            <div className="flex items-center gap-2 flex-shrink-0 md:mx-4">
              <div className="w-20 h-1.5 rounded bg-bg-elevated overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    item.confidence >= 0.7
                      ? "bg-emerald-400"
                      : item.confidence >= 0.5
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${item.confidence * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-text-muted">{(item.confidence * 100).toFixed(0)}%</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => act(item.id, "verified")}
                className="rounded border border-emerald-500/40 px-2.5 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/10 font-mono"
                title="Approve — promote to verified"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => act(item.id, "retracted")}
                className="rounded border border-red-500/40 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/10 font-mono"
                title="Reject — mark as retracted"
              >
                ✕ Reject
              </button>
              <button
                onClick={() => openPanel(item)}
                className="rounded border border-[#4ea1ff]/40 px-2.5 py-1 text-[11px] text-[#4ea1ff] hover:bg-[#4ea1ff]/10 font-mono"
              >
                → Review
              </button>
            </div>
          </div>
        ))}

        {/* Resolved section */}
        {resolved.length > 0 && (
          <>
            <div className="border-b border-border-subtle border-t px-4 py-2 bg-bg-elevated">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Resolved ({resolved.length})</span>
            </div>
            {resolved.map((item) => (
              <div
                key={item.id}
                className="border-b border-border-subtle px-4 py-2.5 flex items-center gap-3 opacity-60 last:border-b-0"
              >
                <span
                  className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: CLASS_COLOR[item.class] }}
                  aria-hidden
                />
                <span className="font-mono text-[10px] text-text-muted flex-shrink-0">{item.eventId}</span>
                <span className="text-xs text-text-secondary truncate flex-1">{item.summary}</span>
                <span
                  className={`flex-shrink-0 font-mono text-[10px] uppercase ${
                    item.state === "verified" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {item.state}
                </span>
                <button
                  onClick={() => act(item.id, "pending")}
                  className="flex-shrink-0 rounded border border-border-subtle px-2 py-0.5 text-[9px] font-mono uppercase text-text-muted hover:text-text-primary hover:border-border-default"
                >
                  Undo
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Detail review panel */}
      {panel && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setPanel(null)} />
          <div className="fixed right-0 top-0 z-40 h-full w-[400px] border-l border-border-subtle bg-bg-elevated flex flex-col shadow-2xl overflow-y-auto">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Event review</span>
                <div className="font-mono text-xs text-text-muted mt-0.5">{panel.eventId}</div>
              </div>
              <button
                onClick={() => setPanel(null)}
                className="text-text-muted hover:text-text-primary text-xl leading-none"
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            <div className="flex-1 p-4 space-y-5">
              {/* State badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: CLASS_COLOR[panel.class] }}
                />
                <span className="font-mono text-[10px] uppercase text-text-muted">{panel.class.replace("_", " ")}</span>
                <span className={`ml-auto rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${PRIORITY_STYLE[panel.priority]}`}>
                  {panel.priority}
                </span>
                {panel.state !== "pending" && (
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                    panel.state === "verified" ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400"
                  }`}>
                    {panel.state}
                  </span>
                )}
              </div>

              {/* Summary */}
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">Summary</div>
                <p className="text-sm text-text-primary leading-relaxed">{panel.summary}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Submitted", val: panel.submittedAt },
                  { label: "Sources", val: String(panel.sources) },
                  { label: "Raw confidence", val: `${(panel.confidence * 100).toFixed(1)}%` },
                  { label: "Event class", val: panel.class },
                ].map((s) => (
                  <div key={s.label} className="rounded border border-border-subtle bg-bg-surface p-2">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{s.label}</div>
                    <div className="mt-0.5 font-mono text-xs text-text-primary">{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Source links */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Source links ({panel.sources})
                </div>
                <ul className="space-y-1.5">
                  {(SOURCE_LINKS[panel.id] ?? ["No source links available"]).map((src, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[#4ea1ff]" />
                      <span className="text-xs font-mono text-[#4ea1ff] break-all">{src}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Geolocation verify */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Geolocation</div>
                <button className="w-full rounded border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface hover:text-text-primary transition">
                  Verify geolocation on map →
                </button>
              </div>

              {/* Confidence assessment slider */}
              <div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-text-muted">Confidence assessment</span>
                  <span className={`font-semibold ${
                    confidence >= 0.7 ? "text-emerald-400" : confidence >= 0.5 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-text-muted">
                  <span>Unverified</span>
                  <span>Confirmed</span>
                </div>
                {/* Gradient bar */}
                <div className="mt-2 h-1.5 rounded overflow-hidden bg-bg-surface">
                  <div
                    className={`h-full transition-all ${
                      confidence >= 0.7 ? "bg-emerald-400" : confidence >= 0.5 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Reviewer note */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Reviewer note</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add your assessment notes here…"
                  className="w-full rounded border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
                />
                <button
                  onClick={saveNote}
                  disabled={!note.trim()}
                  className={`mt-1.5 rounded border px-3 py-1 text-[10px] font-mono uppercase transition ${
                    note.trim()
                      ? "border-accent/40 text-accent hover:bg-accent/10"
                      : "border-border-subtle text-text-muted opacity-50 cursor-not-allowed"
                  }`}
                >
                  {noteSaved ? "Saved!" : "Save note"}
                </button>
              </div>
            </div>

            {/* Panel action footer */}
            <div className="border-t border-border-subtle p-4 space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted mb-3">
                Final decision
              </div>
              <button
                onClick={() => act(panel.id, "verified")}
                disabled={panel.state === "verified"}
                className={`w-full rounded border px-3 py-2 text-sm font-semibold transition ${
                  panel.state === "verified"
                    ? "border-emerald-500/40 bg-emerald-900/20 text-emerald-400 cursor-not-allowed"
                    : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {panel.state === "verified" ? "✓ Already verified" : "✓ Approve — promote to verified"}
              </button>
              <button
                onClick={() => act(panel.id, "retracted")}
                disabled={panel.state === "retracted"}
                className={`w-full rounded border px-3 py-2 text-sm font-semibold transition ${
                  panel.state === "retracted"
                    ? "border-red-500/40 bg-red-900/20 text-red-400 cursor-not-allowed"
                    : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                }`}
              >
                {panel.state === "retracted" ? "✕ Already rejected" : "✕ Reject — mark as retracted"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
