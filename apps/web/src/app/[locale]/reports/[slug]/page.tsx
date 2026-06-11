import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { getReport, listReports, REPORTS } from "@/lib/reports-seed";
import { getReportBySlug, listReports as listNewReports, REPORT_TYPE_LABELS, REPORT_TYPE_COLOR } from "@/lib/reports-data";
import { formatDateTime, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";
import { eventById } from "@/lib/events-seed";
import { findOblast, findCountryIso2 } from "@/lib/region-lookup";
import { OBLASTS } from "@/lib/oblasts-seed";
import { urls } from "@aegis/url-builder";
import { CLASS_COLOR } from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";

type Params = { locale: string; slug: string };

function reportsPath(lc: Locale): string {
  return lc === "en" ? "/reports" : `/${lc}/reports`;
}

function reportPath(lc: Locale, slug: string): string {
  return lc === "en" ? `/reports/${slug}` : `/${lc}/reports/${slug}`;
}

function eventPath(lc: Locale, id: string): string {
  return lc === "en" ? `/events/${id}` : `/${lc}/events/${id}`;
}

export function generateStaticParams() {
  // Combine slugs from both seeds
  const slugSet = new Set([
    ...REPORTS.map((r) => r.slug),
    ...listNewReports().map((r) => r.slug),
  ]);
  const out: Params[] = [];
  for (const slug of slugSet) {
    for (const lc of ACTIVE_LOCALES) {
      if (lc === "en") continue;
      out.push({ locale: lc, slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Try new data first
  const nr = getReportBySlug(slug);
  if (nr) {
    return buildMetadata({
      locale,
      title: nr.title,
      description: nr.summary,
      pathFor: (lc) => reportPath(lc, slug),
    });
  }

  // Fall back to legacy seed
  const r = getReport(slug);
  if (!r) return { robots: { index: false } };
  const title = r.title[locale] ?? r.title.en;
  const description = r.summary[locale] ?? r.summary.en;
  return buildMetadata({
    locale,
    title,
    description,
    pathFor: (lc) => reportPath(lc, slug),
  });
}

export default async function ReportDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  /* ── Try new reports-data first ── */
  const newReport = getReportBySlug(slug);
  if (newReport) {
    const allNewReports = listNewReports();
    const related = allNewReports
      .filter((r) => r.slug !== slug && r.tags.some((t) => newReport.tags.includes(t)))
      .slice(0, 3);

    const typeLabel = REPORT_TYPE_LABELS[newReport.type];
    const typeColor = REPORT_TYPE_COLOR[newReport.type];

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${SITE.url}${reportPath(locale, slug)}`,
          headline: newReport.title,
          description: newReport.summary,
          datePublished: newReport.publishedAt,
          author: newReport.authors.map((a) => ({ "@type": "Person", name: a })),
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          mainEntityOfPage: `${SITE.url}${reportPath(locale, slug)}`,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Reports", item: `${SITE.url}${reportsPath(locale)}` },
            { "@type": "ListItem", position: 2, name: typeLabel, item: `${SITE.url}${reportsPath(locale)}?type=${newReport.type}` },
            { "@type": "ListItem", position: 3, name: newReport.title, item: `${SITE.url}${reportPath(locale, slug)}` },
          ],
        },
      ],
    };

    return (
      <article className="mx-auto max-w-5xl px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href={reportsPath(locale)} className="text-accent hover:underline">Reports</Link></li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`${reportsPath(locale)}?type=${newReport.type}`} className="hover:text-accent">
                {typeLabel}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-text-secondary">{newReport.title}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Type + status badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                style={{ color: typeColor, borderColor: `${typeColor}40` }}
              >
                {typeLabel}
              </span>
              <StatusBadge status={newReport.status} />
              {newReport.downloadable && (
                <span className="rounded border border-green-500/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-400">
                  PDF available
                </span>
              )}
            </div>

            <PageHeader
              eyebrow={newReport.region}
              title={newReport.title}
              description={newReport.subtitle}
            />

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
              <span>{newReport.authors.join(", ")}</span>
              <span aria-hidden="true">·</span>
              <span>{newReport.publishedAt}</span>
              <span aria-hidden="true">·</span>
              <span>{newReport.pageCount} pages</span>
            </div>

            {/* Tags */}
            {newReport.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 px-4">
                {newReport.tags.map((tag) => {
                  const color = CLASS_COLOR[tag as EventClass] ?? "#94a3b8";
                  return (
                    <span
                      key={tag}
                      className="rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
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

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3 px-4">
              {newReport.downloadable && (
                <a
                  href={`/api/reports/${newReport.slug}/pdf`}
                  className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                >
                  Download PDF
                </a>
              )}
              <button
                type="button"
                onClick={undefined}
                className="rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent/50 hover:text-accent"
              >
                Share
              </button>
            </div>

            {/* Summary */}
            <section className="mt-8 px-4">
              <h2 className="text-xl font-semibold text-text-primary">Summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{newReport.summary}</p>
            </section>

            {/* Report body placeholder */}
            <section className="mt-8 px-4">
              <h2 className="text-xl font-semibold text-text-primary">Report</h2>
              <div className="mt-3 rounded border border-border-subtle bg-bg-surface p-4 text-sm text-text-muted italic">
                Full report body available in the PDF download.
                {!newReport.downloadable && (
                  <span className="block mt-1">
                    This report is restricted — contact Aegis Lens for access.
                  </span>
                )}
              </div>
            </section>

            <p className="mt-10 px-4 text-xs text-text-muted">
              <Link href={reportsPath(locale)} className="text-accent hover:underline">
                ← Back to reports
              </Link>
            </p>
          </div>

          {/* Sidebar: related reports */}
          {related.length > 0 && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-text-muted mb-3">
                Related reports
              </h3>
              <ul className="space-y-3">
                {related.map((r) => {
                  const rTypeColor = REPORT_TYPE_COLOR[r.type];
                  return (
                    <li key={r.slug}>
                      <Link
                        href={reportPath(locale, r.slug)}
                        className="block rounded border border-border-subtle bg-bg-surface p-3 hover:bg-bg-elevated"
                      >
                        <span
                          className="font-mono text-[9px] uppercase tracking-wider"
                          style={{ color: rTypeColor }}
                        >
                          {REPORT_TYPE_LABELS[r.type]}
                        </span>
                        <p className="mt-1 text-xs font-semibold text-text-primary leading-snug">
                          {r.title}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-text-muted">{r.publishedAt}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>
      </article>
    );
  }

  /* ── Fall back to legacy reports-seed ── */
  const r = getReport(slug);
  if (!r) notFound();

  void listReports;

  const title = r.title[locale] ?? r.title.en;
  const summary = r.summary[locale] ?? r.summary.en;
  const body = r.body[locale] ?? r.body.en;

  const summaryParas = summary.split("\n\n").filter(Boolean);
  const bodyParas = body.split("\n\n").filter(Boolean);

  // Derive related regions from cited events
  const oblastCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  for (const id of r.citations) {
    const ev = eventById(id);
    if (!ev) continue;
    const ob = findOblast(ev.location.lon, ev.location.lat);
    if (ob) {
      const key = `${ob.iso2}/${ob.slug}`;
      oblastCounts.set(key, (oblastCounts.get(key) ?? 0) + 1);
    } else {
      const iso2 = findCountryIso2(ev.location.lon, ev.location.lat);
      if (iso2) countryCounts.set(iso2, (countryCounts.get(iso2) ?? 0) + 1);
    }
  }
  const relatedOblasts = [...oblastCounts.entries()]
    .map(([key, count]) => {
      const [iso2, obSlug] = key.split("/");
      const ob = OBLASTS.find((o) => o.iso2 === iso2 && o.slug === obSlug);
      return ob ? { ob, count } : null;
    })
    .filter((x): x is { ob: (typeof OBLASTS)[number]; count: number } => x !== null)
    .sort((a, b) => b.count - a.count);
  const relatedCountries = [...countryCounts.entries()].sort((a, b) => b[1] - a[1]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${SITE.url}${reportPath(locale, slug)}`,
        headline: title,
        description: summary,
        datePublished: r.publishedAt,
        author: { "@type": "Person", name: r.author },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        mainEntityOfPage: `${SITE.url}${reportPath(locale, slug)}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Reports", item: `${SITE.url}${reportsPath(locale)}` },
          { "@type": "ListItem", position: 2, name: r.kind, item: `${SITE.url}${reportsPath(locale)}#${r.kind}` },
          { "@type": "ListItem", position: 3, name: title, item: `${SITE.url}${reportPath(locale, slug)}` },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href={reportsPath(locale)} className="text-accent hover:underline">Reports</Link></li>
          <li aria-hidden="true">/</li>
          <li>{r.kind}</li>
          <li aria-hidden="true">/</li>
          <li className="text-text-secondary">{title}</li>
        </ol>
      </nav>

      <PageHeader
        eyebrow={r.kind}
        title={title}
        description={`${r.author} · ${formatDateTime(r.publishedAt, locale)} · ${timeAgo(r.publishedAt, locale)}`}
      />

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3 px-4">
        <a
          href={`/api/reports/${r.slug}/pdf`}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Download PDF
        </a>
        <button
          type="button"
          className="rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent/50 hover:text-accent"
        >
          Share
        </button>
      </div>

      <section className="mt-8 px-4">
        <h2 className="text-xl font-semibold text-text-primary">Summary</h2>
        <div className="mt-3 space-y-3 text-sm text-text-secondary">
          {summaryParas.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      <section className="mt-8 px-4">
        <h2 className="text-xl font-semibold text-text-primary">Report</h2>
        <div className="mt-3 space-y-3 text-sm text-text-secondary">
          {bodyParas.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {r.citations.length > 0 && (
        <section className="mt-8 px-4">
          <h2 className="text-xl font-semibold text-text-primary">Citations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {r.citations.map((id) => (
              <li key={id} className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-2">
                <Link href={eventPath(locale, id)} className="font-mono text-accent hover:underline">{id}</Link>
                <span className="font-mono text-[10px] uppercase text-text-muted">event</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(relatedOblasts.length > 0 || relatedCountries.length > 0) && (
        <section className="mt-8 px-4">
          <h2 className="text-xl font-semibold text-text-primary">Related regions</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">Derived from cited events</p>
          {relatedOblasts.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {relatedOblasts.map(({ ob, count }) => (
                <li key={`${ob.iso2}/${ob.slug}`}>
                  <Link
                    href={locale === "en" ? `/regions/${ob.iso2}/${ob.slug}` : `/${locale}/regions/${ob.iso2}/${ob.slug}`}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{ob.name[locale] ?? ob.name.en}</span>
                    <span className="font-mono text-[10px] text-text-muted">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {relatedCountries.length > 0 && relatedOblasts.length === 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {relatedCountries.map(([iso2, count]) => (
                <li key={iso2}>
                  <Link
                    href={urls.region(locale, iso2)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{iso2.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-text-muted">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-10 px-4 text-xs text-text-muted">
        <Link href={reportsPath(locale)} className="text-accent hover:underline">← Back to reports</Link>
      </p>
    </article>
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
