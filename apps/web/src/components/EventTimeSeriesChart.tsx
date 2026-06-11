"use client";

import { CLASS_COLOR } from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";

type Props = {
  events: { occurredAt: string; class: string }[];
  days?: number; // default 30
  className?: string;
};

const BAR_WIDTH = 8;
const GAP = 2;
const CHART_HEIGHT = 80;
const LABEL_HEIGHT = 16;
const SVG_HEIGHT = CHART_HEIGHT + LABEL_HEIGHT;

/**
 * SVG bar chart — events per day, last N days.
 * Server-renderable (pure computation + SVG), but marked "use client" so it
 * can be dropped into any client subtree without friction.
 *
 * Bar color = most common event class in that day.
 * Tooltip  = native <title> element on each rect.
 */
export function EventTimeSeriesChart({ events, days = 30, className }: Props) {
  const now = Date.now();
  const MS_PER_DAY = 86_400_000;

  // Build per-day buckets: dailyClasses[i] = list of class strings for day i
  // Day 0 = oldest, day (days-1) = today
  const dailyClasses: string[][] = Array.from({ length: days }, () => []);

  for (const ev of events) {
    const t = Date.parse(ev.occurredAt);
    if (isNaN(t)) continue;
    const daysAgo = Math.floor((now - t) / MS_PER_DAY);
    if (daysAgo < 0 || daysAgo >= days) continue;
    const idx = days - 1 - daysAgo; // most recent = last bucket
    dailyClasses[idx]!.push(ev.class);
  }

  const dailyCounts = dailyClasses.map((cls) => cls.length);
  const max = Math.max(1, ...dailyCounts);

  // Dominant color per day
  function dominantColor(classes: string[]): string {
    if (classes.length === 0) return "#222936";
    const freq: Record<string, number> = {};
    for (const c of classes) freq[c] = (freq[c] ?? 0) + 1;
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]![0] as EventClass;
    return CLASS_COLOR[top] ?? "#4ea1ff";
  }
  const dayColors = dailyClasses.map(dominantColor);

  // X-axis date labels: every 7th day (from the left)
  const dayLabels: { i: number; label: string }[] = [];
  for (let i = 0; i < days; i += 7) {
    const d = new Date(now - (days - 1 - i) * MS_PER_DAY);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    dayLabels.push({ i, label });
  }

  const totalWidth = days * (BAR_WIDTH + GAP);

  return (
    <figure
      className={`w-full overflow-hidden rounded border border-border-subtle bg-bg-surface p-4 ${className ?? ""}`}
      aria-label={`Events per day, last ${days} days`}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <figcaption className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Events per day · last {days}d
        </figcaption>
        <div className="font-mono text-[10px] text-text-muted">
          peak&nbsp;{max}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${totalWidth} ${SVG_HEIGHT}`}
        className="w-full"
        style={{ height: SVG_HEIGHT }}
        role="img"
        aria-label="Time-series bar chart"
      >
        {/* Max count label at top-left */}
        <text
          x={0}
          y={10}
          fontSize="9"
          fill="#6b7585"
          fontFamily="monospace"
        >
          {max}
        </text>

        {/* Bars */}
        {dailyCounts.map((count, i) => {
          const h = count > 0 ? Math.max(2, (count / max) * (CHART_HEIGHT - 12)) : 0;
          const x = i * (BAR_WIDTH + GAP);
          const y = CHART_HEIGHT - h;
          const dateStr = new Date(now - (days - 1 - i) * MS_PER_DAY).toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short", year: "numeric" },
          );
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={h > 0 ? h : 2}
              fill={count > 0 ? dayColors[i] : "#222936"}
              opacity={count > 0 ? 0.8 : 0.2}
              rx={1}
            >
              <title>{`${dateStr}: ${count} event${count === 1 ? "" : "s"}`}</title>
            </rect>
          );
        })}

        {/* Baseline */}
        <line
          x1={0}
          x2={totalWidth}
          y1={CHART_HEIGHT}
          y2={CHART_HEIGHT}
          stroke="#222936"
          strokeWidth={1}
        />

        {/* X-axis date labels */}
        {dayLabels.map(({ i, label }) => {
          const x = i * (BAR_WIDTH + GAP) + BAR_WIDTH / 2;
          return (
            <text
              key={i}
              x={x}
              y={SVG_HEIGHT - 2}
              fontSize="9"
              fill="#6b7585"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
