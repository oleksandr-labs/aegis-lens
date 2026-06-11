"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { urls } from "@aegis/url-builder";
import type { Locale } from "@aegis/i18n-config";
import type { AegisEvent } from "@aegis/types";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = "vertical" | "calendar";
type TimeRange = "24h" | "7d" | "30d" | "all";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLASS_LABEL = Object.fromEntries(
  ALL_CLASSES.map((c) => [c.id, c.label]),
) as Record<string, string>;

const TIME_RANGE_MS: Record<TimeRange, number | null> = {
  "24h": 24 * 3600 * 1000,
  "7d": 7 * 24 * 3600 * 1000,
  "30d": 30 * 24 * 3600 * 1000,
  all: null,
};

const SPEED_OPTIONS = [1, 2, 5] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function timeAgoShort(when: string): string {
  const diffMs = Date.now() - Date.parse(when);
  const h = Math.floor(diffMs / 3600000);
  if (h < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatHHMM(when: string): string {
  const d = new Date(when);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}

function dangerTone(score: number): string {
  if (score >= 90) return "border-red-500/50 bg-red-500/10 text-red-300";
  if (score >= 80) return "border-orange-500/50 bg-orange-500/10 text-orange-300";
  if (score >= 70) return "border-yellow-500/50 bg-yellow-500/10 text-yellow-200";
  return "border-border-subtle bg-bg-elevated text-text-muted";
}

/** Returns the ISO date string for Monday of the week containing `date`. */
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatsBar({ events }: { events: AegisEvent[] }) {
  if (events.length === 0) return null;

  const total = events.length;
  const avgDanger = Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / total);
  const sev3Plus = events.filter((e) => e.severity >= 3).length;
  const verifiedPct = Math.round(
    (events.filter((e) =>
      e.verificationState === "corroborated" || e.verificationState === "verified",
    ).length /
      total) *
      100,
  );

  const stats = [
    { value: String(total), label: "Total events" },
    { value: String(avgDanger), label: "Avg danger" },
    { value: String(sev3Plus), label: "Severity ≥3" },
    { value: `${verifiedPct}%`, label: "Verified" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-px overflow-hidden rounded border border-border-subtle bg-border-subtle">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex flex-1 flex-col items-center bg-bg-surface px-4 py-3 text-center"
        >
          <div className="font-mono text-xl text-text-primary">{s.value}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClassFilterSidebar({
  events,
  selectedClasses,
  onToggleClass,
  timeRange,
  onTimeRange,
}: {
  events: AegisEvent[];
  selectedClasses: Set<string>;
  onToggleClass: (id: string) => void;
  timeRange: TimeRange;
  onTimeRange: (r: TimeRange) => void;
}) {
  const countByClass = Object.fromEntries(
    ALL_CLASSES.map((c) => [c.id, events.filter((e) => e.class === c.id).length]),
  );

  const timeRanges: TimeRange[] = ["24h", "7d", "30d", "all"];

  return (
    <aside className="w-[220px] shrink-0 space-y-6">
      {/* Time range */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Time range
        </p>
        <div className="flex flex-wrap gap-1.5">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRange(r)}
              className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                timeRange === r
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-border-default hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Class filter */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Event class
        </p>
        <ul className="space-y-1">
          {ALL_CLASSES.map((c) => {
            const checked = selectedClasses.has(c.id);
            const count = countByClass[c.id] ?? 0;
            return (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-bg-elevated">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleClass(c.id)}
                    className="hidden"
                  />
                  {/* Custom checkbox dot */}
                  <span
                    className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                      checked ? "border-transparent" : "border-border-subtle bg-bg-surface"
                    }`}
                    style={checked ? { background: CLASS_COLOR[c.id] } : undefined}
                  >
                    {checked && (
                      <svg viewBox="0 0 8 8" className="h-2 w-2 fill-white">
                        <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: CLASS_COLOR[c.id] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-text-secondary">
                    {c.label}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-text-muted">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function PlayControls({
  playing,
  onPlay,
  onPause,
  onStart,
  onEnd,
  speed,
  onSpeed,
  currentIdx,
  total,
}: {
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStart: () => void;
  onEnd: () => void;
  speed: Speed;
  onSpeed: (s: Speed) => void;
  currentIdx: number;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-3">
      {/* Rewind / play-pause / fast-forward */}
      <div className="flex items-center gap-1">
        <button
          onClick={onStart}
          title="Go to first"
          className="rounded border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-xs text-text-muted hover:text-text-primary"
        >
          ⏮
        </button>
        {playing ? (
          <button
            onClick={onPause}
            className="rounded border border-accent bg-accent/20 px-3 py-1 font-mono text-xs text-accent"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="rounded border border-border-subtle bg-bg-elevated px-3 py-1 font-mono text-xs text-text-muted hover:border-accent hover:text-accent"
          >
            ▶ Play
          </button>
        )}
        <button
          onClick={onEnd}
          title="Go to last"
          className="rounded border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-xs text-text-muted hover:text-text-primary"
        >
          ⏭
        </button>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-text-muted">Speed:</span>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
              speed === s
                ? "border-accent bg-accent/20 text-accent"
                : "border-border-subtle bg-bg-elevated text-text-muted hover:text-text-primary"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Status */}
      <span className="font-mono text-[10px] text-text-muted">
        {playing ? "Playing" : "Paused"} event{" "}
        <span className="text-text-primary">{currentIdx + 1}</span> of{" "}
        <span className="text-text-primary">{total}</span>
      </span>
    </div>
  );
}

function VerticalTimeline({
  events,
  currentIdx,
  locale,
}: {
  events: AegisEvent[];
  currentIdx: number;
  locale: Locale;
}) {
  const activeRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentIdx]);

  if (events.length === 0) {
    return (
      <div className="rounded border border-dashed border-border-subtle bg-bg-surface p-10 text-center">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          No events
        </div>
        <div className="mt-2 text-sm text-text-primary">
          Try adjusting your filters or time range.
        </div>
      </div>
    );
  }

  return (
    <ol className="relative ml-4 border-l border-border-subtle">
      {events.map((ev, i) => {
        const isActive = currentIdx === i;
        return (
          <li
            key={ev.eventId}
            ref={isActive ? activeRef : null}
            className="mb-6 ml-6 last:mb-0"
          >
            {/* Timeline dot */}
            <span
              aria-hidden="true"
              className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border-subtle transition-colors"
              style={{ background: CLASS_COLOR[ev.class] }}
            >
              <span className="h-2 w-2 rounded-full bg-white/80" />
            </span>

            {/* Card */}
            <div
              className={`rounded border bg-bg-surface p-4 transition-colors ${
                isActive
                  ? "border-accent shadow-[0_0_0_1px_theme(colors.accent/0.3)]"
                  : "border-border-subtle hover:bg-bg-elevated"
              }`}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                <span className="text-text-primary">{timeAgoShort(ev.occurredAt)}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-primary">{formatHHMM(ev.occurredAt)}</span>
                <span
                  className="inline-flex items-center gap-1 rounded border border-border-subtle px-1.5 py-0.5"
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: CLASS_COLOR[ev.class] }}
                  />
                  {CLASS_LABEL[ev.class]}
                  {ev.subclass ? ` · ${ev.subclass}` : ""}
                </span>
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 ${dangerTone(ev.dangerScore)}`}
                >
                  danger {ev.dangerScore}
                </span>
              </div>

              {/* Summary */}
              <div className="mt-2 text-sm text-text-primary">
                {ev.summary[locale] ?? ev.summary.en}
              </div>

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-text-muted">
                <span>Severity {ev.severity}/5</span>
                <span>·</span>
                <span>Confidence {Math.round(ev.confidence * 100)}%</span>
                <span>·</span>
                <span className="capitalize">{ev.verificationState}</span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={urls.event(locale, ev.eventId)}
                  className="rounded border border-border-subtle bg-bg-elevated px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted hover:border-border-default hover:text-text-primary"
                >
                  View event
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // "Add to case" placeholder — wire to case builder when ready
                  }}
                  className="rounded border border-border-subtle bg-bg-elevated px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted hover:border-border-default hover:text-text-primary"
                >
                  Add to case
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CalendarView({
  events,
  locale,
}: {
  events: AegisEvent[];
  locale: Locale;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const monday = getMondayOf(today);

  // Build 7 day cells: Mon … Sun
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return isoDate(d);
  });

  // Group events by day
  const byDay = new Map<string, AegisEvent[]>();
  for (const ev of events) {
    const key = isoDate(new Date(ev.occurredAt));
    const arr = byDay.get(key) ?? [];
    arr.push(ev);
    byDay.set(key, arr);
  }

  const todayIso = isoDate(today);

  return (
    <div className="space-y-4">
      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((iso, i) => {
          const dayEvents = byDay.get(iso) ?? [];
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          const dots = dayEvents.slice(0, 5);
          const extra = dayEvents.length > 5 ? dayEvents.length - 5 : 0;
          const dayNum = iso.slice(8); // DD

          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso === selectedDate ? null : iso)}
              className={`rounded border p-2 text-left transition-colors ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : isToday
                    ? "border-border-default bg-bg-elevated"
                    : "border-border-subtle bg-bg-surface hover:bg-bg-elevated"
              }`}
            >
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {WEEKDAYS[i]}
                </span>
                <span
                  className={`font-mono text-xs ${isToday ? "text-accent" : "text-text-primary"}`}
                >
                  {dayNum}
                </span>
              </div>

              {dayEvents.length === 0 ? (
                <span className="font-mono text-[10px] text-text-muted/40">—</span>
              ) : (
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-0.5">
                    {dots.map((ev) => (
                      <span
                        key={ev.eventId}
                        title={CLASS_LABEL[ev.class]}
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: CLASS_COLOR[ev.class] }}
                      />
                    ))}
                  </div>
                  <div className="font-mono text-[10px] text-text-muted">
                    {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                    {extra > 0 && (
                      <span className="ml-1 text-text-muted/60">+{extra}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day mini-list */}
      {selectedDate !== null && (
        <div className="rounded border border-border-subtle bg-bg-surface p-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {selectedDate} · {byDay.get(selectedDate)?.length ?? 0} event
            {(byDay.get(selectedDate)?.length ?? 0) !== 1 ? "s" : ""}
          </div>
          {(byDay.get(selectedDate) ?? []).length === 0 ? (
            <p className="text-sm text-text-muted">No events recorded this day.</p>
          ) : (
            <ul className="space-y-2">
              {(byDay.get(selectedDate) ?? []).map((ev) => (
                <li key={ev.eventId}>
                  <Link
                    href={urls.event(locale, ev.eventId)}
                    className="flex items-start gap-3 rounded border border-border-subtle bg-bg-elevated p-3 hover:bg-bg-elevated/80"
                  >
                    <span
                      className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: CLASS_COLOR[ev.class] }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-muted">
                        <span>{formatHHMM(ev.occurredAt)}</span>
                        <span>{CLASS_LABEL[ev.class]}</span>
                        <span>danger {ev.dangerScore}</span>
                      </div>
                      <div className="mt-1 truncate text-sm text-text-primary">
                        {ev.summary[locale] ?? ev.summary.en}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Context: events outside current week */}
      {(() => {
        const weekSet = new Set(week);
        const outsideCount = events.filter(
          (ev) => !weekSet.has(isoDate(new Date(ev.occurredAt))),
        ).length;
        return outsideCount > 0 ? (
          <p className="font-mono text-[10px] text-text-muted">
            {outsideCount} event{outsideCount !== 1 ? "s" : ""} outside this week (adjust time
            range to see more)
          </p>
        ) : null;
      })()}
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function TimelineClient({
  allEvents,
  locale,
}: {
  allEvents: AegisEvent[];
  locale: Locale;
}) {
  // ── State ──
  const [view, setView] = useState<ViewMode>("vertical");
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);

  // ── Filtered events ──
  const filtered = (() => {
    let evs = allEvents;

    // Time filter
    const ms = TIME_RANGE_MS[timeRange];
    if (ms !== null) {
      const cutoff = Date.now() - ms;
      evs = evs.filter((e) => Date.parse(e.occurredAt) >= cutoff);
    }

    // Class filter
    if (selectedClasses.size > 0) {
      evs = evs.filter((e) => selectedClasses.has(e.class));
    }

    // Sorted newest first for vertical; calendar uses all
    return evs.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  })();

  // ── Playback interval ──
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing || filtered.length === 0) {
      stopInterval();
      return;
    }
    const ms = Math.round(2000 / speed);
    intervalRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= filtered.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return stopInterval;
  }, [playing, speed, filtered.length, stopInterval]);

  // Clamp currentIdx when filtered list shrinks
  useEffect(() => {
    if (currentIdx >= filtered.length && filtered.length > 0) {
      setCurrentIdx(filtered.length - 1);
    }
  }, [filtered.length, currentIdx]);

  // ── Handlers ──
  const toggleClass = useCallback((id: string) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePlay = () => {
    if (currentIdx >= filtered.length - 1) setCurrentIdx(0);
    setPlaying(true);
  };
  const handlePause = () => setPlaying(false);
  const handleStart = () => {
    setPlaying(false);
    setCurrentIdx(0);
  };
  const handleEnd = () => {
    setPlaying(false);
    setCurrentIdx(Math.max(0, filtered.length - 1));
  };

  // ── Render ──
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Stats bar */}
      <div className="mb-6">
        <StatsBar events={filtered} />
      </div>

      {/* View toggle + play controls */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        {/* Play controls — only in vertical mode */}
        <div className="flex-1">
          {view === "vertical" && filtered.length > 0 && (
            <PlayControls
              playing={playing}
              onPlay={handlePlay}
              onPause={handlePause}
              onStart={handleStart}
              onEnd={handleEnd}
              speed={speed}
              onSpeed={setSpeed}
              currentIdx={Math.min(currentIdx, filtered.length - 1)}
              total={filtered.length}
            />
          )}
        </div>

        {/* View mode tabs */}
        <div className="flex shrink-0 items-center gap-1 rounded border border-border-subtle bg-bg-surface p-1">
          {(["vertical", "calendar"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                setPlaying(false);
              }}
              className={`rounded px-3 py-1.5 font-mono text-[11px] capitalize tracking-wider transition-colors ${
                view === v
                  ? "bg-accent text-bg-base"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Body: sidebar + main content */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <ClassFilterSidebar
          events={allEvents}
          selectedClasses={selectedClasses}
          onToggleClass={toggleClass}
          timeRange={timeRange}
          onTimeRange={setTimeRange}
        />

        {/* Main */}
        <div className="min-w-0 flex-1">
          {view === "vertical" ? (
            <VerticalTimeline
              events={filtered}
              currentIdx={Math.min(currentIdx, Math.max(0, filtered.length - 1))}
              locale={locale}
            />
          ) : (
            <CalendarView events={filtered} locale={locale} />
          )}
        </div>
      </div>
    </section>
  );
}
