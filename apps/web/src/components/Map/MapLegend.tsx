"use client";

import type { AegisEvent, EventClass } from "@aegis/types";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { CLASS_ICON_PATH } from "@/lib/map-markers";

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  EventClass,
  string
>;

type MapLegendProps = {
  events: AegisEvent[];
  offlineMode: boolean;
  className?: string;
};

export function MapLegend({ events, offlineMode, className }: MapLegendProps) {
  return (
    <div
      className={`pointer-events-none absolute left-4 bottom-4 max-w-xs rounded border border-border-subtle bg-bg-elevated/90 p-3 text-xs backdrop-blur ${className ?? ""}`}
    >
      <div className="mb-2 font-mono uppercase tracking-wider text-text-muted">
        Events · {events.length}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {(Object.keys(CLASS_LABEL) as EventClass[]).map((cls) => (
          <li key={cls} className="flex items-center gap-2 text-text-secondary">
            <span
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
              style={{ color: CLASS_COLOR[cls] }}
            >
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                dangerouslySetInnerHTML={{ __html: CLASS_ICON_PATH[cls] }}
              />
            </span>
            <span className="text-[10px]">{CLASS_LABEL[cls]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-text-muted">Synthetic seed · Sprint 1</p>

      {offlineMode && (
        <div className="mt-2 rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] text-yellow-400">
          ⚡ Offline — showing cached data
        </div>
      )}
    </div>
  );
}
