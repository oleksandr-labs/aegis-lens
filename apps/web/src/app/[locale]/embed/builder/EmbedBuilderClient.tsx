"use client";

import { useState, useCallback } from "react";
import { ALL_CLASSES, COUNTRIES, COUNTRY_LABELS, type CountryCode } from "@/lib/filter-config";

// ---------------------------------------------------------------------------
// Widget type definitions
// ---------------------------------------------------------------------------

const WIDGET_TYPES = [
  { id: "map",     label: "Live Map",        description: "Interactive map with layer controls" },
  { id: "feed",    label: "Event Feed",      description: "Scrollable list of latest events" },
  { id: "stats",   label: "Stats Counter",   description: "Live counters: events, sources, countries" },
  { id: "heatmap", label: "Activity Heatmap", description: "Density heatmap of events" },
  { id: "brief",   label: "Region Brief",    description: "Auto-updating AI intelligence brief" },
] as const;

type WidgetId = (typeof WIDGET_TYPES)[number]["id"];

const TIME_WINDOW_OPTIONS = [
  { label: "1h",  value: "1" },
  { label: "6h",  value: "6" },
  { label: "24h", value: "24" },
  { label: "7d",  value: "168" },
] as const;

const THEME_OPTIONS  = ["dark", "light", "tactical"] as const;
const LOCALE_OPTIONS = ["en", "uk"]                  as const;
const LENGTH_OPTIONS = ["short", "medium", "full"]   as const;

type Theme  = (typeof THEME_OPTIONS)[number];
type Locale = (typeof LOCALE_OPTIONS)[number];
type Length = (typeof LENGTH_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Snippet syntax-highlight helpers (CSS-only, no external lib)
// ---------------------------------------------------------------------------

function HighlightedSnippet({ code }: { code: string }) {
  // Tokenise the snippet into coloured spans without a parser dependency.
  const parts: { text: string; kind: "tag" | "attr" | "value" | "plain" }[] = [];

  const TAG_RE   = /(<\/?\w[\w-]*>?|>)/g;
  const ATTR_RE  = /(\w[\w-]*)=/g;
  const VALUE_RE = /"([^"]*)"/g;

  // Simple line-by-line colouring
  for (const line of code.split("\n")) {
    let rest = line;
    let col = 0;

    // Colour tag names
    rest = rest.replace(/<(\/?[\w-]+)/g, (_m, name) => `\x00TAG\x00${name}\x00/TAG\x00`);
    // Colour attribute names
    rest = rest.replace(/([\w-]+=)/g, (_m, attr) => `\x00ATTR\x00${attr}\x00/ATTR\x00`);
    // Colour quoted values
    rest = rest.replace(/"([^"]*)"/g, (_m, val) => `\x00VAL\x00"${val}"\x00/VAL\x00`);

    parts.push({ text: rest + "\n", kind: "plain" });
  }

  // Re-split into coloured spans for rendering
  const rendered: React.ReactNode[] = [];
  let key = 0;
  for (const part of parts) {
    const segments = part.text.split(/(\x00TAG\x00.*?\x00\/TAG\x00|\x00ATTR\x00.*?\x00\/ATTR\x00|\x00VAL\x00.*?\x00\/VAL\x00)/);
    for (const seg of segments) {
      if (seg.startsWith("\x00TAG\x00")) {
        const text = seg.replace(/\x00TAG\x00|\x00\/TAG\x00/g, "");
        rendered.push(<span key={key++} className="text-blue-400">{`<${text}`}</span>);
      } else if (seg.startsWith("\x00ATTR\x00")) {
        const text = seg.replace(/\x00ATTR\x00|\x00\/ATTR\x00/g, "");
        rendered.push(<span key={key++} className="text-accent">{text}</span>);
      } else if (seg.startsWith("\x00VAL\x00")) {
        const text = seg.replace(/\x00VAL\x00|\x00\/VAL\x00/g, "");
        rendered.push(<span key={key++} className="text-green-400">{text}</span>);
      } else if (seg) {
        rendered.push(<span key={key++}>{seg}</span>);
      }
    }
  }

  return <>{rendered}</>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RadioCard({
  selected,
  onClick,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded border p-3 text-left transition-colors cursor-pointer ${
        selected
          ? "border-accent bg-accent/5 text-text-primary"
          : "border-border-subtle bg-bg-base text-text-secondary hover:border-accent/50"
      }`}
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="mt-0.5 block text-xs opacity-70">{description}</span>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-medium uppercase tracking-wider text-text-secondary">
      {children}
    </span>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded border px-3 py-1.5 text-xs capitalize transition-colors cursor-pointer ${
            value === opt
              ? "border-accent bg-accent/10 text-accent"
              : "border-border-subtle text-text-secondary hover:border-accent/50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function EmbedBuilderClient() {
  // ── Widget type
  const [widgetType, setWidgetType] = useState<WidgetId>("map");

  // ── Common options
  const [country, setCountry]     = useState<CountryCode>("ua");
  const [hours, setHours]         = useState("24");
  const [theme, setTheme]         = useState<Theme>("dark");
  const [locale, setLocale]       = useState<Locale>("en");

  // ── Map-specific
  const [layers, setLayers]         = useState<string[]>([]);
  const [showControls, setShowControls] = useState(true);

  // ── Feed-specific
  const [limit, setLimit]             = useState(10);
  const [showConfidence, setShowConfidence] = useState(true);

  // ── Brief-specific
  const [region, setRegion]   = useState("Kharkiv Oblast");
  const [length, setLength]   = useState<Length>("medium");

  // ── Dimensions
  const [useFullWidth, setUseFullWidth] = useState(false);
  const [width, setWidth]   = useState(800);
  const [height, setHeight] = useState(500);

  // ── Copy state
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // ── Computed values
  const widgetMeta = WIDGET_TYPES.find((w) => w.id === widgetType)!;

  const queryParams = new URLSearchParams({
    country,
    hours,
    theme,
    locale,
    ...(widgetType === "feed"  ? { limit: String(limit), confidence: showConfidence ? "1" : "0" } : {}),
    ...(widgetType === "map"   ? { controls: showControls ? "1" : "0", layers: layers.join(",") } : {}),
    ...(widgetType === "brief" ? { region, length } : {}),
  });
  const queryString = queryParams.toString();

  const embedSrc    = `/embed/${widgetType}?${queryString}`;
  const widthValue  = useFullWidth ? "100%" : String(width);
  const previewH    = Math.min(height, 400);

  const snippet = `<iframe
  src="https://aegislens.io/embed/${widgetType}?${queryString}"
  width="${widthValue}"
  height="${height}"
  frameborder="0"
  allow="fullscreen"
  loading="lazy"
  title="Aegis Lens — ${widgetMeta.label}">
</iframe>`;

  const shareUrl = `https://aegislens.io/embed/builder?widget=${widgetType}&country=${country}&hours=${hours}&theme=${theme}&locale=${locale}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [snippet]);

  const handleCopyShare = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  }, [shareUrl]);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        {/* ─── Config panel ─── */}
        <aside className="rounded border border-border-subtle bg-bg-surface p-5 space-y-5 self-start">
          {/* Widget type */}
          <div>
            <Label>Widget type</Label>
            <div className="mt-2 space-y-2">
              {WIDGET_TYPES.map((w) => (
                <RadioCard
                  key={w.id}
                  selected={widgetType === w.id}
                  onClick={() => setWidgetType(w.id)}
                  label={w.label}
                  description={w.description}
                />
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <Label>Country</Label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as CountryCode)}
              className="mt-2 w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {/* Time window */}
          <div>
            <Label>Time window</Label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="mt-2 w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            >
              {TIME_WINDOW_OPTIONS.map((tw) => (
                <option key={tw.value} value={tw.value}>
                  {tw.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <div>
            <Label>Theme</Label>
            <div className="mt-2">
              <RadioGroup options={THEME_OPTIONS} value={theme} onChange={setTheme} />
            </div>
          </div>

          {/* Locale */}
          <div>
            <Label>Locale</Label>
            <div className="mt-2">
              <RadioGroup options={LOCALE_OPTIONS} value={locale} onChange={setLocale} />
            </div>
          </div>

          {/* ── Map-specific options ── */}
          {widgetType === "map" && (
            <>
              <div>
                <Label>Layers</Label>
                <div className="mt-2 space-y-1.5">
                  {ALL_CLASSES.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={layers.includes(c.id)}
                        onChange={() => toggleLayer(c.id)}
                        className="h-4 w-4 accent-accent"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showControls}
                    onChange={(e) => setShowControls(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Show controls (layer panel, zoom, scale)
                </label>
              </div>
            </>
          )}

          {/* ── Feed-specific options ── */}
          {widgetType === "feed" && (
            <>
              <div>
                <Label>Max events</Label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="mt-2 w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                >
                  {[5, 10, 20].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showConfidence}
                    onChange={(e) => setShowConfidence(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Show confidence score
                </label>
              </div>
            </>
          )}

          {/* ── Brief-specific options ── */}
          {widgetType === "brief" && (
            <>
              <div>
                <Label>Region</Label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Kharkiv Oblast"
                  className="mt-2 w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                />
              </div>
              <div>
                <Label>Length</Label>
                <div className="mt-2">
                  <RadioGroup options={LENGTH_OPTIONS} value={length} onChange={setLength} />
                </div>
              </div>
            </>
          )}

          {/* ── Dimensions ── */}
          <div>
            <Label>Dimensions</Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="block text-xs text-text-secondary mb-1">Width</span>
                  <input
                    type="number"
                    value={width}
                    min={200}
                    max={2560}
                    disabled={useFullWidth}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent disabled:opacity-40"
                  />
                </div>
                <div className="flex-1">
                  <span className="block text-xs text-text-secondary mb-1">Height</span>
                  <input
                    type="number"
                    value={height}
                    min={200}
                    max={1200}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFullWidth}
                  onChange={(e) => setUseFullWidth(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                100% width (responsive)
              </label>
            </div>
          </div>
        </aside>

        {/* ─── Preview panel ─── */}
        <main className="space-y-6 min-w-0">
          {/* Live preview */}
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">Live preview</h2>
            <div
              className="relative overflow-hidden rounded border border-border-subtle"
              style={{ height: `${previewH}px` }}
            >
              <iframe
                src={embedSrc}
                className="h-full w-full border-0"
                title="Preview"
              />
            </div>
          </div>

          {/* Snippet */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary">Embed snippet</h2>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded border border-border-subtle px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary hover:border-accent"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs leading-relaxed text-text-primary">
              <HighlightedSnippet code={snippet} />
            </pre>
          </div>

          {/* Share link */}
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">Share this configuration</h2>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 rounded border border-border-subtle bg-bg-base px-3 py-2 font-mono text-xs text-text-secondary outline-none"
              />
              <button
                type="button"
                onClick={handleCopyShare}
                className="shrink-0 rounded border border-border-subtle px-3 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary hover:border-accent"
              >
                {copiedShare ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
