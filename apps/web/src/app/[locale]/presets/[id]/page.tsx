import { notFound } from "next/navigation";
import Link from "next/link";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { CLASS_COLOR } from "@/lib/filter-config";
import { PRESETS, type WorkspacePreset } from "@/lib/workspace-presets";
import { PresetApplyButton } from "@/components/PresetApplyButton";

// ─── Static params ───────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ACTIVE_LOCALES.flatMap((locale) =>
    PRESETS.map((preset) => ({ locale, id: preset.id })),
  );
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return {};
  return buildMetadata({
    locale,
    title: preset.name,
    description: preset.description,
    pathFor: (lc) => `${urls.presets(lc)}/${preset.id}`,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  events: "Events Feed",
  kpi: "KPI Cards",
  anomalies: "Anomaly Detector",
  watchlist: "Watchlist",
  "source-health": "Source Health",
  classes: "Class Breakdown",
  brief: "AI Copilot Brief",
  alerts: "Alert Rules",
};

const COUNTRY_LABELS: Record<string, string> = {
  ua: "Ukraine",
  pl: "Poland",
  de: "Germany",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PresetDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) notFound();

  const similarPresets = PRESETS.filter(
    (p) => p.persona === preset.persona && p.id !== preset.id,
  );

  const countryLabel =
    COUNTRY_LABELS[preset.filters.country] ?? preset.filters.country.toUpperCase();
  const timeLabel =
    preset.filters.hours < 24
      ? `${preset.filters.hours}h`
      : preset.filters.hours < 168
        ? `${preset.filters.hours / 24}d`
        : `${Math.round(preset.filters.hours / 168)}w`;

  const personaColor = PERSONA_COLORS[preset.persona];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
        <Link href={urls.presets(locale)} className="hover:text-text-primary">
          Presets
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{preset.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-3">
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
          <h1 className="mb-2 text-2xl font-bold text-text-primary">{preset.name}</h1>
          <p className="text-sm text-text-secondary">{preset.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <PresetApplyButton preset={preset} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Filter breakdown */}
        <section className="rounded border border-border-subtle bg-bg-elevated p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Filter Configuration
          </h2>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-xs text-text-muted">Country</dt>
              <dd className="font-mono text-xs text-text-primary">{countryLabel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-text-muted">Time window</dt>
              <dd className="font-mono text-xs text-text-primary">{timeLabel}</dd>
            </div>
            {preset.filters.minConfidence !== undefined && (
              <div className="flex items-center justify-between">
                <dt className="text-xs text-text-muted">Min. confidence</dt>
                <dd className="font-mono text-xs text-text-primary">
                  {preset.filters.minConfidence}%
                </dd>
              </div>
            )}
            {preset.filters.minDanger !== undefined && (
              <div className="flex items-center justify-between">
                <dt className="text-xs text-text-muted">Min. danger score</dt>
                <dd className="font-mono text-xs text-text-primary">
                  {preset.filters.minDanger}
                </dd>
              </div>
            )}
          </dl>

          {/* Class chips */}
          {preset.filters.classes.length > 0 && (
            <div className="mt-4 border-t border-border-subtle pt-4">
              <p className="mb-2 text-xs text-text-muted">Event classes</p>
              <div className="flex flex-wrap gap-1.5">
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
            </div>
          )}
        </section>

        {/* Widget list */}
        <section className="rounded border border-border-subtle bg-bg-elevated p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Dashboard Widgets
          </h2>
          <ul className="space-y-2">
            {preset.dashboardWidgets.map((w) => (
              <li key={w} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                {WIDGET_LABELS[w] ?? w}
              </li>
            ))}
          </ul>

          {/* Copilot context */}
          {preset.copilotContext && (
            <div className="mt-4 border-t border-border-subtle pt-4">
              <p className="mb-1 text-xs font-medium text-text-muted">Copilot focus</p>
              <p className="text-xs text-text-secondary italic">&ldquo;{preset.copilotContext}&rdquo;</p>
            </div>
          )}
        </section>

        {/* Alert rules */}
        {preset.alertRules && preset.alertRules.length > 0 && (
          <section className="rounded border border-border-subtle bg-bg-elevated p-5 sm:col-span-2">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Alert Rules
            </h2>
            <ul className="divide-y divide-border-subtle">
              {preset.alertRules.map((rule) => (
                <li key={rule.name} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="flex-1 text-xs font-medium text-text-primary">{rule.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {rule.classes.map((cls) => {
                      const color = CLASS_COLOR[cls as keyof typeof CLASS_COLOR] ?? "#94a3b8";
                      return (
                        <span
                          key={cls}
                          className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                          style={{ backgroundColor: `${color}22`, color }}
                        >
                          {cls.replace(/_/g, " ")}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex gap-1">
                    {rule.channels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded bg-bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Similar presets */}
      {similarPresets.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">
            Similar presets &mdash; {PERSONA_LABELS[preset.persona]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {similarPresets.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/presets/${p.id}`}
                className="flex flex-col rounded border border-border-subtle bg-bg-elevated p-4 hover:border-accent/40 transition-colors"
              >
                <span className="mb-1 text-xs font-semibold text-text-primary hover:text-accent">
                  {p.name}
                </span>
                <span className="text-[11px] text-text-muted line-clamp-2">{p.description}</span>
                {p.usageCount !== undefined && (
                  <span className="mt-2 font-mono text-[10px] text-text-muted">
                    {p.usageCount.toLocaleString()} users
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link
          href={urls.presets(locale)}
          className="text-xs text-accent hover:underline"
        >
          &larr; All presets
        </Link>
      </div>
    </div>
  );
}
