import type { AegisEvent } from "@aegis/types";

/**
 * Server-rendered SVG sparkline of events-per-hour over the last `hours` bucket.
 * No client JS — pure SVG.
 *
 * Bars represent event count per hour. Color reflects max-bucket intensity.
 */
export function EventsPerHourSparkline({
  events,
  hours = 24,
  width = 720,
  height = 80,
  color = "#4ea1ff",
}: {
  events: AegisEvent[];
  hours?: number;
  width?: number;
  height?: number;
  color?: string;
}) {
  const now = Date.now();
  const start = now - hours * 3600 * 1000;
  const buckets = new Array(hours).fill(0) as number[];
  for (const e of events) {
    const t = Date.parse(e.occurredAt);
    if (t < start || t > now) continue;
    const idx = Math.min(hours - 1, Math.floor((t - start) / (3600 * 1000)));
    buckets[idx] += 1;
  }

  const max = Math.max(1, ...buckets);
  const barW = width / hours;
  const padBottom = 18;
  const chartH = height - padBottom;

  return (
    <figure
      className="w-full overflow-hidden rounded border border-border-subtle bg-bg-surface p-4"
      aria-label={`Events per hour, last ${hours}h`}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <figcaption className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Events per hour · last {hours}h
        </figcaption>
        <div className="font-mono text-[10px] text-text-muted">peak {max}</div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="sparkline"
      >
        {buckets.map((v, i) => {
          const h = (v / max) * chartH;
          const x = i * barW;
          const y = chartH - h;
          return (
            <rect
              key={i}
              x={x + 1}
              y={y}
              width={Math.max(1, barW - 2)}
              height={h}
              fill={color}
              opacity={v === 0 ? 0.12 : 0.85}
              rx={1}
            />
          );
        })}
        {/* Baseline */}
        <line x1="0" x2={width} y1={chartH} y2={chartH} stroke="#222936" strokeWidth="1" />
        {/* Hour ticks every 6h */}
        {[0, 6, 12, 18, 24]
          .filter((t) => t <= hours)
          .map((t) => {
            const x = (t / hours) * width;
            const labelText =
              t === 0 ? `-${hours}h` : t === hours ? "now" : `-${hours - t}h`;
            return (
              <text
                key={t}
                x={x}
                y={height - 4}
                fontSize="10"
                fill="#6b7585"
                textAnchor={t === 0 ? "start" : t === hours ? "end" : "middle"}
                fontFamily="monospace"
              >
                {labelText}
              </text>
            );
          })}
      </svg>
    </figure>
  );
}
