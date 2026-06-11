import Link from "next/link";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { CLASS_COLOR } from "@/lib/filter-config";
import { PRESETS, type WorkspacePreset } from "@/lib/workspace-presets";
import { PresetApplyButton } from "@/components/PresetApplyButton";

// ─── Static params ───────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Intelligence Workspace Presets",
    description:
      "Pre-configured workspaces built by the Aegis community and our team. One click to apply.",
    pathFor: (lc) => urls.presets(lc),
  });
}

// ─── Persona metadata ────────────────────────────────────────────────────────

const PERSONA_LABELS: Record<WorkspacePreset["persona"], string> = {
  analyst: "Analyst",
  journalist: "Journalist",
  ngo: "NGO",
  government: "Government",
  trader: "Trader",
  civilian: "Civilian",
};

const PERSONA_COLORS: Record<WorkspacePreset["persona"], string> = {
  analyst: "bg-blue-900/40 text-blue-400 border-blue-800/60",
  journalist: "bg-purple-900/40 text-purple-400 border-purple-800/60",
  ngo: "bg-green-900/40 text-green-400 border-green-800/60",
  government: "bg-red-900/40 text-red-400 border-red-800/60",
  trader: "bg-yellow-900/40 text-yellow-400 border-yellow-800/60",
  civilian: "bg-slate-900/40 text-slate-400 border-slate-700/60",
};

const WIDGET_LABELS: Record<string, string> = {
  events: "Events",
  kpi: "KPI",
  anomalies: "Anomalies",
  watchlist: "Watchlist",
  "source-health": "Source Health",
  classes: "Classes",
  brief: "AI Brief",
  alerts: "Alerts",
};

const COUNTRY_LABELS: Record<string, string> = {
  ua: "Ukraine",
  pl: "Poland",
  de: "Germany",
};

const ALL_PERSONAS: Array<{ value: WorkspacePreset["persona"] | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "analyst", label: "Analyst" },
  { value: "journalist", label: "Journalist" },
  { value: "ngo", label: "NGO" },
  { value: "government", label: "Government" },
  { value: "trader", label: "Trader" },
];

// ─── Preset card ─────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  locale,
}: {
  preset: WorkspacePreset;
  locale: Locale;
}) {
  const personaColor = PERSONA_COLORS[preset.persona];
  const countryLabel = COUNTRY_LABELS[preset.filters.country] ?? preset.filters.country.toUpperCase();
  const timeLabel =
    preset.filters.hours < 24
      ? `${preset.filters.hours}h`
      : preset.filters.hours < 168
        ? `${preset.filters.hours / 24}d`
        : `${Math.round(preset.filters.hours / 168)}w`;

  return (
    <div className="flex flex-col rounded border border-border-subtle bg-bg-elevated p-5 hover:border-accent/40 transition-colors">
      {/* Persona badge */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${personaColor}`}
        >
          {PERSONA_LABELS[preset.persona]}
        </span>
        {preset.usageCount !== undefined && (
          <span className="font-mono text-[10px] text-text-muted">
            {preset.usageCount.toLocaleString()} users
          </span>
        )}
      </div>

      {/* Title + description */}
      <Link
        href={`/${locale}/presets/${preset.id}`}
        className="mb-1 text-sm font-semibold text-text-primary hover:text-accent"
      >
        {preset.name}
      </Link>
      <p className="mb-4 text-xs leading-relaxed text-text-secondary">{preset.description}</p>

      {/* Filter tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {/* Country */}
        <span className="rounded bg-bg-surface px-2 py-0.5 font-mono text-[10px] text-text-muted border border-border-subtle">
          {countryLabel}
        </span>
        {/* Time window */}
        <span className="rounded bg-bg-surface px-2 py-0.5 font-mono text-[10px] text-text-muted border border-border-subtle">
          {timeLabel}
        </span>
        {/* Event class chips */}
        {preset.filters.classes.map((cls) => {
          const color = CLASS_COLOR[cls as keyof typeof CLASS_COLOR] ?? "#94a3b8";
          return (
            <span
              key={cls}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] text-text-muted border border-border-subtle"
              style={{ backgroundColor: `${color}15` }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {cls.replace(/_/g, " ")}
            </span>
          );
        })}
      </div>

      {/* Widget badges */}
      <div className="mb-4 flex flex-wrap gap-1">
        {preset.dashboardWidgets.map((w) => (
          <span
            key={w}
            className="rounded bg-bg-surface px-1.5 py-0.5 text-[10px] text-text-muted"
          >
            {WIDGET_LABELS[w] ?? w}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 pt-2 border-t border-border-subtle">
        <PresetApplyButton preset={preset} />
        <button
          type="button"
          className="rounded border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:bg-bg-surface"
          title="Requires sign-in"
        >
          Save to my presets
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PresetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ persona?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const { persona: personaFilter } = await searchParams;

  const activePersona = personaFilter ?? "all";
  const filtered =
    activePersona === "all"
      ? PRESETS
      : PRESETS.filter((p) => p.persona === activePersona);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
          Workspaces
        </p>
        <h1 className="mb-3 text-3xl font-bold text-text-primary">
          Intelligence Workspace Presets
        </h1>
        <p className="max-w-xl text-sm text-text-secondary">
          Pre-configured workspaces built by the Aegis community and our team. One click to apply.
        </p>
      </div>

      {/* Filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {ALL_PERSONAS.map(({ value, label }) => {
          const isActive = value === activePersona;
          const href =
            value === "all"
              ? `/${locale}/presets`
              : `/${locale}/presets?persona=${value}`;
          return (
            <Link
              key={value}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle text-text-muted hover:text-text-primary hover:border-border-default"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Presets grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {filtered.map((preset) => (
          <PresetCard key={preset.id} preset={preset} locale={locale} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-12 text-center text-sm text-text-muted">
            No presets found for this persona.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-16 rounded border border-border-subtle bg-bg-elevated p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">Create your own</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Customize and save your layout from the analyst dashboard. Tailor filters, widgets, and
          alert rules to your specific workflow.
        </p>
        <Link
          href={urls.dashboard(locale)}
          className="inline-flex items-center gap-1.5 rounded border border-accent/60 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent hover:bg-accent/20"
        >
          Customize and save your layout →
        </Link>
      </div>
    </div>
  );
}
