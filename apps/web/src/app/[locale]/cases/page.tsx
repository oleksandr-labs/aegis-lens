"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { NoCasesEmpty } from "@/components/ui/EmptyState";
import { CASE_TEMPLATES, type CaseTemplate } from "@/lib/case-templates";

type CaseStatus = "active" | "archived";

type Case = {
  id: string;
  title: string;
  events: number;
  notes: number;
  collaborators: number;
  status: CaseStatus;
  updatedAt: string;
};

const SAMPLE_CASES: Case[] = [
  {
    id: "case-001",
    title: "Kharkiv Front — June 2026",
    events: 142,
    notes: 18,
    collaborators: 3,
    status: "active",
    updatedAt: "2026-06-03",
  },
  {
    id: "case-002",
    title: "Dnipro Infrastructure Strikes",
    events: 67,
    notes: 9,
    collaborators: 1,
    status: "active",
    updatedAt: "2026-06-02",
  },
  {
    id: "case-003",
    title: "Cyber Incidents — May 2026",
    events: 34,
    notes: 5,
    collaborators: 2,
    status: "archived",
    updatedAt: "2026-05-31",
  },
];

const STATUS_STYLES: Record<CaseStatus, string> = {
  active: "bg-accent/10 text-accent",
  archived: "bg-bg-elevated text-text-muted",
};

type FilterValue = "all" | "active" | "archived";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "active",   label: "Active" },
  { value: "archived", label: "Archived" },
];

// ── Template modal ────────────────────────────────────────────────────────────

function TemplateModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (template: CaseTemplate) => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-lg border border-border-default bg-bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 className="text-base font-semibold text-text-primary">New from template</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Template cards */}
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {CASE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              className="group flex flex-col rounded-lg border border-border-subtle bg-bg-base p-4 text-left hover:border-accent hover:bg-bg-elevated transition-colors"
            >
              <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                {tpl.name}
              </span>
              <p className="mt-1 text-xs text-text-muted leading-snug">
                {tpl.description}
              </p>

              {/* Section preview */}
              <div className="mt-3 flex flex-col gap-1">
                {tpl.sections.map((section) => (
                  <div
                    key={section}
                    className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted"
                  >
                    <span className="h-px w-2 bg-border-default" />
                    {section}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-border-subtle px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CasesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusParam = (searchParams.get("status") as FilterValue) ?? "all";
  const [filter, setFilter] = useState<FilterValue>(
    FILTERS.map((f) => f.value).includes(statusParam) ? statusParam : "all",
  );

  const [cases, setCases] = useState<Case[]>(SAMPLE_CASES);
  const [showNew, setShowNew] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [templateSections, setTemplateSections] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null);

  // Sync filter → URL param
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "all") {
      params.delete("status");
    } else {
      params.set("status", filter);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = `case-${Date.now()}`;
    setCases((prev) => [
      {
        id,
        title: newTitle.trim(),
        events: 0,
        notes: 0,
        collaborators: 1,
        status: "active",
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setNewTitle("");
    setTemplateSections([]);
    setSelectedTemplate(null);
    setShowNew(false);
  }

  function handleSelectTemplate(tpl: CaseTemplate) {
    setSelectedTemplate(tpl);
    setTemplateSections(tpl.sections);
    setNewTitle(tpl.name + " — ");
    setShowTemplateModal(false);
    setShowNew(true);
  }

  const filtered = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Case Files</h1>
          <p className="mt-1 text-sm text-text-muted">
            Organize events, notes, and collaborators into investigations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="shrink-0 rounded border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            New from template
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateSections([]);
              setShowNew((v) => !v);
            }}
            className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90"
          >
            {showNew ? "Cancel" : "New case"}
          </button>
        </div>
      </div>

      {/* New case form */}
      {showNew && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded border border-border-default bg-bg-surface p-4 space-y-3"
        >
          {selectedTemplate && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                Template: {selectedTemplate.name}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              required
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Case title (e.g. Mariupol Siege — June)"
              className="flex-1 rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="shrink-0 rounded border border-border-default px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>

          {/* Section preview from template */}
          {templateSections.length > 0 && (
            <div className="rounded border border-border-subtle bg-bg-base p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Sections (from template)
              </p>
              <div className="flex flex-col gap-1">
                {templateSections.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="h-px w-3 bg-border-default" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Filter tabs */}
      <div className="mt-8 flex items-center gap-1 border-b border-border-subtle pb-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={[
              "rounded-t px-4 py-2 text-sm font-medium transition-colors",
              filter === f.value
                ? "border-b-2 border-accent text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            ].join(" ")}
          >
            {f.label}
            <span className="ml-1.5 font-mono text-[10px] text-text-muted">
              ({f.value === "all" ? cases.length : cases.filter((c) => c.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Cases grid or empty state */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <NoCasesEmpty />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="flex flex-col rounded border border-border-subtle bg-bg-surface p-4 hover:border-border-default transition-colors"
              >
                {/* Title + status */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-text-primary leading-snug flex-1">
                    {c.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${STATUS_STYLES[c.status]}`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-3 flex gap-4">
                  <Stat label="Events" value={c.events} />
                  <Stat label="Notes" value={c.notes} />
                  <Stat label="Members" value={c.collaborators} />
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="font-mono text-[10px] text-text-muted">
                    Updated {c.updatedAt}
                  </span>
                  <a
                    href={`/cases/${c.id}`}
                    className="rounded border border-border-default px-3 py-1 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                  >
                    Open
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Template modal */}
      <TemplateModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}
