import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  listReports,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_COLOR,
  type ReportType,
} from "@/lib/reports-data";
import { CLASS_COLOR } from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";

function reportsPath(lc: Locale): string {
  return lc === "en" ? "/reports" : `/${lc}/reports`;
}

function reportPath(lc: Locale, slug: string): string {
  return lc === "en" ? `/reports/${slug}` : `/${lc}/reports/${slug}`;
}

function generatePath(lc: Locale): string {
  return lc === "en" ? "/reports/generate" : `/${lc}/reports/generate`;
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
    title: "Intelligence Reports",
    description:
      "AI-generated and human-reviewed intelligence reports. Every claim is sourced, every event verified.",
    pathFor: (lc) => reportsPath(lc),
  });
}

const TYPE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Regional Brief", value: "regional_brief" },
  { label: "Incident Dossier", value: "incident_dossier" },
  { label: "Weekly Digest", value: "weekly_digest" },
];

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;

  const typeFilter = typeof sp.type === "string" ? sp.type : "";
  const downloadableOnly = sp.downloadable === "1";

  const allReports = listReports();
  const reports = allReports.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (downloadableOnly && !r.downloadable) return false;
    return true;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Intelligence Reports",
    url: `${SITE.url}${reportsPath(locale)}`,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.name,
    },
    hasPart: allReports.map((r) => ({
      "@type": "Article",
      headline: r.title,
      datePublished: r.publishedAt,
      author: r.authors.map((a) => ({ "@type": "Person", name: a })),
      url: `${SITE.url}${reportPath(locale, r.slug)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Intelligence Reports"
        title="Verified Intelligence Reports"
        description="AI-generated and human-reviewed intelligence reports. Every claim is sourced, every event verified."
      />

      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {TYPE_FILTER_OPTIONS.map((opt) => {
              const isActive = typeFilter === opt.value;
              const href = buildFilterHref({ type: opt.value, downloadable: downloadableOnly });
              return (
                <Link
                  key={opt.value || "all"}
                  href={href}
                  className={[
                    "rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-subtle bg-bg-surface text-text-muted hover:border-accent/50 hover:text-text-secondary",
                  ].join(" ")}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          {/* Downloadable checkbox */}
          <Link
            href={buildFilterHref({ type: typeFilter, downloadable: !downloadableOnly })}
            className={[
              "ml-auto flex items-center gap-2 rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              downloadableOnly
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-accent/50 hover:text-text-secondary",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border",
                downloadableOnly ? "border-accent bg-accent" : "border-border-subtle",
              ].join(" ")}
              aria-hidden="true"
            >
              {downloadableOnly && (
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-black">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            PDF available
          </Link>
        </div>

        {/* Report grid */}
        {reports.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">
            No reports match the current filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 stagger-children">
            {reports.map((r) => {
              const typeColor = REPORT_TYPE_COLOR[r.type];
              const typeLabel = REPORT_TYPE_LABELS[r.type];
              return (
                <div
                  key={r.slug}
                  className="flex flex-col rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:bg-bg-elevated"
                >
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: typeColor, borderColor: `${typeColor}40` }}
                    >
                      {typeLabel}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  {/* Title + subtitle */}
                  <Link href={reportPath(locale, r.slug)} className="group mt-3">
                    <h2 className="text-base font-semibold text-text-primary group-hover:text-accent">
                      {r.title}
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">{r.subtitle}</p>
                  </Link>

                  {/* Meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>{r.region}</span>
                    <span aria-hidden="true">·</span>
                    <span>{r.authors.join(", ")}</span>
                    <span aria-hidden="true">·</span>
                    <span>{r.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{r.pageCount}pp</span>
                  </div>

                  {/* Tag chips */}
                  {r.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.tags.map((tag) => {
                        const color = CLASS_COLOR[tag as EventClass] ?? "#94a3b8";
                        return (
                          <span
                            key={tag}
                            className="rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                            style={{
                              color,
                              backgroundColor: `${color}18`,
                              border: `1px solid ${color}40`,
                            }}
                          >
                            {tag.replace(/_/g, " ")}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary excerpt */}
                  <p className="mt-3 line-clamp-3 text-xs text-text-secondary">{r.summary}</p>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 pt-2 border-t border-border-subtle">
                    <Link
                      href={reportPath(locale, r.slug)}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Read report →
                    </Link>
                    {r.downloadable && (
                      <a
                        href={`/api/reports/${r.slug}/pdf`}
                        className="rounded border border-border-subtle bg-bg-elevated px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:border-accent/50 hover:text-accent"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Generate AI Report CTA */}
        <div className="mt-8 rounded border border-accent/20 bg-accent/5 p-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Generate a custom intelligence report
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Select a region, time window, and focus areas — our AI generates a structured report
            with citations.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={generatePath(locale)}
              className="inline-block rounded bg-accent px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Generate report →
            </Link>
            <span className="text-xs text-text-muted">Available on Team plan and above</span>
          </div>
        </div>
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "border-green-500/30 text-green-400",
    draft: "border-yellow-500/30 text-yellow-400",
    pending_review: "border-blue-500/30 text-blue-400",
  };
  const labels: Record<string, string> = {
    published: "Published",
    draft: "Draft",
    pending_review: "Pending Review",
  };
  return (
    <span
      className={[
        "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        styles[status] ?? "border-border-subtle text-text-muted",
      ].join(" ")}
    >
      {labels[status] ?? status}
    </span>
  );
}

function buildFilterHref({
  type,
  downloadable,
}: {
  type: string;
  downloadable: boolean;
}): string {
  const qs = new URLSearchParams();
  if (type) qs.set("type", type);
  if (downloadable) qs.set("downloadable", "1");
  const str = qs.toString();
  return str ? `/reports?${str}` : "/reports";
}
