import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  CITY_RISK_DATA,
  RISK_CONFIG,
  RISK_LABELS,
  EVACUATION_LABELS,
  type RiskLevel,
} from "@/lib/travel-risk-data";

type Params = { locale: string };

// ---------------------------------------------------------------------------
// Aggregate overview stats
// ---------------------------------------------------------------------------

const OVERVIEW = {
  criticalCities: 1,
  highRiskCities: 2,
  avgDanger: 60,
  totalAlerts24h: 36,
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  return buildMetadata({
    locale,
    title: "Ukraine City Safety Index — Travel Risk Ratings",
    description:
      "Real-time travel risk ratings for Ukrainian cities. Based on verified events, official alerts, and AI analysis. Updated continuously.",
    pathFor: (lc) => localePath(lc, "/travel"),
  });
}

// ---------------------------------------------------------------------------
// Risk filter chips (client-side filtering via URL hash would require a client
// component; here we render all cities and note the filter levels for UX)
// ---------------------------------------------------------------------------

const FILTER_LEVELS: { label: string; value: RiskLevel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Moderate", value: "moderate" },
  { label: "Low", value: "low" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function TravelIndexPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  return (
    <>
      <PageHeader
        eyebrow="Travel Safety"
        title="Ukraine City Safety Index"
        description="Real-time travel risk ratings for Ukrainian cities. Based on verified events, official alerts, and AI analysis. Updated continuously."
      />

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">

        {/* Disclaimer banner */}
        <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-400 mb-6">
          &#9888; For awareness only. Always follow official government travel advisories and
          Ukrainian authorities. This is not a substitute for official guidance.
        </div>

        {/* Overview stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Critical cities" value={OVERVIEW.criticalCities} valueClass="text-red-400" />
          <StatCard label="High-risk cities" value={OVERVIEW.highRiskCities} valueClass="text-orange-400" />
          <StatCard label="Avg danger score" value={`${OVERVIEW.avgDanger}/100`} />
          <StatCard label="Alerts (24h)" value={OVERVIEW.totalAlerts24h} />
        </section>

        {/* Filter chips (static labels — visual indicator of filter categories) */}
        <section aria-label="Risk level filters">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
            Filter by risk level
          </p>
          <div className="flex flex-wrap gap-2">
            {FILTER_LEVELS.map(({ label, value }) => {
              const cfg = value !== "all" ? RISK_CONFIG[value] : null;
              return (
                <span
                  key={value}
                  className={`rounded border px-3 py-1 font-mono text-xs ${
                    cfg
                      ? `${cfg.color} ${cfg.bg} ${cfg.border}`
                      : "text-text-secondary border-border-default bg-bg-surface"
                  }`}
                >
                  {label}
                </span>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-text-muted">
            All cities shown below, sorted by danger score.
          </p>
        </section>

        {/* City grid */}
        <section>
          <h2 className="sr-only">City safety cards</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...CITY_RISK_DATA]
              .sort((a, b) => b.dangerScore - a.dangerScore)
              .map((city) => {
                const cfg = RISK_CONFIG[city.riskLevel];
                const evLabel = EVACUATION_LABELS[city.evacuationStatus];
                const popK = (city.population / 1000).toLocaleString("en-GB", {
                  maximumFractionDigits: 0,
                });

                return (
                  <div
                    key={city.slug}
                    className={`rounded border ${cfg.border} bg-bg-surface p-5 flex flex-col gap-3`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {cfg.label}
                        </span>
                        <h3 className="mt-1.5 text-base font-semibold text-text-primary">
                          {city.name}{" "}
                          <span className="font-normal text-text-muted text-sm">
                            ({city.ukrainianName})
                          </span>
                        </h3>
                        <p className="text-xs text-text-muted">{city.oblast}</p>
                      </div>
                    </div>

                    {/* Danger score bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                          Danger score
                        </span>
                        <span className={`font-mono text-sm font-semibold ${cfg.color}`}>
                          {city.dangerScore}/100
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.bg.replace("/10", "/60")}`}
                          style={{ width: `${city.dangerScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-text-secondary font-mono">
                      <span>Alerts (24h): <strong className={cfg.color}>{city.alertsLast24h}</strong></span>
                      <span>Population: <strong>{popK}k</strong></span>
                    </div>

                    {/* Evacuation badge */}
                    <div>
                      <span
                        className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] ${
                          city.evacuationStatus === "mandatory"
                            ? "border-red-400/40 bg-red-400/10 text-red-400"
                            : city.evacuationStatus === "voluntary"
                            ? "border-orange-400/40 bg-orange-400/10 text-orange-400"
                            : "border-border-subtle bg-bg-elevated text-text-muted"
                        }`}
                      >
                        {evLabel}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={localePath(locale, `/travel/${city.slug}`)}
                      className="mt-auto inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline"
                    >
                      View safety guide <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Full risk scale reference */}
        <section className="rounded border border-border-subtle bg-bg-surface p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Risk level reference</h2>
          <ul className="space-y-1.5">
            {(Object.entries(RISK_LABELS) as [RiskLevel, string][]).map(([level, label]) => {
              const cfg = RISK_CONFIG[level];
              return (
                <li key={level} className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${cfg.bg.replace("/10", "")} border ${cfg.border}`} />
                  <span className={`font-mono text-xs ${cfg.color}`}>{label}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Disclaimer */}
        <div className="rounded border border-border-subtle bg-bg-surface/50 p-4 text-xs text-text-muted">
          <strong className="text-text-secondary">Disclaimer:</strong>{" "}
          Risk ratings are for awareness only and based on synthetic illustrative data. Always
          follow official guidance from Ukrainian authorities, ДСНС, and local military
          administrations. Aegis Lens does not replace official emergency services or evacuation
          instructions. Verify all information with{" "}
          <a
            href="https://www.gov.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            gov.ua
          </a>{" "}
          and your government&apos;s travel advisory.
        </div>

      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Small stat card helper
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  valueClass = "text-text-primary",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold font-mono ${valueClass}`}>{value}</p>
    </div>
  );
}
