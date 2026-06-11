"use client";

import { useEffect, useRef, useState } from "react";
import { useFilters } from "@/lib/use-filters";

const SPEEDS = [0.5, 1, 2, 5] as const;
type Speed = (typeof SPEEDS)[number];

function windowStartLabel(hours: number | null): string {
  if (!hours) return "All time";
  const d = new Date(Date.now() - hours * 60 * 60 * 1000);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function MapTimelineBar() {
  const f = useFilters();
  const [scrubPos, setScrubPos] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [live, setLive] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const totalHours = f.hours ?? 720;
  const totalSeconds = totalHours * 3600;

  // Playback tick
  useEffect(() => {
    if (!playing) return;
    const stepPct = (1 / totalSeconds) * 100 * speed;
    const id = setInterval(() => {
      setScrubPos((prev) => {
        if (prev >= 100) {
          setPlaying(false);
          return 100;
        }
        return Math.min(100, prev + stepPct);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, speed, totalSeconds]);

  // Close export dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  function handleExport(format: "csv" | "geojson" | "png") {
    setExportOpen(false);
    // Placeholder: wire up real export handlers when data layer is ready
    console.info(`[MapTimelineBar] export requested: ${format}`);
  }

  const startLabel = windowStartLabel(f.hours);

  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-t border-border-subtle bg-bg-elevated px-3 text-xs">
      {/* TIMELINE label */}
      <span className="font-mono text-[10px] uppercase text-text-muted">Timeline</span>

      {/* Window start */}
      <span className="font-mono text-[10px] text-text-muted whitespace-nowrap">{startLabel}</span>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={100}
        value={scrubPos}
        onChange={(e) => {
          setPlaying(false);
          setScrubPos(Number(e.target.value));
        }}
        className="w-64 accent-accent"
        aria-label="Timeline scrubber"
      />

      {/* NOW label */}
      <span className="font-mono text-[10px] text-text-muted">NOW</span>

      {/* Playback controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => { setPlaying(false); setScrubPos(0); }}
          className="rounded px-1.5 py-0.5 text-text-muted hover:bg-bg-surface hover:text-text-primary"
          title="Rewind"
          aria-label="Rewind to start"
        >
          ⏮
        </button>

        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded px-1.5 py-0.5 text-text-muted hover:bg-bg-surface hover:text-text-primary"
          title={playing ? "Pause" : "Play"}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>

        <button
          onClick={() => { setPlaying(false); setScrubPos(100); }}
          className="rounded px-1.5 py-0.5 text-text-muted hover:bg-bg-surface hover:text-text-primary"
          title="Jump to now"
          aria-label="Jump to now"
        >
          ⏭
        </button>
      </div>

      {/* Speed selector */}
      <select
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value) as Speed)}
        className="rounded border border-border-subtle bg-bg-surface px-1 py-0.5 font-mono text-[10px] text-text-muted focus:outline-none"
        aria-label="Playback speed"
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {s}×
          </option>
        ))}
      </select>

      {/* Spacer */}
      <div className="flex-1" />

      {/* LIVE toggle */}
      <button
        onClick={() => setLive((l) => !l)}
        className={`flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] transition-colors ${
          live
            ? "bg-bg-surface text-green-400"
            : "text-text-muted hover:bg-bg-surface"
        }`}
        aria-pressed={live}
        title="Toggle live feed"
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${live ? "bg-green-400" : "bg-text-muted"}`}
        />
        LIVE
      </button>

      {/* Vertical separator */}
      <span className="h-5 w-px bg-border-subtle" aria-hidden="true" />

      {/* Export menu */}
      <div className="relative" ref={exportRef}>
        <button
          onClick={() => setExportOpen((o) => !o)}
          className="flex items-center gap-1 rounded px-2 py-1 text-text-muted hover:bg-bg-surface hover:text-text-primary"
          aria-haspopup="true"
          aria-expanded={exportOpen}
          title="Export data"
        >
          ⬇ Export
        </button>

        {exportOpen && (
          <div className="absolute bottom-full right-0 mb-1 min-w-[120px] rounded border border-border-subtle bg-bg-elevated shadow-lg">
            {(["csv", "geojson", "png"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                className="block w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-bg-surface"
              >
                {fmt === "csv" ? "CSV" : fmt === "geojson" ? "GeoJSON" : "PNG snapshot"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
