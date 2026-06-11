"use client";

import { useState, useEffect, useCallback } from "react";
import { WatchlistWidget } from "./WatchlistWidget";
import { AnomalyWidget } from "./AnomalyWidget";
import { SourceHealthWidget } from "./SourceHealthWidget";

// ─── Types ────────────────────────────────────────────────────────────────────

type Widget = {
  id: string;
  title: string;
  colSpan: 4 | 6 | 8 | 12;
  minHeight: number;
};

export type DashboardWidgetSlots = {
  kpi?: React.ReactNode;
  events?: React.ReactNode;
  classes?: React.ReactNode;
  brief?: React.ReactNode;
  alerts?: React.ReactNode;
};

type Props = {
  slots?: DashboardWidgetSlots;
  editMode?: boolean;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_WIDGETS: Widget[] = [
  { id: "kpi",           title: "Key Metrics",      colSpan: 12, minHeight: 80  },
  { id: "events",        title: "Recent Events",     colSpan: 8,  minHeight: 300 },
  { id: "classes",       title: "Event Classes",     colSpan: 4,  minHeight: 300 },
  { id: "brief",         title: "AI Morning Brief",  colSpan: 8,  minHeight: 200 },
  { id: "alerts",        title: "Alert Rules",       colSpan: 4,  minHeight: 200 },
  { id: "watchlist",     title: "Watchlist",         colSpan: 4,  minHeight: 200 },
  { id: "anomalies",     title: "Anomalies",         colSpan: 4,  minHeight: 150 },
  { id: "source-health", title: "Source Health",     colSpan: 4,  minHeight: 150 },
];

const LS_KEY = "aegis_dashboard_layout";
const LS_HIDDEN_KEY = "aegis_dashboard_hidden";

// ─── Widget content router ────────────────────────────────────────────────────

function WidgetContent({
  id,
  slots,
}: {
  id: string;
  slots?: DashboardWidgetSlots;
}) {
  switch (id) {
    case "kpi":
      return slots?.kpi ? <>{slots.kpi}</> : <PlaceholderContent label="Key Metrics" />;
    case "events":
      return slots?.events ? <>{slots.events}</> : <PlaceholderContent label="Event Feed" />;
    case "classes":
      return slots?.classes ? <>{slots.classes}</> : <PlaceholderContent label="Class Chart" />;
    case "brief":
      return slots?.brief ? <>{slots.brief}</> : <PlaceholderContent label="AI Brief" />;
    case "alerts":
      return slots?.alerts ? <>{slots.alerts}</> : <PlaceholderContent label="Alert Rules" />;
    case "watchlist":
      return <WatchlistWidget />;
    case "anomalies":
      return <AnomalyWidget />;
    case "source-health":
      return <SourceHealthWidget />;
    default:
      return <PlaceholderContent label={id} />;
  }
}

function PlaceholderContent({ label }: { label: string }) {
  return (
    <div className="flex h-16 items-center justify-center text-xs text-text-muted">
      [{label}]
    </div>
  );
}

// ─── Add-widget modal ─────────────────────────────────────────────────────────

function AddWidgetModal({
  hidden,
  onToggle,
  onClose,
}: {
  hidden: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manage widgets"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Manage Widgets</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-2">
          {DEFAULT_WIDGETS.map((w) => {
            const visible = !hidden.has(w.id);
            return (
              <li key={w.id} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{w.title}</span>
                <button
                  type="button"
                  onClick={() => onToggle(w.id)}
                  className={`flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
                    visible
                      ? "border-accent/60 bg-accent/20"
                      : "border-border-subtle bg-bg-base"
                  }`}
                  aria-pressed={visible}
                  aria-label={`${visible ? "Hide" : "Show"} ${w.title}`}
                >
                  <span
                    className={`ml-0.5 h-4 w-4 rounded-full transition-transform ${
                      visible
                        ? "translate-x-4 bg-accent"
                        : "translate-x-0 bg-text-muted"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded bg-accent py-1.5 text-xs font-semibold text-bg-base hover:bg-accent/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── DraggableGrid ────────────────────────────────────────────────────────────

export function DraggableGrid({ slots, editMode = false }: Props) {
  // Initialise order from localStorage or defaults
  const [order, setOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_WIDGETS.map((w) => w.id);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        // Merge: keep saved order, append any new widget IDs not yet stored
        const known = new Set(parsed);
        const all = [...parsed, ...DEFAULT_WIDGETS.map((w) => w.id).filter((id) => !known.has(id))];
        return all;
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDGETS.map((w) => w.id);
  });

  const [hidden, setHidden] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(LS_HIDDEN_KEY);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
    return new Set();
  });

  const [dragId, setDragId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Persist order on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(order));
    } catch {
      // ignore
    }
  }, [order]);

  // Persist hidden on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_HIDDEN_KEY, JSON.stringify([...hidden]));
    } catch {
      // ignore
    }
  }, [hidden]);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) return;
      setOrder((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(dragId);
        const toIdx = next.indexOf(targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, dragId);
        return next;
      });
    },
    [dragId],
  );

  const resetLayout = () => {
    const def = DEFAULT_WIDGETS.map((w) => w.id);
    setOrder(def);
    setHidden(new Set());
    try {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_HIDDEN_KEY);
    } catch {
      // ignore
    }
  };

  const toggleHidden = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build ordered widget list, merging metadata
  const widgetMap = new Map(DEFAULT_WIDGETS.map((w) => [w.id, w]));
  const orderedWidgets = order
    .map((id) => widgetMap.get(id))
    .filter((w): w is Widget => !!w && !hidden.has(w.id));

  return (
    <>
      {/* Top toolbar (reset / add widget) */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={resetLayout}
          className="rounded border border-border-subtle bg-bg-surface px-3 py-1 text-xs text-text-muted hover:text-text-primary"
        >
          Reset layout
        </button>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded border border-border-subtle bg-bg-surface px-3 py-1 text-xs text-text-muted hover:text-text-primary"
        >
          + Add widget
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-4">
        {orderedWidgets.map((w) => (
          <div
            key={w.id}
            draggable={editMode}
            onDragStart={editMode ? () => setDragId(w.id) : undefined}
            onDragOver={editMode ? (e) => e.preventDefault() : undefined}
            onDrop={editMode ? () => handleDrop(w.id) : undefined}
            onDragEnd={editMode ? () => setDragId(null) : undefined}
            className={[
              `col-span-12`,
              w.colSpan === 4  ? "lg:col-span-4"  : "",
              w.colSpan === 6  ? "lg:col-span-6"  : "",
              w.colSpan === 8  ? "lg:col-span-8"  : "",
              w.colSpan === 12 ? "lg:col-span-12" : "",
              dragId === w.id ? "opacity-50" : "",
              editMode ? "cursor-grab active:cursor-grabbing" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ minHeight: w.minHeight }}
          >
            <div className="h-full rounded border border-border-subtle bg-bg-surface p-4">
              {/* Widget header */}
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {w.title}
                </h2>
                {editMode && (
                  <span
                    className="cursor-grab select-none text-text-muted"
                    title="Drag to reorder"
                    aria-hidden="true"
                  >
                    ⠿
                  </span>
                )}
              </div>
              {/* Widget body */}
              <WidgetContent id={w.id} slots={slots} />
            </div>
          </div>
        ))}
      </div>

      {/* Add-widget modal */}
      {showModal && (
        <AddWidgetModal
          hidden={hidden}
          onToggle={toggleHidden}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
