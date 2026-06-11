import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  MILITARY_UNITS,
  COUNTRY_FLAG,
  COUNTRY_LABEL,
  UNIT_TYPE_LABEL,
  type UnitCountry,
  type UnitType,
} from "@/lib/units-data";

const TITLE = "Military Units Directory";
const DESCRIPTION =
  "Publicly documented military units based on open-source reporting. For security reasons, only confirmed public information is shown.";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/units"),
  });
}

const COUNTRY_FILTER_OPTIONS: { value: UnitCountry | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ru", label: "Russia" },
  { value: "ua", label: "Ukraine" },
  { value: "by", label: "Belarus" },
];

const TYPE_FILTER_OPTIONS: { value: UnitType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "ground", label: "Ground" },
  { value: "air", label: "Air" },
  { value: "naval", label: "Naval" },
  { value: "special", label: "Special" },
];

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-neutral-500",
  unknown: "bg-yellow-500",
  destroyed: "bg-red-500",
};

const CONFIDENCE_BADGE: Record<string, string> = {
  high: "text-green-400 border-green-500/30 bg-green-500/10",
  medium: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  low: "text-red-400 border-red-500/30 bg-red-500/10",
};

export default async function UnitsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string; type?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const { country = "all", type = "all" } = await searchParams;

  const filtered = MILITARY_UNITS.filter((u) => {
    const countryMatch = country === "all" || u.country === country;
    const typeMatch = type === "all" || u.type === type;
    return countryMatch && typeMatch;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/units")}`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Open Order of Battle"
        title={TITLE}
        description={DESCRIPTION}
      />

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Disclaimer */}
        <div className="rounded border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400 mb-6">
          🔒 This directory contains only information confirmed by official statements, press
          reports, and public OSINT. No operational security information. Ukrainian unit positions
          are not published.
        </div>

        {/* Filter bar */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Country
            </label>
            <div className="flex gap-1">
              {COUNTRY_FILTER_OPTIONS.map((opt) => {
                const isActive = country === opt.value;
                const href =
                  `?country=${opt.value}` + (type !== "all" ? `&type=${type}` : "");
                return (
                  <Link
                    key={opt.value}
                    href={href}
                    className={`rounded border px-2.5 py-1 font-mono text-xs transition ${
                      isActive
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border-subtle bg-bg-surface text-text-secondary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Unit Type
            </label>
            <div className="flex gap-1 flex-wrap">
              {TYPE_FILTER_OPTIONS.map((opt) => {
                const isActive = type === opt.value;
                const href =
                  (country !== "all" ? `?country=${country}` : "?") +
                  (opt.value !== "all" ? `${country !== "all" ? "&" : ""}type=${opt.value}` : "");
                return (
                  <Link
                    key={opt.value}
                    href={href || "?"}
                    className={`rounded border px-2.5 py-1 font-mono text-xs transition ${
                      isActive
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border-subtle bg-bg-surface text-text-secondary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 font-mono text-xs text-text-muted">
          {filtered.length} unit{filtered.length !== 1 ? "s" : ""} shown
        </p>

        {/* Units grid */}
        {filtered.length === 0 ? (
          <div className="rounded border border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-muted">
            No units match the selected filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((unit) => (
              <div
                key={unit.slug}
                className="rounded border border-border-subtle bg-bg-surface p-4 flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {COUNTRY_FLAG[unit.country]} {unit.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {unit.shortName} · {COUNTRY_LABEL[unit.country]}
                    </p>
                  </div>
                  {/* Status dot */}
                  <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                    <span
                      className={`h-2 w-2 rounded-full ${STATUS_DOT[unit.status] ?? "bg-neutral-500"}`}
                      title={unit.status}
                    />
                    <span className="font-mono text-[10px] text-text-muted capitalize">
                      {unit.status}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                    {UNIT_TYPE_LABEL[unit.type]}
                  </span>
                  <span className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted capitalize">
                    {unit.commandLevel}
                  </span>
                  <span
                    className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] capitalize ${CONFIDENCE_BADGE[unit.sourceConfidence]}`}
                  >
                    {unit.sourceConfidence} confidence
                  </span>
                </div>

                {/* Theater */}
                <p className="text-xs text-text-secondary">
                  <span className="text-text-muted">Theater: </span>
                  {unit.theater}
                </p>

                {/* Footer meta */}
                <div className="flex items-center justify-between border-t border-border-subtle pt-2 mt-auto">
                  <div className="font-mono text-[10px] text-text-muted">
                    <span className="text-text-secondary">{unit.eventCount}</span> events ·
                    First doc.{" "}
                    <span className="text-text-secondary">{unit.firstDocumented}</span>
                  </div>
                  <Link
                    href={localePath(locale, `/units/${unit.slug}`)}
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    View unit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
