"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Layer = {
  id: string;
  label: string;
  color: string;
  description: string;
  stats: string;
  dots: { x: number; y: number; r: number }[];
};

const LAYERS: Layer[] = [
  {
    id: "military_action",
    label: "Military Actions",
    color: "#ef4444",
    description: "Real-time tracking of strikes, troop movements, and frontline changes across all active zones.",
    stats: "847 events in last 24h",
    dots: [
      { x: 30, y: 40, r: 6 }, { x: 55, y: 30, r: 4 }, { x: 70, y: 55, r: 8 },
      { x: 45, y: 60, r: 5 }, { x: 20, y: 65, r: 3 }, { x: 80, y: 35, r: 6 },
      { x: 35, y: 20, r: 4 }, { x: 62, y: 70, r: 7 }, { x: 15, y: 45, r: 5 },
    ],
  },
  {
    id: "civilian_alert",
    label: "Civilian Alerts",
    color: "#4ea1ff",
    description: "Air raid warnings, evacuation orders, and shelter-in-place notifications fused from official channels.",
    stats: "312 alerts in last 6h",
    dots: [
      { x: 25, y: 35, r: 9 }, { x: 60, y: 25, r: 7 }, { x: 75, y: 60, r: 8 },
      { x: 40, y: 70, r: 6 }, { x: 50, y: 45, r: 10 }, { x: 85, y: 30, r: 5 },
      { x: 10, y: 55, r: 7 },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    color: "#f59e0b",
    description: "Power grid outages, rail disruptions, bridge damage and utility failures with geolocation.",
    stats: "124 incidents tracked",
    dots: [
      { x: 38, y: 42, r: 5 }, { x: 65, y: 28, r: 6 }, { x: 52, y: 65, r: 4 },
      { x: 22, y: 58, r: 7 }, { x: 78, y: 50, r: 5 }, { x: 45, y: 20, r: 6 },
      { x: 88, y: 65, r: 4 }, { x: 12, y: 30, r: 5 },
    ],
  },
  {
    id: "cyber",
    label: "Cyber Operations",
    color: "#a855f7",
    description: "DDoS campaigns, intrusion attempts, and disinformation operations attributed and classified by target sector.",
    stats: "58 ops this week",
    dots: [
      { x: 50, y: 50, r: 12 }, { x: 30, y: 30, r: 6 }, { x: 70, y: 30, r: 6 },
      { x: 30, y: 70, r: 6 }, { x: 70, y: 70, r: 6 }, { x: 20, y: 50, r: 4 },
      { x: 80, y: 50, r: 4 },
    ],
  },
  {
    id: "maritime",
    label: "Maritime",
    color: "#06b6d4",
    description: "Black Sea vessel movements, port activity, and naval incidents with AIS correlation.",
    stats: "89 vessels monitored",
    dots: [
      { x: 45, y: 75, r: 5 }, { x: 35, y: 80, r: 4 }, { x: 55, y: 82, r: 6 },
      { x: 65, y: 78, r: 4 }, { x: 25, y: 72, r: 5 }, { x: 75, y: 70, r: 5 },
      { x: 50, y: 88, r: 3 }, { x: 40, y: 68, r: 4 },
    ],
  },
];

function MapPreview({ layer, visible }: { layer: Layer; visible: boolean }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      aria-hidden={!visible}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {/* Grid */}
        {[20, 40, 60, 80].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
          </g>
        ))}
        {/* Coastline-ish shapes */}
        <path
          d="M0,55 Q15,52 25,58 Q35,64 45,60 Q55,56 65,62 Q75,68 85,64 Q95,60 100,62 L100,100 L0,100 Z"
          fill="rgba(6,182,212,0.06)"
        />
        {/* Event dots */}
        {layer.dots.map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r={dot.r * 2}
              fill={layer.color}
              opacity="0.08"
            />
            <circle
              cx={dot.x}
              cy={dot.y}
              r={dot.r * 0.7}
              fill={layer.color}
              opacity="0.9"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function LayerCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % LAYERS.length);
    }, 3200);
    return () => clearInterval(id);
  }, [paused]);

  const layer = LAYERS[active]!;

  return (
    <section className="border-t border-border-subtle">
      <div className="mx-auto max-w-5xl px-4 py-20">
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-accent">
          Live Intelligence Layers
        </p>
        <h2 className="mt-3 text-center text-3xl font-semibold text-text-primary">
          Every dimension of the conflict, in one view
        </h2>

        <div
          className="mt-10 grid gap-6 md:grid-cols-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Map preview */}
          <div className="relative overflow-hidden rounded border border-border-subtle bg-bg-elevated" style={{ minHeight: 280 }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(6,182,212,0.06),_transparent_60%)]" />
            {LAYERS.map((l, i) => (
              <MapPreview key={l.id} layer={l} visible={i === active} />
            ))}
            {/* Corner label */}
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full animate-pulse"
                style={{ background: layer.color }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {layer.label}
              </span>
            </div>
            {/* Stats badge */}
            <div className="absolute bottom-3 right-3 rounded border border-border-subtle bg-bg-base/80 px-2 py-1 font-mono text-[10px] text-text-muted backdrop-blur">
              {layer.stats}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col justify-center">
            {/* Tab selector */}
            <div className="flex flex-wrap gap-2">
              {LAYERS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => { setActive(i); setPaused(true); }}
                  className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors ${
                    i === active
                      ? "border-transparent bg-bg-elevated text-text-primary"
                      : "border-border-subtle text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: l.color, opacity: i === active ? 1 : 0.5 }}
                  />
                  {l.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-text-primary">{layer.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{layer.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: layer.color }}
                />
                <span className="font-mono text-xs text-text-muted">{layer.stats}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 flex gap-1.5">
              {LAYERS.map((_, i) => (
                <div key={i} className="relative h-0.5 flex-1 overflow-hidden rounded bg-border-subtle">
                  {i === active && !paused && (
                    <div
                      className="absolute inset-y-0 left-0 rounded"
                      style={{
                        background: layer.color,
                        animation: "layer-progress 3.2s linear forwards",
                      }}
                    />
                  )}
                  {i < active && (
                    <div className="absolute inset-0 rounded" style={{ background: layer.color, opacity: 0.4 }} />
                  )}
                </div>
              ))}
            </div>

            <Link
              href="/map"
              className="mt-8 inline-flex items-center gap-2 self-start rounded bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover"
            >
              Explore Live Map
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes layer-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
