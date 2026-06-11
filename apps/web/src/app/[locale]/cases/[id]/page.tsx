"use client";

import { useState, useRef, forwardRef } from "react";
import { CaseEventList } from "@/components/Cases/CaseEventList";
import { VersionHistory } from "@/components/Cases/VersionHistory";

// ── Types ─────────────────────────────────────────────────────────────────────

type NoteType = "note" | "verification" | "task" | "system";
type CaseStatus = "active" | "on_hold" | "concluded";
type CaseVisibility = "private" | "team" | "public";

interface CaseNote {
  id: string;
  author: string;
  text: string;
  time: string;
  type: NoteType;
  replies?: CaseNote[];
}

interface CaseDetail {
  id: string;
  title: string;
  status: CaseStatus;
  created: string;
  updatedAt: string;
  contributors: string[];
  events: string[];
  notes: CaseNote[];
  tags: string[];
  visibility: CaseVisibility;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const CASE_DATA: Record<string, CaseDetail> = {
  "case-1": {
    id: "case-1",
    title: "Kharkiv OSINT Investigation — Q2 2026",
    status: "active",
    created: "2026-05-01",
    updatedAt: "2026-06-03",
    contributors: ["Oleksandr K.", "James W."],
    events: ["01HXKHARKIVDRONE001", "01HXKYIVALERT001"],
    notes: [
      {
        id: "n1",
        author: "Oleksandr K.",
        text: "Initial drone sighting reported via 3 Telegram channels. Confidence 78%. Pending visual verification.",
        time: "2026-06-01 14:32",
        type: "note",
      },
      {
        id: "n2",
        author: "James W.",
        text: "Cross-referenced with GenStaff update. Matches reported sector.",
        time: "2026-06-01 15:10",
        type: "verification",
      },
      {
        id: "n3",
        author: "Oleksandr K.",
        text: "Satellite imagery requested — Sentinel-2 overpass in 6h.",
        time: "2026-06-02 09:00",
        type: "task",
      },
    ],
    tags: ["drone", "military_action", "kharkiv"],
    visibility: "private",
  },
  "case-001": {
    id: "case-001",
    title: "Kharkiv Front — June 2026",
    status: "active",
    created: "2026-06-01",
    updatedAt: "2026-06-03",
    contributors: ["Oleksandr K.", "James W.", "Maria T."],
    events: ["01HXKHARKIVDRONE001"],
    notes: [],
    tags: ["front", "kharkiv", "military_action"],
    visibility: "team",
  },
  "case-002": {
    id: "case-002",
    title: "Dnipro Infrastructure Strikes",
    status: "active",
    created: "2026-05-28",
    updatedAt: "2026-06-02",
    contributors: ["Oleksandr K."],
    events: [],
    notes: [],
    tags: ["infrastructure", "dnipro"],
    visibility: "team",
  },
  "case-003": {
    id: "case-003",
    title: "Cyber Incidents — May 2026",
    status: "concluded",
    created: "2026-05-01",
    updatedAt: "2026-05-31",
    contributors: ["Oleksandr K.", "James W."],
    events: [],
    notes: [],
    tags: ["cyber"],
    visibility: "private",
  },
};

const PINNED_EVENTS_SEED: Record<string, Array<{ id: string; cls: string; summary: string; confidence: number; danger: number }>> = {
  "case-1": [
    { id: "01HXKHARKIVDRONE001", cls: "military_action", summary: "[synthetic] Reported drone activity near Kharkiv. Demo seed event.", confidence: 0.78, danger: 62 },
    { id: "01HXKYIVALERT001", cls: "military_action", summary: "[synthetic] Alert — air raid siren activation across Kyiv region.", confidence: 0.91, danger: 74 },
  ],
};

// ── UI helpers ────────────────────────────────────────────────────────────────

const NOTE_TYPE_STYLES: Record<NoteType, string> = {
  note:         "bg-bg-elevated text-text-muted",
  verification: "bg-green-500/10 text-green-400",
  task:         "bg-orange-500/10 text-orange-400",
  system:       "bg-accent/10 text-accent",
};

const NOTE_TYPE_LABEL: Record<NoteType, string> = {
  note:         "Note",
  verification: "Verified",
  task:         "Task",
  system:       "System",
};

const STATUS_OPTIONS: { value: CaseStatus; label: string }[] = [
  { value: "active",    label: "Active" },
  { value: "on_hold",  label: "On hold" },
  { value: "concluded", label: "Concluded" },
];

const VISIBILITY_OPTIONS: { value: CaseVisibility; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "team",    label: "Team" },
  { value: "public",  label: "Public" },
];

function fireToast(message: string, variant = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aegis:toast", { detail: { message, variant } }));
  }
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 font-mono text-xs font-bold text-accent">
      {initials}
    </span>
  );
}

// ── Note item with threaded reply ─────────────────────────────────────────────

function NoteItem({
  note,
  contributors,
  onReply,
}: {
  note: CaseNote;
  contributors: string[];
  onReply: (parentId: string, text: string, type: NoteType) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyType, setReplyType] = useState<NoteType>("note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(note.id, replyText.trim(), replyType);
    setReplyText("");
    setReplyOpen(false);
  }

  return (
    <div className="flex gap-3">
      <Avatar name={note.author} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{note.author}</span>
          <span className="font-mono text-[10px] text-text-muted">{note.time}</span>
          <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${NOTE_TYPE_STYLES[note.type]}`}>
            {NOTE_TYPE_LABEL[note.type]}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">{note.text}</p>
        <button
          type="button"
          onClick={() => {
            setReplyOpen((v) => !v);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }}
          className="mt-1.5 text-[11px] text-text-muted hover:text-accent transition-colors"
        >
          Reply
        </button>

        {/* Threaded replies */}
        {note.replies && note.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 border-l-2 border-border-subtle pl-4">
            {note.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar name={reply.author} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">{reply.author}</span>
                    <span className="font-mono text-[10px] text-text-muted">{reply.time}</span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${NOTE_TYPE_STYLES[reply.type]}`}>
                      {NOTE_TYPE_LABEL[reply.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{reply.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline reply form */}
        {replyOpen && (
          <form onSubmit={submitReply} className="mt-3 space-y-2 rounded border border-border-default bg-bg-elevated p-3">
            <MentionTextarea
              ref={textareaRef}
              value={replyText}
              onChange={setReplyText}
              contributors={contributors}
              placeholder="Write a reply…"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <select
                value={replyType}
                onChange={(e) => setReplyType(e.target.value as NoteType)}
                className="rounded border border-border-default bg-bg-base px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
              >
                <option value="note">Note</option>
                <option value="verification">Verification</option>
                <option value="task">Task</option>
              </select>
              <button
                type="submit"
                className="rounded bg-accent px-3 py-1 text-xs font-semibold text-black hover:bg-accent/90"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setReplyOpen(false)}
                className="rounded border border-border-default px-3 py-1 text-xs text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Mention textarea ──────────────────────────────────────────────────────────

const MentionTextarea = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (v: string) => void;
    contributors: string[];
    placeholder?: string;
    rows?: number;
  }
>(function MentionTextarea({ value, onChange, contributors, placeholder, rows = 3 }, ref) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    onChange(v);
    const atIdx = v.lastIndexOf("@");
    if (atIdx !== -1 && atIdx === v.length - 1) {
      setShowMentions(true);
      setMentionFilter("");
    } else if (atIdx !== -1 && v.slice(atIdx + 1).match(/^\w[\w .]*$/)) {
      setShowMentions(true);
      setMentionFilter(v.slice(atIdx + 1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  }

  function insertMention(name: string) {
    const atIdx = value.lastIndexOf("@");
    const before = atIdx !== -1 ? value.slice(0, atIdx) : value;
    onChange(`${before}@${name} `);
    setShowMentions(false);
  }

  const filtered = contributors.filter((c) =>
    c.toLowerCase().includes(mentionFilter),
  );

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
      />
      {showMentions && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded border border-border-default bg-bg-surface shadow-lg">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(c);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated"
            >
              <Avatar name={c} />
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ── Left column: metadata ─────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2 first:pt-0">
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-0.5">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CaseDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const { id } = params;
  const initial = CASE_DATA[id];

  const [caseData, setCaseData] = useState<CaseDetail | null>(initial ?? null);
  const [notes, setNotes] = useState<CaseNote[]>(initial?.notes ?? []);
  const [pinnedEvents, setPinnedEvents] = useState(PINNED_EVENTS_SEED[id] ?? []);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteType, setNewNoteType] = useState<NoteType>("note");
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  if (!caseData) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-text-primary">Case not found</p>
        <p className="mt-2 text-sm text-text-muted">ID: {id}</p>
        <a href="/cases" className="mt-4 inline-block text-sm text-accent hover:underline">
          Back to Case Files
        </a>
      </div>
    );
  }

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note: CaseNote = {
      id: `n-${Date.now()}`,
      author: "Oleksandr K.",
      text: newNoteText.trim(),
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      type: newNoteType,
    };
    setNotes((prev) => [...prev, note]);
    setNewNoteText("");
  }

  function addReply(parentId: string, text: string, type: NoteType) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === parentId
          ? {
              ...n,
              replies: [
                ...(n.replies ?? []),
                {
                  id: `r-${Date.now()}`,
                  author: "Oleksandr K.",
                  text,
                  time: new Date().toISOString().slice(0, 16).replace("T", " "),
                  type,
                },
              ],
            }
          : n,
      ),
    );
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify({ ...caseData, notes }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleArchive() {
    if (!archiveConfirm) {
      setArchiveConfirm(true);
      return;
    }
    setCaseData((prev) => prev ? { ...prev, status: "concluded" } : prev);
    setArchiveConfirm(false);
    fireToast("Case archived", "warning");
  }

  const locale = params.locale ?? "en";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-mono text-[11px] text-text-muted">
        <a href={`/${locale}/cases`} className="hover:text-accent">Case Files</a>
        <span>/</span>
        <span className="text-text-secondary">{caseData.title}</span>
      </nav>

      {/* Title row */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{caseData.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={[
              "rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
              caseData.status === "active" ? "bg-accent/10 text-accent" :
              caseData.status === "on_hold" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-bg-elevated text-text-muted",
            ].join(" ")}>
              {caseData.status.replace("_", " ")}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              Updated {caseData.updatedAt}
            </span>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-6 items-start">

        {/* ── Left column (240px) ── */}
        <aside className="w-60 shrink-0 rounded-lg border border-border-subtle bg-bg-surface p-4 space-y-1">
          <MetaRow label="Case ID">
            <span className="font-mono text-[11px] text-text-muted">{caseData.id}</span>
          </MetaRow>
          <MetaRow label="Created">
            <span className="text-xs text-text-secondary">{caseData.created}</span>
          </MetaRow>
          <MetaRow label="Visibility">
            <span className={[
              "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
              caseData.visibility === "public" ? "bg-yellow-500/10 text-yellow-400" :
              caseData.visibility === "team" ? "bg-blue-500/10 text-blue-400" :
              "bg-bg-elevated text-text-muted",
            ].join(" ")}>
              {caseData.visibility}
            </span>
          </MetaRow>

          {/* Contributors */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
              Contributors
            </div>
            <div className="flex flex-col gap-1.5">
              {caseData.contributors.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Avatar name={c} />
                  <span className="text-xs text-text-secondary">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned events */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
              Pinned Events ({pinnedEvents.length})
            </div>
            <CaseEventList
              events={pinnedEvents}
              onRemove={(eid) =>
                setPinnedEvents((prev) => prev.filter((e) => e.id !== eid))
              }
              onPin={(ev) =>
                setPinnedEvents((prev) =>
                  prev.find((e) => e.id === ev.id) ? prev : [...prev, ev],
                )
              }
            />
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {caseData.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Center column (flex-1) ── */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Activity feed */}
          <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-text-primary">Activity</h2>
            {notes.length === 0 && (
              <p className="text-sm text-text-muted">No notes yet. Add one below.</p>
            )}
            <div className="flex flex-col gap-5">
              {notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  contributors={caseData.contributors}
                  onReply={addReply}
                />
              ))}
            </div>
          </section>

          {/* Add note form */}
          <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Add to case</h2>
            <form onSubmit={addNote} className="space-y-3">
              <MentionTextarea
                value={newNoteText}
                onChange={setNewNoteText}
                contributors={caseData.contributors}
                placeholder="Write a note, verification, or task… (type @ to mention)"
                rows={4}
              />
              <div className="flex items-center gap-3">
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as NoteType)}
                  className="rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                >
                  <option value="note">Note</option>
                  <option value="verification">Verification</option>
                  <option value="task">Task</option>
                </select>
                <button
                  type="submit"
                  className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90"
                >
                  Add to case
                </button>
              </div>
            </form>
          </section>
        </main>

        {/* ── Right column (280px) ── */}
        <aside className="w-72 shrink-0 space-y-4">

          {/* Status selector */}
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 space-y-3">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Case status
            </h3>
            <div className="flex flex-col gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-bg-elevated transition-colors"
                >
                  <input
                    type="radio"
                    name="case-status"
                    value={opt.value}
                    checked={caseData.status === opt.value}
                    onChange={() =>
                      setCaseData((prev) =>
                        prev ? { ...prev, status: opt.value } : prev,
                      )
                    }
                    className="accent-accent"
                  />
                  <span className="text-sm text-text-secondary">{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Visibility */}
            <div className="pt-3 border-t border-border-subtle">
              <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Visibility
              </h3>
              <div className="flex flex-col gap-1">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-bg-elevated transition-colors"
                  >
                    <input
                      type="radio"
                      name="case-visibility"
                      value={opt.value}
                      checked={caseData.visibility === opt.value}
                      onChange={() =>
                        setCaseData((prev) =>
                          prev ? { ...prev, visibility: opt.value } : prev,
                        )
                      }
                      className="accent-accent"
                    />
                    <span className="text-sm text-text-secondary">{opt.label}</span>
                  </label>
                ))}
              </div>
              {caseData.visibility === "public" && (
                <p className="mt-2 rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
                  Public cases are visible to anyone with the link.
                </p>
              )}
            </div>
          </div>

          {/* Export */}
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 space-y-2">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
              Export
            </h3>
            <button
              type="button"
              onClick={() => fireToast("PDF export — coming soon", "info")}
              className="flex w-full items-center gap-2 rounded border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <span>Export as PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex w-full items-center gap-2 rounded border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <span>Export as JSON</span>
            </button>
            <button
              type="button"
              onClick={() => fireToast("STIX 2.1 export — coming soon", "info")}
              className="flex w-full items-center gap-2 rounded border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <span>Export as STIX 2.1</span>
            </button>
            <a
              href={`/reports/generate?case=${caseData.id}`}
              className="flex w-full items-center gap-2 rounded border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              Convert to report draft
            </a>
          </div>

          {/* Related cases */}
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Related Cases
            </h3>
            <div className="flex flex-col gap-2">
              {Object.values(CASE_DATA)
                .filter((c) => c.id !== caseData.id)
                .slice(0, 3)
                .map((related) => (
                  <a
                    key={related.id}
                    href={`/${locale}/cases/${related.id}`}
                    className="group flex items-start justify-between gap-2 rounded border border-border-subtle p-2 hover:border-border-default hover:bg-bg-elevated transition-colors"
                  >
                    <span className="text-xs text-text-secondary group-hover:text-text-primary leading-snug">
                      {related.title}
                    </span>
                    <span className={[
                      "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase",
                      related.status === "active" ? "bg-accent/10 text-accent" : "bg-bg-elevated text-text-muted",
                    ].join(" ")}>
                      {related.status.replace("_", " ")}
                    </span>
                  </a>
                ))}
            </div>
          </div>

          {/* Version history */}
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <VersionHistory />
          </div>

          {/* Danger zone */}
          <div className="rounded-lg border border-red-500/30 bg-bg-surface p-4">
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-red-400">
              Danger zone
            </h3>
            <button
              type="button"
              onClick={handleArchive}
              className={[
                "w-full rounded border px-3 py-2 text-sm font-medium transition-colors",
                archiveConfirm
                  ? "border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10",
              ].join(" ")}
            >
              {archiveConfirm ? "Confirm archive?" : "Archive case"}
            </button>
            {archiveConfirm && (
              <button
                type="button"
                onClick={() => setArchiveConfirm(false)}
                className="mt-2 w-full text-xs text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
