"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import type { AegisEvent, EventClass } from "@aegis/types";
import { urls } from "@aegis/url-builder";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { createMarkerElement, createClusterElement, getMarkerSize } from "@/lib/map-markers";
import { useFilters, buildEventsQuery } from "@/lib/use-filters";
import { COUNTRY_VIEW } from "@/lib/events-seed";
import { usePinnedEvents } from "@/lib/hooks/use-pinned-events";
import { FilterBar } from "./FilterBar";
import { AoiPopup } from "./AoiPopup";
import { HeatmapLayer } from "./HeatmapLayer";
import { MapLegend } from "./MapLegend";
import { useHeatmap } from "@/lib/heatmap-store";
import { VerificationExplainer } from "@/components/VerificationExplainer";

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  EventClass,
  string
>;

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      paint: {
        "raster-saturation": -0.6,
        "raster-brightness-min": 0.05,
        "raster-brightness-max": 0.55,
        "raster-contrast": 0.05,
      },
    },
  ],
};

export function AegisMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [events, setEvents] = useState<AegisEvent[]>([]);
  const [selected, setSelected] = useState<AegisEvent | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const [offlineMode, setOfflineMode] = useState(false);
  const lastHeartbeat = useRef<string | null>(null);
  const filters = useFilters();
  const heatmapVisible = useHeatmap();
  const initialView = COUNTRY_VIEW[filters.country] ?? COUNTRY_VIEW.ua;
  const CACHE_KEY = `aegis_events_cache_${filters.country}`;

  // Listen for the custom event dispatched by MapTopBar's LIVE button.
  useEffect(() => {
    const handler = () => setLiveMode((prev) => !prev);
    window.addEventListener("aegis:toggle-live-mode", handler);
    return () => window.removeEventListener("aegis:toggle-live-mode", handler);
  }, []);

  // SSE connection lifecycle — active only when liveMode is on.
  useEffect(() => {
    if (!liveMode) return;

    const es = new EventSource(
      `/api/events/stream?country=${encodeURIComponent(filters.country)}`,
    );

    es.addEventListener("snapshot", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as {
          events?: AegisEvent[];
        };
        setEvents(data.events ?? []);
      } catch { /* malformed — ignore */ }
    });

    es.addEventListener("event", (e) => {
      try {
        const newEv = JSON.parse((e as MessageEvent).data) as AegisEvent;
        setEvents((prev) => [newEv, ...prev.slice(0, 99)]);
        // Pulse animation: add id, remove after 3 s
        setNewEventIds((prev) => new Set([...prev, newEv.eventId]));
        setTimeout(() => {
          setNewEventIds((prev) => {
            const next = new Set(prev);
            next.delete(newEv.eventId);
            return next;
          });
        }, 3000);
      } catch { /* malformed — ignore */ }
    });

    es.addEventListener("heartbeat", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as { ts?: string };
        lastHeartbeat.current = data.ts ?? new Date().toISOString();
      } catch { /* malformed — ignore */ }
    });

    es.onerror = () => setLiveMode(false);

    return () => es.close();
  }, [liveMode, filters.country]);

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: initialView.center,
      zoom: initialView.zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to country on country change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const view = COUNTRY_VIEW[filters.country];
    if (!view) return;
    map.flyTo({ center: view.center, zoom: view.zoom, essential: true });
  }, [filters.country]);

  // Fetch events whenever filters change (polling mode — skipped when live mode is active).
  useEffect(() => {
    if (liveMode) return; // SSE snapshot already populates events
    let cancelled = false;
    const qs = buildEventsQuery({
      country: filters.country,
      hours: filters.hours,
      classes: filters.classes,
      minSeverity: filters.minSeverity,
      minConfidence: filters.minConfidence,
      verification: filters.verification,
    });
    fetch(`/api/events?${qs}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) {
          setEvents(j.data ?? []);
          setOfflineMode(false);
        }
      })
      .catch(() => {
        // Network failure — try localStorage cache
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as {
            events: AegisEvent[];
            cachedAt: string;
          } | null;
          if (cached?.events && !cancelled) {
            setEvents(cached.events);
            setOfflineMode(true);
          }
        } catch { /* corrupt cache — ignore */ }
      });
    return () => {
      cancelled = true;
    };
  }, [
    liveMode,
    filters.country,
    filters.hours,
    filters.classes,
    filters.minSeverity,
    filters.minConfidence,
    filters.verification,
    CACHE_KEY,
  ]);

  // Persist successful event fetches to localStorage for offline fallback.
  useEffect(() => {
    if (events.length === 0) return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ events, cachedAt: new Date().toISOString() }),
      );
    } catch { /* quota exceeded — ignore */ }
  }, [events, CACHE_KEY]);

  // Build supercluster index whenever events change.
  type EventProps = { eventId: string; cls: EventClass };
  const cluster = useMemo(() => {
    const sc = new Supercluster<EventProps, { count: number }>({
      radius: 60,
      maxZoom: 14,
    });
    sc.load(
      events.map((ev) => ({
        type: "Feature" as const,
        properties: { eventId: ev.eventId, cls: ev.class },
        geometry: {
          type: "Point" as const,
          coordinates: [ev.location.lon, ev.location.lat] as [number, number],
        },
      })),
    );
    return sc;
  }, [events]);

  // Render clusters + single markers; re-render on zoom/move.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const eventById = new Map(events.map((e) => [e.eventId, e] as const));

    const render = () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];

      const b = map.getBounds();
      const bbox: [number, number, number, number] = [
        b.getWest(),
        b.getSouth(),
        b.getEast(),
        b.getNorth(),
      ];
      const zoom = Math.floor(map.getZoom());
      const clusters = cluster.getClusters(bbox, zoom);

      for (const c of clusters) {
        const [lon, lat] = c.geometry.coordinates as [number, number];
        const props = c.properties as Supercluster.ClusterProperties &
          Partial<EventProps & { count: number }>;

        if (props.cluster) {
          const size = 18 + Math.min(24, Math.log2(props.point_count) * 4);
          const el = createClusterElement(props.point_count ?? 0, size, "#4ea1ff");
          el.addEventListener("click", () => {
            const expansion = cluster.getClusterExpansionZoom(c.id as number);
            map.flyTo({ center: [lon, lat], zoom: expansion });
          });
          markersRef.current.push(
            new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map),
          );
        } else {
          const ev = eventById.get(props.eventId!);
          if (!ev) continue;
          const color = CLASS_COLOR[ev.class];
          const isNew = newEventIds.has(ev.eventId);
          const el = createMarkerElement(ev.class, color, getMarkerSize(ev.dangerScore), isNew);
          el.setAttribute(
            "aria-label",
            `${CLASS_LABEL[ev.class]} event: ${ev.summary?.en ?? ev.eventId}`,
          );
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelected(ev);
          });
          markersRef.current.push(
            new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map),
          );
        }
      }
    };

    render();
    map.on("moveend", render);
    map.on("zoomend", render);
    return () => {
      map.off("moveend", render);
      map.off("zoomend", render);
    };
  }, [events, cluster, newEventIds]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <HeatmapLayer events={events} visible={heatmapVisible} mapRef={mapRef} />
      <FilterBar />
      <MapLegend events={events} offlineMode={offlineMode} />
      <AoiPopup />
      {selected && <EventInspector event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function EventInspector({ event, onClose }: { event: AegisEvent; onClose: () => void }) {
  const color = CLASS_COLOR[event.class];

  const [explainerOpen, setExplainerOpen] = useState(false);

  // Share
  const [copied, setCopied] = useState(false);
  function handleShare() {
    const url = window.location.origin + urls.event("en", event.eventId);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Pin — persisted to localStorage via UserStore
  const { isPinned, toggle: togglePin } = usePinnedEvents();
  const pinned = isPinned(event.eventId);

  // AI Summary
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  function handleGetSummary() {
    if (summary !== null) {
      setSummaryExpanded(true);
      return;
    }
    setSummaryExpanded(true);
    setSummaryLoading(true);
    fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Briefly explain this event in 2 sentences: " + event.summary.en,
        country: "ua",
        hours: 24,
      }),
    })
      .then((r) => r.json())
      .then((j) => setSummary(j.result ?? j.text ?? j.summary ?? JSON.stringify(j)))
      .catch(() => setSummary("Unable to load summary."))
      .finally(() => setSummaryLoading(false));
  }

  return (
    <aside
      role="dialog"
      aria-labelledby="event-inspector-title"
      className="absolute right-4 top-4 w-96 rounded border border-border-subtle bg-bg-elevated/95 p-4 shadow-xl backdrop-blur"
    >
      {/* Color bar */}
      <div className="h-1 -mx-4 -mt-4 mb-3 rounded-t" style={{ background: color }} />

      {/* Header row: class badge + close button */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {CLASS_LABEL[event.class]} · {event.subclass ?? "—"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded px-1.5 text-text-muted hover:bg-bg-surface hover:text-text-primary"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <h3 id="event-inspector-title" className="text-sm font-semibold text-text-primary">
        {event.summary.en}
      </h3>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Severity" value={`${event.severity}/5`} />
        <Stat label="Danger" value={`${event.dangerScore}`} />
        <Stat label="Confidence" value={`${Math.round(event.confidence * 100)}%`} />
      </dl>

      {/* AI Summary section */}
      <div className="mt-3">
        {!summaryExpanded ? (
          <button
            onClick={handleGetSummary}
            className="flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface"
          >
            <span>✦</span> Get AI summary
          </button>
        ) : (
          <div>
            <button
              onClick={() => setSummaryExpanded(false)}
              className="flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface"
            >
              <span>✦</span> AI summary ▲
            </button>
            {summaryLoading ? (
              <span className="mt-2 block animate-pulse text-xs text-text-muted">Analyzing…</span>
            ) : summary !== null ? (
              <div className="mt-2 rounded bg-bg-base p-2 text-xs text-text-secondary leading-relaxed">
                {summary}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center text-[11px] text-text-muted">
        Verification: <span className="ml-1 text-text-secondary">{event.verificationState}</span>
        <button
          onClick={() => setExplainerOpen(true)}
          className="ml-1 rounded px-1 text-[10px] text-text-muted hover:bg-bg-surface hover:text-text-primary"
          title="Why this verdict?"
        >
          ?
        </button>
      </div>

      {/* Source provenance row */}
      <div className="mt-1 text-[11px] text-text-muted">
        Source: <span className="text-text-secondary">seed data</span>
        {" · "}
        <a
          href="https://archive.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Archive
        </a>
      </div>

      <div className="mt-1 text-[11px] text-text-muted">
        Occurred: <span className="text-text-secondary">{event.occurredAt}</span>
      </div>
      <div className="mt-1 font-mono text-[10px] text-text-muted">id: {event.eventId}</div>

      {/* Action row: Share + Pin + Open */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface"
        >
          <span>⎘</span> {copied ? "Copied!" : "Share"}
        </button>
        <button
          onClick={() => togglePin(event.eventId)}
          title={pinned ? "Unpin event" : "Pin to dashboard"}
          className={`flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-xs hover:bg-bg-surface ${pinned ? "text-accent" : "text-text-muted"}`}
        >
          {pinned ? "★" : "☆"}
        </button>
        <Link
          href={urls.event("en", event.eventId)}
          className="ml-auto rounded bg-accent px-3 py-1 text-xs font-semibold text-black hover:bg-accent-hover"
        >
          Open →
        </Link>
      </div>

      <VerificationExplainer
        eventId={event.eventId}
        verificationState={event.verificationState}
        confidence={event.confidence}
        open={explainerOpen}
        onClose={() => setExplainerOpen(false)}
      />
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface px-2 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-0.5 text-sm text-text-primary">{value}</div>
    </div>
  );
}
